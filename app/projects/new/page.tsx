"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CONTENT_TYPES = [
  { value: "pov", label: "POV Schema", description: "1인칭 POV 밈 (5장 고정)" },
  { value: "situation", label: "Situation Schema", description: "일상 상황 → 비틀기 (5–6장)" },
  { value: "warning", label: "Warning / Announcement", description: "경고·공지 밈 (5장)" },
  { value: "meetup", label: "Meetup Schema", description: "약속·사람 만나기 (5–6장)" },
  { value: "study", label: "Study / Exam Schema", description: "시험·공부 밈 (6장)" },
  { value: "mensa", label: "Mensa / Food Schema", description: "학식·먹거리 밈 (5장)" },
  { value: "team", label: "Team Project Schema", description: "조별과제 밈 (6–7장)" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    topic: "",
    content_type: "pov",
    card_count: 5,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "card_count" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to create project");
        return;
      }

      router.push(`/projects/${data.id}`);
    } catch {
      setError("Network error — could not reach the server");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSchema = CONTENT_TYPES.find((t) => t.value === form.content_type);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="bg-white border-b border-[#E5E5E5] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/projects" className="text-[#9A9A9A] hover:text-[#111111] transition-colors text-sm">
            ← Projects
          </Link>
          <span className="text-[#E5E5E5]">/</span>
          <span className="font-bold text-[#111111] text-sm">New Project</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-[#111111]">New Project</h1>
          <p className="text-[#9A9A9A] text-sm mt-1">
            Define the topic and format — Claude will generate your story structure.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-[#111111] mb-1.5">
                Project Title <span className="text-[#FF441F]">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Klausur Panic — Week 14"
                required
                className="w-full border border-[#E5E5E5] rounded-lg px-3.5 py-2.5 text-sm text-[#111111] placeholder:text-[#9A9A9A] focus:outline-none focus:border-[#FF441F] transition-colors"
              />
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-bold text-[#111111] mb-1.5">
                Topic <span className="text-[#FF441F]">*</span>
              </label>
              <textarea
                name="topic"
                value={form.topic}
                onChange={handleChange}
                placeholder={'Describe the situation or theme (e.g. "Klausur morgen, Kapitel 1 von 12")'}
                required
                rows={3}
                className="w-full border border-[#E5E5E5] rounded-lg px-3.5 py-2.5 text-sm text-[#111111] placeholder:text-[#9A9A9A] focus:outline-none focus:border-[#FF441F] transition-colors resize-none"
              />
              <p className="text-xs text-[#9A9A9A] mt-1">
                German campus / student life situations only (→ content_rules.md §1)
              </p>
            </div>

            {/* Content Type */}
            <div>
              <label className="block text-sm font-bold text-[#111111] mb-1.5">
                Content Type (Story Schema)
              </label>
              <select
                name="content_type"
                value={form.content_type}
                onChange={handleChange}
                className="w-full border border-[#E5E5E5] rounded-lg px-3.5 py-2.5 text-sm text-[#111111] focus:outline-none focus:border-[#FF441F] transition-colors bg-white"
              >
                {CONTENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {selectedSchema && (
                <p className="text-xs text-[#9A9A9A] mt-1">{selectedSchema.description}</p>
              )}
            </div>

            {/* Card Count */}
            <div>
              <label className="block text-sm font-bold text-[#111111] mb-1.5">
                Card Count
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  name="card_count"
                  min={5}
                  max={7}
                  value={form.card_count}
                  onChange={handleChange}
                  className="flex-1 accent-[#FF441F]"
                />
                <span className="text-sm font-bold text-[#111111] w-6 text-center">
                  {form.card_count}
                </span>
              </div>
              <p className="text-xs text-[#9A9A9A] mt-1">5–7 cards per post (→ design.md §10)</p>
            </div>
          </div>

          {/* Workflow preview */}
          <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-2xl p-5">
            <p className="text-xs font-bold text-[#9A9A9A] mb-3 uppercase tracking-wider">
              Production Workflow
            </p>
            <div className="flex flex-wrap gap-2">
              {["Story", "Copy", "Prompts", "Images", "Cards", "Figma", "Final"].map((step, i) => (
                <div key={step} className="flex items-center gap-1.5">
                  <span className="text-xs bg-white border border-[#E5E5E5] rounded-md px-2 py-1 text-[#111111] font-medium">
                    {i + 1}. {step}
                  </span>
                  {i < 6 && <span className="text-[#E5E5E5] text-xs">→</span>}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Link
              href="/projects"
              className="flex-1 text-center border border-[#E5E5E5] text-[#9A9A9A] font-bold py-3 px-6 rounded-xl hover:border-[#111111] hover:text-[#111111] transition-colors text-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#FF441F] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#e03a18] transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating…" : "Create Project →"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
