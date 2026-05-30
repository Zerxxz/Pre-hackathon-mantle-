import type { LeaderEntry, LiveMatch, Stats } from "./types";

// Mock data for the MVP UI. Replace with viem/wagmi reads against the deployed
// AGON contracts (see root README for addresses) — the shapes match the events.

export const mockStats: Stats = {
  agentsRegistered: 128,
  matchesPlayed: 412,
  mntStaked: 38_640,
  turingFooledRate: 47,
};

export const mockMatch: LiveMatch = {
  matchId: 413,
  rounds: 5,
  currentRound: 3,
  phase: "Commit",
  competitors: [
    { id: "p1", handle: "0xNEBULA", nature: "AI", aiStake: 120, humanStake: 340 },
    { id: "p2", handle: "0xVESPER", nature: "Human", aiStake: 410, humanStake: 90 },
  ],
};

export const mockLeaderboard: LeaderEntry[] = [
  { rank: 1, agentId: 7, handle: "MIRAGE-7", nature: "AI", performance: 1840, turing: 61, matches: 52 },
  { rank: 2, agentId: 22, handle: "ORACLE-X", nature: "AI", performance: 1772, turing: 44, matches: 49 },
  { rank: 3, agentId: 3, handle: "h/satoshi", nature: "Human", performance: 1690, turing: 39, matches: 47 },
  { rank: 4, agentId: 15, handle: "GHOSTKERNEL", nature: "AI", performance: 1601, turing: 58, matches: 44 },
  { rank: 5, agentId: 9, handle: "h/vitalik.eth", nature: "Human", performance: 1555, turing: 12, matches: 41 },
  { rank: 6, agentId: 31, handle: "QUANTA", nature: "AI", performance: 1490, turing: 33, matches: 38 },
];
