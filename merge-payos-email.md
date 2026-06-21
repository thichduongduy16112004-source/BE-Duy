# Merge PAYOS / Email / Google / Frontend vào BE-Duy

## Goal

Merge có kiểm soát từ `BE-Duy-1-PAYOS_EMAIL_GG_ADMIN_FE` vào `BE-Duy`, giữ `BE-Duy` làm BASE, tuyệt đối không chạm RAG/Gemini/web admin hiện tại trừ khi user phê duyệt riêng.

## Immutable Rules

- 🚫 Không sửa/xóa `history_ai/`, RAG, Gemini AI, `gemini_chat`.
- 🚫 Không sửa backend phục vụ RAG/Gemini.
- 🚫 Không thay web admin hiện tại trong `historyalive-admin/` theo folder mới.
- ✅ Được thay toàn bộ `frontend/` bằng folder mới sau khi backup/đối chiếu.
- ✅ Được tích hợp backend không liên quan RAG/Gemini: PayOS, Email Resend, Google Auth, auth/user/payment/progress/quizzes nếu an toàn.
- ✅ File trùng 100% chỉ xóa bản dư sau khi đã ghi log.

## Step 1 — Log Classification

### Frontend log: `fe_log.md`

| Mục | Phân loại | Ghi chú |
|---|---|---|
| Static quiz `frontend/noidungtracnghiem` | AN TOÀN | Nằm trong frontend/public hoặc frontend module, không liên quan RAG/Gemini. |
| Đồng bộ React/Vite screens học/game/content | AN TOÀN | Được phép vì user cho thay toàn bộ frontend. |
| Content repository + Supabase scaffold trong frontend | AN TOÀN | Chỉ frontend/docs/schema scaffold. |
| Dependency update Vite/React Router | CẦN KIỂM TRA | Cần build/audit sau copy. |
| `geminiService.ts` blocker | VÙNG CẤM / DỪNG | Không tự sửa Gemini; chỉ ghi nhận blocker production. |
| FastAPI heart/practice blocker | CẦN KIỂM TRA | Chỉ xử lý nếu thuộc backend app chính và không liên quan RAG/Gemini. |
| `historyalive-admin` changes trong folder mới | VÙNG CẤM | User yêu cầu web admin hiện tại không đổi. |

### Backend log: `be_log.md`

| Mục | Phân loại | Ghi chú |
|---|---|---|
| Resend email: `config.py`, `email_service.py`, `auth_service.verify_email` | AN TOÀN | Không liên quan RAG/Gemini. Cần kiểm tra env/secrets. |
| Resend verification endpoint | AN TOÀN | `auth.py`, `auth_service.py`. |
| CORS domain thật trong `main.py` | AN TOÀN | Cần merge không ghi đè router RAG/Gemini nếu có. |
| Admin web tách riêng `historyalive-admin/` | VÙNG CẤM | Không merge admin folder mới. |
| Lessons/quizzes API MongoDB | CẦN KIỂM TRA | Có file mới `lessons.py`, `quizzes.py`; cần đọc từng file trước. |
| PayOS payments | AN TOÀN | `routers/payments.py`, model transaction, config/env. |
| SMTP/forgot/reset password | AN TOÀN | Nhưng log v1.2 thay SMTP bằng Resend, cần ưu tiên Resend. |
| Google OAuth `/google` | AN TOÀN | Cần kiểm tra config và token verify. |
| Premium expiry/trial anti-fraud | AN TOÀN | `security.py`, `users.py`, `payments.py`; cần tránh ghi đè logic hiện có. |
| `backend/rag/*`, `scripts/index_rag.py` | VÙNG CẤM | Không động vào. |

## Step 2 — File Comparison Summary

Hash compare đã chạy read-only, bỏ qua `.git`, `node_modules`, `dist`, `.venv`, `__pycache__`, `.rag_index`.

- `[TRÙNG 100%]`: 196 file.
- `[KHÁC NHAU]`: 48 file.
- `[CHỈ CÓ Ở FOLDER MỚI]`: 84 file.

### Files khác nhau cần plan cụ thể

#### Backend khác nhau

- `backend/.env` — CẦN KIỂM TRA, không copy secrets thẳng.
- `backend/.env.example` — AN TOÀN.
- `backend/main.py` — CẦN KIỂM TRA router/CORS, không đụng RAG/Gemini.
- `backend/requirements.txt` — AN TOÀN nếu thêm `resend`, PayOS deps.
- `backend/core/config.py` — AN TOÀN nếu chỉ env PayOS/Resend/Google/backend URL.
- `backend/core/security.py` — CẦN KIỂM TRA premium expiry/trial.
- `backend/models/user.py` — CẦN KIỂM TRA role/premium/trial/is_verified.
- `backend/routers/auth.py` — CẦN KIỂM TRA email/Google/reset/resend.
- `backend/routers/users.py` — CẦN KIỂM TRA trial anti-fraud.
- `backend/routers/lessons.py` — CẦN KIỂM TRA live content API.
- `backend/routers/chat.py`, `backend/routers/characters.py`, `backend/routers/admin.py` — VÙNG CẦN DỪNG nếu liên quan Gemini/RAG/admin hiện tại.
- `backend/services/auth_service.py` — AN TOÀN nếu auth/email only.
- `backend/services/email_service.py` — AN TOÀN.

#### Frontend khác nhau

Toàn bộ `frontend/` được phép thay theo folder mới, nhưng vẫn phải kiểm API auth/payment/progress sau copy:

- `frontend/package*.json`, `index.html`, `src/main.tsx`.
- `frontend/src/app/App.tsx`, `routes.tsx`, `store.ts`.
- Screens/components/hooks listed by hash compare.

#### Admin khác nhau

- `historyalive-admin/*` — VÙNG CẤM. Không merge.

### Files chỉ có ở folder mới

#### Backend candidate

- AN TOÀN/CẦN KIỂM TRA: `backend/routers/payments.py`, `progress.py`, `quizzes.py`, `admin_auth.py`, models `quiz.py`, `transaction.py`, `audit.py`, `system.py`, scripts migration/index.
- VÙNG CẤM: `backend/scripts/index_rag.py` vì tên/ý nghĩa liên quan RAG.
- CẦN KIỂM TRA: `backend/tests/test_gamification.py`, `scratch/test_payos_and_quizzes.py`.

#### Frontend candidate

- AN TOÀN: `.env.example`, docs, `public/quiz`, `public/noidungtracnghiem`, assets, content layer, forgot/reset screens, Supabase migrations.

#### Admin candidate

- VÙNG CẤM: toàn bộ `historyalive-admin/src/screens/*`, `historyalive-admin/src/store.ts`.

## Executable Engineering Tasks

### Task 0 — Safety branch and backup

- **Files affected:** none or git branch only.
- **Action:** Create/confirm dedicated branch before merge.
- **Acceptance criteria:** Current branch is not main/master or user confirms branch strategy.
- **Stop condition:** If branch cannot be created safely, ask user.

### Task 1 — Duplicate cleanup manifest only

- **Files affected:** `merge-duplicate-manifest.md` only.
- **Action:** Write list of 196 identical files, but do not delete yet.
- **Acceptance criteria:** Manifest includes `[TRÙNG 100%]` files and exclusion rules.
- **Stop condition:** Delete only after user approves manifest.

### Task 2 — Frontend full replacement

- **Files affected:** `frontend/` only.
- **Action:** Replace BASE `frontend/` with incoming `frontend/`.
- **Acceptance criteria:**
  - No file outside `frontend/` changes.
  - `frontend/package.json` scripts available.
  - Existing backend API env uses `VITE_API_URL`, not hardcoded only localhost.
- **Verify:** `npm install` if needed, `npm run build`, `npm audit --audit-level=high` inside `frontend/`.

### Task 3 — Protect admin project

- **Files affected:** none.
- **Action:** Explicitly skip incoming `historyalive-admin/`.
- **Acceptance criteria:** `BE-Duy/historyalive-admin` remains byte-for-byte unchanged from pre-merge snapshot.
- **Verify:** Hash compare before/after for `historyalive-admin/`.

### Task 4 — Backend env/dependencies merge

- **Files affected:**
  - `backend/.env.example`
  - `backend/requirements.txt`
  - `backend/core/config.py`
- **Action:** Add non-secret config keys for Resend, Backend URL, PayOS, Google OAuth.
- **Acceptance criteria:**
  - No real secrets copied from incoming `.env`.
  - Existing keys preserved.
  - No RAG/Gemini env modified.
- **Verify:** Python import config succeeds.

### Task 5 — Email Resend + auth verification

- **Files affected:**
  - `backend/services/email_service.py`
  - `backend/services/auth_service.py`
  - `backend/routers/auth.py`
- **Action:** Merge Resend sending, `/resend-verification`, verify-email redirect, forgot/reset if missing.
- **Acceptance criteria:**
  - Register creates unverified user and sends email through Resend service abstraction.
  - Verify endpoint redirects 307 to frontend login.
  - Resend verification endpoint returns expected status.
- **Verify:** Backend auth smoke or targeted pytest/curl.

### Task 6 — Google OAuth

- **Files affected:**
  - `backend/routers/auth.py`
  - `backend/core/config.py`
  - possibly `backend/models/user.py`
- **Action:** Merge secure Google token verification only.
- **Acceptance criteria:**
  - Fake/invalid token rejected.
  - Valid Google payload path creates/logs in user.
  - No hardcoded fake client ID.
- **Verify:** Unit test with mocked Google tokeninfo response.

### Task 7 — PayOS payments and premium lifecycle

- **Files affected:**
  - `backend/routers/payments.py`
  - `backend/models/transaction.py`
  - `backend/core/config.py`
  - `backend/core/security.py`
  - `backend/routers/users.py`
  - `backend/models/user.py`
- **Action:** Merge PayOS create link/webhook, 30-day premium, premium/trial expiry checks.
- **Acceptance criteria:**
  - Create payment returns PayOS checkout link.
  - Webhook success extends `premium_end_date` 30 days.
  - Expired premium/trial is revoked server-side.
  - Trial cannot be reissued if `trial_end_date` exists.
- **Verify:** Existing/new payment smoke tests.

### Task 8 — Lessons/quizzes/progress APIs

- **Files affected:**
  - `backend/routers/lessons.py`
  - `backend/routers/quizzes.py`
  - `backend/routers/progress.py`
  - `backend/models/lesson.py`
  - `backend/models/quiz.py`
- **Action:** Merge only live content/progress endpoints needed by frontend.
- **Acceptance criteria:**
  - Endpoints return MongoDB-backed data.
  - No dependency on RAG/Gemini.
  - Practice completion/heart policy aligns with frontend v3 or is explicitly documented as remaining blocker.
- **Verify:** Curl/list endpoints and targeted tests.

### Task 9 — Backend main router/CORS include

- **Files affected:** `backend/main.py` only.
- **Action:** Include safe routers from Tasks 5-8 and production CORS domains.
- **Acceptance criteria:**
  - No RAG/Gemini router changes.
  - Existing routers still included.
  - CORS includes localhost + production domains.
- **Verify:** Backend starts and OpenAPI includes expected safe routes.

### Task 10 — Final verification

- **Files affected:** none.
- **Action:** Run verification after all approved tasks.
- **Acceptance criteria:**
  - Frontend build passes.
  - Backend smoke tests pass.
  - RAG/Gemini files unchanged by hash.
  - Admin project unchanged by hash.
  - Payment/email/auth endpoints smoke pass.

## Open Questions Before Implementation

> [!IMPORTANT]
> Có 3 điểm cần user xác nhận trước khi code:

1. Có cho phép tôi tạo branch mới trong `BE-Duy` trước khi merge không? Tên đề xuất: `merge-payos-email-frontend`.
2. Với 196 file trùng 100%, bạn muốn xóa bản dư trong folder mới `BE-Duy-1-PAYOS_EMAIL_GG_ADMIN_FE` hay chỉ ghi manifest và giữ nguyên folder mới làm nguồn backup?
3. Frontend: bạn xác nhận thay toàn bộ `BE-Duy/frontend/` bằng incoming `frontend/`, kể cả khi một số UI/flow cũ biến mất?

## Verification Commands

Chỉ chạy sau khi user approve implementation:

```powershell
# Frontend
npm install
npm run build
npm audit --audit-level=high

# Backend
python -m compileall backend
python backend\smoke_test.py

# RAG/Admin protection
# Hash compare protected paths before/after
```

## Reporting Format During Execution

Sau mỗi bước sẽ báo cáo đúng format user yêu cầu:

```text
✅ Đã làm: ...
⏭️ Tiếp theo: ...
⚠️ Cần lưu ý: ...
🚫 Bỏ qua: ...
```

## 🎓 Teaching Section

### 📌 Tại sao làm cách này?

Merge kiểu này có rủi ro cao vì folder mới chứa cả frontend, backend, admin, và một số file liên quan RAG. Vì vậy phải chia thành vùng được phép/vùng cấm, rồi merge từng mục có kiểm chứng thay vì copy đè toàn bộ.

### 🔄 Pattern/Concept đã dùng

Áp dụng pattern **Controlled Merge with Guardrails**:

```text
Read logs → classify safety → hash compare → protect forbidden zones → merge one component → verify → next component
```

### 🔮 Khi nào dùng cách khác?

Nếu project có git history sạch và branch chuẩn, có thể dùng `git merge` hoặc `git cherry-pick`. Ở đây dùng manual controlled merge vì user có vùng cấm tuyệt đối và hai folder có nhiều thay đổi lẫn nhau.

### 💡 Key takeaway

Không merge theo folder trước. Merge theo **ý nghĩa thay đổi** trước: frontend, email, auth, payment, progress. Cách này giảm nguy cơ làm hỏng RAG/Gemini/admin.
