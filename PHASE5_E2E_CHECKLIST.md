# History Alive Phase 5 E2E Checklist

Use this checklist after starting the local services:

- Backend API: `http://localhost:8000`
- Student frontend: `http://localhost:5173`
- Admin portal: `http://localhost:5178`
- RAG service URL configured through `RAG_SERVICE_URL`

## Automated Verification

Run from the repository root:

```powershell
python backend/scripts/phase5_verify.py --with-builds
```

If all three local services are already running, also run:

```powershell
python backend/scripts/phase5_verify.py --with-live
```

## Student Flow

- [ ] Login as a student.
- [ ] Open the AI chat screen.
- [ ] Select `Hồ Chí Minh` or another active character.
- [ ] Ask: `Bác lãnh đạo Cách mạng Tháng Tám như thế nào?`
- [ ] Verify streaming starts without a full-page refresh.
- [ ] Verify citations appear when the final answer arrives.
- [ ] Verify the answer is coherent and character-specific.
- [ ] Verify audio playback appears only when TTS returns usable audio.
- [ ] Verify daily chat remaining decreases after a successful stream.
- [ ] Stop the RAG service and verify the UI shows a recoverable error state.

## Admin Flow

- [ ] Login as an admin.
- [ ] Open the character management page.
- [ ] Create character `Trần Hưng Đạo` or a test-only slug.
- [ ] Upload a JSONL file with at least one valid knowledge chunk.
- [ ] Confirm the import report shows inserted/skipped/failed counts.
- [ ] Run the infer test against the character.
- [ ] Confirm citations appear in the infer result.
- [ ] Publish the character by setting status to `active`.
- [ ] Confirm the character appears in the student app selector.
- [ ] Archive the test character when done.

## Security Flow

- [ ] Call an admin endpoint without a token and expect `401`.
- [ ] Call an admin endpoint with a student token and expect `403`.
- [ ] Call chat stream without a token and expect an auth error.
- [ ] Exceed the free daily limit and expect a clear limit error.
- [ ] Confirm no raw MongoDB `ObjectId` appears in API JSON responses.
- [ ] Confirm no API secrets are committed in source files.

## Acceptance Snapshot

- [ ] Student can chat with at least 3 active characters.
- [ ] Each production character can load 100+ knowledge chunks.
- [ ] First token appears under 3 seconds in normal local dev.
- [ ] SSE stream returns a final event.
- [ ] Admin can CRUD/archive characters.
- [ ] Admin can upload JSONL and see import report.
- [ ] Admin-only routes reject non-admin users.
