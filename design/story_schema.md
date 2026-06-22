# story_schema.md — JeJal Card Factory Story Library

> **Status:** Locked schema library.
> **Scope:** 반복 가능한 5–7장 카드 스토리 구조 정의. 모든 JeJal 밈/카드 포스트는 아래 7개 스키마 중 하나를 **그대로** 따른다.
> **언어 규칙:** 설명/규칙 산문은 **한국어**. 카드에 실제로 들어가는 `top_text` 예시는 전부 **독일어**(캐주얼 학생 톤). → [[design.md]] §3 타이포 규칙을 따른다.
> **권위:** 생성기는 임의로 카드 수·순서·역할을 바꾸지 못한다. 스키마를 벗어난 출력은 **거부**.

---

## 0. 공통 규칙 (모든 스키마에 적용)

이 규칙은 7개 스키마 전체에 강제된다. 스키마별 설명에서 반복하지 않는다.

1. **카드 수:** 5–7장. 스키마마다 허용 범위가 정해져 있다.
2. **top_text 길이:** 카드당 **1–2줄, 짧게.** [[design.md]] §3 — 최대 3줄/줄당 ~짧게. 한 호흡에 읽혀야 한다.
3. **언어/톤:** 독일어 캐주얼 학생 말투(Du-Form, 구어체, 줄임말 OK: `eig`, `keine Ahnung`, `lol`, `bro`, `digga` 등 자연스러운 선에서).
4. **금지 톤:** 광고/기업 카피 톤 금지. 설명조 금지. 긴 서사 금지. 복잡한 전개 금지.
5. **1초 규칙:** 각 카드는 **1초 안에 이해**돼야 한다. 읽고 생각해야 하면 실패.
6. **캐릭터:** 카드당 JeJal 1명. 표정·포즈·소품만 가변. → [[character_bible.md]], [[design.md]] §4/§7.
7. **펀치라인:** 항상 **마지막 카드**에 위치. 펀치라인 카드의 top_text는 가장 짧게(1줄 선호).
8. **감정 곡선(emotional curve):** 각 스키마는 정해진 감정 흐름을 가진다. 캐릭터 표정은 이 곡선을 따라간다.

> 감정 라벨은 [[character_bible.md]]의 expression 세트와 1:1 매칭되어야 한다(예: `deadpan`, `done`, `panic`, `smug`, `crying`, `hope`, `dead-inside`).

---

## 1. POV Schema

**용도:** "POV: du bist …" 형식. 관객을 상황 안에 집어넣는 1인칭 밈. JeJal의 가장 기본형.

- **카드 수:** 5장 (고정)
- **감정 곡선:** 중립 → 살짝 불안 → 고조 → 무너짐 → 체념/펀치
- **copy length rule:** 카드 1은 "POV:" 한 줄. 나머지는 1–2줄.
- **펀치라인 규칙:** 카드 5는 1줄, 가장 짧고 가장 세게.

| 카드 | 역할(role) | 캐릭터 감정 | 캐릭터 액션 | top_text 예시 (독일어) |
|------|-----------|------------|------------|------------------------|
| 1 | Hook (POV 설정) | neutral | 정면 응시 | `POV: Es ist 8 Uhr und du hast Vorlesung` |
| 2 | Situation (현실 진입) | mild unease | 폰 확인 | `Du checkst nochmal den Raum` |
| 3 | Escalation (상황 악화) | rising stress | 두리번 | `Falsches Gebäude. Andere Seite vom Campus.` |
| 4 | Character Reaction (반응) | done | 멈춰 섬, 어깨 축 | `Du gehst gar nicht erst hin` |
| 5 | Punchline | dead-inside | 누워버림 | `Anwesenheit war eh egal` |

---

## 2. Situation Schema

**용도:** 누구나 겪는 일상 상황을 묘사 → 마지막에 비틀기. POV 없이 3인칭/상황 서술.

- **카드 수:** 5–6장
- **감정 곡선:** 평범 → 인지 → 작은 갈등 → 반응 → 펀치
- **copy length rule:** 전부 1–2줄. 상황 묘사 카드는 짧은 평서문.
- **펀치라인 규칙:** 예상 못 한 반전 또는 과장된 체념.

| 카드 | 역할 | 캐릭터 감정 | 캐릭터 액션 | top_text 예시 (독일어) |
|------|------|------------|------------|------------------------|
| 1 | Hook | neutral | 가만히 앉음 | `Montag, 9 Uhr` |
| 2 | Situation | calm | 노트북 켬 | `Du willst eig nur kurz was nachschauen` |
| 3 | Escalation | mild unease | 화면 응시 | `3 Stunden später, 40 Tabs offen` |
| 4 | Character Reaction | done | 머리 감쌈 | `Du weißt nicht mehr was du wolltest` |
| 5 | Punchline | dead-inside | 의자에 녹아내림 | `War eh nicht wichtig` |
| (6) | Optional Tag | smug | 폰 들기 | `Aber die Memes waren gut` |

---

## 3. Warning / Announcement Schema

**용도:** "Achtung!" / "Erinnerung:" 형식의 공지·경고 밈. 가짜 공식 톤 → 학생 현실로 추락.

- **카드 수:** 5장
- **감정 곡선:** 단호함 → 경고 → 현실 인지 → 무력 → 펀치
- **copy length rule:** 카드 1은 굵은 경고 한 줄(강조색 단어 1개 허용 → [[design.md]] §3 `#FF441F`). 나머지 1–2줄.
- **펀치라인 규칙:** 경고가 결국 자기 자신에게 돌아오는 구조.

| 카드 | 역할 | 캐릭터 감정 | 캐릭터 액션 | top_text 예시 (독일어) |
|------|------|------------|------------|------------------------|
| 1 | Hook (경고 선언) | serious | 손가락 가리킴 | `ACHTUNG` |
| 2 | The Warning | stern | 팔짱 | `Abgabe ist heute um 23:59` |
| 3 | Reality Check | mild unease | 폰 확인 | `Es ist 23:47` |
| 4 | Character Reaction | panic | 미친 듯 타이핑 | `Du hast noch nicht angefangen` |
| 5 | Punchline | dead-inside | 화면 보고 멍 | `Naja, gibt ja noch nen Zweitversuch` |

---

## 4. Meetup Schema

**용도:** 친구/사람 만나기 약속 관련 밈. 사회적 에너지 vs 현실.

- **카드 수:** 5–6장
- **감정 곡선:** 기대 → 흔들림 → 핑계 → 안도 → 펀치
- **copy length rule:** 1–2줄. 시간/약속 디테일은 숫자로 짧게.
- **펀치라인 규칙:** 결국 안 나가거나, 나갔는데 후회.

| 카드 | 역할 | 캐릭터 감정 | 캐릭터 액션 | top_text 예시 (독일어) |
|------|------|------------|------------|------------------------|
| 1 | Hook | hope | 손 흔들기 | `Freitag: "Lass unbedingt was machen!"` |
| 2 | Setup | calm | 폰 들기 | `Samstag, 14 Uhr: noch im Bett` |
| 3 | Escalation | mild unease | 이불 속 | `"Bin in 10 Min da" (lügt)` |
| 4 | Character Reaction | done | 핑계 타이핑 | `"Sorry, mir ist was dazwischen gekommen"` |
| 5 | Punchline | smug | 다시 눕기 | `Nichts ist dazwischen gekommen` |
| (6) | Optional Tag | dead-inside | 천장 응시 | `Aber soziale Energie ist teuer` |

---

## 5. Study / Exam Schema

**용도:** 시험·공부 관련 밈. JeJal 세계관의 핵심 소재.

- **카드 수:** 6장
- **감정 곡선:** 결심 → 가짜 생산성 → 회피 → 공포 → 체념 → 펀치
- **copy length rule:** 1–2줄. 날짜/시간 카운트다운 자주 사용.
- **펀치라인 규칙:** 공부 안 한 채로 시험 직면, 또는 비현실적 낙관.

| 카드 | 역할 | 캐릭터 감정 | 캐릭터 액션 | top_text 예시 (독일어) |
|------|------|------------|------------|------------------------|
| 1 | Hook (결심) | hope | 책 펼침 | `Heute lerne ich WIRKLICH` |
| 2 | Fake Productivity | calm | 형광펜 칠 | `Erstmal alles schön markieren` |
| 3 | Avoidance | mild unease | 폰 들기 | `Kurze Pause = 4 Stunden TikTok` |
| 4 | Panic | panic | 머리 쥐어뜯기 | `Klausur ist morgen` |
| 5 | Reaction | dead-inside | 책에 엎드림 | `Du kannst genau ein Kapitel` |
| 6 | Punchline | smug | 엄지 척 | `Bestehen ist auch eine 4,0` |

---

## 6. Mensa / Food Schema

**용도:** Mensa(학식)·먹거리·돈 관련 밈. 가볍고 공감형.

- **카드 수:** 5장
- **감정 곡선:** 배고픔 → 기대 → 실망 → 타협 → 펀치
- **copy length rule:** 1–2줄. 음식/가격 디테일 짧게.
- **펀치라인 규칙:** 결국 같은 결말(돈 없음/맛 별로/그래도 먹음).

| 카드 | 역할 | 캐릭터 감정 | 캐릭터 액션 | top_text 예시 (독일어) |
|------|------|------------|------------|------------------------|
| 1 | Hook | hope | 배 만지기 | `Endlich Mittagspause` |
| 2 | Expectation | calm | 쟁반 들기 | `Heute gibts angeblich was Gutes` |
| 3 | Disappointment | done | 쟁반 내려다봄 | `"Schnitzel" für 4,80 €` |
| 4 | Reaction | dead-inside | 포크 찌르기 | `Sieht aus wie letzte Woche` |
| 5 | Punchline | smug | 어쨌든 먹기 | `Egal. Hauptsache warm.` |

---

## 7. Team Project Schema

**용도:** 조별과제(Gruppenarbeit) 밈. 공감대 가장 강한 소재 중 하나.

- **카드 수:** 6–7장
- **감정 곡선:** 시작 → 침묵 → 깨달음 → 분노 → 체념 → 펀치 (→ 잔여 태그)
- **copy length rule:** 1–2줄. 인원수/마감 디테일 짧게.
- **펀치라인 규칙:** "결국 나 혼자 다 함" 또는 "이름만 올린 팀원" 구조.

| 카드 | 역할 | 캐릭터 감정 | 캐릭터 액션 | top_text 예시 (독일어) |
|------|------|------------|------------|------------------------|
| 1 | Hook | neutral | 노트북 앞 | `Gruppenarbeit. 4 Leute.` |
| 2 | Silence | mild unease | 채팅 응시 | `Im Gruppenchat: totale Stille` |
| 3 | Realization | done | 이마 짚기 | `Abgabe in 2 Tagen` |
| 4 | Anger | done/panic | 키보드 두드림 | `"Macht ihr noch was?" — gelesen, 14:32` |
| 5 | Resignation | dead-inside | 혼자 작업 | `Du machst es halt allein` |
| 6 | Punchline | smug→done | 제출 버튼 | `4 Namen. Eine Person.` |
| (7) | Optional Tag | crying | 화면 응시 | `Alle kriegen die gleiche Note` |

---

## 8. 스키마 선택 가이드 (생성기용)

콘텐츠 주제가 들어오면 아래 매핑으로 스키마를 고른다. 애매하면 **Situation Schema**가 기본값.

| 주제 키워드 | 스키마 |
|------------|--------|
| 일상 1인칭, "wenn du…", "POV" | 1. POV |
| 일반 상황/공감 | 2. Situation |
| 마감·공지·경고·규칙 | 3. Warning/Announcement |
| 약속·사람 만나기·소셜 | 4. Meetup |
| 시험·공부·강의 | 5. Study/Exam |
| Mensa·음식·돈 | 6. Mensa/Food |
| 조별과제·팀·협업 | 7. Team Project |

---

## 9. Definition of Done (스키마 적용 검증)

포스트가 통과하려면 **전부** 참:

- [ ] 7개 스키마 중 정확히 하나를 따른다.
- [ ] 카드 수가 해당 스키마 허용 범위 안.
- [ ] 각 카드 역할이 스키마 순서와 일치.
- [ ] 감정 곡선이 스키마대로 흐른다(표정이 곡선을 따라감).
- [ ] 모든 top_text가 독일어, 1–2줄, 학생 캐주얼 톤.
- [ ] 펀치라인이 마지막 카드, 1줄 선호.
- [ ] 1초 안에 이해됨. 광고 톤/설명조 없음.
- [ ] [[design.md]] 비주얼 스펙 위반 없음.

---

## 10. 다음 단계에서 채워질 항목

- **표정/액션 라벨 확정:** [[character_bible.md]]가 정의되면 위 표의 감정·액션 라벨을 거기 세트와 1:1로 잠금.
- **카피 톤 디테일:** [[content_rules.md]]가 독일어 문장 규칙(줄임말 허용 범위, 금지어, 강조색 사용법)을 확정.
- **실제 완성 예시:** [[example_library.md]]에 스키마별 완성 포스트 1개씩 독일어 풀세트로 채움.

---

*End of story_schema.md — v1.0*
