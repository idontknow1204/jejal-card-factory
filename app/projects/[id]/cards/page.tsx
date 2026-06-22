import Link from "next/link";
import { CSSProperties } from "react";
import { createServiceClient } from "@/lib/supabase/service";
import { getCardProject } from "@/lib/supabase/queries/card-projects";
import { getLatestCardDraft } from "@/lib/supabase/queries/card-drafts";
import { getGeneratedImages } from "@/lib/supabase/queries/generated-images";
import { StoryDraft, StoryCard } from "@/lib/ai/types";
import { GeneratedCharacterImage } from "@/lib/supabase/types";

// ─── Canvas constants (actual Instagram card size) ───────────────────────────
const CW = 1080; // canvas width  px
const CH = 1350; // canvas height px

// Character: ~1/8 of total canvas area
const CHAR_SIZE = Math.round(Math.sqrt((CW * CH) / 8)); // ≈ 427 px

// ─── Preview scale ────────────────────────────────────────────────────────────
const PW = 270; // preview width  px (in browser)
const S = PW / CW; // scale = 0.25
const PH = Math.round(CH * S); // preview height ≈ 338 px

// ─── Shared font base ─────────────────────────────────────────────────────────
const FONT = "var(--font-plus-jakarta-sans), 'Plus Jakarta Sans', system-ui, sans-serif";

// ─── Helper ──────────────────────────────────────────────────────────────────
function px(n: number): string {
  return `${n}px`;
}

// ─── Cover Card (card 1 / role: cover) ───────────────────────────────────────
function CoverCard({
  card,
  img,
}: {
  card: StoryCard;
  img?: GeneratedCharacterImage;
}) {
  const containerStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  };

  const textWrapStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: `0 ${px(90)}`,
    zIndex: 2,
  };

  // title spec: ExtraBold 800 · 85px · 93px line-height · -4.25px letter-spacing
  const textStyle: CSSProperties = {
    fontFamily: FONT,
    fontSize: px(85),
    fontStyle: "normal",
    fontWeight: 800,
    lineHeight: px(93),
    letterSpacing: px(-4.25),
    textAlign: "center",
    color: "#111111",
    whiteSpace: "pre-line",
    margin: 0,
  };

  // Character peeks from bottom-right
  const charStyle: CSSProperties = {
    position: "absolute",
    right: px(-40),
    bottom: 0,
    width: px(500),
    height: px(500),
    zIndex: 3,
    objectFit: "contain",
    objectPosition: "right bottom",
  };

  // "swipe weiter !" speech bubble
  const bubbleStyle: CSSProperties = {
    position: "absolute",
    right: px(360),
    bottom: px(340),
    backgroundColor: "#F2F2F2",
    borderRadius: px(24),
    padding: `${px(16)} ${px(32)}`,
    fontFamily: FONT,
    fontSize: px(40),
    fontWeight: 600,
    color: "#111111",
    whiteSpace: "nowrap",
    zIndex: 4,
  };

  return (
    <div style={containerStyle}>
      {/* Centered POV text */}
      <div style={textWrapStyle}>
        <p style={textStyle}>{card.top_text}</p>
      </div>

      {/* Character peeking */}
      {img?.image_url && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.image_url} alt="" style={charStyle} />
          <div style={bubbleStyle}>swipe weiter !</div>
        </>
      )}

      {/* Placeholder when no image */}
      {!img?.image_url && (
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: px(400),
            height: px(400),
            backgroundColor: "#F2F2F2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <span style={{ fontSize: px(60), color: "#BEBEBE" }}>?</span>
        </div>
      )}
    </div>
  );
}

// ─── Content Card (cards 2…N-1) ──────────────────────────────────────────────
function ContentCard({
  card,
  img,
}: {
  card: StoryCard;
  img?: GeneratedCharacterImage;
}) {
  const containerStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  };

  // Top text area: y 110–430 per design.md §2.2
  const topAreaStyle: CSSProperties = {
    position: "absolute",
    top: px(110),
    left: px(90),
    right: px(90),
    height: px(320),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  // content text spec: SemiBold 600 · 75px · 85px line-height · -3.75px letter-spacing
  const textStyle: CSSProperties = {
    fontFamily: FONT,
    fontSize: px(75),
    fontStyle: "normal",
    fontWeight: 600,
    lineHeight: px(85),
    letterSpacing: px(-3.75),
    textAlign: "center",
    color: "#111111",
    whiteSpace: "pre-line",
    margin: 0,
  };

  // Character area: y 430–1180, centered, 1/8 of page area
  const charAreaStyle: CSSProperties = {
    position: "absolute",
    top: px(430),
    left: 0,
    right: 0,
    bottom: px(170),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const charImgStyle: CSSProperties = {
    width: px(CHAR_SIZE),
    height: px(CHAR_SIZE),
    objectFit: "contain",
  };

  return (
    <div style={containerStyle}>
      {/* Top text */}
      <div style={topAreaStyle}>
        <p style={textStyle}>{card.top_text}</p>
      </div>

      {/* Character */}
      <div style={charAreaStyle}>
        {img?.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img.image_url} alt="" style={charImgStyle} />
        ) : (
          <div
            style={{
              width: px(CHAR_SIZE),
              height: px(CHAR_SIZE),
              backgroundColor: "#F2F2F2",
              borderRadius: px(32),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: px(80), color: "#BEBEBE" }}>?</span>
          </div>
        )}
      </div>

      {/* Bottom logo slot — Je-Jal.com */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: px(170),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: FONT,
            fontSize: px(36),
            fontWeight: 600,
            color: "#9A9A9A",
            letterSpacing: px(-1),
          }}
        >
          Je-Jal.com
        </span>
      </div>
    </div>
  );
}

// ─── Closing Card ─────────────────────────────────────────────────────────────
function ClosingCard() {
  const containerStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: px(40),
  };

  const iconStyle: CSSProperties = {
    width: px(220),
    height: px(220),
    backgroundColor: "#FF441F",
    borderRadius: px(52),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div style={containerStyle}>
      {/* App icon placeholder */}
      <div style={iconStyle}>
        <span
          style={{
            fontFamily: FONT,
            fontSize: px(100),
            fontWeight: 800,
            color: "#FFFFFF",
            lineHeight: 1,
          }}
        >
          J
        </span>
      </div>

      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: FONT,
            fontSize: px(85),
            fontWeight: 800,
            lineHeight: px(93),
            letterSpacing: px(-4.25),
            color: "#111111",
            margin: 0,
          }}
        >
          JeJal
        </p>
        <p
          style={{
            fontFamily: FONT,
            fontSize: px(40),
            fontWeight: 400,
            lineHeight: px(54),
            color: "#9A9A9A",
            margin: `${px(24)} 0 0`,
            whiteSpace: "pre-line",
            textAlign: "center",
          }}
        >
          {"Alles Wichtige für deinen\nUni-Tag in einer App"}
        </p>
        <p
          style={{
            fontFamily: FONT,
            fontSize: px(44),
            fontWeight: 600,
            lineHeight: px(54),
            letterSpacing: px(-2),
            color: "#9A9A9A",
            margin: `${px(32)} 0 0`,
          }}
        >
          Je-Jal.com
        </p>
      </div>
    </div>
  );
}

// ─── Single scaled card preview ───────────────────────────────────────────────
function CardPreview({
  card,
  img,
  isApproved,
  isRejected,
}: {
  card: StoryCard;
  img?: GeneratedCharacterImage;
  isApproved: boolean;
  isRejected: boolean;
}) {
  const isCover = card.card_number === 1;
  const isClosing = card.role?.toLowerCase().includes("clos");

  const wrapperStyle: CSSProperties = {
    width: px(PW),
    height: px(PH),
    position: "relative",
    overflow: "hidden",
    borderRadius: "12px",
    flexShrink: 0,
    border: `2px solid ${
      isApproved ? "#4ade80" : isRejected ? "#f87171" : isCover ? "#FF441F" : "#E5E5E5"
    }`,
  };

  const innerStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: px(CW),
    height: px(CH),
    transform: `scale(${S})`,
    transformOrigin: "top left",
  };

  return (
    <div style={wrapperStyle}>
      <div style={innerStyle}>
        {isCover && <CoverCard card={card} img={img} />}
        {!isCover && !isClosing && <ContentCard card={card} img={img} />}
        {isClosing && <ClosingCard />}
      </div>

      {/* Card number badge */}
      <div
        style={{
          position: "absolute",
          top: "6px",
          left: "6px",
          backgroundColor: isCover ? "#FF441F" : "rgba(0,0,0,0.45)",
          color: "#fff",
          borderRadius: "6px",
          padding: "2px 6px",
          fontSize: "10px",
          fontWeight: 700,
          fontFamily: FONT,
          zIndex: 10,
        }}
      >
        {card.card_number}
      </div>

      {/* Status badge */}
      {(isApproved || isRejected) && (
        <div
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            backgroundColor: isApproved ? "#4ade80" : "#f87171",
            color: "#fff",
            borderRadius: "6px",
            padding: "2px 6px",
            fontSize: "10px",
            fontWeight: 700,
            zIndex: 10,
          }}
        >
          {isApproved ? "✓" : "✗"}
        </div>
      )}
    </div>
  );
}

// ─── Data loading ─────────────────────────────────────────────────────────────
async function loadData(projectId: string) {
  try {
    const db = createServiceClient();
    const [project, draft, images] = await Promise.all([
      getCardProject(db, projectId),
      getLatestCardDraft(db, projectId),
      getGeneratedImages(db, projectId),
    ]);

    let cards: StoryCard[] = [];
    if (draft?.cards_json) {
      const story = draft.cards_json as unknown as StoryDraft;
      if (Array.isArray(story.cards)) cards = story.cards;
    }

    const imageMap: Record<number, GeneratedCharacterImage> = {};
    for (const img of images) {
      const existing = imageMap[img.card_number];
      if (!existing || (img.created_at ?? "") > (existing.created_at ?? "")) {
        imageMap[img.card_number] = img;
      }
    }

    return { project, cards, imageMap, error: null };
  } catch (err) {
    return {
      project: null,
      cards: [] as StoryCard[],
      imageMap: {} as Record<number, GeneratedCharacterImage>,
      error: err instanceof Error ? err.message : "Failed to load",
    };
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function CardsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { project, cards, imageMap, error } = await loadData(id);

  const generatable = cards.filter(
    (c) => !c.role?.toLowerCase().includes("clos")
  );
  const approvedCount = generatable.filter(
    (c) => imageMap[c.card_number]?.approved === true
  ).length;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="bg-white border-b border-[#E5E5E5] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link
            href={`/projects/${id}`}
            className="text-[#9A9A9A] hover:text-[#111111] transition-colors text-sm"
          >
            ← Project
          </Link>
          <span className="text-[#E5E5E5]">/</span>
          <span className="font-bold text-[#111111] text-sm">5. Cards</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#111111]">
              {project?.title ? `${project.title} — Cards` : "Card Preview"}
            </h1>
            <p className="text-[#9A9A9A] text-sm mt-1">
              1080×1350 · Plus Jakarta Sans · {approvedCount} / {generatable.length} approved
            </p>
          </div>
          {approvedCount < generatable.length && (
            <Link
              href={`/projects/${id}/images`}
              className="text-sm text-[#FF441F] font-bold hover:underline"
            >
              ← Back to Images
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {cards.length === 0 && !error && (
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-10 text-center">
            <p className="text-[#9A9A9A] font-medium">No story generated yet.</p>
            <Link
              href={`/projects/${id}/story`}
              className="inline-block mt-4 text-sm bg-[#111111] text-white font-bold px-4 py-2 rounded-lg hover:bg-[#FF441F] transition-colors"
            >
              ← Generate story first
            </Link>
          </div>
        )}

        {/* Horizontal carousel preview */}
        {cards.length > 0 && (
          <div
            className="flex gap-4 overflow-x-auto pb-4"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {cards.map((card) => {
              const img = imageMap[card.card_number];
              const isApproved = img?.approved === true;
              const isRejected = img?.approved === false;
              return (
                <div
                  key={card.card_number}
                  style={{ scrollSnapAlign: "start" }}
                  className="space-y-2"
                >
                  <CardPreview
                    card={card}
                    img={img}
                    isApproved={isApproved}
                    isRejected={isRejected}
                  />
                  <p className="text-[10px] text-[#9A9A9A] text-center font-medium truncate" style={{ width: PW }}>
                    {card.role ?? `Card ${card.card_number}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
          <Link
            href={`/projects/${id}/images`}
            className="text-sm border border-[#E5E5E5] text-[#9A9A9A] font-bold px-4 py-2 rounded-lg hover:border-[#111111] hover:text-[#111111] transition-colors"
          >
            ← Images
          </Link>
          <Link
            href={`/projects/${id}/final`}
            className="text-sm bg-[#111111] text-white font-bold px-4 py-2 rounded-lg hover:bg-[#FF441F] transition-colors"
          >
            Continue to Final →
          </Link>
        </div>
      </main>
    </div>
  );
}
