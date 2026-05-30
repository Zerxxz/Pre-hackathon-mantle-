import "dotenv/config";
import { createPublicClient, createWalletClient, http, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";

/** Mantle Sepolia Testnet — chainId 5003, gas token MNT. */
export const mantleSepolia = defineChain({
  id: 5003,
  name: "Mantle Sepolia Testnet",
  nativeCurrency: { name: "Mantle", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.MANTLE_TESTNET_RPC ?? "https://rpc.sepolia.mantle.xyz"],
    },
  },
  blockExplorers: {
    default: { name: "MantleScan", url: "https://sepolia.mantlescan.xyz" },
  },
  testnet: true,
});

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name} (see agent/.env.example)`);
  return v;
}

export function getConfig() {
  const rpc = process.env.MANTLE_TESTNET_RPC ?? "https://rpc.sepolia.mantle.xyz";
  const account = privateKeyToAccount(required("AGENT_PRIVATE_KEY") as `0x${string}`);
  const matchManager = required("MATCH_MANAGER_ADDRESS") as `0x${string}`;

  const publicClient = createPublicClient({ chain: mantleSepolia, transport: http(rpc) });
  const walletClient = createWalletClient({ account, chain: mantleSepolia, transport: http(rpc) });

  return { account, matchManager, publicClient, walletClient, rpc };
}

export type AgonConfig = ReturnType<typeof getConfig>;
