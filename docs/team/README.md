# The Team

Thirty-one AI agents, each a Claude Code subagent defined in `.claude/agents/`. The names, backstories, and credentials are fictional personas, written to give each agent a consistent point of view, clear ownership, and firm limits. They are not real people.

The school staff (principal, course designers, heads of department, grade heads, and teachers) is a separate group of 61 agents. See `docs/school/README.md`; they own lesson content and pedagogy and hand finished lessons to this team.

## Roster by department

### Leadership and product
| Agent | Name | Role | Owns |
|---|---|---|---|
| `tech-lead` | Karim Hafez | Tech Lead and Architect | Architecture, ADRs in `docs/adr/`, splitting work, cross-cutting review |
| `product-manager` | Sherif Nabil | Product Manager | Priorities, v1 scope, requirement docs in `docs/prd/`, success metrics |
| `ux-researcher` | Yasmin Gamal | UX Researcher | Research with children and parents, pilot plans, findings in `docs/research/` |

### Design
| Agent | Name | Role | Owns |
|---|---|---|---|
| `product-designer` | Rana Lotfy | Product Designer | User flows, screen specs in `docs/design/`, interface copy |
| `game-designer` | Mostafa Ali | Game Designer | XP economy, levels, streaks, badges, leaderboards, anti-gaming rules |
| `brand-illustration-designer` | Farida Hassan | Brand and Illustration Designer | Visual identity, tutor character, illustration and icon style |

### Learning and curriculum
| Agent | Name | Role | Owns |
|---|---|---|---|
| `learning-designer` | Dr. Mariam Zaki | Learning Designer | Pedagogy, hint ladders, rubrics, age-band tutor behaviour, `docs/learning-design.md` |
| `arabic-language-specialist` | Hassan Abdel-Rahman | Arabic Language Specialist | Arabic lessons and tutor Arabic: grammar, spelling, reading, poetry |
| `math-education-specialist` | Amr Fawzy | Mathematics Education Specialist | Math progressions, misconceptions, visual models |
| `science-education-specialist` | Dr. Nadia Sami | Science Education Specialist | Inquiry lessons, predict-first demos, scientific accuracy |
| `social-studies-specialist` | Mahmoud Selim | Social Studies Specialist | Egyptian history, geography, civics, cause-and-effect reasoning |
| `international-curriculum-specialist` | Claire Dubois | International Curriculum Specialist | American, IB, British, French systems and cross-curriculum mapping |
| `assessment-specialist` | Dr. Hesham Wahba | Assessment and Psychometrics | Mastery rules, test design, measuring learning honestly |
| `curriculum-data-engineer` | Hana Ibrahim | Curriculum Data Engineer | `data/catalog/`, `content/schema.json`, source verification |

### Child wellbeing and inclusion
| Agent | Name | Role | Owns |
|---|---|---|---|
| `child-development-specialist` | Dr. Aya Mostafa | Child Development and Wellbeing | Age-appropriateness, frustration, screen time, emotional safety |
| `inclusion-accessibility-specialist` | Malak Ezzat | Inclusion and Accessibility | Learning differences, WCAG, accessibility settings |

### AI and data
| Agent | Name | Role | Owns |
|---|---|---|---|
| `ai-tutor-engineer` | Nour El-Sherif | AI Tutor Engineer | Tutor prompts, answer-leak filter, grading, `evals/tutor/` |
| `voice-engineer` | Youssef Adel | Real-time Voice Engineer | Speech in and out, barge-in, latency, voice cost |
| `arabic-nlp-engineer` | Mona Khalil | Arabic NLP Engineer | Arabic normalisation and answer matching, Arabic leak detection |
| `learning-analytics-scientist` | Ziad Hamdy | Learning Analytics Scientist | Mastery model, review scheduler, dashboard metrics, experiments |
| `ai-safety-red-teamer` | Sami Rashed | AI Safety and Red Team | Attacking the tutor, `evals/redteam/`, failure reports |

### Engineering
| Agent | Name | Role | Owns |
|---|---|---|---|
| `mobile-engineer` | Layla Mansour | Senior Mobile Engineer | Expo app in `app/` and `src/`, RTL Arabic, low-end Android performance |
| `web-engineer` | Mohamed Tawfik | Web Engineer | Teacher console, content review tools, web parent dashboard |
| `backend-engineer` | Omar Saad | Backend and Data Engineer | `supabase/migrations/`, RLS, Edge Functions |
| `interactive-media-engineer` | Salma Fathy | Interactive Media Engineer | Whiteboard renderer and scene schema, demo library |
| `devops-engineer` | Ahmed Kamal | DevOps and Release | CI in `.github/workflows/`, EAS builds, environments, cost tracking |

### Quality, safety, and compliance
| Agent | Name | Role | Owns |
|---|---|---|---|
| `qa-engineer` | Tarek Ramzy | QA and Test Automation | Test coverage, Maestro flows, verifying features before "done" |
| `security-privacy-engineer` | Dina Hosny | Security and Child Privacy (read-only) | Security and privacy reviews, child data, vendor terms |
| `trust-safety-lead` | Heba Mourad | Trust and Safety Lead | Group and class safety, moderation, safeguarding playbooks in `docs/safety/` |
| `legal-compliance-advisor` | Noha Farag | Legal and Compliance Advisor | Compliance register in `docs/compliance/`, policy drafts for lawyer review |

### Go to market
| Agent | Name | Role | Owns |
|---|---|---|---|
| `school-partnerships-lead` | Tamer Gaber | School Partnerships Lead | School pilots, teacher onboarding, `docs/partnerships/` |

## Structure

```
                                Karim Hafez (tech-lead)
                                Sherif Nabil (product-manager)
                                           |
   +-----------+-------------+-------------+-------------+-------------+-------------+
   |           |             |             |             |             |             |
 Design     Learning     Wellbeing      AI and       Engineering   Quality,     Go to
            and          and            data                       safety,      market
            curriculum   inclusion                                 compliance
 Rana       Mariam       Aya            Nour         Layla         Tarek        Tamer
 Mostafa    Hassan       Malak          Youssef      Mohamed       Dina         Yasmin
 Farida     Amr                         Mona         Omar          Heba         (research)
            Nadia                       Ziad         Salma         Noha
            Mahmoud                     Sami         Ahmed
            Claire
            Hesham
            Hana
```

## How work flows

**A new lesson**
1. `learning-designer` sets objectives, misconceptions, hint ladder, and rubric, with the subject specialist (`arabic-language-specialist`, `math-education-specialist`, `science-education-specialist`, or `social-studies-specialist`).
2. `curriculum-data-engineer` links it to the official outcome and source.
3. `interactive-media-engineer` builds the whiteboard scene or demo the specialist specified.
4. `ai-tutor-engineer` runs the tutor on it; `arabic-nlp-engineer` checks Arabic matching for Arabic lessons.
5. `ai-safety-red-teamer` attacks it; `qa-engineer` runs validation and evals.
6. `inclusion-accessibility-specialist` checks it works with read-aloud and accessibility settings.

**A new feature**
1. `product-manager` writes the requirement doc with one success metric; `ux-researcher` brings evidence.
2. `tech-lead` scopes it and assigns owners.
3. `product-designer` writes the spec; `game-designer` for any reward mechanic; `brand-illustration-designer` for visuals.
4. `backend-engineer`, `mobile-engineer`, and `web-engineer` build it.
5. Reviews as needed: `security-privacy-engineer` (child data, vendors), `trust-safety-lead` (anything social), `child-development-specialist` (feedback, rewards, pressure), `legal-compliance-advisor` (consent, content licensing).
6. `qa-engineer` verifies it. `devops-engineer` ships it through CI.

**A pilot**
1. `ux-researcher` writes the study plan with consent and assent.
2. `assessment-specialist` designs the pre-test and week-later recall test.
3. `learning-analytics-scientist` defines the analysis; `school-partnerships-lead` runs school pilots.
4. `product-manager` turns the findings into decisions.

## Review gates (nothing ships without these)

| Gate | Who signs off |
|---|---|
| Never-answer rule | `ai-tutor-engineer` evals pass, `ai-safety-red-teamer` finds no open leaks, `learning-designer` reviewed transcripts |
| Subject accuracy | The subject specialist for that lesson |
| Child data and vendors | `security-privacy-engineer`; legal questions flagged by `legal-compliance-advisor` for a licensed lawyer |
| Social features | `trust-safety-lead` and `child-development-specialist` |
| Accessibility | `inclusion-accessibility-specialist` |
| Tests | `qa-engineer` ran everything and reported the real results |

## Using the team

In Claude Code, name the agent in your request:

- "Use the tech-lead agent to plan the one-lesson tutor prototype."
- "Ask the math-education-specialist to write the hint ladder for CCSS 4.NF.B."
- "Have the ai-safety-red-teamer try to extract answers from the tutor."
- "Get the game-designer to draft the XP economy."
- "Ask the legal-compliance-advisor what our consent flow needs."

Claude can also pick an agent on its own when a request matches one of their descriptions. New agent files load when a session starts, so open a new session if a teammate does not appear.

## Shared rules (in every agent's brief)

- Never reveal the final answer to a practice question, in any feature, prompt, or screen.
- Child safety and privacy first: minimum data, RLS on every table, no trackers, no ads.
- Never edit a committed migration; add the next numbered one.
- Run the checks that apply before finishing, and report results honestly.
- No em dashes in user-facing text and docs.
