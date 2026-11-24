# Study Companion

An immersive AI tutor for students in grades 2-8. The tutor talks with the child, listens, interrupts when needed, and shows ideas on a whiteboard, with real images and interactive demos. It never hands over answers. It asks, hints, and checks reasoning.

Current status: **Phase 0 (foundations)**. See the approved plan for the full roadmap.

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

## Curricula

- Arabic and Social Studies: Egyptian MOE outcomes (`moe-eg`)
- Math and Science: El Alsson British track (`alsson-uk-national`) and American track (`alsson-us-ccss-ngss`). The scheme of work must be verified with the school before content is published.
