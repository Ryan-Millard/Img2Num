import os
from pathlib import Path
from unittest.mock import patch

import pytest

from scripts.corpus_manager import (
    ALLOWED_LICENSES,
    Entry,
    cache_path,
    corpus_hash,
    load_entries,
    verify_corpus,
)


VALID_ENTRY = """\
id = "test-entry"
dataset = "test-dataset"
url = ""
sha256 = ""
size = [32, 24]
license = ""
author = ""
source = ""
tags = ["small", "fixture"]
"""

VALID_CORPUS_ENTRY = """\
id = "sample"
dataset = "test-dataset"
url = "https://"
sha256 = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
size = [32, 24]
license = "CC0-1.0"
author = "test"
source = "test"
tags = ["fixture"]
"""


def create_corpus(
    root: Path,
    *,
    config: str | None = "schema_version = 1\n\n[config]\n",
    entries: dict[str, str] | None = None,
) -> Path:
    root.mkdir(parents=True, exist_ok=True)
    if config is not None:
        (root / "corpus.toml").write_text(config, encoding="utf-8")
    images_dir = root / "images"
    images_dir.mkdir(exist_ok=True)
    for filename, content in (entries or {}).items():
        (images_dir / filename).write_text(content, encoding="utf-8")
    return root


def test_load_entries_parses_valid_file_with_path(tmp_path: Path) -> None:
    entry_path = tmp_path / "sample.toml"
    entry_path.write_text(VALID_ENTRY, encoding="utf-8")

    entries = load_entries(tmp_path)

    assert len(entries) == 1
    entry, path = entries[0]
    assert entry == Entry(
        id="test-entry",
        dataset="test-dataset",
        url="",
        sha256="",
        size=(32, 24),
        license="",
        author="",
        source="",
        tags=["small", "fixture"],
    )
    assert path == entry_path


def test_load_entries_reports_malformed_toml_filename(tmp_path: Path) -> None:
    (tmp_path / "broken-entry.toml").write_text("id = [", encoding="utf-8")

    with pytest.raises(ValueError, match="broken-entry.toml"):
        load_entries(tmp_path)


def test_load_entries_rejects_non_integer_dimensions(tmp_path: Path) -> None:
    entry_path = tmp_path / "invalid-size.toml"
    entry_path.write_text(VALID_ENTRY.replace("[32, 24]", '["32", "24"]'))

    with pytest.raises(ValueError, match="size must be a list of two integers"):
        load_entries(tmp_path)


def test_cache_path_uses_default_root() -> None:
    with patch.dict(os.environ, {}, clear=True):
        path = cache_path("cache-key")

    assert path == Path.home() / ".cache/img2num-bench/cache-key"


def test_cache_path_accepts_environment_override() -> None:
    with patch.dict(os.environ, {"IMG2NUM_BENCH_CACHE": "/tmp/bench-cache"}):
        path = cache_path("cache-key")

    assert path == Path("/tmp/bench-cache/cache-key")


def test_cache_path_uses_default_root_for_empty_override() -> None:
    with patch.dict(os.environ, {"IMG2NUM_BENCH_CACHE": ""}):
        path = cache_path("cache-key")

    assert path == Path.home() / ".cache/img2num-bench/cache-key"


def test_corpus_hash_normalizes_line_endings(tmp_path: Path) -> None:
    images_dir = tmp_path / "images"
    images_dir.mkdir()
    entry_path = images_dir / "entry.toml"
    entry_path.write_text("key = 1\n", encoding="utf-8")
    config_path = tmp_path / "corpus.toml"
    config_path.write_text("schema_version = 1\n", encoding="utf-8")
    lf_hash = corpus_hash(images_dir)

    entry_path.write_bytes(b"key = 1\r\n")
    config_path.write_bytes(b"schema_version = 1\r\n")

    assert corpus_hash(images_dir) == lf_hash


def test_corpus_hash_includes_corpus_config(tmp_path: Path) -> None:
    images_dir = tmp_path / "images"
    images_dir.mkdir()
    config_path = tmp_path / "corpus.toml"
    config_path.write_text("schema_version = 1\n", encoding="utf-8")
    original_hash = corpus_hash(images_dir)

    config_path.write_text("schema_version = 2\n", encoding="utf-8")

    assert corpus_hash(images_dir) != original_hash


def test_verify_accepts_valid_and_empty_corpus(tmp_path: Path) -> None:
    valid_root = create_corpus(
        tmp_path / "valid", entries={"sample.toml": VALID_CORPUS_ENTRY}
    )
    empty_root = create_corpus(tmp_path / "empty")

    assert verify_corpus(valid_root) == []
    assert verify_corpus(empty_root) == []


@pytest.mark.parametrize(
    "field,line",
    [
        ("id", 'id = "sample"'),
        ("dataset", 'dataset = "test-dataset"'),
        ("url", 'url = "https://"'),
        ("sha256", 'sha256 = "' + "a" * 64 + '"'),
        ("size", "size = [32, 24]"),
        ("license", 'license = "CC0-1.0"'),
        ("author", 'author = "test"'),
        ("source", 'source = "test"'),
        ("tags", 'tags = ["fixture"]'),
    ],
)
def test_verify_requires_each_field(
    tmp_path: Path, field: str, line: str
) -> None:
    content = VALID_CORPUS_ENTRY.replace(line + "\n", "")
    root = create_corpus(tmp_path, entries={"sample.toml": content})

    assert any(
        f"sample.toml: missing required field '{field}'" in error
        for error in verify_corpus(root)
    )


@pytest.mark.parametrize(
    "field", ["id", "dataset", "url", "sha256", "license", "author", "source"]
)
def test_verify_requires_string_types(tmp_path: Path, field: str) -> None:
    lines = VALID_CORPUS_ENTRY.splitlines()
    content = "\n".join(
        f"{field} = 123" if line.startswith(f"{field} =") else line for line in lines
    )
    root = create_corpus(tmp_path, entries={"sample.toml": content})

    assert any(
        f"sample.toml: '{field}' must be a string" in error
        for error in verify_corpus(root)
    )


def test_verify_rejects_empty_id(tmp_path: Path) -> None:
    root = create_corpus(
        tmp_path,
        entries={"sample.toml": VALID_CORPUS_ENTRY.replace('id = "sample"', 'id = ""')},
    )

    assert any(
        "sample.toml: 'id' must not be empty" == error
        for error in verify_corpus(root)
    )


def test_verify_requires_id_to_match_filename(tmp_path: Path) -> None:
    root = create_corpus(tmp_path, entries={"other.toml": VALID_CORPUS_ENTRY})

    assert any("expected 'sample.toml'" in error for error in verify_corpus(root))


def test_verify_rejects_duplicate_ids(tmp_path: Path) -> None:
    root = create_corpus(
        tmp_path,
        entries={"sample.toml": VALID_CORPUS_ENTRY, "copy.toml": VALID_CORPUS_ENTRY},
    )

    assert any(
        "'id' 'sample' is duplicated" in error for error in verify_corpus(root)
    )


@pytest.mark.parametrize("sha256", ["a" * 63, "A" * 64, "g" * 64])
def test_verify_requires_lowercase_sha256(tmp_path: Path, sha256: str) -> None:
    content = VALID_CORPUS_ENTRY.replace("a" * 64, sha256)
    root = create_corpus(tmp_path, entries={"sample.toml": content})

    assert any(
        "sha256' must be exactly 64 lowercase" in error
        for error in verify_corpus(root)
    )


@pytest.mark.parametrize("size", ['[32, "24"]', "[32]", "[32, 0]", "[true, 24]"])
def test_verify_requires_two_positive_integer_dimensions(
    tmp_path: Path, size: str
) -> None:
    content = VALID_CORPUS_ENTRY.replace("[32, 24]", size)
    root = create_corpus(tmp_path, entries={"sample.toml": content})

    errors = verify_corpus(root)
    assert any("'size'" in error for error in errors)


@pytest.mark.parametrize("field", ["license", "author", "source", "dataset"])
def test_verify_requires_nonempty_metadata(tmp_path: Path, field: str) -> None:
    lines = VALID_CORPUS_ENTRY.splitlines()
    content = "\n".join(
        f'{field} = ""' if line.startswith(f"{field} =") else line for line in lines
    )
    root = create_corpus(tmp_path, entries={"sample.toml": content})

    assert any(f"'{field}' must not be empty" in error for error in verify_corpus(root))


def test_verify_requires_http_or_https_url(tmp_path: Path) -> None:
    content = VALID_CORPUS_ENTRY.replace('url = "https://"', 'url = "ftp://source"')
    root = create_corpus(tmp_path, entries={"sample.toml": content})

    assert any(
        "'url' must start with http:// or https://" in error
        for error in verify_corpus(root)
    )


@pytest.mark.parametrize("tags", ['tags = "fixture"', 'tags = ["fixture", 1]'])
def test_verify_requires_list_of_string_tags(tmp_path: Path, tags: str) -> None:
    content = VALID_CORPUS_ENTRY.replace('tags = ["fixture"]', tags)
    root = create_corpus(tmp_path, entries={"sample.toml": content})

    assert any(
        "'tags' must be a list of strings" in error
        for error in verify_corpus(root)
    )


@pytest.mark.parametrize("license_id", sorted(ALLOWED_LICENSES))
def test_verify_accepts_allowlisted_licenses(tmp_path: Path, license_id: str) -> None:
    content = VALID_CORPUS_ENTRY.replace(
        'license = "CC0-1.0"', f'license = "{license_id}"'
    )
    root = create_corpus(tmp_path, entries={"sample.toml": content})

    assert verify_corpus(root) == []


@pytest.mark.parametrize("license_id", ["UNKNOWN-1.0", "CC-BY-NC-4.0"])
def test_verify_rejects_licenses_outside_allowlist(
    tmp_path: Path, license_id: str
) -> None:
    content = VALID_CORPUS_ENTRY.replace(
        'license = "CC0-1.0"', f'license = "{license_id}"'
    )
    root = create_corpus(tmp_path, entries={"sample.toml": content})

    assert any("is not allowed" in error for error in verify_corpus(root))


def test_verify_reports_specific_no_derivatives_error(tmp_path: Path) -> None:
    content = VALID_CORPUS_ENTRY.replace(
        'license = "CC0-1.0"', 'license = "CC-BY-ND-4.0"'
    )
    root = create_corpus(tmp_path, entries={"sample.toml": content})

    assert any(
        "NoDerivs licenses are not allowed" in error for error in verify_corpus(root)
    )


@pytest.mark.parametrize(
    "config,expected",
    [
        (None, "corpus.toml: file is missing"),
        ("schema_version = 2\n", "schema_version must be a supported integer"),
        ("schema_version = \"1\"\n", "schema_version must be a supported integer"),
        ("schema_version = [\n", "corpus.toml: cannot parse config"),
    ],
)
def test_verify_requires_supported_corpus_schema(
    tmp_path: Path, config: str | None, expected: str
) -> None:
    root = create_corpus(tmp_path, config=config)

    assert any(expected in error for error in verify_corpus(root))


def test_verify_collects_errors_from_all_entry_files(tmp_path: Path) -> None:
    root = create_corpus(
        tmp_path,
        entries={
            "broken.toml": "id = [\n",
            "missing.toml": 'id = "missing"\n',
        },
    )

    errors = verify_corpus(root)

    assert any(error.startswith("broken.toml:") for error in errors)
    assert any(error.startswith("missing.toml:") for error in errors)
