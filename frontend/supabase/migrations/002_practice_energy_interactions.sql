-- Bring existing History Alive databases in line with the current frontend.
-- Safe to run after 001_content_schema.sql.

alter table public.lessons
  drop constraint if exists lessons_type_check;

alter table public.lessons
  add constraint lessons_type_check
  check (type in ('lesson', 'story', 'boss', 'review', 'practice'));

alter table public.questions
  add column if not exists question_type text not null default 'multiple_choice';

alter table public.questions
  drop constraint if exists questions_question_type_check;

alter table public.questions
  add constraint questions_question_type_check
  check (question_type in ('multiple_choice', 'fill_blank', 'matching'));

alter table public.questions
  add column if not exists interaction_payload jsonb not null default '{}'::jsonb;

create table if not exists public.user_learning_state (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  gems integer not null default 0 check (gems >= 0),
  streak integer not null default 0 check (streak >= 0),
  hearts integer not null default 5 check (hearts between 0 and 5),
  max_hearts integer not null default 5 check (max_hearts = 5),
  heart_policy_version integer not null default 3,
  last_heart_update timestamptz not null default now(),
  last_free_recovery_date date,
  has_depleted_hearts_today boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

alter table public.quiz_attempts
  add column if not exists hearts_before integer;

alter table public.quiz_attempts
  add column if not exists hearts_after integer;

create index if not exists idx_learning_state_user
  on public.user_learning_state(tenant_id, user_id);

drop trigger if exists touch_user_learning_state_updated_at on public.user_learning_state;
create trigger touch_user_learning_state_updated_at
  before update on public.user_learning_state
  for each row execute function public.touch_updated_at();

alter table public.user_learning_state enable row level security;

drop policy if exists "Users read their own learning state" on public.user_learning_state;
create policy "Users read their own learning state" on public.user_learning_state
  for select using (user_id = auth.uid());

drop policy if exists "Users create their own learning state" on public.user_learning_state;
create policy "Users create their own learning state" on public.user_learning_state
  for insert with check (user_id = auth.uid());

drop policy if exists "Users update their own learning state" on public.user_learning_state;
create policy "Users update their own learning state" on public.user_learning_state
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "Editors read tenant learning state" on public.user_learning_state;
create policy "Editors read tenant learning state" on public.user_learning_state
  for select using (public.is_tenant_editor(tenant_id));
