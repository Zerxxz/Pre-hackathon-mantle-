# AGON — MVP Scope & Hackathon Timeline

> Deliverable #2 — companion to `ARCHITECTURE.md`
> Window: **~30 May → 16 Jun 2026 (~2.5 weeks)**. Solo/small-team realistic plan.

---

## 0. The Golden Rule

> **Build a thin vertical slice through all 3 layers — not a full build of any single layer.**

The demo must show the *complete loop* `REGISTER → BENCHMARK → COMPETE → JUDGE` working end-to-end, even if each step is minimal. A complete loop beats one polished-but-isolated layer every time in judging.

**One-sentence MVP:**
> _A builder registers an AI agent (gets an on-chain passport), runs it through a verifiable replay benchmark, then enters it into a live arena where it plays a micro price-prediction game against a human — while spectators stake MNT guessing "human or AI", all settled on-chain on Mantle testnet._

---

## 1. MoSCoW — what's in the MVP

### ✅ MUST HAVE (the demo dies without these)
| # | Item | Layer |
|---|---|---|
| M1 | `AgentRegistry` — register agent, mint passport (ERC-721), store model/policy hash + agent key | Trust |
| M2 | One **reference AI agent** that plays the game (LLM or simple policy), signs its actions | Trust/Agent |
| M3 | `Match` contract — commit-reveal rounds, scoring, settlement | Arena |
| M4 | `PredictionMarket` — stake MNT on human/AI, resolve, claim | Arena |
| M5 | `Leaderboard` — performance score + Turing score (read on-chain, shown in UI) | Arena |
| M6 | **Replay Harness** — replay agent over a fixed historical window, output a performance report + anchor a benchmark attestation on-chain | Benchmark |
| M7 | Frontend: arena view + leaderboard + "Human or AI?" betting + builder register/benchmark page | All |
| M8 | Human play UI (so a real human competes vs the agent live in the demo) | Arena |
| M9 | Deployed to **Mantle testnet** + a 2–3 min demo video | All |

### 🟡 SHOULD HAVE (do if time allows, strengthens the pitch)
- S1 — `BenchmarkRegistry` gate: arena requires a valid benchmark before entry.
- S2 — Real EAS integration (vs a minimal custom attestation contract).
- S3 — Indexer (Ponder/subgraph) for snappy real-time leaderboard (vs direct RPC reads).
- S4 — Multiple agents + an agent-vs-agent match mode.
- S5 — ERC-4337 session-key wallet for the agent (Agentic Wallets track bonus).

### 🟢 COULD HAVE (stretch / wow-factor)
- C1 — TEE attestation of inference (Phala/Marlin) on one code path.
- C2 — Behavioral "fingerprint" analytics (timing/pattern) shown per player.
- C3 — Public dataset export of human-vs-AI rounds.

### ❌ WON'T HAVE (explicitly out of scope — say this to judges as "roadmap")
- zkML proof of inference.
- Generalized multi-environment arena (we ship ONE game).
- Mainnet deployment / real-money market.
- Mobile app.

---

## 2. Build-for-real vs Mock

| Piece | Decision | Note |
|---|---|---|
| Smart contracts (registry, match, market, leaderboard) | **REAL** | This is the on-chain core — must be real & deployed. |
| Commit-reveal flow | **REAL** | The integrity story depends on it. |
| Reference agent decisions | **REAL** (simple) | LLM optional; a transparent heuristic policy is fine + signs actions. |
| Game environment (price-prediction) | **REAL data, simplified rules** | Use recorded/real Mantle price series; keep rules tiny. |
| Replay harness | **REAL but narrow** | One window, one metric set; output anchored on-chain. |
| EAS attestation | **REAL if quick, else minimal custom contract** | Don't block the demo on EAS availability. |
| TEE / zkML | **MOCK / narrated** | Show interface + roadmap; don't implement. |
| Indexer | **OPTIONAL** | Direct RPC reads acceptable for MVP. |
| Spectator market liquidity | **TESTNET MNT, scripted demo bettors** | Pre-fund a couple wallets for a lively demo. |

---

## 3. Timeline (~2.5 weeks)

### Week 1 (30 May → 5 Jun) — Foundations & on-chain core
| Day | Focus | Output |
|---|---|---|
| D1 (Sat) | Repo scaffold (Foundry + frontend + agent folders), Mantle testnet config, faucet | `forge build` passes, wallet funded |
| D2 | `AgentRegistry` + tests; passport mint | Deployed to testnet |
| D3 | `Match` (commit-reveal + scoring) + tests | Local matches run |
| D4 | `PredictionMarket` + `Leaderboard` + tests | Full contract suite on testnet |
| D5 | Reference agent runtime: reads match, signs+commits+reveals action | Agent plays a full match locally |

### Week 2 (6 Jun → 12 Jun) — Loop integration & frontend
| Day | Focus | Output |
|---|---|---|
| D6 | Match orchestrator (round timing, environment data feed) | Automated match lifecycle |
| D7 | Replay Harness: `anvil --fork`, deterministic replay, report | Verifiable benchmark report file |
| D8 | Anchor benchmark on-chain (EAS or minimal contract) | Attestation visible on-chain |
| D9 | Frontend: arena view + leaderboard (wallet connect, reads) | Can watch a live match |
| D10 | Frontend: "Human or AI?" betting + claim + builder register/benchmark page | Full loop clickable |

### Week 3 (13 Jun → 16 Jun) — Human play, polish, submit
| Day | Focus | Output |
|---|---|---|
| D11 | Human play UI + end-to-end rehearsal on testnet | Human vs agent match works live |
| D12 | Polish, edge cases, pre-fund demo wallets, SHOULD-HAVE items if time | Stable demo |
| D13 | Record 2–3 min demo video + write submission (problem, solution, tracks) | Draft submission |
| D14 (Jun 16) | Final review, README, push, **submit on DoraHacks** | ✅ Submitted |

> Buffer is baked into Week 3. If anything slips, cut SHOULD/COULD items first — never cut the MUST-HAVE loop.

---

## 4. Demo Video Script (the 2–3 min that wins or loses)

1. **Hook (15s):** "Mantle wants to benchmark AI agents on-chain and tell humans from AI. We built the arena that does exactly that." Show the live arena.
2. **Register (20s):** Builder registers an agent → passport minted on Mantle (show tx + model hash).
3. **Benchmark (25s):** Run replay harness → verifiable performance attestation anchored on-chain. Emphasize "this backtest can be re-run by anyone — no faking."
4. **Compete (40s):** A human and the AI agent both play a live match. Commit-reveal shown. Scores update.
5. **Judge (40s):** Spectators stake MNT "human or AI?". Reveal ground truth → market settles → leaderboard updates with Turing score.
6. **Why it matters (20s):** "We didn't build a contestant. We built the proving ground — the identity standard, the verifiable benchmark, and the human-vs-AI market. Any team's agent can plug in." Close on tracks + ecosystem value.

---

## 5. Definition of Done (MVP)
- [ ] All MUST-HAVE contracts deployed to Mantle testnet (addresses in README).
- [ ] One full loop demoable live: register → benchmark → human-vs-AI match → market settles → leaderboard.
- [ ] Reference agent signs its actions; commit-reveal enforced.
- [ ] Benchmark attestation anchored & re-runnable.
- [ ] Demo video recorded; submission written; pushed to GitHub; submitted on DoraHacks.

---

## 6. Risk Register
| Risk | Likelihood | Mitigation |
|---|---|---|
| Scope creep | High | MoSCoW enforced; cut SHOULD/COULD first. |
| Mantle testnet/faucet/EAS issues | Med | Minimal custom attestation fallback; test RPC on D1. |
| Round latency makes human play awkward | Med | Tune round duration on D6/D11; pre-scripted human if needed. |
| Agent framework integration drag | Med | Start with heuristic policy; LLM is optional polish. |
| Solo bandwidth | Med | Timeline front-loads the risky on-chain core in Week 1. |

---

_Next: Deliverable #3 — scaffold the repo (Foundry contracts skeleton, agent runtime folder, frontend folder, README)._
