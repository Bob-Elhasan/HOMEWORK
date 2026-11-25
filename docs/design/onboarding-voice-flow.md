# Onboarding: Meeting Ibi (voice-first)

Status: draft for review by `product-designer`, `child-development-specialist`, grade heads, `course-designer-ethics`, `security-privacy-engineer`, and `legal-compliance-advisor`.

## Goal
In the first minutes, the child meets a character who becomes their study companion, by voice, with no forms. By the end, the tutor knows the child's curriculum, roughly where they stand in one subject, and how well it can hear them, and the child has had their first "I got it myself" moment.

## Principles
- **Voice first, screen supports.** Every step works by talking; the screen shows captions, pictures, and tap fallbacks.
- **The parent sets up, the child plays.** Anything a child cannot answer reliably, or that needs consent, comes from the parent.
- **Never guess who the child is.** No gender or age guessed from voice or name. The child chooses their companion.
- **The child leads the topic; the tutor leads the method.** Never the answer, always the next step.
- **Short.** Ages 7 to 9: the child part ends within about 8 minutes, with a natural stopping point.

## Part 1: Parent setup (about 2 minutes, before the child)
Collected from the parent, not the child:
1. Consent: account, child profile, and **voice** (separate, clear yes or no; voice off means the child uses text and tap).
2. Child's first name or nickname, typed (Arabic and Latin spelling), so Ibi pronounces it right.
3. Grade (2 to 8) and the school, chosen from a list (the schools catalog) or "other".
4. Curriculum track for Math and Science (American, British, IB, French, or national), pre-filled from the school when known.
5. National subjects: Arabic and Social Studies are added automatically; the religion track (Islamic or Christian) is chosen by the parent.
6. Optional: anything the parent wants the tutor to know ("struggling with fractions", "test on Thursday").

Then: "Hand the phone to your child. Ibi will take it from here."

## Part 2: The child meets Ibi

Lines are English first; Egyptian Arabic examples show the intended warmth. Final wording needs the grade heads and `arabic-language-specialist`. All voice lines appear as captions.

### 1. Hello
> **Ibi:** "Oh! Hello, good morning! I didn't see you there. Are you {name}?"
> *(Arabic)* "إيه ده! أهلاً، صباح الخير! ما شفتكش. إنت {الاسم}؟"

- The name comes from the parent setup; Ibi checks the pronunciation: "Did I say it right?" If no, the child says it and Ibi repeats; the screen shows the name in Arabic and Latin letters to tap and confirm.
- No answer for a while: Ibi tries once more, then shows a big "Yes, that's me" button.

### 2. Meet the companion
> **Ibi:** "Nice to meet you, {name}! I'm Ibi. I'm here to have fun with you and help you get even better at school. You're in grade {grade}, right?"

The child confirms the grade (the parent entered it). Then, by grade band:

| Grades | Companion | Ibi says |
|---|---|---|
| 2 to 3 | Ibi's little brother **or** little sister | "Grade {grade}! That's just like my little brother and sister. They both want to meet you. Who do you want to study with?" |
| 4 to 5 | Ibi | "Grade {grade}? Me too! Looks like it's you and me." |
| 6 to 8 | Ibi's older brother **or** older sister | "Prep school? Just like my big brother and sister. Want to meet them? Pick one to study with." |

- The child picks by voice or by tapping a picture. The choice is the child's; nothing is inferred.
- The chosen companion introduces themselves in their own voice and becomes the tutor from now on.
- The companion grows up with the child: each new school year, their look and style mature a little.

### 3. A little about you (interests)
> **Companion:** "What do you love doing? Football, drawing, space, animals, games... tell me, or tap the pictures!"

Used **only** to pick examples ("a football league table" for fractions). Never shared, never used for ads.

### 4. Voice warm-up game (about 1 minute)
A short repeat-after-me or "say what you see" game: numbers, a few Arabic and English words, the child's own name.
- Purpose: check how well we hear this child, and tune in-session settings (speaking pace, how long to wait, whether to offer tap fallbacks).
- **No voiceprint is stored.** Raw audio is not kept.
- If recognition is poor: the companion keeps talking, and the app shows tap answers more often. The child is never told "I can't understand you".

### 5. "Show me what you can do" (placement game)
> **Companion:** "Let's play a quick game! I'll ask, you show me what you know. It's totally fine to say 'I don't know'."

- One subject first, chosen by the parent's note or the child ("Math or science first?").
- Adaptive and short: starts at the current grade and steps down or up after each answer, following the prerequisite links in the curriculum catalog.
- Answers by voice or tap. Wrong answers get the same warm reaction as right ones: "Thanks for trying! That tells me exactly where to start."
- Output: a starting estimate for each skill in that subject (owner: `learning-analytics-scientist`), not a score shown to the child.

### 6. The child takes the lead
> **Companion:** "Okay, you lead now! What did you learn in school today? Or is there something you want to know about?"

Other openers the companion can choose, by age and mood: "How was your last quiz?", "What's your favourite subject?", "Anything confusing this week?"

- What the child says is mapped to a catalog topic for their curriculum, grade, and term (for example "we did fractions" to CCSS 4.NF), which also tells us where the class is this week.
- The companion then runs a real mini-lesson in the usual way: a question first, hints one step at a time, the whiteboard or a demo when it helps, never the answer.
- If the child asks for a homework answer: "I can't give you the answer, but I bet we can get there together. What's the first thing the question asks?"
- If the child goes off topic: a short friendly reply, then back. Unsafe topics follow the trust and safety playbook.

### 7. A good ending
> **Companion:** "You figured that out yourself, {name}! Same time tomorrow?"

- End on a success, never mid-struggle.
- A gentle streak starts; the parent receives a short summary: what the child explored, where they are, and the next step.

## What we never do in onboarding
- Ask or infer gender, religion, or anything sensitive from the child.
- Store voiceprints or raw audio.
- Call the placement game a test, show a score, or compare the child with others.
- Let the conversation run past a natural stopping point for young children.

## Open questions
1. Ibi's own age and personality, and the companion family's names, look, and voices (`brand-illustration-designer`, grade heads).
2. Register for Ibi's chat: Egyptian colloquial, MSA, or a mix by age (`arabic-language-specialist`, `course-designer-bilingual`); Arabic lessons stay in MSA.
3. Exact grade-band boundaries for companions when a child is older or younger than their grade.
4. What the parent sees after onboarding, and how often.
5. Consent wording and the voice consent flow (`legal-compliance-advisor` for lawyer review).

## Owners
- Flow and screens: `product-designer`
- Characters and voices: `brand-illustration-designer`, with `voice-engineer` for voice selection
- Age fit and wellbeing: grade heads, `child-development-specialist`
- Placement game: `assessment-specialist`, `learning-analytics-scientist`, the heads of department
- Conversation and guardrails: `ai-tutor-engineer`, `ai-safety-red-teamer`
- Consent and data: `security-privacy-engineer`, `legal-compliance-advisor`
- Ethics review: `course-designer-ethics`
