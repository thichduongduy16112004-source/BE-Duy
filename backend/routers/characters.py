from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/characters", tags=["Characters"])

CHARACTERS = [
    {"id": "hung-vuong", "name": "Hùng Vương", "era": "Thời dựng nước (2879 - 258 TCN)", "role": "Vua sáng lập nhà nước Văn Lang", "description": "Người đặt nền móng cho quốc gia đầu tiên của người Việt.", "grade": ["cap2"]},
    {"id": "hai-ba-trung", "name": "Hai Bà Trưng", "era": "Thế kỷ 1 SCN (40 - 43)", "role": "Lãnh đạo cuộc khởi nghĩa chống quân Hán", "description": "Hai vị nữ anh hùng đầu tiên trong lịch sử dân tộc Việt Nam.", "grade": ["cap2", "cap3"]},
    {"id": "ngo-quyen", "name": "Ngô Quyền", "era": "Thế kỷ 10 (938)", "role": "Người chiến thắng trận Bạch Đằng, chấm dứt 1000 năm Bắc thuộc", "description": "Vị tướng tài ba dùng cọc nhọn đánh tan quân Nam Hán trên sông Bạch Đằng.", "grade": ["cap2", "cap3"]},
    {"id": "ly-thuong-kiet", "name": "Lý Thường Kiệt", "era": "Thế kỷ 11 (1019 - 1105)", "role": "Danh tướng nhà Lý, tác giả bài thơ Nam quốc sơn hà", "description": "Người chỉ huy cuộc kháng chiến chống Tống, tác giả tuyên ngôn độc lập đầu tiên.", "grade": ["cap2", "cap3"]},
    {"id": "tran-hung-dao", "name": "Trần Hưng Đạo", "era": "Thế kỷ 13 (1228 - 1300)", "role": "Tổng chỉ huy 3 lần kháng chiến chống quân Mông - Nguyên", "description": "Vị anh hùng dân tộc vĩ đại, người ba lần đánh bại đế quốc Mông Cổ hùng mạnh.", "grade": ["cap2", "cap3"]},
    {"id": "le-loi", "name": "Lê Lợi", "era": "Thế kỷ 15 (1385 - 1433)", "role": "Lãnh đạo khởi nghĩa Lam Sơn, lập ra nhà Lê", "description": "Người anh hùng áo vải đất Lam Sơn, giải phóng đất nước khỏi ách đô hộ nhà Minh.", "grade": ["cap2", "cap3"]},
    {"id": "quang-trung", "name": "Nguyễn Huệ — Quang Trung", "era": "Thế kỷ 18 (1753 - 1792)", "role": "Hoàng đế Tây Sơn, đánh bại 29 vạn quân Thanh", "description": "Vị anh hùng áo vải Tây Sơn, người đại phá quân Thanh trong trận Đống Đa lịch sử.", "grade": ["cap2", "cap3"]},
    {"id": "ho-chi-minh", "name": "Hồ Chí Minh", "era": "Thế kỷ 20 (1890 - 1969)", "role": "Chủ tịch nước, lãnh tụ cách mạng Việt Nam", "description": "Người sáng lập nước Việt Nam Dân chủ Cộng hòa, lãnh đạo nhân dân giành độc lập.", "grade": ["cap2", "cap3"]},
]

@router.get("/")
async def get_characters():
    return {"characters": CHARACTERS, "total": len(CHARACTERS)}

@router.get("/{character_id}")
async def get_character(character_id: str):
    char = next((c for c in CHARACTERS if c["id"] == character_id), None)
    if not char:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân vật")
    return char
