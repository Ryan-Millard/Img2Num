import os
from pathlib import Path
from unittest.mock import patch

import pytest

from scripts.corpus_manager import Entry, cache_path, corpus_hash, load_entries


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
