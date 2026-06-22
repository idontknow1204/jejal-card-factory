import Link from "next/link";

export default async function FigmaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="bg-white border-b border-[#E5E5E5] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href={`/projects/${id}`} className="text-[#9A9A9A] hover:text-[#111111] transition-colors text-sm">
            ← Project
          </Link>
          <span className="text-[#E5E5E5]">/</span>
          <span className="font-bold text-[#111111] text-sm">6. Figma</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#111111]">Figma Export</h1>
          <p className="text-[#9A9A9A] text-sm mt-1">
            Export card set to Figma for final CMO visual editing (figma_export_spec.md)
          </p>
        </div>
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-10 text-center">
          <p className="text-[#9A9A9A] font-medium">Figma REST API export — coming soon</p>
          <p className="text-xs text-[#9A9A9A] mt-2">
            Cards exported as editable Figma frames. Text layers remain live.
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <Link
              href={`/projects/${id}/cards`}
              className="text-sm border border-[#E5E5E5] text-[#9A9A9A] font-bold px-4 py-2 rounded-lg hover:border-[#111111] hover:text-[#111111] transition-colors"
            >
              ← Cards
            </Link>
            <Link
              href={`/projects/${id}/final`}
              className="text-sm bg-[#111111] text-white font-bold px-4 py-2 rounded-lg hover:bg-[#FF441F] transition-colors"
            >
              Next: Final →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
