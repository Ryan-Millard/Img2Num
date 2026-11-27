#!/usr/bin/env python3
"""Build and install Dawn from third_party/dawn using .versions/dawn.json.

One recipe for Dockerfile.dev and CI (see issue #634).
Usage: build_dawn.py --prefix <dir> [--src <dir>] [--build-dir <dir>] [--help]
"""

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DAWN_JSON = ROOT / ".versions" / "dawn.json"

# Order matches the --help output of the old build-dawn.sh / build-dawn.ps1.
FLAGS = (
    "dawn_sha",
    "CMAKE_BUILD_TYPE",
    "CMAKE_MSVC_RUNTIME_LIBRARY",
    "MACOSX_DEPLOYMENT_TARGET",
    "DAWN_SUPPORTS_GLFW_FOR_WINDOWING",
    "DAWN_USE_X11",
    "DAWN_FETCH_DEPENDENCIES",
    "DAWN_ENABLE_INSTALL",
    "DAWN_BUILD_TESTS",
    "DAWN_BUILD_SAMPLES",
    "DAWN_USE_GLFW",
    "TINT_BUILD_TESTS",
    "TINT_BUILD_CMD_TOOLS",
    "TINT_BUILD_GLSL_VALIDATOR",
    "DAWN_BUILD_PROTOBUF",
    "TINT_BUILD_IR_BINARY",
)
TOGGLES = FLAGS[4:]


class Parser(argparse.ArgumentParser):
    """Keep CLI errors at exit 1, like the old scripts."""

    def error(self, message):
        self.print_usage(sys.stderr)
        self.exit(1, f"{self.prog}: error: {message}\n")


def load_flags():
    data = json.loads(DAWN_JSON.read_text(encoding="utf-8"))
    flags = {}
    for key in FLAGS:
        value = data.get(key)
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f'Missing or invalid "{key}" in {DAWN_JSON}')
        flags[key] = value
    return flags


def main():
    parser = Parser(
        prog="build_dawn.py",
        usage="build_dawn.py --prefix DIR [--src DIR] [--build-dir DIR] [--help]",
        add_help=False,
    )
    parser.add_argument("--prefix")
    parser.add_argument("--src")
    parser.add_argument("--build-dir", dest="build_dir")
    parser.add_argument("--help", "-h", action="store_true")
    args = parser.parse_args()

    flags = load_flags()

    if args.help:
        print(f"Flags from {DAWN_JSON} (dry run, no build):")
        for key in FLAGS:
            print(f"  {key}={flags[key]}")
        return 0

    if not args.prefix:
        print("--prefix is required (use --prefix <dir>)", file=sys.stderr)
        return 1

    src = args.src or ROOT / "third_party" / "dawn"
    build_dir = args.build_dir or ROOT / "build" / "dawn"
    generator = ["-GNinja"] if shutil.which("ninja") else []
    build_type = flags["CMAKE_BUILD_TYPE"]

    configure = [
        "cmake",
        "-S", str(src),
        "-B", str(build_dir),
        *generator,
        f"-DCMAKE_BUILD_TYPE={build_type}",
        "-DCMAKE_POLICY_DEFAULT_CMP0091=NEW",
        f"-DCMAKE_OSX_DEPLOYMENT_TARGET={flags['MACOSX_DEPLOYMENT_TARGET']}",
        f"-DCMAKE_MSVC_RUNTIME_LIBRARY={flags['CMAKE_MSVC_RUNTIME_LIBRARY']}",
        *(f"-D{key}={flags[key]}" for key in TOGGLES),
    ]
    subprocess.run(configure, check=True)
    subprocess.run(
        ["cmake", "--build", str(build_dir), "--config", build_type, "--parallel"],
        check=True,
    )
    subprocess.run(
        [
            "cmake",
            "--install",
            str(build_dir),
            "--config",
            build_type,
            "--prefix",
            args.prefix,
        ],
        check=True,
    )
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, ValueError, subprocess.CalledProcessError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        sys.exit(1)
