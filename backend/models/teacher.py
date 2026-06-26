from datetime import datetime

from pydantic import BaseModel


class ClassSummary(BaseModel):
    id: str
    name: str
    school_name: str | None = None
    class_code: str
    student_count: int
    slot_limit: int
    status: str
    expires_at: datetime | None = None


class StudentSummary(BaseModel):
    user_id: str
    full_name: str
    avatar_url: str | None = None
    progress_percent: int
    current_lesson: str | None = None
    avg_score: float | None = None
    last_active: datetime | None = None
    needs_support: bool


class LessonDetail(BaseModel):
    lesson_id: str
    title: str
    status: str
    score: int | None = None
    time_spent_minutes: int | None = None
    completed_at: datetime | None = None


class StudentDetail(BaseModel):
    user_id: str
    full_name: str
    avatar_url: str | None = None
    class_id: str
    class_name: str
    progress_percent: int
    avg_score: float | None = None
    last_active: datetime | None = None
    needs_support: bool
    lessons: list[LessonDetail]


class TeacherClassesResponse(BaseModel):
    classes: list[ClassSummary]


class ClassStudentsResponse(BaseModel):
    class_id: str
    class_name: str
    students: list[StudentSummary]
