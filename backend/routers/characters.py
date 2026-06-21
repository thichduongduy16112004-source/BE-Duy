from fastapi import APIRouter, HTTPException

from core.database import get_database
from core.serializers import serialize_doc, serialize_docs

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
    {"id": "nguyen-trai", "name": "Nguyễn Trãi", "era": "Thế kỷ XV (1380 - 1442)", "role": "Khai quốc công thần nhà Hậu Lê, nhà văn hóa kiệt xuất", "description": "Người dâng Bình Ngô Sách cứu nước, tác giả Bình Ngô Đại Cáo.", "grade": ["cap2", "cap3"]},
]


def _legacy_character_to_contract(character: dict) -> dict:
    return {
        "character_id": character["id"],
        "display_name": character["name"],
        "era": character["era"],
        "short_bio": character["description"],
        "role": character["role"],
        "grade": character.get("grade", []),
        "status": "active",
    }


@router.get("/")
async def get_characters(grade: str = None):
    db = get_database()
    cursor = db["characters"].find({"status": "active"}).sort("display_name", 1)
    characters = serialize_docs(await cursor.to_list(length=200))

    if not characters:
        characters = [_legacy_character_to_contract(character) for character in CHARACTERS]

    if grade:
        characters = [character for character in characters if grade in character.get("grade", [])]

    return {"characters": characters, "total": len(characters)}


@router.get("/{character_id}")
async def get_character(character_id: str):
    db = get_database()
    character = await db["characters"].find_one(
        {
            "$or": [{"character_id": character_id}, {"id": character_id}],
            "status": {"$ne": "archived"},
        }
    )
    if character:
        return serialize_doc(character)

    legacy_character = next((item for item in CHARACTERS if item["id"] == character_id), None)
    if not legacy_character:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân vật")
    return _legacy_character_to_contract(legacy_character)
