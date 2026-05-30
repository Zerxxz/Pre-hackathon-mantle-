import type { Action, MatchState } from "./policy.js";

/** True when an LLM endpoint is configured. */
export function llmEnabled(): boolean {
  return Boolean(process.env.LLM_API_KEY);
}

/**
 * Ask an OpenAI-compatible chat endpoint to predict the next move.
 * Returns 1 (UP), 0 (DOWN), or null if not configured / on any error
 * (so the caller can fall back to the heuristic policy).
 *
 * Configure via env: LLM_API_KEY, LLM_BASE_URL (default OpenAI), LLM_MODEL.
 */
export async function llmDecide(state: MatchState): Promise<Action | null> {
  const key = process.env.LLM_API_KEY;
  if (!key) return null;

  const base = process.env.LLM_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.LLM_MODEL ?? "gpt-4o-mini";

  const prompt =
    "You are an autonomous trading agent in an on-chain price-prediction game. " +
    "Given the recent price series, predict whether the NEXT price will move UP or DOWN. " +
    `Series: [${state.priceSeries.join(", ")}]. ` +
    "Answer with exactly one word: UP or DOWN.";

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4,
        temperature: 0,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = (data.choices?.[0]?.message?.content ?? "").trim().toUpperCase();
    if (text.includes("UP")) return 1;
    if (text.includes("DOWN")) return 0;
    return null;
  } catch {
    return null;
  }
}
