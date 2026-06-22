import { SupabaseClient } from "@supabase/supabase-js";
import {
  Database,
  GeneratedCharacterImage,
  GeneratedCharacterImageInsert,
} from "../types";

type Client = SupabaseClient<Database>;

export async function getGeneratedImages(
  client: Client,
  projectId: string
): Promise<GeneratedCharacterImage[]> {
  const { data, error } = await client
    .from("generated_character_images")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createGeneratedImage(
  client: Client,
  data: GeneratedCharacterImageInsert
): Promise<GeneratedCharacterImage> {
  const { data: image, error } = await client
    .from("generated_character_images")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return image;
}

export async function approveGeneratedImage(
  client: Client,
  imageId: string
): Promise<void> {
  const { error } = await client
    .from("generated_character_images")
    .update({ approved: true, rejected_reason: null })
    .eq("id", imageId);

  if (error) throw new Error(error.message);
}

export async function rejectGeneratedImage(
  client: Client,
  imageId: string,
  reason: string
): Promise<void> {
  const { error } = await client
    .from("generated_character_images")
    .update({ approved: false, rejected_reason: reason || null })
    .eq("id", imageId);

  if (error) throw new Error(error.message);
}
