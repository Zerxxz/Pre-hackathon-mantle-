// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MatchManager} from "../src/MatchManager.sol";
import {Leaderboard} from "../src/Leaderboard.sol";
import {PredictionMarket} from "../src/PredictionMarket.sol";
import {IAgon} from "../src/interfaces/IAgon.sol";

/// @notice End-to-end arena test: commit-reveal -> bet -> settle -> scoring -> claim.
contract MatchManagerTest is Test {
    MatchManager mm;
    Leaderboard lb;
    PredictionMarket market;

    address agent = makeAddr("agent"); // the AI competitor
    address human = makeAddr("human"); // the human competitor

    address bettorHumanGuess = makeAddr("bettorHumanGuess");
    address bettorAIGuess = makeAddr("bettorAIGuess");
    address bettorHumanOnHuman = makeAddr("bettorHumanOnHuman");

    uint256 constant AGENT_LB_ID = 1;
    uint256 constant HUMAN_LB_ID = 1000;

    function setUp() public {
        mm = new MatchManager();
        lb = new Leaderboard();
        market = new PredictionMarket(address(mm)); // resolver = match manager

        lb.setWriter(address(mm), true);
        mm.setHooks(address(lb), address(market));
    }

    function _salt(address p, uint8 round) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(p, round));
    }

    function _commit(uint256 matchId, address p, uint8 round, uint8 pred) internal {
        bytes memory action = abi.encode(pred);
        bytes32 commitment = keccak256(abi.encodePacked(action, _salt(p, round)));
        vm.prank(p);
        mm.commit(matchId, round, commitment);
    }

    function _reveal(uint256 matchId, address p, uint8 round, uint8 pred) internal {
        bytes memory action = abi.encode(pred);
        vm.prank(p);
        mm.reveal(matchId, round, action, _salt(p, round));
    }

    function test_FullArenaFlow() public {
        // --- create match: agent (AI) vs human ---
        address[] memory players = new address[](2);
        players[0] = agent;
        players[1] = human;

        uint256[] memory lbIds = new uint256[](2);
        lbIds[0] = AGENT_LB_ID;
        lbIds[1] = HUMAN_LB_ID;

        bytes32 agentNatureSalt = keccak256("agent-nature");
        bytes32 humanNatureSalt = keccak256("human-nature");
        bytes32[] memory sealedNatures = new bytes32[](2);
        sealedNatures[0] = keccak256(abi.encodePacked(uint8(IAgon.Nature.AI), agentNatureSalt));
        sealedNatures[1] = keccak256(abi.encodePacked(uint8(IAgon.Nature.Human), humanNatureSalt));

        uint8 rounds = 3;
        uint256 matchId = mm.createMatch(players, lbIds, sealedNatures, rounds, 1 hours, 1 hours);

        // --- commit phase (all players, all rounds) ---
        // outcomes will be [UP, DOWN, UP] = [1,0,1]
        // agent predicts [1,0,1] -> 3 correct
        // human predicts [1,1,0] -> 1 correct
        uint8[3] memory agentPreds = [uint8(1), uint8(0), uint8(1)];
        uint8[3] memory humanPreds = [uint8(1), uint8(1), uint8(0)];

        for (uint8 r = 0; r < rounds; r++) {
            _commit(matchId, agent, r, agentPreds[r]);
            _commit(matchId, human, r, humanPreds[r]);
        }

        // --- reveal phase ---
        for (uint8 r = 0; r < rounds; r++) {
            _reveal(matchId, agent, r, agentPreds[r]);
            _reveal(matchId, human, r, humanPreds[r]);
        }

        // --- spectators bet "Human or AI?" ---
        // On the AGENT: crowd leans Human (wrong) -> agent fools the crowd.
        vm.deal(bettorHumanGuess, 2 ether);
        vm.prank(bettorHumanGuess);
        market.bet{value: 2 ether}(matchId, agent, false); // guess Human

        vm.deal(bettorAIGuess, 1 ether);
        vm.prank(bettorAIGuess);
        market.bet{value: 1 ether}(matchId, agent, true); // guess AI (correct)

        // On the HUMAN: crowd correctly leans Human -> not fooled.
        vm.deal(bettorHumanOnHuman, 1 ether);
        vm.prank(bettorHumanOnHuman);
        market.bet{value: 1 ether}(matchId, human, false); // guess Human (correct)

        // --- settle ---
        uint8[] memory outcomes = new uint8[](3);
        outcomes[0] = 1;
        outcomes[1] = 0;
        outcomes[2] = 1;

        IAgon.Nature[] memory natures = new IAgon.Nature[](2);
        natures[0] = IAgon.Nature.AI;
        natures[1] = IAgon.Nature.Human;

        bytes32[] memory natureSalts = new bytes32[](2);
        natureSalts[0] = agentNatureSalt;
        natureSalts[1] = humanNatureSalt;

        mm.settle(matchId, outcomes, natures, natureSalts);

        // --- assert scores ---
        (uint256 agentPerf, uint256 agentTuring, uint256 agentMatches) = lb.scoreOf(AGENT_LB_ID);
        assertEq(agentPerf, 3, "agent performance");
        assertEq(agentTuring, 1, "agent fooled the crowd");
        assertEq(agentMatches, 1, "agent matches");

        (uint256 humanPerf, uint256 humanTuring,) = lb.scoreOf(HUMAN_LB_ID);
        assertEq(humanPerf, 1, "human performance");
        assertEq(humanTuring, 0, "human not fooling crowd");

        // --- winning bettor claims the agent pool (3 ether, AI side won) ---
        uint256 before = bettorAIGuess.balance;
        vm.prank(bettorAIGuess);
        market.claim(matchId, agent);
        assertEq(bettorAIGuess.balance - before, 3 ether, "winner takes whole pool");
    }

    function test_RevertWhen_NatureRevealMismatch() public {
        address[] memory players = new address[](1);
        players[0] = agent;
        uint256[] memory lbIds = new uint256[](1);
        lbIds[0] = AGENT_LB_ID;
        bytes32[] memory sealedNatures = new bytes32[](1);
        sealedNatures[0] = keccak256(abi.encodePacked(uint8(IAgon.Nature.AI), keccak256("real-salt")));

        uint256 matchId = mm.createMatch(players, lbIds, sealedNatures, 1, 1 hours, 1 hours);

        uint8[] memory outcomes = new uint8[](1);
        outcomes[0] = 1;
        IAgon.Nature[] memory natures = new IAgon.Nature[](1);
        natures[0] = IAgon.Nature.AI;
        bytes32[] memory natureSalts = new bytes32[](1);
        natureSalts[0] = keccak256("wrong-salt"); // mismatch

        vm.expectRevert(bytes("bad nature"));
        mm.settle(matchId, outcomes, natures, natureSalts);
    }
}
