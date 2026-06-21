from fastapi import APIRouter, Depends, HTTPException, status
from core.security import get_current_user
from core.database import get_database
from models.user import QuizAttemptCreate, PvPMatchCreate
from datetime import datetime, timedelta

router = APIRouter(prefix="/me", tags=["Progress"])


def calculate_lesson_streak(current_streak: int, last_streak_date: str | None, completed_at: datetime) -> int:
    today = completed_at.date()
    if not last_streak_date:
        return 1

    try:
        previous_day = datetime.fromisoformat(last_streak_date).date()
    except ValueError:
        return 1

    if previous_day == today:
        return current_streak
    if previous_day == today - timedelta(days=1):
        return current_streak + 1
    return 1

@router.get("/progress")
async def get_progress(current_user: dict = Depends(get_current_user)):
    return {
        "xp": current_user.get("xp", 0),
        "streak": current_user.get("streak", 0),
        "rank": current_user.get("rank", "iron"),
        "gems": current_user.get("gems", 0),
        "hearts": current_user.get("hearts", 5),
        "completedLessons": current_user.get("completed_lessons", []),
        "achievements": current_user.get("achievements", [])
    }

@router.post("/progress/start-lesson")
async def start_lesson(current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    if current_user.get("isPremium", False) or current_user.get("subscription_type") in ["premium", "trial"]:
        return {"message": "Success", "hearts": current_user.get("hearts", 5)}
        
    current_hearts = current_user.get("hearts", 5)
    if current_hearts <= 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn đã hết Tim. Hãy chờ hồi Tim hoặc nâng cấp Pro."
        )
        
    new_hearts = current_hearts - 1
    update_data = {"hearts": new_hearts}
    
    if current_hearts == 5:
        update_data["last_heart_update"] = datetime.utcnow()
        
    await db["users"].update_one({"_id": current_user["_id"]}, {"$set": update_data})
    return {"message": "Success", "hearts": new_hearts}

@router.post("/quiz-attempts")
async def submit_quiz_attempt(attempt: QuizAttemptCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    attempt_doc = attempt.dict()
    attempt_doc["user_id"] = current_user["_id"]
    attempt_doc["created_at"] = datetime.utcnow()
    
    await db["quiz_attempts"].insert_one(attempt_doc)

    if attempt.mode == "activity":
        updated_user = await db["users"].find_one({"_id": current_user["_id"]})
        return {
            "message": "Activity saved",
            "progress": {
                "xp": updated_user.get("xp", 0),
                "streak": updated_user.get("streak", 0),
                "rank": updated_user.get("rank", "iron"),
                "gems": updated_user.get("gems", 0),
                "hearts": updated_user.get("hearts", 5),
                "completedLessons": updated_user.get("completed_lessons", [])
            }
        }
    
    update_data = {}
    inc_data = {}
    
    if not current_user.get("isPremium", False):
        wrong_answers = attempt.totalQuestions - attempt.correctAnswers
        if wrong_answers > 1:
            current_hearts = current_user.get("hearts", 5)
            if current_hearts <= 0:
                raise HTTPException(status_code=400, detail="Bạn đã hết tim. Hãy nâng cấp Pro hoặc chờ hồi tim.")
            update_data["hearts"] = current_hearts - 1
            if current_hearts == 5:
                update_data["last_heart_update"] = datetime.utcnow()

    xp_gained = attempt.correctAnswers * 10
    gems_gained = attempt.correctAnswers * 2
    
    now = datetime.utcnow()
    if attempt.completed and attempt.mode in ["lesson", "review"]:
        completed_lessons = current_user.get("completed_lessons", [])
        next_streak = calculate_lesson_streak(
            current_user.get("streak", 0),
            current_user.get("last_streak_date"),
            now
        )
        update_data["streak"] = next_streak
        update_data["last_streak_date"] = now.date().isoformat()
        update_data["last_active"] = now

        if attempt.lessonLegacyId and attempt.lessonLegacyId not in completed_lessons:
            completed_lessons.append(attempt.lessonLegacyId)
            update_data["completed_lessons"] = completed_lessons
            inc_data["xp"] = xp_gained + 20 # Bonus complete lesson
            inc_data["gems"] = gems_gained + 5
        else:
            inc_data["xp"] = xp_gained
            inc_data["gems"] = gems_gained
            
    if attempt.mode == "practice":
        inc_data["xp"] = xp_gained // 2
        inc_data["gems"] = gems_gained // 2
            
    update_query = {}
    if update_data:
        update_query["$set"] = update_data
    if inc_data:
        update_query["$inc"] = inc_data
        
    if update_query:
        await db["users"].update_one({"_id": current_user["_id"]}, update_query)
        
    if attempt.lessonLegacyId:
        await db["user_progress"].update_one(
            {
                "tenant_id": attempt.tenantSlug,
                "user_id": current_user["_id"],
                "lesson_id": attempt.lessonLegacyId
            },
            {
                "$set": {
                    "status": "completed" if attempt.completed else "in_progress",
                    "last_attempt_date": datetime.utcnow()
                },
                "$max": {
                    "best_score": attempt.correctAnswers
                },
                "$inc": {
                    "attempts_count": 1
                }
            },
            upsert=True
        )

    updated_user = await db["users"].find_one({"_id": current_user["_id"]})
    return {
        "message": "Attempt saved",
        "progress": {
            "xp": updated_user.get("xp", 0),
            "streak": updated_user.get("streak", 0),
            "rank": updated_user.get("rank", "iron"),
            "gems": updated_user.get("gems", 0),
            "hearts": updated_user.get("hearts", 5),
            "completedLessons": updated_user.get("completed_lessons", [])
        }
    }

@router.post("/pvp-matches")
async def submit_pvp_match(match: PvPMatchCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    match_doc = match.dict()
    match_doc["user_id"] = current_user["_id"]
    match_doc["created_at"] = datetime.utcnow()
    
    await db["pvp_matches"].insert_one(match_doc)
    
    inc_data = {}
    if match.result == "win":
        inc_data["xp"] = 20
        inc_data["gems"] = 5
    elif match.result == "draw":
        inc_data["xp"] = 10
    else:
        inc_data["xp"] = 5
        
    if inc_data:
        await db["users"].update_one({"_id": current_user["_id"]}, {"$inc": inc_data})
        
    updated_user = await db["users"].find_one({"_id": current_user["_id"]})
    return {
        "message": "Match saved",
        "progress": {
            "xp": updated_user.get("xp", 0),
            "streak": updated_user.get("streak", 0),
            "gems": updated_user.get("gems", 0),
            "hearts": updated_user.get("hearts", 5),
            "completedLessons": updated_user.get("completed_lessons", [])
        }
    }

@router.get("/leaderboard")
async def get_leaderboard(current_user: dict = Depends(get_current_user)):
    db = get_database()
    # Lọc leaderboard theo tenant nếu có, mặc định None
    query = {}
    if current_user.get("tenant_id"):
        query["tenant_id"] = current_user["tenant_id"]
        
    cursor = db["users"].find(query, {"full_name": 1, "username": 1, "avatar_url": 1, "xp": 1}).sort("xp", -1).limit(50)
    leaderboard = []
    
    async for user in cursor:
        leaderboard.append({
            "id": user["_id"],
            "name": user.get("full_name") or user.get("username"),
            "avatarUrl": user.get("avatar_url"),
            "xp": user.get("xp", 0)
        })
        
    return {"leaderboard": leaderboard}
