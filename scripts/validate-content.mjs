// Validates every lesson under content/ against the rules in the plan.
// Dependency-free on purpose: CI runs it without an install step.
// Structural rules mirror content/schema.json; add ajv later for full schema checks.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTENT_DIR = fileURLToPath(new URL('../content', import.meta.url));
const CURRICULA = new Set(['moe-eg', 'alsson-uk-national', 'alsson-us-ccss-ngss']);
const SUBJECTS = new Set(['arabic', 'social-studies', 'math', 'science']);
const STATUSES = new Set(['draft', 'in-review', 'published']);
const ID_PATTERN = /^[a-z]{2}\.g[2-8]\.[a-z0-9.-]+$/;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return name.endsWith('.json') && name !== 'schema.json' ? [full] : [];
  });
}

function nonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function validateLesson(lesson, file) {
  const errors = [];
  const push = (msg) => errors.push(msg);

  if (!nonEmptyString(lesson.id) || !ID_PATTERN.test(lesson.id)) push('id must match <subject-code>.g<2-8>.<slug>');
  if (!CURRICULA.has(lesson.curriculum)) push(`curriculum must be one of ${[...CURRICULA].join(', ')}`);
  if (!SUBJECTS.has(lesson.subject)) push(`subject must be one of ${[...SUBJECTS].join(', ')}`);
  if (!Number.isInteger(lesson.grade) || lesson.grade < 2 || lesson.grade > 8) push('grade must be an integer 2-8');
  if (!STATUSES.has(lesson.status)) push('status must be draft, in-review, or published');
  if (lesson.status === 'published' && !(lesson.teacher_review?.reviewer && lesson.teacher_review?.date)) {
    push('published lessons need teacher_review.reviewer and teacher_review.date');
  }

  if (!Array.isArray(lesson.learning_objectives) || lesson.learning_objectives.length === 0) {
    push('learning_objectives must be a non-empty array');
  } else {
    lesson.learning_objectives.forEach((lo, i) => {
      if (!nonEmptyString(lo.text)) push(`learning_objectives[${i}].text is required`);
      if (!Array.isArray(lo.source_outcomes) || lo.source_outcomes.length === 0) {
        push(`learning_objectives[${i}] must cite at least one source_outcome`);
      }
    });
  }

  if (!Array.isArray(lesson.skills) || lesson.skills.length === 0) push('skills must be a non-empty array');
  if (!nonEmptyString(lesson.explain)) push('explain is required');
  if (!nonEmptyString(lesson.explain_back)) push('explain_back is required');

  (lesson.images ?? []).forEach((img, i) => {
    if (!nonEmptyString(img.license)) push(`images[${i}] must have a license (unlicensed images are not allowed)`);
  });

  (lesson.demos ?? []).forEach((demo, i) => {
    if (!nonEmptyString(demo.id)) push(`demos[${i}].id is required`);
    if (!nonEmptyString(demo.predict_first)) push(`demos[${i}] needs a predict_first prompt`);
  });

  if (!Array.isArray(lesson.questions) || lesson.questions.length === 0) {
    push('questions must be a non-empty array');
  } else {
    lesson.questions.forEach((q, i) => {
      const label = `questions[${i}]${q.id ? ` (${q.id})` : ''}`;
      if (!nonEmptyString(q.think_prompt)) push(`${label}.think_prompt is required`);
      if (!Array.isArray(q.rubric) || q.rubric.length === 0) push(`${label}.rubric must be a non-empty array`);
      if (!nonEmptyString(q.answer_key)) push(`${label}.answer_key is required`);
      if (!Array.isArray(q.hints) || q.hints.length !== 3 || q.hints.some((h) => !nonEmptyString(h))) {
        push(`${label}.hints must be exactly three non-empty strings`);
      }
    });
  }

  (lesson.misconceptions ?? []).forEach((m, i) => {
    if (!nonEmptyString(m.wrong_idea) || !nonEmptyString(m.exposing_question)) {
      push(`misconceptions[${i}] needs wrong_idea and exposing_question`);
    }
  });

  return errors.map((e) => `${relative(process.cwd(), file)}: ${e}`);
}

const files = walk(CONTENT_DIR);
let failures = 0;

for (const file of files) {
  let lesson;
  try {
    lesson = JSON.parse(readFileSync(file, 'utf8'));
  } catch (err) {
    failures += 1;
    console.error(`${relative(process.cwd(), file)}: invalid JSON (${err.message})`);
    continue;
  }
  const errors = validateLesson(lesson, file);
  if (errors.length) {
    failures += errors.length;
    errors.forEach((e) => console.error(e));
  }
}

if (files.length === 0) {
  console.log('No lesson files found under content/.');
} else if (failures === 0) {
  console.log(`OK: ${files.length} lesson file(s) valid.`);
} else {
  console.error(`\n${failures} problem(s) found in ${files.length} lesson file(s).`);
  process.exit(1);
}

export { validateLesson, walk, CONTENT_DIR };
