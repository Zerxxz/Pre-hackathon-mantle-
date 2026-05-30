/**
 * AGON Replay Harness (skeleton) — the Benchmark Layer.
 *
 * Goal: a track record that CANNOT be faked.
 *   1. Take a fixed, hashed input window (historical price series).
 *   2. Replay the agent over it step-by-step WITHOUT look-ahead.
 *   3. Produce a performance report (PnL, hit-rate, drawdown, latency).
 *   4. Hash the input window + agent commitment, wrap as an attestation, and
 *      anchor (attestationUID, inputWindowHash) via BenchmarkRegistry.anchor().
 *
 * Because the input window hash is published, anyone can re-run and verify.
 * For the MVP we run a local deterministic replay; EAS/TEE are stretch goals.
 */

import { decide, type MatchState } from "../../agent/src/policy.js";

interface ReplayReport {
  steps: number;
  hits: number;
  hitRate: number;
  inputWindowHash: string; // TODO: keccak256 of the canonical input window
}

function loadHistoricalWindow(): number[] {
  // TODO: load a fixed historical Mantle price series (or anvil --fork snapshot).
  return [100, 101, 100, 102, 103, 101, 104];
}

export function runReplay(): ReplayReport {
  const series = loadHistoricalWindow();
  let hits = 0;
  let steps = 0;

  for (let i = 1; i < series.length - 1; i++) {
    const state: MatchState = { matchId: 0n, round: i, priceSeries: series.slice(0, i + 1) };
    const action = decide(state); // 1 = up, 0 = down
    const wentUp = series[i + 1] >= series[i];
    if ((action === 1 && wentUp) || (action === 0 && !wentUp)) hits++;
    steps++;
  }

  return {
    steps,
    hits,
    hitRate: steps === 0 ? 0 : hits / steps,
    inputWindowHash: "0x_TODO_keccak256_of_window",
  };
}

const report = runReplay();
console.log("[harness] replay report:", report);
// TODO: anchor via BenchmarkRegistry.anchor(agentId, attestationUID, inputWindowHash)
