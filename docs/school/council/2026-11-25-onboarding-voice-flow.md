# Council: Voice-first onboarding (meeting Ibi)
Date: 2026-11-25    Chair: `principal` (Dr. Samira El-Masry)
Members: `course-designer-chief`, `course-designer-ethics` (veto), `grade-head-g2` (veto, grade 2), `grade-head-g8` (veto, grade 8), guests `child-development-specialist`, `product-designer`, `security-privacy-engineer`, `assessment-specialist`

## Question
Is the voice-first onboarding flow in `docs/design/onboarding-voice-flow.md` right for children from grade 2 (age 7) to grade 8 (age 14), safe and ethical, and what must change before design starts?

Constraint that matters most: the child's first minutes must build trust and give a real learning moment without compromising safety, privacy, or the never-give-the-answer rule.

## Positions (round 1)
- **Chief course designer:** support. Cap placement at about 5 items or move it to session 2. Step 6 runs a pre-written, validated lesson, never improvised. Ask when the topic is unclear. Grade 6 is Primary 6, not "Prep school". "You figured it out yourself" only when true.
- **Ethics (veto):** four conditions. (1) Ibi says honestly it is an AI, not "here to have fun". (2) No streaks; show "things you figured out", never losses. (3) Never "I missed you" or claimed feelings or friendship. (4) The parent summary separates done-alone from needed-hints.
- **Grade 2 head (veto):** use the school's grade words. Placement one level below grade, at most 5 items, stop after two misses, end on a win. A 7-year-old answers "nothing" to "what did you learn today?", so show 2 to 3 pictures from this week's book. Parents "stay close". Vetoed steps 5 to 7 for grade 2 as written.
- **Grade 8 head:** too childish for 13 to 14 year olds. Drop the cutesy greeting. The older sibling looks about 17. Teen interests. The warm-up must be skippable. Frame placement honestly: "quick check so I don't waste your time".
- **Child development:** placement 5 to 6 items with a two-miss stop. No claimed feelings. A time cap. Write a distress script now; `docs/safety/` does not exist.
- **Product designer:** too much setup before learning. Fold the warm-up into early steps. First learning moment by minute 4. Profile picker. Push-to-talk in noise. Voice-off is a complete, equal flow.
- **Security and privacy:** religion and the parent's free-text note are sensitive. The companion choice is never a gender proxy. Keep derived settings only. Transcripts: short retention, redaction, parent summaries not verbatim. Zero-retention speech vendor. Lawyer questions under Law 151/2020.
- **Assessment:** a short placement gives a one-strand starting point, not per-skill levels. Never mark mastery from it. A misheard answer is never a wrong answer. Re-check over sessions 2 and 3.

## Challenges (round 2)
- **Placement-first or learning-first.** The product designer conceded placement-first for young children: a below-grade placement that ends on a win reaches the first win sooner, and child-picked topics skew. The assessment specialist rejected level-from-a-chosen-lesson alone as biased and proposed a combination: a 5-item check on the same strand as the chosen topic, plus the mini-lesson scored by hint level, plus re-checks. Ethics and the chief designer split the decision by age.
- **Streaks.** The Grade 8 head withdrew "optional streaks"; all members agreed to remove them. Teens may set their own weekly goal with no break counter.
- **Teen privacy and parent alerts.** Tiered: parents see progress, never transcripts; ordinary venting stays private; a serious-risk flag goes first to a trained human reviewer. If the worry involves the family, there is no parent alert. Every child is told this on day one.
- **Time cap for age 7.** Child development proposed 15 minutes; the Grade 2 head held to 8 minutes for the child part.

## Decision
**Approve with changes. Design starts only after the four blockers below are done.**

Every band:
1. Parent setup: voice consent is a separate yes or no; voice-off is a complete, equal flow; religion and the note field are minimal and encrypted.
2. Honest first lines: "I'm a computer helper" (teens: "AI tutor"). Remove "didn't see you there", "good morning", "have fun", and "Same time tomorrow?". Use the school's grade words; grade 6 is Primary 6.
3. The voice check is folded into the name check and companion pick; teens can skip it; a misheard answer gets a tap retry and never counts as a miss.

Grades 2 to 3:
4. Placement first: at most 5 scored items, starting one level below grade, two misses step down, the last item is a picture from this week's book, and it always ends on a win. The child part takes 8 minutes or less, with a parent nearby.
5. Day two: an open lesson; the child picks from 2 to 3 pictures from this week's book.

Grades 4 to 8:
4. By minute 4, the child picks a topic (from pictures in grades 4 to 5); if unclear, the companion asks. A validated mini-lesson from `content/`, scored by hint level.
5. Up to 5 check items on the same strand, starting below grade, with the same stop and win guards; if the first three are right, item 4 is at or above grade. The child part takes 15 minutes or less.

End, every band: "Things you figured out". "You figured it out yourself" only when the log confirms it. No streaks; teens may set their own weekly goal with no break counter and no reminders. The parent summary is built from logged events and separates done-alone from needed-hints. The level is a one-strand "starting point", re-checked in sessions 2 and 3.

Safety: serious-risk flags go first to a named, trained human reviewer. The parent is told a concern was raised and is never shown the transcript. If the worry involves the family, no parent alert; the reviewer escalates. Ordinary venting stays private. Every child is told this on day one in age-appropriate words.

## How the vetoes are satisfied
- **Grade 2:** easy first item, 5 or fewer items, 8 minutes or less, always ends on a win, parent nearby, no streaks, a distress script exists, and testing with grade 2 children before launch.
- **Ethics:** honest AI identity, no streaks or loss displays, no claimed feelings, honest parent summary, placement labelled an estimate.

## Dissent
- **Grade 8 head** wanted safety flags sent straight to parents. Overruled by the chair: harm may come from home.
- **Assessment specialist:** a placement of 5 or fewer items leans low. Accepted and mitigated by the item-4 rule and the session 2 and 3 re-checks.

## Actions
| Owner | Task | Done when |
|---|---|---|
| `child-development-specialist` with `ai-safety-red-teamer` | **Blocker.** Create `docs/safety/` with the distress script and flag-review steps | Reviewed by the grade heads |
| `course-designer-ethics` | **Blocker.** Write `docs/school/ethics-checklist.md` | This flow passes it |
| `product-designer` | **Blocker.** Revise `docs/design/onboarding-voice-flow.md` to match this decision | Chair and both veto holders sign off |
| `assessment-specialist` with `learning-analytics-scientist` | **Blocker.** Placement spec: stop rules, item-4 rule, session 2 and 3 re-checks | Written down |
| `course-designer-chief` | One validated mini-lesson per grade and strand for onboarding | `npm run validate:content` passes |
| `security-privacy-engineer` with `legal-compliance-advisor` | Data map and lawyer questions: child age under Law 151/2020, religion as sensitive data, cross-border transfer, mandatory reporting, retention | Written answers; blocks the data build |
| `tech-lead` | Contract a speech vendor with zero retention and no training on our audio | Contract signed; blocks the voice build |
| `arabic-language-specialist` and grade heads | Final wording, including the teen notice | Blocks launch |
| `grade-head-g2` | Test with grade 2 children | Blocks launch |
