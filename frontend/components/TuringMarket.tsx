"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { parseEther } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { addresses } from "@/lib/contracts";
import { predictionMarketAbi } from "@/lib/abis";
import type { Competitor } from "@/lib/types";

const BET_MNT = "0.01"; // fixed demo stake per click

function MarketCard({
  initial,
  matchId,
  live,
}: {
  initial: Competitor;
  matchId: number;
  live: boolean;
}) {
  const { isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const canBetOnChain = live && isConnected && Boolean(addresses.predictionMarket);

  // Live mode reads stakes from props (refreshed by useAgonData); demo mode is local.
  const [localAi, setLocalAi] = useState(initial.aiStake);
  const [localHuman, setLocalHuman] = useState(initial.humanStake);
  const [pending, setPending] = useState<"ai" | "human" | null>(null);

  const ai = live ? initial.aiStake : localAi;
  const human = live ? initial.humanStake : localHuman;
  const total = ai + human;
  const aiPct = total === 0 ? 50 : Math.round((ai / total) * 100);
  const humanPct = 100 - aiPct;

  async function bet(guessIsAI: boolean) {
    if (canBetOnChain) {
      try {
        setPending(guessIsAI ? "ai" : "human");
        await writeContractAsync({
          address: addresses.predictionMarket!,
          abi: predictionMarketAbi,
          functionName: "bet",
          args: [BigInt(matchId), initial.id as `0x${string}`, guessIsAI],
          value: parseEther(BET_MNT),
        });
      } catch {
        /* user rejected or revert — ignore for demo */
      } finally {
        setPending(null);
      }
    } else {
      if (guessIsAI) setLocalAi((v) => v + 10);
      else setLocalHuman((v) => v + 10);
    }
  }

  return (
    <div className="glass p-5">
      <div className="scanline animate-scan" />
      <div className="flex items-center justify-between">
        <div className="font-display text-lg font-bold tracking-wider text-white">{initial.handle}</div>
        <span className="chip text-white/60">
          sealed · {total.toFixed(total < 10 ? 2 : 0)} MNT
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between font-mono text-xs">
        <span className="text-neon-magenta">AI {aiPct}%</span>
        <span className="text-neon-cyan">HUMAN {humanPct}%</span>
      </div>
      <div className="bar-track mt-2 flex h-3 w-full">
        <motion.div
          className="h-full animate-pulseBar"
          style={{ background: "linear-gradient(90deg,#e879f9,#8b5cf6)" }}
          animate={{ width: `${aiPct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
        <motion.div
          className="h-full animate-pulseBar"
          style={{ background: "linear-gradient(90deg,#3b82f6,#22d3ee)" }}
          animate={{ width: `${humanPct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => bet(true)}
          disabled={pending !== null}
          className="btn-magenta py-2 font-mono text-xs uppercase tracking-widest disabled:opacity-50"
        >
          {pending === "ai" ? "…" : `Bet AI · ${canBetOnChain ? BET_MNT : "10"}`}
        </button>
        <button
          onClick={() => bet(false)}
          disabled={pending !== null}
          className="btn-neon py-2 font-mono text-xs uppercase tracking-widest disabled:opacity-50"
        >
          {pending === "human" ? "…" : `Bet Human · ${canBetOnChain ? BET_MNT : "10"}`}
        </button>
      </div>
    </div>
  );
}

export function TuringMarket({
  competitors,
  matchId,
  live,
}: {
  competitors: Competitor[];
  matchId: number;
  live: boolean;
}) {
  return (
    <section id="market">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="font-display text-2xl font-extrabold tracking-wider text-white">
          Human <span className="text-white/40">or</span>{" "}
          <span className="text-neon-magenta glow-text-magenta">AI?</span>
        </h2>
        <span className="chip text-neon-magenta/80">{live ? "Live market" : "Demo market"}</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {competitors.map((c) => (
          <MarketCard key={c.id} initial={c} matchId={matchId} live={live} />
        ))}
      </div>
    </section>
  );
}
