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

    try:
        if settings.OPENAI_API_KEY == "mock-key":
            raise Exception("OPENAI_API_KEY is configured as 'mock-key'")
            
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
    except Exception as e:
        print(f"[Warning] OpenAI Flashcard error (using mock fallback): {e}")
        
        # Mô phỏng flashcard dựa theo nhân vật
        mock_data = {
            "hung-vuong": {
                "summary": "Thời kỳ Hùng Vương dựng nước Văn Lang và những nét văn hóa sơ khai của người Việt cổ.",
                "key_points": [
                    "Nhà nước Văn Lang thành lập năm 2879 TCN, đóng đô ở Phong Châu (Phú Thọ).",
                    "Hùng Vương là vị vua sáng lập nước, truyền được 18 đời vua Hùng.",
                    "Đặc trưng văn hóa thời kỳ này gắn liền với văn minh lúa nước và trống đồng Đông Sơn."
                ]
            },
            "hai-ba-trung": {
                "summary": "Cuộc khởi nghĩa Hai Bà Trưng mở đầu thời kỳ đấu tranh giành độc lập chống Bắc thuộc.",
                "key_points": [
                    "Khởi nghĩa nổ ra năm 40 SCN tại Hát Môn (Hà Nội) do Trưng Trắc và Trưng Nhị lãnh đạo.",
                    "Nguyên nhân trực tiếp: Thái thú Tô Định tàn bạo, sát hại Thi Sách (chồng Trưng Trắc).",
                    "Ý nghĩa: Cuộc khởi nghĩa giành độc lập tự chủ đầu tiên của dân tộc sau hơn một thế kỷ bị đô hộ."
                ]
            },
            "ngo-quyen": {
                "summary": "Chiến thắng Bạch Đằng năm 938 kết thúc hơn 1000 năm Bắc thuộc của nước ta.",
                "key_points": [
                    "Ngô Quyền dùng trận địa cọc gỗ nhọn đầu bọc sắt cắm dưới lòng sông Bạch Đằng.",
                    "Lợi dụng thủy triều lên xuống để dụ và tiêu diệt hoàn toàn quân Nam Hán.",
                    "Mở ra kỷ nguyên độc lập tự chủ lâu dài và dựng nước vững chắc của Việt Nam."
                ]
            },
            "ly-thuong-kiet": {
                "summary": "Cuộc kháng chiến chống quân Tống thời nhà Lý và bài thơ thần Nam Quốc Sơn Hà.",
                "key_points": [
                    "Lý Thường Kiệt chủ trương 'tiên phát chế nhân' tấn công trước sang đất Tống để tự vệ.",
                    "Xây dựng phòng tuyến vững chắc dọc sông Như Nguyệt để đánh bại quân xâm lược.",
                    "Bài thơ 'Nam quốc sơn hà' được xem là bản Tuyên ngôn Độc lập đầu tiên của nước Việt."
                ]
            },
            "tran-hung-dao": {
                "summary": "Ba lần kháng chiến đại phá quân Mông - Nguyên thời nhà Trần dưới sự chỉ huy của Hưng Đạo Vương.",
                "key_points": [
                    "Trần Hưng Đạo soạn Hịch Tướng Sĩ nhằm khích lệ tinh thần trung quân ái quốc của binh lính.",
                    "Sử dụng chiến thuật 'vườn không nhà trống' làm hao mòn sinh lực địch rồi phản công thắng lợi.",
                    "Chiến thắng lẫy lừng khẳng định nghệ thuật quân sự độc đáo và tinh thần đại đoàn kết."
                ]
            },
            "le-loi": {
                "summary": "Khởi nghĩa Lam Sơn kéo dài 10 năm gian khổ đánh đuổi giặc Minh lập nên vương triều Hậu Lê.",
                "key_points": [
                    "Lê Lợi dựng cờ khởi nghĩa tại Lam Sơn (Thanh Hóa) năm 1418, xưng là Bình Định Vương.",
                    "Nguyễn Trãi viết Bình Ngô Đại Cáo tuyên bố độc lập sau khi khởi nghĩa thắng lợi.",
                    "Ý nghĩa: Đập tan ách thống trị tàn bạo của nhà Minh, mở đầu thời kỳ phục hưng thứ hai."
                ]
            },
            "quang-trung": {
                "summary": "Phong trào Tây Sơn và chiến công đại phá 29 vạn quân Thanh cứu nước năm 1789.",
                "key_points": [
                    "Nguyễn Huệ lên ngôi hoàng đế hiệu Quang Trung, hành quân thần tốc ra Bắc chỉ trong vài ngày.",
                    "Trận Ngọc Hồi - Đống Đa quét sạch quân xâm lược vào mùng 5 tết Kỷ Dậu.",
                    "Thể hiện tài năng quân sự xuất chúng của vua Quang Trung và tinh thần yêu nước quật cường."
                ]
            },
            "ho-chi-minh": {
                "summary": "Hành trình tìm đường cứu nước của Nguyễn Tất Thành và thắng lợi cách mạng giành độc lập.",
                "key_points": [
                    "Nguyễn Tất Thành ra đi tìm đường cứu nước năm 1911 từ bến cảng Nhà Rồng.",
                    "Sáng lập Đảng Cộng sản Việt Nam năm 1930 để lãnh đạo phong trào cách mạng.",
                    "Đọc Tuyên ngôn Độc lập khai sinh nước Việt Nam Dân chủ Cộng hòa ngày 2/9/1945."
                ]
            },
            "nguyen-trai": {
                "summary": "Nguyễn Trãi và khởi nghĩa Lam Sơn cùng tác phẩm kiệt xuất Bình Ngô Đại Cáo.",
                "key_points": [
                    "Nguyễn Trãi dâng Bình Ngô Sách cho Lê Lợi để vạch ra chiến lược đánh đuổi quân Minh.",
                    "Tác giả của tác phẩm Bình Ngô Đại Cáo tuyên bố độc lập cho đất nước năm 1428.",
                    "Được UNESCO công nhận là Danh nhân văn hóa thế giới năm 1980."
                ]
            }
        }
        
        data = mock_data.get(character["id"], {
            "summary": f"Bài học ôn tập lịch sử gắn liền với nhân vật {character['name']}.",
            "key_points": [
                f"Sự nghiệp lịch sử của {character['name']}.",
                f"Tầm quan trọng của triều đại {character['era']}.",
                f"Bài học lịch sử và tinh thần yêu nước rút ra."
            ]
        })
    
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
