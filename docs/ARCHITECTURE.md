# AGON — The On-Chain Proving Ground for AI Agents

> Technical Architecture Document — v0.1
> Project for **Mantle "The Turing Test" Hackathon 2026 — Phase 2 (AI Awakening)**
>
> _Codename `AGON` (Greek: "contest / arena" — root of antagonist). Name is a placeholder, swap freely._

---

## 1. Vision & Problem Statement

Mantle's hackathon thesis: it is the **first time an on-chain environment is used to benchmark AI agent performance at scale**, where every key decision is recorded permanently on-chain, with a **"Human vs AI"** mechanism.

The problem nobody is solving (because everyone is busy building *contestants*):

1. **Identity** — How do you prove a wallet's actions were actually decided by an autonomous AI model, and not a human steering it manually? (Anti-impersonation — the literal Turing problem.)
2. **Track record** — How do you trust an agent's claimed performance without it cheating via overfitting, hindsight, or survivorship bias?
3. **Fair competition** — Where do agents and humans actually compete head-to-head, transparently, with outcomes anyone can verify?

**AGON is the infrastructure that answers all three.** We are not building an agent. We are building the **arena, the referee, and the scoreboard** — the standard every other team's agent could plug into.

### Why this wins
- **On-theme 100%:** It *is* the on-chain Turing Test, not just another bot.
- **Ecosystem contribution:** Reusable identity standard + benchmark attestations + open dataset of human-vs-AI behavioral fingerprints.
- **Multi-track reach:** AI DevTools + Agentic Wallets + Consumer/Viral + Grand Prize.
- **Defensible moat:** A platform/standard, not a feature.

---

## 2. The Three Layers (one product, not three)

```
                         ┌─────────────────────────────────────────────┐
                         │                  AGON                        │
                         │      On-Chain Proving Ground for Agents       │
                         └─────────────────────────────────────────────┘

  ┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
  │   TRUST LAYER         │   │  BENCHMARK LAYER      │   │   ARENA LAYER         │
  │  "Proof of Agent"     │──▶│  "Replay Harness /    │──▶│  "Turing Arena"       │
  │  (Idea 2)             │   │   Agent CI" (Idea 3)  │   │  (Idea 1)             │
  ├──────────────────────┤   ├──────────────────────┤   ├──────────────────────┤
  │ • Agent passport NFT  │   │ • Fork Mantle state   │   │ • Live matches        │
  │ • model+policy hash   │   │ • Deterministic replay│   │ • commit-reveal moves │
  │ • signed decisions    │   │ • Verified perf.      │   │ • Human-vs-AI market  │
  │ • TEE attest (stretch)│   │   attestation (EAS)   │   │ • Leaderboard + Turing│
  │                       │   │ • anti-overfit proof  │   │   score               │
  └──────────────────────┘   └──────────────────────┘   └──────────────────────┘
        (identity)                 (track record)               (competition)
```

**The single user loop:** `REGISTER → BENCHMARK → COMPETE → JUDGE`.

---

## 3. End-to-End Data Flow

```
  Builder                AGON Off-chain            Mantle (on-chain)            Spectator
    │                          │                          │                        │
 1. │ register agent ─────────▶│                          │                        │
    │   (model hash, policy)   │── AgentRegistry.register ▶│  mint Agent Passport   │
    │                          │                          │  (identity + hashes)   │
    │                          │                          │                        │
 2. │ run benchmark ──────────▶│ Replay Harness:          │                        │
    │                          │  fork state + replay      │                        │
    │                          │  produce signed report ──▶│  EAS perf. attestation │
    │                          │                          │  (verifiable backtest) │
    │                          │                          │                        │
 3. │ enter arena ────────────▶│ Match engine starts round │  Match.open()          │
    │                          │ agent computes action     │                        │
    │   commit(hash(action)) ──┼──────────────────────────▶│  commit-reveal store   │
    │   reveal(action, salt) ──┼──────────────────────────▶│  verify + score        │
    │                          │                          │                        │
 4. │                          │                          │  PredictionMarket  ◀───┤ stake MNT:
    │                          │                          │  resolve human/AI      │ "human or AI?"
    │                          │                          │  Leaderboard.update()  │
    │                          │◀── Indexer / subgraph ────│                        │
    │                          │    feeds dashboard        │                        │
```

---

## 4. Component Architecture

### 4.1 On-chain (Solidity, Mantle L2 — EVM)

| Contract | Responsibility | Key state |
|---|---|---|
| `AgentRegistry` | Mint **Agent Passport** (ERC-721). Stores `modelHash`, `policyHash`, controller addr, attestation method (signed / TEE). | `mapping(uint256 agentId => AgentInfo)` |
| `DecisionLog` | Append-only commit-reveal of agent/human actions per match. Prevents look-ahead cheating. | `commit[matchId][player]`, `reveal[...]` |
| `BenchmarkRegistry` | Anchors verified performance attestations (UID from EAS) to an agent. Read by Arena as eligibility gate. | `mapping(agentId => benchmarkUID[])` |
| `Match` (factory: `Coliseum`) | Lifecycle of a single contest: open → commit → reveal → settle. Computes per-round score from revealed actions + environment outcome. | `players`, `rounds`, `scores`, `status` |
| `PredictionMarket` | Spectators stake MNT on "is player X human or AI?". Resolves against ground truth revealed at settlement. Pays winners. | `bets[matchId][player]`, `pool` |
| `Leaderboard` | Aggregates: performance score + **Turing Score** (how often a player fooled the market). Global + per-track. | `ranking[]`, `turingScore[agentId]` |
| `AttestationVerifier` (lib) | Verifies signed decisions; pluggable TEE/zk verifier interface for future. | — |

> Standardization play: publish `AgentRegistry` + attestation schema as a draft **"ERC-Agent-Identity"** so other teams can adopt it.

### 4.2 Off-chain services

| Service | Stack | Responsibility |
|---|---|---|
| **Agent Runtime** | TS/Python + Coinbase AgentKit / ElizaOS / GOAT SDK | Reference agent. Receives match state, calls LLM/policy, signs + commits action. |
| **Replay Harness** | Foundry `anvil --fork` + script runner | Fork Mantle at block N, feed historical environment to an agent deterministically, score it, output a signed performance report. |
| **Attestor** | Node service + EAS SDK | Wraps replay output into an EAS attestation; (stretch) runs inside TEE (Phala/Marlin) to attest the inference itself. |
| **Indexer** | Subgraph / Ponder | Indexes contract events → powers dashboard + leaderboard in real time. |
| **Match Orchestrator** | Node service | Drives round timing, environment generation (price feed / game state), nudges players to commit/reveal. |

### 4.3 Frontend

| Surface | Stack | Purpose |
|---|---|---|
| **Arena dashboard** | Next.js + wagmi/viem + RainbowKit | Live matches, leaderboard, Turing score. |
| **"Human or AI?" betting UI** | same | Spectator stakes MNT, sees odds, claims winnings. The viral hook. |
| **Builder console** | same | Register agent, run benchmark, view performance attestations. |
| **Human play UI** | same | Lets a human play a match (so humans truly compete vs agents). |

---

## 5. Layer Deep-Dives

### 5.1 Trust Layer — "Proof of Agent"
**Goal:** Make an agent's autonomy *verifiable*, so a human can't quietly impersonate an AI (the core Turing problem).

Trust model, in increasing strength (ship v1, roadmap the rest):
1. **v1 — Signed decisions + committed code:** Agent has its own key. `modelHash` + `policyHash` committed at registration. Every action signed by the agent key, never the human controller. Commit-reveal makes actions tamper-evident and prevents look-ahead.
2. **v2 (stretch) — TEE attestation:** Agent runs in a trusted enclave (Phala/Marlin). The enclave attests "this output came from model X on input Y." Posted on-chain.
3. **v3 (roadmap) — zkML:** Zero-knowledge proof of inference. Mention as vision; do **not** build for hackathon (too slow/heavy).

> Honest framing for judges: "We make autonomy *progressively* verifiable. v1 is shipping today; TEE is demoed; zkML is the north star."

### 5.2 Benchmark Layer — "Replay Harness / Agent CI"
**Goal:** A track record that cannot be faked (anti overfit / hindsight / survivorship bias).

- **Deterministic replay:** `anvil --fork` Mantle at a start block; replay a fixed historical window of environment data; the agent must act on each step **without seeing the future**.
- **Verifiable report:** Harness outputs metrics (PnL, hit-rate, drawdown, decision latency) + the input window hash + agent commit hash, wrapped as an **EAS attestation** anchored in `BenchmarkRegistry`.
- **Anti-cheat:** Because the input window + agent hash are committed, a claimed result can be **independently re-run** and checked. No "trust me bro" backtests.
- **Arena gate:** Arena can require a valid benchmark attestation before an agent may enter (quality bar).

### 5.3 Arena Layer — "Turing Arena"
**Goal:** Head-to-head human-vs-AI competition + the viral "spot the bot" market.

- **Environment (MVP):** one short-round game. Recommended: a **price-prediction / micro-trading sim** driven by real Mantle data (each round: predict next move / allocate). Simple, fast, fair for both humans and agents.
- **Commit-reveal rounds:** players commit `hash(action, salt)` then reveal — prevents copying and look-ahead.
- **Prediction market:** spectators stake MNT guessing each player's nature. Ground truth (human/AI) is sealed at match start, revealed at settlement → market resolves and pays.
- **Scores:**
  - *Performance score* — how well they played the game.
  - *Turing score* — how often the market guessed them **wrong** (an AI that fools spectators = high Turing score; a human mistaken for AI also scores).
- **Leaderboard:** ranks both, per-track and global. This is the "benchmark at scale" Mantle wants.

---

## 6. On-chain vs Off-chain — the "why on-chain" matrix

| Concern | Where | Why |
|---|---|---|
| Agent identity & hashes | **On-chain** | Immutable, public, the permanent record Mantle wants. |
| Action commit-reveal | **On-chain** | Tamper-evidence + anti look-ahead is the whole point. |
| Performance attestation (UID) | **On-chain** (EAS) | Verifiable, portable track record. |
| Prediction market stakes/payouts | **On-chain** | Real value, trustless settlement. |
| Leaderboard / Turing score | **On-chain** (computed) + indexed for display | "Permanent record of decisions & outcomes." |
| LLM inference | **Off-chain** | Too heavy; attested via signature/TEE instead. |
| Raw environment data / replay compute | **Off-chain** | Heavy; only hashes + results anchored on-chain. |

This matrix is the answer to "why isn't this just a database?" — every on-chain piece is there because it needs **trustlessness or permanence**, not for buzzword reasons.

---

## 7. Tech Stack

- **Chain:** Mantle (EVM L2 — testnet for the hackathon).
- **Contracts:** Solidity + **Foundry** (forge/anvil/cast). OpenZeppelin for ERC-721/access control.
- **Attestations:** Ethereum Attestation Service (EAS) SDK + custom schema.
- **Account abstraction (Agentic Wallets track):** ERC-4337 + session keys for agent wallets.
- **Agent framework:** Coinbase AgentKit or ElizaOS or GOAT SDK (pick one reference).
- **Verifiable compute (stretch):** Phala / Marlin TEE.
- **Indexer:** Ponder or a Subgraph.
- **Frontend:** Next.js + TypeScript + viem/wagmi + RainbowKit + Tailwind.
- **Off-chain services:** Node.js/TypeScript (orchestrator, attestor, harness runner).

---

## 8. Smart Contract Interface Sketch (illustrative, not final)

```solidity
// Trust Layer
interface IAgentRegistry {
  event AgentRegistered(uint256 indexed agentId, address indexed controller, bytes32 modelHash);
  function register(bytes32 modelHash, bytes32 policyHash, address agentKey, uint8 attestMethod)
      external returns (uint256 agentId);
  function agentKeyOf(uint256 agentId) external view returns (address);
}

// Benchmark Layer
interface IBenchmarkRegistry {
  event BenchmarkAnchored(uint256 indexed agentId, bytes32 attestationUID, bytes32 inputWindowHash);
  function anchor(uint256 agentId, bytes32 attestationUID, bytes32 inputWindowHash) external;
  function isQualified(uint256 agentId) external view returns (bool);
}

// Arena Layer
interface IMatch {
  enum Status { Open, Commit, Reveal, Settled }
  event Committed(uint256 indexed matchId, address indexed player, uint256 round, bytes32 commitment);
  event Revealed(uint256 indexed matchId, address indexed player, uint256 round, bytes action);
  function commit(uint256 round, bytes32 commitment) external;
  function reveal(uint256 round, bytes calldata action, bytes32 salt) external;
  function settle(uint256 matchId) external; // scores + resolves prediction market
}

interface IPredictionMarket {
  function bet(uint256 matchId, address player, bool guessIsAI) external payable;
  function claim(uint256 matchId) external;
}
```

---

## 9. Threat Model (the "Turing" guarantees)

| Attack | Mitigation |
|---|---|
| Human pretends to be an AI agent | Agent key signs actions; modelHash committed; (v2) TEE attests inference origin. |
| Look-ahead / copying opponent's move | Commit-reveal per round. |
| Faked / overfit backtest | Replay harness re-runnable from committed input hash; attestation is independently verifiable. |
| Sybil agents farming leaderboard | Benchmark gate + (optional) registration stake/bond, slashing on detected fraud. |
| Market manipulation of human/AI bets | Ground truth sealed at start, revealed at settlement; commit-reveal on resolution data. |

---

## 10. Track & Judging Alignment

| Hackathon dimension | How AGON scores |
|---|---|
| **AI DevTools** | Replay Harness / Agent CI + Agent Identity standard = tooling every team needs. |
| **Agentic Wallets & Economy** | Agent passports + AA/session-key agent wallets + staked competition economy. |
| **Consumer & Viral DApps** | "Human or AI?" prediction market = shareable, viral, dead-simple to grasp. |
| **Innovation** | First on-chain Turing Test *protocol* (arena + referee + scoreboard), not a contestant. |
| **Technology** | commit-reveal, EAS attestations, deterministic fork-replay, (stretch) TEE. |
| **Ecosystem contribution** | Reusable identity ERC + open human-vs-AI behavioral dataset + benchmark standard. |

---

## 11. Open Questions / Risks (track in #2 scope)

1. **Scope creep is risk #1** — MVP must be a thin vertical slice through all 3 layers, not full builds.
2. **Pick ONE arena environment** for MVP (recommend micro price-prediction). Generalize later.
3. **Verifiable compute depth** — ship signed+commit-reveal (v1); TEE only if time allows.
4. **Mantle testnet specifics** — confirm RPC, faucet, EAS deployment availability; fallback to deploying our own EAS or a minimal attestation contract.
5. **Latency of rounds** — tune round timing so humans can realistically compete vs agents.

---

_Next: Deliverable #2 — MVP scope + realistic hackathon timeline (build-for-real vs mock, milestones, stretch goals)._
