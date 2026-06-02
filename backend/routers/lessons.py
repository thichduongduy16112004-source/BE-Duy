from fastapi import APIRouter
from core.database import get_database
from models.lesson import LessonResponse

router = APIRouter(prefix="/lessons", tags=["Lessons"])

@router.get("")
async def get_lessons():
    db = get_database()
    cursor = db["lessons"].find().sort("order", 1)
    lessons = []
    async for doc in cursor:
        lessons.append({
            "id": doc["_id"],
            "title": doc["title"],
            "description": doc["description"],
            "video_url": doc["video_url"],
            "order": doc["order"],
            "points": doc.get("points", 100),
            "quiz_questions": doc.get("quiz_questions", []),
            "created_at": doc.get("created_at")
        })
    return {"lessons": lessons, "total": len(lessons)}

@router.get("/{lesson_id}")
async def get_lesson(lesson_id: str):
    db = get_database()
    doc = await db["lessons"].find_one({"_id": lesson_id})
    if not doc:
        return {"error": "Lesson not found"}
    return {
        "id": doc["_id"],
        "title": doc["title"],
        "description": doc["description"],
        "video_url": doc["video_url"],
        "order": doc["order"],
        "points": doc.get("points", 100),
        "quiz_questions": doc.get("quiz_questions", []),
        "created_at": doc.get("created_at")
    }
