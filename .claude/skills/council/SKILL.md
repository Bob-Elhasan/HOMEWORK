---
name: council
description: Convene the academic council of the school staff on a question. Selects the relevant principal, heads of department, grade heads, teachers, course designers, and tech-team guests, runs two rounds of discussion (positions, then challenge), has the principal decide, and saves minutes. Use when the user asks to convene the council, get the staff's view, or settle an academic disagreement.
---

# Convene the Academic Council

Follow `docs/school/council.md`. The question is in the arguments; if none is given, ask for one short question first.

## 1. Frame the question
Write one clear question, two or three lines of context, and the constraint that matters most. Read `docs/school/mission.md` and `docs/school/README.md` so you know who is on staff.

## 2. Choose the members (at most eight besides the chair)
Always: `course-designer-chief` and `course-designer-ethics`. Then add only the people the question touches:
- a subject question: `hod-<subject>` and the relevant `teacher-<subject>-g<grade>`
- an age question: `grade-head-g<grade>`
- several grades: the grade heads for the lowest and highest grades involved
- course structure: `course-designer-early-years` (grades 2 to 4) or `course-designer-upper` (grades 5 to 8), and `course-designer-bilingual` for language or cross-curriculum questions
- tech-team guests when needed: `learning-designer`, `child-development-specialist`, `assessment-specialist`, `inclusion-accessibility-specialist`, `ai-safety-red-teamer`, `product-manager`

Subjects use these slugs: arabic, social-studies, islamic, christian, math, science. Grades are 2 to 8.

## 3. Round 1: positions (parallel)
Launch one Agent call per member in a single message, with `subagent_type` set to the member's name. Give each the question, context, and constraint, and ask for at most 200 words with:
- **Position**
- **Evidence** (book, standard, classroom experience, or research; say which)
- **Main risk**
- **What would change my mind**

## 4. Round 2: challenge (parallel)
Send every member all round 1 positions (continue each agent with SendMessage). Ask for at most 150 words:
- where they agree
- where they disagree, and why
- one improvement to someone else's idea

If nobody disagrees, ask the two most likely critics to argue the strongest opposing case.

## 5. Decision
Launch `principal` with the question and both rounds. The principal applies the decision rules (subject, age, and ethics vetoes) and returns: the decision, the reasons, any dissent by name, and actions (owner, task, done when).

## 6. Minutes
Save the minutes to `docs/school/council/YYYY-MM-DD-short-topic.md` with the template in `docs/school/council.md`. Then give the user a short summary: the decision, the main disagreement and how it was resolved, the dissent, and the actions.

## Cost note
A full session runs about ten to twenty agent calls. Keep the member list tight and the answers short.
