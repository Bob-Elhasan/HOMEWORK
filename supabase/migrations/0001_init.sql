-- Phase 0: family and child model with Row Level Security.
-- Later migrations add lessons, attempts, xp, groups, reviews, and consent.

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- One row per authenticated parent. Parents own a family.
create table if not exists public.parents (
  id uuid primary key references auth.users (id) on delete cascade,
  family_id uuid not null references public.families (id) on delete cascade,
  display_name text,
  voice_consent_at timestamptz,
  created_at timestamptz not null default now()
);

-- Children belong to a family. Only a nickname is shown outside the family.
create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 30),
  grade smallint not null check (grade between 2 and 8),
  curriculum text not null check (curriculum in ('moe-eg', 'alsson-uk-national', 'alsson-us-ccss-ngss')),
  voice_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists children_family_id_idx on public.children (family_id);

-- Helper: the family the signed-in user belongs to. Security definer so policies
-- can use it without granting table access to the caller.
create or replace function public.current_family_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select family_id from public.parents where id = auth.uid()
$$;

alter table public.families enable row level security;
alter table public.parents enable row level security;
alter table public.children enable row level security;

-- Families: a parent can read and update only their own family.
create policy families_select_own on public.families
  for select using (id = public.current_family_id());

create policy families_update_own on public.families
  for update using (id = public.current_family_id())
  with check (id = public.current_family_id());

-- Parents: a parent can read and update only their own row.
create policy parents_select_own on public.parents
  for select using (id = auth.uid());

create policy parents_update_own on public.parents
  for update using (id = auth.uid())
  with check (id = auth.uid());

-- Children: a parent manages children in their own family only.
create policy children_select_family on public.children
  for select using (family_id = public.current_family_id());

create policy children_insert_family on public.children
  for insert with check (family_id = public.current_family_id());

create policy children_update_family on public.children
  for update using (family_id = public.current_family_id())
  with check (family_id = public.current_family_id());

create policy children_delete_family on public.children
  for delete using (family_id = public.current_family_id());

-- Sign-up: a new parent creates their own family and parent row in one step.
create or replace function public.create_family_for_new_parent(p_display_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if exists (select 1 from public.parents where id = auth.uid()) then
    raise exception 'parent already has a family';
  end if;

  insert into public.families default values returning id into v_family;
  insert into public.parents (id, family_id, display_name)
  values (auth.uid(), v_family, p_display_name);
  return v_family;
end;
$$;

revoke all on function public.create_family_for_new_parent(text) from public;
grant execute on function public.create_family_for_new_parent(text) to authenticated;
