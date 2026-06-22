"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AccessDeniedPage() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-16">
      <div className="max-w-sm w-full space-y-8 text-center">
        <div>
          <div className="inline-block bg-red-100 text-red-600 text-xs font-bold tracking-widest px-3 py-1 rounded-full mb-4 uppercase">
            Access Denied
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#111111]">
            Not authorised
          </h1>
          <p className="mt-3 text-sm text-[#9A9A9A] leading-relaxed">
            Your account does not have access to this tool. Only the designated
            internal team account may sign in.
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full bg-[#111111] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#FF441F] transition-colors"
        >
          Sign out & go to login
        </button>

        <p className="text-xs text-[#9A9A9A]">
          Je-Jal.com · Internal tool — authorised users only
        </p>
      </div>
    </main>
  );
}
