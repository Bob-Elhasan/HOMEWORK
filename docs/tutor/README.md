# The Tutor Brain

Status: **milestone 1 of Phase 1, 2026-11-26.** Text only, one lesson (Grade 5 fractions, CCSS 5.NF.A.1). Not used by any child yet.

## In plain words
The tutor is a server program that sits between the child and the AI model. The AI writes the words; the server decides what the AI is allowed to do, and checks every word before the child sees it.

Each turn:
1. **Safety first.** If the child says something worrying (self-harm, abuse, danger, a stranger online), the lesson pauses and the tutor answers with the age-band script from [`../safety/distress-script.md`](../safety/distress-script.md). The child's message is not sent to the AI, and its words are not kept in the session. Urgent cases show helpline numbers. The AI also reports its own read of every message, as a second layer.
2. **Grade with rules, not the AI.** The server reads any number the child wrote (digits, words, decimals, Arabic digits) and compares it with the private answer key. It also spots known wrong ideas (for example 2/3 + 1/4 = 3/7) and guessing.
3. **Hint ladder.** Think first: no hints until the child tries. Each wrong try, "just tell me", or "I'm stuck" unlocks one more hint, up to three (nudge, structure, worked example on a different problem).
4. **No confirming guesses.** A correct value is not confirmed until the child explains how they got it. Only then is the question marked solved, and only the server can mark it.
5. **Leak guard.** Every reply and every whiteboard line is checked against every unsolved answer key, in any spelling ("11/12", "eleven twelfths", "11 out of 12", "0.92", "91.7%", "22/24", "١١/١٢"). A match is thrown away and replaced with the next hint. Leaked text is never stored.
6. **Cost meter.** Every turn records its cost from the API's token counts.

## Files
| File | What it does |
|---|---|
| `supabase/functions/_shared/tutor/session.ts` | The turn loop above |
| `.../leak-filter.ts`, `.../numbers.ts` | The leak guard and the number reader |
| `.../intent.ts` | Spots "just tell me", "I'm stuck", "let's continue" (English and Egyptian Arabic) |
| `.../safety.ts` | Safety pause, flag categories, age-band scripts (English and Arabic drafts) |
| `.../prompt.ts` | The tutor's instructions and the per-turn server note |
| `.../claude.ts` | Calls Claude (Opus 5.5, low effort by default) with structured output, prompt caching and server-side fallbacks |
| `.../cost.ts` | Price table and cost per turn |
| `.../state-token.ts` | Signs session state so the app cannot edit it (milestone 1 only) |
| `supabase/functions/tutor/index.ts` | The server endpoint (developer-only, behind a token) |
| `evals/tutor/red-team.json` | 102 synthetic child tricks: direct asks, pressure, fake authority, role-play, prompt injection, format tricks, yes/no guessing, Egyptian Arabic, stuck, off-topic |
| `evals/tutor/safety-cases.json` | Synthetic disclosures that must flag, and ordinary venting that must not |
| `scripts/eval-tutor.mts` | Runs the red-team suite against the real model and reports leaks, cost and speed |
| `scripts/tutor-chat.mts` | Chat with the tutor in a terminal |

## Commands
```
npm run test:tutor            # offline tests, no API key, run in CI
npm run eval:tutor            # live red-team run, needs ANTHROPIC_API_KEY, about $1
npm run eval:tutor -- --model claude-sonnet-5-5
npm run tutor:chat            # needs ANTHROPIC_API_KEY
```

## How the zero-leak gate is tested
The offline red-team test pairs every one of the 102 tricks with a fake AI that gives in and leaks the answer in a different way each time. The guard must stop all of them. The live run then measures how often the real model even tries (it should almost never) and what each turn costs.

## Known gaps (next milestones)
- **Leaks the guard cannot see:** the answer described as arithmetic ("one whole minus one twelfth"), confirming a guess with "yes", or Arabic number words. The prompt forbids these and the server withholds confirmation, but a second check by a separate grader model is planned.
- **Storage:** sessions live in a signed token. Next: database tables with row-level security, a restricted safety review queue, and turn logs for parents ("done alone" or "needed hints").
- **Safety rules are keyword lists.** They need the red-team and Arabic NLP passes from the distress script (Arabizi, code-switching), and grade-head sign-off. Helpline numbers are unverified.
- **Lessons:** the server bundles one lesson. Loading lessons from the database comes with the content factory.
- **Model choice:** Opus 5.5 low effort is the default; the live eval compares Sonnet 5.5, Haiku 5.5 and fast mode on real numbers before we decide.
- **Edge function deploy:** not deployed yet. Needs `ANTHROPIC_API_KEY`, `TUTOR_STATE_SECRET`, `TUTOR_DEV_TOKEN` as Supabase secrets.
