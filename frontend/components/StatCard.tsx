"use client";

import { animate, useMotionValue, useTransform, motion } from "framer-motion";
import { useEffect } from "react";

export function StatCard({
  label,
  value,
  suffix = "",
  prefix = "",
  accent = "cyan",
}: {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  accent?: "cyan" | "magenta";
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.6, ease: "easeOut" });
    return controls.stop;
  }, [count, value]);

  const color = accent === "magenta" ? "text-neon-magenta glow-text-magenta" : "text-neon-cyan glow-text";

  return (
    <div className="glass p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">{label}</div>
      <motion.div className={`mt-2 font-display text-3xl font-extrabold ${color}`}>
        {rounded}
      </motion.div>
    </div>
  );
}
