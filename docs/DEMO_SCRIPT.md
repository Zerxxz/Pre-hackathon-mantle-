# AGON — Demo Video Script

Target length: **2:30–3:00**. Goal: show the full loop working on Mantle and land the punchline — *"we built the proving ground, not a contestant."*

## Pre-record checklist

- [ ] Contracts deployed to Mantle Sepolia; addresses in root `README.md` + `frontend/.env.local`.
- [ ] Frontend running (`npm run dev`) showing **● live** badge.
- [ ] One agent registered; agent runtime running (`agent/ npm run dev`).
- [ ] Orchestrator ready to run (`orchestrator/ npm run run`).
- [ ] 2–3 spectator wallets pre-funded with testnet MNT for lively betting.
- [ ] Short commit/reveal windows (~30–45s) so the match fits the video.
- [ ] A MantleScan tab open to show a tx landing on-chain.

## Shot list

| # | Time | On screen | Narration (paraphrase) |
|---|------|-----------|------------------------|
| 1 | 0:00–0:15 | Hero of the futuristic UI; slow zoom on "Human or AI?" | "Mantle wants to benchmark AI agents on-chain and tell humans from machines. We built the arena that does exactly that — AGON." |
| 2 | 0:15–0:40 | **Builder Console** → fill model/policy/agent key → Mint Passport → MantleScan tx | "Register an agent: it gets an on-chain passport. Its model and policy are hashed and committed — identity you can verify." |
| 3 | 0:40–1:05 | Terminal `npm run replay` → report + hashes → "Anchor" → benchmark count ticks up | "Benchmark it with a deterministic replay. The result is anchored on-chain and **re-runnable by anyone** — no fake backtests." |
| 4 | 1:05–1:45 | Run orchestrator (creates match); agent terminal commits; a human plays in the UI; round dots advance | "Now they compete. A human and the AI both play, commit-reveal, every decision on Mantle. No look-ahead, no copying." |
| 5 | 1:45–2:20 | Spectators stake MNT on each player; odds bars pulse; orchestrator settles; leaderboard updates with **Turing score** | "Spectators bet: human or AI? At settlement the market resolves, scores post, and the leaderboard gains a Turing score — how often each player fooled the crowd." |
| 6 | 2:20–2:50 | Cut to architecture diagram / three layers; end card | "We didn't build a contestant. We built the proving ground — the identity standard, the verifiable benchmark, and the human-vs-AI market. Any team's agent can plug in. That's AGON, on Mantle." |

## Capture tips

- Record the UI at 1080p+; the neon/glass theme reads best on dark.
- Keep terminals large-font and trimmed to the key lines (commit/reveal/settle tx hashes).
- Show at least one tx on MantleScan to prove it's really on-chain.
- End on the tracks + "ecosystem contribution" line — that's the grand-prize hook.

## 30-second elevator version (if a short cut is needed)

Hero → one register tx → live match human-vs-AI → market settles + Turing score → "the on-chain Turing Test, as a protocol. AGON, on Mantle."
