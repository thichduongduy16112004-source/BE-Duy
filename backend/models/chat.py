from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class StartChatRequest(BaseModel):
    character_id: str

class SendMessageRequest(BaseModel):
    session_id: str
    message: str

class EndChatRequest(BaseModel):
    session_id: str
