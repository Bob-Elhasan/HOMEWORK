# Study Companion

An immersive AI tutor for students in grades 2-8. The tutor talks with the child, listens, interrupts when needed, and shows ideas on a whiteboard, with real images and interactive demos. It never hands over answers. It asks, hints, and checks reasoning.

Current status: **Phase 0 (foundations)**. The full roadmap is in [`docs/product-plan.md`](docs/product-plan.md).

The team is thirty-one Claude Code agents across product, design, learning, wellbeing, AI, engineering, safety, and partnerships. See [`docs/team/README.md`](docs/team/README.md) for the roster, ownership, and how work flows between them.

The school staff is sixty-one more agents: a principal, five course designers, six heads of department, seven grade heads, and forty-two teachers (one per subject per grade). They meet as an academic council. See [`docs/school/README.md`](docs/school/README.md).

## Stack

- Expo (React Native) + TypeScript, Expo Router
- English-first UI, RTL ready for Arabic lessons
- Supabase (Postgres, Auth, RLS). AI and voice keys live only in Edge Functions.
- Content as versioned, schema-validated JSON under `content/`

## Setup

Requirements: Node 20 or newer, and the Expo Go app on a phone, or an Android emulator.

```bash
npm install
npm run start          # Expo dev server
npm run typecheck      # TypeScript, strict
npm run validate:content   # Checks every lesson under content/
```

## Content rules

Every lesson under `content/` must:
- cite at least one official outcome per learning objective
- have exactly three hints per question, none of which gives the final answer
- have a rubric and a private `answer_key`
- use only licensed images, with the license recorded

Lessons with `"status": "published"` also need `teacher_review` with a reviewer and a date.

## Database

Migrations live in `supabase/migrations/`. `0001_init.sql` creates families, parents, and children, with Row Level Security so one family cannot read another's data.

## Curriculum catalog

A database of year (grade 2-8), school, system, curriculum, subject, syllabus, and topics for four systems: American, IB, Egyptian National, and French.

- Source data: `data/catalog/schools.json` (44 Cairo schools from the International Schools Database American filter) and `data/catalog/curricula/*.json`
- Schema: `supabase/migrations/0002_curriculum_catalog.sql`. The flat table is the view `school_curriculum_topics`, and `curriculum_topics_by_grade` is the same without schools.
- Generated: `supabase/seed/catalog.sql` and CSV exports in `data/catalog/export/`

```bash
npm run build:catalog   # validate data, regenerate seed SQL and CSVs
npm run test:catalog    # load migration + seed into PGlite and check it
```

Each curriculum has a `confidence` value. American (CCSS, NGSS) is high. IB and French are medium. IB defines strands, not topics, and the French programmes were revised from 2025. Egyptian National is low, entered at strand level until the MOE textbook units are filled in.

## Curricula

- Arabic and Social Studies: Egyptian MOE outcomes (`moe-eg`)
- Math and Science: El Alsson British track (`alsson-uk-national`) and American track (`alsson-us-ccss-ngss`). The scheme of work must be verified with the school before content is published.
