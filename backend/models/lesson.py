from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class QuizOption(BaseModel):
    id: str  # e.g., "A", "B", "C", "D"
    text: str
    correct: bool

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[QuizOption]
    explanation: str

class LessonCreate(BaseModel):
    title: str
    description: str
    video_url: str
    order: int
    points: int = 100
    quiz_questions: List[QuizQuestion] = []

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    video_url: Optional[str] = None
    order: Optional[int] = None
    points: Optional[int] = None
    quiz_questions: Optional[List[QuizQuestion]] = None

class LessonResponse(BaseModel):
    id: str
    title: str
    description: str
    video_url: str
    order: int
    points: int
    quiz_questions: List[QuizQuestion]
    created_at: datetime
