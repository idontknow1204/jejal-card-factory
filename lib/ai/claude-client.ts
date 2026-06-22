export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class ClaudeGatewayError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string) {
    super(`Claude gateway ${status}: ${summarizeGatewayBody(body)}`);
    this.name = "ClaudeGatewayError";
    this.status = status;
    this.body = body;
  }
}

function summarizeGatewayBody(body: string): string {
  const withoutTags = body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return withoutTags.slice(0, 500) || "(empty response body)";
}

function isRetryableGatewayStatus(status: number): boolean {
  return status === 502 || status === 503 || status === 504;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getConfig() {
  const baseURL = process.env.CLAUDE_GATEWAY_BASE_URL;
  const apiKey = process.env.CLAUDE_GATEWAY_API_KEY;
  const model = process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6";

  if (!baseURL || !apiKey) {
    throw new Error(
      "Missing CLAUDE_GATEWAY_BASE_URL or CLAUDE_GATEWAY_API_KEY env vars"
    );
  }

  return { baseURL, apiKey, model };
}

export async function createClaudeCompletion(
  messages: ChatMessage[],
  options: { maxTokens?: number } = {}
): Promise<string> {
  const { baseURL, apiKey, model } = getConfig();
  const maxTokens = options.maxTokens ?? 4096;

  let res: Response | undefined;
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    res = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens }),
    });

    if (res.ok || !isRetryableGatewayStatus(res.status) || attempt === maxAttempts) {
      break;
    }

    await res.body?.cancel().catch(() => undefined);
    await sleep(750 * attempt);
  }

  if (!res) {
    throw new Error("Claude gateway request was not attempted");
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "(no body)");
    throw new ClaudeGatewayError(res.status, body);
  }

  const json = await res.json();
  const content: string | undefined = json?.choices?.[0]?.message?.content;

  if (typeof content !== "string") {
    throw new Error(`Unexpected gateway response shape: ${JSON.stringify(json)}`);
  }

  return content;
}

export async function generateJsonWithClaude({
  systemPrompt,
  userPrompt,
  schemaName,
  maxTokens,
}: {
  systemPrompt: string;
  userPrompt: string;
  schemaName: string;
  maxTokens?: number;
}): Promise<unknown> {
  const { safeParseAiJson } = await import("./safe-json");

  const jsonInstruction =
    `\n\nOUTPUT RULES — MANDATORY:\n` +
    `- Respond with valid JSON only. Schema: ${schemaName}.\n` +
    `- No markdown code fences (no \`\`\`json). No prose. No explanation.\n` +
    `- Start your response with { or [ directly.`;

  const raw = await createClaudeCompletion([
    { role: "system", content: systemPrompt + jsonInstruction },
    { role: "user", content: userPrompt },
  ], { maxTokens });

  return safeParseAiJson(raw);
}

export function getActiveModel(): string {
  return process.env.CLAUDE_MODEL ?? "claude-sonnet-4-6";
}

export function getActiveBaseURL(): string {
  return process.env.CLAUDE_GATEWAY_BASE_URL ?? "(not set)";
}
