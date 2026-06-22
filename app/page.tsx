import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-16">
      <div className="max-w-xl w-full space-y-8 text-center">
        <div>
          <div className="inline-block bg-[#FF441F] text-white text-xs font-bold tracking-widest px-3 py-1 rounded-full mb-4 uppercase">
            Internal Tool
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-[#111111]">
            JeJal<span className="text-[#FF441F]">.</span>
          </h1>
          <p className="mt-2 text-lg text-[#9A9A9A] font-medium">
            Card Factory
          </p>
        </div>

        <p className="text-[#9A9A9A] text-sm leading-relaxed">
          Content production studio for JeJal feed &amp; card posts.
          <br />
          Enter a topic → generate a 5–7 card story → render &amp; export to Figma.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/projects"
            className="block w-full bg-[#111111] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#FF441F] transition-colors"
          >
            View Projects
          </Link>
          <Link
            href="/projects/new"
            className="block w-full border border-[#E5E5E5] text-[#111111] font-bold py-3 px-6 rounded-xl hover:border-[#FF441F] hover:text-[#FF441F] transition-colors"
          >
            + New Project
          </Link>
        </div>

        <div className="pt-4 border-t border-[#E5E5E5]">
          <p className="text-xs text-[#9A9A9A]">
            Je-Jal.com · Alles Wichtige für deinen Uni-Tag in einer App
          </p>
        </div>
      </div>
    </main>
  );
}
