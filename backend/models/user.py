from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserOnboarding(BaseModel):
    grade: str  # "cap2" hoặc "cap3"
    selected_character: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str = "student"
    grade: Optional[str] = None
    avatar_url: Optional[str] = None
    subscription_type: str = "free"
    daily_chat_count: int = 0
    onboarding_completed: bool = False
    selected_character: Optional[str] = None
    created_at: datetime
