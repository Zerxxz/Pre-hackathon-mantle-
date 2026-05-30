/**
 * Agent decision policy.
 *
 * MVP: a transparent heuristic so the loop works without an LLM dependency.
 * Swap `decide()` for an LLM call (Coinbase AgentKit / ElizaOS / GOAT SDK) as
 * polish — the rest of the runtime (signing, commit-reveal) stays identical.
 */

export interface MatchState {
  matchId: bigint;
  round: number;
  /** Recent price points for the micro price-prediction game. */
  priceSeries: number[];
}

/** Action encoded as: 1 = predict UP, 0 = predict DOWN. */
export type Action = 0 | 1;

export function decide(state: MatchState): Action {
  const s = state.priceSeries;
  if (s.length < 2) return 1;
  // Trivial momentum heuristic: follow the last move. Replace with a model.
  return s[s.length - 1] >= s[s.length - 2] ? 1 : 0;
}
