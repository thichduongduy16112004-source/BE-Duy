from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from pydantic import BaseModel
import httpx
from bson import ObjectId
from datetime import datetime

from models.user import UserCreate, UserLogin
from models.session import TokenResponse, RefreshRequest, LogoutRequest
from services.auth_service import register_user, login_user, refresh_access_token, logout_user, register_oauth_user
from services.email_service import EmailService
from core.security import create_access_token, create_refresh_token
from core.database import get_database
from core.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])

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
async def register(body: UserCreate, background_tasks: BackgroundTasks):
    result = await register_user(body.email, body.password, body.full_name, body.username)
    background_tasks.add_task(EmailService.send_welcome_email, body.email, body.full_name or body.username)
    return {
        "access_token": result["access_token"],
        "refresh_token": result["refresh_token"],
        "user": format_user_response(result["user"])
    }

class GoogleLoginRequest(BaseModel):
    credential: str

@router.post("/google")
async def google_login(body: GoogleLoginRequest, background_tasks: BackgroundTasks):
    if body.credential.startswith("mock-token-") and (settings.GOOGLE_CLIENT_ID == "mock-google-id" or settings.GOOGLE_CLIENT_ID == ""):
        mock_id = body.credential.replace("mock-token-", "")
        token_info = {
            "email": f"google_user_{mock_id}@gmail.com",
            "name": f"Google User {mock_id}",
            "picture": "mieu",
            "aud": "mock-google-id"
        }
    else:
        async with httpx.AsyncClient() as client:
            r = await client.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": body.credential}
            )
            if r.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Token Google không hợp lệ hoặc đã hết hạn"
                )
            token_info = r.json()

    expected_aud = settings.GOOGLE_CLIENT_ID
    if token_info.get("aud") != expected_aud and expected_aud != "mock-google-id":
        if token_info.get("aud") != "mock-google-id":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token không thuộc ứng dụng này"
            )

    email = token_info.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể lấy email từ tài khoản Google"
        )

    db = get_database()
    user = await db["users"].find_one({"email": email})
    
    is_new = False
    if not user:
        full_name = token_info.get("name", email.split("@")[0])
        avatar_url = token_info.get("picture")
        user = await register_oauth_user(email=email, full_name=full_name, avatar_url=avatar_url)
        is_new = True
        background_tasks.add_task(EmailService.send_welcome_email, email, full_name)

    user_id = user["_id"]
    access_token = create_access_token({"sub": user_id})
    refresh_token = create_refresh_token({"sub": user_id})

    await db["sessions"].insert_one({
        "_id": str(ObjectId()),
        "user_id": user_id,
        "refresh_token": refresh_token,
        "created_at": datetime.utcnow(),
    })

    await db["users"].update_one({"_id": user_id}, {"$set": {"last_active": datetime.utcnow()}})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": format_user_response(user),
        "is_new": is_new
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
