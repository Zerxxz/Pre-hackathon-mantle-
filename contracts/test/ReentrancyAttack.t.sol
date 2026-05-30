// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {PredictionMarket} from "../src/PredictionMarket.sol";

/// @dev Malicious bettor that tries to re-enter claim() from its receive().
contract ReentrantBettor {
    PredictionMarket public market;
    uint256 public matchId;
    address public player;
    bool private attacking;

    constructor(PredictionMarket m) {
        market = m;
    }

    function betAI(uint256 mId, address p) external payable {
        matchId = mId;
        player = p;
        market.bet{value: msg.value}(mId, p, true);
    }

    function doClaim() external {
        attacking = true;
        market.claim(matchId, player);
    }

    receive() external payable {
        if (attacking) {
            attacking = false;
            market.claim(matchId, player); // re-entry attempt
        }
    }
}

contract ReentrancyAttackTest is Test {
    PredictionMarket market;
    address player = makeAddr("player");

    function setUp() public {
        market = new PredictionMarket(address(this)); // resolver = this
    }

    function test_ReentrancyOnClaimIsBlocked() public {
        ReentrantBettor attacker = new ReentrantBettor(market);
        vm.deal(address(attacker), 1 ether);

        attacker.betAI{value: 1 ether}(1, player);
        market.resolve(1, player, true); // AI wins; attacker is the only AI bettor

        // The re-entrant claim must fail; funds stay in the market.
        vm.expectRevert();
        attacker.doClaim();

        assertEq(address(market).balance, 1 ether, "market not drained");
    }
}
