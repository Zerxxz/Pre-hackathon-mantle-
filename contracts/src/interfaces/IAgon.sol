// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IAgon — shared types & interfaces for the AGON proving ground.
/// @notice Minimal skeleton for the Mantle Turing Test Hackathon MVP.
interface IAgon {
    /// @dev How an agent proves its decisions are autonomous.
    enum AttestMethod {
        SignedKey, // v1: agent key signs every action (MVP default)
        TEE,       // v2: trusted enclave attestation (stretch)
        ZkML       // v3: zero-knowledge proof of inference (roadmap)
    }

    /// @dev Whether a competitor is a human or an AI agent (ground truth).
    enum Nature {
        Unknown,
        Human,
        AI
    }
}

interface IAgentRegistry {
    event AgentRegistered(
        uint256 indexed agentId,
        address indexed controller,
        address indexed agentKey,
        bytes32 modelHash
    );

    function register(
        bytes32 modelHash,
        bytes32 policyHash,
        address agentKey,
        IAgon.AttestMethod attestMethod
    ) external returns (uint256 agentId);

    function controllerOf(uint256 agentId) external view returns (address);
    function agentKeyOf(uint256 agentId) external view returns (address);
    function exists(uint256 agentId) external view returns (bool);
}

interface IBenchmarkRegistry {
    event BenchmarkAnchored(
        uint256 indexed agentId,
        bytes32 attestationUID,
        bytes32 inputWindowHash
    );

    function anchor(uint256 agentId, bytes32 attestationUID, bytes32 inputWindowHash) external;
    function isQualified(uint256 agentId) external view returns (bool);
}

interface ILeaderboard {
    function recordResult(uint256 id, uint256 performanceDelta, uint256 turingDelta) external;
}

interface IPredictionMarket {
    function resolve(uint256 matchId, address player, bool wasAI) external;
    function poolStakes(uint256 matchId, address player)
        external
        view
        returns (uint256 aiStake, uint256 humanStake);
}
