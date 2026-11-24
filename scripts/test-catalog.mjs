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
check(JSON.stringify(verified) === JSON.stringify(['us-ccss-math', 'us-ngss']), `verified curricula: ${verified.join(', ') || 'none'}`);

const g3 = await one(`select topic from curriculum_topics_by_grade where year = 3 and topic_code = '3-LS2, 3-LS4'`);
check(g3?.topic === 'Interdependent Relationships in Ecosystems: Environmental Impacts on Organisms', 'NGSS grade 3 topic uses the official name');

const french = await one(`select grade_label from curriculum_topics_by_grade where system_code = 'french' and year = 4 limit 1`);
check(french?.grade_label === 'CM1', 'French grade 4 is labelled CM1');

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
