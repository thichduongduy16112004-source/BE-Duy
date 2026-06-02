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
    return user
