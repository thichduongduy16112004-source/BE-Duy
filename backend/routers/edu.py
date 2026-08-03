from fastapi import APIRouter, Depends

from core.database import get_database
from core.security import get_current_user
from models.edu import EnrollRequest, EnrollResponse
from services.edu_service import enroll_with_class_code

router = APIRouter(prefix="/edu", tags=["Edu Plan"])


@router.post("/enroll", response_model=EnrollResponse)
async def enroll_class_code(payload: EnrollRequest, current_user: dict = Depends(get_current_user)):
    db = get_database()
    return await enroll_with_class_code(db, current_user, payload.class_code, payload.class_password)
