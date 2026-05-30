/**
 * AGON contract addresses, read from public env at build time.
 * Set these in frontend/.env (see .env.example) after deploying (docs/DEPLOY.md).
 * When `matchManager` is unset the UI gracefully falls back to mock data.
 */
const env = (k: string) => {
  const v = process.env[k];
  return v && v.startsWith("0x") ? (v as `0x${string}`) : undefined;
};

export const addresses = {
  agentRegistry: env("NEXT_PUBLIC_AGENT_REGISTRY"),
  benchmarkRegistry: env("NEXT_PUBLIC_BENCHMARK_REGISTRY"),
  matchManager: env("NEXT_PUBLIC_MATCH_MANAGER"),
  leaderboard: env("NEXT_PUBLIC_LEADERBOARD"),
  predictionMarket: env("NEXT_PUBLIC_PREDICTION_MARKET"),
};

/** True when enough is configured to read live data. */
export const isConfigured = Boolean(addresses.matchManager && addresses.agentRegistry);
