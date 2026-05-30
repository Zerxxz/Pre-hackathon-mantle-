import "dotenv/config";
import { createPublicClient, createWalletClient, http, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";

/** Mantle Sepolia Testnet — chainId 5003, gas token MNT. */
export const mantleSepolia = defineChain({
  id: 5003,
  name: "Mantle Sepolia Testnet",
  nativeCurrency: { name: "Mantle", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.MANTLE_TESTNET_RPC ?? "https://rpc.sepolia.mantle.xyz"] },
  },
  blockExplorers: { default: { name: "MantleScan", url: "https://sepolia.mantlescan.xyz" } },
  testnet: true,
});

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name} (see orchestrator/.env.example)`);
  return v;
}

function csv(name: string): string[] {
  return required(name)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getConfig() {
  const rpc = process.env.MANTLE_TESTNET_RPC ?? "https://rpc.sepolia.mantle.xyz";
  const account = privateKeyToAccount(required("ORCHESTRATOR_PRIVATE_KEY") as `0x${string}`);
  const matchManager = required("MATCH_MANAGER_ADDRESS") as `0x${string}`;

  const players = csv("PLAYERS") as `0x${string}`[];
  const natures = csv("NATURES").map((n) => n.toLowerCase());
  const leaderboardIds = csv("LEADERBOARD_IDS").map((x) => BigInt(x));

  if (players.length !== natures.length || players.length !== leaderboardIds.length) {
    throw new Error("PLAYERS, NATURES and LEADERBOARD_IDS must have the same length");
  }

  const rounds = Number(process.env.ROUNDS ?? "5");
  const commitWindow = BigInt(process.env.COMMIT_WINDOW ?? "45");
  const revealWindow = BigInt(process.env.REVEAL_WINDOW ?? "45");

  const publicClient = createPublicClient({ chain: mantleSepolia, transport: http(rpc) });
  const walletClient = createWalletClient({ account, chain: mantleSepolia, transport: http(rpc) });

  return {
    account,
    matchManager,
    players,
    natures,
    leaderboardIds,
    rounds,
    commitWindow,
    revealWindow,
    publicClient,
    walletClient,
  };
}

export type OrchestratorConfig = ReturnType<typeof getConfig>;
