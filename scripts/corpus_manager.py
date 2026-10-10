#!/usr/bin/env python3
"""Manage and inspect the local benchmark corpus."""

from __future__ import annotations

import argparse
import hashlib
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

try:
    import tomllib
except ModuleNotFoundError:  # Python 3.10
    import tomli as tomllib

DEFAULT_CACHE_ROOT = Path.home() / ".cache" / "img2num-bench"


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


def _not_implemented(command: str) -> int:
    print(f"{command}: not implemented", file=sys.stderr)
    return 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    for command in ("add", "fetch", "verify"):
        subparsers.add_parser(command)
    args = parser.parse_args()
    return _not_implemented(args.command)


if __name__ == "__main__":
    sys.exit(main())
