"use client";

import { useState } from "react";
import Link from "next/link";
import { StoryCard } from "@/lib/ai/types";

interface Props {
  projectId: string;
  initialCards: StoryCard[];
}

export default function CopyEditor({ projectId, initialCards }: Props) {
  // Source of truth mirroring DB — updated after each successful save
  const [cards, setCards] = useState<StoryCard[]>(initialCards);

  // Per-card textarea values (keyed by card_number)
  const [revisedTexts, setRevisedTexts] = useState<Record<number, string>>(
    () => Object.fromEntries(initialCards.map((c) => [c.card_number, c.top_text]))
  );
  const [feedbackTexts, setFeedbackTexts] = useState<Record<number, string>>(
    () => Object.fromEntries(initialCards.map((c) => [c.card_number, ""]))
  );

  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [savedState, setSavedState] = useState<Record<number, boolean>>({});
  const [saveErrors, setSaveErrors] = useState<Record<number, string>>({});

  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  const handleSave = async (cardNumber: number) => {
    const currentCard = cards.find((c) => c.card_number === cardNumber);
    if (!currentCard) return;

    const previousText = currentCard.top_text;
    const revisedText = revisedTexts[cardNumber] ?? "";
    const feedbackText = feedbackTexts[cardNumber] ?? "";

    setSaving((prev) => ({ ...prev, [cardNumber]: true }));
    setSaveErrors((prev) => ({ ...prev, [cardNumber]: "" }));
    setSavedState((prev) => ({ ...prev, [cardNumber]: false }));

    try {
      const res = await fetch(`/api/projects/${projectId}/copy/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_number: cardNumber,
          previous_text: previousText,
          revised_text: revisedText,
          feedback_text: feedbackText || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error((data as { error?: string }).error ?? "Save failed");
      }

      setCards((prev) =>
        prev.map((c) =>
          c.card_number === cardNumber ? { ...c, top_text: revisedText } : c
        )
      );
      setSavedState((prev) => ({ ...prev, [cardNumber]: true }));
    } catch (err) {
      setSaveErrors((prev) => ({
        ...prev,
        [cardNumber]: err instanceof Error ? err.message : "Save failed",
      }));
    } finally {
      setSaving((prev) => ({ ...prev, [cardNumber]: false }));
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    setApproveError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/copy/approve`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error((data as { error?: string }).error ?? "Approve failed");
      }
      setApproved(true);
    } catch (err) {
      setApproveError(err instanceof Error ? err.message : "Approve failed");
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="space-y-4">
      {cards.map((card) => {
        const isClosing = card.role?.toLowerCase().includes("clos");
        const isCover = card.card_number === 1;
        const revisedText = revisedTexts[card.card_number] ?? card.top_text;
        const isSaving = !!saving[card.card_number];
        const isSaved = !!savedState[card.card_number];
        const saveError = saveErrors[card.card_number];
        const hasChanges = revisedText !== card.top_text;
        const hasFeedback = !!(feedbackTexts[card.card_number]?.trim());
        const canSave = hasChanges || hasFeedback;

        return (
          <div
            key={card.card_number}
            className={`bg-white border rounded-2xl p-5 ${
              isCover
                ? "border-[#FF441F]"
                : isClosing
                ? "border-[#E5E5E5] opacity-60"
                : "border-[#E5E5E5]"
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Card number badge */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCover ? "bg-[#FF441F] text-white" : "bg-[#F2F2F2] text-[#9A9A9A]"
                }`}
              >
                {card.card_number}
              </div>

              <div className="flex-1 min-w-0 space-y-3">
                {/* Role + emotion + action badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold bg-[#F2F2F2] text-[#9A9A9A] px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {card.role}
                  </span>
                  {card.character_emotion && (
                    <span className="text-xs text-[#9A9A9A]">{card.character_emotion}</span>
                  )}
                  {card.character_action && (
                    <span className="text-xs text-[#9A9A9A]">· {card.character_action}</span>
                  )}
                </div>

                {isClosing ? (
                  <p className="text-sm text-[#9A9A9A] italic">
                    Closing card — fixed asset, no copy edit needed.
                  </p>
                ) : (
                  <>
                    {/* Current top_text (read-only reference) */}
                    <div>
                      <p className="text-xs font-bold text-[#9A9A9A] uppercase tracking-wider mb-1">
                        Current
                      </p>
                      <p className="text-sm text-[#888888] bg-[#FAFAFA] border border-[#F2F2F2] px-3 py-2 rounded-lg whitespace-pre-line leading-snug">
                        {card.top_text}
                      </p>
                    </div>

                    {/* Revised top_text textarea */}
                    <div>
                      <label className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-1 block">
                        Revised top_text
                      </label>
                      <textarea
                        value={revisedText}
                        onChange={(e) => {
                          setRevisedTexts((prev) => ({
                            ...prev,
                            [card.card_number]: e.target.value,
                          }));
                          setSavedState((prev) => ({ ...prev, [card.card_number]: false }));
                        }}
                        rows={2}
                        className="w-full border border-[#E5E5E5] rounded-xl px-3 py-2 text-[#111111] font-bold text-sm leading-snug resize-none focus:outline-none focus:border-[#111111] transition-colors font-[family-name:var(--font-plus-jakarta-sans)]"
                        placeholder="Revised German copy…"
                      />
                      <p className="text-xs text-[#9A9A9A] mt-1">
                        1–2 lines · German casual student tone · max 1 accent word
                      </p>
                    </div>

                    {/* Feedback textarea */}
                    <div>
                      <label className="text-xs font-bold text-[#9A9A9A] uppercase tracking-wider mb-1 block">
                        Feedback (optional)
                      </label>
                      <textarea
                        value={feedbackTexts[card.card_number] ?? ""}
                        onChange={(e) =>
                          setFeedbackTexts((prev) => ({
                            ...prev,
                            [card.card_number]: e.target.value,
                          }))
                        }
                        rows={2}
                        className="w-full border border-[#E5E5E5] rounded-xl px-3 py-2 text-[#9A9A9A] text-sm resize-none focus:outline-none focus:border-[#111111] transition-colors"
                        placeholder="Why did you change this? (saved for AI context)"
                      />
                    </div>

                    {/* Save button + status */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSave(card.card_number)}
                        disabled={isSaving || !canSave}
                        className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${
                          isSaving
                            ? "bg-[#F2F2F2] text-[#9A9A9A] cursor-wait"
                            : canSave
                            ? "bg-[#111111] text-white hover:bg-[#FF441F]"
                            : "bg-[#F2F2F2] text-[#9A9A9A] opacity-50 cursor-not-allowed"
                        }`}
                      >
                        {isSaving ? "Saving…" : "Save Copy Edit"}
                      </button>

                      {isSaved && !canSave && (
                        <span className="text-xs font-bold text-green-600">✓ Saved</span>
                      )}

                      {saveError && (
                        <span className="text-xs text-red-500">{saveError}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Page-level actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5] gap-3 flex-wrap">
        <Link
          href={`/projects/${projectId}/story`}
          className="text-sm border border-[#E5E5E5] text-[#9A9A9A] font-bold px-4 py-2 rounded-lg hover:border-[#111111] hover:text-[#111111] transition-colors"
        >
          ← Story
        </Link>

        <div className="flex items-center gap-3 flex-wrap">
          {approveError && (
            <span className="text-xs text-red-500">{approveError}</span>
          )}

          <button
            onClick={handleApprove}
            disabled={approving || approved}
            className={`text-sm font-bold px-4 py-2 rounded-lg border transition-colors ${
              approved
                ? "border-green-500 text-green-600 cursor-default"
                : approving
                ? "border-[#E5E5E5] text-[#9A9A9A] cursor-wait"
                : "border-[#111111] text-[#111111] hover:border-[#FF441F] hover:text-[#FF441F]"
            }`}
          >
            {approved ? "✓ Copy Approved" : approving ? "Approving…" : "Approve Copy"}
          </button>

          <Link
            href={`/projects/${projectId}/prompts`}
            className="text-sm bg-[#111111] text-white font-bold px-4 py-2 rounded-lg hover:bg-[#FF441F] transition-colors"
          >
            Continue to Image Prompts →
          </Link>
        </div>
      </div>
    </div>
  );
}
