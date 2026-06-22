import { SupabaseClient } from "@supabase/supabase-js";
import { Database, ApprovedExample, ApprovedExampleInsert } from "../types";

type Client = SupabaseClient<Database>;

export async function saveApprovedExample(
  client: Client,
  data: ApprovedExampleInsert
): Promise<ApprovedExample> {
  const { data: row, error } = await client
    .from("approved_examples")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return row;
}

// Returns a concatenated pattern string from the last `limit` approved examples.
// Each example contributes one reusable_pattern block.
export async function getLearnedCopyPatterns(
  client: Client,
  limit = 5
): Promise<string> {
  const { data, error } = await client
    .from("approved_examples")
    .select("title, topic, reusable_pattern")
    .not("reusable_pattern", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data?.length) return "";

  return data
    .map(
      (ex) =>
        `[From "${ex.title ?? ex.topic ?? "past project"}"]:\n${ex.reusable_pattern}`
    )
    .join("\n\n");
}

// Returns unique, non-empty rejection reasons from all image generations (global, all projects).
export async function getImageRejectionReasons(
  client: Client,
  limit = 30
): Promise<string[]> {
  const { data, error } = await client
    .from("generated_character_images")
    .select("rejected_reason")
    .eq("approved", false)
    .not("rejected_reason", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data?.length) return [];

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const row of data) {
    const r = row.rejected_reason?.trim();
    if (r && !seen.has(r)) {
      seen.add(r);
      unique.push(r);
    }
  }
  return unique;
}
