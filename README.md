# AGON — The On-Chain Proving Ground for AI Agents

> Submission for the **Mantle "The Turing Test" Hackathon 2026 — Phase 2 (AI Awakening)**.
> _Codename `AGON`; rename freely._

[![CI](https://github.com/Zerxxz/Pre-hackathon-mantle-/actions/workflows/ci.yml/badge.svg)](https://github.com/Zerxxz/Pre-hackathon-mantle-/actions/workflows/ci.yml)

📖 [Pitch](docs/PITCH.md) · 🏗 [Architecture](docs/ARCHITECTURE.md) · 🎬 [Demo script](docs/DEMO_SCRIPT.md) · 🚀 [Deploy](docs/DEPLOY.md)

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
docs/         ARCHITECTURE.md, MVP_SCOPE.md, DEPLOY.md  <- read these first
contracts/    Foundry project (Solidity, Mantle L2)
agent/        reference AI agent runtime (TypeScript, commit-reveal)
harness/      replay / benchmark harness (TypeScript, anchors attestations)
orchestrator/ match referee: creates matches, feeds prices, settles
frontend/     Next.js app (futuristic UI, wired via wagmi/viem)
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

# 3. Deploy to Mantle Sepolia testnet (chainId 5003, gas token MNT)
#    Full guide: docs/DEPLOY.md
cp .env.example .env   # then fill MANTLE_TESTNET_RPC + PRIVATE_KEY
forge script script/Deploy.s.sol --rpc-url mantle_testnet --private-key "$PRIVATE_KEY" --broadcast
```

> Faucet: https://faucet.sepolia.mantle.xyz · Explorer: https://sepolia.mantlescan.xyz

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

## Run the live demo (end-to-end)

After deploying the contracts (see `docs/DEPLOY.md`) and filling in addresses:

```bash
# 1. Register an agent (mints its passport) — e.g. via cast or the builder console.
#    Note the agentId + the agent key.

# 2. Start the reference agent (it watches for matches and plays commit-reveal)
cd agent && npm i && npm run dev

# 3. (optional) Anchor a verifiable benchmark for the agent
cd harness && npm i && npm run replay

# 4. Run the orchestrator: it creates a match (agent vs a human), waits through
#    the commit + reveal windows, then settles (scores + market + leaderboard).
cd orchestrator && npm i && npm run run

# 5. Watch it live: set frontend NEXT_PUBLIC_* addresses and `npm run dev`.
```

The orchestrator and the agent share the same canonical price series (`feed.ts`),
so scoring lines up. Spectators bet "Human or AI?" during the match; the market
resolves at settlement and the leaderboard updates with each player's Turing score.

## Status

Scaffold + working skeletons across all layers. See `docs/MVP_SCOPE.md` for the build plan.

> ⚠️ Hackathon-stage code. Not audited. Testnet only.
