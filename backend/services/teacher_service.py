from datetime import datetime, timedelta
from typing import Any
from uuid import uuid4

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

SUPPORT_INACTIVE_DAYS = 7
SUPPORT_SCORE_THRESHOLD = 60


def document_id(document: dict[str, Any]) -> str:
    return str(document.get("_id", ""))


def now_utc() -> datetime:
    return datetime.utcnow()


def is_support_needed(avg_score: float | None, last_active: datetime | None) -> bool:
    score_is_low = avg_score is not None and avg_score < SUPPORT_SCORE_THRESHOLD
    if last_active is None:
        return score_is_low
    is_inactive = last_active < now_utc() - timedelta(days=SUPPORT_INACTIVE_DAYS)
    return score_is_low or is_inactive


def normalize_question(question: dict[str, Any]) -> dict[str, Any]:
    options = question.get("options") or []
    answer = question.get("answer", 0)
    if isinstance(answer, str):
        try:
            answer = options.index(answer)
        except ValueError:
            answer = 0
    return {
        "question": question.get("question", ""),
        "options": options,
        "answer": int(answer) if isinstance(answer, (int, float)) else 0,
        "explanation": question.get("explanation"),
    }


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
    assignment_count = await db["assignments"].count_documents({"class_id": class_id})
    lesson_count = assignment_count or await db["lessons"].count_documents({})
    students = []

    enrollments = db["class_enrollments"].find({"class_id": class_id}).sort("enrolled_at", 1)
    async for enrollment in enrollments:
        user = await db["users"].find_one({"_id": enrollment.get("user_id")})
        if user:
            students.append(await build_student_summary(db, user, lesson_count, class_id))

    return {"class_id": class_id, "class_name": class_doc.get("name", ""), "students": students}


async def get_student_detail(db: AsyncIOMotorDatabase, class_id: str, user_id: str, teacher_id: str) -> dict[str, Any]:
    class_doc = await get_owned_class(db, class_id, teacher_id)
    enrollment = await db["class_enrollments"].find_one({"class_id": class_id, "user_id": user_id})
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Học sinh không thuộc lớp này")

    user = await db["users"].find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy học sinh")

    lessons = await get_lessons_for_class(db, class_id)
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


async def create_imported_lesson(db: AsyncIOMotorDatabase, class_id: str, teacher_id: str, payload: Any) -> dict[str, Any]:
    await get_owned_class(db, class_id, teacher_id)
    lesson_id = f"imported_{uuid4().hex}"
    questions = [normalize_question(item.model_dump()) for item in payload.questions]
    lesson = {
        "_id": lesson_id,
        "class_id": class_id,
        "teacher_id": teacher_id,
        "title": payload.title,
        "description": payload.description,
        "content": payload.content,
        "questions": questions,
        "source": "teacher_import",
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }
    await db["lessons"].insert_one(lesson)
    return lesson_summary(lesson)


async def get_class_lessons(db: AsyncIOMotorDatabase, class_id: str, teacher_id: str) -> dict[str, Any]:
    await get_owned_class(db, class_id, teacher_id)
    lessons = await get_lessons_for_class(db, class_id)
    return {"lessons": [lesson_summary(item) for item in lessons]}


async def create_assignment(db: AsyncIOMotorDatabase, class_id: str, teacher_id: str, payload: Any) -> dict[str, Any]:
    await get_owned_class(db, class_id, teacher_id)
    lesson = await db["lessons"].find_one({"_id": payload.lesson_id, "$or": [{"class_id": class_id}, {"class_id": {"$exists": False}}]})
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy bài học để giao")

    assignment = {
        "_id": f"assignment_{uuid4().hex}",
        "class_id": class_id,
        "teacher_id": teacher_id,
        "lesson_id": payload.lesson_id,
        "title": payload.title or lesson.get("title", "Bài tập"),
        "due_at": payload.due_at,
        "created_at": now_utc(),
        "updated_at": now_utc(),
        "status": "active",
    }
    await db["assignments"].insert_one(assignment)
    return await assignment_summary(db, assignment)


async def get_class_assignments(db: AsyncIOMotorDatabase, class_id: str, teacher_id: str) -> dict[str, Any]:
    await get_owned_class(db, class_id, teacher_id)
    assignments = await db["assignments"].find({"class_id": class_id}).sort("created_at", -1).to_list(length=None)
    return {"assignments": [await assignment_summary(db, item) for item in assignments]}


async def delete_assignment(db: AsyncIOMotorDatabase, class_id: str, teacher_id: str, assignment_id: str) -> dict[str, Any]:
    await get_owned_class(db, class_id, teacher_id)
    assignment = await db["assignments"].find_one({"_id": assignment_id, "class_id": class_id, "teacher_id": teacher_id})
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy bài đã giao")

    progress_result = await db["user_progress"].delete_many({"assignment_id": assignment_id, "class_id": class_id})
    assignment_result = await db["assignments"].delete_one({"_id": assignment_id})
    return {
        "message": "Đã xóa bài đã giao",
        "deleted": {
            "assignments": assignment_result.deleted_count,
            "user_progress": progress_result.deleted_count,
        },
    }


async def delete_imported_lesson(db: AsyncIOMotorDatabase, class_id: str, teacher_id: str, lesson_id: str) -> dict[str, Any]:
    await get_owned_class(db, class_id, teacher_id)
    lesson = await db["lessons"].find_one({"_id": lesson_id, "class_id": class_id, "teacher_id": teacher_id})
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy bài học trong thư viện lớp")

    assignment_ids = await db["assignments"].distinct("_id", {"class_id": class_id, "lesson_id": lesson_id})
    deleted = {
        "lessons": (await db["lessons"].delete_one({"_id": lesson_id})).deleted_count,
        "assignments": (await db["assignments"].delete_many({"class_id": class_id, "lesson_id": lesson_id})).deleted_count,
        "user_progress": (await db["user_progress"].delete_many({
            "$or": [
                {"class_id": class_id, "lesson_id": lesson_id},
                {"class_id": class_id, "assignment_id": {"$in": assignment_ids}},
            ]
        })).deleted_count,
    }
    return {"message": "Đã xóa bài học và các bài giao liên quan", "deleted": deleted}


async def get_student_assignments(db: AsyncIOMotorDatabase, user_id: str) -> dict[str, Any]:
    enrollments = await db["class_enrollments"].find({"user_id": user_id}).to_list(length=None)
    class_ids = [item.get("class_id") for item in enrollments]
    assignments = await db["assignments"].find({"class_id": {"$in": class_ids}, "status": "active"}).sort("created_at", -1).to_list(length=None)
    return {"assignments": [await assignment_summary(db, item, user_id) for item in assignments]}


async def get_assignment_lesson(db: AsyncIOMotorDatabase, assignment_id: str, user_id: str) -> dict[str, Any]:
    assignment = await db["assignments"].find_one({"_id": assignment_id, "status": "active"})
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy bài tập")
    enrollment = await db["class_enrollments"].find_one({"class_id": assignment.get("class_id"), "user_id": user_id})
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bạn không thuộc lớp được giao bài này")
    lesson = await db["lessons"].find_one({"_id": assignment.get("lesson_id")})
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy nội dung bài học")
    return {
        "assignment": await assignment_summary(db, assignment, user_id),
        "lesson": {
            "id": document_id(lesson),
            "title": lesson.get("title", ""),
            "description": lesson.get("description"),
            "content": lesson.get("content"),
            "questions": lesson.get("questions", []),
        },
    }


async def mark_assignment_completed(db: AsyncIOMotorDatabase, user_id: str, lesson_id: str, score: int) -> None:
    assignment = await db["assignments"].find_one({"lesson_id": lesson_id, "status": "active"})
    if not assignment:
        return

    assignment_id = document_id(assignment)
    timestamp = now_utc()
    await db["user_progress"].update_one(
        {"user_id": user_id, "lesson_id": lesson_id},
        {"$set": {
            "user_id": user_id,
            "lesson_id": lesson_id,
            "assignment_id": assignment_id,
            "class_id": assignment.get("class_id"),
            "status": "completed",
            "completed": True,
            "best_score": score,
            "last_attempt_date": timestamp,
            "updated_at": timestamp,
        }, "$setOnInsert": {"created_at": timestamp}},
        upsert=True,
    )


async def get_lessons_for_class(db: AsyncIOMotorDatabase, class_id: str) -> list[dict[str, Any]]:
    lessons = await db["lessons"].find({"class_id": class_id}).sort("created_at", 1).to_list(length=None)
    if lessons:
        return lessons
    return await db["lessons"].find({"class_id": {"$exists": False}}).sort("order", 1).to_list(length=None)


def lesson_summary(lesson: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": document_id(lesson),
        "class_id": lesson.get("class_id", ""),
        "title": lesson.get("title", ""),
        "description": lesson.get("description"),
        "question_count": len(lesson.get("questions", [])),
        "created_at": lesson.get("created_at"),
    }


async def assignment_summary(db: AsyncIOMotorDatabase, assignment: dict[str, Any], user_id: str | None = None) -> dict[str, Any]:
    lesson = await db["lessons"].find_one({"_id": assignment.get("lesson_id")})
    enrolled_count = await db["class_enrollments"].count_documents({"class_id": assignment.get("class_id")})
    completed_count = await db["user_progress"].count_documents({"assignment_id": document_id(assignment), "status": "completed"})
    progress = None
    if user_id:
        progress = await db["user_progress"].find_one({"user_id": user_id, "assignment_id": document_id(assignment)})
        if not progress:
            progress = await db["user_progress"].find_one({"user_id": user_id, "lesson_id": assignment.get("lesson_id")})
    return {
        "id": document_id(assignment),
        "class_id": assignment.get("class_id", ""),
        "lesson_id": assignment.get("lesson_id", ""),
        "title": assignment.get("title", ""),
        "lesson_title": lesson.get("title") if lesson else None,
        "question_count": len(lesson.get("questions", [])) if lesson else 0,
        "assigned_count": enrolled_count,
        "completed_count": completed_count,
        "student_status": progress.get("status") if progress else "not_started",
        "student_score": progress.get("best_score") if progress else None,
        "submitted_at": progress.get("last_attempt_date") if progress else None,
        "due_at": assignment.get("due_at"),
        "created_at": assignment.get("created_at"),
    }


async def build_student_summary(db: AsyncIOMotorDatabase, user: dict[str, Any], lesson_count: int, class_id: str | None = None) -> dict[str, Any]:
    user_id = document_id(user)
    query: dict[str, Any] = {"user_id": user_id}
    if class_id:
        query["$or"] = [{"class_id": class_id}, {"class_id": {"$exists": False}}]
    progress_docs = await db["user_progress"].find(query).to_list(length=None)
    completed_lesson_ids = {item.get("lesson_id") for item in progress_docs if item.get("status") == "completed" or item.get("completed")}
    completed_lesson_ids.update(user.get("completed_lessons", []))

    score_docs = progress_docs
    if class_id:
        score_docs = [
            item for item in progress_docs
            if item.get("class_id") == class_id
            and item.get("assignment_id")
            and (item.get("status") == "completed" or item.get("completed"))
        ]
    avg_score = calculate_average_score(score_docs)
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
