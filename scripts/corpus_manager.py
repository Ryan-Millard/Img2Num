#!/usr/bin/env python3
"""Manage and inspect the local benchmark corpus."""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
import re
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from pathlib import PurePosixPath
from typing import Any
from urllib.error import URLError
from urllib.parse import unquote, urlsplit
from urllib.request import Request, urlopen

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
ID_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")
MAX_DOWNLOAD_BYTES = 50 * 1024 * 1024
DOWNLOAD_TIMEOUT_SECONDS = 30
USER_AGENT = "Img2Num-Benchmark-Corpus/1.0"
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


class CorpusManagerError(ValueError):
    """Raised when an add request cannot safely create a corpus entry."""


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
            license_message = license_error(license_id)
            if license_message:
                entry_errors.append(license_message)

        errors.extend(f"{path.name}: {message}" for message in entry_errors)

    return errors


def license_error(license_id: str) -> str | None:
    """Return a shared allow-list error message, if the license is rejected."""
    if "ND" in license_id:
        return (
            "NoDerivs licenses are not allowed because benchmark SVGs are "
            "derivatives of their source images"
        )
    if license_id not in ALLOWED_LICENSES:
        return (
            f"license '{license_id}' is not allowed; "
            "use an identifier from the allow-list"
        )
    return None


def download_url(url: str) -> bytes:
    """Download one image URL with a user agent, timeout, and size cap."""
    if not url.startswith(("http://", "https://")):
        raise CorpusManagerError("URL must start with http:// or https://")
    request = Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urlopen(request, timeout=DOWNLOAD_TIMEOUT_SECONDS) as response:
            content_length = response.headers.get("Content-Length")
            if content_length and int(content_length) > MAX_DOWNLOAD_BYTES:
                raise CorpusManagerError(
                    f"download exceeds the {MAX_DOWNLOAD_BYTES}-byte size limit"
                )
            data = response.read(MAX_DOWNLOAD_BYTES + 1)
    except CorpusManagerError:
        raise
    except (URLError, TimeoutError, OSError, ValueError) as error:
        raise CorpusManagerError(f"download failed: {error}") from error
    if len(data) > MAX_DOWNLOAD_BYTES:
        raise CorpusManagerError(
            f"download exceeds the {MAX_DOWNLOAD_BYTES}-byte size limit"
        )
    return data


def image_dimensions(image_bytes: bytes) -> tuple[int, int]:
    """Read and validate image dimensions using Pillow."""
    try:
        from PIL import Image, UnidentifiedImageError
    except ImportError as error:
        raise CorpusManagerError(
            "Pillow is required to add benchmark images; "
            "install the script dependencies"
        ) from error

    try:
        with Image.open(io.BytesIO(image_bytes)) as image:
            width, height = image.size
            image.verify()
    except (
        EOFError,
        OSError,
        SyntaxError,
        ValueError,
        UnidentifiedImageError,
        Image.DecompressionBombError,
    ) as error:
        raise CorpusManagerError(
            "downloaded data is not a supported or valid image"
        ) from error
    if width <= 0 or height <= 0:
        raise CorpusManagerError("image width and height must both be positive")
    return width, height


def _slug(value: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", value.lower())).strip("-")


def derive_id(dataset: str, url: str) -> str:
    """Derive a lowercase slug from the dataset and URL path filename."""
    filename = PurePosixPath(unquote(urlsplit(url).path)).name
    if not filename:
        raise CorpusManagerError("URL must include a file name, or provide --id")
    dataset_slug = _slug(dataset)
    filename_slug = _slug(filename)
    if not dataset_slug or not filename_slug:
        raise CorpusManagerError(
            "dataset and URL file name must contain letters or digits to derive an id"
        )
    return f"{dataset_slug}-{filename_slug}"


def _toml_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def render_entry(entry: Entry) -> str:
    """Serialize an entry with a fixed, deterministic TOML field order."""
    tags = ", ".join(_toml_string(tag) for tag in entry.tags)
    return (
        f"id = {_toml_string(entry.id)}\n"
        f"dataset = {_toml_string(entry.dataset)}\n"
        f"url = {_toml_string(entry.url)}\n"
        f"sha256 = {_toml_string(entry.sha256)}\n"
        f"size = [{entry.size[0]}, {entry.size[1]}]\n"
        f"license = {_toml_string(entry.license)}\n"
        f"author = {_toml_string(entry.author)}\n"
        f"source = {_toml_string(entry.source)}\n"
        f"tags = [{tags}]\n"
    )


def _write_atomically(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as temporary:
            temporary_path = Path(temporary.name)
            temporary.write(data)
        os.replace(temporary_path, path)
    finally:
        if temporary_path is not None and temporary_path.exists():
            temporary_path.unlink()


def _write_new_atomically(path: Path, data: bytes) -> None:
    """Atomically create a new file without replacing an existing entry."""
    temporary_path: Path | None = None
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as temporary:
            temporary_path = Path(temporary.name)
            temporary.write(data)
        os.link(temporary_path, path)
    except FileExistsError as error:
        raise CorpusManagerError(f"entry id '{path.stem}' already exists") from error
    except OSError as error:
        raise CorpusManagerError(
            f"cannot write entry '{path.name}': {error}"
        ) from error
    finally:
        if temporary_path is not None and temporary_path.exists():
            temporary_path.unlink()


def add_entry(
    url: str,
    *,
    dataset: str,
    license_id: str,
    author: str,
    source: str,
    tags: list[str] | None = None,
    entry_id: str | None = None,
    corpus_dir: Path = DEFAULT_CORPUS_DIR,
) -> Entry:
    """Download an image and write its cache object and metadata entry."""
    license_message = license_error(license_id)
    if license_message:
        raise CorpusManagerError(license_message)
    for field, value in (("dataset", dataset), ("author", author), ("source", source)):
        if not value.strip():
            raise CorpusManagerError(f"--{field} must not be empty")
    if not url.startswith(("http://", "https://")):
        raise CorpusManagerError("URL must start with http:// or https://")

    resolved_id = entry_id if entry_id is not None else derive_id(dataset, url)
    if not ID_PATTERN.fullmatch(resolved_id) or resolved_id in {".", ".."}:
        raise CorpusManagerError(
            "id must contain only letters, digits, '.', '_' or '-'")

    images_dir = corpus_dir / "images"
    entry_path = images_dir / f"{resolved_id}.toml"
    if entry_path.exists():
        raise CorpusManagerError(f"entry id '{resolved_id}' already exists")

    try:
        downloaded = download_url(url)
    except CorpusManagerError:
        raise
    except Exception as error:
        raise CorpusManagerError(f"download failed: {error}") from error
    width, height = image_dimensions(downloaded)
    sha256 = hashlib.sha256(downloaded).hexdigest()

    try:
        existing_entries = load_entries(images_dir)
    except (OSError, ValueError) as error:
        raise CorpusManagerError(f"cannot inspect existing entries: {error}") from error
    for existing, existing_path in existing_entries:
        if existing.sha256 == sha256:
            raise CorpusManagerError(
                f"image hash already exists under id '{existing.id}' "
                f"({existing_path.name})"
            )

    entry = Entry(
        id=resolved_id,
        dataset=dataset,
        url=url,
        sha256=sha256,
        size=(width, height),
        license=license_id,
        author=author,
        source=source,
        tags=tags or [],
    )
    cache_file = cache_path(sha256)
    _write_new_atomically(entry_path, render_entry(entry).encode("utf-8"))
    try:
        _write_atomically(cache_file, downloaded)
    except OSError as error:
        entry_path.unlink(missing_ok=True)
        raise CorpusManagerError(f"cannot write image cache: {error}") from error
    return entry


def _not_implemented(command: str) -> int:
    print(f"{command}: not implemented", file=sys.stderr)
    return 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    add_parser = subparsers.add_parser("add")
    add_parser.add_argument("url")
    add_parser.add_argument("--dataset", required=True)
    add_parser.add_argument("--license", dest="license_id", required=True)
    add_parser.add_argument("--author", required=True)
    add_parser.add_argument("--source", required=True)
    add_parser.add_argument("--tags", default="")
    add_parser.add_argument("--id", dest="entry_id")
    subparsers.add_parser("fetch")
    verify_parser = subparsers.add_parser("verify")
    verify_parser.add_argument("--corpus-dir", type=Path, default=DEFAULT_CORPUS_DIR)
    args = parser.parse_args()
    if args.command == "add":
        try:
            entry = add_entry(
                args.url,
                dataset=args.dataset,
                license_id=args.license_id,
                author=args.author,
                source=args.source,
                tags=[tag.strip() for tag in args.tags.split(",") if tag.strip()],
                entry_id=args.entry_id,
            )
        except CorpusManagerError as error:
            print(f"Error: {error}", file=sys.stderr)
            return 1
        print(f"Added {entry.id} ({entry.sha256})")
        return 0
    if args.command == "fetch":
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
