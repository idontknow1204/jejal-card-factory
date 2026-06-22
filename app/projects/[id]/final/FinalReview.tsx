"use client";

import { useState } from "react";
import { StoryCard } from "@/lib/ai/types";
import { GeneratedCharacterImage } from "@/lib/supabase/types";

interface Props {
  projectId: string;
  cards: StoryCard[];
  imageMap: Record<number, GeneratedCharacterImage>;
}

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

export default function FinalReview({ projectId, cards, imageMap }: Props) {
  const [rating, setRating] = useState<number>(0);
  const [whyGood, setWhyGood] = useState("");
  const [whatToImprove, setWhatToImprove] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const [status, setStatus] = useState<"idle" | "approving" | "rejecting" | "approved" | "rejected">("idle");
  const [error, setError] = useState<string | null>(null);
  const [exportState, setExportState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [exportProgress, setExportProgress] = useState<{ done: number; total: number } | null>(null);

  const handleApprove = async () => {
    setStatus("approving");
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/final/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: rating || null,
          why_good: whyGood.trim() || null,
          what_to_improve: whatToImprove.trim() || null,
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Approve failed");
      setStatus("approved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setStatus("idle");
    }
  };

  const handleReject = async () => {
    setStatus("rejecting");
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/final/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason.trim() || null }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Reject failed");
      setStatus("rejected");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setStatus("rejecting");
    }
  };

  const handleExportAll = async () => {
    const exportable = cards.filter((c) => {
      const img = imageMap[c.card_number];
      return img?.image_url;
    });
    if (exportable.length === 0) return;

    setExportState("busy");
    setExportProgress({ done: 0, total: exportable.length });

    let done = 0;
    let failed = false;
    for (const card of exportable) {
      const img = imageMap[card.card_number];
      if (!img?.image_url) continue;
      try {
        await downloadImage(img.image_url, `${projectId}-card-${card.card_number}.png`);
        done++;
        setExportProgress({ done, total: exportable.length });
        // Small gap so the browser doesn't throttle sequential downloads
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

  if (status === "approved") {
    return (
      <div className="bg-green-50 border border-green-300 rounded-2xl p-10 text-center space-y-2">
        <p className="text-2xl font-extrabold text-green-700">Project Approved</p>
        <p className="text-sm text-green-600">
          Final card set saved. Patterns learned for future generation.
        </p>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="bg-red-50 border border-red-300 rounded-2xl p-10 text-center space-y-2">
        <p className="text-2xl font-extrabold text-red-700">Project Rejected</p>
        <p className="text-sm text-red-500">
          Rejection recorded as learning data. Start a new project to try again.
        </p>
      </div>
    );
  }

  const generatable = cards.filter((c) => !c.role?.toLowerCase().includes("clos"));
  const approvedCount = generatable.filter(
    (c) => imageMap[c.card_number]?.approved === true
  ).length;

  return (
    <div className="space-y-6">
      {/* Card strip */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {cards.map((card) => {
          const isClosing = card.role?.toLowerCase().includes("clos");
          const img = imageMap[card.card_number];

          return (
            <div
              key={card.card_number}
              className="flex-shrink-0 w-28 space-y-1 group"
            >
              <div className="aspect-[4/5] rounded-xl overflow-hidden border border-[#E5E5E5] bg-white relative">
                {isClosing ? (
                  <div className="absolute inset-0 bg-[#FF441F] flex items-center justify-center">
                    <span className="text-white font-extrabold text-xs">JeJal</span>
                  </div>
                ) : img?.image_url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.image_url}
                      alt={`Card ${card.card_number}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {card.top_text && (
                      <div className="absolute inset-x-0 top-0 p-1.5">
                        <div className="bg-white/90 rounded-lg px-1.5 py-1">
                          <p className="font-extrabold text-[#111111] text-[9px] leading-tight text-center whitespace-pre-line">
                            {card.top_text}
                          </p>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() =>
                        downloadImage(
                          img.image_url!,
                          `${projectId}-card-${card.card_number}.png`
                        )
                      }
                      title="Download"
                      className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-black/80 text-white rounded-md p-1"
                    >
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 12l-4-4h2.5V2h3v6H12L8 12z" />
                        <rect x="2" y="13" width="12" height="1.5" rx="0.75" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-[#F2F2F2] flex items-center justify-center">
                    <span className="text-[9px] text-[#9A9A9A]">No image</span>
                  </div>
                )}
              </div>
              <p className="text-[9px] text-[#9A9A9A] text-center">
                {card.card_number}
              </p>
            </div>
          );
        })}
      </div>

      {/* Export all button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleExportAll}
          disabled={exportState === "busy"}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
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
            ? `Downloading… ${exportProgress.done}/${exportProgress.total}`
            : exportState === "done"
            ? "Downloaded"
            : exportState === "error"
            ? "Some failed"
            : "Export all images"}
        </button>
      </div>

      <p className="text-sm text-[#9A9A9A]">
        <span className="font-bold text-[#111111]">{approvedCount}</span> /{" "}
        {generatable.length} images approved
        {approvedCount < generatable.length && (
          <span className="text-[#FF441F]"> — some images not yet approved</span>
        )}
      </p>

      {/* Rating */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 space-y-4">
        <p className="text-sm font-bold text-[#111111]">How was this result?</p>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-2xl transition-colors ${
                star <= rating ? "text-[#FF441F]" : "text-[#E5E5E5] hover:text-[#FF9A86]"
              }`}
            >
              ★
            </button>
          ))}
          {rating > 0 && (
            <span className="text-xs text-[#9A9A9A] ml-1">{rating}/5</span>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-[#9A9A9A] uppercase tracking-wider block mb-1">
              What worked well? <span className="font-normal">(optional)</span>
            </label>
            <textarea
              value={whyGood}
              onChange={(e) => setWhyGood(e.target.value)}
              rows={2}
              placeholder="e.g. 캐릭터 표현이 자연스러웠고 독일어 카피 톤이 좋았음"
              className="w-full border border-[#E5E5E5] rounded-xl px-3 py-2 text-sm text-[#111111] placeholder:text-[#BEBEBE] focus:outline-none focus:border-[#111111] transition-colors resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#9A9A9A] uppercase tracking-wider block mb-1">
              What to improve next time? <span className="font-normal">(optional)</span>
            </label>
            <textarea
              value={whatToImprove}
              onChange={(e) => setWhatToImprove(e.target.value)}
              rows={2}
              placeholder="e.g. Card 3 포즈가 너무 정적, 배경 컬러 더 단순하게"
              className="w-full border border-[#E5E5E5] rounded-xl px-3 py-2 text-sm text-[#111111] placeholder:text-[#BEBEBE] focus:outline-none focus:border-[#111111] transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

      {/* Reject form */}
      {showRejectForm && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
          <p className="text-sm font-bold text-red-700">Reject this project</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={2}
            placeholder="Why is this being rejected? (saved as learning data)"
            className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm text-[#111111] focus:outline-none focus:border-red-400 transition-colors resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={status === "rejecting"}
              className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors ${
                status === "rejecting"
                  ? "bg-[#F2F2F2] text-[#9A9A9A] cursor-wait"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              {status === "rejecting" ? "Rejecting…" : "Confirm Reject"}
            </button>
            <button
              onClick={() => setShowRejectForm(false)}
              className="text-sm text-[#9A9A9A] hover:text-[#111111] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleApprove}
          disabled={status === "approving"}
          className={`text-sm font-bold px-6 py-3 rounded-xl transition-colors ${
            status === "approving"
              ? "bg-[#F2F2F2] text-[#9A9A9A] cursor-wait"
              : "bg-[#FF441F] text-white hover:bg-[#e03a18]"
          }`}
        >
          {status === "approving" ? "Approving…" : "✓ Approve Project"}
        </button>

        {!showRejectForm && (
          <button
            onClick={() => setShowRejectForm(true)}
            className="text-sm font-bold px-4 py-3 rounded-xl border border-[#E5E5E5] text-[#9A9A9A] hover:border-red-300 hover:text-red-500 transition-colors"
          >
            ✗ Reject
          </button>
        )}
      </div>
    </div>
  );
}
