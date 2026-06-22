from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class QuizOption(BaseModel):
    id: str
    text: str
    correct: bool


class QuizQuestion(BaseModel):
    id: int
    question: str
    options: list[QuizOption]
    explanation: str


class LessonCreate(BaseModel):
    title: str
    description: str
    video_url: str
    order: int
    points: int = 100
    quiz_questions: list[QuizQuestion] = Field(default_factory=list)


class LessonUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    video_url: str | None = None
    order: int | None = None
    points: int | None = None
    quiz_questions: list[QuizQuestion] | None = None


class LessonResponse(BaseModel):
    id: str
    title: str
    description: str
    video_url: str
    order: int
    points: int
    quiz_questions: list[QuizQuestion]
    created_at: datetime


class DataJsQuestion(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: int | str = Field(min_length=1)
    question: str = Field(min_length=1, max_length=4000)
    type: Literal["multiple_choice", "fill_blank", "matching"] = "multiple_choice"
    options: list[str] | None = None
    answer: str | int | list[int] | dict[str, int] | dict[int, int]
    explanation: str = Field(default="", max_length=12000)
    text: str | None = Field(default=None, max_length=8000)
    columnA: list[str] | None = None
    columnB: list[str] | None = None
    lessonId: str | None = Field(default=None, max_length=80)
    unitId: str | None = Field(default=None, max_length=80)

    @field_validator("id")
    @classmethod
    def validate_question_id(cls, value: int | str) -> int | str:
        if isinstance(value, str) and not value.strip():
            raise ValueError("question id must not be empty")
        return value

    @model_validator(mode="after")
    def validate_by_type(self) -> "DataJsQuestion":
        if self.type == "matching":
            if not self.columnA or not self.columnB or not isinstance(self.answer, dict):
                raise ValueError("matching question requires columnA, columnB, and answer mapping")
            return self
        if self.type == "fill_blank":
            if not self.text or not self.options or not isinstance(self.answer, list):
                raise ValueError("fill_blank question requires text, options, and answer list")
            return self
        if not self.options or not isinstance(self.answer, (int, str)):
            raise ValueError("multiple_choice question requires options and answer")
        if isinstance(self.answer, int) and (self.answer < 0 or self.answer >= len(self.options)):
            raise ValueError("multiple_choice answer index is out of range")
        if isinstance(self.answer, str) and not self.answer.strip():
            raise ValueError("multiple_choice answer must not be empty")
        return self


class DataJsLessonNode(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str = Field(min_length=1, max_length=80)
    title: str = Field(default="", max_length=180)
    questionStart: int = Field(default=0, ge=0)
    questionCount: int = Field(default=5, ge=1, le=10)


class DataJsTopic(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: int | str
    name: str = Field(min_length=1, max_length=160)
    title: str = Field(min_length=1, max_length=500)
    icon: str = Field(default="", max_length=12000)
    color: str = Field(default="#2563eb", max_length=40)
    backgroundImage: str | None = Field(default=None, max_length=500)
    unitId: str | None = Field(default=None, max_length=80)
    lessonNodes: list[DataJsLessonNode] = Field(default_factory=list)
    questions: list[DataJsQuestion] = Field(default_factory=list)

    @field_validator("icon")
    @classmethod
    def keep_svg_only(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            return ""
        if "<script" in stripped.lower():
            raise ValueError("icon must not contain script tags")
        return stripped


class DataJsDataset(BaseModel):
    title: str = Field(min_length=1, max_length=240)
    subtitle: str = Field(default="", max_length=500)
    totalQuestions: int | None = Field(default=None, ge=0)
    topics: list[DataJsTopic] = Field(default_factory=list, min_length=1)

    @model_validator(mode="after")
    def normalize_total(self) -> "DataJsDataset":
        actual_total = sum(len(topic.questions) for topic in self.topics)
        self.totalQuestions = actual_total
        return self


class LessonContentImportRequest(BaseModel):
    dataset: DataJsDataset
    source_name: str = Field(default="admin-json", max_length=180)


class LessonContentPatchRequest(BaseModel):
    unitId: str | None = Field(default=None, max_length=80)
    lessonId: str | None = Field(default=None, max_length=80)
    topicId: int | str | None = None
    lessonIndex: int | None = Field(default=None, ge=1)
    topic: DataJsTopic
    source_name: str = Field(default="admin-lesson-json", max_length=180)
