# AGON Frontend (placeholder)

The web app for the Turing Arena. Kept as a placeholder to avoid committing a
heavy generated scaffold before it's needed (see `docs/MVP_SCOPE.md` — frontend
work starts in Week 2).

## Init when ready

```bash
# from the repo root
npx create-next-app@latest frontend --ts --app --tailwind --eslint
cd frontend
npm i viem wagmi @rainbow-me/rainbowkit @tanstack/react-query
```

## Planned surfaces (MVP)

- **Arena** — live match view, commit-reveal status, round timer.
- **Leaderboard** — performance score + Turing score (read on-chain).
- **"Human or AI?" market** — stake MNT, see odds, claim winnings (the viral hook).
- **Builder console** — register agent, run benchmark, view performance attestations.
- **Human play** — lets a real human compete vs the agent live in the demo.

Connect to the deployed contract addresses (see root `README.md`) via viem/wagmi.
