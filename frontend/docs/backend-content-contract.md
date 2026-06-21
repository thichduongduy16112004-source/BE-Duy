# History Alive Backend Content Contract

Version: 1.2
Status: Draft for Supabase/CMS implementation
Last updated: 2026-06-20 01:04 +07

## Goal

History Alive keeps the current game UI and mechanics, while moving course content and user progress into a backend-managed content layer. Third-party customers can edit units, lessons, review quizzes, practice content, and arena-ready questions without changing React code.

## Remaining Task Map

- TASK-003: Supabase/Postgres content schema and RLS contract. Status: implemented as SQL migration.
- TASK-004: Frontend content provider boundary. Status: implemented with mock provider.
- TASK-005: Seed/import pipeline from current mock content into backend tables. Status: `supabase/seed.sql` mirrors 6 units, 48 learning nodes, and 130 questions.
- TASK-006: CMS admin flow for editors, including draft/publish and preview.
- TASK-007: Supabase provider implementation and environment config. Status: implemented with `supabaseContentProvider`.
- TASK-008: Security and analytics pass before deployment. Status: documented in `predeploy-security-analytics.md`.
- TASK-009: Persist per-user progress and quiz attempts. Status: frontend contract and Supabase state schema prepared; the FastAPI heart limit still needs upgrading from 5 to 25 before production.

## Data Flow

```txt
CMS / Supabase
  -> ContentProvider
  -> contentRepository
  -> Home / Lesson iframe / Practice iframe / Story / PvP / Collection

Quiz iframe / PvP result
  -> backend API
  -> user_progress / quiz_attempts / pvp_matches
  -> Web Admin reports
```

The UI must not read CMS tables directly. Screens call repository methods such as `getAllUnits`, `getLessonById`, `getStoryByLessonId`, `getQuestionsForLesson`, and `getArenaQuestions`.

## Core Tables

- `tenants`: one school, customer, brand, or white-label deployment.
- `tenant_memberships`: editor/admin permissions per tenant.
- `courses`: subject-level container, such as Vietnamese History or English.
- `units`: chapters/eras shown on the campaign map.
- `lessons`: lesson/story/practice/boss/review nodes inside units.
- `story_blocks`: visual-novel scenes and decision blocks.
- `questions`: shared question bank for lessons and arena.
- `user_progress`: per-user lesson completion, best score, attempts, rewards, and last activity.
- `user_learning_state`: per-user XP, gems, streak, 25-heart energy policy, refill timestamps, and daily recovery state.
- `quiz_attempts`: immutable attempts from lessons, review quizzes, practice mode, and optional arena analytics.
- `pvp_matches`: arena attempts, scores, and question snapshots.

## Frontend DTO Shape

### Unit

```ts
type ContentUnit = {
  id: string;
  title: string;
  era: string;
  description: string;
  lessons: ContentLesson[];
  theme fields...
};
```

### Question

```ts
type ContentQuestion = {
  id: string;
  tenantId: string;
  unitId: string;
  lessonId: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  scopes: ("lesson" | "arena" | "flashcard")[];
  status: "draft" | "published";
};
```

### Lesson Kind

```ts
type LessonKind = "lesson" | "story" | "practice" | "boss" | "review";
```

Current content rules:

- Default tenant slug/id in the frontend mock is `ha-tenant`.
- Each unit currently has 8 nodes: 4 lessons, 2 practice nodes, 1 boss, and 1 random review.
- Standard lessons should have 5 questions.
- Practice nodes reuse questions from the two preceding lessons; they do not own a duplicate question bank.
- Review lessons use `type = "review"` and can contain a larger end-of-unit quiz.
- Practice/review iframe content currently lives under `public/quiz/`.

The iframe supports `multiple_choice`, `fill_blank`, and `matching`. Store the discriminator in `questions.question_type`, interactive configuration in `questions.interaction_payload`, and non-MCQ answers in `questions.answer`.

### Story

```ts
type StoryContent = {
  lessonId: string;
  title: string;
  era: string;
  backdrop: { from: string; to: string };
  artEmoji: string;
  scenes: StoryScene[];
  decision?: { question: string; choices: StoryDecisionChoice[] };
};
```

## Arena Sync Rule

The arena never owns separate questions. It requests published questions from the shared question bank where `scopes` includes `arena`.

Recommended selection order:

1. Same tenant.
2. Same grade when enough questions exist.
3. Prefer completed lessons for review mode.
4. Fall back to all published arena-ready questions.
5. Limit to the match size.

## Progress Persistence Rule

Production must not rely only on localStorage. On login, the frontend should load progress from the backend, then hydrate the app state with completed lessons, XP, gems, streak, and subscription flags.

Current frontend energy policy is version 3: 25 hearts maximum, lose 1 on a wrong answer, refill 1 every 5 minutes, one free daily recovery of 5 hearts after reaching zero, and unlimited hearts for Pro. Backend and frontend must use the same constants.

When the quiz iframe posts `QUIZ_FINISHED`, the frontend should call the backend with the attempt payload. The backend should:

1. Insert a row into `quiz_attempts`.
2. Upsert `user_progress` by `tenant_id + user_id + lesson_id`.
3. Update user rewards if the attempt is valid.
4. Return the latest progress snapshot to the frontend.

Recommended attempt modes:

- `lesson`: normal 5-question lesson.
- `review`: end-of-unit review quiz.
- `practice`: practice/exam-training screen.
- `arena`: optional shared analytics for PvP question accuracy.

Existing FastAPI routes are under `VITE_API_URL` (normally `/api/v1`):

- `GET /me/progress`
- `POST /me/quiz-attempts`
- `POST /me/pvp-matches`
- `GET /me/leaderboard`

Before production, backend must count `practice` as a completable node and return the 25-heart policy from `HEART_POLICY`.

## Web Admin Contract

The existing `historyalive-admin` web app should connect to the same database/API. This frontend repository documents the contract and does not duplicate admin screens.

Admin content editor reads/writes:

- `tenants`
- `courses`
- `units`
- `lessons`
- `questions`
- `story_blocks` when story CMS is enabled

Admin reporting reads:

- `user_progress`
- `quiz_attempts`
- `pvp_matches`

Tenant membership must restrict all admin operations to the current tenant.

## CMS Editing Flow

1. Editor logs into CMS for one tenant.
2. Editor creates or edits units, lessons, story blocks, and questions.
3. Draft content is previewable but not shown in production gameplay.
4. Published content becomes visible to frontend reads.
5. Arena pool updates automatically because it reads from `questions.scopes`.

## Security Rules

- Public users can read only published content.
- Editors can create/update/delete content only for tenants where they are members.
- Users can read/write only their own progress, quiz attempts, and PvP match records.
- Tenant editors/admins can read tenant progress reports in web admin.
- Service-role migrations/imports are server-side only; never expose service keys to the browser.

## Implementation Notes

Current frontend uses `supabaseContentProvider` when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` exist. Without those env vars, it falls back to `mockContentProvider`.
