from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


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


class ImportedQuestion(BaseModel):
    question: str
    options: list[str]
    answer: int | str
    explanation: str | None = None


class ImportedLessonCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    content: str | None = None
    questions: list[ImportedQuestion] = Field(default_factory=list)


class ImportedLessonSummary(BaseModel):
    id: str
    class_id: str
    title: str
    description: str | None = None
    question_count: int
    created_at: datetime | None = None


class AssignmentCreate(BaseModel):
    lesson_id: str
    title: str | None = None
    due_at: datetime | None = None


class AssignmentSummary(BaseModel):
    id: str
    class_id: str
    lesson_id: str
    title: str
    lesson_title: str | None = None
    question_count: int
    assigned_count: int = 0
    completed_count: int = 0
    student_status: Literal["not_started", "in_progress", "completed"] | None = None
    student_score: int | None = None
    submitted_at: datetime | None = None
    due_at: datetime | None = None
    created_at: datetime | None = None


class ClassLessonsResponse(BaseModel):
    lessons: list[ImportedLessonSummary]


class ClassAssignmentsResponse(BaseModel):
    assignments: list[AssignmentSummary]
