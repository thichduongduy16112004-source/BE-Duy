from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class TransactionResponse(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    email: str
    amount: int
    plan_type: str
    payment_gateway: str
    status: str
    created_at: datetime
