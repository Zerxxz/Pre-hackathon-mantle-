"use client";

import { usePublicClient } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { formatEther } from "viem";
import { addresses, isConfigured } from "./contracts";
import { agentRegistryAbi, leaderboardAbi, matchManagerAbi, predictionMarketAbi } from "./abis";
import { mockLeaderboard, mockMatch, mockStats } from "./mock";
import type { Competitor, LeaderEntry, LiveMatch, Stats } from "./types";

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

interface AgonData {
  stats: Stats;
  match: LiveMatch;
  leaderboard: LeaderEntry[];
}

type PublicClient = NonNullable<ReturnType<typeof usePublicClient>>;

async function fetchAgon(client: PublicClient): Promise<AgonData & { hasMatch: boolean }> {
  const mm = addresses.matchManager!;
  const reg = addresses.agentRegistry!;

  const [nextAgentId, nextMatchId] = (await Promise.all([
    client.readContract({ address: reg, abi: agentRegistryAbi, functionName: "nextAgentId" }),
    client.readContract({ address: mm, abi: matchManagerAbi, functionName: "nextMatchId" }),
  ])) as [bigint, bigint];

  // --- latest match + market pools ---
  let match: LiveMatch = mockMatch;
  let mntStaked = 0;
  const latestId = nextMatchId - 1n;

  if (latestId >= 1n) {
    const [info, players] = (await Promise.all([
      client.readContract({ address: mm, abi: matchManagerAbi, functionName: "matches", args: [latestId] }),
      client.readContract({ address: mm, abi: matchManagerAbi, functionName: "getPlayers", args: [latestId] }),
    ])) as [readonly [string, bigint, bigint, number, number], readonly string[]];

    const competitors: Competitor[] = [];
    for (const p of players) {
      let ai = 0;
      let human = 0;
      if (addresses.predictionMarket) {
        const [aiS, huS] = (await client.readContract({
          address: addresses.predictionMarket,
          abi: predictionMarketAbi,
          functionName: "poolStakes",
          args: [latestId, p as `0x${string}`],
        })) as readonly [bigint, bigint];
        ai = Number(formatEther(aiS));
        human = Number(formatEther(huS));
      }
      mntStaked += ai + human;
      competitors.push({ id: p, handle: short(p), nature: "AI", aiStake: ai, humanStake: human });
    }

    const phaseNum = info[4];
    const phase = phaseNum === 3 ? "Settled" : phaseNum === 2 ? "Reveal" : "Commit";
    match = {
      matchId: Number(latestId),
      rounds: info[3] || 5,
      currentRound: 1,
      phase,
      competitors: competitors.length ? competitors : mockMatch.competitors,
    };
  }

  // --- leaderboard from ScoreUpdated events (best-effort) ---
  let leaderboard: LeaderEntry[] = mockLeaderboard;
  if (addresses.leaderboard) {
    try {
      const logs = await client.getContractEvents({
        address: addresses.leaderboard,
        abi: leaderboardAbi,
        eventName: "ScoreUpdated",
        fromBlock: "earliest",
      });
      const latestById = new Map<string, { perf: bigint; turing: bigint; n: number }>();
      for (const l of logs) {
        const a = (l as unknown as { args: { id: bigint; performanceScore: bigint; turingScore: bigint } }).args;
        const prev = latestById.get(a.id.toString());
        latestById.set(a.id.toString(), {
          perf: a.performanceScore,
          turing: a.turingScore,
          n: (prev?.n ?? 0) + 1,
        });
      }
      const rows = [...latestById.entries()]
        .map(([id, v]) => ({ id: BigInt(id), ...v }))
        .sort((a, b) => Number(b.perf - a.perf))
        .slice(0, 8)
        .map((e, i) => ({
          rank: i + 1,
          agentId: Number(e.id),
          handle: `#${e.id.toString()}`,
          // TODO: nature isn't stored on-chain (it's per-match); heuristic for now.
          nature: e.id < 1000n ? ("AI" as const) : ("Human" as const),
          performance: Number(e.perf),
          turing: Number(e.turing),
          matches: e.n,
        }));
      if (rows.length) leaderboard = rows;
    } catch {
      leaderboard = mockLeaderboard;
    }
  }

  const avgTuring = leaderboard.length
    ? Math.round(leaderboard.reduce((s, e) => s + e.turing, 0) / leaderboard.length)
    : 0;

  const stats: Stats = {
    agentsRegistered: Math.max(0, Number(nextAgentId) - 1),
    matchesPlayed: Math.max(0, Number(nextMatchId) - 1),
    mntStaked: Math.round(mntStaked),
    turingFooledRate: avgTuring,
  };

  return { stats, match, leaderboard, hasMatch: latestId >= 1n };
}

/** Live on-chain data when contracts are configured; otherwise mock data. */
export function useAgonData(): AgonData & { isLive: boolean; hasMatch: boolean } {
  const client = usePublicClient();
  const query = useQuery({
    queryKey: ["agon-data"],
    enabled: isConfigured && !!client,
    refetchInterval: 5000,
    queryFn: () => fetchAgon(client as PublicClient),
  });

  if (!isConfigured || !query.data) {
    return { stats: mockStats, match: mockMatch, leaderboard: mockLeaderboard, isLive: false, hasMatch: false };
  }
  return { ...query.data, isLive: true };
}
