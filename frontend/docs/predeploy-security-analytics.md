# Predeploy Security & Analytics Pass

Status: Ready for final review before real deployment

## Security Checklist

- [x] Public content reads are limited to rows with `status = published`.
- [x] RLS is enabled on tenant/content/progress/PvP tables.
- [x] Tenant editors are scoped through `tenant_memberships`.
- [x] Frontend uses only `VITE_SUPABASE_ANON_KEY`; service-role keys must never be shipped.
- [ ] Move Gemini calls from `src/services/geminiService.ts` to the authenticated FastAPI `/chat` endpoints; every `VITE_*` value is bundled into browser JavaScript.
- [x] `.env`, `.env.*`, and `*.local` are ignored by git.
- [x] `.env.example` documents required public env vars.
- [x] No temporary premium reset remains in `src/app/App.tsx`.
- [ ] Add route guard for protected app routes before production.
- [ ] Add server-side validation for editor writes if using a custom admin API.
- [ ] Run migrations 001 and 002 in a real Supabase project and verify RLS policies with anon/editor users.
- [ ] Align FastAPI with `HEART_POLICY` v3 (25 max, -1 per wrong answer, +1/5 minutes, daily +5 recovery).
- [ ] Persist `practice` completion in the account progress returned after login.

## Analytics Events To Implement

The app already has the product points where these should fire:

- `lesson_start`: when opening `/lesson/:id` or `/story/:id`.
- `quiz_answer`: after a lesson or arena answer.
- `lesson_complete`: inside `completeLesson`.
- `pvp_match_complete`: when PvP enters result state.
- `content_loaded`: after Supabase content provider succeeds or falls back to mock.

Recommended event table:

```sql
create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

## Deployment Gate

Do not deploy to paying users until:

1. Supabase migration and seed have run successfully.
2. Anon user can read published content only.
3. Editor user can modify only their tenant.
4. Lesson, Story, PvP, Home, Collection render from Supabase content.
5. Temporary premium reset is removed.
6. FastAPI and frontend use the same energy/progress policy.
7. Analytics captures lesson completion and PvP completion.
