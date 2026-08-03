from datetime import datetime
from pydantic import BaseModel, Field


class EnrollRequest(BaseModel):
    class_code: str = Field(min_length=4, max_length=40)
    class_password: str = Field(min_length=3, max_length=80)


class EnrollResponse(BaseModel):
    message: str
    isPremium: bool
    subscription_type: str
    subscription_source: str
    class_id: str
    class_name: str
    school_name: str | None = None
    expires_at: datetime | None = None


class AdminClassCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    school_name: str = Field(min_length=1, max_length=160)
    teacher_id: str = Field(min_length=1, max_length=120)
    slot_limit: int = Field(default=30, ge=1, le=500)
    expires_at: datetime | None = None


class AdminClassUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=160)
    school_name: str | None = Field(default=None, min_length=1, max_length=160)
    teacher_id: str | None = Field(default=None, min_length=1, max_length=120)
    slot_limit: int | None = Field(default=None, ge=1, le=500)
    expires_at: datetime | None = None
    status: str | None = Field(default=None, pattern="^(active|expired|disabled)$")


class TeacherSearchResult(BaseModel):
    id: str
    email: str
    full_name: str | None = None
    role: str


class AdminClassSummary(BaseModel):
    id: str
    name: str
    school_name: str | None = None
    class_code: str
    code: str
    class_password: str | None = None
    teacher_id: str | None = None
    teacher_name: str | None = None
    teacher_email: str | None = None
    student_count: int
    slot_limit: int
    assignment_count: int = 0
    status: str
    expires_at: datetime | None = None
    created_at: datetime | None = None


class AdminClassCreateResponse(BaseModel):
    message: str
    class_item: AdminClassSummary
    class_password: str
