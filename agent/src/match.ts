import { encodeAbiParameters, encodePacked, keccak256 } from "viem";
import type { AgonConfig } from "./config.js";
import { matchManagerAbi } from "./abi.js";
import type { Action } from "./policy.js";

/** Encode a prediction (1 = UP, 0 = DOWN) as the on-chain action bytes. */
export function encodeAction(pred: Action): `0x${string}` {
  return encodeAbiParameters([{ type: "uint8" }], [pred]);
}

/** A fresh 32-byte salt for the commit-reveal scheme. */
export function randomSalt(): `0x${string}` {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return ("0x" + Buffer.from(bytes).toString("hex")) as `0x${string}`;
}

/**
 * commitment = keccak256(abi.encodePacked(action, salt))
 * Must match MatchManager.reveal()'s check exactly.
 */
export function commitmentOf(action: `0x${string}`, salt: `0x${string}`): `0x${string}` {
  return keccak256(encodePacked(["bytes", "bytes32"], [action, salt]));
}

export interface MatchInfo {
  orchestrator: `0x${string}`;
  commitDeadline: bigint;
  revealDeadline: bigint;
  rounds: number;
  phase: number; // 0 None, 1 Commit, 2 Reveal, 3 Settled
}

export async function readMatch(cfg: AgonConfig, matchId: bigint): Promise<MatchInfo> {
  const r = (await cfg.publicClient.readContract({
    address: cfg.matchManager,
    abi: matchManagerAbi,
    functionName: "matches",
    args: [matchId],
  })) as readonly [`0x${string}`, bigint, bigint, number, number];

  return {
    orchestrator: r[0],
    commitDeadline: r[1],
    revealDeadline: r[2],
    rounds: r[3],
    phase: r[4],
  };
}

export async function amIPlayer(cfg: AgonConfig, matchId: bigint): Promise<boolean> {
  return (await cfg.publicClient.readContract({
    address: cfg.matchManager,
    abi: matchManagerAbi,
    functionName: "isPlayer",
    args: [matchId, cfg.account.address],
  })) as boolean;
}

export async function sendCommit(
  cfg: AgonConfig,
  matchId: bigint,
  round: number,
  commitment: `0x${string}`,
): Promise<`0x${string}`> {
  return cfg.walletClient.writeContract({
    address: cfg.matchManager,
    abi: matchManagerAbi,
    functionName: "commit",
    args: [matchId, round, commitment],
  });
}

export async function sendReveal(
  cfg: AgonConfig,
  matchId: bigint,
  round: number,
  action: `0x${string}`,
  salt: `0x${string}`,
): Promise<`0x${string}`> {
  return cfg.walletClient.writeContract({
    address: cfg.matchManager,
    abi: matchManagerAbi,
    functionName: "reveal",
    args: [matchId, round, action, salt],
  });
}
