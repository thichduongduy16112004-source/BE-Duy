from fastapi import APIRouter, Depends, HTTPException
from core.security import get_current_user
from core.database import get_database

router = APIRouter(prefix="/flashcards", tags=["Flashcards"])

@router.get("/")
async def get_flashcards(current_user: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db["flashcards"].find({"user_id": current_user["_id"]}).sort("created_at", -1)
    flashcards = await cursor.to_list(length=50)
    for f in flashcards:
        f["id"] = f.pop("_id")
    return {"flashcards": flashcards}

@router.get("/{flashcard_id}")
async def get_flashcard(flashcard_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    fc = await db["flashcards"].find_one({"_id": flashcard_id, "user_id": current_user["_id"]})
    if not fc:
        raise HTTPException(status_code=404, detail="Không tìm thấy flashcard")
    fc["id"] = fc.pop("_id")
    return fc

@router.delete("/{flashcard_id}")
async def delete_flashcard(flashcard_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    result = await db["flashcards"].delete_one({"_id": flashcard_id, "user_id": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy flashcard")
    return {"message": "Đã xóa flashcard ✅"}
