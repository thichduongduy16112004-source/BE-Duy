import secrets
from datetime import datetime, timedelta
from bson import ObjectId
from fastapi import HTTPException, status
from core.database import get_database
from core.security import hash_password, verify_password, create_access_token, create_refresh_token
from services.email_service import EmailService

# Import for Google OAuth
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from core.config import settings

async def register_user(email: str, password: str, full_name: str | None = None, username: str | None = None) -> dict:
    db = get_database()
    existing = await db["users"].find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email đã được sử dụng")
    
    user_id = str(ObjectId())
    username = username or email.split("@")[0]
    display_name = full_name or username
    verification_token = secrets.token_urlsafe(32)

    user_doc = {
        "_id": user_id,
        "email": email,
        "username": username,
        "password_hash": hash_password(password),
        "full_name": display_name,
        "role": "admin" if "admin" in email.lower() else "student",
        "tenant_id": None,
        "is_verified": False,
        "verification_token": verification_token,
        "google_id": None,
        "grade": None,
        "selected_character": None,
        "onboarding_completed": False,
        "hearts": 5,
        "xp": 0,
        "gems": 0,
        "streak": 0,
        "rank": "iron",
        "last_streak_date": None,
        "last_heart_update": datetime.utcnow(),
        "last_active_date": "",
        "subscription_type": "free",
        "isPremium": False,
        "trial_end_date": None,
        "premium_end_date": None,
        "daily_chat_count": 0,
        "last_active": datetime.utcnow(),
        "created_at": datetime.utcnow(),
        "isNewUser": True
    }
    
    await db["users"].insert_one(user_doc)
    
    # Gửi email xác nhận
    EmailService.send_verification_email(email, display_name, verification_token)
    
    return {"message": "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận."}

async def verify_email(token: str) -> dict:
    db = get_database()
    user = await db["users"].find_one({"verification_token": token})
    if not user:
        raise HTTPException(status_code=400, detail="Token không hợp lệ hoặc đã hết hạn")
        
    await db["users"].update_one(
        {"_id": user["_id"]},
        {"$set": {"is_verified": True, "verification_token": None}}
    )
    
    access_token = create_access_token({"sub": user["_id"]})
    refresh_token = create_refresh_token({"sub": user["_id"]})
    
    await db["sessions"].insert_one({
        "_id": str(ObjectId()),
        "user_id": user["_id"],
        "refresh_token": refresh_token,
        "created_at": datetime.utcnow(),
    })
    
    updated_user = await db["users"].find_one({"_id": user["_id"]})
    return {"access_token": access_token, "refresh_token": refresh_token, "user": updated_user}

async def resend_verification_email(email: str) -> dict:
    db = get_database()
    user = await db["users"].find_one({"$or": [{"email": email}, {"username": email}]})
    
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản")
        
    if user.get("is_verified"):
        raise HTTPException(status_code=400, detail="Tài khoản đã được xác nhận")
        
    verification_token = user.get("verification_token")
    if not verification_token:
        verification_token = secrets.token_urlsafe(32)
        await db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": {"verification_token": verification_token}}
        )
        
    EmailService.send_verification_email(user["email"], user.get("full_name", user.get("username")), verification_token)
    return {"message": "Email xác nhận đã được gửi lại"}

async def login_user(email: str, password: str) -> dict:
    db = get_database()
    user = await db["users"].find_one({"email": email})
    
    if not user or not user.get("password_hash") or not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng")
    
    if not user.get("is_verified", False):
        raise HTTPException(status_code=403, detail="Vui lòng xác nhận email trước khi đăng nhập")

    access_token = create_access_token({"sub": user["_id"]})
    refresh_token = create_refresh_token({"sub": user["_id"]})
    
    await db["sessions"].insert_one({
        "_id": str(ObjectId()),
        "user_id": user["_id"],
        "refresh_token": refresh_token,
        "created_at": datetime.utcnow(),
    })
    
    await db["users"].update_one({"_id": user["_id"]}, {"$set": {"last_active": datetime.utcnow()}})
    return {"access_token": access_token, "refresh_token": refresh_token, "user": user}

async def forgot_password(email: str) -> dict:
    db = get_database()
    user = await db["users"].find_one({"email": email})
    if user:
        reset_token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=1)
        
        await db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": {"reset_token": reset_token, "reset_token_expires": expires_at}}
        )
        
        EmailService.send_password_reset_email(email, reset_token)
        
    # Luôn trả 200 để tránh tiết lộ email
    return {"message": "Nếu email tồn tại, chúng tôi đã gửi liên kết khôi phục mật khẩu."}

async def reset_password(token: str, new_password: str) -> dict:
    db = get_database()
    user = await db["users"].find_one({
        "reset_token": token,
        "reset_token_expires": {"$gt": datetime.utcnow()}
    })
    
    if not user:
        raise HTTPException(status_code=400, detail="Liên kết không hợp lệ hoặc đã hết hạn")
        
    await db["users"].update_one(
        {"_id": user["_id"]},
        {
            "$set": {"password_hash": hash_password(new_password)},
            "$unset": {"reset_token": "", "reset_token_expires": ""}
        }
    )
    
    EmailService.send_password_change_email(user["email"], user["full_name"])
    
    return {"message": "Mật khẩu đã được cập nhật thành công"}

async def refresh_access_token(refresh_token: str) -> str:
    from jose import jwt, JWTError
    db = get_database()
    
    try:
        payload = jwt.decode(refresh_token, settings.JWT_REFRESH_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Refresh token không hợp lệ")
    
    session = await db["sessions"].find_one({"refresh_token": refresh_token})
    if not session:
        raise HTTPException(status_code=401, detail="Session không tồn tại")
    
    return create_access_token({"sub": user_id})

async def logout_user(refresh_token: str):
    db = get_database()
    await db["sessions"].delete_one({"refresh_token": refresh_token})

async def google_auth(id_token: str) -> dict:
    db = get_database()
    try:
        idinfo = google_id_token.verify_oauth2_token(
            id_token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
    except ValueError:
        raise HTTPException(status_code=401, detail="Google token không hợp lệ")
        
    email = idinfo.get("email")
    full_name = idinfo.get("name")
    avatar_url = idinfo.get("picture")
    google_id = idinfo.get("sub")
    
    if not email:
        raise HTTPException(status_code=400, detail="Không lấy được email từ Google")
        
    existing = await db["users"].find_one({"email": email})
    is_new_user = False
    
    if existing:
        updates = {"is_verified": True}
        if not existing.get("google_id"):
            updates["google_id"] = google_id
        if not existing.get("avatar_url"):
            updates["avatar_url"] = avatar_url
            
        await db["users"].update_one({"_id": existing["_id"]}, {"$set": updates})
        user = await db["users"].find_one({"_id": existing["_id"]})
    else:
        is_new_user = True
        user_id = str(ObjectId())
        user = {
            "_id": user_id,
            "email": email,
            "password_hash": None,
            "full_name": full_name or email.split("@")[0],
            "role": "student",
            "tenant_id": None,
            "is_verified": True,
            "verification_token": None,
            "google_id": google_id,
            "grade": None,
            "selected_character": None,
            "onboarding_completed": False,
            "hearts": 5,
            "xp": 0,
            "gems": 0,
            "streak": 0,
            "rank": "iron",
            "last_streak_date": None,
            "last_heart_update": datetime.utcnow(),
            "last_active_date": "",
            "subscription_type": "free",
            "isPremium": False,
            "trial_end_date": None,
            "premium_end_date": None,
            "daily_chat_count": 0,
            "last_active": datetime.utcnow(),
            "created_at": datetime.utcnow(),
            "avatar_url": avatar_url,
            "username": email.split("@")[0],
            "isNewUser": True
        }
        await db["users"].insert_one(user)
        EmailService.send_welcome_email(email, user["full_name"])

    access_token = create_access_token({"sub": user["_id"]})
    refresh_token = create_refresh_token({"sub": user["_id"]})
    
    await db["sessions"].insert_one({
        "_id": str(ObjectId()),
        "user_id": user["_id"],
        "refresh_token": refresh_token,
        "created_at": datetime.utcnow(),
    })
    
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token, 
        "user": user,
        "is_new_user": is_new_user
    }
