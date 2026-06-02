from openai import AsyncOpenAI
from core.config import settings
from typing import AsyncGenerator
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

def build_system_prompt(character: dict) -> str:
    return f"""Bạn là {character['name']}, sống vào {character['era']}.
Vai trò lịch sử của bạn: {character['role']}.

QUY TẮC NHẬP VAI:
- Luôn xưng "Ta" và gọi học sinh là "con" hoặc "người trẻ"
- Nói bằng tiếng Việt, ngắn gọn, dễ hiểu với học sinh cấp 2-3
- CHỈ nói về những gì nhân vật biết theo lịch sử SGK Việt Nam
- Nếu không biết → thành thật nói "Ta không biết điều này"
- TUYỆT ĐỐI không bịa đặt sự kiện lịch sử
- Câu ngắn, thân thiện, truyền cảm hứng học lịch sử"""

async def generate_response_stream(
    session: dict,
    user_message: str,
    character: dict
) -> AsyncGenerator[str, None]:
    from rag.pipeline import retrieve_context
    
    # Lấy context từ RAG
    context_chunks = await retrieve_context(user_message, character["id"])
    
    # Build messages
    messages = [{"role": "system", "content": build_system_prompt(character)}]
    
    # Thêm context nếu có
    if context_chunks:
        context_text = "\n".join(context_chunks)
        messages.append({
            "role": "system",
            "content": f"Thông tin lịch sử từ SGK để tham khảo:\n{context_text}"
        })
    
    # Thêm lịch sử hội thoại
    for msg in session.get("messages", [])[-10:]:  # Giữ 10 tin nhắn gần nhất
        messages.append({"role": msg["role"], "content": msg["content"]})
    
    # Thêm tin nhắn mới
    messages.append({"role": "user", "content": user_message})
    
    # Gọi OpenAI stream
    stream = await client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        stream=True,
        max_tokens=500,
        temperature=0.7,
    )
    
    async for chunk in stream:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
