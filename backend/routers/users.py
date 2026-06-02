from fastapi import APIRouter, Depends
from models.user import UserUpdate, UserOnboarding
from core.security import get_current_user
from core.database import get_database
from datetime import datetime

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["_id"],
        "email": current_user["email"],
        "full_name": current_user["full_name"],
        "role": current_user.get("role", "student"),
        "grade": current_user.get("grade"),
        "avatar_url": current_user.get("avatar_url"),
        "subscription_type": current_user.get("subscription_type", "free"),
        "daily_chat_count": current_user.get("daily_chat_count", 0),
        "onboarding_completed": current_user.get("onboarding_completed", False),
        "selected_character": current_user.get("selected_character"),
        "created_at": current_user["created_at"],
    }

@router.put("/me")
async def update_me(body: UserUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    update_data = {k: v for k, v in body.dict().items() if v is not None}
    if update_data:
        await db["users"].update_one({"_id": current_user["_id"]}, {"$set": update_data})
    updated = await db["users"].find_one({"_id": current_user["_id"]})
    return {"id": updated["_id"], "email": updated["email"], "full_name": updated["full_name"]}

@router.put("/me/onboarding")
async def onboarding(body: UserOnboarding, current_user: dict = Depends(get_current_user)):
    db = get_database()
    await db["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": {
            "grade": body.grade,
            "selected_character": body.selected_character,
            "onboarding_completed": True,
        }}
    )
    return {"message": "Onboarding completed ✅"}

@router.get("/me/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    return {
        "total_sessions": 0,
        "daily_chat_remaining": max(0, 3 - current_user.get("daily_chat_count", 0))
    }
