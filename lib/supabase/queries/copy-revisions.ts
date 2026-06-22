import { SupabaseClient } from "@supabase/supabase-js";
import { Database, CopyRevision, CopyRevisionInsert } from "../types";

type Client = SupabaseClient<Database>;

export async function createCopyRevision(
  client: Client,
  data: CopyRevisionInsert
): Promise<CopyRevision> {
  const { data: revision, error } = await client
    .from("copy_revisions")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return revision;
}

export async function approveCopyRevisions(
  client: Client,
  projectId: string
): Promise<void> {
  const { error: revError } = await client
    .from("copy_revisions")
    .update({ approved: true })
    .eq("project_id", projectId);

  if (revError) throw new Error(revError.message);

  const { error: projError } = await client
    .from("card_projects")
    .update({ status: "copy_approved" })
    .eq("id", projectId);

  if (projError) throw new Error(projError.message);
}
