/**
 * AGON reference agent runtime.
 *
 * Per match the agent is part of:
 *   1. COMMIT — for each round: read the price feed, decide() an action, then
 *      commit keccak256(action, salt) on-chain (signed by the AGENT key).
 *   2. WAIT  — until the commit window closes (so nobody can copy a move).
 *   3. REVEAL — reveal (action, salt) for each round.
 *
 * Modes:
 *   - one-shot: set MATCH_ID to play a single existing match (great for demos).
 *   - watch:    otherwise, subscribe to MatchCreated and play matches we're in.
 */
import { getConfig, type AgonConfig } from "./config.js";
import { matchManagerAbi } from "./abi.js";
import { decide, type MatchState } from "./policy.js";
import { getPriceSeries } from "./feed.js";
import {
  amIPlayer,
  commitmentOf,
  encodeAction,
  randomSalt,
  readMatch,
  sendCommit,
  sendReveal,
} from "./match.js";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Plan {
  round: number;
  action: `0x${string}`;
  salt: `0x${string}`;
  pred: 0 | 1;
}

async function chainNow(cfg: AgonConfig): Promise<bigint> {
  const block = await cfg.publicClient.getBlock();
  return block.timestamp;
}

async function waitForCommitClose(cfg: AgonConfig, deadline: bigint) {
  while ((await chainNow(cfg)) <= deadline) {
    console.log("[agent] waiting for commit window to close…");
    await sleep(5000);
  }
}

export async function playMatch(cfg: AgonConfig, matchId: bigint) {
  if (!(await amIPlayer(cfg, matchId))) {
    console.log(`[agent] not a player in match ${matchId}; skipping.`);
    return;
  }

  const info = await readMatch(cfg, matchId);
  console.log(`[agent] playing match ${matchId} — ${info.rounds} rounds`);

  // --- 1. COMMIT every round ---
  const plans: Plan[] = [];
  for (let round = 0; round < info.rounds; round++) {
    const priceSeries = await getPriceSeries(matchId, round);
    const state: MatchState = { matchId, round, priceSeries };
    const pred = decide(state);
    const action = encodeAction(pred);
    const salt = randomSalt();
    const commitment = commitmentOf(action, salt);

    const tx = await sendCommit(cfg, matchId, round, commitment);
    console.log(`[agent] round ${round}: committed pred=${pred} (tx ${tx})`);
    plans.push({ round, action, salt, pred });
  }

  // --- 2. WAIT for the commit window to close ---
  await waitForCommitClose(cfg, info.commitDeadline);

  // --- 3. REVEAL every round ---
  for (const p of plans) {
    const tx = await sendReveal(cfg, matchId, p.round, p.action, p.salt);
    console.log(`[agent] round ${p.round}: revealed pred=${p.pred} (tx ${tx})`);
  }

  console.log(`[agent] done with match ${matchId}.`);
}

async function watch(cfg: AgonConfig) {
  console.log(`[agent] watching MatchCreated on ${cfg.matchManager} as ${cfg.account.address}`);
  cfg.publicClient.watchContractEvent({
    address: cfg.matchManager,
    abi: matchManagerAbi,
    eventName: "MatchCreated",
    onLogs: (logs) => {
      for (const log of logs) {
        const matchId = (log as unknown as { args: { matchId: bigint } }).args.matchId;
        console.log(`[agent] saw MatchCreated #${matchId}`);
        playMatch(cfg, matchId).catch((e) => console.error("[agent] play error:", e));
      }
    },
  });
}

async function main() {
  const cfg = getConfig();
  const oneShot = process.env.MATCH_ID;
  if (oneShot) {
    await playMatch(cfg, BigInt(oneShot));
  } else {
    await watch(cfg);
    // keep the process alive for the event subscription
    await new Promise(() => {});
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
