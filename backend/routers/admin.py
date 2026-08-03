import base64
import csv
import io
import json
from datetime import datetime, timedelta
from typing import Any, Literal

from bson import ObjectId
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Response, UploadFile, status
from pydantic import BaseModel, Field, field_validator, model_validator
from pymongo.errors import DuplicateKeyError

from core.database import get_database
from core.permissions import require_admin
from core.serializers import serialize_doc, serialize_docs
from models.lesson import LessonCreate, LessonUpdate
from models.edu import AdminClassCreate, AdminClassUpdate
from models.system import SystemSettings, SystemSettingsUpdate
from services.rag_client import RagServiceError, RagServiceUnavailable, stream_chat, notify_reload_cache
from services.token_usage_service import TOKEN_USAGE_COLLECTION

router = APIRouter(prefix="/admin", tags=["Admin"])

CharacterStatus = Literal["draft", "active", "archived"]
ClaimStatus = Literal["verified", "disputed", "contextual"]
MAX_PORTRAIT_BYTES = 1024 * 1024
ALLOWED_PORTRAIT_TYPES = {"image/jpeg", "image/png", "image/webp"}


class PersonaContext(BaseModel):
    role_name: str = Field(default="", max_length=160)
    era_context: str = Field(default="", max_length=500)
    tone: str = Field(default="", max_length=500)
    target_audience: str = Field(default="general", max_length=120)
    speaking_rules: list[str] = Field(default_factory=list, max_length=30)
    historical_scope: str = Field(default="", max_length=1000)
    sensitive_topics: list[str] = Field(default_factory=list, max_length=30)

    @field_validator("speaking_rules", "sensitive_topics")
    @classmethod
    def normalize_text_list(cls, values: list[str]) -> list[str]:
        return [value.strip() for value in values if value.strip()][:30]


class RagTemplate(BaseModel):
    intent: str = Field(min_length=1, max_length=80, pattern=r"^[a-z0-9][a-z0-9_-]*$")
    display_name: str = Field(default="", max_length=160)
    sample_questions: list[str] = Field(default_factory=list, max_length=20)
    rag_queries: list[str] = Field(default_factory=list, max_length=20)
    must_cover: list[str] = Field(default_factory=list, max_length=30)
    avoid: list[str] = Field(default_factory=list, max_length=30)
    expected_answer_outline: list[str] = Field(default_factory=list, max_length=20)

    @field_validator("sample_questions", "rag_queries", "must_cover", "avoid", "expected_answer_outline")
    @classmethod
    def normalize_template_list(cls, values: list[str]) -> list[str]:
        return [value.strip() for value in values if value.strip()][:30]


class AiPolicy(BaseModel):
    answer_style: str = Field(default="roleplay_educational", max_length=80)
    max_answer_words: int = Field(default=220, ge=40, le=500)
    min_answer_words: int = Field(default=60, ge=20, le=250)
    allowed_topics: list[str] = Field(default_factory=lambda: ["history", "biography", "battle", "strategy", "culture"], max_length=20)
    blocked_topics: list[str] = Field(default_factory=lambda: ["politics_current", "medical", "financial", "adult", "violence_instruction"], max_length=20)
    rag_required: bool = True
    allow_gemini_prior_knowledge: bool = False
    web_fallback_enabled: bool = False
    citation_required: bool = True
    gemini_judge_enabled: bool = False
    gemini_synthesis_enabled: bool = True
    prior_knowledge_policy: Literal["disabled", "allowed_with_warning", "general_history_only"] = "disabled"
    out_of_scope_response: str = Field(
        default="Ta chỉ có thể bàn về sử liệu và bối cảnh lịch sử liên quan đến nhân vật này.",
        max_length=500,
    )

    @field_validator("allowed_topics", "blocked_topics")
    @classmethod
    def normalize_topics(cls, topics: list[str]) -> list[str]:
        normalized = [topic.strip() for topic in topics if topic.strip()]
        return normalized[:20]

    @model_validator(mode="after")
    def normalize_word_range(self) -> "AiPolicy":
        if self.min_answer_words > self.max_answer_words:
            self.min_answer_words = min(60, self.max_answer_words)
        if not self.allow_gemini_prior_knowledge:
            self.prior_knowledge_policy = "disabled"
        return self


class CharacterCreate(BaseModel):
    character_id: str = Field(min_length=2, max_length=80, pattern=r"^[a-z0-9][a-z0-9_-]*$")
    display_name: str = Field(min_length=1, max_length=160)
    era: str = Field(default="", max_length=160)
    death_year: int | None = None
    short_bio: str = Field(default="", max_length=2000)
    personality_prompt: str = Field(default="", max_length=6000)
    portrait_url: str = Field(default="", max_length=800000)
    tts_voice_id: str = Field(default="vi-VN-default", max_length=120)
    status: CharacterStatus = "draft"
    ai_policy: AiPolicy = Field(default_factory=AiPolicy)
    persona_context: PersonaContext = Field(default_factory=PersonaContext)
    rag_templates: list[RagTemplate] = Field(default_factory=list, max_length=30)


class CharacterUpdate(BaseModel):
    display_name: str | None = Field(default=None, min_length=1, max_length=160)
    era: str | None = Field(default=None, max_length=160)
    death_year: int | None = None
    short_bio: str | None = Field(default=None, max_length=2000)
    personality_prompt: str | None = Field(default=None, max_length=6000)
    portrait_url: str | None = Field(default=None, max_length=800000)
    tts_voice_id: str | None = Field(default=None, max_length=120)
    status: CharacterStatus | None = None
    ai_policy: AiPolicy | None = None
    persona_context: PersonaContext | None = None
    rag_templates: list[RagTemplate] | None = Field(default=None, max_length=30)


class InferRequest(BaseModel):
    character_id: str
    message: str = Field(min_length=1, max_length=4000)
    include_draft: bool = True


async def _ensure_indexes(db) -> None:
    await db["characters"].create_index("character_id", unique=True)
    await db["characters"].create_index("status")
    await db["knowledge_chunks"].create_index("character_id")
    await db["knowledge_chunks"].create_index("chunk_id", unique=True)
    await db["knowledge_chunks"].create_index([("text", "text"), ("fact", "text")])
    await db["admin_audit_logs"].create_index("timestamp")


async def log_admin_action(db, admin_id: str, action: str, target_id: str = "", details: dict[str, Any] | None = None) -> None:
    await db["admin_audit_logs"].insert_one(
        {
            "admin_id": admin_id,
            "action": action,
            "target_id": target_id,
            "details": details or {},
            "timestamp": datetime.utcnow(),
        }
    )


def _build_user_query(search: str | None, role: str | None, user_status: str | None, subscription: str | None) -> dict[str, Any]:
    query: dict[str, Any] = {}
    if search:
        query["$or"] = [
            {"email": {"$regex": search.strip(), "$options": "i"}},
            {"full_name": {"$regex": search.strip(), "$options": "i"}},
            {"name": {"$regex": search.strip(), "$options": "i"}},
            {"username": {"$regex": search.strip(), "$options": "i"}},
        ]
    if role:
        query["role"] = role
    if user_status:
        query["status"] = user_status
    if subscription:
        query["subscription_type"] = subscription
    return query


def _default_settings_doc() -> dict[str, Any]:
    return {"_id": "default", **SystemSettings().model_dump(), "updated_at": datetime.utcnow()}


def _normalize_payment(payment: dict[str, Any], user: dict[str, Any] | None = None) -> dict[str, Any]:
    return {
        "id": str(payment.get("_id", "")),
        "user_id": str(payment.get("user_id", "")),
        "email": (user or {}).get("email", ""),
        "amount": int(payment.get("amount") or 0),
        "plan_type": payment.get("plan_type") or payment.get("plan") or "monthly",
        "payment_gateway": payment.get("payment_gateway") or "PayOS",
        "status": payment.get("status") or "unknown",
        "order_code": payment.get("order_code"),
        "created_at": payment.get("created_at"),
        "completed_at": payment.get("completed_at"),
    }


def _csv_response(rows: list[dict[str, Any]]) -> Response:
    output = io.StringIO()
    fieldnames = ["id", "user_id", "email", "amount", "plan_type", "payment_gateway", "status", "order_code", "created_at"]
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    for row in rows:
        writer.writerow({key: row.get(key, "") for key in fieldnames})
    return Response(
        content=output.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=transactions.csv"},
    )


def _default_ai_policy() -> dict[str, Any]:
    return AiPolicy().model_dump()


def _default_persona_context() -> dict[str, Any]:
    return PersonaContext().model_dump()


def _normalize_rag_templates(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    normalized: list[dict[str, Any]] = []
    for item in value[:30]:
        if not isinstance(item, dict):
            continue
        try:
            normalized.append(RagTemplate(**item).model_dump())
        except ValueError:
            continue
    return normalized


def _serialize_character(character: dict[str, Any]) -> dict[str, Any]:
    doc = serialize_doc(character)
    doc["ai_policy"] = {**_default_ai_policy(), **(doc.get("ai_policy") or {})}
    doc["persona_context"] = {**_default_persona_context(), **(doc.get("persona_context") or {})}
    doc["rag_templates"] = _normalize_rag_templates(doc.get("rag_templates"))
    return doc


def _serialize_characters(characters: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [_serialize_character(character) for character in characters]


def _non_admin_user_query(extra: dict[str, Any] | None = None) -> dict[str, Any]:
    query: dict[str, Any] = {"role": {"$ne": "admin"}}
    if extra:
        query.update(extra)
    return query


def _range_boundaries(now: datetime) -> dict[str, datetime]:
    start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
    return {
        "today": start_of_today,
        "last_24h": now - timedelta(hours=24),
        "last_7d": now - timedelta(days=7),
        "last_30d": now - timedelta(days=30),
    }


def _series_label(date_value: Any, range_key: str) -> str:
    if isinstance(date_value, str):
        return date_value[-5:] if range_key in {"today", "last_24h"} else date_value[5:]
    return str(date_value)


async def _aggregate_time_series(
    collection,
    match_query: dict[str, Any],
    date_field: str,
    value_field: str | None,
    start_at: datetime,
    range_key: str,
) -> list[dict[str, Any]]:
    date_format = "%Y-%m-%d %H:00" if range_key in {"today", "last_24h"} else "%Y-%m-%d"
    group_value: Any = {"$sum": f"${value_field}"} if value_field else {"$sum": 1}
    rows = await collection.aggregate(
        [
            {"$match": {**match_query, date_field: {"$gte": start_at}}},
            {"$group": {"_id": {"$dateToString": {"format": date_format, "date": f"${date_field}"}}, "value": group_value}},
            {"$sort": {"_id": 1}},
        ]
    ).to_list(length=200)
    return [{"date": row.get("_id"), "label": _series_label(row.get("_id"), range_key), "value": int(row.get("value") or 0)} for row in rows]


async def _aggregate_active_user_series(db, start_at: datetime, range_key: str) -> list[dict[str, Any]]:
    date_format = "%Y-%m-%d %H:00" if range_key in {"today", "last_24h"} else "%Y-%m-%d"
    rows = await db["chat_sessions"].aggregate(
        [
            {"$match": {"created_at": {"$gte": start_at}, "user_id": {"$exists": True, "$ne": None}}},
            {
                "$group": {
                    "_id": {
                        "bucket": {"$dateToString": {"format": date_format, "date": "$created_at"}},
                        "user_id": "$user_id",
                    }
                }
            },
            {"$group": {"_id": "$_id.bucket", "value": {"$sum": 1}}},
            {"$sort": {"_id": 1}},
        ]
    ).to_list(length=200)
    return [{"date": row.get("_id"), "label": _series_label(row.get("_id"), range_key), "value": int(row.get("value") or 0)} for row in rows]


async def _aggregate_token_totals(db) -> dict[str, int]:
    rows = await db[TOKEN_USAGE_COLLECTION].aggregate(
        [
            {
                "$group": {
                    "_id": None,
                    "requests": {"$sum": "$request_count"},
                    "input_tokens": {"$sum": "$input_tokens"},
                    "output_tokens": {"$sum": "$output_tokens"},
                    "total_tokens": {"$sum": "$total_tokens"},
                }
            }
        ]
    ).to_list(length=1)
    totals = rows[0] if rows else {}
    return {
        "requests": int(totals.get("requests") or 0),
        "input_tokens": int(totals.get("input_tokens") or 0),
        "output_tokens": int(totals.get("output_tokens") or 0),
        "total_tokens": int(totals.get("total_tokens") or 0),
    }


@router.get("/stats")
async def get_admin_stats(current_admin: dict = Depends(require_admin)):
    db = get_database()
    now = datetime.utcnow()
    ranges = _range_boundaries(now)
    user_query = _non_admin_user_query()
    completed_payments = {"status": {"$in": ["completed", "SUCCESS", "PAID", "success"]}}

    total_users = await db["users"].count_documents(user_query)
    total_lessons = await db["lessons"].count_documents({})
    premium_users = await db["users"].count_documents(_non_admin_user_query({"subscription_type": "premium"}))
    total_chats = await db["chat_sessions"].count_documents({})
    manager_count = await db["users"].count_documents({"role": "manager"})

    range_metrics: dict[str, dict[str, int]] = {}
    analytics_series: dict[str, dict[str, list[dict[str, Any]]]] = {}
    token_metrics = await _aggregate_token_totals(db)
    token_logs = db[TOKEN_USAGE_COLLECTION]
    for range_key, start_at in ranges.items():
        range_metrics[range_key] = {
            "new_users": await db["users"].count_documents(_non_admin_user_query({"created_at": {"$gte": start_at}})),
        }
        analytics_series[range_key] = {
            "user": await _aggregate_time_series(db["users"], user_query, "created_at", None, start_at, range_key),
            "revenue": await _aggregate_time_series(db["payments"], completed_payments, "created_at", "amount", start_at, range_key),
            "active_users": await _aggregate_active_user_series(db, start_at, range_key),
            "requests": await _aggregate_time_series(token_logs, {}, "created_at", "request_count", start_at, range_key),
            "input_tokens": await _aggregate_time_series(token_logs, {}, "created_at", "input_tokens", start_at, range_key),
            "output_tokens": await _aggregate_time_series(token_logs, {}, "created_at", "output_tokens", start_at, range_key),
            "total_tokens": await _aggregate_time_series(token_logs, {}, "created_at", "total_tokens", start_at, range_key),
        }

    today_active_user_ids = {
        str(user_id)
        for user_id in await db["users"].distinct("_id", _non_admin_user_query({"last_active_at": {"$gte": ranges["today"]}}))
    }
    today_chat_user_ids = {
        str(user_id)
        for user_id in await db["chat_sessions"].distinct("user_id", {"created_at": {"$gte": ranges["today"]}})
        if user_id
    }
    active_users_today = len(today_active_user_ids | today_chat_user_ids)

    revenue_result = await db["payments"].aggregate([
        {"$match": completed_payments},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}, "count": {"$sum": 1}}},
    ]).to_list(length=1)
    total_revenue = int((revenue_result[0] if revenue_result else {}).get("total") or 0)
    transaction_count = int((revenue_result[0] if revenue_result else {}).get("count") or 0)

    return {
        "total_users": total_users,
        "total_lessons": total_lessons,
        "premium_users": premium_users,
        "total_chats": total_chats,
        "user_metrics": {
            "total_users": total_users,
            "new_users_today": range_metrics["today"]["new_users"],
            "new_users_24h": range_metrics["last_24h"]["new_users"],
            "new_users_7d": range_metrics["last_7d"]["new_users"],
            "new_users_30d": range_metrics["last_30d"]["new_users"],
            "active_users_today": active_users_today,
            "premium_users": premium_users,
            "manager_count": manager_count,
        },
        "range_metrics": range_metrics,
        "analytics_series": analytics_series,
        "token_metrics": token_metrics,
        "financial_metrics": {
            "total_revenue": total_revenue,
            "mrr": total_revenue,
            "transaction_count": transaction_count,
        },
        "operational_metrics": {
            "total_lessons": total_lessons,
            "total_chats": total_chats,
        },
    }


@router.get("/users")
async def list_users(
    search: str | None = None,
    role: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    subscription: str | None = None,
    current_admin: dict = Depends(require_admin),
):
    db = get_database()
    query = _build_user_query(search, role, status_filter, subscription)
    cursor = db["users"].find(query).sort("created_at", -1)
    return {"users": serialize_docs(await cursor.to_list(length=500))}


@router.put("/users/{user_id}/role")
async def update_user_role(user_id: str, role: str, current_admin: dict = Depends(require_admin)):
    if role not in ["admin", "manager", "student"]:
        raise HTTPException(status_code=400, detail="Quyền không hợp lệ")
    db = get_database()
    result = await db["users"].update_one({"_id": user_id}, {"$set": {"role": role, "updated_at": datetime.utcnow()}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    await log_admin_action(db, str(current_admin.get("_id", "")), "update_user_role", user_id, {"role": role})
    return {"message": f"Cập nhật quyền thành công thành {role}"}


@router.put("/users/{user_id}/status")
async def update_user_status(user_id: str, user_status: Literal["ACTIVE", "BANNED"] = Query(alias="status"), current_admin: dict = Depends(require_admin)):
    db = get_database()
    result = await db["users"].update_one(
        {"_id": user_id},
        {"$set": {"status": user_status, "updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    await log_admin_action(db, str(current_admin.get("_id", "")), "update_user_status", user_id, {"status": user_status})
    return {"message": "Cập nhật trạng thái người dùng thành công"}


@router.put("/users/{user_id}/pro")
async def update_user_pro(user_id: str, action: Literal["upgrade", "downgrade"], current_admin: dict = Depends(require_admin)):
    db = get_database()
    premium_end = datetime.utcnow() + timedelta(days=30)
    update_data = {
        "subscription_type": "premium" if action == "upgrade" else "free",
        "isPremium": action == "upgrade",
        "premium_end_date": premium_end if action == "upgrade" else None,
        "updated_at": datetime.utcnow(),
    }
    result = await db["users"].update_one({"_id": user_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    await log_admin_action(db, str(current_admin.get("_id", "")), "update_user_pro", user_id, {"action": action})
    return {"message": "Cập nhật gói Pro thành công"}


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_admin: dict = Depends(require_admin)):
    db = get_database()
    result = await db["users"].delete_one({"_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    await db["chat_sessions"].delete_many({"user_id": user_id})
    await db["flashcards"].delete_many({"user_id": user_id})
    await log_admin_action(db, str(current_admin.get("_id", "")), "delete_user", user_id)
    return {"message": "Xóa người dùng thành công"}


@router.get("/audit-logs")
async def list_audit_logs(current_admin: dict = Depends(require_admin)):
    db = get_database()
    await _ensure_indexes(db)
    logs = await db["admin_audit_logs"].find().sort("timestamp", -1).to_list(length=100)
    return {"logs": serialize_docs(logs)}


async def _list_transactions(db) -> list[dict[str, Any]]:
    payments = await db["payments"].find().sort("created_at", -1).to_list(length=500)
    user_ids = [payment.get("user_id") for payment in payments if payment.get("user_id")]
    users = await db["users"].find({"_id": {"$in": user_ids}}).to_list(length=500) if user_ids else []
    users_by_id = {user.get("_id"): user for user in users}
    return [_normalize_payment(payment, users_by_id.get(payment.get("user_id"))) for payment in payments]


@router.get("/transactions")
async def list_transactions(current_admin: dict = Depends(require_admin)):
    db = get_database()
    return {"transactions": serialize_docs(await _list_transactions(db))}


@router.get("/transactions/export")
async def export_transactions(current_admin: dict = Depends(require_admin)):
    db = get_database()
    return _csv_response(serialize_docs(await _list_transactions(db)))


@router.get("/settings")
async def get_admin_settings(current_admin: dict = Depends(require_admin)):
    db = get_database()
    await _ensure_indexes(db)
    settings_doc = await db["system_settings"].find_one({"_id": "default"})
    if settings_doc is None:
        settings_doc = _default_settings_doc()
        await db["system_settings"].insert_one(settings_doc)
    return serialize_doc(settings_doc)


@router.put("/settings")
async def update_admin_settings(body: SystemSettingsUpdate, current_admin: dict = Depends(require_admin)):
    db = get_database()
    await _ensure_indexes(db)
    update_data = body.model_dump(exclude_unset=True, exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="Không có dữ liệu cập nhật")
    set_data: dict[str, Any] = {"updated_at": datetime.utcnow()}
    if "class_code_limit" in update_data:
        set_data["class_code_limit"] = update_data["class_code_limit"]
    pro_pricing = update_data.get("pro_pricing")
    if isinstance(pro_pricing, dict):
        for key, value in pro_pricing.items():
            set_data[f"pro_pricing.{key}"] = value
    insert_doc = _default_settings_doc()
    insert_doc.pop("updated_at", None)
    await db["system_settings"].update_one(
        {"_id": "default"},
        {"$setOnInsert": insert_doc, "$set": set_data},
        upsert=True,
    )
    await log_admin_action(db, str(current_admin.get("_id", "")), "update_settings", "default", update_data)
    settings_doc = await db["system_settings"].find_one({"_id": "default"})
    return serialize_doc(settings_doc)


@router.get("/characters", dependencies=[Depends(require_admin)])
async def list_admin_characters(status_filter: CharacterStatus | None = None):
    db = get_database()
    query = {"status": status_filter} if status_filter else {}
    cursor = db["characters"].find(query).sort("updated_at", -1)
    characters = await cursor.to_list(length=500)
    serialized = _serialize_characters(characters)
    return {"characters": serialized, "total": len(serialized)}


@router.get("/characters/{character_id}", dependencies=[Depends(require_admin)])
async def get_admin_character(character_id: str):
    db = get_database()
    character = await db["characters"].find_one({"character_id": character_id})
    if character is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân vật")
    return _serialize_character(character)


@router.post("/characters", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_character(body: CharacterCreate):
    db = get_database()
    await _ensure_indexes(db)
    now = datetime.utcnow()
    doc = {**body.model_dump(), "created_at": now, "updated_at": now}
    try:
        await db["characters"].insert_one(doc)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=400, detail="character_id đã tồn tại") from exc
    return {"message": "Tạo nhân vật thành công", "character": _serialize_character(doc)}


@router.put("/characters/{character_id}", dependencies=[Depends(require_admin)])
async def update_character(character_id: str, body: CharacterUpdate):
    db = get_database()
    update_data = {key: value for key, value in body.model_dump(exclude_unset=True).items() if value is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Không có dữ liệu cập nhật")
    update_data["updated_at"] = datetime.utcnow()

    result = await db["characters"].update_one({"character_id": character_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân vật")

    character = await db["characters"].find_one({"character_id": character_id})
    await notify_reload_cache()
    return {"message": "Cập nhật nhân vật thành công", "character": _serialize_character(character)}


@router.post("/characters/{character_id}/portrait", dependencies=[Depends(require_admin)])
async def upload_character_portrait(character_id: str, file: UploadFile = File(...)):
    db = get_database()
    character = await db["characters"].find_one({"character_id": character_id})
    if character is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân vật")

    content_type = file.content_type or ""
    if content_type not in ALLOWED_PORTRAIT_TYPES:
        raise HTTPException(status_code=400, detail="Ảnh phải là PNG, JPG hoặc WebP")

    image_bytes = await file.read(MAX_PORTRAIT_BYTES + 1)
    if not image_bytes:
        raise HTTPException(status_code=400, detail="File ảnh không hợp lệ")
    if len(image_bytes) > MAX_PORTRAIT_BYTES:
        raise HTTPException(status_code=413, detail="Ảnh đại diện tối đa 1 MB")

    encoded_image = base64.b64encode(image_bytes).decode("ascii")
    portrait_url = f"data:{content_type};base64,{encoded_image}"
    await db["characters"].update_one(
        {"character_id": character_id},
        {"$set": {"portrait_url": portrait_url, "updated_at": datetime.utcnow()}},
    )
    updated_character = await db["characters"].find_one({"character_id": character_id})
    await notify_reload_cache()
    return {"message": "Cập nhật ảnh nhân vật thành công", "character": _serialize_character(updated_character)}


@router.delete("/characters/{character_id}", dependencies=[Depends(require_admin)])
async def archive_character(character_id: str):
    db = get_database()
    result = await db["characters"].update_one(
        {"character_id": character_id},
        {"$set": {"status": "archived", "updated_at": datetime.utcnow()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân vật")
    return {"message": "Đã lưu trữ nhân vật"}


def _parse_knowledge_line(line: str, line_number: int, fallback_character_id: str = "") -> dict[str, Any]:
    try:
        item = json.loads(line)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Line {line_number}: JSON không hợp lệ") from exc

    if not isinstance(item, dict):
        raise ValueError(f"Line {line_number}: JSON line phải là object")

    character_id = str(item.get("character_id") or item.get("char_id") or fallback_character_id).strip()
    text = str(item.get("text") or item.get("fact") or "").strip()
    source_title = str(item.get("source_title") or item.get("topic_title") or "Không rõ nguồn").strip()
    chunk_id = str(item.get("chunk_id") or "").strip()

    required_values = {
        "chunk_id": chunk_id,
        "character_id/char_id/form character_id": character_id,
        "text/fact": text,
        "source_title/topic_title": source_title,
    }
    missing = [field for field, value in required_values.items() if not value]
    if missing:
        raise ValueError(f"Line {line_number}: thiếu {', '.join(missing)}")

    claim_status = str(item.get("claim_status") or "established").strip()
    valid_claim_statuses = {"verified", "disputed", "contextual", "established", "contested", "interpretive"}
    if claim_status not in valid_claim_statuses:
        raise ValueError(f"Line {line_number}: claim_status không hợp lệ")

    doc = dict(item)
    doc.update(
        {
            "chunk_id": chunk_id,
            "char_id": character_id,
            "character_id": character_id,
            "text": text,
            "fact": str(item.get("fact") or text).strip(),
            "source_title": source_title,
            "source_url": str(item.get("source_url") or "").strip(),
            "source_year": item.get("source_year", ""),
            "claim_status": claim_status,
            "created_at": datetime.utcnow(),
        }
    )
    return doc


@router.post("/knowledge/upload", dependencies=[Depends(require_admin)])
async def upload_knowledge(file: UploadFile = File(...), character_id: str = Form("")):
    db = get_database()
    await _ensure_indexes(db)
    fallback_character_id = character_id.strip()
    content = (await file.read()).decode("utf-8")
    report = {"inserted": 0, "skipped": 0, "failed": 0, "errors": []}

    for line_number, line in enumerate(content.splitlines(), start=1):
        if not line.strip():
            continue
        try:
            doc = _parse_knowledge_line(line, line_number, fallback_character_id)
            result = await db["knowledge_chunks"].update_one(
                {"chunk_id": doc["chunk_id"]},
                {"$setOnInsert": doc},
                upsert=True,
            )
            if result.upserted_id is None:
                report["skipped"] += 1
            else:
                report["inserted"] += 1
        except ValueError as exc:
            report["failed"] += 1
            report["errors"].append(str(exc))

    return report


@router.post("/infer", dependencies=[Depends(require_admin)])
async def admin_infer(body: InferRequest):
    payload = {
        "user_id": "admin-preview",
        "character_id": body.character_id,
        "message": body.message,
        "history": [],
        "include_draft": body.include_draft,
    }
    chunks: list[str] = []
    try:
        async for chunk in stream_chat(payload):
            chunks.append(chunk.decode("utf-8", errors="ignore"))
    except RagServiceUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except RagServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return {"raw_sse": "".join(chunks)}


@router.post("/lessons", dependencies=[Depends(require_admin)])
async def create_lesson(body: LessonCreate):
    db = get_database()
    lesson_id = f"lesson_{str(ObjectId())}"
    lesson_doc = {
        "_id": lesson_id,
        "title": body.title,
        "description": body.description,
        "video_url": body.video_url,
        "order": body.order,
        "points": body.points,
        "quiz_questions": [q.model_dump() for q in body.quiz_questions],
        "created_at": datetime.utcnow(),
    }

    await db["lessons"].insert_one(lesson_doc)
    return {"message": "Tạo bài học thành công ✅", "lesson_id": lesson_id}


@router.put("/lessons/{lesson_id}", dependencies=[Depends(require_admin)])
async def update_lesson(lesson_id: str, body: LessonUpdate):
    db = get_database()
    update_data = {key: value for key, value in body.model_dump().items() if value is not None}

    if "quiz_questions" in update_data and update_data["quiz_questions"] is not None:
        update_data["quiz_questions"] = [q.model_dump() for q in body.quiz_questions]

    if not update_data:
        raise HTTPException(status_code=400, detail="Không có dữ liệu cập nhật")

    result = await db["lessons"].update_one({"_id": lesson_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài học")

    return {"message": "Cập nhật bài học thành công ✅"}


@router.delete("/lessons/{lesson_id}", dependencies=[Depends(require_admin)])
async def delete_lesson(lesson_id: str):
    db = get_database()
    result = await db["lessons"].delete_one({"_id": lesson_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài học")
    return {"message": "Xóa bài học thành công ✅"}


@router.get("/users/search", response_model=dict)
async def search_users_for_class(
    email: str = Query(min_length=1),
    role: str | None = None,
    current_admin: dict = Depends(require_admin),
):
    db = get_database()
    allowed_roles = ["teacher", "manager", "admin"] if not role else [role]
    query = {
        "email": {"$regex": email.strip(), "$options": "i"},
        "role": {"$in": allowed_roles},
    }
    users = await db["users"].find(query).sort("email", 1).to_list(length=20)
    return {
        "users": [
            {
                "id": str(user.get("_id", "")),
                "email": user.get("email", ""),
                "full_name": user.get("full_name") or user.get("name"),
                "role": user.get("role", ""),
            }
            for user in users
        ]
    }


@router.get("/classes")
async def list_admin_classes(current_admin: dict = Depends(require_admin)):
    from services.edu_service import build_admin_class_summary, ensure_edu_indexes

    db = get_database()
    await ensure_edu_indexes(db)
    classes = await db["classes"].find({}).sort("created_at", -1).to_list(length=500)
    return {"classes": [await build_admin_class_summary(db, class_doc) for class_doc in classes]}


@router.post("/classes", status_code=201)
async def create_admin_class(body: AdminClassCreate, current_admin: dict = Depends(require_admin)):
    from services.edu_service import create_admin_class as create_class_service

    db = get_database()
    response = await create_class_service(db, body)
    await log_admin_action(db, str(current_admin["_id"]), "create_class", response["class_item"]["id"], response["class_item"])
    return response


@router.put("/classes/{class_id}")
async def update_admin_class(class_id: str, body: AdminClassUpdate, current_admin: dict = Depends(require_admin)):
    from services.edu_service import build_admin_class_summary

    db = get_database()
    update_data = body.model_dump(exclude_unset=True)
    if "teacher_id" in update_data and update_data["teacher_id"]:
        teacher = await db["users"].find_one({"_id": update_data["teacher_id"], "role": {"$in": ["teacher", "manager", "admin"]}})
        if not teacher:
            raise HTTPException(status_code=404, detail="Không tìm thấy teacher/manager/admin")
    if not update_data:
        raise HTTPException(status_code=400, detail="Không có dữ liệu cập nhật")
    update_data["updated_at"] = datetime.utcnow()
    result = await db["classes"].update_one({"_id": class_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy lớp")
    class_doc = await db["classes"].find_one({"_id": class_id})
    await log_admin_action(db, str(current_admin["_id"]), "update_class", class_id, update_data)
    return {"message": "Cập nhật lớp thành công", "class_item": await build_admin_class_summary(db, class_doc)}


@router.delete("/classes/{class_id}")
async def hard_delete_class(class_id: str, current_admin: dict = Depends(require_admin)):
    from services.edu_service import downgrade_class_code_users

    db = get_database()
    class_doc = await db["classes"].find_one({"_id": class_id})
    if not class_doc:
        raise HTTPException(status_code=404, detail="Không tìm thấy lớp")

    downgraded_users = await downgrade_class_code_users(db, class_id)
    lesson_ids = await db["lessons"].distinct("_id", {"class_id": class_id})
    assignment_ids = await db["assignments"].distinct("_id", {"class_id": class_id})
    deleted = {
        "classes": (await db["classes"].delete_one({"_id": class_id})).deleted_count,
        "class_enrollments": (await db["class_enrollments"].delete_many({"class_id": class_id})).deleted_count,
        "assignments": (await db["assignments"].delete_many({"class_id": class_id})).deleted_count,
        "lessons": (await db["lessons"].delete_many({"class_id": class_id})).deleted_count,
        "user_progress": (await db["user_progress"].delete_many({"$or": [{"class_id": class_id}, {"assignment_id": {"$in": assignment_ids}}, {"lesson_id": {"$in": lesson_ids}}]})).deleted_count,
        "quiz_attempts": (await db["quiz_attempts"].delete_many({"lessonLegacyId": {"$in": lesson_ids}})).deleted_count,
        "downgraded_users": downgraded_users,
    }
    await log_admin_action(db, str(current_admin["_id"]), "hard_delete_class", class_id, deleted)
    return {"message": "Đã xóa lớp và dữ liệu liên quan", "deleted": deleted}
