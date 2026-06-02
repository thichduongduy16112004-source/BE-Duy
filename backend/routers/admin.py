from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime
from typing import List

from core.security import get_current_user
from core.database import get_database
from models.user import UserResponse
from models.lesson import LessonCreate, LessonUpdate, LessonResponse

router = APIRouter(prefix="/admin", tags=["Admin"])

async def get_current_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản không có quyền truy cập trang quản trị."
        )
    return current_user

# ── Stats API ──
@router.get("/stats", dependencies=[Depends(get_current_admin)])
async def get_admin_stats():
    db = get_database()
    total_users = await db["users"].count_documents({})
    total_lessons = await db["lessons"].count_documents({})
    premium_users = await db["users"].count_documents({"subscription_type": "premium"})
    total_chats = await db["sessions"].count_documents({})
    
    return {
        "total_users": total_users,
        "total_lessons": total_lessons,
        "premium_users": premium_users,
        "total_chats": total_chats
    }

# ── Users APIs ──
@router.get("/users", dependencies=[Depends(get_current_admin)])
async def list_users():
    db = get_database()
    cursor = db["users"].find()
    users = []
    async for doc in cursor:
        users.append({
            "id": doc["_id"],
            "email": doc["email"],
            "full_name": doc["full_name"],
            "role": doc.get("role", "student"),
            "grade": doc.get("grade"),
            "avatar_url": doc.get("avatar_url"),
            "subscription_type": doc.get("subscription_type", "free"),
            "onboarding_completed": doc.get("onboarding_completed", False),
            "created_at": doc.get("created_at")
        })
    return {"users": users}

@router.put("/users/{user_id}/role", dependencies=[Depends(get_current_admin)])
async def update_user_role(user_id: str, role: str):
    if role not in ["admin", "student"]:
        raise HTTPException(status_code=400, detail="Quyền không hợp lệ")
    db = get_database()
    result = await db["users"].update_one({"_id": user_id}, {"$set": {"role": role}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    return {"message": f"Cập nhật quyền thành công thành {role}"}

@router.delete("/users/{user_id}", dependencies=[Depends(get_current_admin)])
async def delete_user(user_id: str):
    db = get_database()
    result = await db["users"].delete_one({"_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    # Clean up user's chat sessions and flashcards
    await db["sessions"].delete_many({"user_id": user_id})
    await db["flashcards"].delete_many({"user_id": user_id})
    return {"message": "Xóa người dùng thành công"}

# ── Lessons CRUD APIs ──
@router.post("/lessons", dependencies=[Depends(get_current_admin)])
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
        "quiz_questions": [q.dict() for q in body.quiz_questions],
        "created_at": datetime.utcnow()
    }
    
    await db["lessons"].insert_one(lesson_doc)
    return {"message": "Tạo bài học thành công ✅", "lesson_id": lesson_id}

@router.put("/lessons/{lesson_id}", dependencies=[Depends(get_current_admin)])
async def update_lesson(lesson_id: str, body: LessonUpdate):
    db = get_database()
    update_data = {k: v for k, v in body.dict().items() if v is not None}
    
    # Format questions to dict if they are updated
    if "quiz_questions" in update_data and update_data["quiz_questions"] is not None:
        update_data["quiz_questions"] = [q.dict() for q in body.quiz_questions]
        
    if not update_data:
        raise HTTPException(status_code=400, detail="Không có dữ liệu cập nhật")
        
    result = await db["lessons"].update_one({"_id": lesson_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài học")
        
    return {"message": "Cập nhật bài học thành công ✅"}

@router.delete("/lessons/{lesson_id}", dependencies=[Depends(get_current_admin)])
async def delete_lesson(lesson_id: str):
    db = get_database()
    result = await db["lessons"].delete_one({"_id": lesson_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài học")
    return {"message": "Xóa bài học thành công ✅"}
