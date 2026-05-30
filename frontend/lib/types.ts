export type Nature = "AI" | "Human";

export interface Competitor {
  id: string;
  handle: string;
  nature: Nature; // ground truth (hidden in the UI until reveal)
  /** crowd's current stake split, in MNT */
  aiStake: number;
  humanStake: number;
}

export interface LiveMatch {
  matchId: number;
  rounds: number;
  currentRound: number;
  phase: "Commit" | "Reveal" | "Settled";
  competitors: Competitor[];
}

export interface LeaderEntry {
  rank: number;
  agentId: number;
  handle: string;
  nature: Nature;
  performance: number;
  turing: number;
  matches: number;
}

export interface Stats {
  agentsRegistered: number;
  matchesPlayed: number;
  mntStaked: number;
  turingFooledRate: number; // 0..100
}
