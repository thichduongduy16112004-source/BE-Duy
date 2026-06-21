from collections.abc import AsyncGenerator
from typing import Any

import httpx

from core.config import settings


class RagServiceUnavailable(Exception):
    pass


class RagServiceError(Exception):
    pass


def _rag_url(path: str) -> str:
    base_url = settings.RAG_SERVICE_URL.rstrip("/")
    return f"{base_url}{path}"


async def stream_chat(payload: dict[str, Any]) -> AsyncGenerator[bytes, None]:
    timeout = httpx.Timeout(settings.RAG_TIMEOUT_SECONDS, connect=5.0)

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            async with client.stream("POST", _rag_url("/api/chat/stream"), json=payload) as response:
                if response.status_code >= 500:
                    raise RagServiceUnavailable("RAG service is unavailable")
                if response.status_code >= 400:
                    body = await response.aread()
                    raise RagServiceError(body.decode("utf-8", errors="ignore"))

                async for chunk in response.aiter_bytes():
                    if chunk:
                        yield chunk
    except httpx.RequestError as exc:
        raise RagServiceUnavailable("Cannot connect to RAG service") from exc


async def synthesize_tts(payload: dict[str, Any]) -> dict[str, Any]:
    timeout = httpx.Timeout(settings.RAG_TIMEOUT_SECONDS, connect=5.0)

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(_rag_url("/api/tts"), json=payload)
            if response.status_code >= 500:
                raise RagServiceUnavailable("RAG TTS service is unavailable")
            if response.status_code >= 400:
                raise RagServiceError(response.text)
            return response.json()
    except httpx.RequestError as exc:
        raise RagServiceUnavailable("Cannot connect to RAG TTS service") from exc
