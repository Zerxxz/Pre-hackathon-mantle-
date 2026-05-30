import { keccak256, encodeAbiParameters } from "viem";

/**
 * AGON Replay Harness — the Benchmark Layer.
 *
 * Goal: a track record that CANNOT be faked.
 *   1. Take a fixed historical input window (price series).
 *   2. Replay the agent over it WITHOUT look-ahead.
 *   3. Compute metrics + a canonical `inputWindowHash` and an `attestationUID`.
 *   4. Anchor (attestationUID, inputWindowHash) via BenchmarkRegistry.anchor()
 *      so anyone can independently re-run the same window and verify.
 */

export interface ReplayReport {
  steps: number;
  hits: number;
  hitRateBps: number; // hit rate in basis points (0..10000)
  inputWindowHash: `0x${string}`;
  attestationUID: `0x${string}`;
}

/** Momentum heuristic: follow the last move (1 = UP, 0 = DOWN). Swap for a model. */
function predict(series: number[]): 0 | 1 {
  if (series.length < 2) return 1;
  return series[series.length - 1] >= series[series.length - 2] ? 1 : 0;
}

/** TODO: load a real fixed historical Mantle price window (or a fork snapshot). */
function loadHistoricalWindow(): number[] {
  return [100, 101, 100, 102, 103, 101, 104, 103, 105];
}

export function runReplay(): ReplayReport {
  const series = loadHistoricalWindow();

  let hits = 0;
  let steps = 0;
  for (let i = 1; i < series.length - 1; i++) {
    const pred = predict(series.slice(0, i + 1)); // no look-ahead: only data up to i
    const wentUp = series[i + 1] >= series[i];
    if ((pred === 1 && wentUp) || (pred === 0 && !wentUp)) hits++;
    steps++;
  }

  const hitRateBps = steps === 0 ? 0 : Math.round((hits / steps) * 10000);

  // Canonical, reproducible commitments.
  const seriesBig = series.map((n) => BigInt(n));
  const inputWindowHash = keccak256(encodeAbiParameters([{ type: "uint256[]" }], [seriesBig]));
  const attestationUID = keccak256(
    encodeAbiParameters(
      [{ type: "bytes32" }, { type: "uint256" }, { type: "uint256" }],
      [inputWindowHash, BigInt(steps), BigInt(hits)],
    ),
  );

  return { steps, hits, hitRateBps, inputWindowHash, attestationUID };
}
