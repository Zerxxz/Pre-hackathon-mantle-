/** Minimal BenchmarkRegistry ABI — only what the harness needs. */
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
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "benchmarkCount",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
