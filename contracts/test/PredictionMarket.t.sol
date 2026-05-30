// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {PredictionMarket} from "../src/PredictionMarket.sol";

contract PredictionMarketTest is Test {
    PredictionMarket market;
    address player = makeAddr("player");
    address alice = makeAddr("alice"); // bets AI
    address bob = makeAddr("bob"); // bets Human
    address stranger = makeAddr("stranger");

    uint256 constant MATCH = 1;

    function setUp() public {
        // resolver = this test contract, so we can resolve directly.
        market = new PredictionMarket(address(this));
    }

    function _bet(address who, bool guessIsAI, uint256 amount) internal {
        vm.deal(who, amount);
        vm.prank(who);
        market.bet{value: amount}(MATCH, player, guessIsAI);
    }

    function test_BetResolveClaim_AIWins() public {
        _bet(alice, true, 3 ether); // AI side
        _bet(bob, false, 1 ether); // Human side

        (uint256 ai, uint256 human) = market.poolStakes(MATCH, player);
        assertEq(ai, 3 ether);
        assertEq(human, 1 ether);

        market.resolve(MATCH, player, true); // ground truth: AI

        uint256 before = alice.balance;
        vm.prank(alice);
        market.claim(MATCH, player);
        // alice was the only AI bettor -> takes the whole 4 ether pool
        assertEq(alice.balance - before, 4 ether);
    }

    function test_RevertWhen_BetWithoutStake() public {
        vm.prank(alice);
        vm.expectRevert(bytes("no stake"));
        market.bet{value: 0}(MATCH, player, true);
    }

    function test_RevertWhen_BetAfterResolved() public {
        _bet(alice, true, 1 ether);
        market.resolve(MATCH, player, true);
        vm.deal(bob, 1 ether);
        vm.prank(bob);
        vm.expectRevert(bytes("resolved"));
        market.bet{value: 1 ether}(MATCH, player, false);
    }

    function test_RevertWhen_NonResolverResolves() public {
        _bet(alice, true, 1 ether);
        vm.prank(stranger);
        vm.expectRevert(bytes("not resolver"));
        market.resolve(MATCH, player, true);
    }

    function test_RevertWhen_DoubleResolve() public {
        _bet(alice, true, 1 ether);
        market.resolve(MATCH, player, true);
        vm.expectRevert(bytes("resolved"));
        market.resolve(MATCH, player, false);
    }

    function test_RevertWhen_ClaimBeforeResolved() public {
        _bet(alice, true, 1 ether);
        vm.prank(alice);
        vm.expectRevert(bytes("not resolved"));
        market.claim(MATCH, player);
    }

    function test_RevertWhen_LoserClaims() public {
        _bet(alice, true, 1 ether); // AI
        _bet(bob, false, 1 ether); // Human
        market.resolve(MATCH, player, true); // AI wins
        vm.prank(bob);
        vm.expectRevert(bytes("nothing to claim"));
        market.claim(MATCH, player);
    }
}
