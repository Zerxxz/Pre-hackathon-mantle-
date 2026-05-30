# Deploying AGON to Mantle Sepolia Testnet

> Network: **Mantle Sepolia Testnet** · chainId **5003** · gas token **MNT**
> RPC `https://rpc.sepolia.mantle.xyz` · Faucet `https://faucet.sepolia.mantle.xyz` · Explorer `https://sepolia.mantlescan.xyz`

## 1. Prerequisites

```bash
# Foundry (one time)
curl -L https://foundry.paradigm.xyz | bash && foundryup

# From contracts/: install forge-std (if not already present)
cd contracts
forge install foundry-rs/forge-std
forge build
forge test
```

## 2. Fund a deployer wallet

1. Create a throwaway key (never reuse a mainnet key for testnet scripts).
2. Get testnet MNT from the faucet: https://faucet.sepolia.mantle.xyz
3. Copy `contracts/.env.example` → `contracts/.env` and fill in:
   ```
   MANTLE_TESTNET_RPC=https://rpc.sepolia.mantle.xyz
   PRIVATE_KEY=0x<your-throwaway-testnet-key>
   ```

## 3. Simulate (no broadcast) — safe dry run

```bash
cd contracts
forge script script/Deploy.s.sol
```
This runs the deploy + wiring on a local in-memory EVM and prints the would-be
addresses. Use it to confirm everything executes before spending gas.

## 4. Deploy for real

```bash
cd contracts
source .env   # or: export $(grep -v '^#' .env | xargs)

forge script script/Deploy.s.sol \
  --rpc-url mantle_testnet \
  --private-key "$PRIVATE_KEY" \
  --broadcast
```

The script deploys all five contracts and wires the arena:
- `Leaderboard.setWriter(MatchManager, true)`
- `MatchManager.setHooks(Leaderboard, PredictionMarket)`
- `PredictionMarket` is constructed with `MatchManager` as its resolver.

Copy the printed addresses into the table in the root `README.md`.

## 5. (Optional) Verify on MantleScan

Set `MANTLESCAN_API_KEY` in `.env`, then:

```bash
forge verify-contract <ADDRESS> src/AgentRegistry.sol:AgentRegistry \
  --chain 5003 --verifier-url https://api-sepolia.mantlescan.xyz/api
```

## 6. Post-deploy smoke test (cast)

```bash
# read nextAgentId (should be 1 on a fresh deploy)
cast call <AGENT_REGISTRY> "nextAgentId()(uint256)" --rpc-url mantle_testnet

# register an agent (controller = your wallet)
cast send <AGENT_REGISTRY> \
  "register(bytes32,bytes32,address,uint8)" \
  0x00..model 0x00..policy <AGENT_KEY_ADDR> 0 \
  --rpc-url mantle_testnet --private-key "$PRIVATE_KEY"
```

## Notes / gotchas

- `anvil` is not used for deployment; `forge script` talks to the public RPC directly.
- MNT is the gas token, so deploy/tx fees are paid in MNT (from the faucet).
- Keep `contracts/.env` out of git (already in `.gitignore`).
- The faucet rate-limits large balances — request small amounts as needed.
