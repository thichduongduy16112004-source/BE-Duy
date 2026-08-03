from datetime import datetime
from secrets import choice, token_hex
from string import ascii_uppercase, digits
from typing import Any

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from core.security import hash_password, verify_password

CLASS_CODE_PREFIX = "HAL"
CLASS_PASSWORD_CHARS = ascii_uppercase + digits


def now_utc() -> datetime:
    return datetime.utcnow()


def document_id(document: dict[str, Any]) -> str:
    return str(document.get("_id", ""))


def generate_class_code() -> str:
    return f"{CLASS_CODE_PREFIX}-{now_utc().year}-{token_hex(3).upper()}"


def generate_class_password() -> str:
    return "HA-" + "".join(choice(CLASS_PASSWORD_CHARS) for _ in range(6))


async def ensure_edu_indexes(db: AsyncIOMotorDatabase) -> None:
    await db["classes"].create_index("class_code", unique=True)
    await db["classes"].create_index("teacher_id")
    await db["classes"].create_index("school_name")
    await db["class_enrollments"].create_index("user_id")
    await db["class_enrollments"].create_index("class_id")
    await db["class_enrollments"].create_index([("user_id", 1), ("class_id", 1)], unique=True)


async def build_admin_class_summary(db: AsyncIOMotorDatabase, class_doc: dict[str, Any]) -> dict[str, Any]:
    class_id = document_id(class_doc)
    teacher = await db["users"].find_one({"_id": class_doc.get("teacher_id")})
    code = class_doc.get("class_code", "")
    return {
        "id": class_id,
        "name": class_doc.get("name", ""),
        "school_name": class_doc.get("school_name"),
        "class_code": code,
        "code": code,
        "class_password": class_doc.get("class_password"),
        "teacher_id": class_doc.get("teacher_id"),
        "teacher_name": (teacher or {}).get("full_name") or (teacher or {}).get("name") or (teacher or {}).get("email"),
        "teacher_email": (teacher or {}).get("email"),
        "student_count": await db["class_enrollments"].count_documents({"class_id": class_id}),
        "slot_limit": int(class_doc.get("slot_limit") or 0),
        "assignment_count": await db["assignments"].count_documents({"class_id": class_id}),
        "status": class_doc.get("status", "active"),
        "expires_at": class_doc.get("expires_at"),
        "created_at": class_doc.get("created_at"),
    }


async def create_admin_class(db: AsyncIOMotorDatabase, payload: Any) -> dict[str, Any]:
    await ensure_edu_indexes(db)
    teacher = await db["users"].find_one({"_id": payload.teacher_id, "role": {"$in": ["teacher", "manager", "admin"]}})
    if not teacher:
        raise HTTPException(status_code=404, detail="Không tìm thấy teacher/manager/admin để gán lớp")

    class_password = generate_class_password()
    for _ in range(5):
        class_code = generate_class_code()
        doc = {
            "_id": f"class_{token_hex(12)}",
            "name": payload.name.strip(),
            "school_name": payload.school_name.strip(),
            "teacher_id": payload.teacher_id,
            "class_code": class_code,
            "class_password": class_password,
            "class_password_hash": hash_password(class_password),
            "slot_limit": payload.slot_limit,
            "status": "active",
            "expires_at": payload.expires_at,
            "created_at": now_utc(),
            "updated_at": now_utc(),
        }
        try:
            await db["classes"].insert_one(doc)
            return {
                "message": "Tạo lớp thành công",
                "class_item": await build_admin_class_summary(db, doc),
                "class_password": class_password,
            }
        except Exception as exc:
            if "duplicate" not in str(exc).lower():
                raise
    raise HTTPException(status_code=500, detail="Không thể sinh mã lớp duy nhất")


async def enroll_with_class_code(db: AsyncIOMotorDatabase, user: dict[str, Any], class_code: str, class_password: str) -> dict[str, Any]:
    await ensure_edu_indexes(db)
    normalized_code = class_code.strip().upper()
    class_doc = await db["classes"].find_one({"class_code": normalized_code})
    if not class_doc:
        raise HTTPException(status_code=404, detail="not_found")
    if class_doc.get("status", "active") != "active":
        raise HTTPException(status_code=400, detail="expired")
    expires_at = class_doc.get("expires_at")
    if expires_at and expires_at < now_utc():
        await db["classes"].update_one({"_id": class_doc["_id"]}, {"$set": {"status": "expired", "updated_at": now_utc()}})
        raise HTTPException(status_code=400, detail="expired")
    if not verify_password(class_password.strip(), class_doc.get("class_password_hash", "")):
        raise HTTPException(status_code=400, detail="invalid_password")

    class_id = document_id(class_doc)
    user_id = document_id(user)
    existing = await db["class_enrollments"].find_one({"user_id": user_id, "class_id": class_id})
    if existing:
        raise HTTPException(status_code=400, detail="already_enrolled")
    enrolled_count = await db["class_enrollments"].count_documents({"class_id": class_id})
    if enrolled_count >= int(class_doc.get("slot_limit") or 0):
        raise HTTPException(status_code=400, detail="full")

    await db["class_enrollments"].insert_one({
        "_id": f"enroll_{token_hex(12)}",
        "user_id": user_id,
        "class_id": class_id,
        "class_code": normalized_code,
        "enrolled_at": now_utc(),
        "status": "active",
    })
    await db["users"].update_one({"_id": user_id}, {"$set": {
        "isPremium": True,
        "subscription_type": "premium",
        "subscription_source": "class_code",
        "edu_class_id": class_id,
        "edu_school_name": class_doc.get("school_name"),
        "premium_end_date": expires_at,
        "updated_at": now_utc(),
    }})
    return {
        "message": "K?ch ho?t Edu Plan th?nh c?ng",
        "isPremium": True,
        "subscription_type": "premium",
        "subscription_source": "class_code",
        "class_id": class_id,
        "class_name": class_doc.get("name", ""),
        "school_name": class_doc.get("school_name"),
        "expires_at": expires_at,
    }


async def downgrade_class_code_users(db: AsyncIOMotorDatabase, class_id: str) -> int:
    enrollments = await db["class_enrollments"].find({"class_id": class_id}).to_list(length=None)
    user_ids = [item.get("user_id") for item in enrollments if item.get("user_id")]
    if not user_ids:
        return 0
    result = await db["users"].update_many(
        {"_id": {"$in": user_ids}, "subscription_source": "class_code"},
        {"$set": {"isPremium": False, "subscription_type": "free", "subscription_source": None, "premium_end_date": None, "updated_at": now_utc()}},
    )
    return result.modified_count
