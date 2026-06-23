from __future__ import annotations

import json
import os
import sys
import time
import traceback
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Iterable, Iterator

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field


PROJECT_ROOT = Path(__file__).resolve().parents[1]
LEGACY_WEB_DIR = PROJECT_ROOT / "quang_trung_web"
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
if str(LEGACY_WEB_DIR) not in sys.path:
    sys.path.insert(0, str(LEGACY_WEB_DIR))

try:
    from dotenv import load_dotenv

    load_dotenv(LEGACY_WEB_DIR / ".env")
    load_dotenv(PROJECT_ROOT / ".env")
except ImportError:
    pass

from character_registry import (  # noqa: E402
    CHARACTER_REGISTRY,
    DEFAULT_CHARACTER_ID,
    get_character_config,
    knowledge_path_for,
)
from llm_provider import (  # noqa: E402
    GeminiCallError,
    generate_prior_knowledge_answer,
    is_configured as llm_is_configured,
    judge_rag_evidence,
    route_query_json,
    stream_cross_character_persona_answer,
    stream_fused_generation,
)
from rag_core import (  # noqa: E402
    VectorRetriever,
    answer_query,
    compact_text,
    is_cross_character_query,
    is_identity_query,
    is_legacy_afterlife_query,
    is_private_life_query,
    is_quang_trung_self_name_confusion,
    local_route_query,
    load_chunks,
    load_profile,
    query_intents,
)
from tts_provider import synthesize  # noqa: E402
from review_feedback.feedback_store import (  # noqa: E402
    FeedbackValidationError,
    default_feedback_root,
    delete_feedback,
    find_latest_feedback_for_question,
    list_feedback,
    save_feedback,
    transition_feedback,
)
from review_feedback.knowledge_exporter import DEFAULT_OUTPUT_NAME, export_approved_feedback  # noqa: E402

try:
    from mongodb_loader import (  # noqa: E402
        MongoLoaderError,
        list_active_characters as list_mongo_characters,
        load_character as load_mongo_character,
        load_chunks as load_mongo_chunks,
        mongo_enabled,
    )
except ImportError:
    MongoLoaderError = RuntimeError
    load_mongo_character = None
    load_mongo_chunks = None
    list_mongo_characters = None

    def mongo_enabled() -> bool:
        return False


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatStreamRequest(BaseModel):
    character_id: str = DEFAULT_CHARACTER_ID
    message: str = Field(min_length=1, max_length=2000)
    history: list[ChatMessage] = Field(default_factory=list)
    include_draft: bool = False


class TTSRequest(BaseModel):
    character_id: str = DEFAULT_CHARACTER_ID
    text: str = Field(min_length=1, max_length=6000)


class ReviewFeedbackRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    character_id: str = Field(min_length=1, max_length=100)
    answer_origin: str = Field(min_length=1, max_length=50)
    status: str = Field(min_length=1, max_length=50)
    model_answer: str = ""
    corrected_answer: str = ""
    error_type: str = ""
    source_title: str = ""
    source_url: str = ""
    source_excerpt: str = ""
    source_tier: int | None = None
    reviewer_note: str = ""
    correction_of_review_id: str = ""

    def to_record(self) -> dict[str, Any]:
        if hasattr(self, "model_dump"):
            return self.model_dump(exclude_none=True)
        return self.dict(exclude_none=True)


class ReviewFeedbackTransitionRequest(BaseModel):
    status: str = Field(min_length=1, max_length=50)
    model_answer: str | None = None
    corrected_answer: str | None = None
    error_type: str | None = None
    source_title: str | None = None
    source_url: str | None = None
    source_excerpt: str | None = None
    source_tier: int | None = None
    reviewer_note: str | None = None

    def to_updates(self) -> dict[str, Any]:
        if hasattr(self, "model_dump"):
            payload = self.model_dump(exclude_none=True)
        else:
            payload = self.dict(exclude_none=True)
        payload.pop("status", None)
        return payload


def sse_event(event: str, data: dict[str, Any]) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


def public_citation(chunk: dict) -> dict:
    return {
        "chunk_id": chunk.get("chunk_id", ""),
        "source_title": chunk.get("source_title", "Tư liệu không rõ"),
        "source_url": chunk.get("source_url", ""),
        "source_year": chunk.get("source_year", ""),
        "claim_status": chunk.get("claim_status", "established"),
        "source_tier": chunk.get("source_tier"),
        "source_quality_score": chunk.get("source_quality_score"),
        "answer_intents": chunk.get("answer_intents", []),
        "tags": chunk.get("tags", []),
        "fact": compact_text(chunk.get("fact") or chunk.get("text", ""), max_words=80),
    }


def text_blob(*values: Any) -> str:
    return " ".join(str(value or "") for value in values).lower()


def visual_payload(
    query: str,
    answer: str,
    profile: dict,
    result: dict | None = None,
    citations: Iterable[dict] | None = None,
    phase: str = "answering",
) -> dict[str, Any]:
    result = result or {}
    citations = list(citations or [])
    metadata = profile.get("character_metadata", {})
    character_id = profile.get("character_id") or metadata.get("character_id", "")
    death_year = metadata.get("death_year")
    mode = result.get("mode", "")
    state = result.get("state", "talking")
    citation_intents: set[str] = set()
    citation_tags: set[str] = set()
    for citation in citations:
        citation_intents.update(str(item).lower() for item in citation.get("answer_intents", []) or [])
        citation_tags.update(str(item).lower() for item in citation.get("tags", []) or [])

    detected = {item.lower() for item in query_intents(query)}
    combined = text_blob(query, answer, mode, state, " ".join(detected), " ".join(citation_intents), " ".join(citation_tags))

    intent = "historical_fact"
    emotion = "idle"
    motion = "none"
    action = "none"
    asset = "idle.png"

    if phase == "thinking":
        return {
            "phase": "thinking",
            "intent": "retrieval",
            "emotion": "thinking",
            "baseEmotion": "thinking",
            "motion": "thinking" if character_id == "quang_trung" else "none",
            "asset": "thinking.png",
            "action": "loop" if character_id == "quang_trung" else "none",
        }

    route_intent = str((result.get("route") or {}).get("intent", ""))
    if character_id == "quang_trung" and is_quang_trung_self_name_confusion(query, profile):
        return {
            "phase": phase,
            "intent": "identity_confusion",
            "emotion": "confused",
            "baseEmotion": "confused",
            "motion": "none",
            "asset": "confused.png",
            "action": "none",
        }
    if route_intent in {"birth", "origin", "real_name", "death", "identity", "smalltalk", "private_life"}:
        intent = "identity" if route_intent in {"birth", "origin", "real_name", "death", "identity"} else route_intent
        emotion = "idle"
        asset = "idle.png"
        return {
            "phase": phase,
            "intent": intent,
            "emotion": emotion,
            "baseEmotion": emotion,
            "motion": "none",
            "asset": asset,
            "action": "none",
        }

    is_pre_1954_character = isinstance(death_year, int) and death_year < 1954
    if character_id == "quang_trung" and is_quang_trung_self_name_confusion(query, profile):
        intent = "identity_confusion"
        emotion = "confused"
        asset = "confused.png"
    elif mode == "guardrail" or state == "confused" or (
        is_pre_1954_character and "điện biên phủ" in combined
    ) or any(
        marker in combined
        for marker in [
            "facebook",
            "internet",
            "thế chiến",
            "world war",
            "ww2",
            "ww1",
            "sau khi ta đã mất",
            "sau khi bác đã đi xa",
        ]
    ):
        intent = "anachronism"
        emotion = "confused"
        asset = "confused.png"
    elif any(
        marker in combined
        for marker in [
            "battle_reflection",
            "battle_detail",
            "micro_tactics",
            "military",
            "trận",
            "đánh",
            "giặc",
            "quân thanh",
            "quân xiêm",
            "ngọc hồi",
            "đống đa",
            "rạch gầm",
            "xoài mút",
            "bạch đằng",
            "điện biên phủ",
            "xung trận",
            "ngoại xâm",
            "đại phá",
            "đập tan",
        ]
    ):
        intent = "battle_detail"
        if any(
            marker in combined
            for marker in [
                "giặc",
                "quân thanh",
                "quân xiêm",
                "ngoại xâm",
                "xâm lược",
                "xâm lăng",
                "phản bội",
                "hồ đồ",
                "đập tan",
            ]
        ):
            emotion = "angry"
            asset = "angry_2.png"
        elif any(marker in combined for marker in ["chiến thắng", "đại thắng", "hãnh diện", "tự hào", "vinh quang"]):
            emotion = "happy"
            asset = "happy.png"
        else:
            emotion = "angry"
            asset = "angry.png"
        if character_id == "quang_trung":
            motion = "attack"
            action = "play_once"
    elif any(
        marker in combined
        for marker in [
            "dân lầm than",
            "mất mát",
            "hy sinh",
            "tang tóc",
            "đau xót",
            "ruộng hoang",
            "loạn lạc",
            "dang dở",
        ]
    ):
        intent = "suffering"
        emotion = "sad"
        asset = "sad.png"
    elif any(marker in combined for marker in ["tư tưởng", "nhân nghĩa", "khoan thư", "độc lập", "tự do", "đại đoàn kết"]):
        intent = "ideology"
        emotion = "thinking"
        asset = "thinking.png"
    elif any(marker in combined for marker in ["chào", "bạn là ai", "giới thiệu", "tên của ta", "ta là"]):
        intent = "identity"
        emotion = "idle"
        asset = "idle.png"
    elif any(marker in combined for marker in ["cười", "vui", "mừng", "khải hoàn", "vinh"]):
        intent = "smalltalk"
        emotion = "happy"
        asset = "happy.png"

    return {
        "phase": phase,
        "intent": intent,
        "emotion": emotion,
        "baseEmotion": emotion,
        "motion": motion,
        "asset": asset,
        "action": action,
    }


def portrait_url_for(character_id: str) -> str | None:
    asset_dir = get_character_config(character_id)["asset_dir"]
    idle_path = asset_dir / "idle.png"
    if idle_path.exists():
        return f"/assets/{character_id}/idle.png"
    return None


class RuntimeStore:
    def __init__(self) -> None:
        self.profiles: dict[str, dict] = {}
        self.chunks: dict[str, list[dict]] = {}
        self.retrievers: dict[str, VectorRetriever] = {}
        self.sources: dict[str, str] = {}
        self.load_errors: dict[str, str] = {}
        self.loaded = False

    def _load_from_json(self, character_id: str) -> tuple[dict, list[dict], str]:
        return load_profile(character_id), load_chunks(character_id), "json"

    def _store_character(self, character_id: str, profile: dict, chunks: list[dict], source: str) -> None:
        self.profiles[character_id] = profile
        self.chunks[character_id] = chunks
        self.retrievers[character_id] = VectorRetriever(chunks, character_id=character_id)
        self.sources[character_id] = source
        self.load_errors.pop(character_id, None)

    def _load_character_data(self, character_id: str, include_draft: bool = False) -> tuple[dict, list[dict], str]:
        if mongo_enabled() and load_mongo_character and load_mongo_chunks:
            try:
                return (
                    load_mongo_character(character_id, include_draft=include_draft),
                    load_mongo_chunks(character_id, include_draft=include_draft),
                    "mongodb",
                )
            except MongoLoaderError as exc:
                self.load_errors[character_id] = str(exc)
                if include_draft:
                    raise HTTPException(status_code=404, detail="Character is unavailable in MongoDB") from exc
        return self._load_from_json(character_id)

    def preload(self) -> None:
        if self.loaded:
            return
        if mongo_enabled() and list_mongo_characters:
            try:
                for profile in list_mongo_characters():
                    character_id = str(profile.get("character_id") or "").strip()
                    if not character_id:
                        continue
                    chunks = load_mongo_chunks(character_id) if load_mongo_chunks else []
                    self._store_character(character_id, profile, chunks, "mongodb")
                if self.profiles:
                    self.loaded = True
                    return
            except MongoLoaderError as exc:
                self.load_errors["mongodb"] = str(exc)

        for character_id in CHARACTER_REGISTRY:
            profile, chunks, source = self._load_from_json(character_id)
            self._store_character(character_id, profile, chunks, source)
        self.loaded = True

    def character_ids(self) -> list[str]:
        return list(self.profiles.keys())

    def get(self, character_id: str, include_draft: bool = False) -> tuple[dict, VectorRetriever, str]:
        if include_draft and mongo_enabled():
            profile, chunks, source = self._load_character_data(character_id, include_draft=True)
            return profile, VectorRetriever(chunks, character_id=character_id), source
        if character_id not in self.profiles and mongo_enabled():
            profile, chunks, source = self._load_character_data(character_id)
            self._store_character(character_id, profile, chunks, source)
        if character_id not in self.profiles:
            raise HTTPException(status_code=404, detail="Unknown character_id")
        return self.profiles[character_id], self.retrievers[character_id], self.sources.get(character_id, "json")


runtime = RuntimeStore()


def read_jsonl_records(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    records: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                records.append(json.loads(line))
            except json.JSONDecodeError as exc:
                raise HTTPException(status_code=500, detail=f"Invalid JSONL at {path}:{line_number}") from exc
    return records


def write_jsonl_records(path: Path, records: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        for record in records:
            handle.write(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n")


def export_admin_approved_knowledge() -> dict[str, Any]:
    feedback_root = default_feedback_root()
    return export_approved_feedback(feedback_root / "approved.jsonl", feedback_root / DEFAULT_OUTPUT_NAME)


def rebuild_character_dataset(character_id: str) -> dict[str, Any]:
    if character_id not in CHARACTER_REGISTRY:
        raise HTTPException(status_code=400, detail="Unknown character_id")

    export_result = export_admin_approved_knowledge()
    approved_records = [
        record
        for record in read_jsonl_records(Path(export_result["output_path"]))
        if str(record.get("character_id") or record.get("char_id") or "") == character_id
    ]
    knowledge_path = knowledge_path_for(character_id)
    existing_records = read_jsonl_records(knowledge_path)
    merged: dict[str, dict[str, Any]] = {}
    for record in existing_records:
        chunk_id = str(record.get("chunk_id") or "").strip()
        if chunk_id:
            merged[chunk_id] = record
    for record in approved_records:
        chunk_id = str(record.get("chunk_id") or "").strip()
        if chunk_id:
            merged[chunk_id] = record

    write_jsonl_records(knowledge_path, list(merged.values()))
    profile, chunks, source = runtime._load_from_json(character_id)
    runtime._store_character(character_id, profile, chunks, source)
    runtime.loaded = True
    return {
        "ok": True,
        "character_id": character_id,
        "knowledge_path": str(knowledge_path),
        "approved_merged": len(approved_records),
        "total_chunks": len(merged),
        "export": export_result,
    }


@asynccontextmanager
async def lifespan(_: FastAPI):
    runtime.preload()
    yield


app = FastAPI(title="History Ontology Simulation API", version="2.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

ASSET_ROOT = LEGACY_WEB_DIR / "assets"
if ASSET_ROOT.exists():
    app.mount("/assets", StaticFiles(directory=ASSET_ROOT), name="assets")


@app.get("/api/health")
def health() -> dict:
    if not runtime.loaded:
        runtime.preload()
    return {
        "ok": True,
        "runtime": "fastapi",
        "characters_loaded": runtime.character_ids(),
        "data_sources": runtime.sources,
        "load_errors": runtime.load_errors,
        "llm_configured": llm_is_configured(),
    }


@app.get("/admin/review-feedback/latest")
def latest_review_feedback(character_id: str, question: str) -> dict:
    record = find_latest_feedback_for_question(character_id, question)
    return {"ok": True, "feedback": record}


@app.post("/admin/review-feedback")
def create_review_feedback(request: ReviewFeedbackRequest) -> dict:
    try:
        record = save_feedback(request.to_record())
    except FeedbackValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"ok": True, "feedback": record}


@app.post("/admin/review-feedback/{review_id}/transition")
def transition_review_feedback(review_id: str, request: ReviewFeedbackTransitionRequest) -> dict:
    try:
        record = transition_feedback(review_id, request.status, request.to_updates())
    except FeedbackValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"ok": True, "feedback": record}


@app.delete("/admin/review-feedback/{review_id}")
def delete_review_feedback(review_id: str) -> dict:
    try:
        result = delete_feedback(review_id)
    except FeedbackValidationError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"ok": True, **result}


@app.get("/admin/review-feedback/pending")
def pending_review_feedback(bucket: str = "reviews") -> dict:
    if bucket not in {"reviews", "approved", "rejected"}:
        raise HTTPException(status_code=400, detail="bucket must be reviews, approved, or rejected")
    return {"ok": True, "bucket": bucket, "feedback": list_feedback(bucket=bucket)}


@app.post("/admin/knowledge/export-approved")
def export_approved_knowledge() -> dict:
    return export_admin_approved_knowledge()


@app.post("/admin/knowledge/rebuild-index")
def rebuild_knowledge_index(character_id: str = DEFAULT_CHARACTER_ID) -> dict:
    return rebuild_character_dataset(character_id)


@app.post("/admin/cache/reload")
def reload_cache() -> dict:
    runtime.preload()
    return {"message": "Cache reloaded successfully"}


@app.get("/api/characters")
def characters() -> dict:
    if not runtime.loaded:
        runtime.preload()
    payload = []
    for character_id, profile in runtime.profiles.items():
        config = get_character_config(character_id) if character_id in CHARACTER_REGISTRY else {}
        metadata = profile.get("character_metadata", {})
        display_name = metadata.get("display_name") or metadata.get("name") or config.get("display_name") or character_id
        payload.append(
            {
                "character_id": character_id,
                "display_name": display_name,
                "era": metadata.get("era", ""),
                "death_year": metadata.get("death_year"),
                "edge_cases": config.get("edge_cases", []),
                "portrait_url": metadata.get("portrait_url") or (portrait_url_for(character_id) if character_id in CHARACTER_REGISTRY else None),
                "data_source": runtime.sources.get(character_id, "json"),
            }
        )
    return {"characters": payload, "default_character_id": DEFAULT_CHARACTER_ID}


def fast_local_retrieval_enabled() -> bool:
    return os.getenv("FAST_LOCAL_RETRIEVAL", "1").strip().lower() not in {"0", "false", "no", "off"}


def should_stream_with_gemini(query: str, profile: dict, result: dict, route_llm_status: str) -> bool:
    route_intent = str((result.get("route") or {}).get("intent", ""))
    policy = profile.get("ai_policy", {}) if isinstance(profile.get("ai_policy"), dict) else {}
    if not policy.get("gemini_synthesis_enabled", True):
        return False
    if fast_local_retrieval_enabled() and route_llm_status == "skipped" and result.get("mode") == "rag_grounded":
        return False
    return (
        llm_is_configured()
        and route_llm_status not in {"quota_exhausted", "auth_error", "invalid_model", "not_configured"}
        and result.get("state") == "talking"
        and result.get("mode") not in {"out_of_scope", "no_evidence", "rag_weak", "smalltalk", "conversation", "factual"}
        and route_intent not in {"smalltalk", "identity", "birth", "origin", "real_name", "death", "private_life", "anachronism_trap"}
        and not is_identity_query(query)
        and not is_private_life_query(query)
        and not is_legacy_afterlife_query(query, profile)
    )


def tokenized_fallback(answer: str) -> Iterator[str]:
    words = answer.split(" ")
    for index, word in enumerate(words):
        if index:
            yield " "
        yield word


def compact_source_evidence(citations: list[dict]) -> list[dict[str, Any]]:
    evidence = []
    for citation in citations:
        evidence.append(
            {
                "chunk_id": citation.get("chunk_id", ""),
                "source_title": citation.get("source_title", "Tư liệu chưa rõ"),
                "source_url": citation.get("source_url", ""),
                "source_year": citation.get("source_year", ""),
                "source_tier": citation.get("source_tier"),
                "source_excerpt": citation.get("source_excerpt") or citation.get("fact") or citation.get("text", ""),
                "claim_status": citation.get("claim_status", "established"),
            }
        )
    return evidence


def answer_origin_for(mode: str, data_source: str, fallback_used: bool) -> str:
    if mode in {"synthesized_grounded", "prior_knowledge", "cross_character_prior"} or data_source in {
        "gemini_prior_knowledge",
        "gemini_cross_character",
    }:
        return "gemini"
    if fallback_used and mode in {"rag_weak", "no_evidence", "out_of_scope"}:
        return "rag"
    return "rag"


CROSS_CHARACTER_HARD_FALLBACK = "Câu hỏi này nói về một bậc tiền nhân ngoài phần ký ức chính của ta."


LOCAL_FIRST_INTENTS = {
    "smalltalk",
    "identity",
    "birth",
    "origin",
    "real_name",
    "death",
    "private_life",
    "anachronism_trap",
    "history_battle",
    "philosophy",
}


def should_skip_llm_router(local_route: dict) -> bool:
    try:
        confidence = float(local_route.get("confidence", 0.0) or 0.0)
    except (TypeError, ValueError):
        confidence = 0.0
    intent = str(local_route.get("intent", ""))
    if intent in {"history_battle", "philosophy"} and not fast_local_retrieval_enabled():
        return False
    threshold = 0.7 if intent in {"history_battle", "philosophy"} else 0.8
    return intent in LOCAL_FIRST_INTENTS and confidence >= threshold


def timing_payload(started_at: float, marks: dict[str, float], *keys: str) -> dict[str, int]:
    payload: dict[str, int] = {}
    for key in keys:
        value = marks.get(key)
        if value is not None:
            payload[f"{key}_ms"] = int((value - started_at) * 1000)
    payload["total_ms"] = int((time.perf_counter() - started_at) * 1000)
    return payload


def stream_chat_response(request: ChatStreamRequest) -> Iterator[str]:
    try:
        started_at = time.perf_counter()
        marks: dict[str, float] = {}
        requested_character_id = request.character_id.strip() or DEFAULT_CHARACTER_ID
        character_id = requested_character_id if requested_character_id in runtime.profiles or mongo_enabled() else DEFAULT_CHARACTER_ID
        profile, retriever, data_source = runtime.get(character_id, include_draft=request.include_draft)
        query = request.message.strip()
        thinking_visual = visual_payload(query, "", profile, phase="thinking")
        yield sse_event(
            "start",
            {
                "character_id": character_id,
                "status": "Đang gợi ký ức",
                "visual": thinking_visual,
                "data_source": data_source,
            },
        )

        local_route = local_route_query(query, profile)
        if should_skip_llm_router(local_route) or not llm_is_configured():
            router_response = {
                "ok": False,
                "llm_status": "skipped" if llm_is_configured() else "not_configured",
                "route": None,
            }
            route = local_route
            route_source = "deterministic"
            route_llm_status = str(router_response["llm_status"])
        else:
            router_response = route_query_json(query, profile)
            if router_response.get("ok") and router_response.get("route"):
                route = router_response["route"]
                route["source"] = "llm"
                route_source = "llm"
                route_llm_status = "ok"
            else:
                route = local_route
                route_source = "deterministic"
                route_llm_status = str(router_response.get("llm_status", "router_fallback"))
        marks["route"] = time.perf_counter()

        if is_cross_character_query(query, profile):
            route = {
                **route,
                "intent": "cross_character",
                "needs_rag": False,
                "source": route_source,
            }
            marks["retrieval"] = time.perf_counter()
            result = {
                "mode": "cross_character_prior",
                "state": "talking",
                "citations": [],
                "route": route,
                "data_source": "gemini_cross_character",
                "citation_warning": True,
            }
            citations: list[dict] = []
            llm_status = route_llm_status
            fallback_used = False
            yield sse_event(
                "retrieval",
                {
                    "mode": result["mode"],
                    "state": result["state"],
                    "citations": citations,
                    "route": route,
                    "route_source": route_source,
                    "llm_status": llm_status,
                    "fallback_used": fallback_used,
                    "timings_ms": timing_payload(started_at, marks, "route", "retrieval"),
                    "data_source": result["data_source"],
                },
            )
            early_visual = visual_payload(query, "", profile, result, citations, phase="answering")
            yield sse_event(
                "stream_start",
                {
                    "intent": early_visual["intent"],
                    "emotion": early_visual["emotion"],
                    "visual": early_visual,
                },
            )
            collected: list[str] = []
            emitted_stream = False
            try:
                for token in stream_cross_character_persona_answer(query, profile):
                    emitted_stream = True
                    if "first_token" not in marks:
                        marks["first_token"] = time.perf_counter()
                    collected.append(token)
                    yield sse_event("token", {"text": token})
                final_answer = "".join(collected).strip()
            except GeminiCallError as exc:
                llm_status = exc.kind
                final_answer = ""
            if not final_answer:
                fallback_used = True
                final_answer = CROSS_CHARACTER_HARD_FALLBACK
                result = {**result, "mode": "cross_character_fallback", "data_source": data_source}
                for token in tokenized_fallback(final_answer):
                    if "first_token" not in marks:
                        marks["first_token"] = time.perf_counter()
                    yield sse_event("token", {"text": token})
            final_data_source = result.get("data_source", data_source)
            source_evidence: list[dict[str, Any]] = []
            marks["final"] = time.perf_counter()
            yield sse_event(
                "final",
                {
                    "answer": final_answer,
                    "mode": result.get("mode", "cross_character_prior"),
                    "state": result["state"],
                    "citations": citations,
                    "source_evidence": source_evidence,
                    "answer_origin": answer_origin_for(result.get("mode", ""), final_data_source, fallback_used),
                    "requires_review": True,
                    "route": route,
                    "route_source": route_source,
                    "llm_status": llm_status,
                    "fallback_used": fallback_used,
                    "timings_ms": timing_payload(started_at, marks, "route", "retrieval", "first_token", "final"),
                    "visual": visual_payload(query, final_answer, profile, result, citations, phase="answering"),
                    "data_source": final_data_source,
                    "citation_warning": True,
                    "stream_emitted": emitted_stream,
                },
            )
            return

        result = answer_query(query, profile, retriever, generator=None, evidence_judge=judge_rag_evidence, route=route)
        marks["retrieval"] = time.perf_counter()
        citations = [public_citation(chunk) for chunk in result.get("citations", [])]
        fallback_used = bool(result.get("fallback_used", False))
        llm_status = route_llm_status
        yield sse_event(
            "retrieval",
            {
                "mode": result.get("mode", "retrieval"),
                "state": result.get("state", "talking"),
                "citations": citations,
                "route": route,
                "route_source": route_source,
                "llm_status": llm_status,
                "fallback_used": fallback_used,
                "timings_ms": timing_payload(started_at, marks, "route", "retrieval"),
                "data_source": data_source,
            },
        )

        fallback_answer = result.get("answer", "")
        final_answer = fallback_answer
        mode = result.get("mode", "retrieval")
        policy = profile.get("ai_policy", {}) if isinstance(profile.get("ai_policy"), dict) else {}
        if mode in {"rag_weak", "no_evidence"} and policy.get("allow_gemini_prior_knowledge") and policy.get("prior_knowledge_policy") != "disabled":
            prior_answer = generate_prior_knowledge_answer(query, profile)
            if prior_answer:
                fallback_answer = prior_answer
                final_answer = prior_answer
                mode = "prior_knowledge"
                result = {**result, "mode": mode, "data_source": "gemini_prior_knowledge", "citation_warning": True}
                citations = []
                fallback_used = False
                llm_status = "ok"
        emitted_stream = False
        early_visual = visual_payload(query, fallback_answer, profile, result, citations, phase="answering")
        yield sse_event(
            "stream_start",
            {
                "intent": early_visual["intent"],
                "emotion": early_visual["emotion"],
                "visual": early_visual,
            },
        )

        if should_stream_with_gemini(query, profile, result, route_llm_status):
            collected: list[str] = []
            try:
                for token in stream_fused_generation(query, profile, result.get("citations", []), route=route):
                    emitted_stream = True
                    if "first_token" not in marks:
                        marks["first_token"] = time.perf_counter()
                    collected.append(token)
                    yield sse_event("token", {"text": token})
                raw_answer = "".join(collected).strip()
                if raw_answer:
                    final_answer = raw_answer
                    mode = "synthesized_grounded"
                    result = {**result, "mode": mode}
                    llm_status = "ok"
                    fallback_used = False
            except GeminiCallError as exc:
                llm_status = exc.kind
                fallback_used = True
            if not emitted_stream:
                for token in tokenized_fallback(fallback_answer):
                    if "first_token" not in marks:
                        marks["first_token"] = time.perf_counter()
                    yield sse_event("token", {"text": token})
                final_answer = fallback_answer
        else:
            fallback_used = True
            for token in tokenized_fallback(fallback_answer):
                if "first_token" not in marks:
                    marks["first_token"] = time.perf_counter()
                yield sse_event("token", {"text": token})

        final_data_source = result.get("data_source", data_source)
        answer_origin = answer_origin_for(mode, final_data_source, fallback_used)
        source_evidence = compact_source_evidence(citations)
        marks["final"] = time.perf_counter()
        yield sse_event(
            "final",
            {
                "answer": final_answer,
                "mode": mode,
                "state": result.get("state", "talking"),
                "citations": citations,
                "source_evidence": source_evidence,
                "answer_origin": answer_origin,
                "requires_review": answer_origin == "gemini" or mode in {"rag_weak", "no_evidence", "synthesized_grounded", "prior_knowledge"},
                "route": route,
                "route_source": route_source,
                "llm_status": llm_status,
                "fallback_used": fallback_used,
                "timings_ms": timing_payload(started_at, marks, "route", "retrieval", "first_token", "final"),
                "visual": visual_payload(query, final_answer, profile, {**result, "mode": mode}, citations, phase="answering"),
                "data_source": final_data_source,
                "template_id": result.get("template_id"),
                "template_status": result.get("template_status"),
                "template_match_score": result.get("template_match_score"),
                "must_cover_hit": result.get("must_cover_hit", []),
                "avoid_hit": result.get("avoid_hit", []),
                "evidence_status": result.get("evidence_status"),
                "llm_judge_status": result.get("llm_judge_status"),
                "relevance_score": result.get("relevance_score"),
                "judge_reason": result.get("judge_reason"),
                "missing_topics": result.get("missing_topics", []),
                "usable_chunk_ids": result.get("usable_chunk_ids", []),
                "answer_plan": result.get("answer_plan", []),
                "citation_warning": bool(result.get("citation_warning", False)),
            },
        )
    except Exception as exc:
        if os.getenv("HISTORY_DEBUG_ERRORS") == "1":
            traceback.print_exc()
        yield sse_event("error", {"message": "Không tạo được câu trả lời trong lượt này.", "detail": str(exc)})


@app.post("/api/chat/stream")
def chat_stream(request: ChatStreamRequest) -> StreamingResponse:
    if not runtime.loaded:
        runtime.preload()
    return StreamingResponse(
        stream_chat_response(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@app.post("/api/tts")
def tts(request: TTSRequest) -> dict:
    character_id = request.character_id if request.character_id in CHARACTER_REGISTRY else DEFAULT_CHARACTER_ID
    result = synthesize(request.text, character_id)
    return {
        "ok": result.ok,
        "audio_base64": result.audio_base64,
        "mime_type": result.mime_type,
        "message": result.message,
    }
