from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException, status
from core.database import get_database
from core.security import hash_password, verify_password, create_access_token, create_refresh_token

async def register_user(email: str, password: str, full_name: str) -> dict:
    db = get_database()
    # Kiểm tra email đã tồn tại chưa
    existing = await db["users"].find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email đã được sử dụng")
    
    user_id = str(ObjectId())
    user_doc = {
        "_id": user_id,
        "email": email,
        "password_hash": hash_password(password),
        "full_name": full_name,
        "role": "admin" if "admin" in email.lower() else "student",
        "grade": None,
        "avatar_url": None,
        "subscription_type": "free",
        "daily_chat_count": 0,
        "onboarding_completed": False,
        "selected_character": None,
        "last_active": datetime.utcnow(),
        "created_at": datetime.utcnow(),
    }
    await db["users"].insert_one(user_doc)
    
    access_token = create_access_token({"sub": user_id})
    refresh_token = create_refresh_token({"sub": user_id})
    
    # Lưu refresh token vào DB
    await db["sessions"].insert_one({
        "_id": str(ObjectId()),
        "user_id": user_id,
        "refresh_token": refresh_token,
        "created_at": datetime.utcnow(),
    })
    
    return {"access_token": access_token, "refresh_token": refresh_token, "user": user_doc}

async def login_user(email: str, password: str) -> dict:
    db = get_database()
    user = await db["users"].find_one({"email": email})
    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng")
    
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

async def refresh_access_token(refresh_token: str) -> str:
    from jose import jwt, JWTError
    from core.config import settings
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
