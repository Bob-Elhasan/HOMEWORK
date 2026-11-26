-- Which term and academic year a syllabus covers, and the exact source document
-- (for the national system, the Ministry-hosted textbook PDF it was read from).

alter table public.syllabi
  add column if not exists term smallint check (term in (1, 2)),   -- null = whole year
  add column if not exists academic_year text,                        -- e.g. 2026/2027
  add column if not exists source_url text;

-- New columns go at the end so existing view columns keep their positions.
create or replace view public.curriculum_topics_by_grade
with (security_invoker = true) as
select
  g.grade as year,
  coalesce(gl.label, 'Grade ' || g.grade) as grade_label,
  c.system_code,
  c.code as curriculum_code,
  c.name as curriculum,
  c.kind as curriculum_kind,
  c.confidence,
  s.subject_code,
  s.name as syllabus,
  t.ordinal,
  t.code as topic_code,
  t.strand,
  t.title as topic,
  t.title_en as topic_en,
  c.verified_on,
  s.term,
  s.academic_year,
  coalesce(s.source_url, c.source_url) as source_url
from public.syllabi s
join public.curricula c on c.code = s.curriculum_code
join public.topics t on t.syllabus_id = s.id
cross join lateral generate_series(s.grade_min::int, s.grade_max::int) as g(grade)
left join public.grade_labels gl on gl.curriculum_code = c.code and gl.grade = g.grade;

create or replace view public.school_curriculum_topics
with (security_invoker = true) as
select
  ct.year,
  ct.grade_label,
  sc.slug as school_slug,
  sc.name as school,
  ss.system_code as system,
  ss.basis as system_basis,
  ct.curriculum_code,
  ct.curriculum,
  ct.confidence,
  ct.subject_code as subject,
  ct.syllabus,
  ct.ordinal,
  ct.topic_code,
  ct.strand,
  ct.topic,
  ct.topic_en,
  ct.verified_on,
  ct.term,
  ct.academic_year,
  ct.source_url
from public.school_systems ss
join public.schools sc on sc.slug = ss.school_slug
join public.curriculum_topics_by_grade ct on ct.system_code = ss.system_code;
