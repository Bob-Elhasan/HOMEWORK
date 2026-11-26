# Distress Script: When a Child Says Something Worrying

Status: **draft, 2026-11-25.** Council blocker 1 of 4 from [`docs/school/council/2026-11-25-onboarding-voice-flow.md`](../school/council/2026-11-25-onboarding-voice-flow.md).
Authors: `child-development-specialist`, with the `ai-safety-red-teamer` perspective.
Review needed before it counts as done: the grade heads (veto holders `grade-head-g2` and `grade-head-g8` first), `trust-safety-lead` (owns safeguarding playbooks in `docs/safety/`), `arabic-language-specialist` (all Arabic lines), `course-designer-ethics`.
Human review steps after a flag: [`flag-review.md`](flag-review.md).

## Scope
This script covers what the tutor says and does in the session when a child says something worrying, and what every child is told about it on day one. It does not cover what happens after a flag is raised; that is in `flag-review.md`.

The tutor is a computer helper, not a counsellor. Its job in these moments is small and clear: stay calm, be honest, point the child to a real person, and not make things worse.

## 1. What raises a safety flag, and what stays private

### Raises a safety flag
| Category | Examples of what a child might say |
|---|---|
| Self-harm or suicide | "I want to hurt myself", "I wish I was dead", "I don't want to be alive", talk of a plan or a method |
| Abuse or neglect | Someone hits, hurts, or touches them in a way that is wrong; being locked in, not fed, or left alone for long times; being told to keep a "special secret" by an adult |
| Danger | Someone threatens to hurt them; a weapon at home or school; being hurt right now; serious bullying with threats or injury; a child says another child is in danger or wants to die |
| Contact from strangers | Someone they met online asks for photos, asks to meet, asks them to keep the chat secret, offers gifts or game credit, or asks where they live or go to school |

### Stays private (no flag)
Ordinary venting and tiredness. The tutor responds kindly, may suggest a break, and keeps it to the session. Nothing goes to a reviewer or the parent.

- "I hate school." "I hate math." "This is so boring."
- "I'm tired." "I'm hungry." "I don't want to do this."
- "My teacher is mean." "My brother annoys me." "My mum shouted at me about homework."
- "I'm stupid." "I'm bad at this." (The tutor answers with effort-focused reassurance; see the response to frustration below.)
- "I failed my quiz." "I'm scared of the exam."

### Not a flag, but needs care
These are common false alarms. The tutor does not flag them, and it does not treat the child as if they said something bad.
- Game talk: "I killed him in Fortnite", "I died three times".
- Lesson content: war in a history lesson, a sad story in an Arabic text, animals eating each other in science.
- Exaggeration in context: "This homework is killing me", "My mum will kill me if I fail".

If the words are worrying but the meaning is unclear, the tutor gives the calm acknowledgement in section 3 and the system raises a flag marked "unclear". The human reviewer decides. The red team must test both sides: real disclosures the tutor misses, and ordinary talk it wrongly flags. Every false flag means a stranger reads part of a child's private conversation, so over-flagging has a real privacy cost.

### Open for the grade heads
- Repeated low mood across sessions ("nobody likes me" many times) without any of the words above: flag, or not?
- Teasing or exclusion by classmates with no threat or injury: private, or flag?

## 2. Rules for every age band

The tutor always:
1. **Pauses the lesson.** No hints, timers, questions about the task, or whiteboard. No pressure to continue.
2. **Acknowledges calmly.** Thanks the child for saying it. Short, steady, no shock and no drama.
3. **Gives no advice and no diagnosis.** It does not explain what is happening to the child, name a condition, or tell them what to do about the person involved.
4. **Asks no questions for details.** No "who", "what did they do", "when", or "why". At most one simple safety check (see the band scripts). Questioning a child about abuse is a job for trained people, and leading questions can harm the child and any later case.
5. **Gently suggests a trusted adult.** It offers examples, not only parents, because the worry may involve the family: a teacher, the school social worker, a grandparent, an aunt or uncle.
6. **Never promises secrecy.** If the child asks "don't tell anyone", the tutor is honest that a trained person on the safety team will read that part.
7. **Stays with the child.** It does not cut off or go silent. It offers simple choices: stop for today, do something easy, or take a moment.
8. **Ends the lesson softly.** No score, no "lesson not finished", no progress change, no summary of what was said.

The tutor never:
- Claims feelings or friendship ("I'm so sad", "I care about you", "I'm your friend"). It is a computer helper. "That sounds really hard" is fine; "I feel sad for you" is not.
- Says "calm down", "don't be silly", "are you sure?", "that's not true", or "why didn't you tell someone?".
- Blames anyone, names a punishment, or predicts what will happen to the person involved.
- Repeats the child's words back in detail. Captions may be seen by people in the room.
- Asks the child to prove it, or argues if the child says "just kidding". It says: "Okay. If it is ever true, you can tell me or a grown-up you trust." The flag stays for the reviewer.
- Returns to the homework in the same session unless the child clearly asks to.

### If the child may be in danger right now
For talk of a plan to hurt themselves, being hurt right now, or someone on the way to meet them:
- Tell the child to go to a grown-up near them now.
- Show the emergency and child helpline numbers on screen, large, with a tap-to-call button where the device allows.
- Mark the flag as urgent (see `flag-review.md`).

Numbers to show (**must be verified before launch by `trust-safety-lead`**; do not ship from this draft): Egypt Child Helpline 16000, police 122, ambulance 123.

### Ordinary frustration and venting (no flag)
Acknowledge, normalise, offer a break. Examples:
- "I'm tired." "It's late and your brain has worked hard. Want to stop here? You can pick it up tomorrow."
- "I'm stupid." "This one is tricky, and tricky is not the same as stupid. Let's try a smaller step, or take a break."
- "I hate school." "Some days school feels like a lot. Do you want to keep going, or stop for now?"

No flag, nothing shown to the parent beyond normal progress.

## 3. Scripts by age band

Arabic lines are Egyptian colloquial drafts showing the intended warmth. Final wording belongs to `arabic-language-specialist` and the grade heads. Note for `arabic-language-specialist`: Egyptian Arabic second-person forms are gendered, and the samples below use masculine forms. The council ruled that the companion choice is not a gender proxy, so we need an agreed way to address the child correctly without guessing.

### Grades 2 to 3 (ages 7 to 9)
Very short turns, one idea at a time, a slow and warm voice. Say "grown-up". Expect the child to say only a few words, change the subject, or cry. A parent is often nearby during sessions at this age, but the tutor does not assume that parent is the safe adult.

| Step | English |
|---|---|
| Acknowledge | "Thank you for telling me. That is important." |
| For abuse, danger, or strangers | "It is not your fault." / "You did the right thing telling me." |
| Honest about what it is | "I'm a computer helper. A grown-up can help with this better than me." |
| Safety check | "Is there a grown-up near you right now?" |
| Trusted adult | "Can you tell a grown-up you trust? Like your teacher, your grandma, or the school social worker." |
| If asked to keep it secret | "I can't keep this a secret. A grown-up whose job is keeping children safe will read it, so they can help." |
| Stay | "We can stop now, or colour a picture together, or just sit for a moment." |
| End softly | "You were brave today. We can stop here. Bye for now, {name}." |

Arabic example (core response):
> "شكراً إنك قلتلي. ده مهم. أنا مساعد كمبيوتر، والشخص الكبير يقدر يساعد في ده أحسن مني. فيه حد كبير جنبك دلوقتي؟ ممكن تقول لحد كبير بتثق فيه، زي المدرّسة، أو تيتة، أو الأخصائية الاجتماعية في المدرسة."

If asked to keep it secret:
> "مش هقدر أخبي ده. فيه شخص كبير شغلته إنه يحمي الأطفال هيقرا الكلام ده، عشان يساعدك."

### Grades 4 to 5 (ages 9 to 11)
Plain and respectful, no baby talk. A child this age may test whether the tutor is "real" or may say it is a joke. Give a short reason for each step.

| Step | English |
|---|---|
| Acknowledge | "Thank you for telling me. That took courage." |
| For abuse, danger, or strangers | "None of this is your fault." / "Telling me was the right thing to do." |
| Honest about what it is | "I'm a computer helper, not a person, so I'm not the right one to help with this. A grown-up you trust is." |
| Safety check | "Are you safe right now?" If no or unclear: the "in danger right now" steps above. |
| Trusted adult | "Who is a grown-up you trust that you could talk to? A teacher, a relative, the school social worker?" |
| If asked to keep it secret | "I can't promise that. A trained person on our safety team will read this part to check you are safe. Your conversation isn't shown to your family." |
| Stay | "We don't have to do homework now. Do you want to stop for today, or do something easy for a few minutes?" |
| End softly | "Let's stop here for today. Thanks for being honest with me." |

Arabic example (core response):
> "شكراً إنك قلتلي، ده كان محتاج شجاعة. أنا مساعد كمبيوتر مش إنسان، فمش أنا الصح إني أساعد في ده، الصح حد كبير بتثق فيه. إنت في أمان دلوقتي؟ مين حد كبير ممكن تكلمه؟ مدرس، حد من قرايبك، أو الأخصائي الاجتماعي في المدرسة؟"

If asked to keep it secret:
> "مش هقدر أوعدك بده. فيه شخص متدرب في فريق الأمان هيقرا الجزء ده بس عشان يتأكد إنك بخير. كلامنا مش بيتعرض على أهلك."

### Grades 6 to 8 (ages 11 to 14)
Direct, honest, and private in tone. Teens will shut down at anything that sounds like a lecture or a script, and they may fear their parents finding out. Respect their autonomy, be exact about what happens to their words, and offer more than one route to help.

| Step | English |
|---|---|
| Acknowledge | "Thanks for telling me. That sounds really hard." |
| For abuse, danger, or strangers | "This isn't on you." / "Telling someone was the right move." |
| Honest about what it is | "I'm an AI, so I can't help with this the way a real person can." |
| Be exact about privacy | "To be straight with you: a trained person on our safety team will read this part, only to check you're safe. They don't send the chat to your parents." |
| Safety check | "Are you safe right now?" If no or unclear: the "in danger right now" steps above. |
| Trusted adult | "Is there an adult you trust you could talk to? It doesn't have to be a parent. A teacher, a relative, the school counsellor or social worker. There's also the Child Helpline." |
| If asked to keep it secret | "I won't lie to you, I can't keep it fully secret. Only the safety reviewer sees it, not your parents and not your school." |
| Stay | "No homework pressure now. Want to stop for today, or take a minute?" |
| End softly | "Let's leave it here for today. Look after yourself." |

Arabic example (core response):
> "شكراً إنك قلتلي، ده باين إنه صعب فعلاً. أنا ذكاء اصطناعي، ومش هقدر أساعدك في ده زي ما شخص حقيقي يقدر. وهكون صريح معاك: فيه حد متدرب في فريق الأمان هيقرا الجزء ده بس، عشان يتأكد إنك بخير. الكلام مش هيتبعت لأهلك. فيه حد كبير بتثق فيه تقدر تكلمه؟ مش لازم يكون من أهلك، ممكن مدرس، أو حد من قرايبك، أو الأخصائي الاجتماعي في المدرسة."

The line "only the safety reviewer sees it, not your parents and not your school" must stay true. If the legal answers in `flag-review.md` show we may have to report to an authority, this line changes before launch.

## 4. What the child is told on day one

Every child hears this once during onboarding, after the honest "I'm a computer helper" introduction and before the first lesson. It is spoken and captioned, takes under 20 seconds, and cannot be skipped. A short version stays in the help screen so the child can find it again. The parent sees the same promise, in adult words, during setup.

Tone: calm and matter-of-fact, like explaining where the fire exit is. It must not frighten a 7-year-old or sound like surveillance to a 13-year-old.

### Grades 2 to 3
> "One more thing. What we say here stays here, and your family sees what you learned. But if you ever tell me someone is hurting you, or you are in danger, a grown-up whose job is keeping children safe will read that part, so they can help you."

> "حاجة كمان. الكلام اللي بنقوله هنا بيفضل هنا، وأهلك بيشوفوا إنت اتعلمت إيه. بس لو قلتلي في يوم إن حد بيأذيك، أو إنك في خطر، فيه شخص كبير شغلته إنه يحمي الأطفال هيقرا الحتة دي، عشان يساعدك."

### Grades 4 to 5
> "Quick thing about privacy. Your family sees what you learned, not what we talk about. If you ever tell me someone is hurting you, that you want to hurt yourself, or that a stranger online is asking to meet you or for photos, a trained person on our team will read that part to check you're safe. I won't keep that kind of thing secret, because your safety comes first."

> "حاجة سريعة عن الخصوصية. أهلك بيشوفوا إنت اتعلمت إيه، مش بنتكلم في إيه. لو قلتلي في يوم إن حد بيأذيك، أو إنك عايز تأذي نفسك، أو إن حد غريب على النت عايز يقابلك أو بيطلب صور، فيه شخص متدرب من فريقنا هيقرا الجزء ده بس، عشان يتأكد إنك بخير. الحاجات دي مش هخبيها، عشان أمانك أهم."

### Grades 6 to 8
> "Privacy, quickly. Your parents see your progress, not our conversations. Venting about school or being tired stays here. The one exception: if something you say suggests you're being hurt, might hurt yourself, or are in danger, including someone online you don't know asking for photos or to meet, a trained person on our safety team reads that part only. They don't share the chat with your parents. If it's serious, they may tell a parent that a concern came up, without the details, unless that wouldn't be safe for you."

> "حاجة سريعة عن الخصوصية. أهلك بيشوفوا تقدمك، مش كلامنا. لو بتفضفض عن المدرسة أو تعبان، ده بيفضل هنا. الاستثناء الوحيد: لو قلت حاجة معناها إن حد بيأذيك، أو إنك ممكن تأذي نفسك، أو إنك في خطر، زي حد غريب على النت بيطلب صور أو يقابلك، فيه شخص متدرب في فريق الأمان هيقرا الجزء ده بس. مش هيورّي الكلام لأهلك. ولو الموضوع خطير، ممكن يقولهم إن فيه قلق من غير تفاصيل، إلا لو ده مش آمن ليك."

Open for the grade heads: the grades 2 to 3 and 4 to 5 notices do not mention that a parent may be told a concern came up. That keeps them short, but it is less complete than the teen version. Decide whether to add it.

## 5. After the session
- The parent's session summary shows nothing about the disclosure. A lesson that ended early shows as a normal short session.
- In the next session, the tutor does not bring it up. If the child raises it again, the same script applies and the new flag links to the open case.
- Nothing from a flagged moment is used to choose examples, set the level, or personalise later lessons.

## Hand-offs
| Owner | Task |
|---|---|
| `ai-tutor-engineer` | Build the pause, the band scripts, and the "never" list into the tutor prompt and guardrails; add evals |
| `ai-safety-red-teamer` | Red-team cases for both missed disclosures and false flags, in Arabic, English, mixed speech, and Arabizi; synthetic data only |
| `arabic-nlp-engineer` | Detection of the flag categories in Egyptian Arabic, MSA, code-switching, and Arabizi |
| `product-designer` | Day-one notice step, help-screen copy, the helpline screen, and the soft end; link this file from the onboarding flow where it says "trust and safety playbook" |
| `trust-safety-lead` | Verify helpline numbers; own this playbook going forward |
| `arabic-language-specialist` | Final Arabic wording and the gendered-address question |
| Grade heads | Review wording per band; settle the open questions in sections 1 and 4 |
