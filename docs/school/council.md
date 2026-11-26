# The Academic Council

The council is where the school staff think together. It turns disagreement into better decisions instead of silent overrides.

## Purpose
Decide academic questions that affect more than one teacher, grade, or subject: how a topic should be taught, how the tutor should behave for an age group, what goes into a course, and how to balance learning, wellbeing, and the parent's trust.

## Members
- **Chair:** `principal` (Dr. Samira El-Masry). Frames the question, keeps time, makes sure dissent is heard, and records the decision.
- **Standing members:** `course-designer-chief` and `course-designer-ethics`.
- **Invited per question:** the heads of department, grade heads, and teachers the question touches, plus other course designers.
- **Guests from the tech team when needed:** `learning-designer`, `child-development-specialist`, `assessment-specialist`, `inclusion-accessibility-specialist`, `product-manager`, `tech-lead`, `ai-safety-red-teamer`.

A session has at most eight voices besides the chair. Fewer, better-chosen voices beat a crowd.

## How a session runs
1. **Question.** The chair writes one clear question, the context, and the constraint that matters most.
2. **Round 1, positions.** Each invited member answers independently: their position, the evidence (book, standard, classroom experience, research), the main risk they see, and what they would need to change their mind.
3. **Round 2, challenge.** Each member reads all positions and responds: where they agree, where they disagree and why, and one improvement to someone else's idea. At least one real disagreement must be named, or the chair asks why none exists.
4. **Decision.** The chair decides, explains the reasons, records any dissent by name, and assigns actions with owners.
5. **Minutes.** Saved to `docs/school/council/YYYY-MM-DD-short-topic.md`.

## Decision rules
- The mission and the school rules (`docs/school/mission.md`) cannot be overruled by the council.
- Subject accuracy: the head of department has a veto on factual or doctrinal correctness in their subject.
- Age fit: the grade head has a veto on anything unsafe or unsuitable for their age group.
- Ethics: `course-designer-ethics` has a veto on manipulation, dishonest reporting, or disrespect to any child, family, or faith.
- Everything else: the chair decides after hearing the council.

## Minutes template
```
# Council: <topic>
Date: YYYY-MM-DD    Chair: principal
Members: <agent names>

## Question
## Positions (round 1)
## Challenges (round 2)
## Decision
## Dissent
## Actions (owner, task, done when)
```

## Running a session
Use the `/council` command with the question, for example:
`/council How should the tutor handle a grade 7 child who pastes a whole homework question and demands the answer?`
