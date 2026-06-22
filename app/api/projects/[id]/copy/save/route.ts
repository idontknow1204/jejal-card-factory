import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { updateCardTopText } from "@/lib/supabase/queries/card-drafts";
import { createCopyRevision } from "@/lib/supabase/queries/copy-revisions";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: {
    card_number?: number;
    previous_text?: string;
    revised_text?: string;
    feedback_text?: string | null;
  } = {};

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { card_number, previous_text, revised_text, feedback_text } = body;

  if (typeof card_number !== "number" || typeof revised_text !== "string") {
    return NextResponse.json(
      { error: "card_number (number) and revised_text (string) are required" },
      { status: 400 }
    );
  }

  try {
    const db = createServiceClient();

    const revision = await createCopyRevision(db, {
      project_id: id,
      card_number,
      previous_text: previous_text ?? null,
      revised_text,
      feedback_text: feedback_text ?? null,
      approved: false,
    });

    await updateCardTopText(db, id, card_number, revised_text);

    return NextResponse.json({ revision_id: revision.id }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
