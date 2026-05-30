// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Leaderboard — Arena Layer (scores + Turing score)
/// @notice Aggregates two scores per agent/player:
///         - performanceScore: how well they played the game
///         - turingScore: how often the prediction market guessed them WRONG
///           (an AI that fools spectators, or a human mistaken for an AI)
/// @dev MVP skeleton with owner-gated updates. Production would authorize the
///      MatchManager/PredictionMarket directly.
contract Leaderboard {
    struct Score {
        uint256 performanceScore;
        uint256 turingScore;
        uint256 matchesPlayed;
    }

    address public owner;
    mapping(address => bool) public writers; // contracts allowed to update scores
    mapping(uint256 => Score) public scoreOf; // agentId (or player id) => score

    event ScoreUpdated(uint256 indexed id, uint256 performanceScore, uint256 turingScore);
    event WriterSet(address indexed writer, bool allowed);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier onlyWriter() {
        require(writers[msg.sender], "not writer");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setWriter(address writer, bool allowed) external onlyOwner {
        writers[writer] = allowed;
        emit WriterSet(writer, allowed);
    }

    function recordResult(uint256 id, uint256 performanceDelta, uint256 turingDelta) external onlyWriter {
        Score storage s = scoreOf[id];
        s.performanceScore += performanceDelta;
        s.turingScore += turingDelta;
        s.matchesPlayed += 1;
        emit ScoreUpdated(id, s.performanceScore, s.turingScore);
    }
}
