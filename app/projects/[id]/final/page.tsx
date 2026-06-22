import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import { getCardProject } from "@/lib/supabase/queries/card-projects";
import { getLatestCardDraft } from "@/lib/supabase/queries/card-drafts";
import { getGeneratedImages } from "@/lib/supabase/queries/generated-images";
import { StoryDraft, StoryCard } from "@/lib/ai/types";
import { GeneratedCharacterImage } from "@/lib/supabase/types";
import FinalReview from "./FinalReview";

async function loadData(projectId: string) {
  try {
    const db = createServiceClient();
    const [project, draft, images] = await Promise.all([
      getCardProject(db, projectId),
      getLatestCardDraft(db, projectId),
      getGeneratedImages(db, projectId),
    ]);

    let cards: StoryCard[] = [];
    if (draft?.cards_json) {
      const story = draft.cards_json as unknown as StoryDraft;
      if (Array.isArray(story.cards)) cards = story.cards;
    }

    const imageMap: Record<number, GeneratedCharacterImage> = {};
    for (const img of images) {
      const existing = imageMap[img.card_number];
      if (!existing || (img.created_at ?? "") > (existing.created_at ?? "")) {
        imageMap[img.card_number] = img;
      }
    }

    return { project, cards, imageMap, error: null };
  } catch (err) {
    return {
      project: null,
      cards: [],
      imageMap: {},
      error: err instanceof Error ? err.message : "Failed to load",
    };
  }
}

export default async function FinalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { project, cards, imageMap, error } = await loadData(id);

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
          <span className="font-bold text-[#111111] text-sm">7. Final</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111]">
            {project?.title ? `${project.title} — Final Review` : "Final Review"}
          </h1>
          <p className="text-[#9A9A9A] text-sm mt-1">
            Approve to save as learning data · Reject to record what went wrong
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!error && cards.length === 0 && (
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-10 text-center">
            <p className="text-[#9A9A9A] font-medium">No story generated yet.</p>
            <Link
              href={`/projects/${id}/story`}
              className="inline-block mt-4 text-sm bg-[#111111] text-white font-bold px-4 py-2 rounded-lg hover:bg-[#FF441F] transition-colors"
            >
              ← Generate story first
            </Link>
          </div>
        )}

        {cards.length > 0 && (
          <FinalReview projectId={id} cards={cards} imageMap={imageMap} />
        )}

        <div className="pt-4 border-t border-[#E5E5E5]">
          <Link
            href={`/projects/${id}/figma`}
            className="text-sm border border-[#E5E5E5] text-[#9A9A9A] font-bold px-4 py-2 rounded-lg hover:border-[#111111] hover:text-[#111111] transition-colors"
          >
            ← Figma
          </Link>
        </div>
      </main>
    </div>
  );
}
