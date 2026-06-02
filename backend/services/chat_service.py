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
    try:
        if settings.OPENAI_API_KEY == "mock-key":
            raise Exception("OPENAI_API_KEY is configured as 'mock-key'")
            
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
    except Exception as e:
        import asyncio
        print(f"[Warning] OpenAI Stream error (using mock fallback): {e}")
        
        mock_replies = {
            "hung-vuong": "Hùng Vương ta nghe rõ lời con. Triều đại của ta dựng nước Văn Lang trải qua 18 đời, là thuở dựng nước sơ khai đầy tự hào của đất nước Việt Nam. Con muốn biết thêm về truyền thuyết hay sự kiện nào?",
            "hai-ba-trung": "Ta là Trưng Trắc cùng em Trưng Nhị quyết chí đền nợ nước trả thù nhà, đánh đuổi Thái thú Tô Định của nhà Hán. Hậu sinh có muốn hỏi về lời thề trước trận đánh hay lòng quả cảm của nhân dân ta?",
            "ngo-quyen": "Ta nghe đây người trẻ tuổi! Trên sông Bạch Đằng năm 938, ta đã cho cắm hàng ngàn cọc gỗ vạt nhọn bọc sắt xuống lòng sông để tiêu diệt chiến thuyền Nam Hán, mở ra kỷ nguyên độc lập lâu dài.",
            "ly-thuong-kiet": "Ta nghe đây. Trận chiến bên dòng sông Như Nguyệt chống quân Tống xâm lược đã vang lên bài thơ thần 'Nam quốc sơn hà' khẳng định chủ quyền của nước Nam ta. Con có muốn tìm hiểu về phòng tuyến Như Nguyệt?",
            "tran-hung-dao": "Ta là Trần Quốc Tuấn, hiệu Hưng Đạo Đại Vương. Ba lần đại phá quân Mông - Nguyên là nhờ sức mạnh đoàn kết toàn dân tộc, 'vua tôi đồng lòng, anh em hòa thuận'. Con muốn hỏi về Binh thư yếu lược hay Hịch tướng sĩ?",
            "le-loi": "Ta nghe rõ tiếng lòng con. Ta dựng cờ khởi nghĩa Lam Sơn ròng rã 10 năm trời mới đánh tan được quân Minh, lập lại nền độc lập, dựng lên nhà Lê. Hãy hỏi ta về tấm lòng cứu nước hay Hội thề Lũng Nhai.",
            "quang-trung": "Ta là Nguyễn Huệ Quang Trung. Vào tết Kỷ Dậu 1789, ta đã thần tốc hành quân ra Bắc, tiêu diệt 29 vạn quân Thanh xâm lược trong trận Ngọc Hồi - Đống Đa. Hậu sinh có muốn nghe về chiến thuật hành quân thần tốc?",
            "ho-chi-minh": "Bác nghe đây cháu trẻ! Để tìm con đường cứu nước, Bác đã ra đi từ bến cảng Nhà Rồng năm 1911 và trải qua nhiều năm bôn ba hải ngoại để đưa cách mạng Việt Nam tới độc lập. Hãy luôn siêng năng học tập nhé!",
            "nguyen-trai": "Chào hậu sinh! Năm 1428, đại cục đã định. Con có biết ta đã viết áng thiên cổ hùng văn nào để bá cáo thiên hạ không?"
        }
        
        reply = mock_replies.get(character["id"], f"Ta là {character['name']}. Lịch sử nước Việt ta vô cùng hào hùng, con hãy cứ hỏi, ta sẽ chia sẻ với con.")
        
        # Bổ sung một chút tương tác cá nhân nếu user hỏi câu dài
        if len(user_message.strip()) > 3:
            reply += f" Câu hỏi của con về '{user_message}' làm ta rất suy ngẫm."
            
        # Chia nhỏ chuỗi và yield để giả lập streaming
        words = reply.split(" ")
        for i, word in enumerate(words):
            yield (word + " " if i < len(words) - 1 else word)
            await asyncio.sleep(0.05)
