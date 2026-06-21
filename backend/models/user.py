from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    username: str
    full_name: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Mật khẩu phải chứa ít nhất một chữ viết hoa")
        if not any(c.isdigit() for c in v):
            raise ValueError("Mật khẩu phải chứa ít nhất một ký tự số")
        return v

class UserLogin(BaseModel):
    identity: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    dob: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    mascotId: Optional[str] = None
    grade: Optional[str] = None
    studyMinutes: Optional[int] = None
    xp: Optional[int] = None
    streak: Optional[int] = None
    gems: Optional[int] = None
    hearts: Optional[int] = None
    completedLessons: Optional[List[str]] = None
    lastStreakDate: Optional[str] = None
    achievements: Optional[List[str]] = None
    isPremium: Optional[bool] = None
    planType: Optional[str] = None
    trialEndDate: Optional[datetime] = None
    premiumEndDate: Optional[datetime] = None
    premium_end_date: Optional[datetime] = None
    isNewUser: Optional[bool] = None

class UserOnboarding(BaseModel):
    name: Optional[str] = None
    mascotId: Optional[str] = None
    grade: Optional[str] = None
    studyMinutes: Optional[int] = None
    selected_character: Optional[str] = None  # Giữ tương thích ngược nếu cần

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    name: str
    role: str = "student"
    dob: Optional[str] = None
    phone: Optional[str] = None
    grade: Optional[str] = None
    avatar: Optional[str] = None
    mascotId: Optional[str] = None
    studyMinutes: int = 15
    xp: int = 0
    streak: int = 1
    gems: int = 50
    hearts: int = 5
    completedLessons: List[str] = []
    achievements: List[str] = []
    isPremium: bool = False
    planType: str = "free"
    trialEndDate: Optional[datetime] = None
    premiumEndDate: Optional[datetime] = None
    isNewUser: bool = False
    created_at: datetime

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(min_length=8)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Mật khẩu mới phải chứa ít nhất một chữ viết hoa")
        if not any(c.isdigit() for c in v):
            raise ValueError("Mật khẩu mới phải chứa ít nhất một ký tự số")
        return v

class QuizAttemptCreate(BaseModel):
    tenantSlug: Optional[str] = "ha-tenant"
    lessonLegacyId: Optional[str] = None
    mode: str
    correctAnswers: int
    totalQuestions: int
    maxStreak: Optional[int] = 0
    completed: bool

class PvPMatchCreate(BaseModel):
    tenantSlug: Optional[str] = "ha-tenant"
    opponentId: Optional[str] = None
    questionsUsed: List[str] = []
    myScore: int
    opponentScore: int
    result: str

