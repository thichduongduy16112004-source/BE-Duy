"""Set up Teacher Dashboard database foundation.

Safe to rerun:
- Ensures indexes for schools/classes/class_enrollments/user_progress.
- Prints a schema snapshot for relevant collections.
- Optionally seeds teacher/class/student demo data for local/dev testing.

Usage:
    python scripts/setup_teacher_dashboard_foundation.py --inspect
    python scripts/setup_teacher_dashboard_foundation.py --ensure-indexes
    python scripts/setup_teacher_dashboard_foundation.py --seed
    python scripts/setup_teacher_dashboard_foundation.py --all
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from datetime import datetime, timedelta
from pathlib import Path
from pprint import pformat
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ASCENDING
from pymongo.errors import DuplicateKeyError, OperationFailure

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from core.config import settings  # noqa: E402
from core.security import hash_password  # noqa: E402

DB_NAME = "historyalive"
TEACHER_EMAIL = "teacher.demo@historyalive.vn"
TEACHER_PASSWORD = "Teacher123"
SCHOOL_ID = "school_demo_history_alive"
CLASS_10A1_ID = "class_demo_10a1"
CLASS_10A2_ID = "class_demo_10a2"
TENANT_ID = "ha-tenant"

COLLECTIONS_TO_INSPECT = [
    "schools",
    "classes",
    "class_enrollments",
    "users",
    "lessons",
    "user_progress",
    "quiz_attempts",
]


async def get_db() -> tuple[AsyncIOMotorClient, AsyncIOMotorDatabase]:
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    return client, client[DB_NAME]


async def collection_count(db: AsyncIOMotorDatabase, name: str) -> int:
    try:
        return await db[name].estimated_document_count()
    except Exception:
        return 0


def summarize_document(doc: dict[str, Any] | None) -> dict[str, str]:
    if not doc:
        return {}
    return {key: type(value).__name__ for key, value in doc.items()}


async def inspect_database(db: AsyncIOMotorDatabase) -> None:
    print("\n=== Teacher Dashboard DB inspection ===")
    existing_collections = set(await db.list_collection_names())
    print(f"Database: {DB_NAME}")
    print(f"Collections found: {', '.join(sorted(existing_collections)) or '(none)'}")
    for collection_name in COLLECTIONS_TO_INSPECT:
        exists = collection_name in existing_collections
        count = await collection_count(db, collection_name) if exists else 0
        sample = await db[collection_name].find_one() if exists else None
        print(f"\n[{collection_name}] exists={exists} count={count}")
        print("sample field types:")
        print(pformat(summarize_document(sample), width=100))
    print("\nProgress data discovered:")
    print("- Student lesson progress collection: user_progress")
    print("- Quiz attempts collection: quiz_attempts")
    print("- Legacy completed lessons field on users: completed_lessons")


async def create_index_safe(db: AsyncIOMotorDatabase, collection: str, keys: Any, **kwargs: Any) -> None:
    try:
        name = await db[collection].create_index(keys, **kwargs)
        print(f"[index] {collection}: {name}")
    except OperationFailure as exc:
        print(f"[index-warning] {collection} {keys}: {exc}")


async def ensure_indexes(db: AsyncIOMotorDatabase) -> None:
    print("\n=== Ensuring Teacher Dashboard indexes ===")
    await create_index_safe(db, "schools", [("name", ASCENDING)])
    await create_index_safe(db, "classes", [("class_code", ASCENDING)], unique=True)
    await create_index_safe(db, "classes", [("teacher_id", ASCENDING)])
    await create_index_safe(db, "classes", [("school_id", ASCENDING)])
    await create_index_safe(db, "class_enrollments", [("class_id", ASCENDING)])
    await create_index_safe(db, "class_enrollments", [("user_id", ASCENDING), ("class_id", ASCENDING)], unique=True)
    await create_index_safe(db, "user_progress", [("user_id", ASCENDING)])
    await create_index_safe(db, "user_progress", [("lesson_id", ASCENDING)])
    await create_index_safe(db, "quiz_attempts", [("user_id", ASCENDING), ("created_at", ASCENDING)])


async def get_or_create_demo_teacher(db: AsyncIOMotorDatabase) -> str:
    existing = await db["users"].find_one({"email": TEACHER_EMAIL})
    if existing:
        teacher_id = str(existing["_id"])
        await db["users"].update_one({"_id": existing["_id"]}, {"$set": {"role": "teacher", "is_verified": True, "full_name": "Nguyễn Thị Hà"}})
        return teacher_id
    teacher_id = str(ObjectId())
    await db["users"].insert_one({
        "_id": teacher_id,
        "email": TEACHER_EMAIL,
        "username": "teacher_demo",
        "password_hash": hash_password(TEACHER_PASSWORD),
        "full_name": "Nguyễn Thị Hà",
        "role": "teacher",
        "tenant_id": TENANT_ID,
        "is_verified": True,
        "verification_token": None,
        "google_id": None,
        "avatar_url": None,
        "grade": None,
        "selected_character": None,
        "onboarding_completed": True,
        "hearts": 5,
        "xp": 0,
        "gems": 0,
        "streak": 0,
        "rank": "iron",
        "last_streak_date": None,
        "last_heart_update": datetime.utcnow(),
        "last_active": datetime.utcnow(),
        "subscription_type": "premium",
        "isPremium": True,
        "created_at": datetime.utcnow(),
        "isNewUser": False,
    })
    return teacher_id


async def get_lesson_ids(db: AsyncIOMotorDatabase) -> list[str]:
    lessons = await db["lessons"].find({}, {"_id": 1}).sort("order", ASCENDING).limit(8).to_list(length=8)
    if lessons:
        return [str(lesson["_id"]) for lesson in lessons]
    fallback_lessons = [
        {"_id": "lesson_demo_1", "title": "Bài 1: Thời dựng nước", "order": 1, "points": 100, "created_at": datetime.utcnow()},
        {"_id": "lesson_demo_2", "title": "Bài 2: Hai Bà Trưng", "order": 2, "points": 100, "created_at": datetime.utcnow()},
        {"_id": "lesson_demo_3", "title": "Bài 3: Ngô Quyền", "order": 3, "points": 100, "created_at": datetime.utcnow()},
        {"_id": "lesson_demo_4", "title": "Bài 4: Lý Thường Kiệt", "order": 4, "points": 100, "created_at": datetime.utcnow()},
    ]
    for lesson in fallback_lessons:
        await db["lessons"].update_one({"_id": lesson["_id"]}, {"$setOnInsert": lesson}, upsert=True)
    return [lesson["_id"] for lesson in fallback_lessons]


async def upsert_student(db: AsyncIOMotorDatabase, index: int, class_id: str, lesson_ids: list[str]) -> None:
    user_id = f"student_demo_{index:02d}"
    full_name = ["Nguyễn Văn An", "Trần Thị Bình", "Lê Minh Châu", "Phạm Quốc Dũng", "Hoàng Gia Hân", "Đỗ Tuấn Kiệt", "Vũ Ngọc Linh", "Bùi Hà My"][index - 1]
    now = datetime.utcnow()
    last_active = now - timedelta(days=9 if index in {2, 6} else index % 4)
    completed_count = max(1, min(len(lesson_ids), 1 + index % max(1, len(lesson_ids))))
    await db["users"].update_one({"_id": user_id}, {"$set": {
        "email": f"student{index:02d}@historyalive.vn",
        "username": f"student_demo_{index:02d}",
        "password_hash": hash_password("Student123"),
        "full_name": full_name,
        "role": "student",
        "tenant_id": TENANT_ID,
        "is_verified": True,
        "avatar_url": None,
        "completed_lessons": lesson_ids[:completed_count],
        "last_active": last_active,
        "subscription_type": "premium",
        "isPremium": True,
        "created_at": now - timedelta(days=30 + index),
    }}, upsert=True)
    await db["class_enrollments"].update_one({"user_id": user_id, "class_id": class_id}, {"$setOnInsert": {
        "_id": str(ObjectId()), "user_id": user_id, "class_id": class_id,
        "enrolled_at": now - timedelta(days=20 + index), "plan_source": "class_code",
    }}, upsert=True)
    for lesson_position, lesson_id in enumerate(lesson_ids[:completed_count], start=1):
        correct_answers = 5 + ((index + lesson_position) % 5)
        if index in {2, 6}:
            correct_answers = min(correct_answers, 5)
        await db["user_progress"].update_one({"tenant_id": TENANT_ID, "user_id": user_id, "lesson_id": lesson_id}, {"$set": {
            "status": "completed", "last_attempt_date": last_active, "updated_at": last_active,
        }, "$max": {"best_score": correct_answers}, "$setOnInsert": {"attempts_count": 1}}, upsert=True)
        await db["quiz_attempts"].update_one({"user_id": user_id, "lessonLegacyId": lesson_id, "mode": "lesson"}, {"$set": {
            "tenantSlug": TENANT_ID, "lessonLegacyId": lesson_id, "mode": "lesson",
            "correctAnswers": correct_answers, "totalQuestions": 10, "maxStreak": correct_answers,
            "completed": True, "created_at": last_active,
        }}, upsert=True)


async def seed_demo_data(db: AsyncIOMotorDatabase) -> None:
    print("\n=== Seeding Teacher Dashboard demo data ===")
    teacher_id = await get_or_create_demo_teacher(db)
    now = datetime.utcnow()
    await db["schools"].update_one({"_id": SCHOOL_ID}, {"$set": {
        "name": "THPT Nguyễn Du", "contract_slots": 120, "contract_expires_at": now + timedelta(days=180),
    }, "$setOnInsert": {"_id": SCHOOL_ID, "created_at": now}}, upsert=True)
    for class_id, name, class_code, slot_limit in [
        (CLASS_10A1_ID, "Lịch sử 10A1", "HAL-2026-A1X9K2", 40),
        (CLASS_10A2_ID, "Lịch sử 10A2", "HAL-2026-B7M4Q8", 40),
    ]:
        await db["classes"].update_one({"_id": class_id}, {"$set": {
            "school_id": SCHOOL_ID, "teacher_id": teacher_id, "name": name,
            "class_code": class_code, "slot_limit": slot_limit,
            "expires_at": now + timedelta(days=180), "status": "active",
        }, "$setOnInsert": {"_id": class_id, "created_at": now}}, upsert=True)
    lesson_ids = await get_lesson_ids(db)
    for index in range(1, 9):
        await upsert_student(db, index, CLASS_10A1_ID if index <= 5 else CLASS_10A2_ID, lesson_ids)
    print(f"Seeded teacher: {TEACHER_EMAIL} / {TEACHER_PASSWORD}")
    print(f"Teacher id: {teacher_id}")
    print("Seeded classes: Lịch sử 10A1, Lịch sử 10A2")
    print("Seeded students: 8 demo student users with enrollments/progress")


async def main() -> None:
    parser = argparse.ArgumentParser(description="Teacher Dashboard DB foundation setup")
    parser.add_argument("--inspect", action="store_true", help="Inspect relevant collections and field types")
    parser.add_argument("--ensure-indexes", action="store_true", help="Create required indexes")
    parser.add_argument("--seed", action="store_true", help="Seed demo teacher/classes/students/progress")
    parser.add_argument("--all", action="store_true", help="Run inspect, ensure-indexes, seed, inspect")
    args = parser.parse_args()
    if not any([args.inspect, args.ensure_indexes, args.seed, args.all]):
        parser.error("Choose at least one action: --inspect, --ensure-indexes, --seed, or --all")
    client, db = await get_db()
    try:
        if args.inspect or args.all:
            await inspect_database(db)
        if args.ensure_indexes or args.all:
            await ensure_indexes(db)
        if args.seed or args.all:
            try:
                await seed_demo_data(db)
            except DuplicateKeyError as exc:
                print(f"[seed-warning] Duplicate key while seeding: {exc}")
        if args.all:
            await inspect_database(db)
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(main())
