import { createClaudeCompletion } from "./claude-client";

interface CopyRevisionEntry {
  card_number: number;
  previous_text: string | null;
  revised_text: string | null;
  feedback_text: string | null;
}

// Calls Claude with a minimal prompt to distill revision history into
// reusable bullet-point patterns. Output is intentionally short (~100-150 words).
export async function extractCopyPatterns({
  revisions,
  projectTitle,
  projectTopic,
}: {
  revisions: CopyRevisionEntry[];
  projectTitle: string;
  projectTopic: string;
}): Promise<{ reusable_pattern: string; why_it_works: string }> {
  const changed = revisions.filter(
    (r) => r.previous_text && r.revised_text && r.previous_text !== r.revised_text
  );

  if (changed.length === 0) {
    return {
      reusable_pattern: "No copy changes were made — original draft was accepted as-is.",
      why_it_works: "First draft matched the editor's standards.",
    };
  }

  const revisionList = changed
    .map((r) => {
      const lines = [
        `Card ${r.card_number}:`,
        `  Before: "${r.previous_text}"`,
        `  After:  "${r.revised_text}"`,
      ];
      if (r.feedback_text?.trim()) {
        lines.push(`  Feedback: "${r.feedback_text.trim()}"`);
      }
      return lines.join("\n");
    })
    .join("\n\n");

  const systemPrompt = `You extract writing pattern rules from copy revision history.
Output two things:
1. PATTERNS: 3-5 concise bullet points describing what this editor prefers (tone, style, structure, what to avoid). Under 100 words total. German-language context.
2. WHY: One sentence summarizing why the final copy worked.

Format exactly as:
PATTERNS:
- ...
- ...

WHY: ...`;

  const userPrompt = `Project: "${projectTitle}" (topic: ${projectTopic})

Copy revisions made by the editor:
${revisionList}

Extract reusable patterns.`;

  const raw = await createClaudeCompletion([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ], { maxTokens: 512 });

  const patternMatch = raw.match(/PATTERNS:\n([\s\S]*?)(?:\n\nWHY:|$)/);
  const whyMatch = raw.match(/WHY:\s*(.+)/);

  return {
    reusable_pattern: patternMatch?.[1]?.trim() ?? raw.trim(),
    why_it_works: whyMatch?.[1]?.trim() ?? "",
  };
}
