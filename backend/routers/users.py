from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from models.user import UserUpdate, UserOnboarding, ChangePasswordRequest
from core.security import get_current_user, verify_password, hash_password
from core.database import get_database
from datetime import datetime, timedelta
from services.email_service import EmailService

router = APIRouter(prefix="/users", tags=["Users"])

from routers.auth import format_user_response


def serialize_datetime(value):
    if isinstance(value, datetime):
        return value.isoformat()
    return value


async def build_activity_summary(user_id: str) -> dict:
    db = get_database()
    total_attempts = await db["quiz_attempts"].count_documents({"user_id": user_id})
    total_completed_lessons = await db["user_progress"].count_documents({"user_id": user_id, "status": "completed"})
    latest_attempt = await db["quiz_attempts"].find_one({"user_id": user_id}, sort=[("created_at", -1)])
    recent_items = []

    cursor = db["quiz_attempts"].find(
        {"user_id": user_id},
        {"lessonLegacyId": 1, "mode": 1, "correctAnswers": 1, "totalQuestions": 1, "completed": 1, "created_at": 1}
    ).sort("created_at", -1).limit(7)

    async for item in cursor:
        recent_items.append({
            "lessonId": item.get("lessonLegacyId"),
            "mode": item.get("mode"),
            "correctAnswers": item.get("correctAnswers", 0),
            "totalQuestions": item.get("totalQuestions", 0),
            "completed": item.get("completed", False),
            "createdAt": serialize_datetime(item.get("created_at")),
        })

    return {
        "totalAttempts": total_attempts,
        "totalCompletedLessons": total_completed_lessons,
        "latestActivityAt": serialize_datetime(latest_attempt.get("created_at")) if latest_attempt else None,
        "recentItems": recent_items,
    }


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    response = format_user_response(current_user)
    response["activitySummary"] = await build_activity_summary(current_user["_id"])
    return response

@router.put("/me")
async def update_me(body: UserUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    raw_data = {k: v for k, v in body.dict().items() if v is not None}
    update_data = {}
    for k, v in raw_data.items():
        if k == "name":
            update_data["full_name"] = v
        elif k == "avatar":
            update_data["avatar_url"] = v
        elif k == "mascotId":
            update_data["selected_character"] = v
        elif k == "studyMinutes":
            update_data["study_minutes"] = v
        elif k == "planType":
            update_data["subscription_type"] = v
        elif k == "premiumEndDate":
            update_data["premium_end_date"] = v
        elif k == "completedLessons":
            update_data["completed_lessons"] = v
        elif k == "lastStreakDate":
            update_data["last_streak_date"] = v
        elif k == "isNewUser":
            update_data["isNewUser"] = v
        else:
            update_data[k] = v

    if "email" in update_data:
        existing = await db["users"].find_one({"email": update_data["email"], "_id": {"$ne": current_user["_id"]}})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email đã được sử dụng bởi người dùng khác"
            )

    if update_data:
        await db["users"].update_one({"_id": current_user["_id"]}, {"$set": update_data})
    updated = await db["users"].find_one({"_id": current_user["_id"]})
    response = format_user_response(updated)
    response["activitySummary"] = await build_activity_summary(current_user["_id"])
    return response

@router.post("/me/trial")
async def activate_trial(current_user: dict = Depends(get_current_user)):
    db = get_database()
    if current_user.get("trial_end_date"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bạn đã từng sử dụng gói dùng thử, không thể đăng ký lại."
        )
    
    now = datetime.utcnow()
    trial_end = now + timedelta(days=3)
    update_data = {
        "trial_end_date": trial_end,
        "subscription_type": "trial",
        "isPremium": True
    }
    
    await db["users"].update_one({"_id": current_user["_id"]}, {"$set": update_data})
    updated = await db["users"].find_one({"_id": current_user["_id"]})
    response = format_user_response(updated)
    response["activitySummary"] = await build_activity_summary(current_user["_id"])
    return response

@router.put("/me/onboarding")
async def onboarding(body: UserOnboarding, current_user: dict = Depends(get_current_user)):
    db = get_database()
    update_dict = {"onboarding_completed": True}
    if body.grade is not None:
        update_dict["grade"] = body.grade
    if body.mascotId is not None:
        update_dict["selected_character"] = body.mascotId
    elif body.selected_character is not None:
        update_dict["selected_character"] = body.selected_character
    if body.name is not None:
        update_dict["full_name"] = body.name
    if body.studyMinutes is not None:
        update_dict["study_minutes"] = body.studyMinutes

    await db["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": update_dict}
    )
    updated = await db["users"].find_one({"_id": current_user["_id"]})
    response = format_user_response(updated)
    response["activitySummary"] = await build_activity_summary(current_user["_id"])
    return {"message": "Onboarding completed ✅", "user": response}

@router.get("/me/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    return {
        "total_sessions": 0,
        "daily_chat_remaining": max(0, 3 - current_user.get("daily_chat_count", 0))
    }

@router.post("/me/change-password")
async def change_password(body: ChangePasswordRequest, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    db_pass_hash = current_user.get("password_hash")
    if db_pass_hash:
        if not verify_password(body.old_password, db_pass_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mật khẩu cũ không chính xác"
            )
        
        if verify_password(body.new_password, db_pass_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mật khẩu mới không được giống mật khẩu cũ"
            )

    db = get_database()
    await db["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": {"password_hash": hash_password(body.new_password)}}
    )
    background_tasks.add_task(EmailService.send_password_change_email, current_user["email"], current_user.get("full_name", current_user["username"]))
    return {"message": "Đổi mật khẩu thành công ✅"}
