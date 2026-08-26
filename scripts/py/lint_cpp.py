#!/usr/bin/env python3
"""Lint all C/C++ translation units with clang-tidy.

Requires one or more compile databases (compile_commands.json). The project's
normal build flows produce them automatically (CMAKE_EXPORT_COMPILE_COMMANDS
is always exported):

    just build cpp   -> build-c-cpp/
    just build py    -> build-py/<wheel_tag>/  (scikit-build-core build-dir)
    just build js    -> build-wasm/            (linted when the Emscripten
                                                sysroot can be located via
                                                $EMSDK or em-config)

By default, every usable database found under build-c-cpp/ (or legacy
build/), build-py/*/, and build-wasm/ is used. Emscripten records its
sysroot include paths internally rather than in the compile command, so
wasm TUs are linted with an explicit -isystem pointing at the sysroot;
if no sysroot can be found, build-wasm/ is excluded and its files are
skipped with a warning. Files present in no database are skipped with a
warning.

Usage:
    uv run lint_cpp                          # auto-discover databases
    uv run lint_cpp -p build-c-cpp           # explicit database(s)
    uv run lint_cpp --fix                    # apply suggested fixes
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
from pathlib import Path

from img2num_root import IMG2NUM_ROOT as ROOT

SEARCH_DIRS = ("core", "bindings")
SUFFIXES = {".cpp", ".c"}  # translation units only; headers surface via HeaderFilterRegex
MAX_PARALLEL = os.cpu_count() or 4
WASM_BUILD_DIR_NAME = "build-wasm"


class Colors:
    RED = "\033[31m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    CYAN = "\033[36m"
    RESET = "\033[0m"


def log_color(message: str, color: str, *, err: bool = False) -> None:
    stream = sys.stderr if err else sys.stdout
    print(f"{color}{message}{Colors.RESET}", file=stream)


def has_database(build_dir: Path) -> bool:
    return (build_dir / "compile_commands.json").is_file()


@lru_cache(maxsize=1)
def emscripten_sysroot_include() -> Path | None:
    """Locate the Emscripten sysroot include dir, or None if unavailable.

    emcc injects its sysroot include paths inside the compiler driver, so
    they never appear in compile_commands.json; clang-tidy therefore needs
    the path supplied explicitly or every wasm TU fails on the first
    standard-library include.
    """
    emsdk = os.environ.get("EMSDK")
    if emsdk:
        inc = Path(emsdk) / "upstream" / "emscripten" / "cache" / "sysroot" / "include"
        if inc.is_dir():
            return inc
    em_config = shutil.which("em-config")
    if em_config:
        result = subprocess.run(
            [em_config, "CACHE"], capture_output=True, text=True
        )
        if result.returncode == 0:
            inc = Path(result.stdout.strip()) / "sysroot" / "include"
            if inc.is_dir():
                return inc
    return None


def is_wasm_build_dir(build_dir: Path) -> bool:
    return build_dir.name == WASM_BUILD_DIR_NAME


def extra_args(build_dir: Path) -> list[str]:
    """Per-database flags clang-tidy needs beyond the recorded command."""
    if not is_wasm_build_dir(build_dir):
        return []
    inc = emscripten_sysroot_include()
    assert inc is not None  # wasm dirs are filtered out earlier when None
    return [f"--extra-arg=-isystem{inc}"]


def usable_build_dirs(candidates: list[Path], *, explicit: bool) -> list[Path]:
    """Filter to databases the script can actually lint against.

    A wasm database without a locatable Emscripten sysroot is unusable:
    dropped with a warning during discovery, treated as an error when the
    user requested it explicitly with -p.
    """
    usable: list[Path] = []
    for build_dir in candidates:
        if is_wasm_build_dir(build_dir) and emscripten_sysroot_include() is None:
            level = Colors.RED if explicit else Colors.YELLOW
            log_color(
                f"Excluding {build_dir.name}: Emscripten sysroot not found "
                "(set $EMSDK or put em-config on PATH); its TUs cannot be "
                "parsed without the sysroot headers.",
                level,
                err=True,
            )
            if explicit:
                return []
            continue
        usable.append(build_dir)
    return usable


def default_build_dirs() -> list[Path]:
    """Discover databases produced by the project's build flows."""
    candidates = [ROOT / "build-c-cpp", ROOT / "build"]
    py_root = ROOT / "build-py"
    if py_root.is_dir():
        candidates += sorted(p for p in py_root.iterdir() if p.is_dir())
    candidates.append(ROOT / WASM_BUILD_DIR_NAME)
    return [d for d in candidates if has_database(d)]


def load_databases(build_dirs: list[Path]) -> dict[Path, Path]:
    """Map each TU in any compile database to the first build dir containing it."""
    file_to_build_dir: dict[Path, Path] = {}
    for build_dir in build_dirs:
        db_path = build_dir / "compile_commands.json"
        with db_path.open() as f:
            for entry in json.load(f):
                file_to_build_dir.setdefault(Path(entry["file"]).resolve(), build_dir)
    return file_to_build_dir


def find_files(file_to_build_dir: dict[Path, Path]) -> list[tuple[Path, Path]]:
    """All TUs under SEARCH_DIRS, paired with the build dir that can lint them.

    Files present in no database (e.g. excluded by every provided CMake
    configuration) would make clang-tidy error out, so they are skipped
    with a warning naming each file.
    """
    candidates: list[Path] = []
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
                candidates.append(path)

    matched = [
        (p, file_to_build_dir[p.resolve()])
        for p in candidates
        if p.resolve() in file_to_build_dir
    ]
    skipped = [p for p in candidates if p.resolve() not in file_to_build_dir]
    if skipped:
        log_color(
            f"Skipping {len(skipped)} file(s) not present in any usable compile "
            "database (not built under the provided CMake configurations, or "
            "only present in an excluded database):",
            Colors.YELLOW,
            err=True,
        )
        for p in sorted(skipped):
            log_color(f"  {p.relative_to(ROOT)}", Colors.YELLOW, err=True)
    return sorted(matched)


def run_clang_tidy(file: Path, *, build_dir: Path, fix: bool) -> bool:
    cmd = ["clang-tidy", "-p", str(build_dir), "--quiet", *extra_args(build_dir)]
    if fix:
        cmd.append("--fix")
    cmd.append(str(file))

    result = subprocess.run(cmd, capture_output=True, text=True)
    rel = file.relative_to(ROOT)

    if result.returncode != 0:
        log_color(f"Lint failed: {rel}", Colors.RED, err=True)
        if result.stdout and not result.stdout.lstrip().startswith("USAGE:"):
            print(result.stdout, end="")
        if result.stderr:
            print(result.stderr, file=sys.stderr, end="")
        return False

    log_color(f"OK: {rel}", Colors.GREEN)
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "-p",
        "--build-dir",
        dest="build_dirs",
        type=Path,
        action="append",
        help=(
            "Build directory containing compile_commands.json. "
            "Repeatable; files are linted against the first database "
            "that contains them (default: auto-discover build-c-cpp, "
            "build-py/*, and build-wasm)"
        ),
    )
    parser.add_argument(
        "--fix",
        action="store_true",
        help="Apply clang-tidy's suggested fixes in place",
    )
    args = parser.parse_args()

    if args.build_dirs:
        missing = [d for d in args.build_dirs if not has_database(d)]
        if missing:
            for d in missing:
                log_color(
                    f"No compile database at {d / 'compile_commands.json'}.",
                    Colors.RED,
                    err=True,
                )
            return 2
        build_dirs = usable_build_dirs(args.build_dirs, explicit=True)
        if not build_dirs:
            return 2
    else:
        build_dirs = usable_build_dirs(default_build_dirs(), explicit=False)
        if not build_dirs:
            log_color(
                "No usable compile databases found.\n"
                "Build the project first (databases are exported "
                "automatically):\n"
                "  just build cpp    # -> build-c-cpp/\n"
                "  just build py     # -> build-py/<wheel_tag>/\n"
                "  just build js     # -> build-wasm/ (needs $EMSDK to lint)",
                Colors.RED,
                err=True,
            )
            return 2
        log_color(
            "Using compile database(s): "
            + ", ".join(str(d.relative_to(ROOT)) for d in build_dirs),
            Colors.CYAN,
        )

    verify = subprocess.run(
        ["clang-tidy", "--verify-config"],
        capture_output=True,
        text=True,
        cwd=ROOT,
    )
    if verify.returncode != 0:
        log_color("Invalid clang-tidy configuration:", Colors.RED, err=True)
        print(verify.stderr or verify.stdout, file=sys.stderr, end="")
        return 2

    files = find_files(load_databases(build_dirs))
    if not files:
        log_color(
            "No C++ translation units found in the compile database(s).",
            Colors.YELLOW,
        )
        return 0

    log_color(f"Linting {len(files)} C++ file(s)...", Colors.CYAN)

    # --fix must not run concurrently: two TUs including the same header can
    # both rewrite it and corrupt the file.
    workers = 1 if args.fix else MAX_PARALLEL
    with ThreadPoolExecutor(max_workers=workers) as pool:
        results = list(
            pool.map(
                lambda pair: run_clang_tidy(
                    pair[0], build_dir=pair[1], fix=args.fix
                ),
                files,
            )
        )

    if not all(results):
        log_color("\nC++ lint complete with errors.", Colors.RED, err=True)
        return 1

    log_color("\nC++ lint complete successfully.", Colors.GREEN)
    return 0


if __name__ == "__main__":
    sys.exit(main())
