// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IAgon} from "./interfaces/IAgon.sol";

/// @title MatchManager — Arena Layer ("Turing Arena")
/// @notice Runs head-to-head human-vs-AI matches with a commit-reveal scheme so
///         no player can look ahead or copy an opponent's move.
/// @dev MVP skeleton: lifecycle + commit-reveal storage + events. Scoring logic
///      against the game environment is intentionally left as a TODO so the
///      arena's specific game (micro price-prediction in the MVP) can plug in.
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

    uint256 public nextMatchId = 1;
    mapping(uint256 => MatchInfo) public matches;

    // matchId => player => registered
    mapping(uint256 => mapping(address => bool)) public isPlayer;
    // matchId => round => player => commitment hash
    mapping(uint256 => mapping(uint8 => mapping(address => bytes32))) public commitments;
    // matchId => round => player => revealed action
    mapping(uint256 => mapping(uint8 => mapping(address => bytes))) public reveals;
    // matchId => player => sealed ground truth (set at creation, revealed at settle)
    mapping(uint256 => mapping(address => bytes32)) public sealedNature;

    event MatchCreated(uint256 indexed matchId, address indexed orchestrator, uint8 rounds);
    event Committed(uint256 indexed matchId, address indexed player, uint8 round, bytes32 commitment);
    event Revealed(uint256 indexed matchId, address indexed player, uint8 round, bytes action);
    event Settled(uint256 indexed matchId);

    /// @param players the competitors (humans and/or agent keys)
    /// @param sealedNatures keccak(nature, salt) per player — kept secret until settle
    function createMatch(
        address[] calldata players,
        bytes32[] calldata sealedNatures,
        uint8 rounds,
        uint64 commitWindow,
        uint64 revealWindow
    ) external returns (uint256 matchId) {
        require(players.length == sealedNatures.length, "len mismatch");
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
            isPlayer[matchId][players[i]] = true;
            sealedNature[matchId][players[i]] = sealedNatures[i];
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

    /// @notice Settle the match. TODO: compute per-player performance score from
    ///         revealed actions vs the game environment outcome, then push to
    ///         Leaderboard and resolve the PredictionMarket.
    function settle(uint256 matchId) external {
        MatchInfo storage m = matches[matchId];
        require(m.phase != Phase.Settled, "settled");
        require(msg.sender == m.orchestrator, "not orchestrator");

        m.phase = Phase.Settled;
        // TODO(MVP): scoring + Leaderboard.update + PredictionMarket.resolve
        emit Settled(matchId);
    }
}
