/** Minimal MatchManager ABI — only what the agent runtime needs. */
export const matchManagerAbi = [
  {
    type: "event",
    name: "MatchCreated",
    inputs: [
      { name: "matchId", type: "uint256", indexed: true },
      { name: "orchestrator", type: "address", indexed: true },
      { name: "rounds", type: "uint8", indexed: false },
    ],
  },
  {
    type: "function",
    name: "matches",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
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
    name: "isPlayer",
    stateMutability: "view",
    inputs: [
      { name: "matchId", type: "uint256" },
      { name: "player", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "commit",
    stateMutability: "nonpayable",
    inputs: [
      { name: "matchId", type: "uint256" },
      { name: "round", type: "uint8" },
      { name: "commitment", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "reveal",
    stateMutability: "nonpayable",
    inputs: [
      { name: "matchId", type: "uint256" },
      { name: "round", type: "uint8" },
      { name: "action", type: "bytes" },
      { name: "salt", type: "bytes32" },
    ],
    outputs: [],
  },
] as const;
