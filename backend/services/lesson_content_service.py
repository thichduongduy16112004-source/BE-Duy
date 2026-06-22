from datetime import datetime
from typing import Any

from fastapi import HTTPException, UploadFile
from motor.motor_asyncio import AsyncIOMotorGridFSBucket

from core.serializers import serialize_doc
from models.lesson import DataJsDataset, DataJsLessonNode, DataJsTopic

DATASETS_COLLECTION = "lesson_content_datasets"
ASSETS_COLLECTION = "lesson_assets"
DRAFT_ID = "lesson-content-draft"
PUBLISHED_ID = "lesson-content-published"
MAX_ASSET_BYTES = 8 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


def dataset_summary(dataset: DataJsDataset) -> dict[str, Any]:
    return {
        "title": dataset.title,
        "subtitle": dataset.subtitle,
        "topic_count": len(dataset.topics),
        "totalQuestions": dataset.totalQuestions,
        "topics": [
            {
                "id": topic.id,
                "unitId": topic.unitId or unit_id_from_topic(topic.id),
                "name": topic.name,
                "title": topic.title,
                "question_count": len(topic.questions),
            }
            for topic in dataset.topics
        ],
    }


def unit_id_from_topic(topic_id: int | str) -> str:
    text = str(topic_id).strip()
    return text if text.startswith("u") else f"u{text}"


def build_default_nodes(unit_id: str, question_count: int, node_size: int = 5) -> list[dict[str, Any]]:
    nodes = []
    cursor = 0
    while cursor < question_count:
        index = len(nodes) + 1
        count = min(node_size, question_count - cursor)
        nodes.append({"id": f"{unit_id}-l{index}", "title": f"Node {index}", "questionStart": cursor, "questionCount": count})
        cursor += count
    return nodes


def normalize_nodes(unit_id: str, question_count: int, nodes: list[DataJsLessonNode]) -> list[dict[str, Any]]:
    raw_nodes = [node.model_dump(mode="json") for node in nodes] or build_default_nodes(unit_id, question_count)
    normalized = []
    cursor = 0
    for index, node in enumerate(raw_nodes, start=1):
        if cursor >= question_count:
            break
        count = min(max(int(node.get("questionCount") or 5), 1), 10, question_count - cursor)
        normalized.append(
            {
                "id": node.get("id") or f"{unit_id}-l{index}",
                "title": node.get("title") or f"Node {index}",
                "questionStart": cursor,
                "questionCount": count,
            }
        )
        cursor += count
    while cursor < question_count:
        index = len(normalized) + 1
        count = min(5, question_count - cursor)
        normalized.append({"id": f"{unit_id}-l{index}", "title": f"Node {index}", "questionStart": cursor, "questionCount": count})
        cursor += count
    return normalized


def lesson_id_for_question(index: int, nodes: list[dict[str, Any]], fallback_unit_id: str) -> str:
    zero_based_index = index - 1
    for node in nodes:
        start = int(node["questionStart"])
        end = start + int(node["questionCount"])
        if start <= zero_based_index < end:
            return str(node["id"])
    return f"{fallback_unit_id}-l{((index - 1) // 5) + 1}"


def normalize_dataset(dataset: DataJsDataset) -> dict[str, Any]:
    data = dataset.model_dump(mode="json")
    global_id = 1
    for topic_model, topic in zip(dataset.topics, data["topics"], strict=True):
        topic["unitId"] = topic.get("unitId") or unit_id_from_topic(topic["id"])
        topic["lessonNodes"] = normalize_nodes(topic["unitId"], len(topic["questions"]), topic_model.lessonNodes)
        for index, question in enumerate(topic["questions"], start=1):
            question["unitId"] = question.get("unitId") or topic["unitId"]
            question["lessonId"] = lesson_id_for_question(index, topic["lessonNodes"], topic["unitId"])
            question["globalId"] = global_id
            question["topicId"] = topic["id"]
            question["topicName"] = topic["name"]
            question["topicTitle"] = topic["title"]
            question["topicIcon"] = topic["icon"]
            question["topicColor"] = topic["color"]
            global_id += 1
    data["totalQuestions"] = global_id - 1
    return data


async def preview_dataset(dataset: DataJsDataset) -> dict[str, Any]:
    return {"valid": True, "summary": dataset_summary(dataset)}


async def save_draft_dataset(db, dataset: DataJsDataset, source_name: str, admin_id: str) -> dict[str, Any]:
    now = datetime.utcnow()
    normalized = normalize_dataset(dataset)
    doc = {
        "_id": DRAFT_ID,
        "status": "draft",
        "dataset": normalized,
        "source_name": source_name,
        "updated_by": admin_id,
        "updated_at": now,
        "created_at": now,
    }
    await db[DATASETS_COLLECTION].update_one(
        {"_id": DRAFT_ID},
        {"$set": {key: value for key, value in doc.items() if key != "created_at"}, "$setOnInsert": {"created_at": now}},
        upsert=True,
    )
    return {"message": "Đã import vào draft", "summary": dataset_summary(DataJsDataset(**normalized))}


async def publish_draft_dataset(db, admin_id: str) -> dict[str, Any]:
    draft = await db[DATASETS_COLLECTION].find_one({"_id": DRAFT_ID})
    if draft is None:
        raise HTTPException(status_code=404, detail="Chưa có draft để publish")

    now = datetime.utcnow()
    await db[DATASETS_COLLECTION].update_one(
        {"_id": PUBLISHED_ID},
        {
            "$set": {
                "status": "published",
                "dataset": draft["dataset"],
                "source_name": draft.get("source_name", "draft"),
                "published_by": admin_id,
                "published_at": now,
                "updated_at": now,
            },
            "$setOnInsert": {"created_at": now},
        },
        upsert=True,
    )
    return {"message": "Đã publish lesson content", "published_at": now.isoformat()}


async def get_dataset_doc(db, status: str) -> dict[str, Any] | None:
    doc_id = DRAFT_ID if status == "draft" else PUBLISHED_ID
    doc = await db[DATASETS_COLLECTION].find_one({"_id": doc_id})
    return serialize_doc(doc) if doc else None


async def get_public_dataset(db) -> dict[str, Any]:
    doc = await db[DATASETS_COLLECTION].find_one({"_id": PUBLISHED_ID})
    if not doc:
        raise HTTPException(status_code=404, detail="Published lesson content not found")
    return doc["dataset"]


async def patch_draft_topic(db, topic: DataJsTopic, source_name: str, admin_id: str) -> dict[str, Any]:
    draft = await db[DATASETS_COLLECTION].find_one({"_id": DRAFT_ID})
    if draft is None:
        raise HTTPException(status_code=404, detail="Hãy import draft tổng trước khi sửa từng bài")

    dataset = DataJsDataset(**draft["dataset"])
    topics = [item for item in dataset.topics if str(item.id) != str(topic.id) and item.unitId != topic.unitId]
    topics.append(topic)
    topics.sort(key=lambda item: str(item.id))
    next_dataset = DataJsDataset(title=dataset.title, subtitle=dataset.subtitle, topics=topics)
    return await save_draft_dataset(db, next_dataset, source_name, admin_id)


async def delete_draft_topic(db, topic_id: str, admin_id: str) -> dict[str, Any]:
    draft = await db[DATASETS_COLLECTION].find_one({"_id": DRAFT_ID})
    if draft is None:
        raise HTTPException(status_code=404, detail="Chưa có draft để xóa chương")

    dataset = DataJsDataset(**draft["dataset"])
    topics = [item for item in dataset.topics if str(item.id) != str(topic_id) and str(item.unitId) != str(topic_id)]
    
    if len(topics) == len(dataset.topics):
        raise HTTPException(status_code=404, detail=f"Không tìm thấy chương {topic_id} trong draft")
    
    if len(topics) == 0:
        raise HTTPException(status_code=400, detail="Không thể xóa chương cuối cùng. Dataset phải có ít nhất 1 chương.")
    
    next_dataset = DataJsDataset(title=dataset.title, subtitle=dataset.subtitle, topics=topics)
    result = await save_draft_dataset(db, next_dataset, f"Xóa chương {topic_id}", admin_id)
    return {**result, "deleted_topic_id": topic_id}


async def upload_lesson_asset(db, file: UploadFile, unit_id: str, lesson_id: str, admin_id: str) -> dict[str, Any]:
    content_type = file.content_type or "application/octet-stream"
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ ảnh JPEG, PNG, WEBP, GIF")

    content = await file.read()
    if len(content) > MAX_ASSET_BYTES:
        raise HTTPException(status_code=400, detail="Ảnh vượt quá giới hạn 8MB")

    bucket = AsyncIOMotorGridFSBucket(db)
    grid_id = await bucket.upload_from_stream(
        file.filename or "lesson-image",
        content,
        metadata={"content_type": content_type, "unitId": unit_id, "lessonId": lesson_id},
    )
    now = datetime.utcnow()
    asset = {
        "gridfs_id": grid_id,
        "unitId": unit_id,
        "lessonId": lesson_id,
        "filename": file.filename or "lesson-image",
        "content_type": content_type,
        "size": len(content),
        "uploaded_by": admin_id,
        "updated_at": now,
        "created_at": now,
    }
    await db[ASSETS_COLLECTION].update_one(
        {"unitId": unit_id, "lessonId": lesson_id},
        {"$set": asset},
        upsert=True,
    )
    saved = await db[ASSETS_COLLECTION].find_one({"unitId": unit_id, "lessonId": lesson_id})
    return serialize_doc(saved)


async def get_lesson_asset(db, unit_id: str, lesson_id: str) -> tuple[bytes, str]:
    asset = await db[ASSETS_COLLECTION].find_one({"unitId": unit_id, "lessonId": lesson_id})
    if not asset:
        raise HTTPException(status_code=404, detail="Lesson asset not found")

    bucket = AsyncIOMotorGridFSBucket(db)
    stream = await bucket.open_download_stream(asset["gridfs_id"])
    chunks = []
    while True:
        chunk = await stream.readchunk()
        if not chunk:
            break
        chunks.append(chunk)
    return b"".join(chunks), asset.get("content_type", "application/octet-stream")


async def list_lesson_assets(db) -> list[dict[str, Any]]:
    assets = []
    cursor = db[ASSETS_COLLECTION].find({}).sort("updated_at", -1)
    async for asset in cursor:
        serialized = serialize_doc(asset)
        serialized["url"] = f"/api/v1/lesson-content/assets/{serialized['unitId']}/{serialized['lessonId']}"
        assets.append(serialized)
    return assets
