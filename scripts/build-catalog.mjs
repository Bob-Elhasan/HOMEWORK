// Builds the curriculum catalog from data/catalog/*.json.
// - Validates the source data (fails with a list of problems).
// - Writes supabase/seed/catalog.sql for migration 0002.
// - Writes CSV exports under data/catalog/export/ for spreadsheets.
// Usage: node scripts/build-catalog.mjs [--check]   (--check validates only)
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DATA = join(ROOT, 'data/catalog');
const SEED_OUT = join(ROOT, 'supabase/seed/catalog.sql');
const EXPORT_DIR = join(DATA, 'export');

export const SYSTEMS = {
  american: 'American',
  ib: 'International Baccalaureate (IB)',
  national: 'Egyptian National (MOE)',
  french: 'French',
};
export const SUBJECTS = {
  math: 'Mathematics',
  science: 'Science',
  arabic: 'Arabic Language',
  'social-studies': 'Social Studies',
  transdisciplinary: 'Transdisciplinary (IB PYP)',
};
// Directory labels that map to a catalog system. Other labels (British, German,
// Canadian, Montessori) stay in schools.listed_curricula only.
const LABEL_TO_SYSTEM = { American: 'american', IB: 'ib', French: 'french', Egyptian: 'national' };
const CONFIDENCE = new Set(['high', 'medium', 'low']);
const KINDS = new Set(['standard', 'framework', 'strand_placeholder']);

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));

export function loadCatalog() {
  const problems = [];
  const fail = (msg) => problems.push(msg);

  const schoolsDoc = readJson(join(DATA, 'schools.json'));
  const curricula = [];

  for (const file of readdirSync(join(DATA, 'curricula')).filter((f) => f.endsWith('.json')).sort()) {
    const doc = readJson(join(DATA, 'curricula', file));
    if (!SYSTEMS[doc.system]) fail(`${file}: unknown system "${doc.system}"`);

    for (const c of doc.curricula ?? []) {
      const where = `${file} > ${c.code}`;
      if (!CONFIDENCE.has(c.confidence)) fail(`${where}: confidence must be high, medium, or low`);
      const kind = c.kind ?? (c.per_grade_syllabi ? 'strand_placeholder' : 'standard');
      if (!KINDS.has(kind)) fail(`${where}: unknown kind "${kind}"`);

      const labels = c.grade_labels ?? {};
      const syllabi = [...(c.syllabi ?? [])];
      for (const pg of c.per_grade_syllabi ?? []) {
        for (const g of pg.grades) {
          syllabi.push({
            subject: pg.subject,
            grade_min: g,
            grade_max: g,
            name: pg.name_template.replace('{label}', labels[String(g)] ?? `Grade ${g}`),
            topics: pg.topics,
          });
        }
      }

      syllabi.forEach((s, i) => {
        const sw = `${where} > syllabus[${i}] ${s.name ?? ''}`;
        if (!SUBJECTS[s.subject]) fail(`${sw}: unknown subject "${s.subject}"`);
        if (!Number.isInteger(s.grade_min) || !Number.isInteger(s.grade_max) || s.grade_min > s.grade_max || s.grade_min < 0 || s.grade_max > 13) {
          fail(`${sw}: grade_min/grade_max must be integers 0-13 with min <= max`);
        }
        if (!s.name) fail(`${sw}: name is required`);
        if (!Array.isArray(s.topics) || s.topics.length === 0) fail(`${sw}: needs at least one topic`);
        (s.topics ?? []).forEach((t, j) => {
          if (!Array.isArray(t) || t.length < 3 || t.slice(0, 3).some((v) => typeof v !== 'string' || !v.trim())) {
            fail(`${sw} > topic[${j}]: must be [code, strand, title, title_en?] with non-empty strings`);
          }
        });
      });

      curricula.push({
        code: c.code,
        system: doc.system,
        name: c.name,
        kind,
        confidence: c.confidence,
        source_url: c.source_url ?? null,
        note: c.note ?? null,
        grade_labels: labels,
        syllabi,
      });
    }
  }

  const codes = curricula.map((c) => c.code);
  codes.filter((c, i) => codes.indexOf(c) !== i).forEach((c) => fail(`duplicate curriculum code "${c}"`));

  const schools = schoolsDoc.schools.map((s) => {
    if (!s.slug || !s.name) fail(`school missing slug or name: ${JSON.stringify(s)}`);
    const systems = new Map();
    for (const label of s.listed_curricula ?? []) {
      const sys = LABEL_TO_SYSTEM[label];
      if (sys) systems.set(sys, 'directory_listing');
    }
    if (!systems.has('national')) systems.set('national', 'mandatory_national');
    return { ...s, systems };
  });

  return { schools, curricula, schoolsSource: schoolsDoc, problems };
}

// Expands a syllabus into one row per grade per topic.
export function topicRowsByGrade(curricula) {
  const rows = [];
  for (const c of curricula) {
    for (const s of c.syllabi) {
      for (let g = s.grade_min; g <= s.grade_max; g += 1) {
        s.topics.forEach(([code, strand, title, titleEn], i) => {
          rows.push({
            year: g,
            grade_label: c.grade_labels[String(g)] ?? `Grade ${g}`,
            system: c.system,
            curriculum_code: c.code,
            curriculum: c.name,
            confidence: c.confidence,
            subject: s.subject,
            syllabus: s.name,
            ordinal: i + 1,
            topic_code: code,
            strand,
            topic: title,
            topic_en: titleEn ?? '',
          });
        });
      }
    }
  }
  return rows;
}

const sql = (v) => {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
};
const sqlArray = (arr) => (arr.length ? `ARRAY[${arr.map(sql).join(', ')}]::text[]` : `'{}'::text[]`);

export function buildSeedSql({ schools, curricula, schoolsSource }) {
  const out = [];
  out.push('-- Generated by scripts/build-catalog.mjs. Do not edit by hand.');
  out.push(`-- Schools source: ${schoolsSource.source} (retrieved ${schoolsSource.retrieved})`);
  out.push('begin;');
  out.push('delete from public.school_systems;');
  out.push('delete from public.schools;');
  out.push('delete from public.topics;');
  out.push('delete from public.syllabi;');
  out.push('delete from public.grade_labels;');
  out.push('delete from public.curricula;');
  out.push('delete from public.subjects;');
  out.push('delete from public.systems;');
  out.push('');

  out.push('insert into public.systems (code, name) values');
  out.push(Object.entries(SYSTEMS).map(([k, v]) => `  (${sql(k)}, ${sql(v)})`).join(',\n') + ';');
  out.push('insert into public.subjects (code, name) values');
  out.push(Object.entries(SUBJECTS).map(([k, v]) => `  (${sql(k)}, ${sql(v)})`).join(',\n') + ';');
  out.push('');

  for (const c of curricula) {
    out.push(`-- ${c.code}`);
    out.push(
      `insert into public.curricula (code, system_code, name, kind, confidence, source_url, note) values (${[
        c.code, c.system, c.name, c.kind, c.confidence, c.source_url, c.note,
      ].map(sql).join(', ')});`,
    );
    const labels = Object.entries(c.grade_labels);
    if (labels.length) {
      out.push('insert into public.grade_labels (curriculum_code, grade, label) values');
      out.push(labels.map(([g, l]) => `  (${sql(c.code)}, ${Number(g)}, ${sql(l)})`).join(',\n') + ';');
    }
    for (const s of c.syllabi) {
      const values = s.topics
        .map(([code, strand, title, titleEn], i) => `(${i + 1}, ${sql(code)}, ${sql(strand)}, ${sql(title)}, ${sql(titleEn ?? null)})`)
        .join(',\n    ');
      out.push(
        `with s as (insert into public.syllabi (curriculum_code, subject_code, grade_min, grade_max, name) values (${[
          c.code, s.subject, s.grade_min, s.grade_max, s.name,
        ].map(sql).join(', ')}) returning id)\n` +
          `insert into public.topics (syllabus_id, ordinal, code, strand, title, title_en)\n` +
          `select s.id, v.ordinal, v.code, v.strand, v.title, v.title_en from s, (values\n    ${values}\n  ) as v(ordinal, code, strand, title, title_en);`,
      );
    }
    out.push('');
  }

  out.push('insert into public.schools (slug, name, city, age_min, age_max, listed_curricula, source_url) values');
  out.push(
    schools
      .map((s) => `  (${[s.slug, s.name, s.city].map(sql).join(', ')}, ${sql(s.age_min)}, ${sql(s.age_max)}, ${sqlArray(s.listed_curricula ?? [])}, ${sql(s.source_url)})`)
      .join(',\n') + ';',
  );
  out.push('insert into public.school_systems (school_slug, system_code, basis) values');
  out.push(
    schools
      .flatMap((s) => [...s.systems].map(([sys, basis]) => `  (${sql(s.slug)}, ${sql(sys)}, ${sql(basis)})`))
      .join(',\n') + ';',
  );
  out.push('commit;');
  return out.join('\n') + '\n';
}

const csvField = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
function toCsv(rows, columns) {
  // UTF-8 BOM so spreadsheet apps show Arabic and French accents correctly.
  return '﻿' + [columns.join(','), ...rows.map((r) => columns.map((c) => csvField(r[c])).join(','))].join('\r\n') + '\r\n';
}

export function buildExports({ schools, curricula }) {
  const byGrade = topicRowsByGrade(curricula);
  const sortKey = (r) => [r.year, r.system, r.subject, r.curriculum_code, r.syllabus, r.ordinal];
  const cmp = (a, b) => {
    const ka = sortKey(a); const kb = sortKey(b);
    for (let i = 0; i < ka.length; i += 1) {
      if (ka[i] < kb[i]) return -1;
      if (ka[i] > kb[i]) return 1;
    }
    return 0;
  };
  byGrade.sort(cmp);

  const flat = [];
  for (const school of [...schools].sort((a, b) => a.name.localeCompare(b.name))) {
    for (const r of byGrade) {
      const basis = school.systems.get(r.system);
      if (basis) flat.push({ school: school.name, system_basis: basis, ...r });
    }
  }
  flat.sort((a, b) => a.school.localeCompare(b.school) || cmp(a, b));

  const gradeCols = ['year', 'grade_label', 'system', 'curriculum', 'subject', 'syllabus', 'topic_code', 'strand', 'topic', 'topic_en', 'confidence'];
  const flatCols = ['year', 'grade_label', 'school', 'system', 'system_basis', 'curriculum', 'subject', 'syllabus', 'topic_code', 'strand', 'topic', 'topic_en', 'confidence'];
  const schoolCols = ['school', 'american', 'ib', 'national', 'french', 'listed_curricula', 'age_range', 'source_url'];
  const schoolRows = [...schools]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((s) => ({
      school: s.name,
      american: s.systems.has('american') ? 'yes' : '',
      ib: s.systems.has('ib') ? 'yes' : '',
      national: s.systems.get('national') === 'mandatory_national' ? 'yes (mandatory)' : 'yes',
      french: s.systems.has('french') ? 'yes' : '',
      listed_curricula: (s.listed_curricula ?? []).join('; '),
      age_range: s.age_min != null ? `${s.age_min}-${s.age_max}` : '',
      source_url: s.source_url,
    }));

  return {
    byGrade,
    flat,
    files: {
      'curriculum_topics_by_grade.csv': toCsv(byGrade, gradeCols),
      'school_curriculum_topics.csv': toCsv(flat, flatCols),
      'schools.csv': toCsv(schoolRows, schoolCols),
    },
  };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const catalog = loadCatalog();
  if (catalog.problems.length) {
    catalog.problems.forEach((p) => console.error(p));
    console.error(`\n${catalog.problems.length} problem(s) in data/catalog.`);
    process.exit(1);
  }
  const exportsOut = buildExports(catalog);
  const syllabusCount = catalog.curricula.reduce((n, c) => n + c.syllabi.length, 0);
  const summary = `${catalog.schools.length} schools, ${catalog.curricula.length} curricula, ${syllabusCount} syllabi, ${exportsOut.byGrade.length} topic-by-year rows, ${exportsOut.flat.length} school rows`;

  if (process.argv.includes('--check')) {
    console.log(`OK (check only): ${summary}`);
  } else {
    mkdirSync(join(ROOT, 'supabase/seed'), { recursive: true });
    writeFileSync(SEED_OUT, buildSeedSql(catalog));
    mkdirSync(EXPORT_DIR, { recursive: true });
    for (const [name, body] of Object.entries(exportsOut.files)) writeFileSync(join(EXPORT_DIR, name), body);
    console.log(`Built: ${summary}`);
  }
}
