import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getLatestCardDraft } from "@/lib/supabase/queries/card-drafts";
import {
  getGeneratedImages,
  createGeneratedImage,
} from "@/lib/supabase/queries/generated-images";
import { getImageRejectionReasons } from "@/lib/supabase/queries/learning";
import {
  generateCharacterImage,
  editCharacterImageWithReference,
  fetchImageBuffer,
} from "@/lib/image/factchat-client";
import { buildFinalImagePrompt } from "@/lib/config/prompt-pack";
import { StoryDraft, StoryCard } from "@/lib/ai/types";

async function uploadToStorage(
  db: ReturnType<typeof createServiceClient>,
  imageBuffer: Buffer,
  path: string
): Promise<string> {
  const BUCKET = "character-images";

  const { error: bucketErr } = await db.storage.getBucket(BUCKET);
  if (bucketErr) {
    const { error: createErr } = await db.storage.createBucket(BUCKET, {
      public: true,
    });
    if (createErr) throw new Error(createErr.message);
  }

  const { data, error } = await db.storage
    .from(BUCKET)
    .upload(path, imageBuffer, { contentType: "image/png", upsert: false });

  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = db.storage.from(BUCKET).getPublicUrl(data.path);

  return publicUrl;
}

function buildPrompt(
  basePrompt: string,
  revisionFeedback?: string,
  rejectionAvoids?: string[]
): string {
  let prompt = basePrompt;

  if (rejectionAvoids?.length) {
    prompt +=
      `\n\nAVOID (learned from past rejections):\n` +
      rejectionAvoids.map((r) => `- ${r}`).join("\n");
  }

  if (revisionFeedback?.trim()) {
    prompt = `REVISION INSTRUCTION: ${revisionFeedback.trim()}\n\n---\n\n${prompt}`;
  }

  return prompt;
}

function buildCard1ConsistencyPrompt(prompt: string): string {
  return (
    `STYLE CONSISTENCY: The provided reference image is Card 1 — the canonical ` +
    `JeJal character for this storyboard. Maintain the EXACT same visual identity: ` +
    `same body proportions, same #FF441F red, same figure-8 eyes, same flat vector ` +
    `illustration style with no outlines. Only change the pose, expression, and ` +
    `background as specified below.\n\n` +
    prompt
  );
}

function buildUserReferencePrompt(prompt: string): string {
  return (
    `REFERENCE IMAGE: The provided image is a reference uploaded by the creative director. ` +
    `Use it to understand the desired visual style, pose, character design, or specific ` +
    `elements. Apply insights from the reference image as relevant to the instructions below.\n\n` +
    prompt
  );
}

async function parseRequest(request: NextRequest): Promise<{
  card_number: number | undefined;
  regeneration_feedback: string | undefined;
  userReferenceBuffer: Buffer | undefined;
}> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const cardNumberRaw = form.get("card_number");
    const card_number = cardNumberRaw != null ? Number(cardNumberRaw) : undefined;
    const regeneration_feedback = form.get("regeneration_feedback")?.toString();
    const file = form.get("reference_image");
    let userReferenceBuffer: Buffer | undefined;
    if (file instanceof Blob) {
      userReferenceBuffer = Buffer.from(await file.arrayBuffer());
    }
    return { card_number, regeneration_feedback, userReferenceBuffer };
  }

  const body = (await request.json()) as {
    card_number?: number;
    regeneration_feedback?: string;
  };
  return {
    card_number: body.card_number,
    regeneration_feedback: body.regeneration_feedback,
    userReferenceBuffer: undefined,
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let card_number: number | undefined;
  let regeneration_feedback: string | undefined;
  let userReferenceBuffer: Buffer | undefined;

  try {
    ({ card_number, regeneration_feedback, userReferenceBuffer } =
      await parseRequest(request));
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof card_number !== "number" || isNaN(card_number)) {
    return NextResponse.json(
      { error: "card_number (number) is required" },
      { status: 400 }
    );
  }

  try {
    const db = createServiceClient();

    const draft = await getLatestCardDraft(db, id);
    if (!draft) {
      return NextResponse.json(
        { error: "No draft found for this project" },
        { status: 404 }
      );
    }

    const story = draft.cards_json as unknown as StoryDraft;
    const card = story.cards?.find((c: StoryCard) => c.card_number === card_number);
    if (!card) {
      return NextResponse.json(
        { error: `Card ${card_number} not found in draft` },
        { status: 404 }
      );
    }

    // Load rejection patterns globally (best-effort)
    let rejectionAvoids: string[] = [];
    try {
      rejectionAvoids = await getImageRejectionReasons(db);
    } catch {
      // non-critical
    }

    const fullPrompt = buildFinalImagePrompt(card.image_prompt);
    const basePrompt = buildPrompt(fullPrompt, regeneration_feedback, rejectionAvoids);

    let imageBuffer: Buffer;
    let usedReference: "user" | "card1" | "none" = "none";

    if (userReferenceBuffer) {
      // User-provided reference image takes priority
      imageBuffer = await editCharacterImageWithReference({
        prompt: buildUserReferencePrompt(basePrompt),
        referenceBuffer: userReferenceBuffer,
      });
      usedReference = "user";
    } else if (card_number > 1) {
      // For cards 2+, try Card 1 as style reference
      const allImages = await getGeneratedImages(db, id);
      const referenceImg = allImages.find(
        (img) => img.card_number === 1 && img.approved !== false && img.image_url
      );

      if (referenceImg?.image_url) {
        try {
          const referenceBuffer = await fetchImageBuffer(referenceImg.image_url);
          imageBuffer = await editCharacterImageWithReference({
            prompt: buildCard1ConsistencyPrompt(basePrompt),
            referenceBuffer,
          });
          usedReference = "card1";
        } catch {
          // Fallback to fresh generate if edit API fails
          imageBuffer = await generateCharacterImage({ prompt: basePrompt });
        }
      } else {
        imageBuffer = await generateCharacterImage({ prompt: basePrompt });
      }
    } else {
      imageBuffer = await generateCharacterImage({ prompt: basePrompt });
    }

    // Upload to Supabase Storage; fall back to base64 data URL if storage fails
    let imageUrl: string;
    try {
      const storagePath = `${id}/card-${card_number}-${Date.now()}.png`;
      imageUrl = await uploadToStorage(db, imageBuffer, storagePath);
    } catch {
      imageUrl = `data:image/png;base64,${imageBuffer.toString("base64")}`;
    }

    const record = await createGeneratedImage(db, {
      project_id: id,
      card_number,
      prompt: basePrompt,
      negative_prompt: card.negative_prompt,
      provider: "factchat",
      model: "gpt-image-1",
      image_url: imageUrl,
      approved: null,
    });

    return NextResponse.json(
      { image_id: record.id, image_url: imageUrl, card_number, used_reference: usedReference },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
