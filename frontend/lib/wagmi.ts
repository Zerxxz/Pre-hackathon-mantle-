import { http, createConfig } from "wagmi";
import { defineChain } from "viem";
import { injected } from "wagmi/connectors";

/** Mantle Sepolia Testnet — chainId 5003, gas token MNT. */
export const mantleSepolia = defineChain({
  id: 5003,
  name: "Mantle Sepolia Testnet",
  nativeCurrency: { name: "Mantle", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_MANTLE_TESTNET_RPC ?? "https://rpc.sepolia.mantle.xyz"],
    },
  },
  blockExplorers: { default: { name: "MantleScan", url: "https://sepolia.mantlescan.xyz" } },
  testnet: true,
});

export const wagmiConfig = createConfig({
  chains: [mantleSepolia],
  connectors: [injected()],
  transports: { [mantleSepolia.id]: http() },
  ssr: true,
});
