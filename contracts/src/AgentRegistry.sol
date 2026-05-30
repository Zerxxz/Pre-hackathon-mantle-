// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IAgon, IAgentRegistry} from "./interfaces/IAgon.sol";

/// @title AgentRegistry — Trust Layer ("Proof of Agent")
/// @notice Mints an on-chain "Agent Passport" and records the commitments that
///         make an agent's autonomy verifiable: model hash, policy hash and the
///         agent key that must sign every in-arena action.
/// @dev MVP skeleton. Production would extend ERC-721 (OpenZeppelin) so the
///      passport is a transferable/visible NFT. Kept dependency-free here so the
///      scaffold compiles out of the box.
contract AgentRegistry is IAgentRegistry {
    struct AgentInfo {
        address controller;          // human/team that owns the passport
        address agentKey;            // key that signs the agent's actions
        bytes32 modelHash;           // hash of model identifier/weights ref
        bytes32 policyHash;          // hash of the agent's policy/code
        IAgon.AttestMethod attestMethod;
        uint64 createdAt;
    }

    uint256 public nextAgentId = 1;
    mapping(uint256 => AgentInfo) private _agents;
    mapping(address => uint256) public agentIdByKey; // agentKey => agentId

    /// @inheritdoc IAgentRegistry
    function register(
        bytes32 modelHash,
        bytes32 policyHash,
        address agentKey,
        IAgon.AttestMethod attestMethod
    ) external returns (uint256 agentId) {
        require(agentKey != address(0), "agentKey=0");
        require(agentIdByKey[agentKey] == 0, "key in use");

        agentId = nextAgentId++;
        _agents[agentId] = AgentInfo({
            controller: msg.sender,
            agentKey: agentKey,
            modelHash: modelHash,
            policyHash: policyHash,
            attestMethod: attestMethod,
            createdAt: uint64(block.timestamp)
        });
        agentIdByKey[agentKey] = agentId;

        emit AgentRegistered(agentId, msg.sender, agentKey, modelHash);
    }

    function getAgent(uint256 agentId) external view returns (AgentInfo memory) {
        return _agents[agentId];
    }

    function controllerOf(uint256 agentId) external view returns (address) {
        return _agents[agentId].controller;
    }

    function agentKeyOf(uint256 agentId) external view returns (address) {
        return _agents[agentId].agentKey;
    }

    function exists(uint256 agentId) public view returns (bool) {
        return _agents[agentId].controller != address(0);
    }
}
