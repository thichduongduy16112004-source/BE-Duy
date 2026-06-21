from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field
from datetime import datetime

from models.user import UserCreate, UserLogin
from models.session import TokenResponse, RefreshRequest, LogoutRequest
from services.auth_service import (
    register_user, 
    login_user, 
    refresh_access_token, 
    logout_user, 
    google_auth,
    verify_email,
    forgot_password,
    reset_password,
    resend_verification_email
)
from core.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])

RANK_LABELS = {
    "iron": "Hạng Sắt",
    "bronze": "Hạng Đồng",
    "silver": "Hạng Bạc",
    "gold": "Hạng Vàng",
}


def serialize_datetime(value):
    if isinstance(value, datetime):
        return value.isoformat()
    return value


def format_user_response(user: dict) -> dict:
    sub_type = user.get("subscription_type", "free")
    created_at = serialize_datetime(user.get("created_at"))
    rank = user.get("rank") or "iron"
    return {
        "id": user["_id"],
        "username": user.get("username", user["email"].split("@")[0]),
        "email": user["email"],
        "name": user.get("full_name", ""),
        "full_name": user.get("full_name", ""),
        "role": user.get("role", "student"),
        "dob": user.get("dob"),
        "phone": user.get("phone"),
        "grade": user.get("grade"),
        "avatar": user.get("avatar_url"),
        "avatar_url": user.get("avatar_url"),
        "mascotId": user.get("selected_character"),
        "studyMinutes": user.get("study_minutes", 15),
        "xp": user.get("xp", 0),
        "streak": user.get("streak", 0),
        "gems": user.get("gems", 0),
        "hearts": user.get("hearts", 5),
        "completedLessons": user.get("completed_lessons", []),
        "achievements": user.get("achievements", []),
        "rank": rank,
        "rankLabel": RANK_LABELS.get(rank, RANK_LABELS["iron"]),
        "lastStreakDate": user.get("last_streak_date"),
        "joinedAt": created_at,
        "activitySummary": user.get("activity_summary"),
        "isPremium": sub_type in ["premium", "trial"],
        "planType": sub_type,
        "subscription_type": sub_type,
        "trialEndDate": serialize_datetime(user.get("trial_end_date")) if user.get("trial_end_date") else None,
        "premiumEndDate": serialize_datetime(user.get("premium_end_date")) if user.get("premium_end_date") else None,
        "isNewUser": user.get("is_new_user", user.get("isNewUser", False)),
        "created_at": created_at,
    }

@router.post("/register")
async def register(body: UserCreate):
    result = await register_user(body.email, body.password, body.full_name, body.username)
    return result

@router.get("/verify-email")
async def verify_email_route(token: str):
    await verify_email(token)
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?verified=true")

class ResendVerificationRequest(BaseModel):
    email: str

@router.post("/resend-verification")
async def resend_verification_route(body: ResendVerificationRequest):
    result = await resend_verification_email(body.email)
    return result

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)

@router.post("/forgot-password")
async def forgot_password_route(body: ForgotPasswordRequest):
    result = await forgot_password(body.email)
    return result

@router.post("/reset-password")
async def reset_password_route(body: ResetPasswordRequest):
    result = await reset_password(body.token, body.new_password)
    return result

class GoogleLoginRequest(BaseModel):
    credential: str

@router.post("/google")
async def google_login(body: GoogleLoginRequest):
    result = await google_auth(body.credential)
    return {
        "access_token": result["access_token"],
        "refresh_token": result["refresh_token"],
        "user": format_user_response(result["user"]),
        "is_new": result["is_new_user"]
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
