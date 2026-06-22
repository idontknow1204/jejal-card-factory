import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getLatestCardDraft } from "@/lib/supabase/queries/card-drafts";
import { StoryDraft } from "@/lib/ai/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const db = createServiceClient();
    const draft = await getLatestCardDraft(db, id);

    if (!draft) {
      return NextResponse.json({ error: "No draft found" }, { status: 404 });
    }

    const story = draft.cards_json as unknown as StoryDraft;

    return NextResponse.json({
      draft_id: draft.id,
      cards: story.cards ?? [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
