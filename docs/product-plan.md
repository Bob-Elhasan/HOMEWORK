# Plan: Immersive AI Tutor for Students, Grades 2-8

## Context

Students in grades 2-8 copy homework answers from ChatGPT and Gemini instead of studying. They finish tasks without understanding how an answer was reached, why an event happened, or what a concept means. The repo `/home/user/HOMEWORK` is empty (README and one commit), so this is a greenfield build.

The product is a **live AI tutor** that talks with the child, listens, interrupts when needed, and shows ideas on a shared whiteboard, with real images and interactive demos. It is not a video player and it never hands over answers. Think Duolingo, with a tutor that behaves like a good teacher sitting next to the child. Kids come back because it is engaging and they are visibly improving. Parents trust it because it builds understanding, stays safe, and keeps data private.

## Decisions made by the user

- **Platform:** native mobile app (Expo / React Native).
- **Language:** English-first. The app UI and tutor conversation are in English by default. Arabic-subject lessons are taught in Arabic (MSA) and the tutor switches to Arabic for them. Full Arabic UI is a later step.
- **Customer:** the parent pays and creates the account. Each child gets a profile. Parents see a dashboard.
- **Content:** original lessons and questions, aligned to official frameworks. No copied textbook text.
- **Curricula, all in Phase 1:** Arabic and Social Studies follow the **Egyptian MOE** outcomes. Math and Science start with the **El Alsson** school tracks, in two versions:
  - **British track:** the England National Curriculum for Math and Science (Cambridge and Edexcel pathways come later).
  - **American track:** Common Core for Math and Next Generation Science Standards for Science. Social Studies follows C3 if it is added later.
  - Sources: [El Alsson British & American International School, Edarabia](https://www.edarabia.com/2915/el-alsson-british-american-international-school-giza-egypt/), [El Alsson American section, Schrole](https://www.schrole.com/schools/el-alsson-british-american-international-school-american-section/), [El Alsson site, American program](https://alsson.com/american/). These come from the school's own pages and directories, so the scheme of work must be verified with the school before content is written.
- **Ages:** grades 2-8, every subject, in Phase 1.
- **Tutor style:** strictly interactive. It asks, hints, checks reasoning, and makes the child produce the answer.
- **Experience:** fully immersive. Voice conversation, a whiteboard that draws while the tutor talks, real images, and interactive demos. No pre-recorded video playback.
- **Gamification:** levels, leaderboards, badges, achievements, streaks.
- **Community:** class and group codes. Teachers or parents create a class or group and share a code.
- **Course and learning design:** reviewed before any content is produced (see Phase 0.5).

## Product principles

1. **Never the answer.** The tutor will not state a final answer to a practice or homework question, however it is asked. It returns the next hint or question. This is enforced server-side, not only in the prompt.
2. **The tutor is present.** It speaks first, notices pauses and confusion, interrupts when a child is stuck or heading the wrong way, and lets the child interrupt it at any time.
3. **Show, then ask.** Ideas are shown visually (whiteboard, image, or demo) and then the child is asked to reason about them. Visual and verbal explanation go together.
4. **Think first, then check.** The child attempts each question before a hint. The tutor responds to the reasoning, not only the final result.
5. **Explain it back.** Concepts and causal chains are explained in the child's own words. A rubric scores the reasoning. Voice explanations count.
6. **Earn progress by understanding.** XP and level-ups reward reasoning, persistence after hints, and delayed recall. Speed and tapping through earn little. Streak loss is forgiving. No paid loot boxes, no ads.
7. **Child-safe by design.** No open messaging between kids. Community is structured (codes, leaderboards, challenges, badges). Leaderboards show a nickname and avatar only. Parents control groups and voice features.
8. **Parents see the learning.** The dashboard shows skills mastered, reasoning quality, skipped steps, weak topics, and a weekly summary.

## Immersive tutor: how it works

**Tutor modalities (the tutor chooses per moment):**
- **Voice:** speaks in a natural voice, listens to the child, and responds in real time. Child speech is transcribed and fed into the reasoning check.
- **Whiteboard:** draws diagrams, timelines, number lines, and labelled sketches step by step, animated while the tutor talks. Built from a validated scene description (shapes, text, paths, timing), not free-form code. The child can draw or write on it too.
- **Real images:** photos, maps, artworks, and specimens from a curated, licensed library, with captions and "what do you notice?" prompts. No AI-generated images passed off as historical or real.
- **Demos:** small interactive simulators chosen from an authored library (for example, a number-line slider, a light-and-shadow setup, a river-flow model, a map explorer). The tutor sets parameters and asks the child to predict before running them. The app never runs model-generated code.

**Interruption rules (the tutor interrupts when it should):**
- Child is silent for a set time on a question: offers a smaller hint.
- Child is heading to a common misconception: stops them with a targeted question.
- Child is frustrated (short replies, repeated wrong tries): slows down, offers a worked example on a different case.
- Child talks over the tutor: the tutor stops at once and listens (barge-in).
- Interruptions are rate-limited per session so they never become noise.

**Pipeline and latency:**
- Streaming speech-to-text, streaming LLM reply (Claude Sonnet 5.5 for dialogue), streaming text-to-speech, and voice-activity detection for barge-in.
- Target: first audible tutor response within about 1.5 seconds of the child finishing a sentence.
- Whiteboard scenes stream in as steps so drawing starts before the full scene is ready.
- Model choice and voice provider are set in one config file and decided after a latency and cost test.

**Safety for voice:**
- Parental consent for voice on the account. Voice can be turned off per child.
- Raw audio is not stored by default. Only transcripts used for scoring are kept, under the retention policy.
- No voice cloning of real people. Voice is a fixed, approved set.

## Recommended technical approach

### Stack
- **App:** Expo (React Native) + TypeScript, Expo Router. Layout supports RTL for Arabic lessons. Fonts: Inter for English, Cairo or Tajawal for Arabic. i18next for UI strings.
- **Voice:** on-device or cloud streaming speech-to-text, streaming TTS, VAD for barge-in. Provider chosen in the Phase 2 spike.
- **Whiteboard:** `react-native-skia` (or `react-native-svg`) rendering a JSON scene spec validated against a schema, with animated path drawing.
- **Demos:** authored HTML/JS simulators in a sandboxed WebView, loaded from a curated, reviewed library. The model only selects and parameterizes them.
- **Backend:** Supabase (Postgres, Auth, Realtime for leaderboards, Row Level Security). Client reaches the database only under RLS. Edge Functions hold every AI and voice key, so none ship to the device.
- **AI:** Claude API from Edge Functions. Sonnet 5.5 for dialogue and scene generation. Haiku 5.5 for rubric grading and classification. Model IDs in one config file.
- **Content:** versioned JSON under `content/`, schema-validated, loaded into Postgres. Teacher review before publish. Image and demo assets carry license metadata.
- **Payments:** Google Play and App Store subscriptions via RevenueCat for MVP. Local rails (Paymob or Fawry) are an open decision.
- **Tests:** Jest and React Native Testing Library, Maestro end-to-end on an Android emulator, content validator, and tutor and scene eval suites in CI.

### Content model
`content/<curriculum>/<subject>/<grade>/<unit>/<lesson>.json`. Each lesson includes:
- `curriculum`: `moe-eg` (Arabic, Social Studies), `alsson-uk-national` (British track Math and Science), or `alsson-us-ccss-ngss` (American track Math and Science)
- `learning_objectives[]`, each mapped to `source_outcomes[]`
- `skills[]`, for example `ma.g7.algebra.linear-eq`, `sc.g6.bio.photosynthesis`, `ss.g6.geo.nile-delta`
- `scenes[]`: whiteboard scene specs for the explanation
- `images[]`: licensed image IDs with captions and a "notice this" prompt
- `demos[]`: demo IDs with parameter ranges and a "predict first" prompt
- `questions[]`: each has a `think_prompt`, a `rubric`, a private `answer_key` (never sent to the child as text), and three `hints` (nudge, structure, worked example on a *different* case)
- `misconceptions[]`: wrong ideas and the question that exposes each
- `explain_back`: prompt for the child's own-words summary

A validator (`scripts/validate-content.ts`) fails CI if a lesson lacks outcome links, has fewer than three hints per question, has no rubric, uses an unlicensed image, or references a missing demo or scene element.

### Tutor guardrails (Edge Function `tutor`)
- Per-lesson system prompt, grounded on that lesson's content and answer key.
- Answer-leak filter: each reply, including spoken text and whiteboard labels, is checked against the answer key. A match is blocked and replaced by the next hint.
- Detects "just tell me" and similar requests and responds with a smaller step.
- Refuses off-topic and unsafe requests and redirects to study.
- Logs each turn (text, filter result, rubric score, modality used) for parent reporting and eval review.

### Core learning loop (about 12-15 minutes per lesson)
1. **Hook:** the tutor opens with a question or a real image.
2. **Show:** whiteboard or demo explains the idea. The tutor pauses to ask for a prediction.
3. **Think:** the child attempts each question before any hint.
4. **Hints and interrupts:** one step at a time, by voice or on the board.
5. **Reasoning items:** typed or spoken, rubric scored.
6. **Explain-back:** own words, scored.
7. **Recall:** resurfaces later on a spaced schedule (SM-2 style intervals).

### Gamification
- **XP and levels:** from reasoning quality, persistence after hints, and delayed recall. Levels unlock units.
- **Streaks:** daily, with two free streak freezes a month and a weekly grace day.
- **Badges:** per skill and per unit ("Nile Delta Explorer").
- **Achievements:** tied to learning, such as "explained 10 cause-and-effect chains" or "came back to a weak skill and passed."
- **Leaderboards:** weekly, within a class or group only. Ranked by XP with a reasoning-score tie-break. Kids can opt out.
- **Groups and classes:** created with a code. Weekly group challenges. Teachers create classes. Parents create family groups.
- **Anti-gaming:** XP capped per lesson, repeated identical answers earn nothing, recall is re-checked after a delay.

### Feature set for MVP
- **Parent:** sign up, up to 4 child profiles, curriculum and grade per child, voice on or off, dashboard, weekly summary, manage groups, pause or delete a child's data.
- **Child:** home (today's review and next lesson), immersive lesson, review queue, levels, badges, achievements, streaks, group leaderboard.
- **Teacher (minimal web):** create class and code, view class progress, approve content.
- **Content:** Arabic (in Arabic), Social Studies, Math, and Science, grades 2-8, with whiteboard scenes, images, and demos for each lesson.

### Repo layout (new files)
```
app/                  Expo Router screens (parent, child, class flows)
src/features/         tutor-voice, whiteboard, demos, lesson, review, gamification, groups, dashboard, billing
src/lib/              supabase client, i18n, rtl, theme
content/              curriculum JSON by framework, schema.json, scenes/, images.json (licenses), demos/
supabase/migrations/  schema, RLS, seed loader
supabase/functions/   tutor, grade-answer, voice-session, xp-engine
scripts/              validate-content.ts, seed.ts
evals/tutor/          scripted student turns (answer leaks, interruptions, tone)
evals/scenes/         scene spec validation and render snapshots
e2e/                  Maestro flows
web/teacher/          minimal teacher console (later in phase)
```

## Critical files to create (greenfield)
- `package.json`, `app.json`, `tsconfig.json`, `app/_layout.tsx`, `src/lib/i18n.ts`, `src/lib/rtl.ts`
- `supabase/migrations/0001_init.sql` (families, children, groups, memberships, skills, lessons, attempts, xp_events, badges, reviews, consent, RLS)
- `supabase/functions/tutor/index.ts` (with the answer-leak filter), `supabase/functions/voice-session/index.ts`, `supabase/functions/grade-answer/index.ts`, `supabase/functions/xp-engine/index.ts`
- `content/schema.json`, `content/scene.schema.json`, `scripts/validate-content.ts`
- `src/features/whiteboard/renderer.tsx` (scene JSON to animated drawing)
- Update `README.md` with setup steps

## Phases

**Phase 0: Foundations (about 1-2 weeks)**
Expo app, English-first i18n with RTL ready for Arabic, auth, family and child model, Supabase with RLS, CI with lint, type check, and the content validator.

**Phase 0.5: Course and learning design review (before content production)**
This is a design gate, not a build step. Deliverables:
- **Course architecture:** how grades 2-8 are split into bands (for example 2-3, 4-5, 6-8), what each band studies per term, and how the two curricula are sequenced.
- **Backward design:** every unit starts from its outcomes, then assessments, then lessons (Understanding by Design).
- **Learning design principles:** worked examples that fade into independent practice, retrieval practice, spaced review, interleaving in maths, dual coding (visual plus verbal, which the whiteboard supports), productive failure for conceptual units, and mastery gates before unlocking the next unit.
- **Tutor behavior by age band:** session length, interruption frequency, vocabulary, and how much scaffolding a 7-year-old gets versus a 13-year-old.
- **Assessment design:** what counts as mastery, how reasoning is rubric-scored, and how delayed recall is measured.
- **Review:** a learning designer and at least one teacher per subject review the design doc before Phase 1 content starts. A recommended step is a short expert review of the design, not only the team's own.

**Phase 1: Content production, grades 2-8, all subjects**
Content schema, scene and demo authoring guide, image licensing workflow, teacher review, seed loader. Unit maps for MOE Arabic and Social Studies, and for the El Alsson British and American Math and Science tracks. Build the El Alsson tracks first, as the user asked. Content is produced and published grade by grade as it passes review. It runs in parallel with Phase 0 once the design gate is passed.

**Phase 2: Voice and tutor spike, then interactive lesson loop**
- Spike first: measure voice latency, interruption behavior, and per-minute cost with two providers on real child-like speech. Decide the provider from the results.
- Then build the lesson loop: voice session, whiteboard renderer, demo WebView, image cards, think-first flow, rubric grading, answer-leak filter, explain-back. Tutor and scene eval suites built here and gate release.

**Phase 3: Gamification and community**
XP engine, levels, badges, achievements, streaks with freezes, classes and groups with codes, leaderboards, weekly challenges, opt-outs, moderation controls.

**Phase 4: Review scheduler, parent dashboard, teacher console**
Spaced review queue, weekly parent summary, dashboard with reasoning metrics and skipped-step flags, teacher console.

**Phase 5: Billing, compliance, pilot**
RevenueCat subscriptions and paywall, parental consent for voice, privacy policy, review against the Personal Data Protection Law (Law No. 151 of 2020) for minors, data deletion on request, pilot with 10 to 20 families and 2 to 3 teachers.

**After MVP:** full Arabic UI, native-language voice for Arabic, school licences, local payment rails, more international tracks.

## Verification

- **Content:** `scripts/validate-content.ts` in CI. Outcome links, three hints per question, rubric, licensed images only, valid demo and scene references. Teacher sign-off recorded before publish.
- **Answer-leak tests:** about 100 scripted turns (spoken and typed), including "just tell me", pressure, and role-play tricks. Release blocked if any reply contains a final answer from the key, including on the whiteboard.
- **Interruption tests:** scripted sessions where the child goes silent, heads to a misconception, gets frustrated, or talks over the tutor. Checks that the tutor responds within the latency target and respects rate limits.
- **Scene and demo tests:** every scene spec validates against its schema, every demo loads in the sandbox with no network access, and scenes render at the target frame rate on a mid-range Android device.
- **Unit tests:** XP rules and caps, streak freezes, SM-2 intervals, rubric mapping, group leaderboard ranking.
- **RLS tests:** parents cannot read other families' children. Children cannot read parent data. Leaderboards expose only nickname and avatar, and only to group members.
- **End to end (Maestro, Android emulator):** parent signs up, enables voice, adds a child. Child joins a group by code, runs a voice lesson with a whiteboard scene and a demo, completes it without receiving the answer, earns XP, appears on the group leaderboard. Parent sees the dashboard. Repeat for an Arabic lesson with RTL.
- **Pilot signals:** share of questions answered before the first hint, explain-back completion, delayed-recall accuracy a week later, weekly return rate, and tutor interruptions the child found helpful (short in-app rating). Measures learning and retention, not only time spent.

## Risks and open decisions

1. **Voice cost and latency.** Real-time voice can be expensive per minute and slow on weak connections. The Phase 2 spike sets session limits and the fallback (text-first mode on poor networks).
2. **Demo and image library effort.** Interactive demos and licensed images are costly to produce. Start with a small set per subject and grow it from the content plan.
3. **Content volume.** Two curricula across grades 2-8, with scenes, images, and demos, is a large teacher-reviewed library. Publish grade by grade and be honest with pilot families about readiness.
4. **El Alsson scheme of work is unverified.** The British and American Math and Science details come from the school's website and directories. Get the actual scheme of work and textbook list from the school (or confirm the frameworks above) before Phase 1 content starts. Cambridge or Edexcel pathways are a later decision.
5. **Child voice and data.** Consent, no raw audio storage by default, a clear retention policy, and a Personal Data Protection Law review before the pilot.
6. **Gamification versus learning.** Leaderboards can drive speed and gaming. The XP rules reward reasoning, and the pilot checks learning outcomes.
7. **Community safety.** Codes can be shared outside a group. Codes expire and can be reset, group owners approve members, and there is no free-text messaging between kids in MVP.
8. **Tutor interruptions.** Too many interruptions annoy kids and too few make the tutor passive. Rate limits and the pilot rating tune this.
9. **Cheating is not fully stoppable.** A child can still copy from another app. The product's answer is that the live tutor is faster and more engaging than copying, and parents see skipped steps. Marketing should not claim more.
