"""Smoke tests for Manager/Teacher Dashboard API.

Run while the FastAPI server is running locally:
    python scripts/smoke_teacher_dashboard_api.py
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from typing import Any

import httpx

DEFAULT_BASE_URL = "http://127.0.0.1:8000"
TEACHER_EMAIL = "teacher.demo@historyalive.vn"
TEACHER_PASSWORD = "Teacher123"
DEFAULT_STUDENT_EMAIL = "student.demo01@historyalive.vn"
DEFAULT_STUDENT_PASSWORD = "Student123"


@dataclass
class TestResult:
    name: str
    passed: bool
    detail: str


def request_json(client: httpx.Client, method: str, path: str, **kwargs: Any) -> httpx.Response:
    return client.request(method, path, timeout=15, **kwargs)


def login(client: httpx.Client, identity: str, password: str) -> tuple[str | None, httpx.Response]:
    response = request_json(
        client,
        "POST",
        "/api/v1/auth/login",
        json={"identity": identity, "password": password},
    )
    if response.status_code != 200:
        return None, response
    return response.json().get("access_token"), response


def auth_header(token: str | None) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"} if token else {}


def check_status(name: str, response: httpx.Response, expected: int) -> TestResult:
    passed = response.status_code == expected
    return TestResult(name, passed, f"expected={expected}, actual={response.status_code}")


def run_smoke_tests(base_url: str, student_email: str, student_password: str) -> list[TestResult]:
    results: list[TestResult] = []

    with httpx.Client(base_url=base_url) as client:
        teacher_token, teacher_login = login(client, TEACHER_EMAIL, TEACHER_PASSWORD)
        results.append(check_status("Teacher login", teacher_login, 200))

        student_token, student_login = login(client, student_email, student_password)
        results.append(check_status("Student login", student_login, 200))

        teacher_classes = request_json(client, "GET", "/api/v1/teacher/classes", headers=auth_header(teacher_token))
        results.append(check_status("Teacher can list own classes", teacher_classes, 200))

        student_classes = request_json(client, "GET", "/api/v1/teacher/classes", headers=auth_header(student_token))
        results.append(check_status("Student cannot access teacher classes", student_classes, 403))

        unauthenticated_classes = request_json(client, "GET", "/api/v1/teacher/classes")
        results.append(check_status("Unauthenticated request is blocked", unauthenticated_classes, 401))

        if teacher_classes.status_code != 200:
            results.append(TestResult("Class data available", False, "teacher classes endpoint failed"))
            return results

        classes = teacher_classes.json().get("classes", [])
        if not classes:
            results.append(TestResult("Class data available", False, "no classes returned"))
            return results

        class_id = classes[0]["id"]
        class_students = request_json(
            client,
            "GET",
            f"/api/v1/teacher/classes/{class_id}/students",
            headers=auth_header(teacher_token),
        )
        results.append(check_status("Teacher can list class students", class_students, 200))

        if class_students.status_code != 200:
            return results

        students = class_students.json().get("students", [])
        results.append(TestResult("Student data available", bool(students), f"students={len(students)}"))

        if students:
            user_id = students[0]["user_id"]
            student_detail = request_json(
                client,
                "GET",
                f"/api/v1/teacher/classes/{class_id}/students/{user_id}",
                headers=auth_header(teacher_token),
            )
            results.append(check_status("Teacher can view student detail", student_detail, 200))

            outsider_detail = request_json(
                client,
                "GET",
                f"/api/v1/teacher/classes/{class_id}/students/not_in_class",
                headers=auth_header(teacher_token),
            )
            results.append(check_status("Teacher cannot view outside student", outsider_detail, 404))

        lessons = request_json(client, "GET", "/api/v1/lessons", headers=auth_header(teacher_token))
        results.append(TestResult("Existing lessons router still responds", lessons.status_code < 500, f"status={lessons.status_code}"))

    return results


def print_results(results: list[TestResult]) -> None:
    for result in results:
        icon = "PASS" if result.passed else "FAIL"
        print(f"[{icon}] {result.name}: {result.detail}")

    passed = sum(result.passed for result in results)
    print(f"\nSummary: {passed}/{len(results)} checks passed")


def main() -> int:
    parser = argparse.ArgumentParser(description="Smoke test Teacher Dashboard API")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    parser.add_argument("--student-email", default=DEFAULT_STUDENT_EMAIL)
    parser.add_argument("--student-password", default=DEFAULT_STUDENT_PASSWORD)
    args = parser.parse_args()

    try:
        results = run_smoke_tests(
            args.base_url.rstrip("/"),
            args.student_email,
            args.student_password,
        )
    except httpx.ConnectError:
        print(f"Cannot connect to {args.base_url}. Start backend first.", file=sys.stderr)
        return 2

    print_results(results)
    return 0 if all(result.passed for result in results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
