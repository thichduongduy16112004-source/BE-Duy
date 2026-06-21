from fastapi import APIRouter, Depends, File, HTTPException, Query, Response, UploadFile, status

from core.database import get_database
from core.permissions import require_admin
from models.lesson import LessonContentImportRequest, LessonContentPatchRequest
from services.lesson_content_service import (
    get_dataset_doc,
    get_lesson_asset,
    get_public_dataset,
    list_lesson_assets,
    patch_draft_topic,
    preview_dataset,
    publish_draft_dataset,
    save_draft_dataset,
    upload_lesson_asset,
)

router = APIRouter(prefix="/lesson-content", tags=["Lesson Content"])


@router.get("/public")
async def get_published_lesson_content():
    db = get_database()
    return await get_public_dataset(db)


@router.get("/assets/{unit_id}/{lesson_id}")
async def get_public_lesson_asset(unit_id: str, lesson_id: str):
    db = get_database()
    content, content_type = await get_lesson_asset(db, unit_id, lesson_id)
    return Response(content=content, media_type=content_type)


@router.post("/admin/preview", dependencies=[Depends(require_admin)])
async def preview_lesson_content(body: LessonContentImportRequest):
    return await preview_dataset(body.dataset)


@router.post("/admin/draft", status_code=status.HTTP_201_CREATED)
async def import_lesson_content_draft(body: LessonContentImportRequest, current_admin: dict = Depends(require_admin)):
    db = get_database()
    return await save_draft_dataset(db, body.dataset, body.source_name, str(current_admin.get("_id", "")))


@router.get("/admin/draft", dependencies=[Depends(require_admin)])
async def get_lesson_content_draft():
    db = get_database()
    doc = await get_dataset_doc(db, "draft")
    if doc is None:
        raise HTTPException(status_code=404, detail="Draft lesson content not found")
    return doc


@router.get("/admin/published", dependencies=[Depends(require_admin)])
async def get_lesson_content_published():
    db = get_database()
    doc = await get_dataset_doc(db, "published")
    if doc is None:
        raise HTTPException(status_code=404, detail="Published lesson content not found")
    return doc


@router.post("/admin/publish")
async def publish_lesson_content(current_admin: dict = Depends(require_admin)):
    db = get_database()
    return await publish_draft_dataset(db, str(current_admin.get("_id", "")))


@router.put("/admin/topic")
async def update_lesson_content_topic(body: LessonContentPatchRequest, current_admin: dict = Depends(require_admin)):
    db = get_database()
    return await patch_draft_topic(db, body.topic, body.source_name, str(current_admin.get("_id", "")))


@router.get("/admin/assets", dependencies=[Depends(require_admin)])
async def list_admin_lesson_assets():
    db = get_database()
    return {"assets": await list_lesson_assets(db)}


@router.post("/admin/assets", status_code=status.HTTP_201_CREATED)
async def upload_admin_lesson_asset(
    unit_id: str = Query(..., min_length=1, max_length=80),
    lesson_id: str = Query(..., min_length=1, max_length=80),
    file: UploadFile = File(...),
    current_admin: dict = Depends(require_admin),
):
    db = get_database()
    asset = await upload_lesson_asset(db, file, unit_id, lesson_id, str(current_admin.get("_id", "")))
    asset["url"] = f"/api/v1/lesson-content/assets/{unit_id}/{lesson_id}"
    return {"message": "Đã upload ảnh bài học", "asset": asset}
