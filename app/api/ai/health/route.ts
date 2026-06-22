import { NextResponse } from "next/server";
import {
  ClaudeGatewayError,
  createClaudeCompletion,
  getActiveModel,
  getActiveBaseURL,
} from "@/lib/ai/claude-client";
import { safeParseAiJson } from "@/lib/ai/safe-json";

export async function GET() {
  const model = getActiveModel();
  const baseURL = getActiveBaseURL();

  try {
    const raw = await createClaudeCompletion([
      { role: "user", content: 'Say OK in JSON exactly: {"ok":true}' },
    ], { maxTokens: 32 });

    let parsed: unknown;
    try {
      parsed = safeParseAiJson(raw);
    } catch {
      parsed = { raw };
    }

    return NextResponse.json({ ok: true, model, baseURL, response: parsed });
  } catch (err) {
    if (err instanceof ClaudeGatewayError) {
      console.error("Claude health check gateway error", {
        status: err.status,
        body: err.body.slice(0, 2000),
      });

      return NextResponse.json(
        {
          ok: false,
          model,
          baseURL,
          error:
            "Claude 게이트웨이가 일시적으로 응답하지 않습니다. 잠시 후 다시 확인해 주세요.",
          detail: `Upstream returned ${err.status}`,
        },
        { status: 502 }
      );
    }

    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, model, baseURL, error: message },
      { status: 500 }
    );
  }
}
