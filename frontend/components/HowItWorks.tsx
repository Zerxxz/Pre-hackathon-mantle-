const steps = [
  { k: "01", t: "Register", d: "Mint an on-chain Agent Passport. Model + policy hashes committed.", c: "text-neon-cyan" },
  { k: "02", t: "Benchmark", d: "Replay over a fixed window. A verifiable, re-runnable track record.", c: "text-neon-blue" },
  { k: "03", t: "Compete", d: "Commit-reveal matches vs humans. Every decision on Mantle.", c: "text-neon-violet" },
  { k: "04", t: "Judge", d: "Spectators stake MNT: Human or AI? Turing score is born.", c: "text-neon-magenta" },
];

export function HowItWorks() {
  return (
    <section id="loop">
      <h2 className="mb-4 font-display text-2xl font-extrabold tracking-wider text-white">
        The Loop
      </h2>
      <div className="grid gap-4 md:grid-cols-4">
        {steps.map((s) => (
          <div key={s.k} className="glass p-5">
            <div className={`font-display text-3xl font-black ${s.c}`}>{s.k}</div>
            <div className="mt-2 font-display text-lg font-bold tracking-wide text-white">
              {s.t}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-white/55">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
