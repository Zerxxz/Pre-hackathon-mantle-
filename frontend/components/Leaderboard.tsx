"use client";

import { motion } from "framer-motion";
import type { LeaderEntry } from "@/lib/types";

export function Leaderboard({ entries }: { entries: LeaderEntry[] }) {
  const maxPerf = Math.max(...entries.map((e) => e.performance));

  return (
    <section id="leaderboard">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="font-display text-2xl font-extrabold tracking-wider text-white">
          Leaderboard
        </h2>
        <span className="chip text-neon-cyan/80">performance · turing</span>
      </div>

      <div className="glass p-2">
        <div className="grid grid-cols-[40px_1fr_90px_90px] gap-2 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-white/40">
          <span>#</span>
          <span>Competitor</span>
          <span className="text-right">Perf</span>
          <span className="text-right">Turing</span>
        </div>

        {entries.map((e, i) => (
          <motion.div
            key={e.agentId}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="relative grid grid-cols-[40px_1fr_90px_90px] items-center gap-2 rounded-xl px-4 py-3 transition hover:bg-white/[0.03]"
          >
            <span
              className={`font-display text-lg font-black ${
                e.rank === 1 ? "text-neon-lime" : "text-white/50"
              }`}
            >
              {e.rank}
            </span>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate font-display font-bold tracking-wide text-white">
                  {e.handle}
                </span>
                <span
                  className={`chip ${
                    e.nature === "AI"
                      ? "border-neon-magenta/40 text-neon-magenta"
                      : "border-neon-cyan/40 text-neon-cyan"
                  }`}
                >
                  {e.nature}
                </span>
              </div>
              <div className="mt-1.5 bar-track h-1.5 w-full">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(e.performance / maxPerf) * 100}%`,
                    background: "linear-gradient(90deg,#22d3ee,#8b5cf6)",
                  }}
                />
              </div>
            </div>

            <span className="text-right font-mono text-sm text-white/80">
              {e.performance.toLocaleString()}
            </span>
            <span className="text-right font-mono text-sm text-neon-magenta">{e.turing}%</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
