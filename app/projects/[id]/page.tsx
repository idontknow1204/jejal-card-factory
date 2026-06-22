import Link from "next/link";

const WORKFLOW_STEPS = [
  { slug: "story", label: "Story", description: "5–7 card narrative structure" },
  { slug: "copy", label: "Copy", description: "Card text editing" },
  { slug: "prompts", label: "Prompts", description: "Character image prompts" },
  { slug: "images", label: "Images", description: "Generated character images" },
  { slug: "cards", label: "Cards", description: "Rendered card preview" },
  { slug: "figma", label: "Figma", description: "Export to Figma" },
  { slug: "final", label: "Final", description: "Approval & learning data" },
];

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="bg-white border-b border-[#E5E5E5] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href="/projects" className="text-[#9A9A9A] hover:text-[#111111] transition-colors text-sm">
            ← Projects
          </Link>
          <span className="text-[#E5E5E5]">/</span>
          <span className="font-bold text-[#111111] text-sm">Project {id}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs bg-[#FF441F] text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Draft
            </span>
            <span className="text-xs text-[#9A9A9A] font-mono">{id}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#111111]">Untitled Project</h1>
          <p className="text-[#9A9A9A] text-sm mt-1">—</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WORKFLOW_STEPS.map((step, i) => (
            <Link
              key={step.slug}
              href={`/projects/${id}/${step.slug}`}
              className="bg-white border border-[#E5E5E5] rounded-2xl p-5 hover:border-[#FF441F] hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-[#9A9A9A] font-bold">{i + 1}</span>
                <span className="text-xs text-[#E5E5E5] bg-[#FAFAFA] rounded-md px-2 py-0.5 font-medium">
                  pending
                </span>
              </div>
              <p className="font-bold text-[#111111] group-hover:text-[#FF441F] transition-colors">
                {step.label}
              </p>
              <p className="text-xs text-[#9A9A9A] mt-0.5">{step.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
