# content_rules.md — JeJal Card Factory Content Boundaries

> **Status:** Locked content & tone rulebook.
> **Scope:** JeJal 콘텐츠의 주제 범위, 톤, 유머, 카피라이팅 경계 정의.
> **언어 규칙:** 설명/규칙 = **한국어**. 카드 실문구 예시 = **독일어** (Gen Z 학생 톤). → [[design.md]] §3, [[story_schema.md]] §0.
> **권위:** 이 규칙을 위반한 카피는 **거부**. 주제·톤·유머가 전부 통과해야 생성.

---

## 0. 한 줄 정의

JeJal = **독일 대학생의 작고 공감되는 실패와 무기력을, 짧고 살짝 비꼬는 Gen Z 톤으로 보여주는 밈.** 광고가 아니다. 설교가 아니다. 드라마가 아니다.

타겟: **독일 대학생 / Gen Z.** Du-Form, 구어체 기본.

---

## 1. 허용 주제 (Allowed Topics)

이 10개 안에서만 콘텐츠를 만든다. 전부 캠퍼스/학생 일상.

| 주제 | 설명 | 대표 앵글 (독일어 키워드) |
|------|------|---------------------------|
| **Freistunde** | 공강 시간 | `2 Stunden Freistunde, 0 Plan` |
| **Mensa** | 학식/먹거리/가격 | `Schnitzel-Tag`, `4,80 €` |
| **Bibliothek** | 도서관/자리/집중 | `Lernen = 1 Stunde, Pause = 3` |
| **Klausur** | 시험/마감 공포 | `Klausur morgen, Kapitel 1 von 12` |
| **Hausarbeit** | 과제/레포트 | `Deadline 23:59, Wortzahl: 0` |
| **Gruppenarbeit** | 조별과제 | `4 Namen, 1 Person` |
| **Ersti life** | 신입생(1학기) 생활 | `Ersti sucht den Hörsaal` |
| **Campus meetup** | 캠퍼스에서 사람 만나기 | `"Lass mal Kaffee" — nie passiert` |
| **Lecture review** | 강의 회상/복습 | `Vorlesung gehört, 0 verstanden` |
| **Student boredom** | 학생 권태/무기력 | `3 Wochen bis Semesterstart, Existenzkrise` |

> 주제가 이 10개 밖이면 가장 가까운 것으로 매핑하거나 **생성 거부**. 억지로 확장 금지.

---

## 2. 주제 가드레일 (Topic Guardrails) — 상식선

> **운영 방식:** 최종 결과물은 **사람이 직접 검수**한다. 따라서 이 섹션은 "자동 즉시 거부"가 아니라 **상식선 가드레일**이다.
> **기준 한 줄:** *"보는 사람 인상이 찌푸려질 만큼 심한 것"만 피한다.* 그 외 가벼운 풍자·자조·캠퍼스 농담은 통과.

아래는 **피하는 게 좋은** 방향이다 (어기면 사람 검수에서 걸러짐):

1. **노골적 정치/종교 논쟁** — 정당·선거·신앙을 두고 편 가르거나 조롱. (단순 배경 언급 수준은 괜찮음, 논쟁 소재화만 피함.)
2. **혐오/차별** — 인종·성별·국적·성적지향·장애·외모를 향한 진짜 비하. 이건 분명히 선을 넘음.
3. **민감 개인정보** — 실명·주소 등으로 **특정 개인 저격**. (익명 공감형은 OK.)
4. **노골적 성적 콘텐츠** — 직접적 성 묘사. (가벼운 연애/썸 공감은 캠퍼스 맥락이면 OK.)
5. **타인을 향한 진짜 공격/괴롭힘** — 특정 대상 모욕. **자조는 자유**(`lol ich bin so cooked`, `ich als NPC` 등 OK).
6. **기업 판매 톤** — 광고·CTA·영업 멘트. (이건 유머가 아니라 톤 문제라 그대로 피함.)

**완화된 부분 (이제 OK):**
- 가벼운 비꼼·블랙유머·자조는 자유롭게.
- 알코올/숙취 같은 학생 일상 소재는 미화만 아니면 가능 (`Montag mit Restalkohol` 정도 OK).
- 위 항목도 "농담으로 살짝" 닿는 정도는 사람 검수에서 판단 — 자동 거부하지 않음.

> 요약: 생성기는 **명백히 선 넘는 것**(2·5의 진짜 혐오/괴롭힘, 4의 노골적 성적 표현)만 스스로 거르고, 애매한 건 만들어두면 **사람이 마지막에 거른다.**

---

## 3. 독일어 톤 (German Tone)

- **Casual:** Du-Form, 구어체. 완전한 문법 문장 강박 X.
- **Student-like:** 학생이 진짜 쓰는 말투. 강의/시험/Mensa 용어 자연스럽게.
- **Short:** 짧게. 1–2줄. → [[design.md]] §3, [[story_schema.md]] §0.
- **Slightly ironic:** 살짝 비꼼/자조. 대놓고 웃기려 하지 않음. 건조한 톤이 더 셈.
- **Not too polished:** 너무 매끈하면 광고 같음. 일부러 날것.

### 3.1 Gen Z 표현 허용 범위 (확정)

자연스러운 선에서 적극 사용 OK:
- 독일어 구어: `eig` (eigentlich), `keine Ahnung` / `kein Plan`, `digga`, `bro`, `Alter`, `halt`, `einfach`, `läuft bei mir` (반어적).
- 독영 믹스(Denglisch) OK: `lowkey`, `random`, `cringe`, `vibe`, `real`, `cooked`, `slay` (반어적), `npc`, `ick`.
- 예: `lowkey am cooken`, `der vibe heute: 4,0`, `real, keiner kam`.

수위 제한:
- **이모지:** 카드 top_text에는 기본 0개. 꼭 필요하면 **카드당 최대 1개**, 펀치 강화용으로만. 비주얼 깔끔함(흰 배경) 깨지 않게. → [[design.md]] §5/§8.
- 슬랭 남발 금지 — **카드 하나에 슬랭 1~2개**면 충분. 도배하면 cringe.
- 1초 가독성 우선. 못 읽는 슬랭/지나친 약어로 의미 막히면 실패.
- 영어로 통째 쓰지 말 것. **베이스는 독일어**, 슬랭만 살짝 섞기.

---

## 4. 카피라이팅 규칙 (Copywriting Rules)

1. **Short top text** — 1–2줄. 길면 자른다. 형용사·부사 최소.
2. **POV 허용** — `POV: …` 포맷 OK. → [[story_schema.md]] §1.
3. **질문형 허용** — `Warum ist die Bib um 9 schon voll?` 같은 수사의문 OK.
4. **가벼운 과장 허용** — `40 Tabs offen`, `0 verstanden`, `3 Wochen Existenzkrise`. 과장은 OK, **거짓 정보/드라마화는 NO**.
5. **긴 문장 회피** — 종속절 줄줄이 금지. 마침표로 끊어 리듬 만들기. `Klausur morgen. Kapitel 1 von 12. Ende.`
6. **숫자 활용** — 시간/가격/개수는 숫자로 짧고 강하게 (`23:59`, `4,80 €`, `1 von 12`).
7. **강조색 단어 1개** — 카드당 최대 1단어 `#FF441F`. → [[design.md]] §3.
8. **펀치는 짧게** — 마지막 카드 1줄. 설명 붙이지 말 것.

---

## 5. JeJal식 유머 (JeJal-like Humor)

JeJal 유머의 5가지 코어. 모든 카피는 이 중 하나 이상에 들어맞아야 함.

| 유형 | 설명 | 독일어 예시 |
|------|------|-------------|
| **작은 일상 실패** | 사소하게 망한 순간 | `Wecker um 7, aufgewacht um 11` |
| **비생산적 학생 순간** | 공부 대신 딴짓 | `"Kurze Pause" — 4 Stunden später` |
| **어색한 사회적 순간** | 민망한 사회 상황 | `Im Hörsaal gewinkt — war nicht gemeint` |
| **캠퍼스 마이크로 드라마** | 캠퍼스 속 사소한 갈등 | `Jemand sitzt auf deinem Bib-Platz` |
| **공감되는 카오스** | 누구나 아는 난장판 | `Gruppenchat: 200 Nachrichten, 0 Plan` |

핵심 정서: **체념, 자조, "ich kann nicht mehr", 그런데 웃김.** 신나거나 동기부여형이면 JeJal이 아님.

---

## 6. 나쁜 출력 예시 (Bad Output) — 이렇게 쓰면 거부

| 문제 | 나쁜 예 (독일어) | 왜 나쁜가 |
|------|------------------|-----------|
| **Too corporate** | `Entdecke jetzt die besten Lerntipps für deinen Studienerfolg! 🎓` | 광고 톤·CTA·완벽한 문법. JeJal 아님. |
| **Too explanatory** | `Manchmal ist es schwer, sich zu motivieren, weil man viele Aufgaben hat und wenig Zeit.` | 설명조·긴 문장·종속절. 1초 안에 안 읽힘. |
| **Too dramatic** | `Mein ganzes Leben bricht zusammen wegen einer Klausur` | 과장이 아니라 진짜 드라마. 무겁고 불편. |
| **Too random** | `Banane. Montag. Drucker kaputt. Vibes.` | 맥락 없는 단어 나열. 공감 포인트 없음. |

---

## 7. 좋은 출력 예시 (Good Output) — 이게 JeJal

| 강점 | 좋은 예 (독일어) | 왜 좋은가 |
|------|------------------|-----------|
| **Concise** | `Klausur morgen. Kapitel 1 von 12.` | 짧고 끊어침. 숫자로 임팩트. |
| **Funny (dry)** | `Bib um 8 da, um 8:05 am Handy` | 자조·건조한 비꼼. |
| **Visually simple** | `2 Stunden Freistunde, 0 Plan` | 한 줄, 흰 배경에 딱. |
| **Immediately understandable** | `Gruppenarbeit: 4 Namen, 1 Person` | 1초 컷. 모두 아는 상황. |
| **Gen Z tone** | `der vibe heute: lowkey cooked` | 슬랭 절제 사용, 독일어 베이스. |

---

## 8. 검증 체크리스트 (카피 생성 시)

카피가 통과하려면 **전부** 참:

- [ ] 주제가 §1 허용 10개 안.
- [ ] §2 가드레일 — 명백히 선 넘는 것(진짜 혐오·괴롭힘·노골적 성적) 0건. 애매한 건 사람 검수에 위임.
- [ ] 톤이 casual / student / short / ironic / not-too-polished (§3).
- [ ] 1–2줄, 긴 문장 없음, 강조색 단어 ≤1 (§4).
- [ ] JeJal 유머 5코어 중 1개 이상 해당 (§5).
- [ ] §6 나쁜 패턴(광고/설명/드라마/랜덤) 0건.
- [ ] 1초 안에 이해됨, 독일어 베이스 + 슬랭 절제.
- [ ] [[design.md]] / [[story_schema.md]] 규칙 위반 없음.

---

## 9. 다음 단계 연결

- **표정/액션 매칭:** [[character_bible.md]]에서 이 유머 코어별 JeJal 표정 세트 확정.
- **완성 예시:** [[example_library.md]]에 §1 주제별·§5 유머별 풀세트 포스트 독일어로 작성.

---

*End of content_rules.md — v1.0*
