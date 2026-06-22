/**
 * When AI response is truncated, close open string literals and brackets.
 * Returns a repaired string or null if repair failed.
 */
function repairTruncatedJson(text: string): string | null {
  try {
    const stack: string[] = [];
    let inString = false;
    let escape = false;

    for (const ch of text) {
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === '"') {
        inString = !inString;
        if (!inString) {
          // just closed a string key or value
        }
        continue;
      }
      if (inString) continue;
      if (ch === "{" || ch === "[") stack.push(ch === "{" ? "}" : "]");
      if (ch === "}" || ch === "]") stack.pop();
    }

    // Close open string if we ended mid-string
    let repaired = text;
    if (inString) repaired += '"';
    // Close any unclosed values (trailing comma is OK for most parsers but not JSON.parse)
    // Remove trailing comma if present
    repaired = repaired.replace(/,\s*$/, "");
    // Close all open brackets in reverse order
    while (stack.length > 0) repaired += stack.pop();
    return repaired;
  } catch {
    return null;
  }
}

/**
 * Extract and parse the first valid JSON object or array from an AI response.
 * Handles: raw JSON, JSON wrapped in prose, JSON inside ```json code fences.
 * Falls back to truncated JSON repair when response is cut off.
 */
export function safeParseAiJson(text: string): unknown {
  const cleaned = text.trim();

  // Fast path: entire string is valid JSON
  try {
    return JSON.parse(cleaned);
  } catch {
    // fall through to extraction
  }

  // Strip markdown code fences
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // fall through
    }
  }

  // Find first { or [ and extract the matching closing bracket
  const objIdx = cleaned.indexOf("{");
  const arrIdx = cleaned.indexOf("[");

  let start = -1;
  if (objIdx === -1 && arrIdx === -1) {
    throw new Error("safeParseAiJson: no JSON object or array found in response");
  } else if (objIdx === -1) {
    start = arrIdx;
  } else if (arrIdx === -1) {
    start = objIdx;
  } else {
    start = Math.min(objIdx, arrIdx);
  }

  const openChar = cleaned[start];
  const closeChar = openChar === "{" ? "}" : "]";

  let depth = 0;
  let inString = false;
  let escape = false;
  let end = -1;

  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];

    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === openChar) depth++;
    if (ch === closeChar) {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  if (end === -1) {
    // Response was truncated — attempt to close open brackets/braces
    const repaired = repairTruncatedJson(cleaned.slice(start));
    if (repaired !== null) {
      try {
        return JSON.parse(repaired);
      } catch {
        // repair didn't produce valid JSON
      }
    }
    throw new Error("safeParseAiJson: unterminated JSON structure in response");
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}
