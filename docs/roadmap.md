# Product Roadmap: X-Ray View, from MVP to Full Launch

## Context
The founder asked for the whole roadmap laid out: stack, build, tech, phases, and costs, from MVP to full launch, using everything decided so far. This replaces the earlier phase plan (still in `docs/product-plan.md`), updated for three decisions made since: **voice-first conversation**, **the council-approved onboarding** (`docs/school/council/2026-11-25-onboarding-voice-flow.md`), and **the curriculum data and refresh pipeline**. It is also published as a shareable visual page.

**How to read the numbers:** curriculum sizes come from our catalog (real). Claude prices come from Anthropic's current price list (real). Durations, team size, and per-session usage are **planning assumptions**, marked as such, to be re-baselined after Phase 1 measures them. Voice, infrastructure, and people costs have no prices here: they need quotes, and inventing them would mislead.

---

## 1. Where we are today (built and committed)

| Asset | State |
|---|---|
| App skeleton | Expo (React Native) + TypeScript, English-first, RTL-ready |
| Database | Supabase migrations 0001 to 0005: families and children with RLS, curriculum catalog, editions |
| Curriculum catalog | 58 syllabi, 901 topic-by-year rows. American (CCSS, NGSS) **verified**. French **verified** (2026/2027). National Arabic, religion, Social Studies from **29 Ministry books**. IB framework strands. 44 Cairo schools. |
| Refresh pipeline | Fingerprints, edition detection, OCR contents comparison, carry-forward; proven end to end; runs twice a year |
| Content format | Lesson schema + validator + 1 sample lesson (CCSS 4.NF) |
| Team | 92 Claude Code agents: 31 tech and product, 61 school staff, plus the academic council |
| Decisions | Voice-first; never-answer rule; onboarding approved with changes; four design blockers open |

**Not built yet:** the tutor brain, voice, visuals, lessons at scale, parent app, payments, safety operations.

---

## 2. Architecture X-ray

```
 CHILD'S PHONE (Expo app)                     PARENT (app + web)
  mic, captions, whiteboard, demos,            setup, consent, progress,
  tap fallbacks, push-to-talk                  "done alone vs hints"
        │  audio + events                              │
        ▼                                              ▼
 ┌─────────────────────── REAL-TIME LAYER ────────────────────────┐
 │ voice-activity detection · streaming speech-to-text (AR/EN)    │
 │ barge-in · streaming text-to-speech · text-only fallback       │
 └──────────────┬─────────────────────────────────────────────────┘
                ▼
 ┌─────────────────────── THE BRAIN (our server) ─────────────────┐
 │ session orchestrator ── Claude (streaming, cached lesson)      │
 │   ├ visual tools: whiteboard, card, image, demo, highlight     │
 │   ├ ANSWER-LEAK FILTER (every sentence + every label, AR/EN)   │
 │   ├ hint ladder · interruption rules · age-band settings       │
 │   ├ safety classifier → human review queue (never auto-parent) │
 │   └ rubric grading (done alone / needed hints)                 │
 └──────────────┬─────────────────────────────────────────────────┘
                ▼
 ┌─────────────────────── DATA (Supabase, RLS everywhere) ────────┐
 │ families · children · consent · learner model (mastery per     │
 │ topic) · review queue · events · curriculum catalog + editions │
 │ · lessons · safety cases (restricted) · no raw audio           │
 └──────────────┬─────────────────────────────────────────────────┘
                ▼
 ┌─────────────────────── CONTENT FACTORY ────────────────────────┐
 │ Ministry books + standards → catalog → teacher agents draft →  │
 │ HoD + grade head review → validator → evals → red team → live  │
 │ refresh pipeline every August and January                      │
 └────────────────────────────────────────────────────────────────┘
```

---

## 3. Stack

| Layer | Choice | Why | Status |
|---|---|---|---|
| Mobile app | Expo + React Native + TypeScript, Expo Router | One codebase, Android first (budget phones), iOS too | Built (skeleton) |
| Whiteboard | react-native-skia rendering a validated scene JSON | Animated drawing, no model-generated code | To build |
| Demos | Authored HTML/JS in a sandboxed WebView | Safe, reviewable, offline-capable | To build |
| Web (parent, teacher, admin) | Next.js on the same backend | Dashboards and content review | Phase 4 |
| Backend | Supabase: Postgres, Auth, RLS, Edge Functions, Realtime | Security in the database; small ops load | Built (schema) |
| Brain | Claude API via the TypeScript SDK; streaming; prompt caching per lesson; tool use for visuals | Best reasoning for Socratic tutoring | To build |
| Model | **Claude Opus 5.5 at low effort** as default; measure fast mode, Sonnet 5.5, Haiku 5.5 in Phase 1 | Quality first; latency and cost decided by measurement | Decision in Phase 1 |
| Voice | Voice-agent platform that calls **our** server for every reply (else our own pipeline) | Guardrail must sit before speech | Spike in Phase 2 |
| Arabic text | Normalisation and matching utilities (diacritics, hamza, alif) | Fair grading and leak detection in Arabic | To build |
| Content | Versioned JSON + validator; catalog + refresh pipeline | Reviewable, testable, updatable | Built (pipeline) |
| Payments | App store subscriptions (RevenueCat), local rails later | Store compliance for kids' apps | Phase 4 |
| CI and release | GitHub Actions, EAS Build and Submit, dev/staging/prod | Every check runs on every push | Phase 1 |
| Observability | Latency per turn, cost per session, leak-filter hits, recognition confidence | The numbers that decide go or no-go | Phase 1 onwards |

---

## 4. Phases: from today to full launch

Durations are **planning assumptions** for a small core team (founder + one senior full-stack developer + paid teacher reviewers + the agent team). Re-baseline after Phase 1.

### Phase 1: The brain (text, one lesson) · ~4 to 6 weeks
- **Build:** tutor Edge Function with streaming Claude, cached lesson prompt, visual tools, answer-leak filter (EN first, AR next), hint ladder, rubric grading; the CCSS 4.NF fractions lesson end to end in text with a simple whiteboard; CI.
- **Measure:** cost per turn and per session on Opus 5.5 low effort vs fast mode vs Sonnet 5.5 vs Haiku 5.5; time to first token.
- **Also:** clear the four council blockers (safety playbook, ethics checklist, revised onboarding, placement spec).
- **Exit gate:** 0 answer leaks across the red-team suite; teacher and HoD sign-off on the lesson; model choice made on measured numbers.

### Phase 2: Voice · ~4 to 6 weeks (overlaps the end of Phase 1)
- **Build:** voice spike (2 providers, child-like Arabic and English speech, interruptions); the chosen pipeline wired to the brain; captions; push-to-talk; tap fallbacks; text-only mode.
- **Exit gate:** first audio about 1.5 s after the child stops (p50), barge-in works, recognition good enough on child speech or tap fallback covers it, signed zero-retention voice contract.

### Phase 3: MVP, closed alpha · ~6 to 8 weeks
- **Scope:** council-approved onboarding (Ibi and the companions), **American Math grades 4 to 6** (33 CCSS clusters, roughly 60 to 70 lessons at an assumed 2 per cluster), learner model v1 (mastery, spaced review, "Today" plan), minimal parent summary, safety review queue with a named human reviewer.
- **Users:** 10 to 20 families (the plan's pilot size), parents present, recorded with consent.
- **Exit gate:** week-later recall beats pre-test on the taught skills; zero leaks in live sessions; no safety incident unhandled; children return without prompting; Grade 2 testing of onboarding done (council launch condition).

### Phase 4: Beta · ~3 to 4 months
- **Add:** American Science grades 4 to 6 (26 NGSS topic rows); **national Arabic and Social Studies** (the subjects parents worry about most); grades 2 to 3 and 7 to 8 for Math; class and group codes; gamification without streaks; parent app and web dashboard; teacher console; subscriptions; school pilots.
- **Religion:** only after the Islamic and Christian HoDs and the ethics designer approve the tutor's religion behaviour.
- **Exit gate:** retention and learning hold at 100+ families; cost per active child within the price target; legal answers received (Law 151/2020 questions); app store kids'-category review passed.

### Phase 5: Full launch (Egypt) · ~2 to 3 months after beta
- **Scope:** American Math and Science grades 2 to 8; national Arabic, Social Studies, Discover, Islamic and Christian religion grades 2 to 8, both terms, current editions; public app stores; marketing; support; safety operations staffed.
- **Exit gate:** live refresh cycle passed once (January or August books); all launch blockers from the council closed.

### After launch
British, IB, and French tracks (catalog is ready; content is not); learner model v2; more teacher and school features; other Arab markets.

---

## 5. The content factory: how big is the job (from our catalog)

| Slice | Topics in catalog | Lessons (assumption) | When |
|---|---|---|---|
| American Math, grades 4 to 6 | 33 clusters | ~60 to 70 | MVP |
| American Science, grades 4 to 6 | 26 topic rows | ~40 to 50 | Beta |
| American Math + Science, grades 2 to 8 | 140 | ~250 to 300 | Launch |
| National Arabic, grades 2 to 8 | 202 (book lessons) | ~200 | Beta to launch |
| National Social Studies + Discover | 83 | ~85 | Beta to launch |
| Islamic religion | 144 | ~145 | Launch (after review) |
| Christian religion | 108 | ~110 | Launch (after review) |
| **Total at launch** | | **roughly 800 to 850 lessons** | |

National topics are already lesson-sized (they come from book contents pages); international topics are clusters, assumed to need about 2 lessons each. **Gap:** Term 1 national books are still missing for most grades; Term 2 2026/2027 editions arrive around late January 2027 and the refresh pipeline will flag them.

**Throughput is the real constraint:** every lesson needs a teacher draft, HoD and grade-head review, validation, tutor evals, and a red-team pass. Measure review hours on the first 10 lessons in Phase 1, then size the reviewer team.

---

## 6. Costs: the structure, and what we know

### 6a. Running cost per child (the number that decides pricing)
**Formula:** cost per active child per month = sessions per month × (Claude cost per session + voice cost per session + infra share).

**Claude, illustrative only** (real list prices; usage is an assumption to measure in Phase 1):
- Assume a 15-minute session ≈ 30 tutor turns; each turn reads a cached lesson and history (~12k tokens), adds ~500 new tokens, writes ~300 output tokens including thinking.
- Prices: Opus 5.5 $4 in / $20 out per million tokens, cache reads $0.20; Sonnet 5.5 $2 / $10, cache reads $0.10; Haiku 5.5 $0.10 / $0.50.

| Model | Per turn (approx.) | Per 15-min session (approx.) |
|---|---|---|
| Opus 5.5, low effort | ~$0.01 | ~$0.30 to $0.40 |
| Opus 5.5, fast mode (2× price) | ~$0.02 | ~$0.60 to $0.80 |
| Sonnet 5.5 | ~$0.005 | ~$0.15 to $0.20 |
| Haiku 5.5 | well under $0.001 | a few cents |

Prompt caching is what keeps these low; without it, costs rise several times. Real numbers come from the Phase 1 measurement.

**Voice:** priced per minute by the provider; **unknown until the Phase 2 quotes**. Likely the largest per-session cost alongside Claude.

**Infrastructure** (Supabase, EAS builds, storage, monitoring): small fixed tiers at pilot scale; get current quotes.

### 6b. One-time and people costs (no figures: depends on hire vs contract)
| Item | Needed from | Note |
|---|---|---|
| Senior full-stack developer (mobile + backend + real-time audio) | Phase 1 | The critical hire |
| Teacher reviewers per subject (paid per lesson) | Phase 1 | Size after measuring review hours |
| Learning designer (part-time) | Phase 1 | Council blockers, lesson standards |
| Illustrator / character designer | Phase 3 | Ibi and the companions |
| Safety reviewer (trained human) | Phase 3 | Required before any child uses open conversation |
| Lawyer (Egyptian data protection, kids' apps) | Before Phase 3 | Council blocker for the data build |
| App store accounts, payments setup | Phase 4 | Store fees on subscriptions |

### 6c. What to decide pricing against
Subscription price per child minus store fees must cover the measured cost per active child at expected usage, with margin. That comparison is a Phase 3 exit input.

---

## 7. Risks that could break the plan

| Risk | Early signal | Mitigation |
|---|---|---|
| Kids reject the never-answer tutor | Drop-off after the first refusal | Phase 3 measures it; the hint ladder and the win-first design |
| Child speech recognition (Arabic, code-switching) too weak | Low confidence in Phase 2 | Tap fallbacks, confirm short answers, provider choice |
| Voice latency or cost too high | Phase 2 numbers | Fast mode or smaller model, caching, text mode |
| Content throughput too slow | Review hours on first 10 lessons | More reviewers, agents draft, narrower launch scope |
| Ministry books change mid-year | Refresh pipeline flags | Pipeline already built; January and August runs |
| Legal or app store rejection | Lawyer answers, store review | Council privacy decisions, parent-first consent |
| Safety incident | Review queue alerts | Named reviewer, playbook, red team, no auto-parent alerts |

---

## 8. Open decisions for the founder
1. **Team model:** hire the senior developer, contract, or find a technical co-founder.
2. **Budget and target launch window:** sets how many reviewers and how fast the content factory runs.
3. **MVP subject:** American Math grades 4 to 6 (recommended: verified data, ready lesson format) versus national Arabic (bigger pain, harder speech and content).
4. **Price point and free tier.**

---

## 9. Immediate next steps
1. Roadmap saved here (`docs/roadmap.md`).
2. Publish it as a visual, shareable page (the X-ray view) with the architecture, phase timeline, content sizing, and cost model.
3. Start Phase 1: assign the four council blockers to the team in parallel and begin the tutor brain for the 4.NF lesson (no billed Claude API calls without the founder's approval).

## Verification
- Roadmap numbers trace to sources: catalog counts (`data/catalog/export/curriculum_topics_by_grade.csv`), Claude list prices, council minutes.
- Each phase has a measurable exit gate; Phase 1's measurements replace every assumption marked here.
