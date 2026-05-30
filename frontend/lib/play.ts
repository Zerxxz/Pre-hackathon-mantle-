import { encodeAbiParameters, encodePacked, keccak256 } from "viem";

/** Prediction: 1 = UP, 0 = DOWN. */
export type Prediction = 0 | 1;

/** Encode a prediction as the on-chain action bytes (matches the contract). */
export function encodeAction(pred: Prediction): `0x${string}` {
  return encodeAbiParameters([{ type: "uint8" }], [pred]);
}

/** Fresh 32-byte salt for commit-reveal. */
export function randomSalt(): `0x${string}` {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return ("0x" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")) as `0x${string}`;
}

/** commitment = keccak256(abi.encodePacked(action, salt)) — must match MatchManager. */
export function commitmentOf(action: `0x${string}`, salt: `0x${string}`): `0x${string}` {
  return keccak256(encodePacked(["bytes", "bytes32"], [action, salt]));
}

/** localStorage key so a reveal can recover the salt + prediction after a refresh. */
export function saltKey(matchId: number, round: number, addr: string): string {
  return `agon:commit:${matchId}:${round}:${addr.toLowerCase()}`;
}
