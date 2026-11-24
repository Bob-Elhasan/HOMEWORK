-- Records when and how each curriculum was checked against its official source.
-- A null verified_on means the data has not yet been checked against a primary source.

alter table public.curricula
  add column if not exists verified_on date,
  add column if not exists verified_source text,
  add column if not exists verification_method text;

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
  c.verified_on
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
  ct.verified_on
from public.school_systems ss
join public.schools sc on sc.slug = ss.school_slug
join public.curriculum_topics_by_grade ct on ct.system_code = ss.system_code;
