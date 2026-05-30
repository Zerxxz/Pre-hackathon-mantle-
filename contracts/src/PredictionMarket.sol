// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title PredictionMarket — Arena Layer ("Human or AI?")
/// @notice Spectators stake MNT guessing whether a given player in a match is a
///         human or an AI. Ground truth is sealed at match start and revealed at
///         settlement; winners split the pool. This is the viral "spot the bot"
///         hook and the source of each player's Turing score.
/// @dev MVP skeleton: simple parimutuel pools per (match, player). Native MNT is
///      the chain's gas token on Mantle, so msg.value works directly.
contract PredictionMarket {
    struct Pool {
        uint256 aiStake;       // total staked on "is AI"
        uint256 humanStake;    // total staked on "is Human"
        bool resolved;
        bool wasAI;            // ground truth after resolution
    }

    // matchId => player => pool
    mapping(uint256 => mapping(address => Pool)) public pools;
    // matchId => player => bettor => (guessIsAI, amount)
    mapping(uint256 => mapping(address => mapping(address => uint256))) public stakeAI;
    mapping(uint256 => mapping(address => mapping(address => uint256))) public stakeHuman;

    address public resolver; // orchestrator / MatchManager allowed to resolve

    event Bet(uint256 indexed matchId, address indexed player, address indexed bettor, bool guessIsAI, uint256 amount);
    event Resolved(uint256 indexed matchId, address indexed player, bool wasAI);
    event Claimed(uint256 indexed matchId, address indexed player, address indexed bettor, uint256 payout);

    constructor(address resolver_) {
        resolver = resolver_;
    }

    function bet(uint256 matchId, address player, bool guessIsAI) external payable {
        require(msg.value > 0, "no stake");
        Pool storage p = pools[matchId][player];
        require(!p.resolved, "resolved");

        if (guessIsAI) {
            p.aiStake += msg.value;
            stakeAI[matchId][player][msg.sender] += msg.value;
        } else {
            p.humanStake += msg.value;
            stakeHuman[matchId][player][msg.sender] += msg.value;
        }
        emit Bet(matchId, player, msg.sender, guessIsAI, msg.value);
    }

    function resolve(uint256 matchId, address player, bool wasAI) external {
        require(msg.sender == resolver, "not resolver");
        Pool storage p = pools[matchId][player];
        require(!p.resolved, "resolved");
        p.resolved = true;
        p.wasAI = wasAI;
        emit Resolved(matchId, player, wasAI);
    }

    /// @notice Parimutuel payout: winners split the entire pool pro-rata.
    function claim(uint256 matchId, address player) external {
        Pool storage p = pools[matchId][player];
        require(p.resolved, "not resolved");

        uint256 winningSide = p.wasAI ? stakeAI[matchId][player][msg.sender] : stakeHuman[matchId][player][msg.sender];
        require(winningSide > 0, "nothing to claim");

        uint256 winningPool = p.wasAI ? p.aiStake : p.humanStake;
        uint256 total = p.aiStake + p.humanStake;
        uint256 payout = (total * winningSide) / winningPool;

        // zero out before transfer
        if (p.wasAI) {
            stakeAI[matchId][player][msg.sender] = 0;
        } else {
            stakeHuman[matchId][player][msg.sender] = 0;
        }

        (bool ok, ) = msg.sender.call{value: payout}("");
        require(ok, "transfer failed");
        emit Claimed(matchId, player, msg.sender, payout);
    }
}
