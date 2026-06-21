from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from core.database import get_database
from core.security import get_current_user

router = APIRouter(prefix="/lessons", tags=["Lessons"])

@router.get("")
async def get_lessons(current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    tenant_filter = {"tenant_id": current_user.get("tenant_id")} if current_user.get("tenant_id") else {}
    cursor = db["lessons"].find(tenant_filter).sort("order", 1)
    
    # Get user progress to map completed lessons
    progress_cursor = db["user_progress"].find({"user_id": current_user["_id"]})
    completed_lesson_ids = set()
    async for prog in progress_cursor:
        if prog.get("completed") or prog.get("status") == "completed":
            completed_lesson_ids.add(prog.get("lesson_id"))
            
    # Also check legacy array for transition period
    legacy_completed = set(current_user.get("completed_lessons", []))
    all_completed = completed_lesson_ids.union(legacy_completed)

    lessons = []
    previous_completed = True # First lesson is always unlocked
    
    async for doc in cursor:
        lesson_id = str(doc["_id"])
        is_completed = lesson_id in all_completed
        
        # Lock logic: lesson is locked if it's not the first one and previous one is not completed
        # (You can disable this lock logic if you want all lessons unlocked by default)
        is_locked = not previous_completed and not is_completed
        
        lessons.append({
            "id": lesson_id,
            "title": doc.get("title", ""),
            "description": doc.get("description", ""),
            "video_url": doc.get("video_url"),
            "order": doc.get("order", 0),
            "points": doc.get("points", 100),
            "is_completed": is_completed,
            "is_locked": is_locked,
            "created_at": doc.get("created_at")
        })
        
        previous_completed = is_completed

    return {"lessons": lessons, "total": len(lessons)}

@router.get("/{lesson_id}")
async def get_lesson(lesson_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    doc = await db["lessons"].find_one({"_id": lesson_id})
    if not doc:
        # Sometimes _id is stored as ObjectId, sometimes as string. Try both if needed.
        from bson import ObjectId
        try:
            doc = await db["lessons"].find_one({"_id": ObjectId(lesson_id)})
        except:
            pass
            
    if not doc:
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    # Get progress for this specific lesson
    prog = await db["user_progress"].find_one({
        "user_id": current_user["_id"],
        "lesson_id": lesson_id
    })
    
    is_completed = False
    if prog and (prog.get("completed") or prog.get("status") == "completed"):
        is_completed = True
    elif lesson_id in current_user.get("completed_lessons", []):
        is_completed = True

    return {
        "id": str(doc["_id"]),
        "title": doc.get("title", ""),
        "description": doc.get("description", ""),
        "content": doc.get("content", ""), # Full rich text content
        "video_url": doc.get("video_url"),
        "order": doc.get("order", 0),
        "points": doc.get("points", 100),
        "quiz_questions": doc.get("quiz_questions", []),
        "is_completed": is_completed,
        "created_at": doc.get("created_at")
    }
