# AGON Frontend

The futuristic web app for the Turing Arena — Next.js (App Router) + Tailwind +
Framer Motion, wired to the AGON contracts on Mantle Sepolia via wagmi/viem.
Dark "command-center" aesthetic with neon glow, glassmorphism, animated grid
background, a live match panel, a pulsing "Human or AI?" market, and an animated
leaderboard.

## Run

```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Live vs mock data

The UI works with **zero config** by rendering rich mock data. To show real
on-chain data, copy `.env.example` → `.env.local` and set the deployed addresses
(see root `README.md` / `docs/DEPLOY.md`):

```
NEXT_PUBLIC_MANTLE_TESTNET_RPC=https://rpc.sepolia.mantle.xyz
NEXT_PUBLIC_AGENT_REGISTRY=0x...
NEXT_PUBLIC_MATCH_MANAGER=0x...
NEXT_PUBLIC_PREDICTION_MARKET=0x...
NEXT_PUBLIC_LEADERBOARD=0x...
```

When `MATCH_MANAGER` + `AGENT_REGISTRY` are set, `useAgonData()` reads live data
(stats from `nextAgentId`/`nextMatchId`, the latest match + market pools, and the
leaderboard from `ScoreUpdated` events) and the header flips to a green **● live**
badge. Otherwise it shows **● demo** with mock data.

## Architecture

- `app/providers.tsx` — Wagmi + React Query providers (injected connector).
- `lib/wagmi.ts` — Mantle Sepolia chain (5003) + config.
- `lib/contracts.ts` — addresses from `NEXT_PUBLIC_*` env + `isConfigured`.
- `lib/abis.ts` — minimal read/event ABIs.
- `lib/useAgonData.ts` — live-or-mock data hook (5s refetch).
- `components/*` — Background, Header (wallet connect), StatCard, LiveMatch,
  TuringMarket, Leaderboard, HowItWorks.

## Surfaces

- **Hero** — pitch + CTAs.
- **Stats** — animated count-up cards.
- **Live Match** (`#arena`) — round/phase ticker, commit-reveal status, VS panel.
- **Turing Market** (`#market`) — per-player odds bars + Bet AI / Bet Human.
- **Leaderboard** (`#leaderboard`) — performance + Turing score.
- **The Loop** (`#loop`) — REGISTER → BENCHMARK → COMPETE → JUDGE.

> Theme guidance lives in `.kiro/steering/frontend.md`.
