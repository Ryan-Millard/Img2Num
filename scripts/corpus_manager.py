#!/usr/bin/env python3
"""Manage and inspect the local benchmark corpus."""

from __future__ import annotations

import argparse
import hashlib
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

try:
    import tomllib
except ModuleNotFoundError:  # Python 3.10
    import tomli as tomllib

DEFAULT_CACHE_ROOT = Path.home() / ".cache" / "img2num-bench"
DEFAULT_CORPUS_DIR = Path(__file__).resolve().parents[1] / "benchmarks"
SUPPORTED_SCHEMA_VERSIONS = {1}
ALLOWED_LICENSES = {
    "CC0-1.0",
    "CC-BY-2.0",
    "CC-BY-4.0",
    "CC-BY-SA-2.0",
    "CC-BY-SA-4.0",
    "Public-Domain",
}
SHA256_PATTERN = re.compile(r"^[0-9a-f]{64}$")
STRING_FIELDS = (
    "id",
    "dataset",
    "url",
    "sha256",
    "license",
    "author",
    "source",
)
REQUIRED_FIELDS = {*STRING_FIELDS, "size", "tags"}


@dataclass(frozen=True)
class Entry:
    """Metadata describing one benchmark image."""

    id: str
    dataset: str
    url: str
    sha256: str
    size: tuple[int, int]
    license: str
    author: str
    source: str
    tags: list[str]


def _entry_from_data(data: dict[str, Any], path: Path) -> Entry:
    try:
        size = data["size"]
        if (
            not isinstance(size, list)
            or len(size) != 2
            or not all(type(value) is int for value in size)
        ):
            raise ValueError("size must be a list of two integers")
        tags = data["tags"]
        if not isinstance(tags, list) or not all(isinstance(tag, str) for tag in tags):
            raise ValueError("tags must be a list of strings")
        return Entry(
            id=data["id"],
            dataset=data["dataset"],
            url=data["url"],
            sha256=data["sha256"],
            size=(size[0], size[1]),
            license=data["license"],
            author=data["author"],
            source=data["source"],
            tags=tags,
        )
    except (KeyError, TypeError, ValueError) as error:
        raise ValueError(f"{path.name}: invalid entry: {error}") from error


def load_entries(images_dir: Path) -> list[tuple[Entry, Path]]:
    """Load TOML image entries, pairing each parsed entry with its file path."""
    loaded: list[tuple[Entry, Path]] = []
    for path in sorted(images_dir.glob("*.toml"), key=lambda item: item.name):
        try:
            data = tomllib.loads(path.read_text(encoding="utf-8"))
            loaded.append((_entry_from_data(data, path), path))
        except (OSError, tomllib.TOMLDecodeError, ValueError) as error:
            if isinstance(error, ValueError) and str(error).startswith(f"{path.name}:"):
                raise
            raise ValueError(f"{path.name}: {error}") from error
    return loaded


def cache_path(sha256: str) -> Path:
    """Return the image cache location for a content digest."""
    cache_root = Path(os.environ.get("IMG2NUM_BENCH_CACHE") or DEFAULT_CACHE_ROOT)
    return cache_root.expanduser() / sha256


def corpus_hash(images_dir: Path) -> str:
    """Hash corpus configuration and entry files in stable name order."""
    digest = hashlib.sha256()
    files = [*images_dir.glob("*.toml"), images_dir.parent / "corpus.toml"]
    entry_paths = sorted(
        (path for path in files if path.is_file()),
        key=lambda item: item.name,
    )
    for path in entry_paths:
        digest.update(path.name.encode("utf-8"))
        digest.update(b"\0")
        content = path.read_text(encoding="utf-8").replace("\r\n", "\n")
        digest.update(content.encode("utf-8"))
        digest.update(b"\0")
    return digest.hexdigest()


def verify_corpus(corpus_dir: Path) -> list[str]:
    """Validate corpus metadata offline, returning every actionable error."""
    errors: list[str] = []
    config_path = corpus_dir / "corpus.toml"
    images_dir = corpus_dir / "images"

    if not config_path.is_file():
        errors.append("corpus.toml: file is missing; add schema_version = 1")
    else:
        try:
            config = tomllib.loads(config_path.read_text(encoding="utf-8"))
        except (OSError, tomllib.TOMLDecodeError) as error:
            errors.append(f"corpus.toml: cannot parse config: {error}")
        else:
            version = config.get("schema_version")
            if type(version) is not int or version not in SUPPORTED_SCHEMA_VERSIONS:
                errors.append(
                    "corpus.toml: schema_version must be a supported integer "
                    f"({', '.join(map(str, sorted(SUPPORTED_SCHEMA_VERSIONS)))})"
                )

    if not images_dir.is_dir():
        errors.append("images/: directory is missing; create it for corpus entries")
        return errors

    seen_ids: dict[str, str] = {}
    for path in sorted(images_dir.glob("*.toml"), key=lambda item: item.name):
        try:
            data = tomllib.loads(path.read_text(encoding="utf-8"))
        except (OSError, tomllib.TOMLDecodeError) as error:
            errors.append(f"{path.name}: cannot parse TOML: {error}")
            continue

        entry_errors: list[str] = []
        for field in sorted(REQUIRED_FIELDS):
            if field not in data:
                entry_errors.append(f"missing required field '{field}'")

        for field in STRING_FIELDS:
            if field in data and not isinstance(data[field], str):
                entry_errors.append(f"'{field}' must be a string")

        entry_id = data.get("id")
        if isinstance(entry_id, str):
            if not entry_id.strip():
                entry_errors.append("'id' must not be empty")
            elif path.name != f"{entry_id}.toml":
                entry_errors.append(
                    f"'id' must match this file name; expected '{entry_id}.toml'"
                )
            if entry_id in seen_ids:
                entry_errors.append(
                    f"'id' {entry_id!r} is duplicated; already used by "
                    f"{seen_ids[entry_id]}"
                )
            else:
                seen_ids[entry_id] = path.name

        sha256 = data.get("sha256")
        if isinstance(sha256, str) and not SHA256_PATTERN.fullmatch(sha256):
            entry_errors.append(
                "'sha256' must be exactly 64 lowercase hexadecimal characters"
            )

        size = data.get("size")
        if "size" in data:
            if (
                not isinstance(size, list)
                or len(size) != 2
                or not all(type(value) is int for value in size)
            ):
                entry_errors.append(
                    "'size' must be a list of two integers [width, height]"
                )
            elif any(value <= 0 for value in size):
                entry_errors.append("'size' width and height must both be positive")

        for field in ("license", "author", "source", "dataset"):
            value = data.get(field)
            if isinstance(value, str) and not value.strip():
                entry_errors.append(f"'{field}' must not be empty")

        url = data.get("url")
        if isinstance(url, str) and not url.startswith(("http://", "https://")):
            entry_errors.append("'url' must start with http:// or https://")

        tags = data.get("tags")
        if "tags" in data and (
            not isinstance(tags, list)
            or not all(isinstance(tag, str) for tag in tags)
        ):
            entry_errors.append("'tags' must be a list of strings")

        license_id = data.get("license")
        if isinstance(license_id, str):
            if "ND" in license_id:
                entry_errors.append(
                    "NoDerivs licenses are not allowed because benchmark SVGs are "
                    "derivatives of their source images"
                )
            elif license_id and license_id not in ALLOWED_LICENSES:
                entry_errors.append(
                    f"license '{license_id}' is not allowed; use an identifier "
                    "from the corpus manager allow-list"
                )

        errors.extend(f"{path.name}: {message}" for message in entry_errors)

    return errors


def _not_implemented(command: str) -> int:
    print(f"{command}: not implemented", file=sys.stderr)
    return 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    for command in ("add", "fetch"):
        subparsers.add_parser(command)
    verify_parser = subparsers.add_parser("verify")
    verify_parser.add_argument("--corpus-dir", type=Path, default=DEFAULT_CORPUS_DIR)
    args = parser.parse_args()
    if args.command != "verify":
        return _not_implemented(args.command)

    errors = verify_corpus(args.corpus_dir)
    if errors:
        for error in errors:
            print(f"Error: {error}", file=sys.stderr)
        return 1
    print("Corpus verification passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
