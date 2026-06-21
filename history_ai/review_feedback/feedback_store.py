"""Review feedback persistence for admin-approved RAG learning."""

from __future__ import annotations

import hashlib
import json
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

VALID_ORIGINS = {"rag", "gemini", "admin_corrected"}
VALID_STATUSES = {"approved", "rejected", "needs_source", "corrected_approved"}
VALID_ERROR_TYPES = {"off_topic", "wrong_fact", "missing_source", "unsafe_prior", "duplicate", "other"}
TRANSITION_STATUSES = {"approved", "rejected", "corrected_approved"}
APPROVED_STATUSES = {"approved", "corrected_approved"}
REJECTED_STATUS = "rejected"
SOURCE_REQUIRED_FIELDS = ("source_title", "source_excerpt", "source_tier")


class FeedbackValidationError(ValueError):
    """Raised when review feedback cannot be safely persisted."""


@dataclass(frozen=True)
class FeedbackPaths:
    root: Path

    @property
    def reviews(self) -> Path:
        return self.root / "reviews.jsonl"

    @property
    def approved(self) -> Path:
        return self.root / "approved.jsonl"

    @property
    def rejected(self) -> Path:
        return self.root / "rejected.jsonl"


def default_feedback_root() -> Path:
    return Path(__file__).resolve().parent


def normalize_text(value: Any) -> str:
    return str(value or "").strip()


def stable_hash(*parts: Any) -> str:
    payload = "\u241f".join(normalize_text(part).lower() for part in parts)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16]


def has_source_proof(record: dict[str, Any]) -> bool:
    return all(normalize_text(record.get(field)) for field in SOURCE_REQUIRED_FIELDS)


def validate_feedback_record(record: dict[str, Any]) -> None:
    question = normalize_text(record.get("question"))
    character_id = normalize_text(record.get("character_id"))
    answer_origin = normalize_text(record.get("answer_origin"))
    status = normalize_text(record.get("status"))
    error_type = normalize_text(record.get("error_type"))

    if not question:
        raise FeedbackValidationError("question is required")
    if not character_id:
        raise FeedbackValidationError("character_id is required")
    if answer_origin not in VALID_ORIGINS:
        raise FeedbackValidationError(f"answer_origin must be one of {sorted(VALID_ORIGINS)}")
    if status not in VALID_STATUSES:
        raise FeedbackValidationError(f"status must be one of {sorted(VALID_STATUSES)}")
    if error_type and error_type not in VALID_ERROR_TYPES:
        raise FeedbackValidationError(f"error_type must be one of {sorted(VALID_ERROR_TYPES)}")

    if status == "approved":
        if not normalize_text(record.get("model_answer")):
            raise FeedbackValidationError("approved feedback requires model_answer")
        if not has_source_proof(record):
            raise FeedbackValidationError("approved feedback requires source proof")

    if status == "corrected_approved":
        if not normalize_text(record.get("corrected_answer")):
            raise FeedbackValidationError("corrected_approved feedback requires corrected_answer")
        if not has_source_proof(record):
            raise FeedbackValidationError("corrected_approved feedback requires source proof")

    if status == REJECTED_STATUS:
        if not error_type and not normalize_text(record.get("reviewer_note")):
            raise FeedbackValidationError("rejected feedback requires error_type or reviewer_note")


def enrich_feedback_record(record: dict[str, Any]) -> dict[str, Any]:
    validate_feedback_record(record)
    enriched = dict(record)
    now = datetime.now(timezone.utc).isoformat()
    source_key = (
        enriched.get("source_title", ""),
        enriched.get("source_url", ""),
        enriched.get("source_excerpt", ""),
        enriched.get("source_tier", ""),
    )
    enriched.setdefault("review_id", f"review_{uuid.uuid4().hex[:12]}")
    enriched.setdefault("created_at", now)
    enriched["question_hash"] = stable_hash(enriched["character_id"], enriched["question"])
    enriched["source_hash"] = stable_hash(*source_key) if any(normalize_text(part) for part in source_key) else ""
    return enriched


def append_jsonl(path: Path, record: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n")


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    records: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            records.append(json.loads(line))
    return records


def write_jsonl(path: Path, records: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        for record in records:
            handle.write(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n")


def save_feedback(record: dict[str, Any], root: Path | None = None) -> dict[str, Any]:
    paths = FeedbackPaths(root or default_feedback_root())
    enriched = enrich_feedback_record(record)
    append_jsonl(paths.reviews, enriched)

    status = enriched["status"]
    if status in APPROVED_STATUSES:
        append_jsonl(paths.approved, enriched)
    elif status == REJECTED_STATUS:
        append_jsonl(paths.rejected, enriched)

    return enriched


def list_feedback(root: Path | None = None, bucket: str = "reviews") -> list[dict[str, Any]]:
    paths = FeedbackPaths(root or default_feedback_root())
    if bucket == "approved":
        return read_jsonl(paths.approved)
    if bucket == "rejected":
        return read_jsonl(paths.rejected)
    return read_jsonl(paths.reviews)


def get_feedback(review_id: str, root: Path | None = None) -> dict[str, Any] | None:
    target = normalize_text(review_id)
    if not target:
        return None
    for record in reversed(list_feedback(root=root, bucket="reviews")):
        if normalize_text(record.get("review_id")) == target:
            return record
    return None


def find_latest_feedback_for_question(character_id: str, question: str, root: Path | None = None) -> dict[str, Any] | None:
    target_hash = stable_hash(character_id, question)
    for record in reversed(list_feedback(root=root, bucket="reviews")):
        if normalize_text(record.get("question_hash")) == target_hash:
            return record
    return None


def delete_feedback(review_id: str, root: Path | None = None) -> dict[str, Any]:
    target = normalize_text(review_id)
    if not target:
        raise FeedbackValidationError("review_id is required")

    paths = FeedbackPaths(root or default_feedback_root())
    all_records = list_feedback(root=root, bucket="reviews")
    current = next((record for record in all_records if normalize_text(record.get("review_id")) == target), None)
    if not current:
        raise FeedbackValidationError("review_id not found")

    root_id = normalize_text(current.get("correction_of_review_id")) or target
    target_question_hash = normalize_text(current.get("question_hash"))
    linked_ids = {
        normalize_text(record.get("review_id"))
        for record in all_records
        if normalize_text(record.get("review_id")) in {target, root_id}
        or normalize_text(record.get("correction_of_review_id")) in {target, root_id}
        or (target_question_hash and normalize_text(record.get("question_hash")) == target_question_hash)
    }
    linked_ids.discard("")

    removed_count = 0
    for path in (paths.reviews, paths.approved, paths.rejected):
        records = read_jsonl(path)
        kept_records = [record for record in records if normalize_text(record.get("review_id")) not in linked_ids]
        removed_count += len(records) - len(kept_records)
        if len(kept_records) != len(records):
            write_jsonl(path, kept_records)

    return {"deleted": current, "removed_count": removed_count}


def transition_feedback(
    review_id: str,
    status: str,
    updates: dict[str, Any] | None = None,
    root: Path | None = None,
) -> dict[str, Any]:
    next_status = normalize_text(status)
    if next_status not in TRANSITION_STATUSES:
        raise FeedbackValidationError(f"status must be one of {sorted(TRANSITION_STATUSES)}")

    current = get_feedback(review_id, root=root)
    if not current:
        raise FeedbackValidationError("review_id not found")

    patch = dict(updates or {})
    transitioned = dict(current)
    transitioned.update({key: value for key, value in patch.items() if value is not None})
    transitioned["status"] = next_status
    transitioned["correction_of_review_id"] = normalize_text(review_id)
    transitioned.pop("review_id", None)
    transitioned.pop("created_at", None)

    if next_status == "corrected_approved":
        transitioned["answer_origin"] = "admin_corrected"
    if next_status == "rejected" and not normalize_text(transitioned.get("error_type")):
        transitioned["error_type"] = "other"

    return save_feedback(transitioned, root=root)
