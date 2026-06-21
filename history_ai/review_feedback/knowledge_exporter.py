"""Export admin-approved feedback into RAG knowledge JSONL."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .feedback_store import APPROVED_STATUSES, has_source_proof, read_jsonl, stable_hash

DEFAULT_OUTPUT_NAME = "admin_approved_knowledge.jsonl"


def normalize_words(value: Any) -> list[str]:
    text = str(value or "").lower()
    for char in ",.;:!?()[]{}\"'“”‘’/\\|":
        text = text.replace(char, " ")
    return [word for word in text.split() if len(word) >= 3]


def infer_tags(question: str, answer: str, source_title: str) -> list[str]:
    keywords = normalize_words(f"{question} {answer} {source_title}")
    priority = [
        "bạch",
        "đằng",
        "nguyên",
        "mông",
        "trần",
        "quang",
        "trung",
        "nguyễn",
        "huệ",
        "điện",
        "biên",
        "phủ",
        "độc",
        "lập",
        "nhân",
        "nghĩa",
    ]
    tags = [word for word in priority if word in keywords]
    if not tags:
        tags = keywords[:5]
    return tags[:8]


def infer_intents(question: str, answer: str) -> list[str]:
    text = f"{question} {answer}".lower()
    if any(marker in text for marker in ["sinh", "năm", "quê", "tên", "mất"]):
        return ["identity"]
    if any(marker in text for marker in ["trận", "chiến", "quân", "thắng", "đánh", "giặc"]):
        return ["history_battle"]
    if any(marker in text for marker in ["tư tưởng", "nhân nghĩa", "độc lập", "đạo"]):
        return ["philosophy"]
    return ["historical_fact"]


def answer_from_record(record: dict[str, Any]) -> str:
    if record.get("status") == "corrected_approved":
        return str(record.get("corrected_answer") or "").strip()
    return str(record.get("model_answer") or record.get("corrected_answer") or "").strip()


def is_exportable(record: dict[str, Any]) -> bool:
    return record.get("status") in APPROVED_STATUSES and has_source_proof(record) and bool(answer_from_record(record))


def parse_tier(value: Any) -> int | None:
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def conflict_warning_for(record: dict[str, Any], source_hashes_by_question: dict[str, set[str]]) -> str:
    warnings: list[str] = []
    tier = parse_tier(record.get("source_tier"))
    question_hash = str(record.get("question_hash") or "")
    source_hashes = source_hashes_by_question.get(question_hash, set())

    if tier is None or tier > 2:
        warnings.append("weak_or_missing_source_tier")
    if len(source_hashes) > 1:
        warnings.append("multiple_sources_for_same_question")
    return ",".join(warnings)


def to_knowledge_record(record: dict[str, Any], source_hashes_by_question: dict[str, set[str]] | None = None) -> dict[str, Any]:
    answer = answer_from_record(record)
    question = str(record.get("question") or "").strip()
    source_title = str(record.get("source_title") or "").strip()
    source_excerpt = str(record.get("source_excerpt") or "").strip()
    source_url = str(record.get("source_url") or "").strip()
    source_tier = record.get("source_tier")
    review_id = str(record.get("review_id") or "").strip()
    character_id = str(record.get("character_id") or "").strip()
    chunk_id = f"admin_{stable_hash(character_id, question, answer, source_excerpt)}"
    source_index = source_hashes_by_question or {}

    return {
        "chunk_id": chunk_id,
        "character_id": character_id,
        "char_id": character_id,
        "topic_title": question,
        "question": question,
        "canonical_questions": [question],
        "answer": answer,
        "fact": answer,
        "text": f"Hỏi: {question}\nĐáp: {answer}\nNguồn: {source_excerpt}",
        "source_title": source_title,
        "source_url": source_url,
        "source_excerpt": source_excerpt,
        "source_tier": source_tier,
        "source_key": "admin_approved",
        "answer_origin": record.get("answer_origin"),
        "answer_intents": infer_intents(question, answer),
        "tags": infer_tags(question, answer, source_title),
        "review_status": record.get("status"),
        "review_id": review_id,
        "correction_of_review_id": record.get("correction_of_review_id", ""),
        "source_hash": record.get("source_hash", ""),
        "question_hash": record.get("question_hash", ""),
        "conflict_warning": conflict_warning_for(record, source_index),
    }



def export_approved_feedback(input_path: Path, output_path: Path | None = None) -> dict[str, Any]:
    output = output_path or input_path.with_name(DEFAULT_OUTPUT_NAME)
    records = read_jsonl(input_path)
    exportable = [record for record in records if is_exportable(record)]
    source_hashes_by_question: dict[str, set[str]] = {}
    for record in exportable:
        question_hash = str(record.get("question_hash") or "")
        source_hash = str(record.get("source_hash") or "")
        if question_hash and source_hash:
            source_hashes_by_question.setdefault(question_hash, set()).add(source_hash)

    exported: list[dict[str, Any]] = []
    skipped = 0
    duplicate_count = 0
    seen: set[tuple[str, str]] = set()

    for record in records:
        if not is_exportable(record):
            skipped += 1
            continue
        key = (str(record.get("question_hash") or ""), str(record.get("source_hash") or ""))
        if key in seen:
            skipped += 1
            duplicate_count += 1
            continue
        seen.add(key)
        exported.append(to_knowledge_record(record, source_hashes_by_question))

    conflict_count = sum(1 for item in exported if item.get("conflict_warning"))
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", encoding="utf-8") as handle:
        for item in exported:
            handle.write(json.dumps(item, ensure_ascii=False, sort_keys=True) + "\n")

    return {
        "ok": True,
        "output_path": str(output),
        "exported_count": len(exported),
        "skipped_count": skipped,
        "duplicate_count": duplicate_count,
        "conflict_count": conflict_count,
    }
