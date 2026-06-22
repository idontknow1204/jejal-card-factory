import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";

// Service-role client: bypasses RLS — use only in server-side API routes.
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars"
    );
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}
