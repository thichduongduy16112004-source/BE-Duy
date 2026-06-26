from datetime import datetime, timedelta
from typing import Any

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

SUPPORT_INACTIVE_DAYS = 7
SUPPORT_SCORE_THRESHOLD = 60


def document_id(document: dict[str, Any]) -> str:
    return str(document.get("_id", ""))


def is_support_needed(avg_score: float | None, last_active: datetime | None) -> bool:
    score_is_low = avg_score is not None and avg_score < SUPPORT_SCORE_THRESHOLD
    if last_active is None:
        return score_is_low
    is_inactive = last_active < datetime.utcnow() - timedelta(days=SUPPORT_INACTIVE_DAYS)
    return score_is_low or is_inactive


async def get_owned_class(db: AsyncIOMotorDatabase, class_id: str, teacher_id: str) -> dict[str, Any]:
    class_doc = await db["classes"].find_one({"_id": class_id, "teacher_id": teacher_id})
    if not class_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lớp hoặc bạn không có quyền truy cập lớp này",
        )
    return class_doc


async def get_teacher_classes(db: AsyncIOMotorDatabase, teacher_id: str) -> dict[str, Any]:
    classes = []
    cursor = db["classes"].find({"teacher_id": teacher_id}).sort("created_at", 1)

    async for class_doc in cursor:
        school = await db["schools"].find_one({"_id": class_doc.get("school_id")})
        student_count = await db["class_enrollments"].count_documents({"class_id": document_id(class_doc)})
        classes.append({
            "id": document_id(class_doc),
            "name": class_doc.get("name", ""),
            "school_name": school.get("name") if school else None,
            "class_code": class_doc.get("class_code", ""),
            "student_count": student_count,
            "slot_limit": class_doc.get("slot_limit", 0),
            "status": class_doc.get("status", "active"),
            "expires_at": class_doc.get("expires_at"),
        })

    return {"classes": classes}


async def get_class_students(db: AsyncIOMotorDatabase, class_id: str, teacher_id: str) -> dict[str, Any]:
    class_doc = await get_owned_class(db, class_id, teacher_id)
    lesson_count = await db["lessons"].count_documents({})
    students = []

    enrollments = db["class_enrollments"].find({"class_id": class_id}).sort("enrolled_at", 1)
    async for enrollment in enrollments:
        user = await db["users"].find_one({"_id": enrollment.get("user_id")})
        if not user:
            continue
        students.append(await build_student_summary(db, user, lesson_count))

    return {"class_id": class_id, "class_name": class_doc.get("name", ""), "students": students}


async def get_student_detail(db: AsyncIOMotorDatabase, class_id: str, user_id: str, teacher_id: str) -> dict[str, Any]:
    class_doc = await get_owned_class(db, class_id, teacher_id)
    enrollment = await db["class_enrollments"].find_one({"class_id": class_id, "user_id": user_id})
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Học sinh không thuộc lớp này")

    user = await db["users"].find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy học sinh")

    lessons = await db["lessons"].find({}).sort("order", 1).to_list(length=None)
    progress_docs = await db["user_progress"].find({"user_id": user_id}).to_list(length=None)
    progress_by_lesson = {item.get("lesson_id"): item for item in progress_docs}
    legacy_completed = set(user.get("completed_lessons", []))

    lesson_details = []
    for lesson in lessons:
        lesson_id = document_id(lesson)
        progress = progress_by_lesson.get(lesson_id, {})
        status_value = progress.get("status") or ("completed" if lesson_id in legacy_completed else "not_started")
        lesson_details.append({
            "lesson_id": lesson_id,
            "title": lesson.get("title", ""),
            "status": status_value,
            "score": progress.get("best_score"),
            "time_spent_minutes": progress.get("time_spent_minutes"),
            "completed_at": progress.get("last_attempt_date") if status_value == "completed" else None,
        })

    completed_count = sum(1 for item in lesson_details if item["status"] == "completed")
    avg_score = calculate_average_score(progress_docs)
    last_active = user.get("last_active")

    return {
        "user_id": user_id,
        "full_name": user.get("full_name", ""),
        "avatar_url": user.get("avatar_url"),
        "class_id": class_id,
        "class_name": class_doc.get("name", ""),
        "progress_percent": calculate_progress_percent(completed_count, len(lessons)),
        "avg_score": avg_score,
        "last_active": last_active,
        "needs_support": is_support_needed(avg_score, last_active),
        "lessons": lesson_details,
    }


async def build_student_summary(db: AsyncIOMotorDatabase, user: dict[str, Any], lesson_count: int) -> dict[str, Any]:
    user_id = document_id(user)
    progress_docs = await db["user_progress"].find({"user_id": user_id}).to_list(length=None)
    completed_lesson_ids = {
        item.get("lesson_id")
        for item in progress_docs
        if item.get("status") == "completed" or item.get("completed")
    }
    completed_lesson_ids.update(user.get("completed_lessons", []))

    avg_score = calculate_average_score(progress_docs)
    last_active = user.get("last_active")

    return {
        "user_id": user_id,
        "full_name": user.get("full_name", ""),
        "avatar_url": user.get("avatar_url"),
        "progress_percent": calculate_progress_percent(len(completed_lesson_ids), lesson_count),
        "current_lesson": await get_current_lesson_title(db, completed_lesson_ids),
        "avg_score": avg_score,
        "last_active": last_active,
        "needs_support": is_support_needed(avg_score, last_active),
    }


def calculate_average_score(progress_docs: list[dict[str, Any]]) -> float | None:
    scores = [item.get("best_score") for item in progress_docs if isinstance(item.get("best_score"), (int, float))]
    if not scores:
        return None
    return round(sum(scores) / len(scores), 1)


def calculate_progress_percent(completed_count: int, lesson_count: int) -> int:
    if lesson_count <= 0:
        return 0
    return min(100, round(completed_count / lesson_count * 100))


async def get_current_lesson_title(db: AsyncIOMotorDatabase, completed_lesson_ids: set[str]) -> str | None:
    cursor = db["lessons"].find({}).sort("order", 1)
    async for lesson in cursor:
        if document_id(lesson) not in completed_lesson_ids:
            return lesson.get("title")
    return None
