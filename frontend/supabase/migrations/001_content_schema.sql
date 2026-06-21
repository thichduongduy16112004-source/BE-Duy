-- History Alive content backend schema.
-- Designed for Supabase/Postgres and a future Headless CMS.

create extension if not exists "pgcrypto";

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  domain text unique,
  logo_url text,
  theme_config jsonb not null default '{}'::jsonb,
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenant_memberships (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  subject text not null default 'history',
  grade_range text[] not null default '{}'::text[],
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, subject, title)
);

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  legacy_id text,
  title text not null,
  era text,
  description text,
  order_index integer not null default 0,
  theme jsonb not null default '{}'::jsonb,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, legacy_id)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  unit_id uuid not null references public.units(id) on delete cascade,
  legacy_id text,
  title text not null,
  type text not null check (type in ('lesson', 'story', 'boss', 'review', 'practice')),
  xp integer not null default 0,
  order_index integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, legacy_id)
);

create table if not exists public.story_blocks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  block_type text not null check (block_type in ('scene', 'decision')),
  content jsonb not null,
  order_index integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, block_type, order_index)
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  unit_id uuid references public.units(id) on delete set null,
  lesson_id uuid references public.lessons(id) on delete cascade,
  legacy_id text,
  grade text,
  prompt text not null,
  question_type text not null default 'multiple_choice'
    check (question_type in ('multiple_choice', 'fill_blank', 'matching')),
  options jsonb not null,
  correct_option_index integer,
  answer jsonb,
  interaction_payload jsonb not null default '{}'::jsonb,
  explanation text,
  difficulty text not null default 'easy' check (difficulty in ('easy', 'medium', 'hard')),
  tags text[] not null default '{}'::text[],
  scopes text[] not null default array['lesson']::text[],
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, legacy_id)
);

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  completed_at timestamptz,
  best_score integer not null default 0,
  total_questions integer not null default 0,
  correct_answers integer not null default 0,
  max_streak integer not null default 0,
  attempts_count integer not null default 0,
  xp_earned integer not null default 0,
  hearts_left integer,
  last_attempt_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, user_id, lesson_id)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  mode text not null check (mode in ('lesson', 'review', 'practice', 'arena')),
  unit_legacy_id text,
  lesson_legacy_id text,
  total_questions integer not null default 0,
  correct_answers integer not null default 0,
  wrong_answers integer not null default 0,
  max_streak integer not null default 0,
  xp_earned integer not null default 0,
  gems_earned integer not null default 0,
  completed boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.pvp_matches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  opponent_user_id uuid references auth.users(id) on delete set null,
  question_ids uuid[] not null default '{}'::uuid[],
  user_score integer not null default 0,
  opponent_score integer not null default 0,
  result text check (result in ('win', 'draw', 'loss')),
  created_at timestamptz not null default now()
);

create index if not exists idx_units_tenant_course on public.units(tenant_id, course_id, order_index);
create index if not exists idx_lessons_tenant_unit on public.lessons(tenant_id, unit_id, order_index);
create index if not exists idx_questions_tenant_lesson on public.questions(tenant_id, lesson_id);
create index if not exists idx_questions_scopes on public.questions using gin(scopes);
create index if not exists idx_questions_tags on public.questions using gin(tags);
create index if not exists idx_user_progress_user on public.user_progress(tenant_id, user_id);
create index if not exists idx_user_progress_lesson on public.user_progress(tenant_id, lesson_id);
create index if not exists idx_quiz_attempts_user on public.quiz_attempts(tenant_id, user_id, created_at desc);
create index if not exists idx_quiz_attempts_lesson on public.quiz_attempts(tenant_id, lesson_id, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_tenants_updated_at before update on public.tenants
  for each row execute function public.touch_updated_at();
create trigger touch_courses_updated_at before update on public.courses
  for each row execute function public.touch_updated_at();
create trigger touch_units_updated_at before update on public.units
  for each row execute function public.touch_updated_at();
create trigger touch_lessons_updated_at before update on public.lessons
  for each row execute function public.touch_updated_at();
create trigger touch_story_blocks_updated_at before update on public.story_blocks
  for each row execute function public.touch_updated_at();
create trigger touch_questions_updated_at before update on public.questions
  for each row execute function public.touch_updated_at();
create trigger touch_user_progress_updated_at before update on public.user_progress
  for each row execute function public.touch_updated_at();

create or replace function public.is_tenant_editor(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_memberships
    where tenant_id = target_tenant_id
      and user_id = auth.uid()
      and role in ('owner', 'admin', 'editor')
  );
$$;

alter table public.tenants enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.courses enable row level security;
alter table public.units enable row level security;
alter table public.lessons enable row level security;
alter table public.story_blocks enable row level security;
alter table public.questions enable row level security;
alter table public.user_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.pvp_matches enable row level security;

create policy "Published tenants are readable" on public.tenants
  for select using (status = 'active');

create policy "Members can read memberships" on public.tenant_memberships
  for select using (user_id = auth.uid());

create policy "Published courses are readable" on public.courses
  for select using (status = 'published');
create policy "Editors manage courses" on public.courses
  for all using (public.is_tenant_editor(tenant_id)) with check (public.is_tenant_editor(tenant_id));

create policy "Published units are readable" on public.units
  for select using (status = 'published');
create policy "Editors manage units" on public.units
  for all using (public.is_tenant_editor(tenant_id)) with check (public.is_tenant_editor(tenant_id));

create policy "Published lessons are readable" on public.lessons
  for select using (status = 'published');
create policy "Editors manage lessons" on public.lessons
  for all using (public.is_tenant_editor(tenant_id)) with check (public.is_tenant_editor(tenant_id));

create policy "Published story blocks are readable" on public.story_blocks
  for select using (status = 'published');
create policy "Editors manage story blocks" on public.story_blocks
  for all using (public.is_tenant_editor(tenant_id)) with check (public.is_tenant_editor(tenant_id));

create policy "Published questions are readable" on public.questions
  for select using (status = 'published');
create policy "Editors manage questions" on public.questions
  for all using (public.is_tenant_editor(tenant_id)) with check (public.is_tenant_editor(tenant_id));

create policy "Users read their own progress" on public.user_progress
  for select using (user_id = auth.uid());
create policy "Users write their own progress" on public.user_progress
  for insert with check (user_id = auth.uid());
create policy "Users update their own progress" on public.user_progress
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Editors read tenant progress" on public.user_progress
  for select using (public.is_tenant_editor(tenant_id));

create policy "Users read their own quiz attempts" on public.quiz_attempts
  for select using (user_id = auth.uid());
create policy "Users create their own quiz attempts" on public.quiz_attempts
  for insert with check (user_id = auth.uid());
create policy "Editors read tenant quiz attempts" on public.quiz_attempts
  for select using (public.is_tenant_editor(tenant_id));

create policy "Users read their own pvp matches" on public.pvp_matches
  for select using (user_id = auth.uid() or opponent_user_id = auth.uid());
create policy "Users create their own pvp matches" on public.pvp_matches
  for insert with check (user_id = auth.uid());
create policy "Editors read tenant pvp matches" on public.pvp_matches
  for select using (public.is_tenant_editor(tenant_id));
