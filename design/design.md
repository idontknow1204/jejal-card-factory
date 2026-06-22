# design.md — JeJal Card Factory Visual System

> **Status:** Locked production specification.
> **Scope:** Defines the *fixed* visual system for all JeJal card-news / meme-card content.
> **Authority:** This file overrides any model improvisation. If a generator or designer deviates from this spec, the output is **rejected**. No exceptions without a versioned update to this file.

---

## 0. Product Summary

JeJal cards are short, POV-style student meme cards built around a single recurring character ("JeJal"). They are produced as Instagram carousels (5–7 cards per post) and later converted to Reels/Story.

**One-line description of every post:**
White background → short text at top → centered JeJal character → optional logo/handle at bottom. Same skeleton every time. Only the contents of the slots change.

---

## 1. Canvas Sizes

Two and only two canvas sizes are allowed.

| Use | Width | Height | Aspect | Notes |
|-----|-------|--------|--------|-------|
| **Instagram carousel** (primary) | 1080 px | 1350 px | 4:5 | Default output. All cards in a post share this size. |
| **Reels / Story** (secondary) | 1080 px | 1920 px | 9:16 | For Reels/Story conversion. Same composition, re-flowed vertically per §9. |

Rules:
- Resolution is fixed at **1080 px wide**. Never export below 1080 px.
- Color space: **sRGB**. Export **PNG** (lossless) for production masters; JPG only for final upload if required.
- DPI metadata is irrelevant for social; pixel dimensions above are the source of truth.
- Do **not** mix sizes inside one carousel. One post = one canvas size.

---

## 2. Layout

All coordinates below are absolute pixels. Origin `(0,0)` is the **top-left** corner.

> ⚠️ **Provisional values.** The margins, zone heights, and Y-coordinates in §2 (and the character placement coordinates in §4) are working defaults. They will be **re-measured and finalized after analyzing the final/reference example images** (완성본·완성 예시 이미지). When those images are provided, this section is updated to match the real composition, and this notice is removed.

### 2.0 Card Layout Types (검증된 4종)

승인 예시([[example_library.md]]) 분석 결과, 카드는 **단일 레이아웃이 아니라 4종**이다. 각 카드는 아래 중 하나를 따른다.

| 레이아웃 | 용도 | 텍스트 위치 | 캐릭터 |
|----------|------|------------|--------|
| **(a) Cover** | 포스트 1번 카드 | 화면 **중앙 세로**, `POV:`로 시작 2~3줄 | **우하단 모서리에서 빼꼼** + `swipe weiter !` 회색 말풍선 |
| **(b) Single-content** | 단일 서사 본문 | **상단**(§2.2 top text area) | 중앙 (§4) |
| **(c) Split-comparison** | Erwartung vs. Realität | **하단 캡션** 2줄 (`Erwartung:`/`Realität:`) | 좌(흰 배경) / 우(회색 배경) 각 패널 중앙 |
| **(d) Closing** | 포스트 마지막 카드 | 중앙 워드마크/태그라인 | 앱 아이콘(고정 에셋) |

- 아래 §2.2/§2.3의 존 좌표는 **(b) Single-content 기준.** (a)(c)(d)는 자체 규칙을 따른다.
- (c) Split-comparison: 캔버스를 좌/우 50:50 분할, 좌측 `#FFFFFF` / 우측 회색(`#F2F2F2`~`#EDEDED`). 텍스트는 각 패널 하단 중앙, 2줄(`라벨:\n굵은 디테일`).
- (d) Closing: 고정 에셋. 앱 아이콘 + `JeJal` 워드마크 + 태그라인 `Alles Wichtige für deinen Uni-Tag in einer App` + 하단 `Je-Jal.com`. **재생성 금지, 동일 에셋 재사용.** → [[example_library.md]] §5.2.
- 색코드(전 레이아웃 공통): 🔴 `#FF441F`=주인공(나) / ⚪ 회색=타인·NPC / ⚫ 검정 라인아트=환경·가구·소품. → [[character_bible.md]] §7.1, §8.

### 2.1 Global margins (safe frame)

| Token | Carousel (1080×1350) | Reels (1080×1920) |
|-------|----------------------|-------------------|
| `margin.x` (left & right) | 90 px | 90 px |
| `margin.top` | 110 px | 220 px |
| `margin.bottom` | 110 px | 320 px |

- Nothing meaningful (text, character core, logo) may touch or cross the margin into the canvas edge.
- The Reels extra top/bottom margin protects content from platform UI overlays (caption, profile, action buttons, progress bar).

### 2.2 Vertical zones — Carousel (1080×1350)

| Zone | Y start | Y end | Height | Purpose |
|------|---------|-------|--------|---------|
| **Top text area** | 110 | 430 | 320 px | Short text. See §3. |
| **Character area** | 430 | 1180 | 750 px | Centered JeJal character. See §4. |
| **Bottom safe area** | 1180 | 1350 | 170 px | Logo / handle only. See §6. |

### 2.3 Vertical zones — Reels (1080×1920)

| Zone | Y start | Y end | Height | Purpose |
|------|---------|-------|--------|---------|
| **Top text area** | 220 | 620 | 400 px | Short text. |
| **Character area** | 620 | 1560 | 940 px | Centered JeJal character. |
| **Bottom safe area** | 1560 | 1700 | 140 px | Logo / handle only. |
| **Reserved UI buffer** | 1700 | 1920 | 220 px | Keep empty. Platform UI lives here. |

### 2.4 Alignment

- **Horizontal:** everything is **center-aligned** on the canvas centerline (`x = 540`).
- **Text:** center-aligned, both axis and text-align.
- **Character:** horizontally centered on `x = 540`.
- **Logo/handle:** horizontally centered on `x = 540`.
- No left- or right-justified elements. No diagonal or rotated layout.

---

## 3. Typography

### 3.1 Font family

- **Primary:** `Plus Jakarta Sans` (Latin display/body font for headlines and handle).
- **Korean fallback stack:** `"Plus Jakarta Sans", "Apple SD Gothic Neo", "Noto Sans KR", "Pretendard", system-ui, sans-serif`.
- One font family only for Latin text. **No font mixing** inside a card or across a post (Korean glyphs auto-resolve to the first available KR fallback, since Plus Jakarta Sans does not cover Hangul).
- If Plus Jakarta Sans is unavailable in the production environment, the first available fallback is used — but the *intended* master Latin font is Plus Jakarta Sans.

### 3.2 Type scale

| Property | Carousel | Reels |
|----------|----------|-------|
| Font size (default) | 64 px | 72 px |
| Font size (min) | 52 px | 60 px |
| Font size (max) | 76 px | 84 px |
| Weight | **700 (Bold)** | 700 (Bold) |
| Line height | 1.30 | 1.30 |
| Letter spacing | -1% (−0.01em) | -1% |
| Text color | `#111111` | `#111111` |
| Text align | center | center |
| Max lines | **3** | 3 |
| Max characters (guide) | ~16 KR chars/line | ~16 KR chars/line |

> 위 표는 (b) Single-content 본문 헤드라인의 작업 기본값. **Cover 헤드라인은 §3.2.1의 확정 수치를 사용한다.**

### 3.2.1 Cover headline — 확정 스펙 (검증값)

(a) Cover 레이아웃의 `POV:` 헤드라인. **원본 디자인 파일에서 측정된 확정값** (1080×1350 캐러셀 기준):

| Property | 값 |
|----------|-----|
| Font | **Plus Jakarta Sans ExtraBold (800)** |
| Font size | **85 px** |
| Letter spacing | **-5% (−0.05em)** |
| Line height (행간, 줄 위아래 간격) | **93 px** (≈ 0.98×, 타이트) |
| Text color | `#111111` |
| Text align | center |
| Position | 화면 중앙 세로 (§2.0 a) |

- 이 값은 **잠정 아님 — 확정.** Cover 카드는 항상 이 스펙.
- `POV:` 단어 포함 2~3줄. 단어 간격도 타이트(자간 -5%)하게 유지.
- ✅ **폰트 가중치 확인 완료:** Cover = ExtraBold(800). (본문/핸들은 Bold(700) 유지 — §3.2.)

Rules:
- Text is **short**. If text does not fit in 3 lines at min font size, the copy must be cut — never shrink below min, never add a 4th line.
- Auto-fit: start at default size; if overflow, step down toward min; if still overflowing at min, reject the copy.
- No drop shadows, no outlines, no gradients on text. Flat `#111111` only.
- Optional emphasis: a single word may use color `#FF441F` (accent) — at most one accent per card. No other text colors.

---

## 4. Character Placement

The JeJal character is the visual anchor of every card.

| Property | Carousel | Reels |
|----------|----------|-------|
| Max width | 760 px | 820 px |
| Max height | 720 px | 900 px |
| Horizontal center | `x = 540` | `x = 540` |
| Vertical center | `y = 805` | `y = 1090` |
| Anchor point | character's optical center | optical center |

Rules:
- The character is **always centered horizontally** on `x = 540`.
- The character is fit **inside** the Character area (§2.2 / §2.3) — scaled down to respect max width/height while preserving aspect ratio. Never stretch or distort.
- The character may overlap *visually* into empty parts of the text area or bottom area, but its core silhouette must stay inside the Character area and never cross the global safe margins.
- Default is **one** hero JeJal per card. **Approved exceptions** (검증 예시 기준): red JeJal crowd(군집), gray NPC群, archetype costume(유령몸/로봇몸 등). 색코드·눈 구조·플랫 스타일은 유지. → [[character_bible.md]] §4.1, [[example_library.md]] §4.3.
- Character renders on transparent background (PNG with alpha) and is composited onto the white canvas. No baked-in background.

---

## 5. Background

- Background is **white or near-white only.**
- Allowed values: `#FFFFFF` (pure white) or `#FAFAFA` (near-white). Default: `#FFFFFF`.
- **Solid flat fill only.** No gradients, no patterns, no textures, no photos, no scenery, no shadows cast on the background.
- A single very subtle prop or floor shadow under the character is allowed **only** if defined as a variable element (§7) and kept minimal. The overall impression must remain "clean white card."

---

## 6. Fixed Elements

These are **structural** and identical on every card. They do not change between cards or posts.

1. **Background** — white/near-white solid (§5).
2. **Top text area** — position, alignment, type system (§2, §3).
3. **Character area** — centered character slot (§2, §4).
4. **Logo / handle area** — bottom safe area (§2.2/§2.3).
   - Logo or handle text, horizontally centered. **공식 핸들/도메인 = `Je-Jal.com`** (검증 예시 확정). → [[example_library.md]] §5.2.
   - Max height: 70 px (carousel) / 80 px (reels).
   - Color: `#999999` for handle text, or brand logo asset at low visual weight.
   - **Optional per post**, but its *position* is fixed. If present, it lives only here.
5. **Overall composition** — top text / centered character / bottom logo skeleton.

Fixed = the skeleton. The skeleton never moves.

---

## 7. Variable Elements

Only these four things change from card to card. Everything else is locked.

1. **Text** — the short top copy (within §3 limits).
2. **Character pose** — JeJal's body pose (sitting, slumped, pointing, lying down, etc.).
3. **Character expression** — JeJal's face (deadpan, crying, smug, shocked, etc.).
4. **Small prop** — at most **one** small prop associated with the character (phone, pencil, coffee, exam paper, etc.). Optional, and must stay within the character area.

No other variables. Layout, colors, fonts, sizes, and zones are not "variable."

---

## 8. Forbidden

Any card containing the following is **automatically rejected**:

1. **Busy background** — patterns, gradients, photos, scenery, textures, multiple colors, or anything other than flat white/near-white.
2. **Model-generated text baked into the image** — all text is rendered by the layout system as real, editable type. No AI-drawn/hallucinated letterforms, no garbled text inside the character image.
3. **Random / improvised layout** — any deviation from the fixed zones, alignment, or composition in §2.
4. **Realistic / photographic style** — no realistic humans, no 3D-render realism, no photographic rendering. JeJal is a flat, simple, illustrated meme character.
5. **Different character identity** — the character must be the *same* JeJal every time (defined in character_bible.md). No swapping faces, body types, art styles, or identity. Pose and expression may change; identity may not.

Additional hard "no"s:
- No watermarks except the approved logo/handle in §6.
- No more than one accent color word.
- No text outside the top text area (except the bottom logo/handle).
- No rotation, skew, or perspective on text or layout.

---

## 9. Carousel → Reels Conversion Rules

When converting a 1080×1350 carousel card to a 1080×1920 Reels frame:

- Keep the **same composition**: top text → centered character → bottom logo.
- Re-flow into the Reels zones (§2.3), not a naive stretch. **Never stretch or distort** the character or text.
- Recenter the character on `y = 1090` and rescale to Reels max dimensions (§4).
- Keep the bottom 220 px (UI buffer) empty.
- Text re-uses the same copy; only size/position adjust per §3.

---

## 10. Definition of Done (per card)

A card passes only if **all** are true:

- [ ] Canvas is exactly 1080×1350 (carousel) or 1080×1920 (reels).
- [ ] Background is flat `#FFFFFF` or `#FAFAFA`.
- [ ] Text sits in the top text area, ≤ 3 lines, within the type scale, center-aligned, `#111111`.
- [ ] Exactly one JeJal character, centered on `x = 540`, inside the character area, identity-consistent.
- [ ] At most one small prop, inside the character area.
- [ ] Logo/handle (if present) only in the bottom safe area.
- [ ] No forbidden element from §8.
- [ ] A post contains 5–7 cards, all the same canvas size.

---

## 11. Open Inputs Needed (to finalize this spec)

These do not block the spec, but the listed assets are required before production can begin. See the request list in the chat.

- JeJal character master art (transparent PNG / source file).
- Logo and/or official `@handle` text.
- **Final / reference example images (완성본·완성 예시 이미지)** — required to finalize the §2 margins/zones and §4 character placement coordinates.
- ✅ Font confirmed: **Plus Jakarta Sans** (with KR fallback stack).
- ✅ Accent color confirmed: **`#FF441F`**.

---

*End of design.md — v1.0*
