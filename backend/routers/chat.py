from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from core.security import get_current_user
from core.database import get_database
from models.chat import StartChatRequest, SendMessageRequest, EndChatRequest
from services.chat_service import generate_response_stream
from services.flashcard_service import generate_flashcard
from routers.characters import CHARACTERS
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/chat", tags=["Chat"])

def find_character(character_id: str):
    char = next((c for c in CHARACTERS if c["id"] == character_id), None)
    if not char:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân vật")
    return char

@router.post("/start")
async def start_chat(body: StartChatRequest, current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    # Kiểm tra giới hạn free
    if current_user.get("subscription_type", "free") == "free":
        if current_user.get("daily_chat_count", 0) >= 3:
            raise HTTPException(
                status_code=429,
                detail="Bạn đã dùng hết 3 lượt chat miễn phí hôm nay. Nâng cấp Premium để chat không giới hạn!"
            )
    
    character = find_character(body.character_id)
    session_id = str(ObjectId())
    session_doc = {
        "_id": session_id,
        "user_id": current_user["_id"],
        "character_id": body.character_id,
        "messages": [],
        "status": "active",
        "token_used": 0,
        "created_at": datetime.utcnow(),
    }
    await db["chat_sessions"].insert_one(session_doc)
    return {"session_id": session_id, "character": character}

@router.post("/message")
async def send_message(body: SendMessageRequest, current_user: dict = Depends(get_current_user)):
    db = get_database()
    session = await db["chat_sessions"].find_one({"_id": body.session_id, "user_id": current_user["_id"]})
    
    if not session:
        raise HTTPException(status_code=404, detail="Session không tồn tại")
    if session["status"] != "active":
        raise HTTPException(status_code=400, detail="Session đã kết thúc")
    
    character = find_character(session["character_id"])
    
    # Lưu tin nhắn user
    user_msg = {"role": "user", "content": body.message, "timestamp": datetime.utcnow(), "context_chunks": []}
    await db["chat_sessions"].update_one(
        {"_id": body.session_id},
        {"$push": {"messages": user_msg}}
    )
    
    # Collect full response để lưu vào DB
    full_response = []
    
    async def sse_generator():
        async for chunk in generate_response_stream(session, body.message, character):
            full_response.append(chunk)
            yield f"data: {chunk}\n\n"
        
        # Lưu assistant response vào DB
        assistant_msg = {
            "role": "assistant",
            "content": "".join(full_response),
            "timestamp": datetime.utcnow(),
            "context_chunks": []
        }
        await db["chat_sessions"].update_one(
            {"_id": body.session_id},
            {"$push": {"messages": assistant_msg}}
        )
        yield "data: [DONE]\n\n"
    
    return StreamingResponse(sse_generator(), media_type="text/event-stream")

@router.post("/end")
async def end_chat(body: EndChatRequest, current_user: dict = Depends(get_current_user)):
    db = get_database()
    session = await db["chat_sessions"].find_one({"_id": body.session_id, "user_id": current_user["_id"]})
    
    if not session:
        raise HTTPException(status_code=404, detail="Session không tồn tại")
    
    character = find_character(session["character_id"])
    
    # Kết thúc session
    await db["chat_sessions"].update_one({"_id": body.session_id}, {"$set": {"status": "ended"}})
    
    # Tăng daily_chat_count
    await db["users"].update_one({"_id": current_user["_id"]}, {"$inc": {"daily_chat_count": 1}})
    
    # Tạo flashcard
    flashcard = await generate_flashcard(session, character)
    return {"flashcard_id": flashcard["_id"], "message": "Session ended ✅", "flashcard": flashcard}

@router.get("/history/{session_id}")
async def get_history(session_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    session = await db["chat_sessions"].find_one({"_id": session_id, "user_id": current_user["_id"]})
    if not session:
        raise HTTPException(status_code=404, detail="Session không tồn tại")
    return {"messages": session["messages"], "status": session["status"]}

@router.get("/sessions")
async def get_sessions(page: int = 1, limit: int = 10, current_user: dict = Depends(get_current_user)):
    db = get_database()
    skip = (page - 1) * limit
    cursor = db["chat_sessions"].find({"user_id": current_user["_id"]}).sort("created_at", -1).skip(skip).limit(limit)
    sessions = await cursor.to_list(length=limit)
    for s in sessions:
        s["id"] = s.pop("_id")
        s.pop("messages", None)  # Không trả messages trong list
    return {"sessions": sessions, "page": page}
