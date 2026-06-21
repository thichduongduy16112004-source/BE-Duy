from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from core.database import get_database
from core.security import get_current_user
from models.quiz import QuizTopicCreate, QuizTopicUpdate, QuizTopicResponse

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])

# Helper function to check if the current user is an admin
async def get_current_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản không có quyền thực hiện thao tác này."
        )
    return current_user

@router.get("/topics", response_model=List[QuizTopicResponse])
async def get_quiz_topics():
    db = get_database()
    cursor = db["quizzes"].find().sort("id", 1)
    topics = []
    async for doc in cursor:
        topics.append({
            "id": doc["id"],
            "name": doc["name"],
            "title": doc["title"],
            "icon": doc["icon"],
            "color": doc["color"],
            "questions": doc.get("questions", [])
        })
    return topics

@router.get("/topics/{topic_id}", response_model=QuizTopicResponse)
async def get_quiz_topic(topic_id: int):
    db = get_database()
    doc = await db["quizzes"].find_one({"id": topic_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Không tìm thấy chủ đề trắc nghiệm")
    return {
        "id": doc["id"],
        "name": doc["name"],
        "title": doc["title"],
        "icon": doc["icon"],
        "color": doc["color"],
        "questions": doc.get("questions", [])
    }

@router.post("/topics", response_model=QuizTopicResponse, dependencies=[Depends(get_current_admin)])
async def create_quiz_topic(body: QuizTopicCreate):
    db = get_database()
    # Check if ID already exists
    existing = await db["quizzes"].find_one({"id": body.id})
    if existing:
        raise HTTPException(status_code=400, detail="ID chủ đề đã tồn tại")
        
    doc = {
        "_id": f"topic_{body.id}",
        "id": body.id,
        "name": body.name,
        "title": body.title,
        "icon": body.icon,
        "color": body.color,
        "questions": [q.dict() for q in body.questions]
    }
    await db["quizzes"].insert_one(doc)
    return doc

@router.put("/topics/{topic_id}", response_model=QuizTopicResponse, dependencies=[Depends(get_current_admin)])
async def update_quiz_topic(topic_id: int, body: QuizTopicUpdate):
    db = get_database()
    update_data = {k: v for k, v in body.dict().items() if v is not None}
    
    if "questions" in update_data:
        update_data["questions"] = [q.dict() for q in body.questions]
        
    if not update_data:
        raise HTTPException(status_code=400, detail="Không có dữ liệu cập nhật")
        
    result = await db["quizzes"].update_one({"id": topic_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy chủ đề trắc nghiệm")
        
    doc = await db["quizzes"].find_one({"id": topic_id})
    return {
        "id": doc["id"],
        "name": doc["name"],
        "title": doc["title"],
        "icon": doc["icon"],
        "color": doc["color"],
        "questions": doc.get("questions", [])
    }

@router.delete("/topics/{topic_id}", dependencies=[Depends(get_current_admin)])
async def delete_quiz_topic(topic_id: int):
    db = get_database()
    result = await db["quizzes"].delete_one({"id": topic_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy chủ đề trắc nghiệm")
    return {"message": "Xóa chủ đề trắc nghiệm thành công ✅"}
