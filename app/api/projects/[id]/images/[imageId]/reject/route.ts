import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { rejectGeneratedImage } from "@/lib/supabase/queries/generated-images";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const { imageId } = await params;

  let reason = "";
  try {
    const body = await request.json();
    reason = typeof body.reason === "string" ? body.reason : "";
  } catch {
    // reason is optional
  }

  try {
    const db = createServiceClient();
    await rejectGeneratedImage(db, imageId, reason);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
