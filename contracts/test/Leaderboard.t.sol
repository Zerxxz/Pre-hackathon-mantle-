// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Leaderboard} from "../src/Leaderboard.sol";

contract LeaderboardTest is Test {
    Leaderboard lb;
    address writer = makeAddr("writer");
    address stranger = makeAddr("stranger");

    function setUp() public {
        lb = new Leaderboard(); // owner = this
    }

    function test_WriterCanRecord() public {
        lb.setWriter(writer, true);
        vm.prank(writer);
        lb.recordResult(7, 100, 1);
        (uint256 perf, uint256 turing, uint256 matches) = lb.scoreOf(7);
        assertEq(perf, 100);
        assertEq(turing, 1);
        assertEq(matches, 1);
    }

    function test_RevertWhen_NonWriterRecords() public {
        vm.prank(stranger);
        vm.expectRevert(bytes("not writer"));
        lb.recordResult(7, 100, 1);
    }

    function test_RevertWhen_NonOwnerSetsWriter() public {
        vm.prank(stranger);
        vm.expectRevert(bytes("not owner"));
        lb.setWriter(stranger, true);
    }

    function test_AccumulatesAcrossMatches() public {
        lb.setWriter(address(this), true);
        lb.recordResult(7, 100, 1);
        lb.recordResult(7, 50, 0);
        (uint256 perf, uint256 turing, uint256 matches) = lb.scoreOf(7);
        assertEq(perf, 150);
        assertEq(turing, 1);
        assertEq(matches, 2);
    }
}
