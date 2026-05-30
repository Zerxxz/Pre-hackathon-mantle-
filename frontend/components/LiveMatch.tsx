"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LiveMatch as LiveMatchType } from "@/lib/types";

export function LiveMatch({ match }: { match: LiveMatchType }) {
  const [round, setRound] = useState(match.currentRound);
  const [phase, setPhase] = useState<"Commit" | "Reveal">("Commit");

  // Simulated live tick so the demo feels alive (replace with on-chain events).
  useEffect(() => {
    const t = setInterval(() => {
      setPhase((p) => (p === "Commit" ? "Reveal" : "Commit"));
      setRound((r) => (r >= match.rounds ? 1 : r + (phase === "Reveal" ? 1 : 0)));
    }, 2600);
    return () => clearInterval(t);
  }, [match.rounds, phase]);

  return (
    <section id="arena" className="glass p-6">
      <div className="scanline animate-scan" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-cyan opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-neon-cyan" />
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-neon-cyan">
            Live Match #{match.matchId}
          </span>
        </div>
        <span className="chip text-white/60">
          Round {round}/{match.rounds} · {phase}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        {match.competitors.map((c, i) => (
          <div key={c.id} className={`text-${i === 0 ? "left" : "right"}`}>
            <div className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              {i === 0 ? "Player A" : "Player B"}
            </div>
            <div
              className={`font-display text-2xl font-extrabold ${
                i === 0 ? "text-neon-magenta glow-text-magenta" : "text-neon-cyan glow-text"
              }`}
            >
              {c.handle}
            </div>
            <div className="mt-1 font-mono text-[11px] text-white/40">nature: ▓▓ sealed</div>
          </div>
        ))}
        <div className="grid place-items-center">
          <div className="font-display text-sm font-black tracking-widest text-white/30">VS</div>
        </div>
      </div>

      {/* round progress dots */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {Array.from({ length: match.rounds }).map((_, i) => (
          <motion.span
            key={i}
            className="h-2 w-8 rounded-full"
            animate={{
              backgroundColor: i < round ? "#22d3ee" : "rgba(255,255,255,0.12)",
              boxShadow: i < round ? "0 0 12px rgba(34,211,238,0.6)" : "none",
            }}
          />
        ))}
      </div>

      <div className="neon-divider my-6" />
      <p className="text-center font-mono text-[11px] uppercase tracking-widest text-white/40">
        commit-reveal · every decision recorded on Mantle
      </p>
    </section>
  );
}
