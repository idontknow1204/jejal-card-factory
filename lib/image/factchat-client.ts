function getConfig() {
  const baseUrl =
    process.env.FACTCHAT_IMAGE_BASE_URL ?? "https://factchat-cloud.mindlogic.ai";
  const apiKey = process.env.FACTCHAT_IMAGE_API_KEY;

  if (!apiKey || apiKey === "your-api-key-here") {
    throw new Error("Missing or placeholder FACTCHAT_IMAGE_API_KEY env var");
  }

  return { baseUrl, apiKey };
}

async function extractImageBuffer(res: Response): Promise<Buffer> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.startsWith("image/")) {
    return Buffer.from(await res.arrayBuffer());
  }

  const json = (await res.json()) as {
    data?: Array<{ b64_json?: string; url?: string }>;
  };
  const item = json.data?.[0];

  if (item?.b64_json) return Buffer.from(item.b64_json, "base64");

  if (item?.url) {
    const imgRes = await fetch(item.url);
    if (!imgRes.ok) throw new Error(`Failed to fetch image from URL: ${item.url}`);
    return Buffer.from(await imgRes.arrayBuffer());
  }

  throw new Error(`Unexpected Factchat response shape: ${JSON.stringify(json)}`);
}

export async function generateCharacterImage({
  prompt,
  size = "1024x1024",
}: {
  prompt: string;
  size?: "1024x1024" | "1536x1024" | "1024x1536" | "auto";
}): Promise<Buffer> {
  const { baseUrl, apiKey } = getConfig();

  const res = await fetch(`${baseUrl}/v1/api/openai/images/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: "gpt-image-1", prompt, n: 1, size }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "(no body)");
    throw new Error(`Factchat generate API ${res.status}: ${body}`);
  }

  return extractImageBuffer(res);
}

export async function editCharacterImageWithReference({
  prompt,
  referenceBuffer,
  size = "1024x1024",
}: {
  prompt: string;
  referenceBuffer: Buffer;
  size?: "1024x1024" | "1536x1024" | "1024x1536" | "auto";
}): Promise<Buffer> {
  const { baseUrl, apiKey } = getConfig();

  const ab = referenceBuffer.buffer.slice(
    referenceBuffer.byteOffset,
    referenceBuffer.byteOffset + referenceBuffer.byteLength
  ) as ArrayBuffer;

  const form = new FormData();
  form.append("model", "gpt-image-1");
  form.append("image[]", new Blob([ab], { type: "image/png" }), "reference.png");
  form.append("prompt", prompt);
  form.append("size", size);
  form.append("n", "1");

  const res = await fetch(`${baseUrl}/v1/api/openai/images/edits`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "(no body)");
    throw new Error(`Factchat edit API ${res.status}: ${body}`);
  }

  return extractImageBuffer(res);
}

export async function fetchImageBuffer(url: string): Promise<Buffer> {
  if (url.startsWith("data:")) {
    const base64 = url.split(",")[1];
    if (!base64) throw new Error("Invalid data URL");
    return Buffer.from(base64, "base64");
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch reference image: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}
