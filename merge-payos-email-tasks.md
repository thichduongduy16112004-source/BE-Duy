# Executable Engineering Tasks — Merge PAYOS / Email / Google / Frontend

Source plan: [merge-payos-email.md](file:///C:/Users/LECOO/Downloads/EXE/BE-Duy/merge-payos-email.md)

## Guardrails for every task

- Do not edit `history_ai/`, RAG, Gemini, `gemini_chat`, or RAG/Gemini backend files.
- Do not merge incoming `historyalive-admin/` into BASE `historyalive-admin/`.
- Before editing a file, read BASE and incoming versions.
- After each task, report:
  - ✅ Đã làm
  - ⏭️ Tiếp theo
  - ⚠️ Cần lưu ý
  - 🚫 Bỏ qua

---

## Task M00 — Create merge safety branch

**Files affected:** none.

**Input:**
- BASE repo: `C:/Users/LECOO/Downloads/EXE/BE-Duy`

**Steps:**
1. Check current git branch and working tree status.
2. If not already on a safe merge branch, create `merge-payos-email-frontend`.
3. Do not stage or commit anything.

**Acceptance criteria:**
- Current branch is `merge-payos-email-frontend`, or user explicitly chose another branch.
- Working tree state is recorded before merge.
- No project code files changed.

**Independent verification:**
```powershell
git branch --show-current
git status --short
```

---

## Task M01 — Capture protected-path baseline hashes

**Files affected:**
- `merge-protected-baseline.json`

**Input:**
- BASE protected paths:
  - `history_ai/`
  - `backend/rag/`
  - `historyalive-admin/`

**Steps:**
1. Generate SHA256 hashes for protected paths.
2. Save to `merge-protected-baseline.json`.
3. Do not modify protected paths.

**Acceptance criteria:**
- Baseline file contains path + hash for protected files.
- `history_ai/`, `backend/rag/`, `historyalive-admin/` unchanged during task.

**Independent verification:**
```powershell
Test-Path .\merge-protected-baseline.json
```

---

## Task M02 — Write duplicate-file manifest

**Files affected:**
- `merge-duplicate-manifest.md`

**Input:**
- Hash compare result: 196 identical files.

**Steps:**
1. Re-run read-only hash compare between BASE and incoming folder.
2. Write identical file list to manifest.
3. Mark delete action as `PENDING USER APPROVAL`.

**Acceptance criteria:**
- Manifest lists identical files only.
- No files are deleted.
- Excludes `.git`, `node_modules`, `dist`, `.venv`, `__pycache__`, `.rag_index`.

**Independent verification:**
```powershell
Test-Path .\merge-duplicate-manifest.md
```

---

## Task M03 — Replace frontend folder only

**Files affected:**
- `frontend/**`

**Input:**
- Incoming: `C:/Users/LECOO/Downloads/EXE/BE-Duy-1-PAYOS_EMAIL_GG_ADMIN_FE/frontend`
- BASE: `C:/Users/LECOO/Downloads/EXE/BE-Duy/frontend`

**Steps:**
1. Read incoming `frontend/package.json` and BASE `frontend/package.json`.
2. Replace BASE `frontend/` with incoming `frontend/`.
3. Do not change `backend/`, `history_ai/`, or `historyalive-admin/`.
4. Preserve/confirm `.env.example` uses `VITE_API_URL`.

**Acceptance criteria:**
- All changed files are under `frontend/` only.
- `frontend/package.json` exists and has build script.
- `frontend/.env.example` documents `VITE_API_URL`.
- No protected-path hash changes.

**Independent verification:**
```powershell
npm run build
npm audit --audit-level=high
```

---

## Task M04 — Verify admin app stayed untouched

**Files affected:** none.

**Input:**
- Baseline from Task M01.

**Steps:**
1. Re-hash `historyalive-admin/`.
2. Compare with baseline.
3. If any hash differs, stop and report.

**Acceptance criteria:**
- `historyalive-admin/` hash set exactly matches baseline.
- No incoming admin screens are copied.

**Independent verification:**
```powershell
git diff -- historyalive-admin
```

---

## Task M05 — Merge backend config and dependencies

**Files affected:**
- `backend/.env.example`
- `backend/requirements.txt`
- `backend/core/config.py`

**Input:**
- Incoming versions of the same files.
- `be_log.md` v1.2 config requirements.

**Steps:**
1. Read BASE and incoming versions of each file.
2. Add non-secret keys for:
   - Resend API
   - backend URL
   - PayOS
   - Google OAuth
3. Add required Python dependencies.
4. Do not copy real `.env` secrets.
5. Do not modify RAG/Gemini config keys.

**Acceptance criteria:**
- `.env.example` has placeholders only, no real secrets.
- Existing BASE config keys preserved.
- `requirements.txt` contains needed packages without removing existing deps.
- Importing config succeeds.

**Independent verification:**
```powershell
python -m compileall backend\core\config.py
```

---

## Task M06 — Merge Resend email service

**Files affected:**
- `backend/services/email_service.py`

**Input:**
- Incoming `backend/services/email_service.py`.
- BASE `backend/services/email_service.py`.

**Steps:**
1. Read both versions.
2. Replace SMTP implementation with Resend SDK flow if BASE still uses SMTP.
3. Ensure email verification link points to backend URL.
4. Keep function names expected by `auth_service.py`.

**Acceptance criteria:**
- Email service uses Resend abstraction.
- Missing API key fails safely with clear error/disabled behavior.
- No SMTP credentials required.
- No RAG/Gemini imports introduced.

**Independent verification:**
```powershell
python -m compileall backend\services\email_service.py
```

---

## Task M07 — Merge auth verification and resend endpoint

**Files affected:**
- `backend/services/auth_service.py`
- `backend/routers/auth.py`

**Input:**
- Incoming and BASE auth files.

**Steps:**
1. Read both BASE and incoming files.
2. Merge verify-email redirect behavior.
3. Merge `POST /api/v1/auth/resend-verification`.
4. Keep forgot/reset password routes if present.
5. Do not merge unrelated admin/RAG behavior.

**Acceptance criteria:**
- Verify email returns `307 Temporary Redirect` to frontend login/success target.
- Resend verification route exists and calls service function.
- Existing login/register behavior remains compatible with frontend.
- Invalid users/tokens return safe errors.

**Independent verification:**
```powershell
python -m compileall backend\services\auth_service.py backend\routers\auth.py
```

---

## Task M08 — Merge Google OAuth backend path

**Files affected:**
- `backend/routers/auth.py`
- `backend/core/config.py`
- `backend/models/user.py` if needed

**Input:**
- Incoming `/google` auth implementation.

**Steps:**
1. Read impacted files first.
2. Merge only secure Google token verification logic.
3. Use config-based client ID.
4. Reject fake/invalid tokens.

**Acceptance criteria:**
- `/google` does not trust frontend blindly.
- Google client ID is read from config/env.
- User creation/login path does not break normal auth.
- No hardcoded fake token/client ID.

**Independent verification:**
```powershell
python -m compileall backend\routers\auth.py backend\models\user.py
```

---

## Task M09 — Add PayOS transaction model and router

**Files affected:**
- `backend/models/transaction.py`
- `backend/routers/payments.py`
- `backend/core/config.py`

**Input:**
- Incoming PayOS files.

**Steps:**
1. Read incoming files completely.
2. Add transaction model if not present.
3. Add PayOS payment router.
4. Keep secrets env-based only.
5. Do not include router in `main.py` yet.

**Acceptance criteria:**
- Payment router compiles independently.
- Transaction model compiles.
- No real PayOS secret committed.
- Router imports do not touch RAG/Gemini.

**Independent verification:**
```powershell
python -m compileall backend\models\transaction.py backend\routers\payments.py
```

---

## Task M10 — Merge premium expiry and trial anti-fraud

**Files affected:**
- `backend/core/security.py`
- `backend/routers/users.py`
- `backend/models/user.py`
- `backend/routers/payments.py`

**Input:**
- Incoming premium lifecycle logic.

**Steps:**
1. Read BASE and incoming versions.
2. Merge premium/trial expiry checks into auth/current-user flow.
3. Merge `premium_end_date` extension on PayOS success.
4. Merge trial reissue blocking in user update path.

**Acceptance criteria:**
- Expired premium is revoked server-side.
- PayOS success extends premium by 30 days.
- Trial cannot be reissued after `trial_end_date` exists.
- Existing user fields remain backward compatible.

**Independent verification:**
```powershell
python -m compileall backend\core\security.py backend\routers\users.py backend\routers\payments.py
```

---

## Task M11 — Add quizzes API only

**Files affected:**
- `backend/models/quiz.py`
- `backend/routers/quizzes.py`

**Input:**
- Incoming quiz model/router.

**Steps:**
1. Read incoming quiz files.
2. Confirm no RAG/Gemini dependency.
3. Add MongoDB-backed quiz endpoints.
4. Do not include router in `main.py` yet.

**Acceptance criteria:**
- Quiz router compiles independently.
- Quiz model compiles.
- Endpoints use DB/data layer, not hardcoded frontend-only data.
- No RAG/Gemini imports.

**Independent verification:**
```powershell
python -m compileall backend\models\quiz.py backend\routers\quizzes.py
```

---

## Task M12 — Add progress API only

**Files affected:**
- `backend/routers/progress.py`
- `backend/models/user.py` if progress fields required

**Input:**
- Incoming progress router.

**Steps:**
1. Read incoming progress router.
2. Confirm no RAG/Gemini dependency.
3. Add progress endpoints needed by frontend.
4. Keep heart/practice v3 mismatch documented if backend is not ready.

**Acceptance criteria:**
- Progress router compiles.
- User progress data is user-scoped.
- No global unauthenticated write path.
- No RAG/Gemini imports.

**Independent verification:**
```powershell
python -m compileall backend\routers\progress.py
```

---

## Task M13 — Review lessons API merge safety

**Files affected:**
- `backend/routers/lessons.py`
- `backend/models/lesson.py`

**Input:**
- BASE and incoming lesson files.

**Steps:**
1. Read BASE and incoming `lessons.py` and `lesson.py`.
2. If incoming only adds live MongoDB content endpoints, merge.
3. If it touches RAG/Gemini/content generation, stop and report.

**Acceptance criteria:**
- Lesson endpoints compile.
- Existing lesson behavior preserved or documented.
- No RAG/Gemini dependency.
- API shape matches frontend expectations.

**Independent verification:**
```powershell
python -m compileall backend\routers\lessons.py backend\models\lesson.py
```

---

## Task M14 — Include safe backend routers and CORS

**Files affected:**
- `backend/main.py`

**Input:**
- Routers completed in Tasks M07-M13.

**Steps:**
1. Read BASE and incoming `backend/main.py`.
2. Add production CORS domains.
3. Include only safe routers that passed compile.
4. Do not modify RAG/Gemini router behavior.

**Acceptance criteria:**
- Backend app starts.
- OpenAPI lists expected auth/payment/quiz/progress routes.
- Existing safe routers remain included.
- No RAG/Gemini path changes.

**Independent verification:**
```powershell
python -m compileall backend\main.py
```

---

## Task M15 — Backend smoke and protected diff check

**Files affected:** none.

**Input:**
- Completed backend tasks.

**Steps:**
1. Run backend compile/smoke tests.
2. Compare protected paths against Task M01 baseline.
3. Check git diff for forbidden paths.

**Acceptance criteria:**
- Backend tests pass or failures are documented with exact blocker.
- `history_ai/`, `backend/rag/`, `historyalive-admin/` unchanged.
- No secrets appear in diff.

**Independent verification:**
```powershell
python -m compileall backend
python backend\smoke_test.py
git diff -- history_ai backend/rag historyalive-admin
```

---

## Task M16 — Frontend/API integration smoke

**Files affected:** none.

**Input:**
- Frontend replacement complete.
- Backend safe routers included.

**Steps:**
1. Start frontend dev server if needed.
2. Test login/register UI points at `VITE_API_URL`.
3. Test pricing/payment button reaches backend endpoint.
4. Test quiz/practice route loads static quiz assets.

**Acceptance criteria:**
- Frontend build still passes.
- Login/register screens render.
- Pricing/payment call does not 404.
- Quiz iframe/static page loads.

**Independent verification:**
```powershell
npm run build
```

---

## Task M17 — Final merge report

**Files affected:**
- `merge-execution-report.md`

**Input:**
- Results from all tasks.

**Steps:**
1. Summarize files changed.
2. List skipped files and reasons.
3. List commands run and pass/fail status.
4. List remaining blockers.

**Acceptance criteria:**
- Report contains exact modified file list.
- Protected paths status is explicit.
- User can reproduce verification from report.

**Independent verification:**
```powershell
Test-Path .\merge-execution-report.md
```

## Dependency order

```text
M00 → M01 → M02 → M03 → M04
M05 → M06 → M07 → M08
M09 → M10
M11 → M12 → M13 → M14
M15 → M16 → M17
```

## Stop conditions

Stop immediately and report if:

- Any task requires editing `history_ai/`, `backend/rag/`, Gemini, or current `historyalive-admin/`.
- Incoming file contains real secrets that would be copied.
- Backend router imports RAG/Gemini unexpectedly.
- Protected path hash differs after a task.

## 🎓 Teaching Section

### 📌 Tại sao chia nhỏ như vậy?

Mỗi task chỉ chạm một nhóm file nhỏ để nếu lỗi xảy ra, ta biết chính xác task nào gây lỗi và rollback dễ hơn.

### 🔄 Pattern/Concept đã dùng

Dùng **independent testable increments**: mỗi phần merge phải compile/test riêng trước khi nối vào `main.py` hoặc frontend flow.

### 🔮 Khi nào dùng cách khác?

Nếu có CI tốt và branch sạch, có thể gom frontend replacement thành một PR và backend thành một PR. Ở đây merge thủ công nên cần task nhỏ hơn.

### 💡 Key takeaway

Task tốt phải có đủ 3 phần: file giới hạn, tiêu chí chấp nhận, và cách test độc lập.
