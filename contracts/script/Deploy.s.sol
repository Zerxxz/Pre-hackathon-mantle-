// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {BenchmarkRegistry} from "../src/BenchmarkRegistry.sol";
import {MatchManager} from "../src/MatchManager.sol";
import {Leaderboard} from "../src/Leaderboard.sol";
import {PredictionMarket} from "../src/PredictionMarket.sol";

/// @notice Deploys the full AGON contract suite.
/// Usage:
///   forge script script/Deploy.s.sol --rpc-url mantle_testnet --broadcast
contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        AgentRegistry registry = new AgentRegistry();
        BenchmarkRegistry benchmarks = new BenchmarkRegistry(address(registry));
        MatchManager matchManager = new MatchManager();
        Leaderboard leaderboard = new Leaderboard();
        PredictionMarket market = new PredictionMarket(address(matchManager));

        // Allow the match manager to write scores (orchestrator wires the rest).
        leaderboard.setWriter(address(matchManager), true);

        console2.log("AgentRegistry     :", address(registry));
        console2.log("BenchmarkRegistry :", address(benchmarks));
        console2.log("MatchManager      :", address(matchManager));
        console2.log("Leaderboard       :", address(leaderboard));
        console2.log("PredictionMarket  :", address(market));

        vm.stopBroadcast();
    }
}
