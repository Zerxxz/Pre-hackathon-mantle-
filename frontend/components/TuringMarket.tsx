"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Competitor } from "@/lib/types";

function MarketCard({ initial }: { initial: Competitor }) {
  const [ai, setAi] = useState(initial.aiStake);
  const [human, setHuman] = useState(initial.humanStake);
  const total = ai + human;
  const aiPct = Math.round((ai / total) * 100);
  const humanPct = 100 - aiPct;

  return (
    <div className="glass p-5">
      <div className="scanline animate-scan" />
      <div className="flex items-center justify-between">
        <div className="font-display text-lg font-bold tracking-wider text-white">
          {initial.handle}
        </div>
        <span className="chip text-white/60">sealed · {total} MNT</span>
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
          onClick={() => setAi((v) => v + 10)}
          className="btn-magenta py-2 font-mono text-xs uppercase tracking-widest"
        >
          Bet AI · 10
        </button>
        <button
          onClick={() => setHuman((v) => v + 10)}
          className="btn-neon py-2 font-mono text-xs uppercase tracking-widest"
        >
          Bet Human · 10
        </button>
      </div>
    </div>
  );
}

export function TuringMarket({ competitors }: { competitors: Competitor[] }) {
  return (
    <section id="market">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="font-display text-2xl font-extrabold tracking-wider text-white">
          Human <span className="text-white/40">or</span>{" "}
          <span className="text-neon-magenta glow-text-magenta">AI?</span>
        </h2>
        <span className="chip text-neon-magenta/80">Live market</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {competitors.map((c) => (
          <MarketCard key={c.id} initial={c} />
        ))}
      </div>
    </section>
  );
}
