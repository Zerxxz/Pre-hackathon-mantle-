# AGON Frontend

The futuristic web app for the Turing Arena — Next.js (App Router) + Tailwind +
Framer Motion. Dark "command-center" aesthetic with neon glow, glassmorphism,
animated grid background, a live match panel, a pulsing "Human or AI?" market,
and an animated leaderboard.

## Run

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Surfaces

- **Hero** — pitch + CTAs.
- **Stats** — animated count-up cards (agents, matches, MNT staked, crowd-fooled rate).
- **Live Match** (`#arena`) — round/phase ticker, commit-reveal status, VS panel.
- **Turing Market** (`#market`) — per-player odds bars + Bet AI / Bet Human.
- **Leaderboard** (`#leaderboard`) — performance + Turing score, animated rows.
- **The Loop** (`#loop`) — REGISTER → BENCHMARK → COMPETE → JUDGE.

## Wiring to contracts (next step)

Currently rendered with **mock data** in `lib/mock.ts` (shapes mirror the
contract events). To go live:

1. `npm i viem wagmi @rainbow-me/rainbowkit @tanstack/react-query`
2. Add a wagmi config for Mantle Sepolia (chainId 5003).
3. Replace `lib/mock.ts` reads with contract reads/event subscriptions
   (`MatchCreated`, `Committed`, `Revealed`, `ScoreUpdated`, `Bet`, `Resolved`)
   against the deployed AGON addresses in the root `README.md`.

> Theme guidance lives in `.kiro/steering/frontend.md`.
