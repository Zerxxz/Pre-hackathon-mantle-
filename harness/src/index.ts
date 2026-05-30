/**
 * AGON Replay Harness entrypoint.
 *
 * Runs a deterministic replay, prints a verifiable report, and — if the chain
 * env vars are set — anchors the result on-chain via BenchmarkRegistry.anchor()
 * (signed by the agent's CONTROLLER, which the contract requires).
 */
import { runReplay } from "./replay.js";
import { benchmarkRegistryAbi } from "./abi.js";
import { canAnchor, getConfig } from "./config.js";

async function main() {
  const report = runReplay();
  console.log("[harness] replay report:");
  console.log(`  steps           : ${report.steps}`);
  console.log(`  hits            : ${report.hits}`);
  console.log(`  hitRate         : ${(report.hitRateBps / 100).toFixed(2)}%`);
  console.log(`  inputWindowHash : ${report.inputWindowHash}`);
  console.log(`  attestationUID  : ${report.attestationUID}`);

  if (!canAnchor()) {
    console.log(
      "\n[harness] dry run — not anchoring. Set BENCHMARK_REGISTRY_ADDRESS, " +
        "CONTROLLER_PRIVATE_KEY and AGENT_ID (see harness/.env.example) to anchor on-chain.",
    );
    return;
  }

  const cfg = getConfig();
  console.log(`\n[harness] anchoring benchmark for agent ${cfg.agentId} as ${cfg.account.address}…`);

  const tx = await cfg.walletClient.writeContract({
    address: cfg.benchmarkRegistry,
    abi: benchmarkRegistryAbi,
    functionName: "anchor",
    args: [cfg.agentId, report.attestationUID, report.inputWindowHash],
  });
  console.log(`[harness] anchored (tx ${tx})`);

  const count = (await cfg.publicClient.readContract({
    address: cfg.benchmarkRegistry,
    abi: benchmarkRegistryAbi,
    functionName: "benchmarkCount",
    args: [cfg.agentId],
  })) as bigint;
  console.log(`[harness] agent ${cfg.agentId} now has ${count} benchmark(s) anchored.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
