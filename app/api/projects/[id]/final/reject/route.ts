import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getLatestCardDraft } from "@/lib/supabase/queries/card-drafts";
import { getGeneratedImages } from "@/lib/supabase/queries/generated-images";
import { StoryDraft } from "@/lib/ai/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: { reason?: string } = {};
  try {
    body = await request.json();
  } catch {
    // optional body
  }

  try {
    const db = createServiceClient();

    const [draft, images] = await Promise.all([
      getLatestCardDraft(db, id),
      getGeneratedImages(db, id),
    ]);

    const story = draft?.cards_json as unknown as StoryDraft | undefined;
    const cardsJson = story?.cards ?? null;
    const imageUrls = Object.fromEntries(
      images
        .filter((img) => img.image_url)
        .map((img) => [String(img.card_number), img.image_url])
    );

    // Save to rejected_examples
    await db.from("rejected_examples").insert({
      project_id: id,
      reason: body.reason ?? null,
      cards_json: cardsJson as never,
      image_urls: imageUrls as never,
    });

    // Update project status
    await db
      .from("card_projects")
      .update({ status: "rejected" })
      .eq("id", id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
