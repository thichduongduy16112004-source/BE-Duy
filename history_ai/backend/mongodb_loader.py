from __future__ import annotations

import os
from functools import lru_cache
from typing import Any

from pymongo import MongoClient
from pymongo.database import Database

from rag_core import normalize_knowledge_chunk, normalize_profile

DEFAULT_DATABASE_NAME = "historyalive"


class MongoLoaderError(RuntimeError):
    pass


@lru_cache(maxsize=1)
def _client() -> MongoClient | None:
    uri = os.getenv("RAG_MONGODB_URI") or os.getenv("MONGODB_URI")
    if not uri:
        return None
    return MongoClient(uri, serverSelectionTimeoutMS=2500)


def _database_name() -> str:
    return os.getenv("RAG_MONGODB_DB", DEFAULT_DATABASE_NAME).strip() or DEFAULT_DATABASE_NAME


def get_database() -> Database | None:
    client = _client()
    if client is None:
        return None
    return client[_database_name()]


def mongo_enabled() -> bool:
    return os.getenv("RAG_DATA_SOURCE", "json").strip().lower() in {"mongo", "mongodb"}


def _require_database() -> Database:
    db = get_database()
    if db is None:
        raise MongoLoaderError("MongoDB is not configured for RAG service")
    try:
        db.command("ping")
    except Exception as exc:
        raise MongoLoaderError("MongoDB is not reachable for RAG service") from exc
    return db


def _character_id(doc: dict[str, Any]) -> str:
    character_id = str(doc.get("character_id") or doc.get("char_id") or "").strip()
    if not character_id:
        raise MongoLoaderError("MongoDB character document is missing character_id")
    return character_id


def _normalize_profile(doc: dict[str, Any]) -> dict[str, Any]:
    character_id = _character_id(doc)
    profile = dict(doc.get("profile") or {})
    profile.pop("_id", None)
    profile["character_id"] = str(profile.get("character_id") or character_id).strip()

    metadata = dict(profile.get("character_metadata") or {})
    metadata.setdefault("character_id", character_id)
    metadata.setdefault("name", doc.get("display_name") or character_id)
    metadata.setdefault("display_name", doc.get("display_name") or metadata.get("name") or character_id)
    metadata.setdefault("era", doc.get("era", ""))
    metadata.setdefault("death_year", doc.get("death_year"))
    if doc.get("portrait_url") and not metadata.get("portrait_url"):
        metadata["portrait_url"] = doc["portrait_url"]
    profile["character_metadata"] = metadata

    if doc.get("personality_prompt") and not profile.get("persona_prompt"):
        profile["persona_prompt"] = doc["personality_prompt"]
    if doc.get("short_bio") and not profile.get("short_bio"):
        profile["short_bio"] = doc["short_bio"]
    if doc.get("ai_policy") and not profile.get("ai_policy"):
        profile["ai_policy"] = doc["ai_policy"]
    return normalize_profile(profile, character_id)


def _normalize_chunk(doc: dict[str, Any]) -> dict[str, Any]:
    character_id = _character_id(doc)
    chunk = {key: value for key, value in doc.items() if key != "_id"}
    try:
        return normalize_knowledge_chunk(chunk, character_id)
    except ValueError as exc:
        raw_id = str(doc.get("chunk_id") or doc.get("_id") or "unknown")
        raise MongoLoaderError(f"Invalid MongoDB knowledge chunk '{raw_id}': {exc}") from exc


def list_active_characters() -> list[dict[str, Any]]:
    db = _require_database()
    cursor = db["characters"].find({"status": "active"}).sort([("display_name", 1), ("character_id", 1)])
    return [_normalize_profile(doc) for doc in cursor]


def load_character(character_id: str, include_draft: bool = False) -> dict[str, Any]:
    db = _require_database()
    statuses = ["active", "draft"] if include_draft else ["active"]
    doc = db["characters"].find_one({"character_id": character_id, "status": {"$in": statuses}})
    if not doc:
        raise MongoLoaderError(f"Character '{character_id}' was not found in MongoDB")
    return _normalize_profile(doc)


def load_chunks(character_id: str, include_draft: bool = False) -> list[dict[str, Any]]:
    db = _require_database()
    query: dict[str, Any] = {"character_id": character_id}
    if not include_draft:
        query["status"] = {"$in": ["active", None]}
    cursor = db["knowledge_chunks"].find(query).sort([("source_quality_score", -1), ("chunk_id", 1)])
    chunks = [_normalize_chunk(doc) for doc in cursor]
    if not chunks:
        raise MongoLoaderError(f"No knowledge chunks found for '{character_id}' in MongoDB")
    return chunks
