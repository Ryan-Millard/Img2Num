#!/usr/bin/env python3
"""Format (or check) all C/C++ sources with clang-format.

Usage:
    uv run scripts/format_cpp.py          # format in place
    uv run scripts/format_cpp.py --check  # read-only check, non-zero exit on drift
"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from img2num_root import IMG2NUM_ROOT as ROOT

SEARCH_DIRS = ("core", "bindings", "example-apps")
SUFFIXES = {".hpp", ".cpp", ".h", ".c"}
MAX_PARALLEL = os.cpu_count() or 4


class Colors:
    RED = "\033[31m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    CYAN = "\033[36m"
    RESET = "\033[0m"


def log_color(message: str, color: str, *, err: bool = False) -> None:
    stream = sys.stderr if err else sys.stdout
    print(f"{color}{message}{Colors.RESET}", file=stream)


def find_files() -> list[Path]:
    files: list[Path] = []
    for dir_name in SEARCH_DIRS:
        base = ROOT / dir_name
        if not base.is_dir():
            continue
        for path in base.rglob("*"):
            if (
                path.is_file()
                and path.suffix in SUFFIXES
                and not any(
                    part.startswith(".") for part in path.relative_to(ROOT).parts
                )
            ):
                files.append(path)
    return sorted(files)


def run_clang_format(file: Path, *, check_only: bool) -> bool:
    """Run clang-format on a single file. Returns True on success."""
    cmd = ["clang-format", "-style=file"]
    cmd += ["--dry-run", "--Werror"] if check_only else ["-i"]
    cmd.append(str(file))

    result = subprocess.run(cmd, capture_output=True, text=True)
    rel = file.relative_to(ROOT)

    if result.returncode != 0:
        label = "Check failed" if check_only else "Formatting error"
        log_color(f"{label}: {rel}", Colors.RED, err=True)
        if result.stderr:
            print(result.stderr, file=sys.stderr, end="")
        return False

    if not check_only:
        log_color(f"Formatted: {rel}", Colors.GREEN)
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="Only check formatting without modifying files",
    )
    check_only = parser.parse_args().check

    if not (ROOT / ".clang-format").exists():
        log_color(
            "No .clang-format file found in repo root. Default style will be used.",
            Colors.YELLOW,
        )

    files = find_files()
    if not files:
        log_color("No C++ files found.", Colors.YELLOW)
        return 0

    log_color(
        f"{'Checking' if check_only else 'Formatting'} {len(files)} C++ file(s)...",
        Colors.CYAN,
    )

    with ThreadPoolExecutor(max_workers=MAX_PARALLEL) as pool:
        results = list(
            pool.map(lambda f: run_clang_format(f, check_only=check_only), files)
        )

    if not all(results):
        log_color(
            f"\nC++ {'format check' if check_only else 'formatting'} "
            "complete with errors.",
            Colors.RED,
            err=True,
        )
        return 1

    log_color(
        f"\nC++ {'format check' if check_only else 'formatting'} "
        "complete successfully.",
        Colors.GREEN,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
