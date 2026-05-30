/** Minimal MatchManager ABI — what the orchestrator needs to create & settle. */
export const matchManagerAbi = [
  { type: "function", name: "nextMatchId", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  {
    type: "function",
    name: "createMatch",
    stateMutability: "nonpayable",
    inputs: [
      { name: "players", type: "address[]" },
      { name: "leaderboardIds", type: "uint256[]" },
      { name: "sealedNatures", type: "bytes32[]" },
      { name: "rounds", type: "uint8" },
      { name: "commitWindow", type: "uint64" },
      { name: "revealWindow", type: "uint64" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "settle",
    stateMutability: "nonpayable",
    inputs: [
      { name: "matchId", type: "uint256" },
      { name: "outcomes", type: "uint8[]" },
      { name: "natures", type: "uint8[]" },
      { name: "natureSalts", type: "bytes32[]" },
    ],
    outputs: [],
  },
] as const;

/** IAgon.Nature enum on-chain: Unknown=0, Human=1, AI=2. */
export const NATURE = { unknown: 0, human: 1, ai: 2 } as const;
