import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getCardProject } from "@/lib/supabase/queries/card-projects";
import { approveCopyRevisions } from "@/lib/supabase/queries/copy-revisions";
import { saveApprovedExample } from "@/lib/supabase/queries/learning";
import { extractCopyPatterns } from "@/lib/ai/pattern-extractor";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const db = createServiceClient();

    // Critical path: approve revisions and update project status
    await approveCopyRevisions(db, id);

    // Best-effort: extract and save learned patterns (errors don't fail the approve)
    try {
      const [project, revisionRows] = await Promise.all([
        getCardProject(db, id),
        db
          .from("copy_revisions")
          .select("card_number, previous_text, revised_text, feedback_text")
          .eq("project_id", id)
          .eq("approved", true)
          .then((r) => r.data ?? []),
      ]);

      if (project && revisionRows.length > 0) {
        const { reusable_pattern, why_it_works } = await extractCopyPatterns({
          revisions: revisionRows,
          projectTitle: project.title,
          projectTopic: project.topic,
        });

        await saveApprovedExample(db, {
          project_id: id,
          title: project.title,
          topic: project.topic,
          reusable_pattern,
          why_it_works: why_it_works || null,
        });
      }
    } catch {
      // Non-critical — pattern extraction failure should not block the user
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
