from fastapi import APIRouter
from models.user import UserCreate, UserLogin
from models.session import TokenResponse, RefreshRequest, LogoutRequest
from services.auth_service import register_user, login_user, refresh_access_token, logout_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
async def register(body: UserCreate):
    result = await register_user(body.email, body.password, body.full_name)
    return {
        "access_token": result["access_token"],
        "refresh_token": result["refresh_token"],
        "user": {
            "id": result["user"]["_id"],
            "email": result["user"]["email"],
            "full_name": result["user"]["full_name"],
        }
    }

@router.post("/login")
async def login(body: UserLogin):
    result = await login_user(body.email, body.password)
    return {
        "access_token": result["access_token"],
        "refresh_token": result["refresh_token"],
        "user": {
            "id": result["user"]["_id"],
            "email": result["user"]["email"],
            "full_name": result["user"]["full_name"],
        }
    }

@router.post("/refresh")
async def refresh(body: RefreshRequest):
    token = await refresh_access_token(body.refresh_token)
    return {"access_token": token}

@router.post("/logout")
async def logout(body: LogoutRequest):
    await logout_user(body.refresh_token)
    return {"message": "Logged out successfully"}
