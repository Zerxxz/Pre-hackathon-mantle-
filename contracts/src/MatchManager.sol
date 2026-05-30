// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IAgon, ILeaderboard, IPredictionMarket} from "./interfaces/IAgon.sol";

/// @title MatchManager — Arena Layer ("Turing Arena")
/// @notice Runs head-to-head human-vs-AI matches with a commit-reveal scheme so
///         no player can look ahead or copy an opponent's move, then settles by
///         scoring the micro price-prediction game and pushing results to the
///         Leaderboard and resolving the "Human or AI?" PredictionMarket.
///
/// @dev Game (MVP): each round every player predicts the next price move,
///      encoded as `abi.encode(uint8)` where 1 = UP and 0 = DOWN. At settlement
///      the orchestrator submits the actual per-round outcomes plus each player's
///      revealed nature (verified against the value sealed at match creation).
contract MatchManager {
    enum Phase {
        None,
        Commit,
        Reveal,
        Settled
    }

    struct MatchInfo {
        address orchestrator; // who created/drives the match
        uint64 commitDeadline;
        uint64 revealDeadline;
        uint8 rounds;
        Phase phase;
    }

    address public owner;
    ILeaderboard public leaderboard;
    IPredictionMarket public market;

    uint256 public nextMatchId = 1;
    mapping(uint256 => MatchInfo) public matches;

    // matchId => list of players (humans and/or agent keys)
    mapping(uint256 => address[]) public playersOf;
    // matchId => player => registered
    mapping(uint256 => mapping(address => bool)) public isPlayer;
    // matchId => player => leaderboard id (agentId for agents, or a human id)
    mapping(uint256 => mapping(address => uint256)) public leaderboardIdOf;
    // matchId => round => player => commitment hash
    mapping(uint256 => mapping(uint8 => mapping(address => bytes32))) public commitments;
    // matchId => round => player => revealed action
    mapping(uint256 => mapping(uint8 => mapping(address => bytes))) public reveals;
    // matchId => player => sealed ground truth (set at creation, revealed at settle)
    mapping(uint256 => mapping(address => bytes32)) public sealedNature;

    event MatchCreated(uint256 indexed matchId, address indexed orchestrator, uint8 rounds);
    event Committed(uint256 indexed matchId, address indexed player, uint8 round, bytes32 commitment);
    event Revealed(uint256 indexed matchId, address indexed player, uint8 round, bytes action);
    event PlayerScored(
        uint256 indexed matchId,
        address indexed player,
        uint256 leaderboardId,
        uint256 performanceScore,
        uint256 turingScore,
        bool wasAI
    );
    event Settled(uint256 indexed matchId);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Wire the arena to the Leaderboard and PredictionMarket. Call once
    ///         after deployment (the market must have this contract as resolver,
    ///         and the leaderboard must authorize this contract as a writer).
    function setHooks(address leaderboard_, address market_) external onlyOwner {
        leaderboard = ILeaderboard(leaderboard_);
        market = IPredictionMarket(market_);
    }

    /// @param players the competitors (humans and/or agent keys)
    /// @param leaderboardIds leaderboard id per player (parallel to `players`)
    /// @param sealedNatures keccak256(abi.encodePacked(uint8(nature), salt)) per player
    function createMatch(
        address[] calldata players,
        uint256[] calldata leaderboardIds,
        bytes32[] calldata sealedNatures,
        uint8 rounds,
        uint64 commitWindow,
        uint64 revealWindow
    ) external returns (uint256 matchId) {
        require(players.length == sealedNatures.length, "len mismatch");
        require(players.length == leaderboardIds.length, "len mismatch");
        require(rounds > 0, "rounds=0");

        matchId = nextMatchId++;
        matches[matchId] = MatchInfo({
            orchestrator: msg.sender,
            commitDeadline: uint64(block.timestamp) + commitWindow,
            revealDeadline: uint64(block.timestamp) + commitWindow + revealWindow,
            rounds: rounds,
            phase: Phase.Commit
        });

        for (uint256 i = 0; i < players.length; i++) {
            address p = players[i];
            require(!isPlayer[matchId][p], "dup player");
            isPlayer[matchId][p] = true;
            playersOf[matchId].push(p);
            leaderboardIdOf[matchId][p] = leaderboardIds[i];
            sealedNature[matchId][p] = sealedNatures[i];
        }

        emit MatchCreated(matchId, msg.sender, rounds);
    }

    function commit(uint256 matchId, uint8 round, bytes32 commitment) external {
        MatchInfo storage m = matches[matchId];
        require(m.phase == Phase.Commit, "not commit phase");
        require(block.timestamp <= m.commitDeadline, "commit closed");
        require(isPlayer[matchId][msg.sender], "not player");
        require(round < m.rounds, "bad round");

        commitments[matchId][round][msg.sender] = commitment;
        emit Committed(matchId, msg.sender, round, commitment);
    }

    function reveal(uint256 matchId, uint8 round, bytes calldata action, bytes32 salt) external {
        MatchInfo storage m = matches[matchId];
        require(m.phase == Phase.Commit || m.phase == Phase.Reveal, "not revealable");
        require(isPlayer[matchId][msg.sender], "not player");
        require(round < m.rounds, "bad round");
        require(
            commitments[matchId][round][msg.sender] == keccak256(abi.encodePacked(action, salt)),
            "bad reveal"
        );

        if (m.phase == Phase.Commit) {
            m.phase = Phase.Reveal; // first reveal flips the phase
        }
        reveals[matchId][round][msg.sender] = action;
        emit Revealed(matchId, msg.sender, round, action);
    }

    /// @notice Settle the match: score predictions, update the Leaderboard, and
    ///         resolve the PredictionMarket by revealing each player's nature.
    /// @param outcomes per-round actual move (1 = UP, 0 = DOWN), length == rounds
    /// @param natures  revealed nature per player, parallel to `playersOf[matchId]`
    /// @param natureSalts salts used when sealing each nature at creation
    function settle(
        uint256 matchId,
        uint8[] calldata outcomes,
        IAgon.Nature[] calldata natures,
        bytes32[] calldata natureSalts
    ) external {
        MatchInfo storage m = matches[matchId];
        require(m.phase != Phase.Settled, "settled");
        require(msg.sender == m.orchestrator, "not orchestrator");
        require(outcomes.length == m.rounds, "bad outcomes");

        address[] storage players = playersOf[matchId];
        require(natures.length == players.length, "bad natures");
        require(natureSalts.length == players.length, "bad salts");

        for (uint256 i = 0; i < players.length; i++) {
            _scorePlayer(matchId, m.rounds, players[i], natures[i], natureSalts[i], outcomes);
        }

        m.phase = Phase.Settled;
        emit Settled(matchId);
    }

    /// @dev Score a single player: verify nature, tally correct predictions,
    ///      derive the Turing score, resolve the market and update the leaderboard.
    ///      Split out of `settle` to keep the stack shallow.
    function _scorePlayer(
        uint256 matchId,
        uint8 rounds,
        address player,
        IAgon.Nature nature,
        bytes32 natureSalt,
        uint8[] calldata outcomes
    ) internal {
        // 1. Verify the revealed nature matches what was sealed at creation.
        require(
            keccak256(abi.encodePacked(uint8(nature), natureSalt)) == sealedNature[matchId][player],
            "bad nature"
        );
        bool wasAI = nature == IAgon.Nature.AI;

        // 2. Performance: count correct predictions across rounds.
        uint256 correct = _countCorrect(matchId, rounds, player, outcomes);

        // 3. Turing score: did the crowd guess this player's nature wrong?
        uint256 turingDelta = _turingScore(matchId, player, wasAI);
        if (address(market) != address(0)) {
            market.resolve(matchId, player, wasAI);
        }

        // 4. Push to the leaderboard.
        uint256 lbId = leaderboardIdOf[matchId][player];
        if (address(leaderboard) != address(0)) {
            leaderboard.recordResult(lbId, correct, turingDelta);
        }

        emit PlayerScored(matchId, player, lbId, correct, turingDelta, wasAI);
    }

    function _countCorrect(uint256 matchId, uint8 rounds, address player, uint8[] calldata outcomes)
        internal
        view
        returns (uint256 correct)
    {
        for (uint8 r = 0; r < rounds; r++) {
            uint8 pred = _prediction(reveals[matchId][r][player]);
            if (pred <= 1 && pred == outcomes[r]) {
                correct++;
            }
        }
    }

    /// @dev 1 if the crowd's majority stake guessed the player's nature wrong.
    function _turingScore(uint256 matchId, address player, bool wasAI) internal view returns (uint256) {
        if (address(market) == address(0)) return 0;
        (uint256 aiStake, uint256 humanStake) = market.poolStakes(matchId, player);
        if (aiStake == humanStake) return 0; // no clear crowd guess
        bool crowdGuessedAI = aiStake > humanStake;
        return crowdGuessedAI != wasAI ? 1 : 0;
    }

    function getPlayers(uint256 matchId) external view returns (address[] memory) {
        return playersOf[matchId];
    }

    /// @dev Decode a revealed action into a prediction. Returns 2 (invalid) if a
    ///      player never revealed or the encoding is malformed.
    function _prediction(bytes memory action) internal pure returns (uint8) {
        if (action.length != 32) return 2;
        return abi.decode(action, (uint8));
    }
}
