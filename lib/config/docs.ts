import path from "path";
import { readFileSync } from "fs";

// Registry — maps logical names to file paths under /design
export const DESIGN_DOCS = {
  design: {
    path: "design/design.md",
    description: "Visual system spec — canvas sizes, layout zones, typography, character placement",
  },
  storySchema: {
    path: "design/story_schema.md",
    description: "7 story schemas (POV, Situation, Warning, Meetup, Study, Mensa, Team)",
  },
  contentRules: {
    path: "design/content_rules.md",
    description: "Allowed topics, guardrails, German tone, humor types",
  },
  copywritingRules: {
    path: "design/copywriting_rules.md",
    description: "Card text style rules, punchline rules, reusable patterns",
  },
  characterBible: {
    path: "design/character_bible.md",
    description: "JeJal character identity, expressions, poses, color codes",
  },
  exampleLibrary: {
    path: "design/example_library.md",
    description: "Verified example posts (Storyboard 1/2/3)",
  },
  figmaExportSpec: {
    path: "design/figma_export_spec.md",
    description: "Figma REST API export specification",
  },
} as const;

export type DocKey = keyof typeof DESIGN_DOCS;

/**
 * Read a design doc by its logical key.
 * Server-side only (uses fs).
 */
export function readDesignDoc(key: DocKey): string {
  const info = DESIGN_DOCS[key];
  const filePath = path.join(process.cwd(), info.path);
  return readFileSync(filePath, "utf-8");
}

/**
 * Read all design docs and return as a map of key → content.
 * Server-side only (uses fs).
 */
export function getAllDesignDocs(): Record<DocKey, string> {
  return Object.fromEntries(
    (Object.keys(DESIGN_DOCS) as DocKey[]).map((key) => [key, readDesignDoc(key)])
  ) as Record<DocKey, string>;
}
