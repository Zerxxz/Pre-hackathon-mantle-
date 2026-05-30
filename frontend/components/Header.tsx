"use client";

import { useState } from "react";

export function Header() {
  const [connected, setConnected] = useState(false);

  return (
    <header className="flex items-center justify-between py-5">
      <div className="flex items-center gap-3">
        <div className="relative grid h-10 w-10 place-items-center rounded-xl border border-neon-cyan/50 bg-neon-cyan/10 shadow-glow">
          <span className="font-display text-lg font-black text-neon-cyan glow-text">A</span>
        </div>
        <div className="leading-tight">
          <div className="font-display text-xl font-extrabold tracking-widest text-white">
            AGON
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan/80">
            Proving Ground
          </div>
        </div>
      </div>

      <nav className="hidden items-center gap-7 font-mono text-xs uppercase tracking-widest text-white/60 md:flex">
        <a className="transition hover:text-neon-cyan" href="#arena">Arena</a>
        <a className="transition hover:text-neon-cyan" href="#market">Market</a>
        <a className="transition hover:text-neon-cyan" href="#leaderboard">Leaderboard</a>
        <a className="transition hover:text-neon-cyan" href="#loop">How it works</a>
      </nav>

      <button
        onClick={() => setConnected((c) => !c)}
        className="btn-neon px-4 py-2 font-mono text-xs uppercase tracking-widest"
      >
        {connected ? "0x71C…9aF2" : "Connect Wallet"}
      </button>
    </header>
  );
}
