from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from core.database import connect_db, close_db, get_database
from routers import auth, users, characters, chat, flashcards, lessons, lesson_content, admin, quizzes, payments, progress, teacher, edu
from datetime import datetime

scheduler = AsyncIOScheduler(timezone="Asia/Ho_Chi_Minh")

async def reset_daily_chat_count():
    """Chạy mỗi ngày lúc 00:00 — reset lượt chat cho toàn bộ user"""
    db = get_database()
    result = await db["users"].update_many({}, {"$set": {"daily_chat_count": 0}})
    print(f"[Scheduler] Reset daily_chat_count cho {result.modified_count} users")

async def seed_lessons():
    """Tự động seed các bài học mặc định nếu database rỗng"""
    db = get_database()
    count = await db["lessons"].count_documents({})
    if count == 0:
        print("[DB] Collection lessons trong. Dang seeding bai hoc mac dinh...")
        default_lessons = [
            {
                "_id": "lesson_1",
                "title": "Ly Thuong Kiet",
                "description": "Ly Thuong Kiet dai chien Ung Chau Thanh",
                "video_url": "https://www.youtube.com/embed/AbRg5rH6fxo",
                "order": 1,
                "points": 100,
                "quiz_questions": [
                    {
                        "id": 1,
                        "question": "Tran dai chien Ung Chau dien ra vao nam nao?",
                        "options": [
                            {"id": "A", "text": "Nam 1075", "correct": False},
                            {"id": "B", "text": "Nam 1076", "correct": False},
                            {"id": "C", "text": "Nam 1077", "correct": True},
                            {"id": "D", "text": "Nam 1078", "correct": False}
                        ],
                        "explanation": "Tran Ung Chau do Ly Thuong Kiet chi huy dien ra nam 1077."
                    },
                    {
                        "id": 2,
                        "question": "Ai la nguoi chi huy quan Dai Viet trong tran Ung Chau?",
                        "options": [
                            {"id": "A", "text": "Ly Thuong Kiet", "correct": True},
                            {"id": "B", "text": "Ly Thanh Tông", "correct": False},
                            {"id": "C", "text": "Ly Nhan Tông", "correct": False},
                            {"id": "D", "text": "Tran Hung Dao", "correct": False}
                        ],
                        "explanation": "Ly Thuong Kiet la nguoi chi huy tran danh."
                    },
                    {
                        "id": 3,
                        "question": "Quan Dai Viet da danh bai quan nuoc nao?",
                        "options": [
                            {"id": "A", "text": "Mong Co", "correct": False},
                            {"id": "B", "text": "Tong (Trung Quoc)", "correct": True},
                            {"id": "C", "text": "Chiem Thanh", "correct": False},
                            {"id": "D", "text": "Chan Lap", "correct": False}
                        ],
                        "explanation": "Quan ta da chu dong tien cong quan Tong."
                    }
                ],
                "created_at": datetime.utcnow()
            },
            {
                "_id": "lesson_2",
                "title": "Ly Thuong Kiet - P2",
                "description": "Ly Thuong Kiet dai chien - Phan 2",
                "video_url": "https://www.youtube.com/embed/TQehUlbyp3o",
                "order": 2,
                "points": 100,
                "quiz_questions": [
                    {
                        "id": 1,
                        "question": "Tran Ung Chau Thanh - P2 dien ra trong thoi gian nao?",
                        "options": [
                            {"id": "A", "text": "The ky 10", "correct": False},
                            {"id": "B", "text": "The ky 11", "correct": True},
                            {"id": "C", "text": "The ky 12", "correct": False},
                            {"id": "D", "text": "The ky 13", "correct": False}
                        ],
                        "explanation": "Tran Ung Chau dien ra vao nam 1077 (the ky XI)."
                    },
                    {
                        "id": 2,
                        "question": "Chien luoc nao duoc Ly Thuong Kiet su dung?",
                        "options": [
                            {"id": "A", "text": "Tan cong truc dien", "correct": False},
                            {"id": "B", "text": "Phuc kich va chien tranh du kich", "correct": True},
                            {"id": "C", "text": "Phong thu thu dong", "correct": False},
                            {"id": "D", "text": "Rut lui chien luoc", "correct": False}
                        ],
                        "explanation": "Ket hop phuc kich, du kich va chu dong cong thanh."
                    },
                    {
                        "id": 3,
                        "question": "Y nghia lich su cua tran Ung Chau la gi?",
                        "options": [
                            {"id": "A", "text": "Mo rong lanh tho", "correct": False},
                            {"id": "B", "text": "Bao ve doc lap dan toc", "correct": True},
                            {"id": "C", "text": "Thiet lap trieu dai moi", "correct": False},
                            {"id": "D", "text": "Ket thuc chien tranh", "correct": False}
                        ],
                        "explanation": "Bao ve to quoc truoc nguy co xam luoc cua nha Tong."
                    }
                ],
                "created_at": datetime.utcnow()
            }
        ]
        await db["lessons"].insert_many(default_lessons)
        print("[DB] Seeding thanh cong 2 bai hoc.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    await seed_lessons()
    scheduler.add_job(reset_daily_chat_count, "cron", hour=0, minute=0)
    scheduler.start()
    yield
    scheduler.shutdown()
    await close_db()

app = FastAPI(title="History Alive API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5178",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5178",
        "https://historyalive.id.vn",
        "https://www.historyalive.id.vn",
        "https://admin.historyalive.id.vn",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in [auth.router, users.router, characters.router, chat.router, flashcards.router, lessons.router, lesson_content.router, admin.router, quizzes.router, payments.router, progress.router, edu.router]:
    app.include_router(r, prefix="/api/v1")

app.include_router(teacher.router, prefix="/api/v1")

@app.get("/")
async def health_check():
    return {"status": "ok", "message": "History Alive API v2 🚀"}
