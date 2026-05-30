/**
 * AGON Orchestrator — the referee that runs one full match end-to-end:
 *   1. CREATE  — seal each player's nature, createMatch() on-chain.
 *   2. ANNOUNCE— print the canonical price series so agents/humans can play.
 *   3. WAIT    — through the commit + reveal windows.
 *   4. SETTLE  — submit outcomes + revealed natures; the contract scores the
 *                game, resolves the "Human or AI?" market and updates the
 *                leaderboard (via its wired hooks).
 *
 * Run the agent (agent/) and have a human play during the commit window, then
 * this process settles automatically.
 */
import { encodePacked, keccak256 } from "viem";
import { getConfig, type OrchestratorConfig } from "./config.js";
import { matchManagerAbi, NATURE } from "./abi.js";
import { canonicalSeries, outcomesOf } from "./feed.js";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function natureValue(n: string): number {
  if (n === "ai") return NATURE.ai;
  if (n === "human") return NATURE.human;
  throw new Error(`Unknown nature "${n}" (use AI or Human)`);
}

function randomSalt(): `0x${string}` {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return ("0x" + Buffer.from(bytes).toString("hex")) as `0x${string}`;
}

function sealNature(natureVal: number, salt: `0x${string}`): `0x${string}` {
  return keccak256(encodePacked(["uint8", "bytes32"], [natureVal, salt]));
}

async function main() {
  const cfg: OrchestratorConfig = getConfig();
  const natureVals = cfg.natures.map(natureValue);
  const salts = cfg.players.map(() => randomSalt());
  const sealed = natureVals.map((v, i) => sealNature(v, salts[i]));

  // matchId that will be assigned (createMatch does `matchId = nextMatchId++`).
  const matchId = (await cfg.publicClient.readContract({
    address: cfg.matchManager,
    abi: matchManagerAbi,
    functionName: "nextMatchId",
  })) as bigint;

  console.log(`[orchestrator] creating match #${matchId} with ${cfg.players.length} players…`);
  const createTx = await cfg.walletClient.writeContract({
    address: cfg.matchManager,
    abi: matchManagerAbi,
    functionName: "createMatch",
    args: [cfg.players, cfg.leaderboardIds, sealed, cfg.rounds, cfg.commitWindow, cfg.revealWindow],
  });
  await cfg.publicClient.waitForTransactionReceipt({ hash: createTx });
  console.log(`[orchestrator] match #${matchId} created (tx ${createTx})`);

  // Announce the canonical environment so players can decide.
  const series = canonicalSeries(cfg.rounds);
  console.log(`[orchestrator] canonical price series: [${series.join(", ")}]`);
  console.log(`[orchestrator] players should now COMMIT (window ${cfg.commitWindow}s) then REVEAL.`);

  // Wait through commit + reveal windows (+ small buffer).
  const waitMs = (Number(cfg.commitWindow) + Number(cfg.revealWindow) + 8) * 1000;
  console.log(`[orchestrator] waiting ~${Math.round(waitMs / 1000)}s for commit + reveal…`);
  await sleep(waitMs);

  // Settle: outcomes from the canonical series + revealed natures.
  const outcomes = outcomesOf(series);
  console.log(`[orchestrator] settling match #${matchId} with outcomes [${outcomes.join(", ")}]…`);
  const settleTx = await cfg.walletClient.writeContract({
    address: cfg.matchManager,
    abi: matchManagerAbi,
    functionName: "settle",
    args: [matchId, outcomes, natureVals, salts],
  });
  await cfg.publicClient.waitForTransactionReceipt({ hash: settleTx });
  console.log(`[orchestrator] settled (tx ${settleTx}). Scores + market + leaderboard updated.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
