# The Tech Team

Twelve AI agents, each a Claude Code subagent defined in `.claude/agents/`. The names, backstories, and credentials are fictional personas, written to give each agent a consistent point of view, clear ownership, and firm limits. They are not real people.

## Roster

| Agent | Name | Role | Owns |
|---|---|---|---|
| `tech-lead` | Karim Hafez | Tech Lead and Architect | Architecture, ADRs in `docs/adr/`, splitting work across the team, cross-cutting review |
| `mobile-engineer` | Layla Mansour | Senior Mobile Engineer | Expo app screens in `app/` and `src/`, RTL Arabic, low-end Android performance |
| `backend-engineer` | Omar Saad | Backend and Data Engineer | `supabase/migrations/`, RLS, Edge Functions, backend tests |
| `ai-tutor-engineer` | Nour El-Sherif | AI Tutor Engineer | Tutor prompts, Claude API, answer-leak filter, rubric grading, `evals/tutor/` |
| `voice-engineer` | Youssef Adel | Real-time Voice Engineer | Speech in and out, barge-in, latency, voice provider choice and cost |
| `interactive-media-engineer` | Salma Fathy | Interactive Media Engineer | Whiteboard renderer and scene schema, demo library, image cards |
| `curriculum-data-engineer` | Hana Ibrahim | Curriculum Data Engineer | `data/catalog/`, `content/schema.json`, source verification, textbook extraction |
| `learning-designer` | Dr. Mariam Zaki | Learning Designer | `docs/learning-design.md`, hint ladders, rubrics, lesson review, age-band behaviour |
| `product-designer` | Rana Lotfy | Product Designer | Screen specs in `docs/design/`, gamification design, interface copy |
| `qa-engineer` | Tarek Ramzy | QA and Test Automation | Test coverage, Maestro flows, verifying features before "done" |
| `security-privacy-engineer` | Dina Hosny | Security and Child Privacy (read-only) | Security and privacy reviews, child data, vendor terms, PDPL questions |
| `devops-engineer` | Ahmed Kamal | DevOps and Release | CI in `.github/workflows/`, EAS builds, environments, cost tracking |

## Structure

```
                          Karim Hafez (tech-lead)
                                    |
      +---------------+-------------+--------------+----------------+
      |               |             |              |                |
   Product         Tutor core     Platform       Content          Quality
   Rana            Nour           Layla          Hana             Tarek
   (design)        Youssef        Omar           Mariam           Dina
                   Salma          Ahmed          (pedagogy)       (review gates)
```

## How work flows

**A new lesson**
1. `learning-designer` sets objectives, misconceptions, hint ladder, and rubric.
2. `curriculum-data-engineer` links it to the official outcome and checks the source.
3. `interactive-media-engineer` adds the whiteboard scene or demo.
4. `ai-tutor-engineer` runs the tutor on it and checks for answer leaks.
5. `qa-engineer` runs content validation and the tutor evals.

**A new feature**
1. `tech-lead` scopes it and assigns owners.
2. `product-designer` writes the screen spec.
3. `backend-engineer` and `mobile-engineer` build it.
4. `security-privacy-engineer` reviews it if it touches child data, auth, or a vendor.
5. `qa-engineer` verifies it. `devops-engineer` ships it through CI.

**Review gates (nothing ships without these)**
- Never-answer rule: `ai-tutor-engineer` evals pass, and `learning-designer` has reviewed the transcripts.
- Child data: `security-privacy-engineer` has signed off.
- Tests: `qa-engineer` has run everything and reported the real results.

## Using the team

In Claude Code, name the agent in your request:

- "Use the tech-lead agent to plan the one-lesson tutor prototype."
- "Ask the learning-designer to write the hint ladder for CCSS 4.NF.B."
- "Have the security-privacy-engineer review the voice consent flow."
- "Get the voice-engineer to design the voice provider spike."

Claude can also pick an agent on its own when a request matches one of their descriptions. New agent files are loaded when a session starts, so open a new session if a teammate does not appear.

## Shared rules (in every agent's brief)

- Never reveal the final answer to a practice question, in any feature, prompt, or screen.
- Child safety and privacy first: minimum data, RLS on every table, no trackers, no ads.
- Never edit a committed migration; add the next numbered one.
- Run the checks that apply before finishing, and report results honestly.
- No em dashes in user-facing text and docs.
