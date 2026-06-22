import { readDesignDoc } from "./docs";

let _characterBibleCache: string | null = null;
function getCharacterBible(): string {
  if (!_characterBibleCache) _characterBibleCache = readDesignDoc("characterBible");
  return _characterBibleCache;
}

// Returns the Character Lock Block text (§13 of character_bible.md)
export function getCharacterLockBlock(): string {
  const match = getCharacterBible().match(/## 13[\s\S]*?```text([\s\S]*?)```/);
  return match?.[1]?.trim() ?? "";
}

// Returns the Negative Prompt Block text (§14 of character_bible.md)
export function getNegativePromptBlock(): string {
  const match = getCharacterBible().match(/## 14[\s\S]*?```text([\s\S]*?)```/);
  return match?.[1]?.trim() ?? "";
}

// Prepends the Character Lock Block to a variable image prompt if not already present.
export function buildFinalImagePrompt(variablePrompt: string): string {
  const lock = getCharacterLockBlock();
  if (!lock || variablePrompt.startsWith("[JEJAL CHARACTER LOCK")) {
    return variablePrompt; // already full prompt (legacy format)
  }
  return `${lock}\n\nVARIABLE THIS RENDER:\n${variablePrompt}`;
}

export function getJeJalPromptPack(learnedPatterns?: string): string {
  const storySchema = readDesignDoc("storySchema");
  const contentRules = readDesignDoc("contentRules");
  const copywritingRules = readDesignDoc("copywritingRules");
  const characterBible = getCharacterBible();
  const exampleLibrary = readDesignDoc("exampleLibrary");

  const emotionTableMatch = characterBible.match(/## 9\. Allowed Emotions[\s\S]*?---/);
  const poseTableMatch = characterBible.match(/## 10\. Allowed Poses[\s\S]*?---/);
  const emotionMappingMatch = characterBible.match(/### 9\.1[\s\S]*?---/);

  const characterSection = [
    "## CHARACTER: JeJal",
    "JeJal = soft, rounded, amorphous slime/hoodie mascot. Red (#FF441F) = protagonist. NO mouth. Eyes only for emotion.",
    "",
    emotionTableMatch ? emotionTableMatch[0] : "",
    emotionMappingMatch ? "### Emotion → Story Schema mapping\n" + emotionMappingMatch[0] : "",
    poseTableMatch ? poseTableMatch[0] : "",
  ]
    .filter(Boolean)
    .join("\n");

  const exampleCardsMatch = exampleLibrary.match(
    /## 1\. Example 1[\s\S]*?(?=## 5\. 고정 자산)/
  );
  const exampleCards = exampleCardsMatch
    ? exampleCardsMatch[0]
        .replace(/### \d+\.\d+ 분석[\s\S]*?(?=\| #)/g, "")
        .trim()
    : "";

  return `
# JeJal Card Factory — Story Generation Rules

## IDENTITY
JeJal = German university student meme card brand. 5–7 card Instagram carousels. Target: German Gen Z / Uni students.
Content language: German (casual, student tone). Design docs: locked. Do not improvise beyond these rules.

---

## STORY SCHEMAS
${storySchema}

---

## CONTENT RULES
${contentRules}

---

## COPYWRITING RULES
${copywritingRules}

---

${characterSection}

---

## VERIFIED EXAMPLES (ground truth — match this quality)
${exampleCards}

---

## IMAGE PROMPT RULES
- image_prompt = VARIABLE PARTS ONLY. Do NOT copy or repeat the Character Lock Block header.
  Write 2–4 lines describing: Pose, Expression (eyes), small Prop (optional), Looking direction.
  Example: "Pose: Lugend (peeking from door edge)\nExpression: Neugier (wide curious eyes)\nProp: none\nDirection: looking right"
- The server automatically prepends the Character Lock Block to every image_prompt.
- Do NOT include negative_prompt. The server fills it in automatically.
- NO text in images. Text is rendered by the layout engine.
- character_action = pose name (e.g. Lugend, Sitzend, Zeigend, Schockiert)
- character_emotion = emotion name (e.g. Neugier, Schock, Müdigkeit, Stolz)
${
  learnedPatterns
    ? `\n---\n\n## LEARNED FROM PAST APPROVED WORK\nThe editor has approved the following patterns in previous projects. Prioritize them in copy and structure:\n\n${learnedPatterns}`
    : ""
}
`.trim();
}
