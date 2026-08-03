from fastapi import APIRouter, Depends

from core.database import get_database
from core.security import require_teacher
from models.teacher import (
    AssignmentCreate,
    AssignmentSummary,
    ClassAssignmentsResponse,
    ClassLessonsResponse,
    ClassStudentsResponse,
    ImportedLessonCreate,
    ImportedLessonSummary,
    StudentDetail,
    TeacherClassesResponse,
)
from services.teacher_service import (
    create_assignment,
    create_imported_lesson,
    delete_assignment,
    delete_imported_lesson,
    get_class_assignments,
    get_class_lessons,
    get_class_students,
    get_student_detail,
    get_teacher_classes,
)

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


@router.get("/classes/{class_id}/lessons", response_model=ClassLessonsResponse)
async def list_class_lessons(class_id: str, current_user: dict = Depends(require_teacher())):
    db = get_database()
    return await get_class_lessons(db, class_id, str(current_user["_id"]))


@router.post("/classes/{class_id}/lessons", response_model=ImportedLessonSummary, status_code=201)
async def import_class_lesson(
    class_id: str,
    payload: ImportedLessonCreate,
    current_user: dict = Depends(require_teacher()),
):
    db = get_database()
    return await create_imported_lesson(db, class_id, str(current_user["_id"]), payload)


@router.get("/classes/{class_id}/assignments", response_model=ClassAssignmentsResponse)
async def list_class_assignments(class_id: str, current_user: dict = Depends(require_teacher())):
    db = get_database()
    return await get_class_assignments(db, class_id, str(current_user["_id"]))


@router.post("/classes/{class_id}/assignments", response_model=AssignmentSummary, status_code=201)
async def assign_lesson_to_class(
    class_id: str,
    payload: AssignmentCreate,
    current_user: dict = Depends(require_teacher()),
):
    db = get_database()
    return await create_assignment(db, class_id, str(current_user["_id"]), payload)


@router.delete("/classes/{class_id}/assignments/{assignment_id}", response_model=dict)
async def remove_class_assignment(
    class_id: str,
    assignment_id: str,
    current_user: dict = Depends(require_teacher()),
):
    db = get_database()
    return await delete_assignment(db, class_id, str(current_user["_id"]), assignment_id)


@router.delete("/classes/{class_id}/lessons/{lesson_id}", response_model=dict)
async def remove_class_lesson(
    class_id: str,
    lesson_id: str,
    current_user: dict = Depends(require_teacher()),
):
    db = get_database()
    return await delete_imported_lesson(db, class_id, str(current_user["_id"]), lesson_id)
