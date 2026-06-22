import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import { getCardProject } from "@/lib/supabase/queries/card-projects";
import { getLatestCardDraft } from "@/lib/supabase/queries/card-drafts";
import { StoryDraft, StoryCard } from "@/lib/ai/types";
import CopyEditor from "./CopyEditor";

async function loadCopyData(projectId: string): Promise<{
  projectTitle: string | null;
  projectMeta: string | null;
  cards: StoryCard[];
  error: string | null;
}> {
  try {
    const db = createServiceClient();
    const [project, draft] = await Promise.all([
      getCardProject(db, projectId),
      getLatestCardDraft(db, projectId),
    ]);

    let cards: StoryCard[] = [];
    if (draft?.cards_json) {
      const story = draft.cards_json as unknown as StoryDraft;
      if (Array.isArray(story.cards)) {
        cards = story.cards;
      }
    }

    const meta = project
      ? `${project.content_type.toUpperCase()} · ${project.card_count ?? 5} cards · ${project.topic}`
      : null;

    return { projectTitle: project?.title ?? null, projectMeta: meta, cards, error: null };
  } catch (err) {
    return {
      projectTitle: null,
      projectMeta: null,
      cards: [],
      error: err instanceof Error ? err.message : "Failed to load",
    };
  }
}

export default async function CopyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { projectTitle, projectMeta, cards, error } = await loadCopyData(id);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="bg-white border-b border-[#E5E5E5] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link
            href={`/projects/${id}`}
            className="text-[#9A9A9A] hover:text-[#111111] transition-colors text-sm"
          >
            ← Project
          </Link>
          <span className="text-[#E5E5E5]">/</span>
          <span className="font-bold text-[#111111] text-sm">2. Copy</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111]">
            {projectTitle ? `${projectTitle} — Copy` : "Card Copy"}
          </h1>
          <p className="text-[#9A9A9A] text-sm mt-1">
            {projectMeta ?? "Edit every card's top_text — copywriting_rules.md + content_rules.md"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600 font-medium">Error: {error}</p>
            <p className="text-xs text-red-400 mt-1">Check your .env.local Supabase credentials.</p>
          </div>
        )}

        {!error && cards.length === 0 && (
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-10 text-center">
            <p className="text-[#9A9A9A] font-medium">No story generated yet.</p>
            <p className="text-xs text-[#9A9A9A] mt-2">
              Generate a story first, then come back here to edit copy.
            </p>
            <Link
              href={`/projects/${id}/story`}
              className="inline-block mt-4 text-sm bg-[#111111] text-white font-bold px-4 py-2 rounded-lg hover:bg-[#FF441F] transition-colors"
            >
              ← Go to Story
            </Link>
          </div>
        )}

        {cards.length > 0 && <CopyEditor projectId={id} initialCards={cards} />}
      </main>
    </div>
  );
}
