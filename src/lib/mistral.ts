import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export function normalizeMistralContent(content: any): string {
  if (!content) return "";

  if (typeof content === "string") return content.trim();

  if (Array.isArray(content)) {
    return content
      .map((c) =>
        typeof c === "string"
          ? c
          : c?.text || c?.content || c?.message?.content || ""
      )
      .join(" ")
      .trim();
  }

  if (typeof content === "object") {
    return (
      content?.text ||
      content?.content ||
      content?.message?.content ||
      JSON.stringify(content)
    ).trim();
  }

  return String(content).trim();
}

export async function callMistral(
  model: string,
  prompt: string,
  {
    retries = 3,
    timeoutMs = 20000,
    maxPromptChars = 6000,
  }: {
    retries?: number;
    timeoutMs?: number;
    maxPromptChars?: number;
  } = {}
): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY not defined in environment");

  const truncatedPrompt =
    prompt.length > maxPromptChars ? prompt.slice(-maxPromptChars) : prompt;

  const payload = JSON.stringify({
    model,
    messages: [{ role: "user", content: truncatedPrompt }],
    max_tokens: 400,
    temperature: 0.0,
  });

  for (let attempt = 1; attempt <= retries; attempt++) {
    console.log(
      `[mistral] attempt=${attempt}/${retries} model=${model} chars=${truncatedPrompt.length}`
    );

    try {
      const { stdout } = await Promise.race([
        execAsync(
          `curl -s -X POST https://api.mistral.ai/v1/chat/completions \
          -H "Authorization: Bearer ${apiKey}" \
          -H "Content-Type: application/json" \
          -d '${payload.replace(/'/g, `'\\''`)}'`
        ),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Request timed out")), timeoutMs)
        ),
      ]);

      const data = JSON.parse(stdout);

      const rawContent =
        data?.choices?.[0]?.message?.content ??
        data?.choices?.[0]?.content ??
        data?.choices?.[0]?.delta?.content ??
        data?.output ??
        data?.message?.content ??
        "";

      return normalizeMistralContent(rawContent);
    } catch (err: any) {
      console.error("[mistral] request error:", err.message || err);

      if (attempt < retries) {
        const backoff = 1000 * 2 ** (attempt - 1);
        console.log(`[mistral] retrying in ${backoff}ms...`);
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }

      throw new Error(
        `Mistral unreachable after ${attempt} attempts: ${err.message}`
      );
    }
  }

  throw new Error("Unexpected: Mistral unreachable");
}
