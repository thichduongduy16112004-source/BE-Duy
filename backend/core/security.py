from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from core.config import settings
from core.database import get_database

import bcrypt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    pwd_bytes = plain.encode('utf-8')
    hashed_bytes = hashed.encode('utf-8')
    try:
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False

def create_access_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(minutes=15)
    return jwt.encode({**data, "exp": expire}, settings.JWT_SECRET, algorithm="HS256")

def create_refresh_token(data: dict) -> str:
    expire = datetime.utcnow() + timedelta(days=7)
    return jwt.encode({**data, "exp": expire}, settings.JWT_REFRESH_SECRET, algorithm="HS256")

def apply_gamification_rules(user: dict, now: datetime) -> dict:
    update_data = {}

    last_active_date = user.get("last_active_date")
    if not last_active_date or isinstance(last_active_date, str):
        update_data["last_active_date"] = now
    else:
        # Check if new day
        if last_active_date.date() < now.date():
            update_data["daily_chat_count"] = 0
            
            # Streak logic
            diff_days = (now.date() - last_active_date.date()).days
            current_streak = user.get("streak", 0) # Mặc định là 0
            if diff_days == 1:
                update_data["streak"] = current_streak + 1
            elif diff_days > 1:
                update_data["streak"] = 1
                
            update_data["last_active_date"] = now

    # Heart logic
    MAX_HEARTS = 5
    HEART_REGEN_MINUTES = 60
    current_hearts = user.get("hearts", MAX_HEARTS)
    last_heart_update = user.get("last_heart_update")
    
    if current_hearts < MAX_HEARTS:
        if not last_heart_update:
            update_data["last_heart_update"] = now
        else:
            diff_minutes = (now - last_heart_update).total_seconds() / 60
            if diff_minutes >= HEART_REGEN_MINUTES:
                hearts_to_add = int(diff_minutes // HEART_REGEN_MINUTES)
                new_hearts = min(MAX_HEARTS, current_hearts + hearts_to_add)
                update_data["hearts"] = new_hearts
                remainder = diff_minutes % HEART_REGEN_MINUTES
                update_data["last_heart_update"] = now - timedelta(minutes=remainder)

    # Auto-downgrade logic
    sub_type = user.get("subscription_type", "free")
    expired = False

    if sub_type == "trial" and user.get("trial_end_date"):
        if now > user["trial_end_date"]:
            expired = True
    elif sub_type == "premium" and user.get("premium_end_date"):
        if now > user["premium_end_date"]:
            expired = True

    if expired:
        update_data["subscription_type"] = "free"
        update_data["isPremium"] = False
        
    return update_data

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token không hợp lệ hoặc đã hết hạn",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    db = get_database()
    user = await db["users"].find_one({"_id": user_id})
    if user is None:
        raise credentials_exception

    # Server-Side Trust: Auto-reset daily and regenerate hearts
    now = datetime.utcnow()
    update_data = apply_gamification_rules(user, now)

    if update_data:
        await db["users"].update_one(
            {"_id": user["_id"]},
            {"$set": update_data}
        )
        user.update(update_data)

    return user


def require_teacher():
    async def check(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in {"teacher", "manager", "admin"}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Chỉ teacher, manager hoặc admin mới truy cập được",
            )
        return current_user

    return check
