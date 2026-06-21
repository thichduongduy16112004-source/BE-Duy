# CMS/Admin Flow Decision

Status: Recommended path

## Recommendation

Use **Supabase Studio first** for MVP content editing, then add **Directus** if third-party customers need a friendlier branded CMS.

Why:

- Supabase is already the backend contract target.
- Supabase Studio can edit `units`, `lessons`, `story_blocks`, `questions`, and read progress tables immediately after migration.
- Directus can sit on top of the same Postgres later without forcing a frontend rewrite.

## Roles

- Owner: manages tenant, billing, admins.
- Admin: manages all content for one tenant.
- Editor: creates/updates lessons, story blocks, questions.
- Viewer: can preview content and reports.

These map to `tenant_memberships.role`.

## Editing Workflow

1. Editor selects tenant.
2. Editor creates/updates a course.
3. Editor creates units and lessons.
   - Normal lessons use `type = lesson`.
   - Two recap nodes use `type = practice`.
   - End-of-unit nodes use `type = boss` and `type = review`.
   - Current standard per unit: 4 lessons + 2 practice + 1 boss + 1 review.
4. Editor adds story blocks:
   - `scene`: character dialogue and lines.
   - `decision`: question and choice outcomes.
5. Editor adds questions:
   - Include `lesson` in `scopes` for lesson quizzes.
   - Include `arena` in `scopes` for Đấu trường.
   - Each normal lesson should have 5 published questions.
6. Editor keeps `status = draft` while reviewing.
7. Editor sets `status = published` when ready.
8. Frontend updates automatically on next content load.

## Practice/Exam Training Content

The current practice screen loads the static quiz module from `public/quiz/` and supports multiple choice, fill blank, and matching. For MVP, team can keep editing `public/quiz/data.js`. For production CMS, move that data behind an API such as `/api/quiz/content` so the existing iframe can read data from the same database instead of a static JS file.

## Progress Reporting Workflow

1. User finishes a lesson, review quiz, practice session, or arena match.
2. Frontend/backend records the attempt in `quiz_attempts` or `pvp_matches`.
3. Backend upserts summary progress in `user_progress`.
4. Web admin reads `user_progress`, `user_learning_state`, `quiz_attempts`, and `pvp_matches` to show completion, XP/gems/streak, the 25-heart energy state, last activity, and score history.

## Preview Rule

Current frontend reads only published content. A future editor preview route should pass an editor token and load draft content through a separate admin-only API, not through the public anon key.

## Directus Upgrade Path

Add Directus only when needed for customer-facing editing:

- Connect Directus to the same Supabase/Postgres database.
- Create collections matching existing tables.
- Configure tenant-scoped roles.
- Hide raw system columns from editors where possible.
- Keep frontend pointed at Supabase/PostgREST or a small backend API.

## Content QA Checklist

- Every published lesson belongs to a published unit.
- Every normal published lesson has 5 published questions.
- Every review lesson uses `type = review`.
- Every published story lesson has at least one `scene` block.
- Every published question has 2-4 options.
- `correct_option_index` is inside the options array.
- Arena-ready questions include `arena` in `scopes`.
- No draft content is visible to anonymous users.
- User progress tables are tenant-scoped and visible only to the owner/admin/editor/viewer of that tenant.
