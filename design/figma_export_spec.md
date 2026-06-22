# figma_export_spec.md — JeJal Card Factory → Figma Export

> **Status:** Locked export specification.
> **Scope:** 생성된 최종 카드 세트를 **CMO 최종 편집용 Figma**로 내보내는 방식 정의 + 서버사이드 자동 export 요구사항.
> **언어 규칙:** 설명 = 한국어. 레이어명·기술 식별자·API 키 = **영어**. → [[design.md]], [[story_schema.md]], [[content_rules.md]], [[character_bible.md]], [[example_library.md]].
> **권위:** 이 구조를 벗어난 export는 **거부**. 레이어 네이밍·프레임 순서·메타데이터는 강제.

---

## 0. 파이프라인 한눈에

```
[생성기]  →  카드 세트(JSON + 캐릭터 PNG)  →  [서버 Figma Export]
                                                   ├─ Figma page/file 생성
                                                   ├─ frame(카드)별 생성·정렬
                                                   ├─ 배경/텍스트/캐릭터/로고 레이어
                                                   ├─ 최종 PNG export 저장
                                                   └─ Supabase에 Figma URL + 메타 기록
                                                          ↓
                                              [CMO]  Figma 열기 → 검수 → PNG export → 업로드
```

- **Figma = 최종 사람 편집 단계.** 생성기는 "편집 가능한 초안"을 Figma로 넘기고, CMO가 카피/간격/캐릭터 일관성을 마지막으로 다듬는다.
- 모든 텍스트는 **편집 가능한 텍스트 노드**, 캐릭터는 **교체 가능한 이미지 레이어**여야 한다.

---

## 1. Figma 산출물 구조

| 단위 | 규칙 |
|------|------|
| **Page (or File)** | **카드 세트(=1 포스트)당 1개.** 이름: `JeJal / {YYYY-MM-DD} / {format} / {slug}` (예: `JeJal / 2026-06-19 / POV / vorlesung-zu-spaet`). |
| **Frame** | **카드 1장당 1개.** 한 포스트의 모든 프레임은 같은 페이지에 가로로 정렬. |
| **Frame size** | `1080×1350`(캐러셀) 또는 `1080×1920`(릴스). 한 세트 내 혼용 금지. → [[design.md]] §1. |
| **Frame order** | 카드 순서대로 좌→우 배치. `Card 01` … `Card NN`. 1번=Cover, 마지막=Closing. → [[example_library.md]] §5. |
| **Frame name** | `Card {NN}` (2자리 zero-pad: `Card 01`, `Card 02` …). |

- 세트는 **5–7 프레임** (포맷별 범위 → [[story_schema.md]]).
- 프레임 간 간격: 120px (작업 편의용, export엔 무관).

---

## 2. 레이어 구조 (프레임당)

각 프레임은 아래 레이어를 **정해진 이름·순서(z-order)** 로 가진다. 위가 앞(top), 아래가 뒤(bottom).

| z | 레이어명 | 타입 | 필수 | 설명 |
|---|----------|------|------|------|
| 5 (top) | `Card {NN} / Notes` | Text | 선택 | CMO 메모용. **export 시 hidden.** |
| 4 | `Card {NN} / Logo` | Text/Image | 선택 | 핸들/로고. `Je-Jal.com` 또는 Closing 에셋. → [[example_library.md]] §5.2. |
| 3 | `Card {NN} / Top Text` | **Text (editable)** | ✅ | 카드 카피. 편집 가능 텍스트 노드. |
| 2 | `Card {NN} / Character` | **Image (replaceable)** | ✅* | 캐릭터 PNG (투명 배경). |
| 1 (bottom) | `Card {NN} / Background` | Rectangle/Frame fill | ✅ | 흰색 `#FFFFFF`. |

\* Closing 카드는 `Character` 대신 고정 로고 에셋 사용 가능. Split-comparison 카드는 `Character`가 좌/우 2개일 수 있음(`Character L` / `Character R`) — §2.1.

### 2.1 레이아웃별 레이어 변형

[[design.md]] §2.0의 4종 레이아웃에 맞춰 레이어가 약간 달라진다.

- **(a) Cover:** `Top Text`(중앙, `POV:` ExtraBold 85/자간 -5%/행간 93 → [[design.md]] §3.2.1) + `Character`(우하단 빼꼼) + `Speech Bubble`(`swipe weiter !`). 추가 레이어 `Card {NN} / Speech Bubble`.
- **(b) Single-content:** `Top Text`(상단) + `Character`(중앙). 표준.
- **(c) Split-comparison:** `Background`를 좌(흰)/우(회색 `#F2F2F2`)로 2분할 → `Card {NN} / BG Left`, `Card {NN} / BG Right`. 캡션 `Card {NN} / Caption L`, `Card {NN} / Caption R` (하단). 캐릭터 `Character L`, `Character R`.
- **(d) Closing:** `Card {NN} / Logo`(앱아이콘+워드마크+태그라인+`Je-Jal.com`) 고정 에셋. 텍스트 편집 불필요(고정).

### 2.2 환경/소품 레이어 (선택)

검은 라인아트 환경·소품([[character_bible.md]] §8.1)이 있으면: `Card {NN} / Props`(이미지 또는 벡터, `Character` 아래 z=2.5). 효과 doodle도 동일 레이어.

---

## 3. 편집 가능성 요구사항 (필수)

1. **텍스트 편집 유지:** `Top Text`/`Caption`은 **래스터화 금지.** 실제 폰트(Plus Jakarta Sans)로 된 Figma Text 노드. CMO가 글자·줄바꿈·간격 수정 가능해야 함.
   - 폰트/크기/자간/행간/색은 [[design.md]] §3을 정확히 따라 세팅 (Cover=ExtraBold 85/-5%/93, 본문=Bold).
   - 강조 단어는 동일 노드 내 색상 span `#FF441F` (카드당 1개).
2. **캐릭터 교체 가능:** `Character`는 image fill을 가진 프레임/사각형. CMO가 우클릭 → 이미지 교체로 다른 포즈/표정 PNG로 바꿀 수 있어야 함. (image fill, not flattened.)
3. **프레임 순서 고정:** `Card 01`…`Card NN` 순서대로. 메타데이터로도 순번 보장(§4).
4. **배경 분리:** `Background`는 독립 레이어(흰색). 텍스트/캐릭터와 병합 금지.
5. **반응형 아님:** 고정 픽셀 레이아웃. Auto-layout은 텍스트 블록 내부 정렬에만 선택적 사용.

---

## 4. 카드 메타데이터 (프레임당)

각 프레임은 식별 메타데이터를 보유한다. Figma 표현 수단(우선순위 순):

1. **Plugin Data** (`frame.setPluginData(key, value)`) — 기계 판독용 권장.
2. 보조: 프레임명 suffix + `Notes` 레이어 텍스트.

| key | 예시 | 의미 |
|-----|------|------|
| `set_id` | `uuid` | 카드 세트(포스트) ID (Supabase FK) |
| `card_number` | `1` | 1-based 순번 |
| `card_total` | `6` | 세트 총 카드 수 |
| `format` | `POV` / `Typen` / `ErwartungRealitaet` | 포맷 → [[example_library.md]] §4.1 |
| `layout` | `cover` / `single` / `split` / `closing` | 레이아웃 → [[design.md]] §2.0 |
| `canvas` | `1080x1350` | 프레임 크기 |
| `top_text` | `"Tür auf."` | 원본 카피(독일어) |
| `character_ref` | `asset_id`/URL | 사용된 캐릭터 PNG 참조 |

---

## 5. 최종 PNG Export 요구사항

- 각 프레임을 **PNG, 1080px 폭, sRGB**로 export. → [[design.md]] §1.
- `Notes`(및 작업용 가이드) 레이어는 **반드시 hidden** 상태로 export.
- 파일명: `{slug}_card{NN}.png` (예: `vorlesung-zu-spaet_card01.png`).
- export 산출물은 Supabase Storage에 저장(§6). Figma 편집본과 별개로 **렌더된 최종 PNG도 보관**.
- 릴스 변환분(1080×1920)이 있으면 `{slug}_reel_card{NN}.png`로 별도 저장. → [[design.md]] §9.

---

## 6. 서버사이드 Figma Export 요구사항

생성기 후단의 **자동 export 서비스**가 수행할 작업. (Figma REST API + Plugin/`use_figma`, 또는 Figma MCP `create_new_file`/`upload_assets` 활용.)

### 6.1 단계

1. **Create Figma page/file**
   - 세트당 page(또는 file) 생성, 이름 규칙 §1.
2. **Create frames**
   - 카드 수만큼 frame 생성, 크기 §1, 좌→우 정렬, 이름 `Card {NN}`.
3. **Upload / place images**
   - 캐릭터 PNG(투명) 업로드 → `Character` 레이어 image fill로 배치.
   - 환경/소품·Closing 에셋도 동일.
   - 좌표·크기는 [[design.md]] §2/§4 (레이아웃별).
4. **Create editable text nodes**
   - `Top Text`/`Caption`을 **실제 Text 노드**로 생성(래스터 금지).
   - 폰트 `Plus Jakarta Sans`, 스타일 [[design.md]] §3 (Cover=ExtraBold 85/-5%/93). 폰트 로드 보장.
   - 강조 span `#FF441F` 적용(있으면).
5. **Set metadata**
   - 각 frame에 §4 plugin data 기록.
6. **Render final PNG**
   - §5 규칙으로 PNG export(Notes hidden).
7. **Store in Supabase**
   - Figma file/page URL + 메타 + PNG 경로 기록(§6.2).

### 6.2 Supabase 스키마 (최소)

```sql
-- 카드 세트(포스트)
card_sets (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null,
  format        text not null,        -- POV | Typen | ErwartungRealitaet
  canvas        text not null,        -- 1080x1350 | 1080x1920
  card_total    int  not null,
  figma_file_url text,                -- ✅ Figma 파일 URL 저장
  figma_page_id  text,
  status        text default 'exported', -- generated|exported|reviewed|published
  created_at    timestamptz default now()
);

-- 카드(프레임)
cards (
  id            uuid primary key default gen_random_uuid(),
  set_id        uuid references card_sets(id) on delete cascade,
  card_number   int not null,
  layout        text not null,        -- cover|single|split|closing
  top_text      text,                 -- 독일어 원본 카피
  character_ref text,                 -- 캐릭터 PNG asset id/url
  png_url       text,                 -- 최종 export PNG (Supabase Storage)
  reel_png_url  text,                 -- 릴스 변환분(선택)
  figma_node_id text,                 -- 해당 frame node id
  unique (set_id, card_number)
);
```

- **핵심 요구:** `card_sets.figma_file_url`에 Figma 파일 URL을 **반드시 저장** → CMO가 대시보드에서 바로 열 수 있어야 함.
- PNG는 Supabase **Storage 버킷**(`jejal-cards/{slug}/...`)에 저장, `cards.png_url`에 public/signed URL 기록.

---

## 7. CMO 워크플로 (최종 편집)

1. **Open Figma file** — Supabase `figma_file_url`로 열기.
2. **Check copy** — 독일어 카피 검수 (톤·맞춤법·1초 가독성 → [[content_rules.md]]).
3. **Adjust text / spacing** — 줄바꿈·자간·행간·강조 단어 미세 조정 (편집 가능 텍스트라 가능).
4. **Check character consistency** — 캐릭터 정체성·표정·포즈·색코드 일관성 ([[character_bible.md]] §15). 필요시 `Character` 이미지 교체.
5. **Export final PNGs** — §5 규칙(1080px, Notes hidden)으로 export.
6. **Upload to Instagram / Reels** — 캐러셀(1080×1350) / 릴스(1080×1920) 업로드.

- 검수 완료 시 Supabase `status`를 `reviewed`→`published`로 갱신(선택 자동화).

---

## 8. Definition of Done (export 검증)

export가 통과하려면 **전부** 참:

- [ ] 세트당 1 page, 카드당 1 frame, 좌→우 순서.
- [ ] 프레임 크기 `1080×1350` 또는 `1080×1920`, 세트 내 일관.
- [ ] 레이어명이 `Card {NN} / {Layer}` 규칙 준수(§2).
- [ ] `Top Text`/`Caption`이 **편집 가능 텍스트 노드**(래스터 아님), 폰트/스타일 [[design.md]] §3 일치.
- [ ] `Character`가 **교체 가능 image fill**.
- [ ] `Background` 흰색 분리 레이어.
- [ ] 각 frame에 §4 메타데이터(plugin data).
- [ ] 최종 PNG export(Notes hidden) Supabase 저장.
- [ ] `card_sets.figma_file_url` Supabase 기록.
- [ ] 1번=Cover, 마지막=Closing(`Je-Jal.com`).

---

## 9. 참고: Figma MCP로 즉시 생성 옵션

이 저장소는 Figma MCP가 연결돼 있어, 위 스펙대로 **실제 Figma 파일/프레임을 바로 생성**할 수 있다 (`create_new_file`, `use_figma`, `upload_assets`). 첫 세트를 템플릿으로 만들어 두면 이후 서버 export의 기준 레이아웃으로 재사용 가능. (요청 시 진행.)

---

*End of figma_export_spec.md — v1.0*
