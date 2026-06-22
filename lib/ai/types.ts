// Shape of one card in a generated story draft
export interface StoryCard {
  card_number: number;
  role: string;
  top_text: string;
  character_action: string;
  character_emotion: string;
  image_prompt: string;
  negative_prompt?: string;
}

// Shape of the full story draft returned by Claude
export interface StoryDraft {
  title: string;
  topic: string;
  content_type: string;
  cards: StoryCard[];
}

// Runtime type guard
export function isStoryDraft(value: unknown): value is StoryDraft {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.title === "string" &&
    typeof v.topic === "string" &&
    typeof v.content_type === "string" &&
    Array.isArray(v.cards) &&
    v.cards.length >= 1
  );
}
