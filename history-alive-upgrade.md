# History Alive System - Implementation Plan v1.1

> **Dự án:** Nâng cấp History Alive với RAG, Character System & Admin Portal  
> **Phiên bản:** v1.1 - Codebase-aligned implementation plan  
> **Timeline đề xuất:** 18-20 ngày cho bản đầy đủ, 10-12 ngày cho MVP  
> **Team Size:** 1 Full-Stack Developer  
> **Last Updated:** 2026-06-17

---

## 1. Executive Summary

### 1.1 Mục tiêu

Nâng cấp hệ thống History Alive hiện tại thành nền tảng học lịch sử thông minh với:

1. **RAG-based Chat**: Học sinh chat với nhân vật lịch sử dựa trên tư liệu có nguồn.
2. **Character System**: Hỗ trợ nhiều nhân vật, mỗi nhân vật có persona, tri thức, giọng đọc riêng.
3. **Admin Portal**: Quản lý nhân vật, knowledge base, test inference và trạng thái publish.
4. **Stable Gateway**: Backend chính giữ vai trò auth, rate limit, logging và proxy đến RAG service.

### 1.2 Nguyên tắc implementation

- **Không phá flow hiện có**: giữ auth, premium limit và student app đang chạy.
- **Contract-first**: định nghĩa rõ API/SSE/schema trước khi nối frontend.
- **Không hardcode secret**: mọi API key, Mongo URI, service URL đi qua `.env` và config.
- **MongoDB-safe**: xử lý `ObjectId`, index, connection pooling, validation import.
- **Incremental delivery**: backend/RAG chạy được trước, sau đó mới nâng UI và admin.

### 1.3 Trạng thái hiện tại

| Layer | Hiện trạng | Ghi chú |
|---|---|---|
| Student Frontend | React + Vite + Framer Motion | Đã có AI chat, cần tích hợp character/RAG/citations |
| Backend | FastAPI + MongoDB + JWT | Đã có `backend/routers/chat.py`, `backend/routers/admin.py`, `core/config.py` |
| RAG Legacy | `history_ai/backend` | Cần adapter sang MongoDB và chạy service riêng port `8001` |
| Admin Portal | Vite app | Cần hoàn thiện CRUD, import knowledge, infer test |

---

## 2. Scope

### 2.1 MVP Scope

- Student chọn nhân vật lịch sử.
- Student gửi câu hỏi và nhận câu trả lời streaming qua SSE.
- Response có citations từ knowledge chunks.
- Backend check auth và daily limit.
- Admin CRUD nhân vật.
- Admin import JSONL knowledge chunks.
- Admin test infer trước khi publish.

### 2.2 Full Scope

- TTS cho câu trả lời AI.
- Admin dashboard premium UI.
- Knowledge import report chi tiết.
- Health check giữa backend và RAG service.
- Integration tests cho student/admin flow.

### 2.3 Non-goals cho v1.1

- Không làm multi-tenant admin.
- Không làm voice cloning production-grade.
- Không làm vector DB riêng nếu legacy RAG chưa cần.
- Không rewrite toàn bộ backend hiện có.

---

## 3. Architecture Overview

```text
Student App (5173)               Admin Portal (5178)
      |                                  |
      | HTTP/SSE                         | HTTP
      v                                  v
+--------------------------------------------------+
|              BE-Duy FastAPI Backend (8000)       |
|--------------------------------------------------|
| Auth | Rate Limit | Admin Guard | Mongo CRUD     |
| Chat Gateway | RAG Proxy | Serialization        |
+-------------------------+------------------------+
                          |
                          | HTTP/SSE proxy
                          v
+--------------------------------------------------+
|              RAG Service - history_ai (8001)     |
|--------------------------------------------------|
| Character Loader | Knowledge Loader | LLM | TTS   |
+-------------------------+------------------------+
                          |
                          v
+--------------------------------------------------+
|                  MongoDB Atlas                   |
| users | characters | knowledge_chunks | chat_logs |
+--------------------------------------------------+
```

### 3.1 Architecture Decisions

| Decision | Choice | Reason |
|---|---|---|
| RAG location | Separate service on `8001` | Isolate inference workload from auth/backend |
| Backend role | API Gateway | Centralize auth, rate limit, admin guard |
| Source of truth | MongoDB | Characters and knowledge editable by admin |
| Streaming | SSE | Simple browser-native streaming over HTTP |
| Frontend styling | Existing stack first | Avoid introducing Tailwind unless project already uses it |
| Admin auth | Backend JWT + admin role | Reuse existing auth model |

---

## 4. Data Contracts

### 4.1 MongoDB Collections

#### `characters`

```json
{
  "_id": "ObjectId",
  "character_id": "ho_chi_minh",
  "display_name": "Hồ Chí Minh",
  "era": "1890-1969",
  "death_year": 1969,
  "short_bio": "Vietnamese revolutionary leader...",
  "personality_prompt": "Respond as Hồ Chí Minh...",
  "portrait_url": "https://...",
  "tts_voice_id": "vi-VN-default",
  "status": "draft | active | archived",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

Required indexes:

```python
await db["characters"].create_index("character_id", unique=True)
await db["characters"].create_index("status")
```

#### `knowledge_chunks`

```json
{
  "_id": "ObjectId",
  "chunk_id": "hcm-001",
  "character_id": "ho_chi_minh",
  "text": "Historical source text...",
  "fact": "Short cited fact...",
  "source_title": "Tên tư liệu",
  "source_url": "https://...",
  "source_year": "1945",
  "claim_status": "verified | disputed | contextual",
  "created_at": "ISODate"
}
```

Required indexes:

```python
await db["knowledge_chunks"].create_index("character_id")
await db["knowledge_chunks"].create_index("chunk_id", unique=True)
await db["knowledge_chunks"].create_index([("text", "text"), ("fact", "text")])
```

#### `chat_logs`

```json
{
  "_id": "ObjectId",
  "user_id": "string",
  "character_id": "ho_chi_minh",
  "message": "User question",
  "answer": "AI answer",
  "citation_ids": ["hcm-001"],
  "status": "completed | failed",
  "created_at": "ISODate"
}
```

### 4.2 ObjectId Serialization Rule

Every MongoDB document returned to FastAPI responses must be serialized.

```python
def serialize_doc(doc: dict) -> dict:
    if not doc:
        return doc
    doc = dict(doc)
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


def serialize_docs(docs: list[dict]) -> list[dict]:
    return [serialize_doc(doc) for doc in docs]
```

### 4.3 SSE Event Contract

The RAG service and backend gateway must preserve this contract.

#### `start`

```text
event: start
data: {"request_id":"uuid","character_id":"ho_chi_minh"}
```

#### `retrieval`

```text
event: retrieval
data: {"citations":[{"chunk_id":"hcm-001","source_title":"...","fact":"..."}]}
```

#### `token`

```text
event: token
data: {"text":"partial token"}
```

#### `final`

```text
event: final
data: {"answer":"full answer","citations":[...]}
```

#### `error`

```text
event: error
data: {"message":"RAG service unavailable","code":"RAG_UNAVAILABLE"}
```

---

## 5. Environment Configuration

### 5.1 Backend `.env`

```bash
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
GEMINI_API_KEY=...
RAG_SERVICE_URL=http://localhost:8001
FREE_DAILY_CHAT_LIMIT=10
```

### 5.2 RAG Service `.env`

```bash
MONGODB_URI=mongodb+srv://...
GEMINI_API_KEY=...
TTS_API_KEY=...
PORT=8001
```

### 5.3 Config Rule

- Backend must read config from `backend/core/config.py`.
- RAG service should have its own config module if it cannot import backend config safely.
- Do not duplicate secrets in source files.
- Do not commit `.env` values.

---

## 6. Proposed Changes

## Phase 0: Codebase Alignment

**Duration:** 0.5-1 day  
**Goal:** Confirm actual code paths and avoid duplicate routers/services.

### Tasks

- [ ] Verify existing router files:
  - `backend/routers/chat.py`
  - `backend/routers/admin.py`
  - `backend/main.py`
- [ ] Verify auth dependency name and return shape.
- [ ] Verify database dependency from `backend/core/database.py`.
- [ ] Verify config fields in `backend/core/config.py`.
- [ ] Verify frontend token storage key.
- [ ] Verify whether admin app already uses Tailwind. If not, use vanilla CSS/CSS modules.

### Output

- A short implementation checklist before coding.
- No source behavior changes yet.

---

## Phase 1: Backend Gateway Foundation

**Duration:** 3-4 days  
**Goal:** Make backend the stable gateway for chat, characters, admin and rate limits.

### 1.1 Modify Existing Chat Router

#### [MODIFY] `backend/routers/chat.py`

Add or update endpoints without deleting existing working behavior:

```text
GET  /api/v1/characters
POST /api/v1/chat/stream
POST /api/v1/tts
```

Implementation requirements:

- Use existing `get_current_user` dependency.
- Use existing `get_database` dependency.
- Return serialized MongoDB documents.
- Proxy SSE to `RAG_SERVICE_URL`.
- Emit structured SSE `error` event on proxy failure.
- Do not increment daily count if request is rejected before RAG call.
- Log completed/failed chat to `chat_logs`.

### 1.2 Add RAG Client Service

#### [NEW] `backend/services/rag_client.py`

Responsibilities:

- Encapsulate `httpx.AsyncClient` calls.
- Stream `/api/chat/stream` from RAG service.
- Call `/api/tts` if TTS is enabled.
- Convert downstream errors into stable gateway errors.

Recommended behavior:

```python
class RagServiceUnavailable(Exception):
    pass


async def stream_chat(payload: dict):
    # Use configured RAG_SERVICE_URL and safe timeout.
    # Yield raw SSE bytes/chunks.
    pass
```

> Replace `pass` with full implementation during coding. It is shown here only as design pseudocode.

### 1.3 Add Reusable Admin Guard

#### [MODIFY] `backend/routers/admin.py` or [NEW] `backend/core/permissions.py`

Create a reusable dependency:

```python
async def require_admin(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return user
```

Use this in every admin endpoint instead of repeating manual checks.

### 1.4 Add Serialization Utilities

#### [NEW] `backend/core/serializers.py`

Add shared helpers for MongoDB response conversion:

```python
def serialize_doc(doc: dict) -> dict:
    if not doc:
        return doc
    doc = dict(doc)
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


def serialize_docs(docs: list[dict]) -> list[dict]:
    return [serialize_doc(doc) for doc in docs]
```

### 1.5 Add Daily Rate Limit Service

#### [NEW] `backend/services/rate_limit_service.py`

Requirements:

- Free users limited by `FREE_DAILY_CHAT_LIMIT`.
- Premium users bypass daily limit.
- Count resets by local date or UTC date consistently.
- Store both count and date.
- Use atomic MongoDB update where possible.

Suggested user fields:

```json
{
  "daily_chat_count": 4,
  "daily_chat_date": "2026-06-17"
}
```

### 1.6 Backend Admin API

#### [MODIFY] `backend/routers/admin.py`

Add or align endpoints:

```text
GET    /api/v1/admin/characters
GET    /api/v1/admin/characters/{character_id}
POST   /api/v1/admin/characters
PUT    /api/v1/admin/characters/{character_id}
DELETE /api/v1/admin/characters/{character_id}
POST   /api/v1/admin/knowledge/upload
POST   /api/v1/admin/infer
```

Validation requirements:

- `character_id` is immutable after create.
- Duplicate `character_id` returns `400`.
- Delete should soft-delete/archive by default, not hard delete.
- Knowledge upload validates each JSONL line.
- Import should deduplicate by `chunk_id`.
- Return report: inserted, skipped, failed.

---

## Phase 2: RAG Service Adapter

**Duration:** 3-4 days  
**Goal:** Make `history_ai/backend` load characters and knowledge from MongoDB.

### 2.1 RAG Service Config

#### [NEW] `history_ai/backend/core/config.py` or equivalent

Requirements:

- Read `MONGODB_URI`, `GEMINI_API_KEY`, `PORT`, optional `TTS_API_KEY` from env.
- Support new `AQ.` Google AI Studio API keys as valid strings.
- Do not validate Gemini keys by old prefix assumptions.

### 2.2 MongoDB Connection Lifecycle

#### [NEW] `history_ai/backend/core/database.py` or equivalent

Requirements:

- Create MongoDB client once on app startup.
- Reuse connection pool.
- Close client on shutdown.
- Do not create client inside each loader function.

### 2.3 Character and Knowledge Loaders

#### [NEW] `history_ai/backend/loaders/mongodb_loader.py`

Responsibilities:

- `load_character(character_id)` from `characters`.
- `load_chunks(character_id)` from `knowledge_chunks`.
- Only active characters are available for student chat.
- Admin infer can optionally test draft characters.

### 2.4 SSE-Compatible Chat Endpoint

#### [MODIFY] `history_ai/backend/main.py`

Expose or align:

```text
GET  /api/health
POST /api/chat/stream
POST /api/tts
```

Rules:

- Emit events matching section `4.3 SSE Event Contract`.
- Send `retrieval` before first token when citations are available.
- Send `final` with full answer.
- Send `error` event instead of raw traceback.
- Keep CORS limited to local backend/frontend during development.

---

## Phase 3: Student Frontend Enhancement

**Duration:** 4-5 days  
**Goal:** Upgrade student chat with character selector, streaming, citations and optional audio.

### 3.1 API Client

#### [NEW] `frontend/src/services/chatService.ts`

Responsibilities:

- `fetchCharacters()`
- `streamChat(characterId, message, history, handlers, signal)`
- `synthesizeTTS(characterId, text)` if enabled

Implementation rules:

- Use project’s existing API base URL pattern if available.
- Add `Authorization: Bearer <token>` from existing auth storage.
- Wrap async operations in `try/catch`.
- Parse SSE robustly with buffering.
- Handle invalid JSON events without crashing the entire UI.

### 3.2 Components

#### [NEW] `frontend/src/components/chat/CharacterSelector.tsx`

Requirements:

- Show active characters.
- Preserve selected character.
- Loading and empty states.
- Keyboard accessible.

#### [NEW] `frontend/src/components/chat/CitationCard.tsx`

Requirements:

- Show source title, year, fact, status.
- Link source URL safely with `rel="noreferrer"`.
- Collapse/expand citations.
- Handle missing optional fields.

#### [NEW] `frontend/src/components/chat/AudioPlayer.tsx`

Requirements:

- Only render when audio exists.
- User can play/pause.
- Do not autoplay if browser blocks it.
- Handle playback errors.

### 3.3 Chat Screen Integration

#### [MODIFY] `frontend/src/app/screens/AIChatScreen.tsx`

Requirements:

- Keep existing auth/premium UX.
- Replace direct Gemini call with backend RAG stream.
- Display partial tokens smoothly.
- Attach citations to AI message.
- Add abort/cancel support for in-flight stream.
- Show graceful error bubble on SSE error event.

### 3.4 Styling Rule

- If project already uses Tailwind, follow existing utility pattern.
- If not, add vanilla CSS or existing CSS module style.
- Do not introduce Tailwind just for this feature.
- UI should feel premium: warm historical palette, soft depth, readable typography, smooth micro-interactions.

---

## Phase 4: Admin Portal

**Duration:** 5-6 days  
**Goal:** Build usable admin workflow for characters, knowledge and infer testing.

### 4.1 Admin Layout

#### [MODIFY] `historyalive-admin/src/App.tsx`
#### [NEW] `historyalive-admin/src/components/AdminLayout.tsx`

Routes:

```text
/characters
/characters/new
/characters/:id/edit
/knowledge
/infer
```

UI requirements:

- Premium admin shell, not plain default layout.
- Responsive sidebar/topbar.
- Loading, empty, error states.
- Toast or inline feedback after save/import/delete.
- Confirmation modal before archive/delete.

### 4.2 Character Management

#### [NEW] `historyalive-admin/src/pages/CharactersPage.tsx`
#### [NEW] `historyalive-admin/src/pages/CharacterEditPage.tsx`

Requirements:

- List characters with status and chunk count.
- Create character.
- Edit metadata/persona/status.
- Archive character instead of destructive delete.
- Validate required fields before submit.

### 4.3 Knowledge Management

#### [NEW] `historyalive-admin/src/pages/KnowledgePage.tsx`

Requirements:

- Select character.
- Upload JSONL.
- Show import report:
  - inserted
  - skipped duplicates
  - failed rows
- Provide sample JSONL format.

### 4.4 Infer Test

#### [NEW] `historyalive-admin/src/pages/InferTestPage.tsx`

Requirements:

- Select character.
- Ask test question.
- Stream or show final answer.
- Show citations.
- Allow testing draft characters via admin endpoint.

---

## Phase 5: Integration & Verification

**Duration:** 2 days  
**Goal:** Prove the system works end-to-end.

### 5.1 Automated Checks

Run from appropriate project folders:

```powershell
# Backend syntax/type smoke check
python -m compileall backend

# RAG syntax/type smoke check
python -m compileall history_ai/backend

# Frontend checks
npm run lint
npm run build
```

If the repo has custom scripts, use those instead of adding new tooling unnecessarily.

### 5.2 Manual E2E Scenarios

#### Student Flow

1. Login as student.
2. Open AI chat.
3. Select `Hồ Chí Minh`.
4. Ask: `Bác lãnh đạo Cách mạng Tháng Tám như thế nào?`
5. Verify:
   - Stream starts.
   - Citations appear.
   - Final answer is coherent.
   - Daily limit increments.
   - Error state works if RAG service is stopped.

#### Admin Flow

1. Login as admin.
2. Create character `Trần Hưng Đạo`.
3. Upload JSONL chunks.
4. Run infer test.
5. Publish character.
6. Verify character appears in student app.

#### Security Flow

1. Non-admin calls admin endpoints.
2. Expect `403`.
3. Unauthenticated user calls chat.
4. Expect auth error.
5. Free user exceeds daily limit.
6. Expect limit error.

### 5.3 Acceptance Criteria

- [ ] Student can chat with at least 3 active characters.
- [ ] Each character can load 100+ knowledge chunks.
- [ ] First token appears under 3 seconds in normal local dev.
- [ ] SSE stream survives normal token flow and returns final event.
- [ ] Admin can CRUD/archive characters.
- [ ] Admin can upload JSONL and see import report.
- [ ] Admin-only routes reject non-admin users.
- [ ] No hardcoded secrets in source files.
- [ ] MongoDB `ObjectId` never breaks API responses.

---

## 7. Risk Mitigation

| Risk | Impact | Mitigation |
|---|---:|---|
| RAG service unavailable | High | Gateway emits SSE error event and UI shows retry |
| MongoDB connection exhaustion | High | Reuse client pool, no per-request client creation |
| ObjectId serialization crash | High | Central serializer helpers |
| Daily limit never resets | Medium | Store date with count and reset by date |
| Admin endpoint accidentally public | High | Reusable `require_admin` dependency |
| JSONL import corrupt data | Medium | Validate each row and report failed rows |
| Frontend/backend SSE mismatch | High | Contract-first event schema |
| Google AI Studio `AQ.` key rejected | Medium | Treat API key as opaque string, no prefix validation |
| UI becomes too basic | Medium | Add premium design pass after functional MVP |

---

## 8. Recommended Implementation Order

1. **Phase 0** - Confirm actual codebase contracts.
2. **Phase 1.4** - Add serializers first.
3. **Phase 1.3** - Add admin guard.
4. **Phase 1.5** - Add rate limit service.
5. **Phase 1.1 + 1.2** - Chat gateway + RAG client.
6. **Phase 2** - RAG MongoDB adapter and SSE endpoint.
7. **Phase 3** - Student frontend integration.
8. **Phase 4** - Admin portal.
9. **Phase 5** - Verification and polish.

---

## 9. Implementation Notes

### 9.1 Avoid These Mistakes

- Do not create duplicate `backend/routers/chat.py` if it already exists.
- Do not hardcode Mongo URI or Gemini API key.
- Do not create MongoDB client per request.
- Do not return raw MongoDB documents with `ObjectId`.
- Do not use old Gemini key prefix validation; `AQ.` keys are valid.
- Do not introduce Tailwind unless the project already uses it or the user approves.
- Do not increment chat count for failed validation/auth requests.
- Do not expose admin endpoints without `require_admin`.

### 9.2 Definition of Done

A phase is done only when:

- Code compiles/builds.
- Key happy path works manually.
- Error path is handled.
- No secrets are added to source.
- Relevant README or plan notes are updated if behavior changes.

---

## 10. Ready-for-Implementation Status

**Status:** Ready after Phase 0 confirmation.  
**Approval recommendation:** Approved for implementation with v1.1 constraints.  
**First coding target:** backend serializers, admin guard, rate limit service, then chat gateway.
