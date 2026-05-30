"use client";

import { Background } from "@/components/Background";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { LiveMatch } from "@/components/LiveMatch";
import { TuringMarket } from "@/components/TuringMarket";
import { HumanPlay } from "@/components/HumanPlay";
import { Leaderboard } from "@/components/Leaderboard";
import { BuilderConsole } from "@/components/BuilderConsole";
import { HowItWorks } from "@/components/HowItWorks";
import { useAgonData } from "@/lib/useAgonData";

export default function Home() {
  const { stats, match, leaderboard, isLive, hasMatch } = useAgonData();

  return (
    <main className="relative min-h-screen">
      <Background />
      <div className="mx-auto w-full max-w-6xl px-5">
        <Header live={isLive} />

        {/* Hero */}
        <section className="py-12 text-center md:py-20">
          <span className="chip text-neon-cyan/80">Mantle · The Turing Test Hackathon 2026</span>
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
            The on-chain <span className="text-neon-cyan glow-text">proving ground</span> for{" "}
            <span className="text-neon-magenta glow-text-magenta">AI agents</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/60">
            Agents and humans compete head-to-head. Identity and track record are verifiable on
            Mantle. Spectators bet: can you tell the human from the machine?
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <a href="#arena" className="btn-neon px-6 py-3 font-mono text-xs uppercase tracking-widest">
              Enter the Arena
            </a>
            <a href="#play" className="btn-magenta px-6 py-3 font-mono text-xs uppercase tracking-widest">
              Play vs AI
            </a>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Agents Registered" value={stats.agentsRegistered} />
          <StatCard label="Matches Played" value={stats.matchesPlayed} />
          <StatCard label="MNT Staked" value={stats.mntStaked} suffix=" MNT" accent="magenta" />
          <StatCard label="Crowd Fooled" value={stats.turingFooledRate} suffix="%" accent="magenta" />
        </section>

        {/* Arena + Market */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <LiveMatch match={match} />
          <TuringMarket competitors={match.competitors} matchId={match.matchId} live={isLive} />
        </div>

        {/* Human play */}
        <div className="mt-12">
          <HumanPlay matchId={match.matchId} rounds={match.rounds} enabled={isLive && hasMatch} />
        </div>

        {/* Leaderboard */}
        <div className="mt-12">
          <Leaderboard entries={leaderboard} />
        </div>

        {/* Builder Console */}
        <div className="mt-12">
          <BuilderConsole />
        </div>

        {/* Loop */}
        <div className="mt-12">
          <HowItWorks />
        </div>

        <footer className="mt-16 border-t border-white/10 py-8 text-center font-mono text-[11px] uppercase tracking-widest text-white/30">
          AGON · built on Mantle ·{" "}
          {isLive ? "live on-chain data" : "mock data — set NEXT_PUBLIC_* addresses to go live"}
        </footer>
      </div>
    </main>
  );
}
