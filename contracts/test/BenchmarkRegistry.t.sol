// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {BenchmarkRegistry} from "../src/BenchmarkRegistry.sol";
import {IAgon} from "../src/interfaces/IAgon.sol";

contract BenchmarkRegistryTest is Test {
    AgentRegistry registry;
    BenchmarkRegistry benchmarks;
    address stranger = makeAddr("stranger");
    uint256 agentId;

    function setUp() public {
        registry = new AgentRegistry();
        benchmarks = new BenchmarkRegistry(address(registry));
        agentId = registry.register(
            keccak256("model"),
            keccak256("policy"),
            makeAddr("agentKey"),
            IAgon.AttestMethod.SignedKey
        ); // controller = this
    }

    function test_AnchorByController() public {
        assertFalse(benchmarks.isQualified(agentId));
        benchmarks.anchor(agentId, keccak256("uid"), keccak256("window"));
        assertTrue(benchmarks.isQualified(agentId));
        assertEq(benchmarks.benchmarkCount(agentId), 1);
    }

    function test_RevertWhen_AnchorNonController() public {
        vm.prank(stranger);
        vm.expectRevert(bytes("not controller"));
        benchmarks.anchor(agentId, keccak256("uid"), keccak256("window"));
    }

    function test_RevertWhen_AnchorUnknownAgent() public {
        vm.expectRevert(bytes("no agent"));
        benchmarks.anchor(999, keccak256("uid"), keccak256("window"));
    }
}
