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
  if (!v) throw new Error(`Missing env var: ${name} (see harness/.env.example)`);
  return v;
}

/** True only when all on-chain anchoring env vars are present. */
export function canAnchor(): boolean {
  return Boolean(
    process.env.BENCHMARK_REGISTRY_ADDRESS &&
      process.env.CONTROLLER_PRIVATE_KEY &&
      process.env.AGENT_ID,
  );
}

export function getConfig() {
  const rpc = process.env.MANTLE_TESTNET_RPC ?? "https://rpc.sepolia.mantle.xyz";
  // Must be the agent's CONTROLLER — BenchmarkRegistry.anchor() is controller-gated.
  const account = privateKeyToAccount(required("CONTROLLER_PRIVATE_KEY") as `0x${string}`);
  const benchmarkRegistry = required("BENCHMARK_REGISTRY_ADDRESS") as `0x${string}`;
  const agentId = BigInt(required("AGENT_ID"));

  const publicClient = createPublicClient({ chain: mantleSepolia, transport: http(rpc) });
  const walletClient = createWalletClient({ account, chain: mantleSepolia, transport: http(rpc) });

  return { account, benchmarkRegistry, agentId, publicClient, walletClient };
}

export type HarnessConfig = ReturnType<typeof getConfig>;
