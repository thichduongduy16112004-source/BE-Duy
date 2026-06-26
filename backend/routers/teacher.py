from fastapi import APIRouter, Depends

from core.database import get_database
from core.security import require_teacher
from models.teacher import ClassStudentsResponse, StudentDetail, TeacherClassesResponse
from services.teacher_service import get_class_students, get_student_detail, get_teacher_classes

router = APIRouter(prefix="/teacher", tags=["Teacher"])


@router.get("/classes", response_model=TeacherClassesResponse)
async def list_teacher_classes(current_user: dict = Depends(require_teacher())):
    db = get_database()
    return await get_teacher_classes(db, str(current_user["_id"]))


@router.get("/classes/{class_id}/students", response_model=ClassStudentsResponse)
async def list_class_students(class_id: str, current_user: dict = Depends(require_teacher())):
    db = get_database()
    return await get_class_students(db, class_id, str(current_user["_id"]))


@router.get("/classes/{class_id}/students/{user_id}", response_model=StudentDetail)
async def get_class_student_detail(class_id: str, user_id: str, current_user: dict = Depends(require_teacher())):
    db = get_database()
    return await get_student_detail(db, class_id, user_id, str(current_user["_id"]))
