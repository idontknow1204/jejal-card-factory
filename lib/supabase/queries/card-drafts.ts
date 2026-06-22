import { SupabaseClient } from "@supabase/supabase-js";
import { Database, CardDraft, CardDraftInsert, Json } from "../types";

type Client = SupabaseClient<Database>;

export async function createCardDraft(
  client: Client,
  data: CardDraftInsert
): Promise<CardDraft> {
  const { data: draft, error } = await client
    .from("card_drafts")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return draft;
}

export async function getLatestCardDraft(
  client: Client,
  projectId: string
): Promise<CardDraft | null> {
  const { data, error } = await client
    .from("card_drafts")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateCardTopText(
  client: Client,
  projectId: string,
  cardNumber: number,
  revisedText: string
): Promise<void> {
  const draft = await getLatestCardDraft(client, projectId);
  if (!draft) throw new Error("No draft found for project");

  const raw = draft.cards_json as Record<string, unknown>;
  const cardsArray = raw.cards as Array<Record<string, unknown>>;
  if (!Array.isArray(cardsArray)) throw new Error("Invalid draft: missing cards array");

  const updatedCards = cardsArray.map((card) =>
    card.card_number === cardNumber ? { ...card, top_text: revisedText } : card
  );

  const { error } = await client
    .from("card_drafts")
    .update({ cards_json: { ...raw, cards: updatedCards } as unknown as Json })
    .eq("id", draft.id);

  if (error) throw new Error(error.message);
}

export async function getCardDrafts(
  client: Client,
  projectId: string
): Promise<CardDraft[]> {
  const { data, error } = await client
    .from("card_drafts")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}
