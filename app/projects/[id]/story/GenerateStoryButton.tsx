"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GenerateStoryButton({
  projectId,
  cardCount,
  contentType,
  hasExisting,
}: {
  projectId: string;
  cardCount: number;
  contentType: string;
  hasExisting: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/generate-story`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_count: cardCount,
          content_type: contentType,
        }),
      });

      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!res.ok) {
        setError(data?.error ?? "Generation failed");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error — could not reach the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-[#FF441F] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-[#e03a18] transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading
          ? "Generating…"
          : hasExisting
          ? "Regenerate Story"
          : "Generate Story"}
      </button>
      {error && (
        <p className="text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
