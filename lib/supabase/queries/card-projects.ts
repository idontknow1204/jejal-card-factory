import { SupabaseClient } from "@supabase/supabase-js";
import { Database, CardProject, CardProjectInsert, CardProjectUpdate } from "../types";

type Client = SupabaseClient<Database>;

export async function createCardProject(
  client: Client,
  data: Pick<CardProjectInsert, "title" | "topic" | "content_type" | "card_count" | "created_by">
): Promise<CardProject> {
  const { data: project, error } = await client
    .from("card_projects")
    .insert({
      title: data.title,
      topic: data.topic,
      content_type: data.content_type,
      card_count: data.card_count ?? 5,
      created_by: data.created_by ?? null,
      status: "draft",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return project;
}

export async function getCardProjects(client: Client): Promise<CardProject[]> {
  const { data, error } = await client
    .from("card_projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCardProject(
  client: Client,
  id: string
): Promise<CardProject | null> {
  const { data, error } = await client
    .from("card_projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw new Error(error.message);
  }
  return data;
}

export async function updateCardProjectStatus(
  client: Client,
  id: string,
  status: CardProjectUpdate["status"]
): Promise<void> {
  const { error } = await client
    .from("card_projects")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
