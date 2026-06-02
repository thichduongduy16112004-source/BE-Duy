from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from core.database import connect_db, close_db, get_database
from routers import auth, users, characters, chat, flashcards

scheduler = AsyncIOScheduler(timezone="Asia/Ho_Chi_Minh")

async def reset_daily_chat_count():
    """Chạy mỗi ngày lúc 00:00 — reset lượt chat cho toàn bộ user"""
    db = get_database()
    result = await db["users"].update_many({}, {"$set": {"daily_chat_count": 0}})
    print(f"✅ Reset daily_chat_count cho {result.modified_count} users")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    scheduler.add_job(reset_daily_chat_count, "cron", hour=0, minute=0)
    scheduler.start()
    yield
    scheduler.shutdown()
    await close_db()

app = FastAPI(title="History Alive API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in [auth.router, users.router, characters.router, chat.router, flashcards.router]:
    app.include_router(router, prefix="/api/v1")

@app.get("/")
async def health_check():
    return {"status": "ok", "message": "History Alive API v2 🚀"}
