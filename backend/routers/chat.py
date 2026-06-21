import json
from datetime import datetime
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from core.database import get_database
from core.security import get_current_user
from core.serializers import serialize_doc, serialize_docs
from models.chat import EndChatRequest, SendMessageRequest, StartChatRequest
from routers.characters import CHARACTERS
from services.chat_service import generate_response_stream
from services.flashcard_service import generate_flashcard
from services.rag_client import RagServiceError, RagServiceUnavailable, stream_chat, synthesize_tts
from services.rate_limit_service import assert_chat_allowed, increment_chat_usage
from services.token_usage_service import log_token_usage

router = APIRouter(prefix="/chat", tags=["Chat"])


class StreamChatRequest(BaseModel):
    character_id: str
    message: str = Field(min_length=1, max_length=4000)
    history: list[dict[str, Any]] = Field(default_factory=list)


class TTSRequest(BaseModel):
    character_id: str
    text: str = Field(min_length=1, max_length=4000)


def _sse_event(event: str, data: dict[str, Any]) -> bytes:
    payload = json.dumps(data, ensure_ascii=False)
    return f"event: {event}\ndata: {payload}\n\n".encode("utf-8")


def _extract_final_payload(raw_sse: str) -> dict[str, Any]:
    final_payload: dict[str, Any] = {}
    for block in raw_sse.split("\n\n"):
        event_name = ""
        data = ""
        for line in block.splitlines():
            if line.startswith("event:"):
                event_name = line[6:].strip()
            elif line.startswith("data:"):
                data = line[5:].strip()
        if event_name == "final" and data:
            try:
                parsed = json.loads(data)
            except json.JSONDecodeError:
                continue
            if isinstance(parsed, dict):
                final_payload = parsed
    return final_payload


def find_character(character_id: str):
    char = next((c for c in CHARACTERS if c["id"] == character_id), None)
    if not char:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhân vật")
    return char


async def _get_active_character(db, character_id: str) -> dict | None:
    character = await db["characters"].find_one(
        {
            "$or": [{"character_id": character_id}, {"id": character_id}],
            "status": {"$ne": "archived"},
        }
    )
    return serialize_doc(character)


@router.get("/characters")
async def list_chat_characters(current_user: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db["characters"].find({"status": "active"}).sort("display_name", 1)
    characters = serialize_docs(await cursor.to_list(length=200))
    if characters:
        return {"characters": characters, "total": len(characters)}
    return {"characters": CHARACTERS, "total": len(CHARACTERS)}


@router.post("/stream")
async def stream_gateway(body: StreamChatRequest, current_user: dict = Depends(get_current_user)):
    db = get_database()
    await assert_chat_allowed(current_user)

    character = await _get_active_character(db, body.character_id)
    if character is None:
        find_character(body.character_id)

    started_at = datetime.utcnow()
    payload = {
        "user_id": str(current_user["_id"]),
        "character_id": body.character_id,
        "message": body.message,
        "history": body.history[-10:],
    }

    async def gateway_stream():
        status = "completed"
        raw_chunks: list[str] = []
        try:
            async for chunk in stream_chat(payload):
                raw_chunks.append(chunk.decode("utf-8", errors="ignore"))
                yield chunk
            await increment_chat_usage(db, current_user)
        except RagServiceUnavailable as exc:
            status = "failed"
            yield _sse_event("error", {"message": str(exc), "code": "rag_unavailable"})
        except RagServiceError as exc:
            status = "failed"
            yield _sse_event("error", {"message": str(exc), "code": "rag_error"})
        except Exception:
            status = "failed"
            yield _sse_event("error", {"message": "Không thể xử lý chat lúc này.", "code": "gateway_error"})
        finally:
            raw_sse = "".join(raw_chunks)
            final_payload = _extract_final_payload(raw_sse)
            answer = final_payload.get("answer", raw_sse[-12000:])
            await db["chat_logs"].insert_one(
                {
                    "user_id": str(current_user["_id"]),
                    "character_id": body.character_id,
                    "message": body.message,
                    "answer": answer,
                    "raw_sse": raw_sse[-12000:],
                    "citation_ids": [item.get("chunk_id") for item in final_payload.get("citations", []) if item.get("chunk_id")],
                    "citations": final_payload.get("citations", []),
                    "route": final_payload.get("route"),
                    "route_source": final_payload.get("route_source"),
                    "llm_status": final_payload.get("llm_status"),
                    "fallback_used": final_payload.get("fallback_used"),
                    "data_source": final_payload.get("data_source"),
                    "status": status,
                    "created_at": started_at,
                }
            )
            if status == "completed":
                await log_token_usage(
                    db,
                    user_id=str(current_user["_id"]),
                    input_text=body.message,
                    output_text=answer,
                    route=str(final_payload.get("route") or "chat"),
                    model=str(final_payload.get("data_source") or "rag-gateway"),
                    created_at=started_at,
                )

    return StreamingResponse(gateway_stream(), media_type="text/event-stream")


@router.post("/tts")
async def tts_gateway(body: TTSRequest, current_user: dict = Depends(get_current_user)):
    try:
        return await synthesize_tts(
            {
                "user_id": str(current_user["_id"]),
                "character_id": body.character_id,
                "text": body.text,
            }
        )
    except RagServiceUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except RagServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/start")
async def start_chat(body: StartChatRequest, current_user: dict = Depends(get_current_user)):
    db = get_database()
    await assert_chat_allowed(current_user)

    character = find_character(body.character_id)
    session_id = str(ObjectId())
    session_doc = {
        "_id": session_id,
        "user_id": current_user["_id"],
        "character_id": body.character_id,
        "messages": [],
        "status": "active",
        "token_used": 0,
        "created_at": datetime.utcnow(),
    }
    await db["chat_sessions"].insert_one(session_doc)
    return {"session_id": session_id, "character": character}


@router.post("/message")
async def send_message(body: SendMessageRequest, current_user: dict = Depends(get_current_user)):
    db = get_database()
    session = await db["chat_sessions"].find_one({"_id": body.session_id, "user_id": current_user["_id"]})

    if not session:
        raise HTTPException(status_code=404, detail="Session không tồn tại")
    if session["status"] != "active":
        raise HTTPException(status_code=400, detail="Session đã kết thúc")

    character = find_character(session["character_id"])

    user_msg = {"role": "user", "content": body.message, "timestamp": datetime.utcnow(), "context_chunks": []}
    await db["chat_sessions"].update_one(
        {"_id": body.session_id},
        {"$push": {"messages": user_msg}},
    )

    full_response = []

    async def sse_generator():
        async for chunk in generate_response_stream(session, body.message, character):
            full_response.append(chunk)
            yield f"data: {chunk}\n\n"

        assistant_msg = {
            "role": "assistant",
            "content": "".join(full_response),
            "timestamp": datetime.utcnow(),
            "context_chunks": [],
        }
        await db["chat_sessions"].update_one(
            {"_id": body.session_id},
            {"$push": {"messages": assistant_msg}},
        )
        yield "data: [DONE]\n\n"

    return StreamingResponse(sse_generator(), media_type="text/event-stream")


@router.post("/end")
async def end_chat(body: EndChatRequest, current_user: dict = Depends(get_current_user)):
    db = get_database()
    session = await db["chat_sessions"].find_one({"_id": body.session_id, "user_id": current_user["_id"]})

    if not session:
        raise HTTPException(status_code=404, detail="Session không tồn tại")

    character = find_character(session["character_id"])

    await db["chat_sessions"].update_one({"_id": body.session_id}, {"$set": {"status": "ended"}})
    await increment_chat_usage(db, current_user)

    flashcard = await generate_flashcard(session, character)
    return {"flashcard_id": flashcard["_id"], "message": "Session ended ✅", "flashcard": flashcard}


@router.get("/history/{session_id}")
async def get_history(session_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    session = await db["chat_sessions"].find_one({"_id": session_id, "user_id": current_user["_id"]})
    if not session:
        raise HTTPException(status_code=404, detail="Session không tồn tại")
    return {"messages": serialize_docs(session["messages"]), "status": session["status"]}


@router.get("/sessions")
async def get_sessions(page: int = 1, limit: int = 10, current_user: dict = Depends(get_current_user)):
    db = get_database()
    safe_page = max(page, 1)
    safe_limit = min(max(limit, 1), 50)
    skip = (safe_page - 1) * safe_limit
    cursor = db["chat_sessions"].find({"user_id": current_user["_id"]}).sort("created_at", -1).skip(skip).limit(safe_limit)
    sessions = serialize_docs(await cursor.to_list(length=safe_limit))
    for session in sessions:
        session["id"] = session.pop("_id")
        session.pop("messages", None)
    return {"sessions": sessions, "page": safe_page}
