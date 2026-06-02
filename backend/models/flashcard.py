from pydantic import BaseModel
from typing import List
from datetime import datetime

class FlashcardResponse(BaseModel):
    id: str
    character_name: str
    summary: str
    key_points: List[str]
    created_at: datetime
