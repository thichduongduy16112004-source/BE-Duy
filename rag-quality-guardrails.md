# RAG Admin Review Learning Plan

## Goal

Cải tiến RAG bằng vòng lặp: Admin test câu hỏi → review đúng/sai → nếu RAG/Gemini đúng thì save to RAG → nếu sai thì lưu rejected/correction → nhập câu chuẩn + nguồn → export JSONL → rebuild RAG → lần sau trả lời tốt hơn và có nguồn xác thực.

## Current Implementation Status

- [x] Phase 0: Define feedback schema and add regression cases in `history_ai/backend/smoke_test.py`  
  Verified: approved/rejected/missing-source cases are tested.

- [x] Phase 1: Add review feedback persistence foundation  
  Implemented: append-only JSONL storage in `history_ai/review_feedback/feedback_store.py` with source validation and status validation.

- [x] Phase 2: Add Admin review APIs in `history_ai/backend/main.py`  
  Implemented:
  - `POST /admin/review-feedback`
  - `GET /admin/review-feedback/pending?bucket=reviews|approved|rejected`

- [x] Phase 3: Add feedback transition flow  
  Implemented:
  - `POST /admin/review-feedback/{review_id}/transition`
  - Wrong/needs-source answers can be converted into `corrected_approved` records.
  - Correction records preserve audit history through `correction_of_review_id`.

- [x] Phase 4: Convert approved feedback into RAG-compatible JSONL  
  Implemented: `history_ai/review_feedback/knowledge_exporter.py` exports approved/corrected feedback to `admin_approved_knowledge.jsonl` with dedupe and conflict warnings.

- [x] Phase 5: Import approved JSONL into dataset/index rebuild flow  
  Implemented:
  - `history_ai/quang_trung_dataset/build_multi_character_datasets.py` now optionally merges `history_ai/review_feedback/admin_approved_knowledge.jsonl` by `character_id`.
  - `POST /admin/knowledge/export-approved`
  - `POST /admin/knowledge/rebuild-index?character_id=tran_hung_dao`
  - Rebuild exports approved feedback, merges chunks by `chunk_id`, writes character knowledge JSONL, and reloads runtime retriever data.

- [ ] Phase 6: Add guardrails against learning wrong data  
  Next: ensure missing-source, rejected, off-topic, wrong-fact, or source-conflict records are not indexed automatically; wrong answers are kept only as negative examples.

- [ ] Phase 7: Add Gemini cache/rate-limit while preserving source metadata  
  Next: repeated questions avoid repeated Gemini calls but still show proof sources.

- [ ] Phase 8: Run phase-by-phase verification  
  Current verification: `uv run python smoke_test.py` passes in `history_ai/backend`.

## Done When

- [x] Admin can review RAG/Gemini answers before saving through backend review APIs.
- [x] Checked correct RAG answers can be saved into RAG knowledge.
- [x] Checked correct Gemini answers can also be saved into RAG knowledge if they include proof sources.
- [x] Wrong answers are stored as rejected examples with an error type.
- [x] Wrong answers can be corrected with proof source and saved as corrected approved knowledge.
- [x] Approved feedback becomes JSONL suitable for RAG learning.
- [ ] Gemini answers include proof sources for admin validation.
- [x] Rejected or source-less records are never learned as positive knowledge.

## Verification

```powershell
cd C:\Users\LECOO\Downloads\EXE\BE-Duy\history_ai\backend
uv run python smoke_test.py
```

Result: `backend smoke tests passed`.

## Notes

- Human approval is the source of truth for learning.
- Gemini may suggest, but admin source proof decides whether knowledge is saved.
- A Gemini answer checked as correct is treated like approved knowledge.
- A wrong answer is not wasted: it becomes a negative example or a correction candidate.
- Rebuild should be manual by default to avoid unsafe automatic indexing.
- Artifact progress is tracked in `C:\Users\LECOO\.gemini\antigravity-ide\brain\66c0900d-2a7f-4481-a873-569492241ea8\task.md`, but this project file is now synced for easier review.
