/**
 * Price feed for the micro price-prediction game.
 *
 * MVP: a deterministic stub so the agent loop is runnable end-to-end. In the
 * full system the orchestrator publishes ONE canonical series per match (so all
 * players see the same environment); the agent would read that instead.
 */
export async function getPriceSeries(_matchId: bigint, round: number): Promise<number[]> {
  // TODO: replace with the orchestrator's canonical per-match feed / oracle.
  const base = [100, 101, 100, 102, 103, 101, 104, 103, 105, 106];
  return base.slice(0, Math.min(round + 2, base.length));
}
