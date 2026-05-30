// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {IAgon} from "../src/interfaces/IAgon.sol";

contract AgentRegistryTest is Test {
    AgentRegistry registry;
    address agentKey = address(0xA11CE);

    function setUp() public {
        registry = new AgentRegistry();
    }

    function test_RegisterMintsPassport() public {
        uint256 id = registry.register(
            keccak256("model-v1"),
            keccak256("policy-v1"),
            agentKey,
            IAgon.AttestMethod.SignedKey
        );

        assertEq(id, 1);
        assertTrue(registry.exists(id));
        assertEq(registry.controllerOf(id), address(this));
        assertEq(registry.agentKeyOf(id), agentKey);
        assertEq(registry.agentIdByKey(agentKey), id);
    }

    function test_RevertWhen_AgentKeyReused() public {
        registry.register(bytes32(0), bytes32(0), agentKey, IAgon.AttestMethod.SignedKey);
        vm.expectRevert(bytes("key in use"));
        registry.register(bytes32(0), bytes32(0), agentKey, IAgon.AttestMethod.SignedKey);
    }
}
