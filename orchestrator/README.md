# AGON Orchestrator

The match **referee**. It ties the Arena together: creates a match, publishes the
canonical price feed, drives commit/reveal timing, and settles — which scores the
game, resolves the "Human or AI?" market, and updates the leaderboard (via the
`MatchManager` hooks wired at deploy).

## Run

```bash
cd orchestrator
cp .env.example .env   # fill ORCHESTRATOR_PRIVATE_KEY, MATCH_MANAGER_ADDRESS, players…
npm install
npm run run
```

## What one run does

1. **Seal** each player's nature (`keccak256(uint8(nature), salt)`).
2. **createMatch()** on-chain (players, leaderboardIds, sealed natures, rounds, windows).
3. **Announce** the canonical price series so the agent/human can play.
4. **Wait** through the commit + reveal windows.
5. **settle()** with per-round outcomes + the revealed natures/salts.

## Notes

- `ORCHESTRATOR_PRIVATE_KEY` must be the account that creates the match (settle is
  restricted to the match's orchestrator).
- `feed.ts` mirrors `agent/src/feed.ts` so scoring aligns. Replace both with a real
  shared price oracle for production.
- Natures: `AI` → 2, `Human` → 1 (matches `IAgon.Nature`).
- Keep windows short (e.g. 30–45s) for a snappy live demo.
