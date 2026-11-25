-- Editions: keep every edition of a syllabus side by side. Exactly one edition per
-- curriculum, subject, grade range, and term is 'current'; older ones are 'superseded'.
-- The catalog views show current editions only; syllabus_editions shows all of them.

alter table public.syllabi
  add column if not exists edition_status text not null default 'current'
    check (edition_status in ('current', 'superseded'));

-- The old uniqueness rule ignored the academic year, so two editions with the same
-- name would collide. Replace it with one that includes the year.
do $$
declare c record;
begin
  for c in
    select con.conname
    from pg_constraint con
    where con.conrelid = 'public.syllabi'::regclass and con.contype = 'u'
  loop
    execute format('alter table public.syllabi drop constraint %I', c.conname);
  end loop;
end $$;

create unique index if not exists syllabi_edition_key
  on public.syllabi (curriculum_code, subject_code, grade_min, grade_max, name, coalesce(academic_year, ''));

-- At most one current edition per curriculum, subject, grade range, and term.
create unique index if not exists syllabi_one_current_edition
  on public.syllabi (curriculum_code, subject_code, grade_min, grade_max, coalesce(term, 0), name)
  where edition_status = 'current';

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
left join public.grade_labels gl on gl.curriculum_code = c.code and gl.grade = g.grade
where s.edition_status = 'current';

create or replace view public.syllabus_editions
with (security_invoker = true) as
select
  s.curriculum_code,
  s.subject_code,
  s.grade_min,
  s.grade_max,
  s.term,
  s.name,
  s.academic_year,
  s.edition_status,
  s.source_url,
  (select count(*) from public.topics t where t.syllabus_id = s.id) as topic_count
from public.syllabi s
order by s.curriculum_code, s.subject_code, s.grade_min, s.term, s.academic_year;
