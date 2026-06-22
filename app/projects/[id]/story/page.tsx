import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import { getCardProject } from "@/lib/supabase/queries/card-projects";
import { getLatestCardDraft } from "@/lib/supabase/queries/card-drafts";
import { StoryDraft, StoryCard } from "@/lib/ai/types";
import GenerateStoryButton from "./GenerateStoryButton";

const EMOTION_LABELS: Record<string, string> = {
  Neugier: "curious",
  Überraschung: "surprised",
  Empathie: "empathetic",
  Verspieltheit: "playful",
  Ärger: "annoyed",
  Müdigkeit: "tired",
  Aufregung: "excited",
  Misstrauen: "suspicious",
  Schock: "shocked",
  Stolz: "proud",
};

function CardRow({ card, index }: { card: StoryCard; index: number }) {
  const isFirst = card.card_number === 1;
  const isLast = card.role?.toLowerCase().includes("clos");

  return (
    <div
      className={`bg-white border rounded-2xl p-5 ${
        isFirst
          ? "border-[#FF441F]"
          : isLast
          ? "border-[#E5E5E5] opacity-70"
          : "border-[#E5E5E5]"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Card number */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            isFirst
              ? "bg-[#FF441F] text-white"
              : "bg-[#F2F2F2] text-[#9A9A9A]"
          }`}
        >
          {card.card_number}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          {/* Role badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold bg-[#F2F2F2] text-[#9A9A9A] px-2 py-0.5 rounded-md uppercase tracking-wider">
              {card.role}
            </span>
            {card.character_emotion && (
              <span className="text-xs text-[#9A9A9A]">
                {card.character_emotion}
                {EMOTION_LABELS[card.character_emotion]
                  ? ` (${EMOTION_LABELS[card.character_emotion]})`
                  : ""}
              </span>
            )}
            {card.character_action && (
              <span className="text-xs text-[#9A9A9A]">· {card.character_action}</span>
            )}
          </div>

          {/* top_text — the actual card copy */}
          <p className="font-bold text-[#111111] text-base leading-snug whitespace-pre-line">
            {card.top_text}
          </p>
        </div>
      </div>
    </div>
  );
}

async function fetchStoryData(projectId: string) {
  try {
    const db = createServiceClient();
    const [project, draft] = await Promise.all([
      getCardProject(db, projectId),
      getLatestCardDraft(db, projectId),
    ]);
    return { project, draft, error: null };
  } catch (err) {
    return {
      project: null,
      draft: null,
      error: err instanceof Error ? err.message : "Failed to load",
    };
  }
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { project, draft, error } = await fetchStoryData(id);

  // Parse the story from draft.cards_json if it exists
  let story: StoryDraft | null = null;
  if (draft?.cards_json) {
    const raw = draft.cards_json as unknown;
    if (
      raw &&
      typeof raw === "object" &&
      "cards" in raw &&
      Array.isArray((raw as StoryDraft).cards)
    ) {
      story = raw as StoryDraft;
    }
  }

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
          <span className="font-bold text-[#111111] text-sm">1. Story</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#111111]">Story Structure</h1>
            <p className="text-[#9A9A9A] text-sm mt-1">
              {project
                ? `${project.content_type.toUpperCase()} · ${project.card_count ?? 5} cards · ${project.topic}`
                : "Generate a 5–7 card narrative structure"}
            </p>
          </div>

          {project && (
            <GenerateStoryButton
              projectId={id}
              cardCount={project.card_count ?? 5}
              contentType={project.content_type}
              hasExisting={!!story}
            />
          )}
        </div>

        {/* Supabase error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600 font-medium">
              Database error: {error}
            </p>
            <p className="text-xs text-red-400 mt-1">
              Check your .env.local Supabase credentials.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!story && !error && (
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-10 text-center">
            <p className="text-[#9A9A9A] font-medium">No story generated yet</p>
            <p className="text-xs text-[#9A9A9A] mt-2">
              Click &quot;Generate Story&quot; above. Claude will produce a {project?.card_count ?? 5}-card{" "}
              {project?.content_type ?? "POV"} story based on your topic.
            </p>
          </div>
        )}

        {/* Generated cards */}
        {story && (
          <>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[#9A9A9A] uppercase tracking-wider">
                Draft · {story.cards.length} cards
              </span>
              {draft?.model && (
                <span className="text-xs text-[#9A9A9A] font-mono">{draft.model}</span>
              )}
            </div>

            <div className="space-y-3">
              {story.cards.map((card, i) => (
                <CardRow key={card.card_number} card={card} index={i} />
              ))}
            </div>
          </>
        )}

        {/* Nav */}
        <div className="flex justify-between pt-4 border-t border-[#E5E5E5]">
          <Link
            href={`/projects/${id}`}
            className="text-sm border border-[#E5E5E5] text-[#9A9A9A] font-bold px-4 py-2 rounded-lg hover:border-[#111111] hover:text-[#111111] transition-colors"
          >
            ← Back
          </Link>
          <Link
            href={`/projects/${id}/copy`}
            className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${
              story
                ? "bg-[#111111] text-white hover:bg-[#FF441F]"
                : "border border-[#E5E5E5] text-[#9A9A9A] cursor-not-allowed"
            }`}
          >
            Next: Copy →
          </Link>
        </div>
      </main>
    </div>
  );
}
