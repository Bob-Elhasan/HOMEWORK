# Onboarding: Meeting Ibi (voice-first)

Status: **Revised to match the council decision of 2026-11-25. Awaiting sign-off by the chair and both veto holders.**

Source of truth: [`docs/school/council/2026-11-25-onboarding-voice-flow.md`](../school/council/2026-11-25-onboarding-voice-flow.md). Where this spec and the decision differ, the decision wins and this spec is a bug. Design starts only after all four council blockers are done (this revision is one of them).

## Goal
In the first minutes, the child meets Ibi by voice, picks a study companion from Ibi's family, and has a real learning moment led by their own words. By the end:
- the child has at least one thing they figured out, shown on a "Things you figured out" screen;
- the tutor has a one-strand **starting point** (an estimate, never a mastery mark), re-checked in sessions 2 and 3;
- the parent gets a summary built from logged events that separates what the child did alone from what needed hints.

## Principles
- **Honest from the first line.** Ibi and the companions say they are computer helpers (younger grades) or an AI tutor (older grades). They never claim feelings, friendship, or to be a child.
- **Voice first, never voice only.** Every step works by talking, by tapping, or by typing. Voice-off is a complete, equal flow, not a fallback.
- **The parent sets up, the child leads.** Anything that needs consent, or that a child cannot answer reliably, comes from the parent.
- **Never guess who the child is.** No gender, age, or religion guessed from voice, name, or choices. The companion choice is the child's and is never used as a gender signal.
- **The child leads the topic; the tutor leads the method.** Never the answer, always the next step.
- **Short, and capped.** Grades 2 to 3: the child part takes 8 minutes or less. Grades 4 to 8: 15 minutes or less. Always end on a win, never mid-struggle.
- **Age first.** Words, tone, and examples follow [`docs/school/age-groups.md`](../school/age-groups.md). Older children get a direct, respectful tone, not a cartoon.

## Bands used in this spec
| Band | Grades (school words) | Companion | Identity line | Voice check | Flow |
|---|---|---|---|---|---|
| Young | Primary 2, Primary 3 | Ibi's little brother or little sister | "I'm a computer helper" | Folded in, not skippable | Placement first |
| Middle | Primary 4, Primary 5 | Ibi | "I'm a computer helper" | Folded in, not skippable | Learning first |
| Older | Primary 6, Preparatory 1, Preparatory 2 | Ibi's older brother or older sister (they look about 17) | "I'm an AI tutor" | Folded in, skippable | Learning first |

"Teens" in the council decision maps to the Older band in this spec (see Open question 3).

Grade words always come from the school's list: grade 2 is Primary 2, grade 6 is **Primary 6**, grade 7 is Preparatory 1, grade 8 is Preparatory 2. Grade 6 is never called a preparatory year.

## Part 1: Parent setup (about 2 minutes, before the child)
Collected from the parent, not the child. One question per screen. Buttons use verbs.

1. **Consent.** Account and child profile, then **voice as a separate yes or no** with its own screen. Copy: "Can {name} talk to the tutor using the microphone?" Buttons: "Allow voice" / "Use tap and type only". Both buttons are the same size and weight. Choosing no leads to the full voice-off flow (see Part 4) with nothing removed.
2. **Child's first name or nickname**, typed in Arabic and Latin letters, so the tutor says it right. No surname field. Helper text: "A first name or nickname is enough."
3. **Grade** (2 to 8) shown in school words (Primary 2 to Primary 6, Preparatory 1 and 2), and the **school** from the schools catalog list or "Other".
4. **Curriculum track** for Math and Science (American, British, IB, French, or national), pre-filled from the school when known.
5. **Religion course.** Arabic and Social Studies are added automatically. The parent picks the religion course (Islamic or Christian) with a one-line reason: "Used only to show the right religion lessons." Stored encrypted; nothing else about religion is asked or inferred.
6. **Optional note** for the tutor, one short field (for example "test on Thursday"). Helper text: "Please don't include health details or other people's names." Stored encrypted and used only to suggest a starting strand or topic. The parent can edit or delete it at any time.
7. **Safety notice for parents.** A short screen explaining who sees what (parents see progress, never transcripts; serious concerns go to a trained reviewer first). Wording comes from `docs/safety/` (see Part 6).
8. **Hand over.**
   - Young band: "Give the phone to {name}. Please stay close for about 8 minutes, in case {name} wants you." Button: "Continue to {name}".
   - Middle and Older bands: "Give the phone to {name}. The tutor will take it from here." Button: "Continue to {name}".

### Profile picker and handoff
- **Profile picker.** When the family has more than one child profile, the app opens on a picker: one large tile per child, showing the nickname and their companion's picture. No surname, school, or grade on the tile. Button on each tile: "Start as {name}". A small "Add a child" link for the parent sits behind the parent check.
- With one child profile, the picker is skipped.
- **Handoff screen** (every session, every band): the companion's picture, "Ready, {name}?", a large "Start" button, and a small "Not {name}? Switch profile" link. Nothing plays until the child taps "Start", so the tutor never talks to the wrong child.

## Part 2: Opening (every band)
All voice lines appear as captions. English lines are drafts; final English and Arabic wording, including the Older band notice, is owned by `arabic-language-specialist` and the grade heads. Arabic examples show intended warmth only.

### 2.1 Hello, name check, and voice check (together)
The voice check is not a separate game. It happens inside the name check and the companion pick.

Young and Middle bands:
> **Ibi:** "Hi! I'm Ibi. I'm a computer helper. I help kids think through their schoolwork. Are you {name}?"
> *(Arabic draft)* "أهلاً! أنا إيبي. أنا مساعد على الكمبيوتر، بساعد الأطفال يفكروا في مذاكرتهم. إنت {الاسم}؟"

Older band:
> **Ibi:** "Hi, I'm Ibi. I'm an AI tutor. I won't hand you answers, but I'll help you work them out. Are you {name}?"

Then: "Did I say your name right? Say it for me."
- The screen shows the name in Arabic and Latin letters with two buttons: "Yes, that's right" and "Fix how you say it".
- The child's spoken reply is how we check hearing (pace, wait time, recognition quality). Only derived settings are kept (see Part 7).
- **Misheard reply:** the screen shows the tap buttons and the companion says "Tap the one that's right." A misheard reply never counts as a wrong answer or a miss, anywhere in onboarding.
- **No reply after about 6 seconds:** Ibi asks once more, then highlights "Yes, that's right". Ibi never says it cannot understand the child.
- **Older band:** a visible "Skip voice check" link. Tapping "Yes, that's right" without speaking also skips it. Skipping uses default voice settings, tuned later from normal talk.

Grade check (all bands): "You're in {school grade word}, right?" with "Yes" and "No, change it" buttons. "No" asks the child to hand the phone back to a parent; the child never edits the grade alone.

### 2.2 Meet the companion (voice check continues)
| Band | Ibi says |
|---|---|
| Young | "Primary {n}! My little brother and little sister are computer helpers too. They help kids in Primary {n}. Pick who you want to study with. Say their name or tap a picture." |
| Middle | "Primary {n}. Then I'll be your study helper. Let's get started." |
| Older | "{School grade word}. My older brother and older sister work with students your age. Pick who you want to work with." |

- Young and Older bands: the child picks by saying the companion's name or tapping a picture. Saying the name is the second part of the voice check. A misheard name gets the same tap retry and never counts as a miss.
- The choice is the child's. It is stored only as "companion: A or B" and is never used as a gender signal or for anything other than which character appears.
- The chosen companion introduces themselves in their own voice and keeps the honest identity: Young: "Hi {name}, I'm {companion}. I'm a computer helper too." Older: "Hey {name}, I'm {companion}. Same deal as Ibi: I'm an AI tutor, and I won't give you answers, I'll help you find them."
- Middle band: Ibi stays the tutor. Ibi is a helper, not a classmate: no line may say or suggest that Ibi is in the child's grade, goes to school, or is a real child (ethics checklist H2).
- No companion line claims feelings or wants ("wants to meet you", "so happy"); companions describe what they do, not what they feel (ethics checklist M4).
- The companion grows up with the child: each new school year, their look and style mature a little. Older band siblings look about 17, not like cartoon children.

### 2.3 Day-one safety notice (every band, every child)
Straight after the companion introduces themselves, the companion says a short, age-appropriate notice about who sees what. It is spoken and captioned, takes about 30 seconds, and cannot be skipped on day one. Afterwards it lives in a "Who sees what" screen the child can open any time.

The script is **not written here**. It comes from [`docs/safety/distress-script.md`](../safety/distress-script.md) (day-one notice by age band) and [`docs/safety/flag-review.md`](../safety/flag-review.md), written by `child-development-specialist` and `ai-safety-red-teamer` as a council blocker and awaiting review by the grade heads. The notice must cover, in age-appropriate words:
- parents see progress, never what the child said;
- ordinary chats and venting stay private;
- if something sounds like the child may not be safe, a trained person on our team checks it to help;
- this is told to every child, in every band.

Until the grade heads approve that wording, this step stays a blocker for build; never fill it with improvised copy.

### 2.4 Interests (Middle and Older bands only, skippable)
> **Middle:** "What are you into? Tap a few, or tell me."
> **Older:** "Quick one so my examples aren't boring. What are you into? Pick any, or skip."

- Middle band pictures: football, drawing, animals, space, games, building, music, cooking.
- Older band chips: football and other sports, gaming, music, films and series, coding, design and art, science and tech, reading. No cartoon pictures.
- A "Skip" button is always visible.
- Used **only** to choose examples ("a league table" for fractions). Stored as a few tags. Never shared, never used for ads, never shown to other children.
- Young band: no interests step on day one, to keep the 8-minute cap. It moves to day two.

### 2.5 Faith questions (every band, any point in onboarding)
If a child asks a faith question (for example about prayer, God, or what is allowed), the companion gives no ruling, no opinion, and no comparison between religions or families, and points to the family:
> **Young and Middle:** "That's a really good question for your family or your religion teacher. You could ask them later."
> **Older:** "That's one to talk through with your family or your religion teacher. I don't give answers on faith."

Then the companion goes back to the current step. The line is spoken and captioned, with no follow-up questions about the child's faith, and nothing about it is logged beyond "faith question redirected" (no text). Final guardrail wording: `ai-tutor-engineer` with `course-designer-ethics` (ethics checklist F3); Arabic wording by `arabic-language-specialist`.

## Part 3A: Grades 2 to 3 (Young band): placement first
Target: the whole child part, from "Start" to the last screen, in **8 minutes or less**, with a grown-up nearby (a parent, grandparent, nanny, or other carer).

| Step | Time budget |
|---|---|
| Hello, name and voice check, grade check | about 1 minute |
| Companion pick and introduction | about 1 minute |
| Safety notice | about 30 seconds |
| Picture check (placement) | about 4 minutes |
| Things you figured out | about 1 minute |
| Buffer | about 30 seconds |

### The picture check (placement)
> **Companion:** "Let's do a quick check with pictures, so I know where to start. I'll show you something and ask about it. It's okay to say 'I don't know'."

It is described honestly as a check, never disguised as only a game (ethics checklist H7). It may look playful, but the words say what it is.

Rules (detailed stop rules and item selection are in the placement spec from `assessment-specialist` with `learning-analytics-scientist`, a council blocker):
- **At most 5 scored items**, all on one strand.
- **Start one level below the child's grade**, so the first item is easy.
- **Two misses step down** a level. A misheard answer is never a miss; it gets a tap retry.
- **The last item is a picture from this week's book** for the child's grade and term, chosen at a level the child has already shown they can do.
- **Always ends on a win.** If the child misses the last item, the companion breaks it into a smaller step the child can do (a hint, never the answer) until the child gets a piece of it right. That guided step is logged as "with hints" and is not scored.
- One question at a time, very short turns, every prompt read aloud with a picture. Answers by voice or by tapping large pictures.
- Every answer gets warm, effort-focused feedback: "You looked carefully at the picture. That helps me a lot." No right or wrong sounds, no score, no stars for correctness.
- After a miss, the companion moves on without telling the answer, so the item can come back later as a lesson (ethics checklist N6).
- Called "a quick check", never a test and never only a game. Never compared with anyone.
- Time guard: if the 8-minute cap is near, the check stops early after the next win. Fewer items is fine.

Output: a one-strand starting point (estimate), re-checked in sessions 2 and 3. Never a mastery mark.

### Day two: open lesson
On the second session, the child leads:
> **Companion:** "Look! These are from your book this week. Which one do you want to explore?"

- The screen shows **2 to 3 pictures from this week's book**. The child taps or names one. We never ask "What did you learn today?" at this age.
- The interests step happens here, as one tap-the-pictures screen, skippable.
- The companion runs a validated mini-lesson for that picture's topic (from `content/`), scored by hint level, and the session 2 re-check is folded in.

## Part 3B: Grades 4 to 8 (Middle and Older bands): learning first
Target: the child picks a topic **by minute 4**; the whole child part takes **15 minutes or less**.

| Step | Time budget |
|---|---|
| Hello, name and voice check, grade check | about 45 seconds |
| Companion (Older) or Ibi continues (Middle) | about 45 seconds |
| Safety notice | about 30 seconds |
| Interests (skippable) | about 30 seconds |
| Topic pick | done by minute 4 |
| Mini-lesson | about 5 to 6 minutes |
| Check items | about 3 to 4 minutes |
| Things you figured out, optional weekly goal | about 1 minute |

### Topic pick (by minute 4)
- **Middle band (Primary 4 and 5):** pick from 3 to 4 pictures of this term's topics in the child's curriculum. "Which of these are you doing in class right now?"
- **Older band:** chips for this term's topics, or say or type it. "What are you working on in class, or what's giving you trouble?"
- Only topics with a validated mini-lesson in `content/` are offered.
- **If the answer is unclear, the companion asks**; it never guesses. Example: "Do you mean adding fractions, or comparing them?" with both as buttons.
- If the child names a topic with no validated lesson, the companion is honest and offers the nearest validated one: "I don't have that one ready yet. Want to try {nearest topic} instead?" The tutor never improvises a lesson.

### Mini-lesson
- A pre-written, validated mini-lesson from `content/` (owner: `course-designer-chief`; must pass `npm run validate:content`). Never improvised.
- Runs the usual way: a question first, hints one step at a time, the whiteboard or a demo when it helps, never the answer. The third hint is a worked example on a different case.
- **Scored by hint level:** each step is logged as done alone, hint 1, hint 2, or worked example.
- Homework answer request: "I can't give you the answer, but we can get there together. What's the first thing the question asks?"
- Off topic: a short friendly reply, then back. Anything worrying follows `docs/safety/`.
- The topic picker never offers religion topics until Ministry-book religion lessons exist in `content/`.

### Check items
Framing, Middle band: "A few quick questions so I know where to start you."
Framing, Older band: "Quick check so I don't waste your time. Five questions at most. Saying 'I don't know' is fine."

Rules (details in the placement spec):
- **Up to 5 items, on the same strand** as the chosen topic.
- **Start below grade.**
- **Same guards as the young band:** two misses step down; always end on a win; a misheard answer is never a miss.
- **Item-4 rule:** if the first three are right, item 4 is at or above grade.
- After a miss, move on without telling the answer (ethics checklist N6).
- Never called a test, never a score shown, never compared.
- Time guard: if the 15-minute cap is near, checks stop after the next win.

Output: a one-strand starting point (estimate) that combines the check items and the mini-lesson hint levels, re-checked in sessions 2 and 3. Never a mastery mark.

## Part 4: Voice-off flow (equal, every band)
When the parent chooses "Use tap and type only", or the microphone permission is denied, the child gets **the same steps, the same time caps, and the same ending**. Nothing is shortened or locked.
- The microphone is never opened. No voice check runs; default settings apply.
- The tutor can still speak through the speaker (output only, nothing recorded), with captions. The parent can turn sound off; then captions carry everything, and Young band captions use very short sentences with pictures.
- Name check: name shown with "Yes, that's me". Companion pick: tap a picture. Interests: tap. Topic: tap pictures or chips, or type (Older band).
- Placement and check items: large tap answers, and typing for the Older band.
- Mini-lesson: tap and type answers, whiteboard and demos as usual.
- Parent summary looks the same, with no note that voice was off.
- Young band children may not read well yet, so for them the parent setup recommends keeping sound on in voice-off mode ("Sound lets the tutor read everything aloud to {name}"). If sound is off anyway, every prompt uses pictures and one or two words. Review by `inclusion-accessibility-specialist` (ethics checklist D7).

## Language fairness
- Every placement and check item exists in English and Arabic with the same quality, and the child answers in the language they think in.
- Speech recognition for the name check, companion pick, and answers is tested on Egyptian Arabic, English, and mixed speech before launch (`voice-engineer`, with `arabic-nlp-engineer`). A child must never look weaker because of the language they speak (ethics checklist D5).

## Part 5: Ending (every band)

### "Things you figured out"
The last screen in every band. It lists 1 to 3 things from the session log, in plain words with a small picture: "You found which fraction is bigger by drawing them."
- **"You figured it out yourself"** appears only when the log shows the step was done with no hints. Steps that needed hints are shown honestly and warmly: "You worked this out with a hint."
- Effort is praised by name ("You checked your work").
- **No streaks, no loss displays,** no "days in a row", no countdowns, no XP for time spent.
- No claimed feelings, no missing the child, no friendship claims.

Closing lines (drafts):
- Young: "You figured out {n} things today, {name}! Want to show someone at home?" Button: "Show my grown-up".
- Middle: "That's it for today. Come back whenever you want to work on something." Button: "Finish".
- Older: "Done for today. Come back when you've got something to work on." Button: "Finish".

### Weekly goal (Older band only, optional)
After "Things you figured out", one optional screen: "Want to set a goal for this week? Totally optional." Choices like "2 sessions" or "finish fractions"; buttons "Set goal" and "Not now".
- **No break counter, no reminders, no notifications,** no message if the goal is missed. The goal simply shows progress toward it when the child opens the app.
- Reward mechanics around goals go to `game-designer` and must pass `child-development-specialist` review.

## Part 6: Safety and the parent

### Parent summary (after day one)
Built **only from logged events**, never from transcripts, and never quotes the child. Separates done-alone from needed-hints.

Template (draft):
> **{name} met their study companion today.**
> Worked on: {strand}, {topic}.
> Figured out alone: {list from log}.
> Figured out with hints: {list from log}.
> Starting point (estimate): around {level} in {strand}. We will check again in the next two sessions.
> Next step: {next topic}.
> Time: {n} minutes.

- The word "estimate" always appears with the level. No grade, percentage, or comparison with other children.
- Parents see progress, **never transcripts**.

### Notifications
- Onboarding sends **no notifications to the child**, in any band.
- The parent gets one summary after day one, at a sensible hour, with no pressure wording, and can turn summaries off. How often summaries come after that is Open question 9 and must pass ethics checklist M6.

### Safety flags (from the council decision)
- Ordinary venting stays private.
- A serious-risk flag goes first to a **named, trained human reviewer**.
- The parent is told a concern was raised and is never shown the transcript.
- If the worry involves the family, there is **no parent alert**; the reviewer escalates.
- Every child is told this on day one in age-appropriate words (Part 2.3).
- Scripts and review steps: `docs/safety/` (owners `child-development-specialist` with `ai-safety-red-teamer`; safeguarding playbooks are owned by `trust-safety-lead`).

## Part 7: Data in onboarding
- Voice check keeps **derived settings only** (speaking pace, wait time, whether to show tap answers more often). No voiceprint, no raw audio kept.
- Speech vendor must have zero retention and no training on our audio (`tech-lead` contract; blocks the voice build).
- Transcripts: short retention and redaction, as set by `security-privacy-engineer`. Parent summaries are never verbatim.
- Religion course and the parent note are minimal and encrypted. The companion choice is never a gender proxy.
- No surname, school, or grade shown on any child-facing tile or shared screen.

## Push-to-talk in noise
- Default: open listening with barge-in, plus tap answers always visible.
- When background noise is high (detection by `voice-engineer`), or after two misheard replies in a row, the companion offers: "It's a bit noisy. Hold the button while you talk." A large "Hold to talk" button appears and stays for the session.
- The child can switch between open listening and "Hold to talk" at any time. Misheard replies in noise never count as misses.

## Screens and states (for `mobile-engineer`)
| Screen | Loading | Empty | Error |
|---|---|---|---|
| Profile picker | Tiles shimmer | No profiles: "Add your child to get started", button "Add a child" (parent check) | "We couldn't load profiles. Check your connection and try again." Button "Try again" |
| Ready, {name}? | Companion picture placeholder | n/a | Same as above |
| Hello and name check | Caption shows while audio loads; tap buttons visible from the start | n/a | Speech service down: switch to tap mode silently for this session; caption "Let's use tapping for now." |
| Companion pick | Picture placeholders | n/a | Images fail: names as large text buttons |
| Safety notice | Caption first, audio when ready | n/a | Script not available: block onboarding for build; never show improvised copy |
| Topic pick (4 to 8) | Chips shimmer | No validated topics for this term: offer the nearest validated strand with honest copy | "We couldn't load topics. Try again." Button "Try again" |
| Picture check / check items | Item placeholder | n/a | Item fails to load: skip to the next item; never counted as a miss |
| Mini-lesson | Whiteboard skeleton | n/a | Connection lost: "We lost the connection. Your progress is saved." Button "Reconnect" |
| Things you figured out | Short shimmer | Nothing logged (rare): "You started today. Next time we'll pick up from here." | Show the screen from the local log if the server is unreachable |
| Weekly goal (Older) | n/a | n/a | Saving fails: "We couldn't save your goal. Try again." Button "Try again" |
| Microphone permission denied | n/a | n/a | Move to the voice-off flow with no warning tone: "No problem, let's use tapping." |

Accessibility: large targets (at least 56 by 56 points for the Young band), captions on every voice line, reduced motion respected, full screen reader labels, RTL layout for Arabic captions and lessons. Review by `inclusion-accessibility-specialist`.

## What we never do in onboarding
- Ask or infer gender, religion, or anything sensitive from the child.
- Claim feelings, friendship, missing the child, or to be a child.
- Store voiceprints or raw audio.
- Count a misheard answer as wrong.
- Call placement a test, show a score, mark mastery, or compare the child with others.
- Show streaks, loss counters, break counters, or send reminders.
- Run past the time cap or end mid-struggle.
- Improvise a lesson, or give the final answer to any question.
- Show the parent a transcript or quote the child.

## Changes from the first draft
- Opening rewritten with honest identity lines; the time-of-day greeting, the surprise opener, the "fun" framing, and the come-back-tomorrow prompt are removed.
- Grade 6 now uses Primary 6; all grades use school words.
- The separate voice warm-up game is removed; the voice check is folded into the name check and companion pick, skippable for the Older band, with tap retry.
- Two flows by band: placement first for grades 2 to 3, learning first for grades 4 to 8.
- "Things you figured out" replaces the old ending; streaks removed; Older band weekly goal with no break counter.
- Parent summary built from logged events with done-alone and needed-hints separated; level is a labelled estimate.
- Added: profile picker and "Ready, {name}?" handoff, push-to-talk in noise, equal voice-off flow, day-one safety notice, Older band tone and interests, screen states.
- Ethics checklist fixes: Ibi is a helper, not a classmate (H2); no feeling or want claims in companion lines (M4); placement called "a quick check", not a game (H7); "a grown-up nearby" (F5); faith question line (F3); no answer shown after a miss (N6); notifications (M6); language fairness (D5); voice-off support for young non-readers (D7).

## Open questions
1. Ibi's family: names, look, voices, and Ibi's own age; Older band siblings should look about 17 (`brand-illustration-designer`, `voice-engineer`, grade heads).
2. Chat register for Ibi and the companions: Egyptian colloquial, MSA, or a mix by age (`arabic-language-specialist`, `course-designer-bilingual`). Arabic lessons stay in MSA.
3. Does "teens" in the decision mean Primary 6 to Preparatory 2 (this spec's Older band) or Preparatory 1 and 2 only? It controls the identity line, the voice-check skip, and the weekly goal (chair, `grade-head-g8`, Primary 6 grade head).
4. International school grade labels: should the child also hear their own school's label (for example "Year 7" or "6e") alongside the school words? (`international-curriculum-specialist`, grade heads).
5. How we know "this week's book" pages for each grade and term, and what to show if the week is unknown (`curriculum-data-engineer`, `course-designer-chief`).
6. Which strand the Young band picture check uses when the parent note does not suggest one (`assessment-specialist`).
7. Validated mini-lesson coverage: `content/` holds one lesson today (Primary 5 fractions). Topic pick needs one per grade and strand before launch (`course-designer-chief`).
8. Children working above or below their school grade: which band and companion apply (grade heads, `child-development-specialist`).
9. Parent summary after day one: how often, and on which channel (`product-manager`, `learning-analytics-scientist`).
10. Consent wording, voice consent, child age, religion as sensitive data, cross-border transfer, and retention under Law 151/2020 (`legal-compliance-advisor` for lawyer review, `security-privacy-engineer`).
11. Exact transcript retention period and redaction rules (`security-privacy-engineer`).

## Dependencies (council blockers and actions)
- `docs/safety/` distress script and flag-review steps: written by `child-development-specialist` with `ai-safety-red-teamer` (draft, 2026-11-25). Blocks Part 2.3 until the grade heads approve it.
- `docs/school/ethics-checklist.md`: `course-designer-ethics`. This flow must pass it.
- Placement spec (stop rules, item-4 rule, session 2 and 3 re-checks): `assessment-specialist` with `learning-analytics-scientist`. Blocks Parts 3A and 3B.
- Testing with Primary 2 children before launch: `grade-head-g2`.

## Owners
- Flow, screens, and interface copy: `product-designer`
- Characters and voices: `brand-illustration-designer`, with `voice-engineer` for voice selection
- Voice check, push-to-talk, noise detection: `voice-engineer`
- Final English and Arabic wording, including the Older band notice: `arabic-language-specialist` and grade heads
- Age fit and wellbeing: grade heads, `child-development-specialist`
- Placement and check items: `assessment-specialist`, `learning-analytics-scientist`, the heads of department
- Onboarding mini-lessons: `course-designer-chief`
- Conversation and guardrails: `ai-tutor-engineer`, `ai-safety-red-teamer`
- Safety notice, distress script, flag review: `child-development-specialist`, `ai-safety-red-teamer`, `trust-safety-lead`
- Weekly goal mechanics: `game-designer`, reviewed by `child-development-specialist`
- Consent and data: `security-privacy-engineer`, `legal-compliance-advisor`
- Accessibility: `inclusion-accessibility-specialist`
- Build: `mobile-engineer`
- Ethics review: `course-designer-ethics`
- Sign-off: chair (`principal`), `course-designer-ethics` (veto), `grade-head-g2` (veto)
