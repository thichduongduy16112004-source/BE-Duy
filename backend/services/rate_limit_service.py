from datetime import datetime, timezone

from fastapi import HTTPException, status

from core.config import settings


def _current_day() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def _is_premium(user: dict) -> bool:
    return user.get("isPremium", False) or user.get("subscription_type", "free") in ["premium", "trial"]


async def assert_chat_allowed(user: dict) -> None:
    if _is_premium(user):
        return

    today = _current_day()
    stored_day = user.get("daily_chat_date")
    count = 0 if stored_day != today else int(user.get("daily_chat_count", 0))

    if count >= settings.FREE_DAILY_CHAT_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Bạn đã dùng hết {settings.FREE_DAILY_CHAT_LIMIT} lượt chat miễn phí hôm nay.",
        )


async def increment_chat_usage(db, user: dict) -> None:
    if _is_premium(user):
        return

    today = _current_day()
    user_id = user["_id"]

    if user.get("daily_chat_date") != today:
        await db["users"].update_one(
            {"_id": user_id},
            {"$set": {"daily_chat_date": today, "daily_chat_count": 1}},
        )
        return

    await db["users"].update_one(
        {"_id": user_id},
        {"$inc": {"daily_chat_count": 1}, "$set": {"daily_chat_date": today}},
    )
