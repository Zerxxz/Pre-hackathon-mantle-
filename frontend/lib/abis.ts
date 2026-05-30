/** Minimal ABIs — only the reads/events the frontend consumes. */

export const agentRegistryAbi = [
  { type: "function", name: "nextAgentId", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;

export const matchManagerAbi = [
  { type: "function", name: "nextMatchId", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  {
    type: "function",
    name: "matches",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [
      { name: "orchestrator", type: "address" },
      { name: "commitDeadline", type: "uint64" },
      { name: "revealDeadline", type: "uint64" },
      { name: "rounds", type: "uint8" },
      { name: "phase", type: "uint8" },
    ],
  },
  {
    type: "function",
    name: "getPlayers",
    stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "address[]" }],
  },
] as const;

export const predictionMarketAbi = [
  {
    type: "function",
    name: "poolStakes",
    stateMutability: "view",
    inputs: [{ type: "uint256" }, { type: "address" }],
    outputs: [
      { name: "aiStake", type: "uint256" },
      { name: "humanStake", type: "uint256" },
    ],
  },
] as const;

export const leaderboardAbi = [
  {
    type: "event",
    name: "ScoreUpdated",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "performanceScore", type: "uint256", indexed: false },
      { name: "turingScore", type: "uint256", indexed: false },
    ],
  },
] as const;
