# Safety Flag Review: Human Steps

Status: **draft, 2026-11-25.** Council blocker 1 of 4 from [`docs/school/council/2026-11-25-onboarding-voice-flow.md`](../school/council/2026-11-25-onboarding-voice-flow.md).
Authors: `child-development-specialist`, with the `ai-safety-red-teamer` perspective.
Review needed: the grade heads, `trust-safety-lead` (owner of safeguarding playbooks), `security-privacy-engineer` (storage and access), `legal-compliance-advisor` (open questions below, for a licensed lawyer).
What the tutor says in the moment: [`distress-script.md`](distress-script.md).

## Principles
1. A serious-risk flag goes first to a named, trained human. No automatic parent alert, ever.
2. The reviewer sees as little as possible: the flagged excerpt and a few turns either side.
3. The parent may be told a concern was raised. The parent is never shown the transcript.
4. If the worry involves the family, there is no parent alert. The reviewer escalates.
5. The excerpt is kept apart, logged on every read, deleted when the case closes, and never used for training.
6. Until a trained reviewer covers the hours children use the app, open conversation does not launch (see `docs/roadmap.md`, safety reviewer row).

## Roles
| Role | Who | Notes |
|---|---|---|
| Safety reviewer | A named person, trained and vetted before access | Decides each case. At least one named backup. |
| Safety lead | `trust-safety-lead` | Owns this process, audits access logs, supports reviewers, handles escalations with the reviewer |
| Legal contact | `legal-compliance-advisor`, then a licensed lawyer | Questions about reporting duties and retention |

Reviewer training covers at least: child development by age band, signs of abuse and self-harm risk, the difference between venting and risk, not over-reading game talk or lesson content, privacy rules in this document, escalation routes, and looking after themselves. Reviewers get regular supervision and a limit on caseload, because this work is heavy.

Being "named" means the reviewer's identity is recorded against every case they open. It does not mean the reviewer's name is shown to the family.

## What the reviewer sees
- The flagged turn, plus up to **{N_before}** turns before and **{N_after}** turns after (proposed: 3 and 2; to be set by `trust-safety-lead`).
- The flag category and whether the system marked it urgent or unclear.
- Grade band (2 to 3, 4 to 5, or 6 to 8), session language, date and time.
- A case ID.

The reviewer does **not** see: the child's full name, the school, the parent's name or contact details, other sessions, progress data, or audio. If the parent must be told, the system sends a fixed message; the reviewer does not contact the parent directly. If escalation outside the company needs identifying details, they are released only through the escalation step below, and that release is logged.

## Storage
- Excerpts live in a **separate restricted table**, not in the normal transcript store. Only the safety reviewer role can read it, enforced with RLS.
- **Every read is logged** in an append-only access log: who, which case, when. The log holds no excerpt text, so it can be kept after the excerpt is deleted.
- **Deleted when the case closes.** This depends on the open legal question about retention; if a lawyer says we must keep it longer, this line changes and the reason is recorded here.
- **Never used for training**, model evaluation, analytics, or red-team data. Red-team cases use synthetic examples only.
- Excluded from the parent dashboard, parent data exports, and the normal transcript retention job.

Hand-off: `backend-engineer` writes the migration (next numbered file, never an edit to a committed one) with RLS and the access log; `security-privacy-engineer` reviews it, including how backups and deletion interact.

## Case lifecycle
| Stage | What happens | Exit |
|---|---|---|
| 1. Flagged | The tutor runs the distress script. The system copies the excerpt into the restricted table and opens a case. Urgent flags also page the on-duty reviewer. | Reviewer opens the case |
| 2. In review | The reviewer reads the excerpt and decides. If unsure, they consult the safety lead. No one questions the child. | One decision below |
| 3a. No concern | False alarm: game talk, lesson content, a clear joke in context. | Close |
| 3b. Concern, parent told | Real concern, and nothing in the excerpt suggests the family or anyone in the home is involved. The system sends the fixed parent message. | Close after the message is sent |
| 3c. Concern, escalated | The worry involves the family or someone in the home, or the child seems in immediate danger. No parent alert. The reviewer and safety lead escalate by the route the lawyer confirms. | Close when the escalation step is done and recorded |
| 4. Closed | The excerpt is deleted. The case keeps only: case ID, category, decision, dates, reviewer, and the access log. | |

"The family" for step 3b and 3c means anyone who lives in the home or cares for the child there: parents, step-parents, siblings, relatives, nannies, drivers, and other household staff. When the reviewer cannot tell, they treat it as 3c.

If the child raises the same worry again while a case is open, the new excerpt joins that case. A new case opens only after the old one is closed.

### Fixed parent message (draft, for 3b only)
> "During a recent session, something {child name} said raised a concern about their wellbeing, and a trained member of our safety team reviewed it. We don't share the conversation, to protect your child's trust. We suggest finding a calm, private moment to check in with them. If you are worried about their safety, contact {helpline, to be verified}."

No date of the session, no quote, no category. `legal-compliance-advisor` and `arabic-language-specialist` review the final English and Arabic text.

## Response-time targets (to be set)
| Flag type | Target from flag to reviewer decision | Set by |
|---|---|---|
| Urgent (possible immediate danger) | **{TBD} minutes** | `trust-safety-lead` |
| Standard | **{TBD} hours** | `trust-safety-lead` |
| Unclear | **{TBD} hours** | `trust-safety-lead` |

Also to be set: the hours the review queue is covered, what happens to urgent flags outside those hours, and how missed targets are reported. The tutor's in-session response (helpline numbers on screen, "go to a grown-up near you") is the only immediate help a child gets; this document does not claim faster human help than we can staff.

## Audit
- Monthly, the safety lead reviews the access log for reads outside an open case.
- Reported as counts only: flags by category and band, decisions, time to decision, false-alarm rate. No excerpts in reports.
- High false-alarm rates go back to `ai-tutor-engineer` and `ai-safety-red-teamer` to tune detection.

## Open legal questions (unresolved)
For `legal-compliance-advisor` to take to a licensed Egyptian lawyer. None of these is answered; nothing in this document should be read as a statement of Egyptian law.

1. **Mandatory reporting.** Does an app operator, or an individual reviewer, have a duty in Egypt to report suspected abuse or a risk to a child's life? If yes, to whom (for example the child helpline, the National Council for Childhood and Motherhood, the police, or the prosecution), within what time, and with what information? Does the Child Law, in its current text, apply to us?
2. **Escalation route.** If there is no duty, what is the lawful and safest route for step 3c, and what identifying details may we release?
3. **Retention.** May we delete the excerpt when the case closes? Must we keep it for a set period, or keep it once a case is escalated to an authority? Could deletion after an escalation create a legal problem?
4. **Sensitive data.** Is a safety excerpt sensitive data under Law 151/2020, and what does that require (consent, licensing, security)?
5. **Lawful basis without the parent.** Can we process and escalate a child's data without parent consent when the parent may be the risk? What must the parent consent wording in setup say about this process?
6. **Parent access rights.** If a parent asks for all their child's data, must we include a safety excerpt or the fact of a case? Can we withhold it when the family is involved?
7. **Reviewer location and transfer.** Must the reviewer and the restricted table be in Egypt? Does remote review count as a cross-border transfer?
8. **Requests from authorities.** How do we handle a lawful request for an excerpt that has already been deleted, or one for a case still open?
9. **Liability.** What is our exposure if a flag is missed, reviewed late, or judged wrongly?

Until these are answered, the teen line "not your parents and not your school" in `distress-script.md` and the "deleted when the case closes" rule are provisional.
