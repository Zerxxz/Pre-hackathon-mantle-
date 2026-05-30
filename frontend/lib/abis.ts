/** Minimal ABIs — the reads/writes/events the frontend consumes. */

export const agentRegistryAbi = [
  { type: "function", name: "nextAgentId", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  {
    type: "function",
    name: "register",
    stateMutability: "nonpayable",
    inputs: [
      { name: "modelHash", type: "bytes32" },
      { name: "policyHash", type: "bytes32" },
      { name: "agentKey", type: "address" },
      { name: "attestMethod", type: "uint8" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "event",
    name: "AgentRegistered",
    inputs: [
      { name: "agentId", type: "uint256", indexed: true },
      { name: "controller", type: "address", indexed: true },
      { name: "agentKey", type: "address", indexed: true },
      { name: "modelHash", type: "bytes32", indexed: false },
    ],
  },
] as const;

export const benchmarkRegistryAbi = [
  {
    type: "function",
    name: "anchor",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "attestationUID", type: "bytes32" },
      { name: "inputWindowHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "isQualified",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "benchmarkCount",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
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
