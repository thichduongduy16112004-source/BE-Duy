from fastapi import APIRouter
from models.user import UserCreate, UserLogin
from models.session import TokenResponse, RefreshRequest, LogoutRequest
from services.auth_service import register_user, login_user, refresh_access_token, logout_user

router = APIRouter(prefix="/auth", tags=["Auth"])

from datetime import datetime

def format_user_response(user: dict) -> dict:
    sub_type = user.get("subscription_type", "free")
    return {
        "id": user["_id"],
        "username": user.get("username", user["email"].split("@")[0]),
        "email": user["email"],
        "name": user.get("full_name", ""),
        "full_name": user.get("full_name", ""), # Support admin web
        "role": user.get("role", "student"),
        "dob": user.get("dob"),
        "phone": user.get("phone"),
        "grade": user.get("grade"),
        "avatar": user.get("avatar_url"),
        "avatar_url": user.get("avatar_url"), # Support admin web
        "mascotId": user.get("selected_character"),
        "studyMinutes": user.get("study_minutes", 15),
        "xp": user.get("xp", 0),
        "streak": user.get("streak", 1),
        "gems": user.get("gems", 50),
        "hearts": user.get("hearts", 5),
        "completedLessons": user.get("completed_lessons", []),
        "achievements": user.get("achievements", []),
        "isPremium": sub_type == "premium",
        "planType": sub_type,
        "subscription_type": sub_type, # Support admin web
        "trialEndDate": user.get("trial_end_date").isoformat() if user.get("trial_end_date") else None,
        "isNewUser": user.get("is_new_user", False),
        "created_at": user["created_at"].isoformat() if isinstance(user["created_at"], datetime) else user["created_at"]
    }

@router.post("/register")
async def register(body: UserCreate):
    result = await register_user(body.email, body.password, body.full_name, body.username)
    return {
        "access_token": result["access_token"],
        "refresh_token": result["refresh_token"],
        "user": format_user_response(result["user"])
    }

@router.post("/login")
async def login(body: UserLogin):
    result = await login_user(body.identity, body.password)
    return {
        "access_token": result["access_token"],
        "refresh_token": result["refresh_token"],
        "user": format_user_response(result["user"])
    }

@router.post("/refresh")
async def refresh(body: RefreshRequest):
    token = await refresh_access_token(body.refresh_token)
    return {"access_token": token}

@router.post("/logout")
async def logout(body: LogoutRequest):
    await logout_user(body.refresh_token)
    return {"message": "Logged out successfully"}
