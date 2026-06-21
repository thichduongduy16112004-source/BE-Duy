from __future__ import annotations

import argparse
import compileall
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BACKEND = ROOT / "backend"
RAG_BACKEND = ROOT / "history_ai" / "backend"
FRONTEND = ROOT / "frontend"
ADMIN = ROOT / "historyalive-admin"


def resolve_command(command: list[str]) -> list[str]:
    executable = shutil.which(command[0])
    if executable is None:
        return command
    return [executable, *command[1:]]


@dataclass(frozen=True)
class CheckResult:
    name: str
    ok: bool
    duration_seconds: float
    details: str


def run_compile_check(name: str, path: Path) -> CheckResult:
    started = time.perf_counter()
    ok = compileall.compile_dir(str(path), quiet=1, force=False)
    return CheckResult(
        name=name,
        ok=ok,
        duration_seconds=time.perf_counter() - started,
        details=str(path.relative_to(ROOT)),
    )


def run_command_check(name: str, cwd: Path, command: list[str]) -> CheckResult:
    started = time.perf_counter()
    try:
        completed = subprocess.run(
            resolve_command(command),
            cwd=cwd,
            check=False,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            timeout=120,
        )
    except FileNotFoundError as exc:
        return CheckResult(name, False, time.perf_counter() - started, f"Missing command: {exc.filename}")
    except subprocess.TimeoutExpired:
        return CheckResult(name, False, time.perf_counter() - started, "Timed out after 120 seconds")

    output = completed.stdout.strip().splitlines()
    tail = "\n".join(output[-12:]) if output else "No output"
    return CheckResult(name, completed.returncode == 0, time.perf_counter() - started, tail)


def run_http_check(name: str, url: str, timeout_seconds: float = 3.0) -> CheckResult:
    started = time.perf_counter()
    try:
        with urllib.request.urlopen(url, timeout=timeout_seconds) as response:
            body = response.read(2048).decode("utf-8", errors="replace")
            ok = 200 <= response.status < 400
            return CheckResult(name, ok, time.perf_counter() - started, f"HTTP {response.status}: {body[:180]}")
    except urllib.error.HTTPError as exc:
        return CheckResult(name, False, time.perf_counter() - started, f"HTTP {exc.code}: {exc.reason}")
    except urllib.error.URLError as exc:
        return CheckResult(name, False, time.perf_counter() - started, f"Not reachable: {exc.reason}")
    except TimeoutError:
        return CheckResult(name, False, time.perf_counter() - started, f"Timed out after {timeout_seconds}s")


def has_script(package_json: Path, script_name: str) -> bool:
    try:
        data = json.loads(package_json.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return False
    return script_name in data.get("scripts", {})


def build_checks(include_builds: bool, include_live: bool) -> list[CheckResult]:
    results = [
        run_compile_check("Backend compile", BACKEND),
        run_compile_check("RAG compile", RAG_BACKEND),
    ]

    if include_builds:
        if has_script(FRONTEND / "package.json", "build"):
            results.append(run_command_check("Student frontend build", FRONTEND, ["npm", "run", "build"]))
        if has_script(ADMIN / "package.json", "lint"):
            results.append(run_command_check("Admin lint", ADMIN, ["npm", "run", "lint"]))
        if has_script(ADMIN / "package.json", "build"):
            results.append(run_command_check("Admin build", ADMIN, ["npm", "run", "build"]))

    if include_live:
        results.extend(
            [
                run_http_check("Backend root health", "http://localhost:8000/"),
                run_http_check("Student frontend", "http://localhost:5173/"),
                run_http_check("Admin portal", "http://localhost:5178/"),
            ]
        )

    return results


def print_results(results: list[CheckResult]) -> int:
    print("\nHistory Alive Phase 5 Verification")
    print("=" * 42)
    for result in results:
        icon = "PASS" if result.ok else "FAIL"
        print(f"[{icon}] {result.name} ({result.duration_seconds:.1f}s)")
        if result.details:
            print(result.details.rstrip())
            print("-" * 42)

    failed = [result.name for result in results if not result.ok]
    if failed:
        print("Failed checks:")
        for name in failed:
            print(f"- {name}")
        return 1

    print("All selected Phase 5 checks passed.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Run History Alive Phase 5 integration verification checks.")
    parser.add_argument("--with-builds", action="store_true", help="Run npm build/lint checks in addition to Python compile checks.")
    parser.add_argument("--with-live", action="store_true", help="Check local dev servers on their expected ports.")
    args = parser.parse_args()

    os.chdir(ROOT)
    return print_results(build_checks(include_builds=args.with_builds, include_live=args.with_live))


if __name__ == "__main__":
    sys.exit(main())
