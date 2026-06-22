import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getCardProject } from "@/lib/supabase/queries/card-projects";
import { getLatestCardDraft } from "@/lib/supabase/queries/card-drafts";
import { getGeneratedImages } from "@/lib/supabase/queries/generated-images";
import { StoryDraft } from "@/lib/ai/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: { rating?: number; why_good?: string; what_to_improve?: string } = {};
  try {
    body = await request.json();
  } catch {
    // optional body
  }

  try {
    const db = createServiceClient();

    const [project, draft, images] = await Promise.all([
      getCardProject(db, id),
      getLatestCardDraft(db, id),
      getGeneratedImages(db, id),
    ]);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Build final cards JSON from latest draft cards + approved image URLs
    const story = draft?.cards_json as unknown as StoryDraft | undefined;
    const finalCardsJson = story?.cards ?? null;

    const approvedImages = images.filter((img) => img.approved === true);
    const finalImageUrls = Object.fromEntries(
      approvedImages.map((img) => [String(img.card_number), img.image_url])
    );

    // Save final_card_sets record
    const { data: finalSet, error: finalErr } = await db
      .from("final_card_sets")
      .insert({
        project_id: id,
        final_cards_json: finalCardsJson as never,
        final_image_urls: finalImageUrls as never,
        rating: body.rating ?? null,
        is_jejal_like: true,
        why_good: body.why_good ?? null,
        what_to_improve: body.what_to_improve ?? null,
        approved: true,
      })
      .select()
      .single();

    if (finalErr) throw new Error(finalErr.message);

    // Update project status
    await db
      .from("card_projects")
      .update({ status: "approved" })
      .eq("id", id);

    return NextResponse.json({ ok: true, final_set_id: finalSet.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
