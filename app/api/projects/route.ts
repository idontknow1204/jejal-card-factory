import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createCardProject, getCardProjects } from "@/lib/supabase/queries/card-projects";

export async function GET() {
  try {
    const client = createServiceClient();
    const projects = await getCardProjects(client);
    return NextResponse.json(projects);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, topic, content_type, card_count } = body;

    if (!title || !topic || !content_type) {
      return NextResponse.json(
        { error: "title, topic, and content_type are required" },
        { status: 400 }
      );
    }

    const client = createServiceClient();
    const project = await createCardProject(client, {
      title,
      topic,
      content_type,
      card_count: Number(card_count) || 5,
      created_by: null,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
