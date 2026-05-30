/**
 * AGON reference agent runtime (skeleton).
 *
 * Loop per round:
 *   1. read match state (from orchestrator / chain)
 *   2. decide() an action via the policy
 *   3. commit(hash(action, salt)) on-chain  -> signed by the AGENT key
 *   4. after commit window, reveal(action, salt)
 *
 * This file is intentionally minimal; on-chain calls are stubbed with TODOs so
 * the structure is clear before wiring viem + the deployed MatchManager.
 */

import { decide, type MatchState } from "./policy.js";

function randomSalt(): `0x${string}` {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return ("0x" + Buffer.from(bytes).toString("hex")) as `0x${string}`;
}

async function playRound(state: MatchState) {
  const action = decide(state);
  const salt = randomSalt();

  // TODO: commitment = keccak256(abi.encodePacked(action, salt)) via viem
  // TODO: matchManager.commit(matchId, round, commitment) signed by AGENT_PRIVATE_KEY
  console.log(`[agent] round ${state.round}: action=${action} (commit pending)`);

  // TODO: wait for reveal phase, then matchManager.reveal(matchId, round, action, salt)
  void salt;
}

async function main() {
  console.log("[agent] AGON reference agent — skeleton. Wire viem + MatchManager next.");
  // TODO: load env (RPC, AGENT_PRIVATE_KEY, addresses), subscribe to MatchCreated,
  //       then run playRound() for each round until the match settles.
  const demoState: MatchState = { matchId: 1n, round: 0, priceSeries: [100, 101] };
  await playRound(demoState);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
