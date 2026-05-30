// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MatchManager} from "../src/MatchManager.sol";
import {Leaderboard} from "../src/Leaderboard.sol";
import {PredictionMarket} from "../src/PredictionMarket.sol";
import {IAgon} from "../src/interfaces/IAgon.sol";

/// @notice Edge cases for the arena settle path + market interaction.
contract MatchManagerEdgeTest is Test {
    MatchManager mm;
    Leaderboard lb;
    PredictionMarket market;

    address agent = makeAddr("agent");
    address stranger = makeAddr("stranger");
    bytes32 constant SALT = keccak256("nature-salt");
    uint256 constant LB_ID = 1;

    function setUp() public {
        mm = new MatchManager();
        lb = new Leaderboard();
        market = new PredictionMarket(address(mm));
        lb.setWriter(address(mm), true);
        mm.setHooks(address(lb), address(market));
    }

    // --- helpers ---

    function _createAiMatch(uint8 rounds, uint64 commitWindow, uint64 revealWindow)
        internal
        returns (uint256 matchId)
    {
        address[] memory players = new address[](1);
        players[0] = agent;
        uint256[] memory ids = new uint256[](1);
        ids[0] = LB_ID;
        bytes32[] memory sealed_ = new bytes32[](1);
        sealed_[0] = keccak256(abi.encodePacked(uint8(IAgon.Nature.AI), SALT));
        return mm.createMatch(players, ids, sealed_, rounds, commitWindow, revealWindow);
    }

    function _commit(uint256 matchId, address p, uint8 round, uint8 pred) internal {
        bytes memory action = abi.encode(pred);
        vm.prank(p);
        mm.commit(matchId, round, keccak256(abi.encodePacked(action, SALT)));
    }

    function _reveal(uint256 matchId, address p, uint8 round, uint8 pred) internal {
        vm.prank(p);
        mm.reveal(matchId, round, abi.encode(pred), SALT);
    }

    function _settleArgs(uint8 rounds, uint8[] memory outcomes)
        internal
        pure
        returns (uint8[] memory o, IAgon.Nature[] memory n, bytes32[] memory s)
    {
        o = outcomes;
        n = new IAgon.Nature[](1);
        n[0] = IAgon.Nature.AI;
        s = new bytes32[](1);
        s[0] = SALT;
        require(rounds == outcomes.length, "test setup");
    }

    // --- tests ---

    function test_RevertWhen_SettleNotOrchestrator() public {
        uint256 id = _createAiMatch(1, 1 hours, 1 hours);
        uint8[] memory outcomes = new uint8[](1);
        outcomes[0] = 1;
        (uint8[] memory o, IAgon.Nature[] memory n, bytes32[] memory s) = _settleArgs(1, outcomes);
        vm.prank(stranger);
        vm.expectRevert(bytes("not orchestrator"));
        mm.settle(id, o, n, s);
    }

    function test_RevertWhen_BadOutcomesLength() public {
        uint256 id = _createAiMatch(2, 1 hours, 1 hours);
        uint8[] memory outcomes = new uint8[](1); // should be 2
        outcomes[0] = 1;
        IAgon.Nature[] memory n = new IAgon.Nature[](1);
        n[0] = IAgon.Nature.AI;
        bytes32[] memory s = new bytes32[](1);
        s[0] = SALT;
        vm.expectRevert(bytes("bad outcomes"));
        mm.settle(id, outcomes, n, s);
    }

    function test_RevertWhen_CommitAfterDeadline() public {
        uint256 id = _createAiMatch(1, 10, 60);
        vm.warp(block.timestamp + 11); // past commit deadline
        bytes memory action = abi.encode(uint8(1));
        vm.prank(agent);
        vm.expectRevert(bytes("commit closed"));
        mm.commit(id, 0, keccak256(abi.encodePacked(action, SALT)));
    }

    function test_RevertWhen_DoubleSettle() public {
        uint256 id = _createAiMatch(1, 1 hours, 1 hours);
        _commit(id, agent, 0, 1);
        _reveal(id, agent, 0, 1);

        uint8[] memory outcomes = new uint8[](1);
        outcomes[0] = 1;
        (uint8[] memory o, IAgon.Nature[] memory n, bytes32[] memory s) = _settleArgs(1, outcomes);
        mm.settle(id, o, n, s);

        vm.expectRevert(bytes("settled"));
        mm.settle(id, o, n, s);
    }

    function test_PlayerWhoDidntRevealScoresZero() public {
        uint256 id = _createAiMatch(1, 1 hours, 1 hours);
        _commit(id, agent, 0, 1); // commits but never reveals

        uint8[] memory outcomes = new uint8[](1);
        outcomes[0] = 1; // would have been correct if revealed
        (uint8[] memory o, IAgon.Nature[] memory n, bytes32[] memory s) = _settleArgs(1, outcomes);
        mm.settle(id, o, n, s);

        (uint256 perf,,) = lb.scoreOf(LB_ID);
        assertEq(perf, 0, "no reveal => zero performance");
    }

    function test_TieMarketYieldsNoTuringScore() public {
        uint256 id = _createAiMatch(1, 1 hours, 1 hours);
        _commit(id, agent, 0, 1);
        _reveal(id, agent, 0, 1);

        // Equal stakes on both sides => no clear crowd guess => turing 0.
        address a = makeAddr("a");
        address b = makeAddr("b");
        vm.deal(a, 1 ether);
        vm.deal(b, 1 ether);
        vm.prank(a);
        market.bet{value: 1 ether}(id, agent, true);
        vm.prank(b);
        market.bet{value: 1 ether}(id, agent, false);

        uint8[] memory outcomes = new uint8[](1);
        outcomes[0] = 1;
        (uint8[] memory o, IAgon.Nature[] memory n, bytes32[] memory s) = _settleArgs(1, outcomes);
        mm.settle(id, o, n, s);

        (uint256 perf, uint256 turing,) = lb.scoreOf(LB_ID);
        assertEq(perf, 1, "correct prediction");
        assertEq(turing, 0, "tie => not fooled");
    }
}
