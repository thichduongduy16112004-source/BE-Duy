from pydantic import BaseModel
from typing import List, Optional

class QuizQuestionModel(BaseModel):
    id: int
    question: str
    options: List[dict | str]
    answer: Optional[int] = None
    explanation: str

class QuizTopicCreate(BaseModel):
    id: int
    name: str
    title: str
    icon: str
    color: str
    questions: List[QuizQuestionModel] = []

class QuizTopicUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    questions: Optional[List[QuizQuestionModel]] = None

class QuizTopicResponse(BaseModel):
    id: int
    name: str
    title: str
    icon: str
    color: str
    questions: List[QuizQuestionModel]
