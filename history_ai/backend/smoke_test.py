from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from unittest.mock import patch

os.environ["GEMINI_API_KEY"] = ""
os.environ["GOOGLE_TTS_API_KEY"] = ""
os.environ["LLM_PROVIDER"] = "gemini_api"

from fastapi.testclient import TestClient  # noqa: E402

import main as backend_main  # noqa: E402
from rag_core import answer_query  # noqa: E402

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

app = backend_main.app


REVIEW_SCHEMA_PATH = Path(__file__).resolve().parents[1] / "review_feedback" / "feedback.schema.json"


def assert_review_feedback_contract() -> None:
    schema = json.loads(REVIEW_SCHEMA_PATH.read_text(encoding="utf-8"))
    properties = schema["properties"]

    assert properties["answer_origin"]["enum"] == ["rag", "gemini", "admin_corrected"]
    assert set(properties["status"]["enum"]) == {"approved", "rejected", "needs_source", "corrected_approved"}
    assert set(properties["error_type"]["enum"]) == {
        "off_topic",
        "wrong_fact",
        "missing_source",
        "unsafe_prior",
        "duplicate",
        "other",
    }

    approved_rule = schema["allOf"][0]["then"]["required"]
    corrected_rule = schema["allOf"][1]["then"]["required"]
    rejected_rule = schema["allOf"][2]["then"]["anyOf"]

    assert {"model_answer", "source_title", "source_excerpt", "source_tier"}.issubset(approved_rule)
    assert {"corrected_answer", "source_title", "source_excerpt", "source_tier"}.issubset(corrected_rule)
    assert {"required": ["error_type"]} in rejected_rule
    assert {"required": ["reviewer_note"]} in rejected_rule

    gemini_approved = {
        "question": "Trần Hưng Đạo thắng trận nào?",
        "character_id": "tran_hung_dao",
        "answer_origin": "gemini",
        "model_answer": "Trần Hưng Đạo gắn với chiến thắng Bạch Đằng năm 1288.",
        "status": "approved",
        "source_title": "Đại Việt sử ký toàn thư",
        "source_excerpt": "Hưng Đạo Vương phá quân Nguyên ở Bạch Đằng.",
        "source_tier": 1,
    }
    rejected_wrong_answer = {
        "question": "Trần Hưng Đạo dùng blitzkrieg không?",
        "character_id": "tran_hung_dao",
        "answer_origin": "rag",
        "model_answer": "Có, ông dùng blitzkrieg.",
        "status": "rejected",
        "error_type": "wrong_fact",
    }
    corrected_answer = {
        "question": "Trần Hưng Đạo dùng blitzkrieg không?",
        "character_id": "tran_hung_dao",
        "answer_origin": "admin_corrected",
        "corrected_answer": "Không. Blitzkrieg là khái niệm quân sự hiện đại, không thuộc bối cảnh thời Trần.",
        "status": "corrected_approved",
        "source_title": "Đại Việt sử ký toàn thư",
        "source_excerpt": "Ghi chép bối cảnh chiến tranh thời Trần chống Nguyên Mông.",
        "source_tier": 1,
        "correction_of_review_id": "review_wrong_fact_001",
    }

    assert gemini_approved["status"] == "approved"
    assert gemini_approved["answer_origin"] == "gemini"
    assert rejected_wrong_answer["status"] == "rejected"
    assert rejected_wrong_answer["error_type"] == "wrong_fact"
    assert corrected_answer["status"] == "corrected_approved"
    assert corrected_answer["correction_of_review_id"]


def assert_feedback_store_contract() -> None:
    import tempfile

    from review_feedback.feedback_store import (
        FeedbackValidationError,
        delete_feedback,
        find_latest_feedback_for_question,
        list_feedback,
        save_feedback,
        transition_feedback,
    )

    with tempfile.TemporaryDirectory() as tmp_dir:
        root = Path(tmp_dir)
        approved = save_feedback(
            {
                "question": "Trần Hưng Đạo thắng trận nào?",
                "character_id": "tran_hung_dao",
                "answer_origin": "gemini",
                "model_answer": "Trần Hưng Đạo gắn với chiến thắng Bạch Đằng năm 1288.",
                "status": "approved",
                "source_title": "Đại Việt sử ký toàn thư",
                "source_excerpt": "Hưng Đạo Vương phá quân Nguyên ở Bạch Đằng.",
                "source_tier": 1,
            },
            root=root,
        )
        rejected = save_feedback(
            {
                "question": "Trần Hưng Đạo dùng blitzkrieg không?",
                "character_id": "tran_hung_dao",
                "answer_origin": "rag",
                "model_answer": "Có, ông dùng blitzkrieg.",
                "status": "rejected",
                "error_type": "wrong_fact",
            },
            root=root,
        )
        corrected = save_feedback(
            {
                "question": "Trần Hưng Đạo dùng blitzkrieg không?",
                "character_id": "tran_hung_dao",
                "answer_origin": "admin_corrected",
                "corrected_answer": "Không. Blitzkrieg là khái niệm quân sự hiện đại, không thuộc bối cảnh thời Trần.",
                "status": "corrected_approved",
                "source_title": "Đại Việt sử ký toàn thư",
                "source_excerpt": "Ghi chép bối cảnh chiến tranh thời Trần chống Nguyên Mông.",
                "source_tier": 1,
                "correction_of_review_id": rejected["review_id"],
            },
            root=root,
        )

        assert approved["answer_origin"] == "gemini"
        assert approved["review_id"]
        assert approved["question_hash"]
        assert approved["source_hash"]
        assert rejected["status"] == "rejected"
        assert corrected["correction_of_review_id"] == rejected["review_id"]

        assert len(list_feedback(root=root, bucket="reviews")) == 3
        assert len(list_feedback(root=root, bucket="approved")) == 2
        assert len(list_feedback(root=root, bucket="rejected")) == 1
        assert find_latest_feedback_for_question("tran_hung_dao", "Trần Hưng Đạo dùng blitzkrieg không?", root=root)["review_id"] == corrected["review_id"]

        transitioned = transition_feedback(
            approved["review_id"],
            "corrected_approved",
            {
                "corrected_answer": "Trần Hưng Đạo nổi bật với chiến thắng Bạch Đằng năm 1288.",
                "source_title": "Đại Việt sử ký toàn thư",
                "source_excerpt": "Hưng Đạo Vương phá quân Nguyên ở Bạch Đằng.",
                "source_tier": 1,
            },
            root=root,
        )
        assert find_latest_feedback_for_question("tran_hung_dao", "Trần Hưng Đạo thắng trận nào?", root=root)["review_id"] == transitioned["review_id"]

        deleted = delete_feedback(transitioned["review_id"], root=root)
        assert deleted["removed_count"] == 4
        assert find_latest_feedback_for_question("tran_hung_dao", "Trần Hưng Đạo thắng trận nào?", root=root) is None

        try:
            save_feedback(
                {
                    "question": "Thiếu nguồn",
                    "character_id": "tran_hung_dao",
                    "answer_origin": "gemini",
                    "model_answer": "Một câu không có nguồn.",
                    "status": "approved",
                },
                root=root,
            )
        except FeedbackValidationError:
            pass
        else:
            raise AssertionError("source-less approved feedback must fail")

        try:
            save_feedback(
                {
                    "question": "Sai nhưng không phân loại",
                    "character_id": "tran_hung_dao",
                    "answer_origin": "rag",
                    "model_answer": "Sai.",
                    "status": "rejected",
                },
                root=root,
            )
        except FeedbackValidationError:
            pass
        else:
            raise AssertionError("rejected feedback without error context must fail")


def assert_knowledge_exporter_contract() -> None:
    import tempfile

    from review_feedback.feedback_store import save_feedback
    from review_feedback.knowledge_exporter import export_approved_feedback

    with tempfile.TemporaryDirectory() as tmp_dir:
        root = Path(tmp_dir)
        save_feedback(
            {
                "question": "Trần Hưng Đạo thắng trận nào?",
                "character_id": "tran_hung_dao",
                "answer_origin": "gemini",
                "model_answer": "Trần Hưng Đạo gắn với chiến thắng Bạch Đằng năm 1288.",
                "status": "approved",
                "source_title": "Đại Việt sử ký toàn thư",
                "source_excerpt": "Hưng Đạo Vương phá quân Nguyên ở Bạch Đằng.",
                "source_tier": 1,
            },
            root=root,
        )
        rejected = save_feedback(
            {
                "question": "Trần Hưng Đạo dùng blitzkrieg không?",
                "character_id": "tran_hung_dao",
                "answer_origin": "rag",
                "model_answer": "Có, ông dùng blitzkrieg.",
                "status": "rejected",
                "error_type": "wrong_fact",
            },
            root=root,
        )
        save_feedback(
            {
                "question": "Trần Hưng Đạo dùng blitzkrieg không?",
                "character_id": "tran_hung_dao",
                "answer_origin": "admin_corrected",
                "corrected_answer": "Không. Blitzkrieg là khái niệm quân sự hiện đại, không thuộc bối cảnh thời Trần.",
                "status": "corrected_approved",
                "source_title": "Đại Việt sử ký toàn thư",
                "source_excerpt": "Ghi chép bối cảnh chiến tranh thời Trần chống Nguyên Mông.",
                "source_tier": 1,
                "correction_of_review_id": rejected["review_id"],
            },
            root=root,
        )

        duplicate_payload = {
            "question": "Trần Hưng Đạo thắng trận nào?",
            "character_id": "tran_hung_dao",
            "answer_origin": "gemini",
            "model_answer": "Trần Hưng Đạo gắn với chiến thắng Bạch Đằng năm 1288.",
            "status": "approved",
            "source_title": "Đại Việt sử ký toàn thư",
            "source_excerpt": "Hưng Đạo Vương phá quân Nguyên ở Bạch Đằng.",
            "source_tier": 1,
        }
        save_feedback(duplicate_payload, root=root)
        save_feedback(duplicate_payload, root=root)
        save_feedback(
            {
                "question": "Trần Hưng Đạo thắng trận nào?",
                "character_id": "tran_hung_dao",
                "answer_origin": "gemini",
                "model_answer": "Một nguồn yếu cũng nói về Bạch Đằng.",
                "status": "approved",
                "source_title": "Nguồn truyền miệng chưa kiểm chứng",
                "source_excerpt": "Một ghi chép thứ cấp chưa rõ xuất xứ.",
                "source_tier": 3,
            },
            root=root,
        )

        result = export_approved_feedback(root / "approved.jsonl", root / "exported.jsonl")
        exported = [json.loads(line) for line in (root / "exported.jsonl").read_text(encoding="utf-8").splitlines()]

        assert result["exported_count"] == 3
        assert result["duplicate_count"] == 2
        assert result["conflict_count"] == 2
        assert len(exported) == 3
        assert {item["answer_origin"] for item in exported} == {"gemini", "admin_corrected"}
        assert all(item["source_key"] == "admin_approved" for item in exported)
        assert all(item["review_status"] in {"approved", "corrected_approved"} for item in exported)
        assert any("multiple_sources_for_same_question" in item["conflict_warning"] for item in exported)
        assert any("weak_or_missing_source_tier" in item["conflict_warning"] for item in exported)
        assert not any("blitzkrieg." == item["fact"].lower().strip() for item in exported)


def assert_review_feedback_api(client: TestClient) -> None:
    approved_payload = {
        "question": "Trần Hưng Đạo thắng trận nào?",
        "character_id": "tran_hung_dao",
        "answer_origin": "gemini",
        "model_answer": "Trần Hưng Đạo gắn với chiến thắng Bạch Đằng năm 1288.",
        "status": "approved",
        "source_title": "Đại Việt sử ký toàn thư",
        "source_excerpt": "Hưng Đạo Vương phá quân Nguyên ở Bạch Đằng.",
        "source_tier": 1,
    }
    approved = client.post("/admin/review-feedback", json=approved_payload)
    assert approved.status_code == 200
    approved_body = approved.json()
    assert approved_body["ok"] is True
    assert approved_body["feedback"]["answer_origin"] == "gemini"
    assert approved_body["feedback"]["status"] == "approved"

    rejected = client.post(
        "/admin/review-feedback",
        json={
            "question": "Trần Hưng Đạo dùng blitzkrieg không?",
            "character_id": "tran_hung_dao",
            "answer_origin": "rag",
            "model_answer": "Có, ông dùng blitzkrieg.",
            "status": "rejected",
            "error_type": "wrong_fact",
        },
    )
    assert rejected.status_code == 200
    assert rejected.json()["feedback"]["status"] == "rejected"

    missing_source = client.post(
        "/admin/review-feedback",
        json={
            "question": "Thiếu nguồn",
            "character_id": "tran_hung_dao",
            "answer_origin": "gemini",
            "model_answer": "Một câu không có nguồn.",
            "status": "approved",
        },
    )
    assert missing_source.status_code == 400

    approved_list = client.get("/admin/review-feedback/pending", params={"bucket": "approved"})
    rejected_list = client.get("/admin/review-feedback/pending", params={"bucket": "rejected"})
    assert approved_list.status_code == 200
    assert rejected_list.status_code == 200
    assert any(item["review_id"] == approved_body["feedback"]["review_id"] for item in approved_list.json()["feedback"])
    assert any(item["status"] == "rejected" for item in rejected_list.json()["feedback"])

    latest = client.get(
        "/admin/review-feedback/latest",
        params={"character_id": "tran_hung_dao", "question": approved_payload["question"]},
    )
    assert latest.status_code == 200
    assert latest.json()["feedback"]["review_id"] == approved_body["feedback"]["review_id"]

    pending = client.post(
        "/admin/review-feedback",
        json={
            "question": "Trần Hưng Đạo dùng blitzkrieg không?",
            "character_id": "tran_hung_dao",
            "answer_origin": "rag",
            "model_answer": "Có, ông dùng blitzkrieg.",
            "status": "needs_source",
        },
    )
    assert pending.status_code == 200
    pending_id = pending.json()["feedback"]["review_id"]

    transitioned = client.post(
        f"/admin/review-feedback/{pending_id}/transition",
        json={
            "status": "corrected_approved",
            "corrected_answer": "Không. Blitzkrieg là khái niệm quân sự hiện đại, không thuộc bối cảnh thời Trần.",
            "source_title": "Đại Việt sử ký toàn thư",
            "source_excerpt": "Ghi chép bối cảnh chiến tranh thời Trần chống Nguyên Mông.",
            "source_tier": 1,
            "reviewer_note": "Corrected by admin review.",
        },
    )
    assert transitioned.status_code == 200
    transitioned_body = transitioned.json()["feedback"]
    assert transitioned_body["status"] == "corrected_approved"
    assert transitioned_body["answer_origin"] == "admin_corrected"
    assert transitioned_body["correction_of_review_id"] == pending_id
    assert transitioned_body["review_id"] != pending_id

    invalid_transition = client.post(
        f"/admin/review-feedback/{pending_id}/transition",
        json={"status": "approved"},
    )
    assert invalid_transition.status_code == 400

    latest_after_transition = client.get(
        "/admin/review-feedback/latest",
        params={"character_id": "tran_hung_dao", "question": "Trần Hưng Đạo dùng blitzkrieg không?"},
    )
    assert latest_after_transition.status_code == 200
    assert latest_after_transition.json()["feedback"]["review_id"] == transitioned_body["review_id"]

    deleted = client.delete(f"/admin/review-feedback/{transitioned_body['review_id']}")
    assert deleted.status_code == 200
    assert deleted.json()["removed_count"] >= 2
    latest_after_delete = client.get(
        "/admin/review-feedback/latest",
        params={"character_id": "tran_hung_dao", "question": "Trần Hưng Đạo dùng blitzkrieg không?"},
    )
    assert latest_after_delete.status_code == 200
    assert latest_after_delete.json()["feedback"] is None

    export_response = client.post("/admin/knowledge/export-approved")
    assert export_response.status_code == 200
    export_body = export_response.json()
    assert export_body["exported_count"] >= 2
    assert Path(export_body["output_path"]).exists()

    import tempfile

    with tempfile.TemporaryDirectory() as tmp_dir:
        knowledge_path = Path(tmp_dir) / "tran_hung_dao_knowledge.jsonl"
        knowledge_path.write_text(
            json.dumps(
                {
                    "chunk_id": "existing_chunk",
                    "char_id": "tran_hung_dao",
                    "topic_title": "Existing",
                    "text": "Existing knowledge.",
                    "fact": "Existing knowledge.",
                    "source_title": "Existing source",
                },
                ensure_ascii=False,
            )
            + "\n",
            encoding="utf-8",
        )
        with patch.object(backend_main, "knowledge_path_for", return_value=knowledge_path), patch.object(
            backend_main.runtime, "_load_from_json", return_value=({}, [], "json")
        ), patch.object(backend_main.runtime, "_store_character", return_value=None):
            rebuild_response = client.post(
                "/admin/knowledge/rebuild-index",
                params={"character_id": "tran_hung_dao"},
            )
        assert rebuild_response.status_code == 200
        rebuild_body = rebuild_response.json()
        assert rebuild_body["ok"] is True
        assert rebuild_body["approved_merged"] >= 2
        rebuilt_records = [json.loads(line) for line in knowledge_path.read_text(encoding="utf-8").splitlines()]
        assert any(record.get("source_key") == "admin_approved" for record in rebuilt_records)


def parse_sse(text: str) -> list[tuple[str, dict]]:
    events: list[tuple[str, dict]] = []
    for block in text.split("\n\n"):
        if not block.strip():
            continue
        event_name = ""
        data = {}
        for line in block.splitlines():
            if line.startswith("event:"):
                event_name = line[6:].strip()
            if line.startswith("data:"):
                data = json.loads(line[5:].strip())
        if event_name:
            events.append((event_name, data))
    return events


def final_answer_for(client: TestClient, character_id: str, message: str) -> dict:
    response = client.post(
        "/api/chat/stream",
        json={"character_id": character_id, "message": message, "history": []},
    )
    assert response.status_code == 200
    events = parse_sse(response.text)
    names = [name for name, _ in events]
    assert names[0] == "start"
    assert "retrieval" in names
    assert "stream_start" in names
    assert "final" in names
    final = [data for name, data in events if name == "final"][-1]
    assert "visual" in final
    assert "llm_status" in final
    assert "fallback_used" in final
    assert "route_source" in final
    assert "timings_ms" in final
    assert "total_ms" in final["timings_ms"]
    assert final["visual"]["emotion"] in {"idle", "thinking", "talking", "happy", "angry", "sad", "confused"}
    return final


def assert_mongodb_runtime_contract(client: TestClient) -> None:
    mongo_profile = {
        "character_id": "tran_hung_dao",
        "character_metadata": {
            "display_name": "Trần Hưng Đạo",
            "era": "Nhà Trần",
            "death_year": 1300,
            "portrait_url": "https://example.com/tran-hung-dao.jpg",
        },
        "persona_prompt": "Bạn là Trần Hưng Đạo.",
    }
    mongo_chunks = [
        {
            "chunk_id": "thd_mongo_001",
            "character_id": "tran_hung_dao",
            "char_id": "tran_hung_dao",
            "topic_title": "Bạch Đằng 1288",
            "source_title": "MongoDB knowledge chunk",
            "text": "Trần Hưng Đạo chỉ huy quân dân Đại Việt trong chiến thắng Bạch Đằng năm 1288.",
            "fact": "Trần Hưng Đạo chỉ huy quân dân Đại Việt trong chiến thắng Bạch Đằng năm 1288.",
            "tags": ["bạch đằng", "nhà trần"],
            "answer_intents": ["history_battle"],
            "canonical_questions": ["Trận Bạch Đằng năm 1288 là gì?"],
        }
    ]

    previous_runtime = backend_main.runtime
    mongo_runtime = backend_main.RuntimeStore()
    try:
        with patch("main.mongo_enabled", return_value=True), patch(
            "main.list_mongo_characters", return_value=[mongo_profile]
        ), patch("main.load_mongo_chunks", return_value=mongo_chunks), patch(
            "main.load_mongo_character", return_value=mongo_profile
        ):
            mongo_runtime.preload()
            backend_main.runtime = mongo_runtime
            assert mongo_runtime.character_ids() == ["tran_hung_dao"]
            assert mongo_runtime.sources["tran_hung_dao"] == "mongodb"

            characters = client.get("/api/characters")
            assert characters.status_code == 200
            items = characters.json()["characters"]
            assert len(items) == 1
            assert items[0]["character_id"] == "tran_hung_dao"
            assert items[0]["data_source"] == "mongodb"
            assert items[0]["portrait_url"] == "https://example.com/tran-hung-dao.jpg"
    finally:
        backend_main.runtime = previous_runtime


def assert_dataset_builder_admin_approved_contract() -> None:
    import tempfile

    from quang_trung_dataset import build_multi_character_datasets as builder

    admin_record = {
        "chunk_id": "admin_test_tran_hung_dao",
        "character_id": "tran_hung_dao",
        "char_id": "tran_hung_dao",
        "topic_title": "Admin approved fact",
        "fact": "Admin-approved knowledge must be merged into the character dataset.",
        "text": "Hỏi: test\nĐáp: Admin-approved knowledge must be merged into the character dataset.",
        "source_title": "Admin verified source",
        "source_excerpt": "Verified source excerpt.",
        "source_tier": 1,
        "source_key": "admin_approved",
        "answer_origin": "admin_corrected",
        "review_id": "review_test_1",
        "review_status": "corrected_approved",
        "canonical_questions": ["Admin approved fact?"],
        "answer_intents": ["historical_fact"],
        "tags": ["admin_approved"],
    }

    with tempfile.TemporaryDirectory() as tmp_dir:
        approved_path = Path(tmp_dir) / "admin_approved_knowledge.jsonl"
        approved_path.write_text(json.dumps(admin_record, ensure_ascii=False) + "\n", encoding="utf-8")
        previous_path = builder.ADMIN_APPROVED_KNOWLEDGE_PATH
        builder.ADMIN_APPROVED_KNOWLEDGE_PATH = approved_path
        try:
            records = builder.load_records(
                "tran_hung_dao",
                {"source_dir": PROJECT_ROOT / "tran_hung_dao_dataset", "knowledge": "tran_hung_dao_knowledge.jsonl"},
                {},
            )
        finally:
            builder.ADMIN_APPROVED_KNOWLEDGE_PATH = previous_path

    merged = [record for record in records if record["chunk_id"] == "admin_test_tran_hung_dao"]
    assert len(merged) == 1
    assert merged[0]["review_id"] == "review_test_1"
    assert merged[0]["source_key"] == "admin_approved"
    assert merged[0]["source_tier"] == 1


def main() -> None:
    assert_review_feedback_contract()
    assert_feedback_store_contract()
    assert_knowledge_exporter_contract()
    assert_dataset_builder_admin_approved_contract()

    with TestClient(app) as client:
        health = client.get("/api/health")
        assert health.status_code == 200
        assert_review_feedback_api(client)
        payload = health.json()
        assert payload["ok"] is True
        assert len(payload["characters_loaded"]) == 5

        characters = client.get("/api/characters").json()["characters"]
        assert len(characters) == 5
        assert {item["character_id"] for item in characters} >= {
            "quang_trung",
            "tran_hung_dao",
            "nguyen_trai",
            "ho_chi_minh",
            "vo_nguyen_giap",
        }
        assert_mongodb_runtime_contract(client)

        quang_trung = final_answer_for(client, "quang_trung", "ông với Nguyễn Huệ là anh em à")
        assert "Nguyễn Huệ chính là" in quang_trung["answer"]
        assert "không phải" in quang_trung["answer"]
        assert "gươm giáo chỉ là bước mở đường" not in quang_trung["answer"]

        name_relation = final_answer_for(client, "quang_trung", "ông với nguyễn huệ là gì của nhau")
        assert "Nguyễn Huệ chính là" in name_relation["answer"]
        assert "niên hiệu" in name_relation["answer"]
        assert name_relation["visual"]["intent"] == "identity_confusion"

        ngoc_hoi = final_answer_for(
            client,
            "quang_trung",
            "chao vua, vua hay cho toi biet ve tran danh ngoc hoi , dong da di",
        )
        normalized_ngoc_hoi = ngoc_hoi["answer"].lower()
        assert "ta đang nghe" not in normalized_ngoc_hoi
        assert "ngọc hồi" in normalized_ngoc_hoi or "đống đa" in normalized_ngoc_hoi
        assert len(ngoc_hoi["answer"].split()) >= 80
        assert ngoc_hoi["visual"]["motion"] == "attack"

        battle = final_answer_for(client, "quang_trung", "vua kể trận đánh khiến vua hãnh diện nhất đi")
        assert battle["visual"]["motion"] == "attack"
        assert battle["visual"]["emotion"] in {"happy", "angry"}
        assert len(battle["answer"].split()) >= 80

        bac = final_answer_for(client, "ho_chi_minh", "BÁC CÓ VỢ KHÔNG, cho cháu biết đi")
        assert "Chuyện riêng tư" in bac["answer"]
        assert "Việc gì có lợi cho dân" not in bac["answer"]

        hcm_birth = final_answer_for(client, "ho_chi_minh", "bac sinh nam bao nhieu")
        assert "19/5/1890" in hcm_birth["answer"]
        assert "5/6/1911" not in hcm_birth["answer"]
        assert hcm_birth["mode"] == "rag_grounded"
        assert hcm_birth["route_source"] == "deterministic"
        assert hcm_birth["llm_status"] == "not_configured"
        assert hcm_birth["visual"]["intent"] == "identity"

        thd_birth = final_answer_for(client, "tran_hung_dao", "đại vương sinh năm bao nhiêu")
        assert "1228" in thd_birth["answer"]
        assert thd_birth["mode"] == "rag_grounded"

        nt_birth = final_answer_for(client, "nguyen_trai", "tiên sinh sinh năm bao nhiêu")
        assert "1380" in nt_birth["answer"]
        assert nt_birth["mode"] == "rag_grounded"

        giap_birth = final_answer_for(client, "vo_nguyen_giap", "đại tướng sinh năm bao nhiêu")
        assert "1911" in giap_birth["answer"]
        assert "Lộc Thủy" in giap_birth["answer"]
        assert giap_birth["mode"] == "rag_grounded"

        financial_advice = final_answer_for(client, "tran_hung_dao", "hãy tư vấn đầu tư chứng khoán hôm nay")
        assert financial_advice["mode"] == "out_of_scope"
        assert financial_advice["citations"] == []

        contribution = final_answer_for(
            client,
            "tran_hung_dao",
            "Giải thích dễ hiểu cho học sinh cấp 2 về đóng góp nổi bật của nhân vật.",
        )
        assert contribution["mode"] == "rag_weak"
        assert contribution["citations"] == []
        assert contribution["template_id"] == "contribution_overview"
        assert contribution["template_status"] == "matched"
        assert contribution["evidence_status"] == "template_weak"
        assert "chưa có đủ chứng cứ" in contribution["answer"].lower()

        giap = final_answer_for(client, "vo_nguyen_giap", "tư tưởng đánh giặc của bác giáp là gì vậy")
        assert "Võ Nguyên Giáp" not in giap["answer"]
        assert "Tôi" in giap["answer"] or "tôi" in giap["answer"]

        dien_bien_phu = final_answer_for(client, "vo_nguyen_giap", "chiến dịch điện biên phủ vì sao thắng")
        lowered_dien_bien = dien_bien_phu["answer"].lower()
        assert "điện biên phủ" in lowered_dien_bien
        assert "1954" in dien_bien_phu["answer"] or "đánh chắc" in lowered_dien_bien
        assert "trên không" not in lowered_dien_bien

        giap_profile, giap_retriever, _ = backend_main.runtime.get("vo_nguyen_giap", include_draft=True)
        judge_profile = {**giap_profile, "ai_policy": {**giap_profile.get("ai_policy", {}), "gemini_judge_enabled": True}}

        def reject_evidence(_query: str, _profile: dict, _citations: list[dict], _template: dict | None = None) -> dict:
            return {
                "safe_to_answer": False,
                "evidence_status": "irrelevant",
                "relevance_score": 0.1,
                "usable_chunk_ids": [],
                "missing_topics": ["direct evidence"],
                "reason": "mock rejected evidence",
                "suggested_rag_query": "",
                "answer_plan": [],
                "judge_status": "ok",
            }

        judged = answer_query("chiến dịch điện biên phủ vì sao thắng", judge_profile, giap_retriever, evidence_judge=reject_evidence)
        assert judged["mode"] == "rag_weak"
        assert judged["evidence_status"] == "irrelevant"
        assert judged["judge_reason"] == "mock rejected evidence"
        assert judged["citations"] == []

        os.environ["GEMINI_API_KEY"] = "fake-key"
        old_fast_local = os.environ.get("FAST_LOCAL_RETRIEVAL")
        os.environ["FAST_LOCAL_RETRIEVAL"] = "0"
        try:
            with patch("main.route_query_json", return_value={"ok": False, "llm_status": "quota_exhausted", "route": None}):
                quota = final_answer_for(client, "vo_nguyen_giap", "chiến dịch điện biên phủ vì sao thắng")
        finally:
            os.environ["GEMINI_API_KEY"] = ""
            if old_fast_local is None:
                os.environ.pop("FAST_LOCAL_RETRIEVAL", None)
            else:
                os.environ["FAST_LOCAL_RETRIEVAL"] = old_fast_local
        assert quota["llm_status"] == "quota_exhausted"
        assert quota["fallback_used"] is True
        assert "Điện Biên Phủ" in quota["answer"]

        tts = client.post("/api/tts", json={"character_id": "ho_chi_minh", "text": "Bác chào các cháu."})
        assert tts.status_code == 200
        assert tts.json()["ok"] is False

    print("backend smoke tests passed")


if __name__ == "__main__":
    os.chdir(Path(__file__).resolve().parent)
    main()
