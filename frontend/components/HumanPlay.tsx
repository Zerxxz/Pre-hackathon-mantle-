"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { addresses } from "@/lib/contracts";
import { matchManagerAbi } from "@/lib/abis";
import { commitmentOf, encodeAction, randomSalt, saltKey, type Prediction } from "@/lib/play";

type Status = "idle" | "committing" | "committed" | "revealing" | "revealed" | "error";

const ZERO = "0x0000000000000000000000000000000000000000" as const;

export function HumanPlay({
  matchId,
  rounds,
  enabled,
}: {
  matchId: number;
  rounds: number;
  enabled: boolean;
}) {
  const { address, isConnected } = useAccount();
  const ready = Boolean(addresses.matchManager);
  const { writeContractAsync } = useWriteContract();

  const [preds, setPreds] = useState<Record<number, Prediction>>({});
  const [status, setStatus] = useState<Record<number, Status>>({});

  const { data: amPlayer } = useReadContract({
    address: addresses.matchManager,
    abi: matchManagerAbi,
    functionName: "isPlayer",
    args: [BigInt(matchId), (address ?? ZERO) as `0x${string}`],
    query: { enabled: ready && enabled && !!address },
  });

  const getPred = (r: number): Prediction => preds[r] ?? 1;
  const setStat = (r: number, s: Status) => setStatus((m) => ({ ...m, [r]: s }));

  async function commit(r: number) {
    if (!address) return;
    try {
      setStat(r, "committing");
      const pred = getPred(r);
      const salt = randomSalt();
      localStorage.setItem(saltKey(matchId, r, address), JSON.stringify({ salt, pred }));
      await writeContractAsync({
        address: addresses.matchManager!,
        abi: matchManagerAbi,
        functionName: "commit",
        args: [BigInt(matchId), r, commitmentOf(encodeAction(pred), salt)],
      });
      setStat(r, "committed");
    } catch {
      setStat(r, "error");
    }
  }

  async function reveal(r: number) {
    if (!address) return;
    const raw = localStorage.getItem(saltKey(matchId, r, address));
    if (!raw) return setStat(r, "error");
    try {
      const { salt, pred } = JSON.parse(raw) as { salt: `0x${string}`; pred: Prediction };
      setStat(r, "revealing");
      await writeContractAsync({
        address: addresses.matchManager!,
        abi: matchManagerAbi,
        functionName: "reveal",
        args: [BigInt(matchId), r, encodeAction(pred), salt],
      });
      setStat(r, "revealed");
    } catch {
      setStat(r, "error");
    }
  }

  const banner = !ready
    ? "Set NEXT_PUBLIC_MATCH_MANAGER to enable."
    : !enabled
      ? "No active match yet — run the orchestrator to open one."
      : !isConnected
        ? "Connect your wallet to play."
        : amPlayer === false
          ? `Your wallet isn't a player in match #${matchId}. The orchestrator must include your address.`
          : null;

  const canPlay = ready && enabled && isConnected && amPlayer !== false;

  return (
    <section id="play">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="font-display text-2xl font-extrabold tracking-wider text-white">
          Play as Human <span className="text-white/40">vs the AI</span>
        </h2>
        <span className="chip text-neon-cyan/80">
          {enabled ? `match #${matchId}` : "no match"}
        </span>
      </div>

      <div className="glass p-5">
        <div className="scanline animate-scan" />
        <p className="text-sm text-white/55">
          Predict each round (UP/DOWN), <span className="text-neon-cyan">commit</span> it (hashed,
          on-chain), then <span className="text-neon-magenta">reveal</span> after the commit window.
          Beat the AI — and try not to look like one.
        </p>

        <div className="mt-4 space-y-2">
          {Array.from({ length: rounds }).map((_, r) => {
            const st = status[r] ?? "idle";
            const pred = getPred(r);
            return (
              <div
                key={r}
                className="grid grid-cols-[60px_1fr_auto] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
              >
                <span className="font-mono text-[11px] uppercase tracking-widest text-white/45">
                  R{r + 1}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreds((m) => ({ ...m, [r]: 1 }))}
                    disabled={!canPlay}
                    className={`rounded-md px-3 py-1 font-mono text-xs uppercase tracking-widest transition ${
                      pred === 1 ? "bg-neon-cyan/20 text-neon-cyan" : "text-white/40 hover:text-white/70"
                    } disabled:opacity-40`}
                  >
                    ▲ Up
                  </button>
                  <button
                    onClick={() => setPreds((m) => ({ ...m, [r]: 0 }))}
                    disabled={!canPlay}
                    className={`rounded-md px-3 py-1 font-mono text-xs uppercase tracking-widest transition ${
                      pred === 0 ? "bg-neon-magenta/20 text-neon-magenta" : "text-white/40 hover:text-white/70"
                    } disabled:opacity-40`}
                  >
                    ▼ Down
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => commit(r)}
                    disabled={!canPlay || st === "committing" || st === "committed" || st === "revealed"}
                    className="btn-neon px-3 py-1 font-mono text-[11px] uppercase tracking-widest disabled:opacity-40"
                  >
                    {st === "committing" ? "…" : "Commit"}
                  </button>
                  <button
                    onClick={() => reveal(r)}
                    disabled={!canPlay || st === "revealing" || st === "revealed" || st === "idle"}
                    className="btn-magenta px-3 py-1 font-mono text-[11px] uppercase tracking-widest disabled:opacity-40"
                  >
                    {st === "revealing" ? "…" : st === "revealed" ? "✓" : "Reveal"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {banner && <p className="mt-3 font-mono text-[11px] text-white/45">{banner}</p>}
      </div>
    </section>
  );
}
