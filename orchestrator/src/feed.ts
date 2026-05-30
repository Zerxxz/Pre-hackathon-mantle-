/**
 * Canonical price feed for the micro price-prediction game.
 *
 * MVP: a deterministic series shared by the orchestrator AND the agents/humans
 * (the agent's feed.ts mirrors this BASE). In production the orchestrator would
 * publish a per-match series / oracle reference that everyone reads.
 */
const BASE = [100, 101, 100, 102, 103, 101, 104, 103, 105, 106];

/** A series of length rounds+1 so every round has a "next" price. */
export function canonicalSeries(rounds: number): number[] {
  return BASE.slice(0, Math.min(rounds + 1, BASE.length));
}

/** Per-round actual move: 1 = UP, 0 = DOWN (length == rounds). */
export function outcomesOf(series: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < series.length - 1; i++) {
    out.push(series[i + 1] >= series[i] ? 1 : 0);
  }
  return out;
}
