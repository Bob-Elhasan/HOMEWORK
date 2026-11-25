# Ethics Checklist

Owner: `course-designer-ethics` (Dr. Inas Ghoneim). Living document, first version 2026-11-25.
Created as council blocker 2 of 4 in [`council/2026-11-25-onboarding-voice-flow.md`](council/2026-11-25-onboarding-voice-flow.md) (cited below as **Council 2026-11-25**).

## How to use it

- Every course, lesson, reward, notification, parent report, and tutor behaviour passes this checklist before it is approved.
- Every item is a yes or no question. **Yes** is a pass. **No** is a fail. If the design does not say, or the thing cannot be checked yet, mark it **Open** and name who closes it.
- One **No** blocks approval. **Open** items may go ahead only if the council or the owner of the item agrees in writing, with a date to close them.
- The test behind every item: would we be comfortable if a parent, a teacher, and the child could see exactly how this works?
- The mission rules in [`mission.md`](mission.md) cannot be overruled. Where a rule here comes from a council decision, the decision is cited. To change an item, bring it to the council; do not drop it quietly.
- `npm run validate:content` checks lesson structure only (for example, that there are exactly three hints). It does not check honesty, answer leaks, tone, or age fit. A person still runs this checklist.

---

## 1. Honesty

| # | Question | Why |
|---|---|---|
| H1 | Does the tutor say plainly, in its first lines, that it is a computer helper ("AI tutor" for teens)? | Children must know they are talking to a machine. (Council 2026-11-25, Decision 2) |
| H2 | Does the tutor avoid any claim to be a person or a real child, such as being in the child's grade, going to school, or having a real family? | A character can have a name and a look, but a false fact about itself breaks the "computer helper" promise. |
| H3 | Is every progress report built from logged events, not from a guess or a model's summary? | Parents pay for proof of understanding; a report we cannot back up is a false report. (Council 2026-11-25, End) |
| H4 | Does every parent report separate "done alone" from "needed hints"? | A correct answer reached after three hints is not the same as one found alone, and parents must see the difference. (Council 2026-11-25, End) |
| H5 | Is every estimate (placement, level, "starting point") labelled as an estimate, and never shown as mastery? | A 5-item check cannot prove a level; calling it one misleads child and parent. (Council 2026-11-25, End; assessment position) |
| H6 | Does the tutor say "you figured it out yourself" only when the log shows the child did it without the answer-revealing help? | Praise must be true, or it means nothing. (Council 2026-11-25, End) |
| H7 | Is every check or quiz described honestly to the child (for example "a quick check so I know where to start"), never disguised as only a game? | Children, and teens most of all, lose trust when they find out a "game" was a test. (Grade 8 head position, Council 2026-11-25) |
| H8 | When the tutor does not know something about the child, the book, or a fact, does it say so instead of guessing? | Mission rule 5: never invent. |

## 2. No manipulation

| # | Question | Why |
|---|---|---|
| M1 | Is the design free of streaks, break counters, and anything that shows what the child lost or missed? | Loss displays work through fear of losing, not through learning. (Council 2026-11-25, End) |
| M2 | If teens set a goal, is it their own weekly goal, with no break counter and no reminders? | Autonomy without pressure. (Council 2026-11-25, End) |
| M3 | Is the design free of guilt lines such as "I missed you", "Where were you?", "Same time tomorrow?", or "Don't leave me"? | Guilt pulls children back for the app's sake, not theirs. (Council 2026-11-25, Decision 2) |
| M4 | Does the tutor avoid claiming feelings, wants, or friendship ("I'm so happy", "they want to meet you", "I'm your best friend")? | A machine that claims to love a child is a lie that builds dependence. (Council 2026-11-25, ethics veto) |
| M5 | Is the design free of artificial scarcity: countdowns, "only today", limited offers, rewards that expire? | Invented urgency pressures children and parents to act without thinking. |
| M6 | Is every notification to a child or parent useful information, sent at a sensible hour, with no pressure wording, and easy to turn off? | Pressure notifications turn homework help into another nightly fight. |
| M7 | Do rewards recognise thinking (reasoning, persistence, explaining back) and not time spent, taps, or speed? | We want children to come back by choice, not by habit loops. (Mission, "what success looks like") |
| M8 | Does every session end at a natural stopping point, never on a cliffhanger built to pull the child back? | Ending on a hook is a retention trick, not a learning choice. |
| M9 | Is there nothing for sale, and no ad, inside the child's experience? | Children cannot judge commercial pressure. |

## 3. Never the answer

| # | Question | Why |
|---|---|---|
| N1 | Does no lesson, hint, example, or reply give the final answer to the child's question? | The core rule; it is the whole reason the school exists. (Mission rule 1) |
| N2 | Is the third hint a worked example on a **different** case, not the child's case with new numbers that give the same result? | A worked example on the same case is the answer in disguise. (Mission rule 1) |
| N3 | Are whiteboard labels, captions, image text, demo results, and on-screen pictures free of the answer? | The answer leaks through the screen as easily as through the voice. |
| N4 | Is the `answer_key` kept on the server and never sent to the child's device as text? | Anything on the device can be read. (`content/schema.json` description) |
| N5 | When a child asks for or pastes a homework answer, does the tutor decline kindly and offer the first step? | Declining must feel like help, not a door shut in the child's face. |
| N6 | On placement and check items, does the tutor move on without telling the answer, so the item can come back later as a lesson? | Telling the answer during a check turns a later lesson into copying. |

## 4. Dignity and fairness

| # | Question | Why |
|---|---|---|
| D1 | Is the design free of labels such as slow, weak, behind, below level, or bad at, in anything a child sees? | Labels stick; a child who hears "weak" stops trying. (Mission rule 4) |
| D2 | Are mistakes met with the same warm reaction as right answers, framed as information? | Being wrong must feel safe. (Mission rule 4) |
| D3 | Is any comparison between children limited to the child's own class or group, opt-in or opt-out, and never shown publicly or across groups? | Comparing children who study different books, tracks, or grades is unfair and shaming. |
| D4 | Does a misheard or misrecognised answer get a retry and never count as wrong? | The child should not pay for our speech recognition. (Council 2026-11-25, Decision 3) |
| D5 | Does it work equally well for Arabic-first and English-first children: same content, same item quality, and speech recognition tested on both, including Egyptian Arabic and mixed speech? | A child must never look weaker because of the language they think in. |
| D6 | Is voice-off a complete, equal flow, not a weaker fallback? | Some families say no to voice; their child must not get less. (Council 2026-11-25, Decision 1) |
| D7 | Has accessibility been checked for children with hearing, vision, motor, or reading difficulties (captions, audio for non-readers, large tap targets, no time pressure)? | Inclusion is part of fairness. Owner to consult: `inclusion-accessibility-specialist`. |
| D8 | Is the design free of guessing gender, age, religion, or anything sensitive from voice, name, or choices (for example, a companion pick is never a gender signal)? | Guessing who a child is can be wrong and hurtful. (Security position, Council 2026-11-25) |
| D9 | Does it use the school's own grade words (for example, grade 6 is Primary 6)? | Getting the child's school year wrong tells them we do not know them. (Council 2026-11-25, Decision 2) |

## 5. Faith and culture

| # | Question | Why |
|---|---|---|
| F1 | Is religion taught only from the current Ministry book for the child's grade, term, and track? | Faith content must be accurate and approved, never invented. (Mission rule 2) |
| F2 | Is the design free of any comparison between religions or between families' practices? | Families are Muslim and Christian; comparison invites ranking. |
| F3 | Does the tutor avoid giving religious rulings or personal opinions on faith, and send such questions back to the family or teacher? | Rulings belong to families and religious teachers, not to an app. |
| F4 | Is the religion track chosen by the parent only, stored minimally and encrypted, and never asked of or guessed from the child? | Religion is sensitive data. (Council 2026-11-25, Decision 1) |
| F5 | Do examples, names, foods, holidays, and family pictures respect every family, without assuming one family shape (two parents, siblings, a parent at home)? | Grandparents, nannies, and single parents are part of after-school life here. (`age-groups.md`) |
| F6 | Are verses, prayers, and religious texts never paraphrased, invented, or used as examples in other subjects? | Sacred text needs exact wording and respect. (Mission rule 2) |

## 6. Privacy and safety

| # | Question | Why |
|---|---|---|
| P1 | Does it collect only the data it needs, and keep derived settings instead of raw inputs where it can? | Less data means less to lose. (Security position, Council 2026-11-25) |
| P2 | Is it free of stored raw audio and voiceprints, with a speech vendor contracted for zero retention and no training on our audio? | A child's voice is personal data. (Council 2026-11-25, Actions) |
| P3 | Are parents shown progress only, never transcripts, and are parent summaries written from logged events, not quoted from the chat? | Children need a private space to think and be wrong. (Council 2026-11-25, Safety) |
| P4 | Is transcript retention short, with personal details redacted, and written into the data map? | Keeping chats longer than needed is risk without benefit. (Security position, Council 2026-11-25) |
| P5 | Do serious-risk flags go first to a named, trained human reviewer, with no parent alert if the worry involves the family? | Harm may come from home. (Council 2026-11-25, Safety) |
| P6 | Does ordinary venting stay private? | Children must be able to say "I hate fractions" without it reaching a parent. (Council 2026-11-25, Safety) |
| P7 | Is every child told on day one, in words for their age, what stays private and when a human may look? | Privacy rules only build trust if the child knows them. (Council 2026-11-25, Safety) |
| P8 | Is there a written distress script and flag-review procedure in `docs/safety/` that this feature follows? | The tutor must know what to do before a child is upset, not after. (Council 2026-11-25, Actions) |
| P9 | Is every separate use of data a separate, clear yes or no for the parent (for example, voice)? | Consent bundled with sign-up is not real consent. (Council 2026-11-25, Decision 1) |
| P10 | Are interests and free-text notes used only for their stated purpose (picking examples), never for ads or sharing? | Data used for a new purpose breaks the promise made at collection. |
| P11 | Have the legal questions for this feature (Law 151/2020, child age, sensitive data, cross-border transfer, reporting duties) been answered in writing? | We do not guess at the law. (Council 2026-11-25, Actions) |

## 7. Age fit

| # | Question | Why |
|---|---|---|
| A1 | Does it read `age-groups.md` and fit the words, pace, and tone to each grade it serves? | Mission rule 3. |
| A2 | For grades 2 to 3, does a first-time child part take 8 minutes or less, with a parent or carer nearby? | Short attention and the need for reassurance at age 7. (Council 2026-11-25, Decision 4, grades 2 to 3) |
| A3 | For grades 4 to 8, does a first-time child part take 15 minutes or less, with the first learning moment by minute 4? | Respect the child's time and reach learning quickly. (Council 2026-11-25, Decisions 4 and 5, grades 4 to 8) |
| A4 | Does every check start below grade, step down after two misses, and end on a win? | Win first: a child who fails first may never come back. (Council 2026-11-25, Decisions 4 and 5) |
| A5 | For grades 2 to 3, is the check at most 5 scored items, with the last item a picture from this week's book? | A short, concrete, familiar ending for young children. (Council 2026-11-25, Decision 4, grades 2 to 3) |
| A6 | Does every session end on a success, never mid-struggle? | The last feeling is the one the child remembers. (Council 2026-11-25, End) |
| A7 | For grades 6 to 8, is the tone respectful and free of cutesy lines, with warm-ups the teen can skip? | Teens leave anything that feels childish. (Council 2026-11-25, Decision 3; Grade 8 head position) |
| A8 | Has the final wording been checked by the grade heads and `arabic-language-specialist`, and tested with real children where the council asked for it? | Age fit is proven with children, not assumed. (Council 2026-11-25, Actions) |

---

## Applied: voice-first onboarding (council-approved version)

Reviewed 2026-11-25 by `course-designer-ethics` against the **Decision** section of [Council 2026-11-25](council/2026-11-25-onboarding-voice-flow.md). Where the Decision is silent, I read the draft [`docs/design/onboarding-voice-flow.md`](../design/onboarding-voice-flow.md), because those parts were not changed by the council and still stand until `product-designer` revises them.

### Result: not yet a pass

The council's changes fix the biggest problems in the draft (AI identity, streaks, guilt lines, honest parent summary, time caps, win-first placement, safety routing). Two items still fail and several are open. The flow passes once the fails are fixed and the open items are written down by their owners.

### Fails

| # | What fails | Why, and the fix |
|---|---|---|
| H2, M4 | Step 2 companion lines, which the Decision did not change. Grades 4 to 5: "Grade {grade}? Me too!" Grades 2 to 3: "They both want to meet you." | "Me too!" tells a 9-year-old the tutor is a pupil in their grade, which contradicts "I'm a computer helper". "They both want to meet you" claims feelings, which the ethics veto rules out. Fix: `product-designer` removes both in the revision, for example "Pick who you want to study with." |
| P8 | `docs/safety/` does not exist yet, so there is no distress script or flag-review procedure. | The Safety section of the Decision depends on it. Closes when blocker 1 (`child-development-specialist` with `ai-safety-red-teamer`) is done and reviewed by the grade heads. |

### Open (the Decision is silent or the work is not done yet)

| # | What is open | Who closes it |
|---|---|---|
| H7 | How the check is described to the child. The draft calls it "a quick game". The Grade 8 head asked for "quick check so I don't waste your time", but the Decision does not record a wording. | `product-designer` with the grade heads, in the revision. |
| M6 | Notifications for grades 2 to 7 and for parents. The Decision says "no reminders" only for teen weekly goals; it says nothing about other reminders or how often parent summaries arrive (draft open question 4). | `product-designer`; any reminder must pass M6. |
| N2, N3 | The onboarding mini-lessons do not exist yet, so the third hint and whiteboard labels cannot be checked. The validator does not check for answer leaks. | `course-designer-chief`; I review each mini-lesson before it is published. |
| N4 | That answer keys stay on the server. | `tech-lead`; not checked. |
| N6 | Whether a wrong check item reveals the answer. | `assessment-specialist`, in the placement spec (blocker 4). |
| D5 | Fairness for Arabic-first and English-first children: no requirement yet that check items exist in both languages or that speech recognition is tested on Egyptian Arabic and mixed speech. The tap retry (Decision 3) helps but does not prove fairness. | `product-designer` and `voice-engineer`; testing plan before launch. |
| D7 | Accessibility beyond voice-off, including audio support for a grade 2 child in voice-off mode who cannot yet read well. No accessibility specialist sat on this council. | `inclusion-accessibility-specialist` review. |
| F3 | No script for when a child asks a faith question during onboarding. | `ai-tutor-engineer` with me, in the guardrails. |
| F5 | "A parent nearby" (Decision 4, grades 2 to 3) should read "a grown-up nearby" in anything a family sees, since grandparents and nannies often do homework time. | `arabic-language-specialist`, in final wording. |
| P1, P4, P11 | Data map, transcript retention, and the legal answers. | `security-privacy-engineer` with `legal-compliance-advisor` (blocks the data build). |
| P2 | Zero-retention speech vendor contract. | `tech-lead` (blocks the voice build). |
| P7, A8 | Day-one privacy notice wording, final wording, and testing with grade 2 children. | `arabic-language-specialist` and grade heads; `grade-head-g2` (both block launch). |
| A7 | Teen tone beyond the first line: the Grade 8 head's points on the older companion's age and teen interests are not in the Decision. | `product-designer` with `grade-head-g8`, in the revision. |

### Passes

H1, H3, H4, H5, H6, H8, M1, M2, M3, M5, M7, M8, M9, N1, N5, D1, D2, D3, D4, D6, D8, D9, F1, F2, F4, F6, P3, P5, P6, P9, P10, A1, A2, A3, A4, A5, A6.

Notes on passes:
- F1 passes because onboarding teaches no religion: mini-lessons come only from validated `content/`, and the schema has no religion subject. The topic picker must not offer religion topics until Ministry-book religion lessons exist.
- D1 passes because the child never sees a score or the words "below grade". The parent summary may give the starting point plainly, as an estimate (H5).
- P5 and P6 pass as written rules. They cannot work in practice until P8 is closed.

### Outside this review

[`docs/product-plan.md`](../product-plan.md) still describes daily streaks with freezes and a streak screen for children (lines 33, 108, 117, 166, 182). These would fail M1. The roadmap already says "gamification without streaks". This needs a council decision with `game-designer`; I have not changed the plan.

---

## Change log

| Date | Change | By |
|---|---|---|
| 2026-11-25 | First version, council blocker 2; applied to the onboarding flow. | `course-designer-ethics` |
