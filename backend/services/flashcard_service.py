import json
from openai import AsyncOpenAI
from core.config import settings
from core.database import get_database
from bson import ObjectId
from datetime import datetime

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def generate_flashcard(session: dict, character: dict) -> dict:
    db = get_database()
    
    # Tổng hợp hội thoại
    conversation = "\n".join([
        f"{'Học sinh' if m['role'] == 'user' else character['name']}: {m['content']}"
        for m in session.get("messages", [])
    ])
    
    prompt = f"""Dựa trên hội thoại giữa học sinh và nhân vật lịch sử {character['name']},
hãy tóm tắt 3-5 điểm kiến thức lịch sử quan trọng.

Hội thoại:
{conversation}

Trả về JSON hợp lệ (không có markdown):
{{"summary": "tóm tắt ngắn 1-2 câu", "key_points": ["điểm 1", "điểm 2", "điểm 3"]}}"""

    response = await client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500,
        temperature=0.3,
    )
    
    raw = response.choices[0].message.content.strip()
    # Bỏ markdown nếu có
    raw = raw.replace("```json", "").replace("```", "").strip()
    data = json.loads(raw)
    
    flashcard_id = str(ObjectId())
    flashcard_doc = {
        "_id": flashcard_id,
        "user_id": session["user_id"],
        "session_id": session["_id"],
        "character_id": character["id"],
        "character_name": character["name"],
        "summary": data["summary"],
        "key_points": data["key_points"],
        "created_at": datetime.utcnow(),
    }
    await db["flashcards"].insert_one(flashcard_doc)
    return flashcard_doc
