"use client";

import { useState } from "react";
import { isAddress, keccak256, toBytes } from "viem";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { addresses } from "@/lib/contracts";
import { agentRegistryAbi, benchmarkRegistryAbi } from "@/lib/abis";

const EXPLORER = "https://sepolia.mantlescan.xyz/tx/";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-sm text-white outline-none transition focus:border-neon-cyan/60";

export function BuilderConsole() {
  const { isConnected } = useAccount();
  const registryReady = Boolean(addresses.agentRegistry);
  const benchReady = Boolean(addresses.benchmarkRegistry);

  // --- register agent ---
  const [model, setModel] = useState("gpt-quant-v1");
  const [policy, setPolicy] = useState("momentum-policy");
  const [agentKey, setAgentKey] = useState("");
  const [attest, setAttest] = useState(0);

  const { writeContract: register, data: regHash, isPending: registering, error: regError } =
    useWriteContract();
  const { isLoading: regConfirming, isSuccess: regDone } = useWaitForTransactionReceipt({ hash: regHash });

  const validKey = isAddress(agentKey);
  const onRegister = () => {
    register({
      address: addresses.agentRegistry!,
      abi: agentRegistryAbi,
      functionName: "register",
      args: [
        keccak256(toBytes(model || "model")),
        keccak256(toBytes(policy || "policy")),
        agentKey as `0x${string}`,
        attest,
      ],
    });
  };

  // --- benchmark ---
  const [agentId, setAgentId] = useState("1");
  const { data: benchCount } = useReadContract({
    address: addresses.benchmarkRegistry,
    abi: benchmarkRegistryAbi,
    functionName: "benchmarkCount",
    args: [BigInt(agentId || "0")],
    query: { enabled: benchReady && agentId !== "", refetchInterval: 5000 },
  });

  const { writeContract: anchor, data: anchorHash, isPending: anchoring } = useWriteContract();
  const { isLoading: anchorConfirming, isSuccess: anchorDone } = useWaitForTransactionReceipt({
    hash: anchorHash,
  });
  const onAnchor = () => {
    anchor({
      address: addresses.benchmarkRegistry!,
      abi: benchmarkRegistryAbi,
      functionName: "anchor",
      args: [BigInt(agentId || "0"), keccak256(toBytes(`uid-${agentId}`)), keccak256(toBytes("window"))],
    });
  };

  const gate = (ready: boolean) =>
    !ready ? "Set contract address to enable" : !isConnected ? "Connect wallet first" : null;

  return (
    <section id="builder">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="font-display text-2xl font-extrabold tracking-wider text-white">
          Builder Console
        </h2>
        <span className="chip text-neon-cyan/80">register · benchmark</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Register Agent */}
        <div className="glass p-5">
          <div className="font-display text-lg font-bold tracking-wide text-white">
            Register Agent
          </div>
          <p className="mt-1 text-sm text-white/50">
            Mint an on-chain passport. Model + policy are hashed (keccak256) before commit.
          </p>

          <div className="mt-4 space-y-3">
            <Field label="Model identifier">
              <input className={inputCls} value={model} onChange={(e) => setModel(e.target.value)} />
            </Field>
            <Field label="Policy identifier">
              <input className={inputCls} value={policy} onChange={(e) => setPolicy(e.target.value)} />
            </Field>
            <Field label="Agent key (signing address)">
              <input
                className={inputCls}
                placeholder="0x…"
                value={agentKey}
                onChange={(e) => setAgentKey(e.target.value)}
              />
            </Field>
            <Field label="Attestation method">
              <select
                className={inputCls}
                value={attest}
                onChange={(e) => setAttest(Number(e.target.value))}
              >
                <option value={0}>Signed key (v1)</option>
                <option value={1}>TEE (v2)</option>
                <option value={2}>zkML (v3)</option>
              </select>
            </Field>
          </div>

          <button
            onClick={onRegister}
            disabled={!registryReady || !isConnected || !validKey || registering || regConfirming}
            className="btn-neon mt-4 w-full py-2.5 font-mono text-xs uppercase tracking-widest disabled:opacity-40"
          >
            {registering || regConfirming ? "Registering…" : "Mint Passport"}
          </button>

          <div className="mt-2 min-h-[18px] font-mono text-[11px]">
            {gate(registryReady) && <span className="text-white/40">{gate(registryReady)}</span>}
            {isConnected && registryReady && !validKey && agentKey !== "" && (
              <span className="text-neon-magenta">Invalid agent key address</span>
            )}
            {regDone && (
              <a
                className="text-neon-lime"
                href={`${EXPLORER}${regHash}`}
                target="_blank"
                rel="noreferrer"
              >
                Passport minted ✓ — view tx
              </a>
            )}
            {regError && <span className="text-neon-magenta">Error — check console</span>}
          </div>
        </div>

        {/* Benchmark */}
        <div className="glass p-5">
          <div className="font-display text-lg font-bold tracking-wide text-white">Benchmark</div>
          <p className="mt-1 text-sm text-white/50">
            Verifiable replays are anchored by the harness (<span className="font-mono">npm run replay</span>).
            Check status or anchor a demo attestation.
          </p>

          <div className="mt-4 space-y-3">
            <Field label="Agent ID">
              <input className={inputCls} value={agentId} onChange={(e) => setAgentId(e.target.value)} />
            </Field>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
              <span className="font-mono text-[11px] uppercase tracking-widest text-white/45">
                Benchmarks anchored
              </span>
              <span className="font-display text-xl font-bold text-neon-cyan">
                {benchReady ? (benchCount !== undefined ? benchCount.toString() : "…") : "—"}
              </span>
            </div>
          </div>

          <button
            onClick={onAnchor}
            disabled={!benchReady || !isConnected || anchoring || anchorConfirming}
            className="btn-magenta mt-4 w-full py-2.5 font-mono text-xs uppercase tracking-widest disabled:opacity-40"
          >
            {anchoring || anchorConfirming ? "Anchoring…" : "Anchor demo benchmark"}
          </button>

          <div className="mt-2 min-h-[18px] font-mono text-[11px]">
            {gate(benchReady) && <span className="text-white/40">{gate(benchReady)}</span>}
            {anchorDone && (
              <a
                className="text-neon-lime"
                href={`${EXPLORER}${anchorHash}`}
                target="_blank"
                rel="noreferrer"
              >
                Benchmark anchored ✓ — view tx
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
