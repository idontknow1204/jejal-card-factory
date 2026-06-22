import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import { getCardProjects } from "@/lib/supabase/queries/card-projects";
import { CardProject } from "@/lib/supabase/types";

const CONTENT_TYPE_LABELS: Record<string, string> = {
  pov: "POV",
  situation: "Situation",
  warning: "Warning",
  meetup: "Meetup",
  study: "Study / Exam",
  mensa: "Mensa / Food",
  team: "Team Project",
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-[#F2F2F2] text-[#9A9A9A]",
  story: "bg-blue-50 text-blue-600",
  copy: "bg-purple-50 text-purple-600",
  prompts: "bg-yellow-50 text-yellow-600",
  images: "bg-orange-50 text-orange-600",
  cards: "bg-pink-50 text-pink-600",
  figma: "bg-indigo-50 text-indigo-600",
  approved: "bg-green-50 text-green-600",
  rejected: "bg-red-50 text-red-500",
};

async function fetchProjects(): Promise<{ projects: CardProject[]; error: string | null }> {
  try {
    const client = createServiceClient();
    const projects = await getCardProjects(client);
    return { projects, error: null };
  } catch (err) {
    return {
      projects: [],
      error: err instanceof Error ? err.message : "Failed to load projects",
    };
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function ProjectsPage() {
  const { projects, error } = await fetchProjects();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="bg-white border-b border-[#E5E5E5] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="font-extrabold text-lg text-[#111111] hover:text-[#FF441F] transition-colors"
          >
            JeJal<span className="text-[#FF441F]">.</span>
          </Link>
          <Link
            href="/projects/new"
            className="bg-[#FF441F] text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#e03a18] transition-colors"
          >
            + New Project
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-[#111111]">Projects</h1>
          <p className="text-[#9A9A9A] text-sm mt-1">All card post production projects</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600 font-medium">
              Could not connect to Supabase: {error}
            </p>
            <p className="text-xs text-red-400 mt-1">
              Check your .env.local file for NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
            </p>
          </div>
        )}

        {!error && projects.length === 0 && (
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-[#9A9A9A] font-medium">No projects yet</p>
            <p className="text-[#9A9A9A] text-sm mt-1">Start by creating your first project</p>
            <Link
              href="/projects/new"
              className="inline-block mt-6 bg-[#111111] text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-[#FF441F] transition-colors"
            >
              + New Project
            </Link>
          </div>
        )}

        {projects.length > 0 && (
          <div className="space-y-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center justify-between bg-white border border-[#E5E5E5] rounded-2xl px-5 py-4 hover:border-[#FF441F] hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="min-w-0">
                    <p className="font-bold text-[#111111] group-hover:text-[#FF441F] transition-colors truncate">
                      {project.title}
                    </p>
                    <p className="text-xs text-[#9A9A9A] truncate mt-0.5">{project.topic}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="hidden sm:inline text-xs text-[#9A9A9A] font-medium">
                    {CONTENT_TYPE_LABELS[project.content_type] ?? project.content_type}
                  </span>
                  <span className="hidden sm:inline text-xs text-[#9A9A9A]">
                    {project.card_count ?? 5} cards
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                      STATUS_STYLES[project.status ?? "draft"] ?? STATUS_STYLES.draft
                    }`}
                  >
                    {project.status ?? "draft"}
                  </span>
                  <span className="hidden md:inline text-xs text-[#9A9A9A]">
                    {formatDate(project.created_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
