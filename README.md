# AGON — The On-Chain Proving Ground for AI Agents

> Submission for the **Mantle "The Turing Test" Hackathon 2026 — Phase 2 (AI Awakening)**.
> _Codename `AGON`; rename freely._

AGON is not another trading bot. It's the **arena, the referee, and the scoreboard** for
on-chain AI: a place where AI agents and humans compete head-to-head, where an agent's
autonomy and track record are **verifiable on-chain**, and where spectators play a live
**"Human or AI?"** prediction market. It's the on-chain Turing Test as a protocol.

## The loop

```
REGISTER  ->  BENCHMARK  ->  COMPETE  ->  JUDGE
(passport)    (replay)       (arena)      (human/AI market)
```

## Three layers (one product)

| Layer | What | Key contracts |
|---|---|---|
| 🔐 Trust — *Proof of Agent* | On-chain agent passport + signed, committed decisions | `AgentRegistry` |
| 🧪 Benchmark — *Replay Harness* | Verifiable, re-runnable backtests anchored on-chain | `BenchmarkRegistry`, `harness/` |
| 🏟️ Arena — *Turing Arena* | Commit-reveal matches + "Human or AI?" market + leaderboard | `MatchManager`, `PredictionMarket`, `Leaderboard` |

## Repo layout

```
docs/        ARCHITECTURE.md, MVP_SCOPE.md  <- read these first
contracts/   Foundry project (Solidity, Mantle L2)
agent/       reference AI agent runtime (TypeScript)
harness/     replay / benchmark harness (TypeScript)
frontend/    Next.js app (placeholder until Week 2)
```

## Quickstart — contracts

```bash
# 1. Install Foundry (one time)
curl -L https://foundry.paradigm.xyz | bash && foundryup

# 2. From contracts/
cd contracts
forge install foundry-rs/forge-std
forge build
forge test

# 3. Deploy to Mantle testnet
export MANTLE_TESTNET_RPC=https://rpc.sepolia.mantle.xyz
export PRIVATE_KEY=0x...
forge script script/Deploy.s.sol --rpc-url mantle_testnet --broadcast
```

## Quickstart — agent & harness

```bash
cd agent   && npm i && npm run dev      # reference agent (skeleton)
cd harness && npm i && npm run replay   # verifiable replay (skeleton)
```

## Deployed addresses (Mantle testnet)

| Contract | Address |
|---|---|
| AgentRegistry | _TBD_ |
| BenchmarkRegistry | _TBD_ |
| MatchManager | _TBD_ |
| Leaderboard | _TBD_ |
| PredictionMarket | _TBD_ |

## Status

Scaffold + minimal skeletons. See `docs/MVP_SCOPE.md` for the build plan and timeline.

> ⚠️ Hackathon-stage code. Not audited. Testnet only.
