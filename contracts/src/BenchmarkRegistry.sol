// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IAgentRegistry, IBenchmarkRegistry} from "./interfaces/IAgon.sol";

/// @title BenchmarkRegistry — Benchmark Layer ("Replay Harness / Agent CI")
/// @notice Anchors verifiable performance attestations to an agent. The actual
///         backtest runs off-chain via a deterministic replay over a fixed,
///         hashed input window; only the attestation UID + input hash are stored
///         here so the result can be independently re-run and checked.
/// @dev MVP skeleton. `attestationUID` can be an EAS UID or a hash from a minimal
///      custom attestation contract (fallback per MVP_SCOPE.md).
contract BenchmarkRegistry is IBenchmarkRegistry {
    IAgentRegistry public immutable registry;

    struct Benchmark {
        bytes32 attestationUID;
        bytes32 inputWindowHash;
        uint64 anchoredAt;
    }

    mapping(uint256 => Benchmark[]) private _benchmarks; // agentId => benchmarks
    mapping(uint256 => bool) private _qualified;          // agentId => has >=1 benchmark

    constructor(address registry_) {
        registry = IAgentRegistry(registry_);
    }

    /// @inheritdoc IBenchmarkRegistry
    function anchor(uint256 agentId, bytes32 attestationUID, bytes32 inputWindowHash) external {
        require(registry.exists(agentId), "no agent");
        require(msg.sender == registry.controllerOf(agentId), "not controller");

        _benchmarks[agentId].push(
            Benchmark({
                attestationUID: attestationUID,
                inputWindowHash: inputWindowHash,
                anchoredAt: uint64(block.timestamp)
            })
        );
        _qualified[agentId] = true;

        emit BenchmarkAnchored(agentId, attestationUID, inputWindowHash);
    }

    /// @inheritdoc IBenchmarkRegistry
    function isQualified(uint256 agentId) external view returns (bool) {
        return _qualified[agentId];
    }

    function benchmarkCount(uint256 agentId) external view returns (uint256) {
        return _benchmarks[agentId].length;
    }

    function benchmarkAt(uint256 agentId, uint256 i) external view returns (Benchmark memory) {
        return _benchmarks[agentId][i];
    }
}
