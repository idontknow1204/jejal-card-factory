"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { StoryCard } from "@/lib/ai/types";
import { GeneratedCharacterImage } from "@/lib/supabase/types";

async function downloadImage(url: string, filename: string) {
  if (url.startsWith("data:")) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    return;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(objectUrl);
}

interface CardState {
  generating: boolean;
  genError: string;
  approving: boolean;
  rejecting: boolean;
  rejectReason: string;
  showRejectInput: boolean;
  showPrompt: boolean;
  regenFeedback: string;
  referenceFile: File | null;
  referencePreview: string | null;
}

interface Props {
  projectId: string;
  cards: StoryCard[];
  initialImages: GeneratedCharacterImage[];
}

function latestByCard(
  images: GeneratedCharacterImage[]
): Record<number, GeneratedCharacterImage> {
  const map: Record<number, GeneratedCharacterImage> = {};
  for (const img of images) {
    const existing = map[img.card_number];
    if (!existing || (img.created_at ?? "") > (existing.created_at ?? "")) {
      map[img.card_number] = img;
    }
  }
  return map;
}

const DEFAULT_STATE: CardState = {
  generating: false,
  genError: "",
  approving: false,
  rejecting: false,
  rejectReason: "",
  showRejectInput: false,
  showPrompt: false,
  regenFeedback: "",
  referenceFile: null,
  referencePreview: null,
};

export default function ImagePanel({ projectId, cards, initialImages }: Props) {
  const [imageMap, setImageMap] = useState<Record<number, GeneratedCharacterImage>>(
    () => latestByCard(initialImages)
  );
  const [states, setStates] = useState<Record<number, Partial<CardState>>>({});
  const [generatingAll, setGeneratingAll] = useState(false);
  const [exportState, setExportState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [exportProgress, setExportProgress] = useState<{ done: number; total: number } | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const get = (n: number): CardState => ({ ...DEFAULT_STATE, ...states[n] });

  const patch = (n: number, update: Partial<CardState>) =>
    setStates((prev) => ({ ...prev, [n]: { ...prev[n], ...update } }));

  const handleFileSelect = (cardNumber: number, file: File | null) => {
    if (!file) {
      patch(cardNumber, { referenceFile: null, referencePreview: null });
      if (fileInputRefs.current[cardNumber]) {
        fileInputRefs.current[cardNumber]!.value = "";
      }
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      patch(cardNumber, {
        referenceFile: file,
        referencePreview: ev.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (cardNumber: number, overrideFeedback?: string) => {
    const s = get(cardNumber);
    patch(cardNumber, { generating: true, genError: "" });

    try {
      const feedback = (overrideFeedback ?? s.regenFeedback).trim();

      let response: Response;

      if (s.referenceFile) {
        // Send as multipart when a reference image is attached
        const form = new FormData();
        form.append("card_number", String(cardNumber));
        if (feedback) form.append("regeneration_feedback", feedback);
        form.append("reference_image", s.referenceFile);
        response = await fetch(`/api/projects/${projectId}/images/generate`, {
          method: "POST",
          body: form,
        });
      } else {
        const body: { card_number: number; regeneration_feedback?: string } = {
          card_number: cardNumber,
        };
        if (feedback) body.regeneration_feedback = feedback;
        response = await fetch(`/api/projects/${projectId}/images/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      const data = await response.json() as {
        image_id?: string;
        image_url?: string;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error ?? "Generation failed");

      setImageMap((prev) => ({
        ...prev,
        [cardNumber]: {
          id: data.image_id!,
          project_id: projectId,
          card_number: cardNumber,
          image_url: data.image_url ?? null,
          approved: null,
          rejected_reason: null,
          prompt: null,
          negative_prompt: null,
          provider: "factchat",
          model: "gpt-image-1",
          created_at: new Date().toISOString(),
        },
      }));
      // Clear feedback and reference after successful generation
      patch(cardNumber, {
        regenFeedback: "",
        referenceFile: null,
        referencePreview: null,
      });
      if (fileInputRefs.current[cardNumber]) {
        fileInputRefs.current[cardNumber]!.value = "";
      }
    } catch (err) {
      patch(cardNumber, { genError: err instanceof Error ? err.message : "Failed" });
    } finally {
      patch(cardNumber, { generating: false });
    }
  };

  const handleApprove = async (cardNumber: number, imageId: string) => {
    patch(cardNumber, { approving: true });
    try {
      const res = await fetch(
        `/api/projects/${projectId}/images/${imageId}/approve`,
        { method: "POST" }
      );
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Approve failed");
      setImageMap((prev) => ({
        ...prev,
        [cardNumber]: { ...prev[cardNumber], approved: true, rejected_reason: null },
      }));
    } catch (err) {
      patch(cardNumber, { genError: err instanceof Error ? err.message : "Failed" });
    } finally {
      patch(cardNumber, { approving: false });
    }
  };

  const handleReject = async (
    cardNumber: number,
    imageId: string,
    reason: string
  ) => {
    patch(cardNumber, { rejecting: true });
    try {
      const res = await fetch(
        `/api/projects/${projectId}/images/${imageId}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        }
      );
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Reject failed");
      setImageMap((prev) => ({
        ...prev,
        [cardNumber]: {
          ...prev[cardNumber],
          approved: false,
          rejected_reason: reason || null,
        },
      }));
      patch(cardNumber, { showRejectInput: false, rejectReason: "" });
    } catch (err) {
      patch(cardNumber, { genError: err instanceof Error ? err.message : "Failed" });
    } finally {
      patch(cardNumber, { rejecting: false });
    }
  };

  const handleGenerateAll = async () => {
    setGeneratingAll(true);
    for (const card of cards) {
      if (card.role?.toLowerCase().includes("clos")) continue;
      await handleGenerate(card.card_number, "");
    }
    setGeneratingAll(false);
  };

  const handleExportApproved = async () => {
    const approved = cards.filter(
      (c) => imageMap[c.card_number]?.approved === true && imageMap[c.card_number]?.image_url
    );
    if (approved.length === 0) return;

    setExportState("busy");
    setExportProgress({ done: 0, total: approved.length });

    let done = 0;
    let failed = false;
    for (const card of approved) {
      const url = imageMap[card.card_number].image_url!;
      try {
        await downloadImage(url, `${projectId}-card-${card.card_number}.png`);
        done++;
        setExportProgress({ done, total: approved.length });
        await new Promise((r) => setTimeout(r, 300));
      } catch {
        failed = true;
      }
    }

    setExportState(failed ? "error" : "done");
    setTimeout(() => {
      setExportState("idle");
      setExportProgress(null);
    }, 3000);
  };

  const generatable = cards.filter((c) => !c.role?.toLowerCase().includes("clos"));
  const approvedCount = generatable.filter(
    (c) => imageMap[c.card_number]?.approved === true
  ).length;
  const card1HasImage = !!imageMap[1]?.image_url && imageMap[1]?.approved !== false;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-[#9A9A9A]">
          <span className="font-bold text-[#111111]">{approvedCount}</span> /{" "}
          {generatable.length} approved
        </p>
        <div className="flex items-center gap-2">
          {approvedCount > 0 && (
            <button
              onClick={handleExportApproved}
              disabled={exportState === "busy"}
              className={`text-xs font-bold px-3 py-2 rounded-lg border transition-colors flex items-center gap-1.5 ${
                exportState === "busy"
                  ? "border-[#E5E5E5] text-[#9A9A9A] cursor-wait"
                  : exportState === "done"
                  ? "border-green-300 text-green-600"
                  : exportState === "error"
                  ? "border-red-300 text-red-500"
                  : "border-[#E5E5E5] text-[#9A9A9A] hover:border-[#111111] hover:text-[#111111]"
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 12l-4-4h2.5V2h3v6H12L8 12z" />
                <rect x="2" y="13" width="12" height="1.5" rx="0.75" />
              </svg>
              {exportState === "busy" && exportProgress
                ? `${exportProgress.done}/${exportProgress.total}`
                : exportState === "done"
                ? "Downloaded"
                : exportState === "error"
                ? "Some failed"
                : `Export approved (${approvedCount})`}
            </button>
          )}
          <button
            onClick={handleGenerateAll}
            disabled={generatingAll}
            className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${
              generatingAll
                ? "bg-[#F2F2F2] text-[#9A9A9A] cursor-wait"
                : "bg-[#FF441F] text-white hover:bg-[#e03a18]"
            }`}
          >
            {generatingAll ? "Generating…" : "Generate All"}
          </button>
        </div>
      </div>

      {/* Consistency hint when card 1 is ready */}
      {card1HasImage && (
        <div className="bg-[#FFF8F7] border border-[#FFD5CC] rounded-xl px-4 py-3">
          <p className="text-xs text-[#FF441F] font-bold">Card 1 style reference active</p>
          <p className="text-xs text-[#9A9A9A] mt-0.5">
            Cards 2+ will use Card 1&apos;s character as a visual reference to maintain consistency.
          </p>
        </div>
      )}

      {/* Card rows */}
      {cards.map((card) => {
        const s = get(card.card_number);
        const isClosing = card.role?.toLowerCase().includes("clos");
        const isCover = card.card_number === 1;
        const img = imageMap[card.card_number] ?? null;
        const hasImage = !!img?.image_url;
        const isApproved = img?.approved === true;
        const isRejected = img?.approved === false;

        return (
          <div
            key={card.card_number}
            className={`bg-white border rounded-2xl overflow-hidden ${
              isCover
                ? "border-[#FF441F]"
                : isClosing
                ? "border-[#E5E5E5] opacity-60"
                : isApproved
                ? "border-green-400"
                : isRejected
                ? "border-red-300"
                : "border-[#E5E5E5]"
            }`}
          >
            {/* Card info */}
            <div className="p-5 flex items-start gap-4">
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isCover ? "bg-[#FF441F] text-white" : "bg-[#F2F2F2] text-[#9A9A9A]"
                }`}
              >
                {card.card_number}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold bg-[#F2F2F2] text-[#9A9A9A] px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {card.role}
                  </span>
                  {!isCover && card1HasImage && !isClosing && (
                    <span className="text-xs text-[#FF441F] bg-[#FFF8F7] px-2 py-0.5 rounded-md">
                      ref: Card 1
                    </span>
                  )}
                  {isApproved && (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                      ✓ Approved
                    </span>
                  )}
                  {isRejected && (
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                      ✗ Rejected
                    </span>
                  )}
                </div>

                {/* Copy */}
                <p className="font-bold text-[#111111] text-sm leading-snug whitespace-pre-line">
                  {card.top_text}
                </p>

                {/* Emotion · Pose */}
                <p className="text-xs text-[#9A9A9A]">
                  {card.character_emotion}
                  {card.character_action ? ` · ${card.character_action}` : ""}
                </p>

                {isClosing ? (
                  <p className="text-xs text-[#9A9A9A] italic">
                    Closing card — fixed asset, no image generation needed.
                  </p>
                ) : (
                  <>
                    {/* Image prompt toggle */}
                    <button
                      onClick={() =>
                        patch(card.card_number, { showPrompt: !s.showPrompt })
                      }
                      className="text-xs text-[#9A9A9A] hover:text-[#111111] transition-colors"
                    >
                      {s.showPrompt ? "▲ Hide prompt" : "▼ Show image prompt"}
                    </button>

                    {s.showPrompt && (
                      <pre className="text-xs text-[#888888] bg-[#FAFAFA] border border-[#F2F2F2] rounded-lg px-3 py-2 whitespace-pre-wrap leading-relaxed font-mono max-h-48 overflow-y-auto">
                        {card.image_prompt}
                      </pre>
                    )}

                    {/* Error */}
                    {s.genError && (
                      <p className="text-xs text-red-500 font-medium">{s.genError}</p>
                    )}

                    {/* Regeneration controls — shown when an image already exists */}
                    {hasImage && (
                      <div className="space-y-2 pt-1">
                        <label className="text-xs font-bold text-[#9A9A9A]">
                          What to change?{" "}
                          <span className="font-normal">(optional)</span>
                        </label>

                        {/* Text feedback */}
                        <textarea
                          value={s.regenFeedback}
                          onChange={(e) =>
                            patch(card.card_number, { regenFeedback: e.target.value })
                          }
                          placeholder="예: 눈을 더 크게, 포즈를 더 역동적으로, 배경을 단순하게…"
                          rows={2}
                          className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#111111] placeholder:text-[#BEBEBE] focus:outline-none focus:border-[#111111] transition-colors resize-none"
                        />

                        {/* Reference image attachment */}
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-[#9A9A9A] bg-[#F2F2F2] hover:bg-[#EAEAEA] px-3 py-1.5 rounded-lg transition-colors">
                            <span>+ 참고 이미지</span>
                            <input
                              ref={(el) => { fileInputRefs.current[card.card_number] = el; }}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleFileSelect(
                                  card.card_number,
                                  e.target.files?.[0] ?? null
                                )
                              }
                            />
                          </label>

                          {s.referencePreview && s.referenceFile && (
                            <div className="flex items-center gap-2">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={s.referencePreview}
                                alt="reference"
                                className="w-10 h-10 object-cover rounded-lg border border-[#E5E5E5]"
                              />
                              <span className="text-xs text-[#9A9A9A] max-w-[120px] truncate">
                                {s.referenceFile.name}
                              </span>
                              <button
                                onClick={() =>
                                  handleFileSelect(card.card_number, null)
                                }
                                className="text-xs text-[#9A9A9A] hover:text-red-500 transition-colors font-bold"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Generate / Regenerate button */}
                    <button
                      onClick={() => handleGenerate(card.card_number)}
                      disabled={s.generating}
                      className={`text-sm font-bold px-4 py-2 rounded-lg border transition-colors ${
                        s.generating
                          ? "border-[#E5E5E5] text-[#9A9A9A] cursor-wait"
                          : "border-[#111111] text-[#111111] hover:border-[#FF441F] hover:text-[#FF441F]"
                      }`}
                    >
                      {s.generating
                        ? "Generating…"
                        : hasImage
                        ? "Regenerate"
                        : "Generate Image"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Generated image + controls */}
            {hasImage && img && (
              <>
                {/* Image preview */}
                <div className="border-t border-[#F2F2F2] bg-[#FAFAFA] flex justify-center px-5 py-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.image_url ?? ""}
                    alt={`Card ${card.card_number} — JeJal character`}
                    className="max-h-72 max-w-full object-contain rounded-xl shadow-sm"
                  />
                </div>

                {/* Approve / Reject */}
                {!isApproved && !isRejected && (
                  <div className="border-t border-[#F2F2F2] px-5 py-3 flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => handleApprove(card.card_number, img.id)}
                      disabled={s.approving}
                      className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${
                        s.approving
                          ? "bg-[#F2F2F2] text-[#9A9A9A] cursor-wait"
                          : "bg-[#111111] text-white hover:bg-green-600"
                      }`}
                    >
                      {s.approving ? "Approving…" : "✓ Approve"}
                    </button>

                    <button
                      onClick={() =>
                        patch(card.card_number, {
                          showRejectInput: !s.showRejectInput,
                        })
                      }
                      className="text-sm font-bold px-4 py-2 rounded-lg border border-[#E5E5E5] text-[#9A9A9A] hover:border-red-300 hover:text-red-500 transition-colors"
                    >
                      ✗ Reject
                    </button>
                  </div>
                )}

                {/* Reject reason input */}
                {s.showRejectInput && !isRejected && (
                  <div className="border-t border-[#F2F2F2] px-5 py-3 space-y-2">
                    <input
                      type="text"
                      value={s.rejectReason}
                      onChange={(e) =>
                        patch(card.card_number, { rejectReason: e.target.value })
                      }
                      placeholder="Reason for rejection (optional)"
                      className="w-full border border-[#E5E5E5] rounded-lg px-3 py-2 text-sm text-[#111111] focus:outline-none focus:border-[#111111] transition-colors"
                    />
                    <button
                      onClick={() =>
                        handleReject(card.card_number, img.id, s.rejectReason)
                      }
                      disabled={s.rejecting}
                      className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${
                        s.rejecting
                          ? "bg-[#F2F2F2] text-[#9A9A9A] cursor-wait"
                          : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                    >
                      {s.rejecting ? "Rejecting…" : "Confirm Reject"}
                    </button>
                  </div>
                )}

                {/* Post-decision actions */}
                {(isApproved || isRejected) && (
                  <div className="border-t border-[#F2F2F2] px-5 py-3 flex items-center gap-3 flex-wrap">
                    {isApproved && (
                      <>
                        <span className="text-xs font-bold text-green-600">✓ Approved</span>
                        <button
                          onClick={() =>
                            downloadImage(
                              img.image_url!,
                              `${projectId}-card-${card.card_number}.png`
                            )
                          }
                          className="text-xs font-bold text-[#9A9A9A] hover:text-[#111111] transition-colors flex items-center gap-1"
                        >
                          <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 12l-4-4h2.5V2h3v6H12L8 12z" />
                            <rect x="2" y="13" width="12" height="1.5" rx="0.75" />
                          </svg>
                          Download
                        </button>
                      </>
                    )}
                    {isRejected && (
                      <>
                        <span className="text-xs font-bold text-red-500">✗ Rejected</span>
                        {img.rejected_reason && (
                          <span className="text-xs text-[#9A9A9A]">
                            — {img.rejected_reason}
                          </span>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => handleGenerate(card.card_number)}
                      disabled={s.generating}
                      className="text-xs text-[#9A9A9A] hover:text-[#FF441F] transition-colors"
                    >
                      {s.generating ? "Generating…" : "Regenerate"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
        <Link
          href={`/projects/${projectId}/prompts`}
          className="text-sm border border-[#E5E5E5] text-[#9A9A9A] font-bold px-4 py-2 rounded-lg hover:border-[#111111] hover:text-[#111111] transition-colors"
        >
          ← Prompts
        </Link>
        <Link
          href={`/projects/${projectId}/cards`}
          className="text-sm bg-[#111111] text-white font-bold px-4 py-2 rounded-lg hover:bg-[#FF441F] transition-colors"
        >
          Continue to Cards →
        </Link>
      </div>
    </div>
  );
}
