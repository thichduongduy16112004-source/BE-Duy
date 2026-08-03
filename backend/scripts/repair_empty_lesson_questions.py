from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from core.database import close_db, connect_db, get_database  # noqa: E402

SAMPLE_PACK = ROOT.parent / "manager-web" / "public" / "sample-assignment-pack.json"


def normalize_questions(raw_questions: list[dict[str, Any]]) -> list[dict[str, Any]]:
    questions: list[dict[str, Any]] = []
    for question in raw_questions:
        options = question.get("options") or []
        normalized_options = [option if isinstance(option, str) else option.get("text", "") for option in options]
        normalized_options = [option for option in normalized_options if option]
        if not question.get("question") or len(normalized_options) < 2:
            continue
        questions.append(
            {
                "question": question["question"].strip(),
                "options": normalized_options,
                "answer": question.get("answer", 0),
                "explanation": question.get("explanation"),
            }
        )
    return questions


def load_sample_questions() -> dict[str, list[dict[str, Any]]]:
    pack = json.loads(SAMPLE_PACK.read_text(encoding="utf-8"))
    lessons = pack.get("lessons", [])
    return {
        lesson.get("title", "").strip(): normalize_questions(lesson.get("questions", []))
        for lesson in lessons
        if lesson.get("title")
    }


async def repair_lessons(apply: bool) -> None:
    await connect_db()
    db = get_database()
    questions_by_title = load_sample_questions()
    empty_lessons = await db["lessons"].find(
        {
            "$or": [
                {"questions": {"$exists": False}},
                {"questions": []},
                {"questions": None},
            ]
        }
    ).to_list(length=None)

    repaired = 0
    skipped = 0
    for lesson in empty_lessons:
        title = lesson.get("title", "").strip()
        questions = questions_by_title.get(title, [])
        if not questions:
            skipped += 1
            print(f"[SKIP] {lesson.get('_id')} | {title} | no matching sample questions")
            continue

        repaired += 1
        print(f"[REPAIR] {lesson.get('_id')} | {title} | {len(questions)} questions")
        if apply:
            await db["lessons"].update_one(
                {"_id": lesson["_id"]},
                {"$set": {"questions": questions}},
            )

    mode = "APPLIED" if apply else "DRY RUN"
    print(f"[{mode}] repaired={repaired} skipped={skipped} scanned={len(empty_lessons)}")
    await close_db()


def main() -> None:
    parser = argparse.ArgumentParser(description="Repair imported lessons with empty questions from sample assignment pack.")
    parser.add_argument("--apply", action="store_true", help="Apply updates to MongoDB. Without this flag, only prints planned changes.")
    args = parser.parse_args()
    asyncio.run(repair_lessons(apply=args.apply))


if __name__ == "__main__":
    main()
