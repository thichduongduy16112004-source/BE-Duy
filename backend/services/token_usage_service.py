from datetime import datetime
from typing import Any

TOKEN_USAGE_COLLECTION = "token_usage_logs"


def measure_text_tokens(text: str) -> int:
    normalized = (text or "").strip()
    if not normalized:
        return 0

    word_count = len(normalized.split())
    character_estimate = (len(normalized) + 3) // 4
    return max(1, max(word_count, character_estimate))


def build_token_usage(input_text: str, output_text: str) -> dict[str, int]:
    input_tokens = measure_text_tokens(input_text)
    output_tokens = measure_text_tokens(output_text)
    return {
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_tokens": input_tokens + output_tokens,
    }


async def log_token_usage(
    db: Any,
    *,
    user_id: str,
    input_text: str,
    output_text: str,
    route: str = "chat",
    feature: str = "chat_stream",
    model: str = "rag-gateway",
    created_at: datetime | None = None,
) -> None:
    try:
        usage = build_token_usage(input_text, output_text)
        await db[TOKEN_USAGE_COLLECTION].insert_one(
            {
                "created_at": created_at or datetime.utcnow(),
                "user_id": str(user_id),
                "route": route,
                "feature": feature,
                "model": model,
                "request_count": 1,
                **usage,
            }
        )
    except Exception:
        return
