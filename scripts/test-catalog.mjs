// Loads migration 0002 and the generated seed into PGlite (in-process Postgres)
// and checks the catalog end to end. Run after: node scripts/build-catalog.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { buildExports, loadCatalog } from './build-catalog.mjs';

const root = new URL('..', import.meta.url);
const read = (p) => readFileSync(fileURLToPath(new URL(p, root)), 'utf8');

let failures = 0;
const check = (ok, msg) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`);
  if (!ok) failures += 1;
};

const db = new PGlite();
// Supabase roles the policies refer to.
await db.exec(`create role anon nologin; create role authenticated nologin;`);
await db.exec(read('supabase/migrations/0002_curriculum_catalog.sql'));
await db.exec(read('supabase/migrations/0003_catalog_verification.sql'));
await db.exec(read('supabase/migrations/0004_syllabus_edition.sql'));
await db.exec(read('supabase/migrations/0005_syllabus_editions.sql'));
// Supabase grants full table privileges to these roles by default, so RLS is the real guard.
await db.exec(`grant usage on schema public to anon, authenticated;
               grant all on all tables in schema public to anon, authenticated;`);
await db.exec(read('supabase/seed/catalog.sql'));

const one = async (q) => (await db.query(q)).rows[0];
const catalog = loadCatalog();
const { byGrade, flat } = buildExports(catalog);

check(catalog.problems.length === 0, 'source data has no validation problems');

const { n: schools } = await one('select count(*)::int as n from schools');
check(schools === catalog.schools.length, `schools loaded: ${schools}`);

const { n: gradeRows } = await one('select count(*)::int as n from curriculum_topics_by_grade');
check(gradeRows === byGrade.length, `curriculum_topics_by_grade rows match CSV export: ${gradeRows}`);

const { n: flatRows } = await one('select count(*)::int as n from school_curriculum_topics');
check(flatRows === flat.length, `school_curriculum_topics rows match CSV export: ${flatRows}`);

const { n: noNational } = await one(`
  select count(*)::int as n from schools s
  where not exists (select 1 from school_systems ss where ss.school_slug = s.slug and ss.system_code = 'national')`);
check(noNational === 0, 'every school has the national system');

const years = (await db.query(`select system_code, array_agg(distinct year order by year) as grades
                               from curriculum_topics_by_grade group by system_code order by system_code`)).rows;
for (const { system_code: sys, grades } of years) {
  const full = JSON.stringify(grades) === JSON.stringify([2, 3, 4, 5, 6, 7, 8]);
  check(full, `${sys} covers every year 2-8 (has ${grades.join(',')})`);
}

const subjects = (await db.query(`select system_code, array_agg(distinct subject_code order by subject_code) as s
                                  from curriculum_topics_by_grade group by system_code order by system_code`)).rows;
console.log('      subjects per system:', subjects.map((r) => `${r.system_code}=${r.s.join('/')}`).join('  '));

const sample = await one(`select topic from school_curriculum_topics
                          where school = 'Cairo American College' and year = 4 and subject = 'math' and topic_code = '4.NF.B'`);
check(!!sample, 'spot check: Cairo American College, year 4 math has CCSS 4.NF.B');

const ms = await one(`select count(distinct year)::int as n from curriculum_topics_by_grade where topic_code = 'MS-PS4'`);
check(ms.n === 3, 'NGSS middle-school band expands to years 6, 7, and 8');

const verified = (await db.query(`select code from curricula where verified_on is not null order by code`)).rows.map((r) => r.code);
check(JSON.stringify(verified) === JSON.stringify(['eg-moe-textbooks', 'us-ccss-math', 'us-ngss']), `verified curricula: ${verified.join(', ') || 'none'}`);

// National: real textbook syllabi replace placeholders, never duplicate them.
const dup = await one(`select count(*)::int as n from (
  select year, subject_code from curriculum_topics_by_grade where system_code = 'national'
  group by year, subject_code having count(distinct curriculum_code) > 1) d`);
check(dup.n === 0, 'national: no grade/subject has both textbook data and a placeholder');

const ss5 = await one(`select topic, term, academic_year, source_url from curriculum_topics_by_grade
                       where system_code = 'national' and year = 5 and topic_code = 'SS5-T1-U2-L1'`);
check(ss5?.topic === 'عوامل قيام الحضارة المصرية القديمة' && ss5.term === 1 && ss5.academic_year === '2026/2027'
      && ss5.source_url.endsWith('Social_studies_prim5_t1.pdf'), 'national grade 5 social studies comes from the 2026/2027 Ministry book');

const ar8 = await one(`select count(*)::int as n from curriculum_topics_by_grade
                       where system_code = 'national' and year = 8 and subject_code = 'arabic' and curriculum_code = 'eg-moe-textbooks' and term = 1`);
check(ar8.n === 24, `national grade 8 Arabic has the book's 24 topics (got ${ar8.n})`);

const ar5 = await one(`select count(*)::int as n, min(academic_year) as y from curriculum_topics_by_grade
                       where system_code = 'national' and year = 5 and subject_code = 'arabic' and term = 1`);
check(ar5.n === 23 && ar5.y === '2026/2027', `national grade 5 Arabic has the 2026/2027 book's 23 topics (got ${ar5.n})`);

const arYears = (await db.query(`select distinct year from curriculum_topics_by_grade
                                   where curriculum_code = 'eg-moe-textbooks' and subject_code = 'arabic' order by year`)).rows.map((r) => r.year);
check(JSON.stringify(arYears) === JSON.stringify([2, 3, 4, 5, 6, 7, 8]), `national Arabic comes from Ministry books for every year 2-8 (has ${arYears.join(',')})`);

const rel = (await db.query(`select subject_code, array_agg(distinct year order by year) as y from curriculum_topics_by_grade
                              where subject_code like 'religion-%' group by subject_code order by subject_code`)).rows;
check(rel.length === 2 && rel.every((r) => r.y.length >= 5), `religion: both Islamic and Christian tracks loaded (${rel.map((r) => r.subject_code + '=' + r.y.join(',')).join('  ')})`);

const noUrl = await one(`select count(*)::int as n from syllabi where curriculum_code = 'eg-moe-textbooks' and (source_url is null or source_url not like 'https://elearnningcontent.blob.core.windows.net/%')`);
check(noUrl.n === 0, 'every national textbook syllabus links to its Ministry book');

const natLow = await one(`select count(*)::int as n from curricula where system_code = 'national' and confidence <> 'high'`);
check(natLow.n === 0, 'national: no placeholder or low-confidence curricula remain');

const ssYears = (await db.query(`select distinct year from curriculum_topics_by_grade
                                  where system_code = 'national' and subject_code in ('social-studies', 'discover') order by year`)).rows.map((r) => r.year);
check(JSON.stringify(ssYears) === JSON.stringify([2, 3, 4, 5, 6, 7, 8]), `national social studies (or Discover) covers every year 2-8 (has ${ssYears.join(',')})`);

const d3 = await one(`select count(*)::int as n from curriculum_topics_by_grade where year = 3 and subject_code = 'discover'`);
check(d3.n === 12, `national grade 3 Discover has 12 chapters (got ${d3.n})`);

const g3 = await one(`select topic from curriculum_topics_by_grade where year = 3 and topic_code = '3-LS2, 3-LS4'`);
check(g3?.topic === 'Interdependent Relationships in Ecosystems: Environmental Impacts on Organisms', 'NGSS grade 3 topic uses the official name');

const french = await one(`select grade_label from curriculum_topics_by_grade where system_code = 'french' and year = 4 limit 1`);
check(french?.grade_label === 'CM1', 'French grade 4 is labelled CM1');

// Editions: a superseded edition stays in syllabus_editions but never shows in the catalog views.
{
  const before = (await one('select count(*)::int as n from curriculum_topics_by_grade')).n;
  await db.exec(`insert into syllabi (curriculum_code, subject_code, grade_min, grade_max, name, term, academic_year, source_url, edition_status)
                 select curriculum_code, subject_code, grade_min, grade_max, name, term, '2024/2025', source_url, 'superseded'
                 from syllabi where curriculum_code = 'eg-moe-textbooks' and subject_code = 'social-studies' and grade_min = 5 and term = 1`);
  await db.exec(`insert into topics (syllabus_id, ordinal, code, strand, title, title_en)
                 select (select id from syllabi where academic_year = '2024/2025' and edition_status = 'superseded' limit 1), ordinal, code, strand, title, title_en
                 from topics where syllabus_id = (select id from syllabi where curriculum_code = 'eg-moe-textbooks' and subject_code = 'social-studies' and grade_min = 5 and term = 1 and edition_status = 'current')`);
  const after = (await one('select count(*)::int as n from curriculum_topics_by_grade')).n;
  const eds = (await one(`select count(*)::int as n from syllabus_editions where subject_code = 'social-studies' and grade_min = 5 and term = 1`)).n;
  check(after === before && eds === 2, `superseded editions are kept (${eds} editions) but hidden from catalog views (${before} rows before and after)`);
  let dupBlocked = false;
  try {
    await db.exec(`insert into syllabi (curriculum_code, subject_code, grade_min, grade_max, name, term, academic_year, edition_status)
                   select curriculum_code, subject_code, grade_min, grade_max, name, term, '2099/2100', 'current'
                   from syllabi where curriculum_code = 'eg-moe-textbooks' and subject_code = 'social-studies' and grade_min = 5 and term = 1 and edition_status = 'current'`);
  } catch { dupBlocked = true; }
  check(dupBlocked, 'database refuses a second current edition of the same syllabus');
}

// Read-only for app roles: select works, writes are refused by RLS.
await db.exec('set role anon');
const { n: anonRead } = await one('select count(*)::int as n from topics');
check(anonRead > 0, 'anon role can read topics');
let writeBlocked = false;
try {
  await db.exec(`insert into systems (code, name) values ('x', 'x')`);
} catch {
  writeBlocked = true;
}
check(writeBlocked, 'anon role cannot insert into catalog tables');
await db.exec('reset role');

await db.close();
if (failures) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log('\nAll catalog checks passed.');
