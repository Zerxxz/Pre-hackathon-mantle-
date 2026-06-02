/**
 * AGON contract addresses, read from public env at build time.
 * Set these in frontend/.env.local (see .env.example) after deploying.
 * When `matchManager` is unset the UI gracefully falls back to mock data.
 *
 * IMPORTANT: must reference process.env.NEXT_PUBLIC_* with a string literal
 * (not via a dynamic key) — Next.js' webpack DefinePlugin only inlines
 * literal property accesses; `process.env[k]` with a variable `k` returns
 * `undefined` in the browser.
 */
const opt = (v: string | undefined) =>
  v && v.startsWith("0x") ? (v as `0x${string}`) : undefined;

export const addresses = {
  agentRegistry: opt(process.env.NEXT_PUBLIC_AGENT_REGISTRY),
  benchmarkRegistry: opt(process.env.NEXT_PUBLIC_BENCHMARK_REGISTRY),
  matchManager: opt(process.env.NEXT_PUBLIC_MATCH_MANAGER),
  leaderboard: opt(process.env.NEXT_PUBLIC_LEADERBOARD),
  predictionMarket: opt(process.env.NEXT_PUBLIC_PREDICTION_MARKET),
};

/** True when enough is configured to read live data. */
export const isConfigured = Boolean(addresses.matchManager && addresses.agentRegistry);
