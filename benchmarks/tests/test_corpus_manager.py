import hashlib
import io
import os
import sys
from pathlib import Path
from unittest.mock import patch

import pytest
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

import benchmarks.corpus_manager as corpus_manager
from benchmarks.corpus_manager import (
    ALLOWED_LICENSES,
    CorpusManagerError,
    Entry,
    add_entry,
    cache_dir,
    cache_path,
    corpus_hash,
    default_cache_root,
    fetch_corpus,
    interactive_add_entry,
    load_entries,
    main,
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
size = [3, 2]
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


@pytest.fixture
def png_bytes() -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", (3, 2), color=(12, 34, 56)).save(buffer, format="PNG")
    return buffer.getvalue()


@pytest.fixture
def add_corpus(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    corpus_dir = create_corpus(tmp_path / "corpus")
    monkeypatch.setenv("IMG2NUM_BENCH_CACHE", str(tmp_path / "cache"))
    return corpus_dir


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


def test_default_cache_root_windows_with_localappdata(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    fake_localappdata = tmp_path / "AppData" / "Local"
    monkeypatch.setattr(sys, "platform", "win32")
    monkeypatch.setenv("LOCALAPPDATA", str(fake_localappdata))
    root = default_cache_root()
    assert root == fake_localappdata / "img2num-bench"


def test_default_cache_root_windows_fallback(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    fake_home = tmp_path / "fakehome"
    monkeypatch.setattr(sys, "platform", "win32")
    monkeypatch.delenv("LOCALAPPDATA", raising=False)
    monkeypatch.setattr(Path, "home", classmethod(lambda cls: fake_home))
    root = default_cache_root()
    assert root == fake_home / "AppData" / "Local" / "img2num-bench"


def test_default_cache_root_darwin(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    fake_home = tmp_path / "fakehome"
    monkeypatch.setattr(sys, "platform", "darwin")
    monkeypatch.setattr(Path, "home", classmethod(lambda cls: fake_home))
    root = default_cache_root()
    assert root == fake_home / "Library" / "Caches" / "img2num-bench"


def test_default_cache_root_linux_with_xdg(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    fake_xdg = tmp_path / "xdg_cache"
    monkeypatch.setattr(sys, "platform", "linux")
    monkeypatch.setenv("XDG_CACHE_HOME", str(fake_xdg))
    root = default_cache_root()
    assert root == fake_xdg / "img2num-bench"


def test_default_cache_root_linux_fallback(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    fake_home = tmp_path / "fakehome"
    monkeypatch.setattr(sys, "platform", "linux")
    monkeypatch.delenv("XDG_CACHE_HOME", raising=False)
    monkeypatch.setattr(Path, "home", classmethod(lambda cls: fake_home))
    root = default_cache_root()
    assert root == fake_home / ".cache" / "img2num-bench"


def test_cache_path_uses_default_root(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    fake_home = tmp_path / "fakehome"
    monkeypatch.delenv("IMG2NUM_BENCH_CACHE", raising=False)
    monkeypatch.setattr(Path, "home", classmethod(lambda cls: fake_home))
    path = cache_path("cache-key")
    assert path == default_cache_root() / "cache-key"


def test_cache_path_accepts_environment_override() -> None:
    with patch.dict(os.environ, {"IMG2NUM_BENCH_CACHE": "/tmp/bench-cache"}):
        path = cache_path("cache-key")
    assert path == Path("/tmp/bench-cache/cache-key")


def test_cache_path_uses_default_root_for_empty_override(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    fake_home = tmp_path / "fakehome"
    monkeypatch.setattr(Path, "home", classmethod(lambda cls: fake_home))
    monkeypatch.setenv("IMG2NUM_BENCH_CACHE", "")
    path = cache_path("cache-key")
    assert path == default_cache_root() / "cache-key"


def test_cache_path_uses_default_root_for_whitespace_override(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    fake_home = tmp_path / "fakehome"
    monkeypatch.setattr(Path, "home", classmethod(lambda cls: fake_home))
    monkeypatch.setenv("IMG2NUM_BENCH_CACHE", "   ")
    path = cache_path("cache-key")
    assert path == default_cache_root() / "cache-key"


def test_cache_path_expands_tilde(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    fake_home = tmp_path / "fakehome"
    monkeypatch.setenv("HOME", str(fake_home))
    monkeypatch.setenv("USERPROFILE", str(fake_home))
    monkeypatch.setenv("IMG2NUM_BENCH_CACHE", "~/custom-cache-dir")
    path = cache_path("cache-key")
    assert path == fake_home / "custom-cache-dir" / "cache-key"


def test_cache_path_supports_paths_with_spaces(monkeypatch: pytest.MonkeyPatch) -> None:
    cache_with_spaces = "/custom path/with spaces/bench cache"
    monkeypatch.setenv("IMG2NUM_BENCH_CACHE", cache_with_spaces)
    path = cache_path("cache-key")
    assert path == Path(cache_with_spaces) / "cache-key"


def test_cache_directory_created_on_write(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    target_cache_dir = tmp_path / "nested cache dir with spaces" / "sub"
    monkeypatch.setenv("IMG2NUM_BENCH_CACHE", str(target_cache_dir))
    digest = "a" * 64
    entry_cache_file = cache_path(digest)
    assert not target_cache_dir.exists()
    corpus_manager._write_atomically(entry_cache_file, b"test image payload")
    assert target_cache_dir.is_dir()
    assert entry_cache_file.is_file()
    assert entry_cache_file.read_bytes() == b"test image payload"
    assert entry_cache_file.name == digest


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
        ("size", "size = [3, 2]"),
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
    content = VALID_CORPUS_ENTRY.replace("[3, 2]", size)
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


@pytest.mark.parametrize(
    "license_id,error_fragment",
    [
        ("CC-BY-ND-4.0", "NoDerivs licenses are not allowed"),
        ("cc-by-nd-4.0", "NoDerivs licenses are not allowed"),
        ("CC-BY-NDLESS-4.0", "is not allowed"),
    ],
)
def test_verify_classifies_no_derivatives_license_tokens(
    tmp_path: Path, license_id: str, error_fragment: str
) -> None:
    content = VALID_CORPUS_ENTRY.replace(
        'license = "CC0-1.0"', f'license = "{license_id}"'
    )
    root = create_corpus(tmp_path, entries={"sample.toml": content})

    assert any(error_fragment in error for error in verify_corpus(root))


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


def _write_fetch_entry(
    corpus_dir: Path, image_bytes: bytes, *, entry_id: str = "sample"
) -> str:
    digest = hashlib.sha256(image_bytes).hexdigest()
    content = (
        VALID_CORPUS_ENTRY.replace("sample", entry_id)
        .replace("https://", f"https://images.example.test/{entry_id}")
        .replace("a" * 64, digest)
    )
    (corpus_dir / "images" / f"{entry_id}.toml").write_text(
        content, encoding="utf-8"
    )
    return digest


def test_fetch_skips_network_for_already_cached_entry(
    add_corpus: Path, png_bytes: bytes, monkeypatch: pytest.MonkeyPatch
) -> None:
    digest = _write_fetch_entry(add_corpus, png_bytes)
    cache_file = cache_path(digest)
    cache_file.parent.mkdir(parents=True)
    cache_file.write_bytes(png_bytes)

    def unexpected_download(url: str) -> bytes:
        raise AssertionError("cached entry must not access the network")

    monkeypatch.setattr(corpus_manager, "download_url", unexpected_download)

    assert fetch_corpus(add_corpus) == []


def test_fetch_downloads_matching_content_to_cache(
    add_corpus: Path, png_bytes: bytes, monkeypatch: pytest.MonkeyPatch
) -> None:
    digest = _write_fetch_entry(add_corpus, png_bytes)
    calls: list[str] = []
    monkeypatch.setattr(
        corpus_manager,
        "download_url",
        lambda url: calls.append(url) or png_bytes,
    )

    assert fetch_corpus(add_corpus) == []
    assert calls == ["https://images.example.test/sample"]
    assert cache_path(digest).read_bytes() == png_bytes


def test_fetch_hash_mismatch_does_not_leave_cache_file(
    add_corpus: Path, png_bytes: bytes, monkeypatch: pytest.MonkeyPatch
) -> None:
    _write_fetch_entry(add_corpus, png_bytes)
    different_bytes = b"different image bytes"
    monkeypatch.setattr(corpus_manager, "download_url", lambda url: different_bytes)

    errors = fetch_corpus(add_corpus)

    assert len(errors) == 1
    assert "entry 'sample'" in errors[0]
    assert "https://" in errors[0]
    assert hashlib.sha256(png_bytes).hexdigest() in errors[0]
    assert hashlib.sha256(different_bytes).hexdigest() in errors[0]
    assert not cache_path(hashlib.sha256(png_bytes).hexdigest()).exists()


def test_fetch_reports_unreachable_url_and_continues(
    add_corpus: Path, png_bytes: bytes, monkeypatch: pytest.MonkeyPatch
) -> None:
    expected = _write_fetch_entry(add_corpus, png_bytes)
    _write_fetch_entry(add_corpus, png_bytes + b"other", entry_id="second")

    def failed_download(url: str) -> bytes:
        if url.endswith("/sample"):
            raise CorpusManagerError("download failed: unreachable")
        return png_bytes + b"other"

    monkeypatch.setattr(corpus_manager, "download_url", failed_download)

    errors = fetch_corpus(add_corpus)

    assert len(errors) == 1
    assert "entry 'sample'" in errors[0]
    assert "https://images.example.test/sample" in errors[0]
    assert expected in errors[0]
    assert "actual unavailable" in errors[0]
    assert cache_path(hashlib.sha256(png_bytes + b"other").hexdigest()).is_file()


def test_fetch_reports_cache_write_oserror_and_continues(
    add_corpus: Path, png_bytes: bytes, monkeypatch: pytest.MonkeyPatch
) -> None:
    expected = _write_fetch_entry(add_corpus, png_bytes)
    monkeypatch.setattr(corpus_manager, "download_url", lambda url: png_bytes)

    def failing_write(path: Path, data: bytes) -> None:
        raise OSError("disk full")

    monkeypatch.setattr(corpus_manager, "_write_atomically", failing_write)

    errors = fetch_corpus(add_corpus)

    assert len(errors) == 1
    assert "could not be cached" in errors[0]
    assert expected in errors[0]
    assert "disk full" in errors[0]


def test_verify_hashes_passes_with_matching_cache(
    add_corpus: Path, png_bytes: bytes
) -> None:
    digest = _write_fetch_entry(add_corpus, png_bytes)
    cache_file = cache_path(digest)
    cache_file.parent.mkdir(parents=True)
    cache_file.write_bytes(png_bytes)

    assert verify_corpus(add_corpus, hashes=True) == []


def test_verify_hashes_reports_missing_cache_and_mismatch(
    add_corpus: Path, png_bytes: bytes
) -> None:
    missing_digest = _write_fetch_entry(add_corpus, png_bytes)
    mismatch_bytes = png_bytes + b"tampered"
    mismatch_digest = _write_fetch_entry(add_corpus, mismatch_bytes, entry_id="second")
    mismatch_cache = cache_path(mismatch_digest)
    mismatch_cache.parent.mkdir(parents=True)
    mismatch_cache.write_bytes(b"wrong cache bytes")

    errors = verify_corpus(add_corpus, hashes=True)

    assert any("sample.toml" in error and "run fetch first" in error for error in errors)
    assert any(
        "second.toml" in error
        and mismatch_digest in error
        and hashlib.sha256(b"wrong cache bytes").hexdigest() in error
        for error in errors
    )
    assert not cache_path(missing_digest).exists()


def test_verify_hashes_reports_size_mismatch(
    add_corpus: Path, png_bytes: bytes
) -> None:
    digest = _write_fetch_entry(add_corpus, png_bytes)
    entry_path = add_corpus / "images" / "sample.toml"
    content = entry_path.read_text(encoding="utf-8").replace(
        "size = [3, 2]", "size = [100, 200]"
    )
    entry_path.write_text(content, encoding="utf-8")

    cache_file = cache_path(digest)
    cache_file.parent.mkdir(parents=True)
    cache_file.write_bytes(png_bytes)

    errors = verify_corpus(add_corpus, hashes=True)
    assert len(errors) == 1
    assert "cache size mismatch for entry 'sample'" in errors[0]
    assert "expected [100, 200]" in errors[0]
    assert "actual [3, 2]" in errors[0]


def test_add_happy_path_writes_entry_and_hash_cache(
    add_corpus: Path, png_bytes: bytes, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(corpus_manager, "download_url", lambda url: png_bytes)

    entry = add_entry(
        "https://images.example.test/Some%20Image.png",
        dataset="Sample Set",
        license_id="CC0-1.0",
        author="Test Author",
        source="https://source.example.test/item",
        tags=["small", "fixture"],
        corpus_dir=add_corpus,
    )

    assert entry.id == "sample-set-some-image-png"
    assert entry.size == (3, 2)
    assert verify_corpus(add_corpus) == []
    entry_path = add_corpus / "images" / f"{entry.id}.toml"
    assert entry_path.is_file()
    assert corpus_manager.cache_path(entry.sha256).read_bytes() == png_bytes
    field_order = [
        line.split(" = ", 1)[0] for line in entry_path.read_text().splitlines()
    ]
    assert field_order == [
        "id",
        "dataset",
        "url",
        "sha256",
        "size",
        "license",
        "author",
        "source",
        "tags",
    ]


def test_add_refuses_duplicate_id_without_writing(
    add_corpus: Path, png_bytes: bytes, monkeypatch: pytest.MonkeyPatch
) -> None:
    entry_path = add_corpus / "images" / "chosen-id.toml"
    entry_path.write_text(VALID_CORPUS_ENTRY, encoding="utf-8")
    monkeypatch.setattr(corpus_manager, "download_url", lambda url: png_bytes)

    with pytest.raises(CorpusManagerError, match="already exists"):
        add_entry(
            "https://images.example.test/image.png",
            dataset="dataset",
            license_id="CC0-1.0",
            author="author",
            source="source",
            entry_id="chosen-id",
            corpus_dir=add_corpus,
        )

    assert list((add_corpus / "images").glob("*.toml")) == [entry_path]
    assert not list((add_corpus.parent / "cache").glob("*"))


def test_add_refuses_duplicate_hash_under_another_id(
    add_corpus: Path, png_bytes: bytes, monkeypatch: pytest.MonkeyPatch
) -> None:
    digest = hashlib.sha256(png_bytes).hexdigest()
    existing = VALID_CORPUS_ENTRY.replace("sample", "existing").replace(
        "a" * 64, digest
    )
    (add_corpus / "images" / "existing.toml").write_text(existing, encoding="utf-8")
    monkeypatch.setattr(corpus_manager, "download_url", lambda url: png_bytes)

    with pytest.raises(CorpusManagerError, match="already exists under id 'existing'"):
        add_entry(
            "https://images.example.test/image.png",
            dataset="dataset",
            license_id="CC0-1.0",
            author="author",
            source="source",
            entry_id="new-id",
            corpus_dir=add_corpus,
        )

    assert sorted(path.name for path in (add_corpus / "images").glob("*.toml")) == [
        "existing.toml"
    ]
    assert not list((add_corpus.parent / "cache").glob("*"))


def test_add_rejects_bad_license_before_download_or_writes(
    add_corpus: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    def unexpected_download(url: str) -> bytes:
        raise AssertionError("download must not start for a disallowed license")

    monkeypatch.setattr(corpus_manager, "download_url", unexpected_download)

    with pytest.raises(CorpusManagerError, match="is not allowed"):
        add_entry(
            "https://images.example.test/image.png",
            dataset="dataset",
            license_id="CC-BY-NC-4.0",
            author="author",
            source="source",
            corpus_dir=add_corpus,
        )

    assert not list((add_corpus / "images").glob("*.toml"))
    assert not list((add_corpus.parent / "cache").glob("*"))


def test_add_rejects_non_image_without_writing(
    add_corpus: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(corpus_manager, "download_url", lambda url: b"not an image")

    with pytest.raises(CorpusManagerError, match="not a supported or valid image"):
        add_entry(
            "https://images.example.test/not-image.bin",
            dataset="dataset",
            license_id="CC0-1.0",
            author="author",
            source="source",
            corpus_dir=add_corpus,
        )

    assert not list((add_corpus / "images").glob("*.toml"))
    assert not list((add_corpus.parent / "cache").glob("*"))


def test_add_failed_download_writes_nothing(
    add_corpus: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    def failed_download(url: str) -> bytes:
        raise CorpusManagerError("download failed: test failure")

    monkeypatch.setattr(corpus_manager, "download_url", failed_download)

    with pytest.raises(CorpusManagerError, match="download failed"):
        add_entry(
            "https://images.example.test/image.png",
            dataset="dataset",
            license_id="CC0-1.0",
            author="author",
            source="source",
            corpus_dir=add_corpus,
        )

    assert not list((add_corpus / "images").glob("*.toml"))
    assert not list((add_corpus.parent / "cache").glob("*"))


def test_interactive_add_happy_path(
    add_corpus: Path, png_bytes: bytes, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(corpus_manager, "download_url", lambda url: png_bytes)
    inputs = [
        "https://images.example.test/nature.png",
        "Nature Set",
        "CC-BY-4.0",
        "Jane Doe",
        "https://source.example.test/nature",
        "forest, green",
        "",
        "y",
    ]
    input_iter = iter(inputs)
    printed: list[str] = []

    entry = interactive_add_entry(
        corpus_dir=add_corpus,
        input_fn=lambda _: next(input_iter),
        print_fn=lambda *args: printed.append(" ".join(map(str, args))),
    )

    assert entry is not None
    assert entry.id == "nature-set-nature-png"
    assert entry.dataset == "Nature Set"
    assert entry.license == "CC-BY-4.0"
    assert entry.author == "Jane Doe"
    assert entry.tags == ["forest", "green"]
    assert (add_corpus / "images" / f"{entry.id}.toml").is_file()
    assert corpus_manager.cache_path(entry.sha256).read_bytes() == png_bytes
    assert any("Img2Num Benchmark Corpus" in line for line in printed)
    assert any("Review your entry:" in line for line in printed)
    assert any(f"Added {entry.id}" in line for line in printed)


def test_interactive_add_empty_tags_and_explicit_id(
    add_corpus: Path, png_bytes: bytes, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(corpus_manager, "download_url", lambda url: png_bytes)
    inputs = [
        "https://images.example.test/img.png",
        "Test Dataset",
        "CC0-1.0",
        "Author Name",
        "https://source.example.test",
        "",
        "custom-slug-123",
        "yes",
    ]
    input_iter = iter(inputs)

    entry = interactive_add_entry(
        corpus_dir=add_corpus,
        input_fn=lambda _: next(input_iter),
        print_fn=lambda *args: None,
    )

    assert entry is not None
    assert entry.id == "custom-slug-123"
    assert entry.tags == []
    assert (add_corpus / "images" / "custom-slug-123.toml").is_file()


def test_interactive_add_reprompts_invalid_inputs(
    add_corpus: Path, png_bytes: bytes, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(corpus_manager, "download_url", lambda url: png_bytes)
    inputs = [
        "ftp://invalid.url",
        "https://images.example.test/corrected.png",
        "",
        "Corrected Dataset",
        "NOT-A-LICENSE",
        "CC-BY-NC-4.0",
        "CC-BY-2.0",
        "",
        "Valid Author",
        "",
        "https://source.example.test",
        "",
        "bad id with spaces!",
        "",
        "y",
    ]
    input_iter = iter(inputs)
    printed: list[str] = []

    entry = interactive_add_entry(
        corpus_dir=add_corpus,
        input_fn=lambda _: next(input_iter),
        print_fn=lambda *args: printed.append(" ".join(map(str, args))),
    )

    assert entry is not None
    assert entry.id == "corrected-dataset-corrected-png"
    assert any("URL must start with http:// or https://" in line for line in printed)
    assert any("Dataset name must not be empty" in line for line in printed)
    assert any("is not allowed" in line for line in printed)
    assert any("Author / rights holder must not be empty" in line for line in printed)
    assert any("Source / attribution reference must not be empty" in line for line in printed)
    assert any("ID must contain only" in line for line in printed)


def test_interactive_add_reprompts_existing_id(
    add_corpus: Path, png_bytes: bytes, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Pre-create an existing entry
    (add_corpus / "images" / "existing-slug.toml").write_text(
        VALID_CORPUS_ENTRY.replace("sample", "existing-slug"), encoding="utf-8"
    )
    monkeypatch.setattr(corpus_manager, "download_url", lambda url: png_bytes)
    inputs = [
        "https://images.example.test/img.png",
        "Test Dataset",
        "CC0-1.0",
        "Author",
        "https://source.example.test",
        "",
        "existing-slug",  # Triggers duplicate check
        "new-unique-slug",  # Accepted
        "y",
    ]
    input_iter = iter(inputs)
    printed: list[str] = []

    entry = interactive_add_entry(
        corpus_dir=add_corpus,
        input_fn=lambda _: next(input_iter),
        print_fn=lambda *args: printed.append(" ".join(map(str, args))),
    )

    assert entry is not None
    assert entry.id == "new-unique-slug"
    assert any("Entry ID 'existing-slug' already exists" in line for line in printed)
    assert (add_corpus / "images" / "new-unique-slug.toml").is_file()


def test_interactive_add_cancelled_by_user(
    add_corpus: Path, png_bytes: bytes, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(corpus_manager, "download_url", lambda url: png_bytes)
    inputs = [
        "https://images.example.test/nature.png",
        "Nature Set",
        "CC-BY-4.0",
        "Jane Doe",
        "https://source.example.test/nature",
        "forest",
        "",
        "n",
    ]
    input_iter = iter(inputs)
    printed: list[str] = []

    entry = interactive_add_entry(
        corpus_dir=add_corpus,
        input_fn=lambda _: next(input_iter),
        print_fn=lambda *args: printed.append(" ".join(map(str, args))),
    )

    assert entry is None
    assert not list((add_corpus / "images").glob("*.toml"))
    assert not list((add_corpus.parent / "cache").glob("*"))
    assert any("Cancelled. No entry was added." in line for line in printed)


def test_interactive_add_eof_handled_cleanly(add_corpus: Path) -> None:
    def raise_eof(_: str) -> str:
        raise EOFError

    with pytest.raises(EOFError):
        interactive_add_entry(
            corpus_dir=add_corpus,
            input_fn=raise_eof,
            print_fn=lambda *args: None,
        )
    assert not list((add_corpus / "images").glob("*.toml"))


def test_main_interactive_mode_end_to_end(
    add_corpus: Path, png_bytes: bytes, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(corpus_manager, "download_url", lambda url: png_bytes)
    inputs = [
        "https://images.example.test/photo.png",
        "Dataset",
        "CC0-1.0",
        "Author",
        "https://source.example.test",
        "tag1, tag2",
        "",
        "y",
    ]
    input_iter = iter(inputs)
    monkeypatch.setattr("builtins.input", lambda _: next(input_iter))

    exit_code = main(["add", "--interactive", "--corpus-dir", str(add_corpus)])

    assert exit_code == 0
    assert (add_corpus / "images" / "dataset-photo-png.toml").is_file()


def test_main_interactive_cancel_returns_zero(
    add_corpus: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    inputs = [
        "https://images.example.test/photo.png",
        "Dataset",
        "CC0-1.0",
        "Author",
        "https://source.example.test",
        "",
        "",
        "n",
    ]
    input_iter = iter(inputs)
    monkeypatch.setattr("builtins.input", lambda _: next(input_iter))

    exit_code = main(["add", "-i", "--corpus-dir", str(add_corpus)])

    assert exit_code == 0
    assert not list((add_corpus / "images").glob("*.toml"))


def test_main_interactive_eof_returns_one(
    add_corpus: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    def raise_eof(_: str) -> str:
        raise EOFError

    monkeypatch.setattr("builtins.input", raise_eof)

    exit_code = main(["add", "--interactive", "--corpus-dir", str(add_corpus)])

    assert exit_code == 1
    assert not list((add_corpus / "images").glob("*.toml"))


def test_main_interactive_keyboard_interrupt_returns_130(
    add_corpus: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    def raise_interrupt(_: str) -> str:
        raise KeyboardInterrupt

    monkeypatch.setattr("builtins.input", raise_interrupt)

    exit_code = main(["add", "--interactive", "--corpus-dir", str(add_corpus)])

    assert exit_code == 130
    assert not list((add_corpus / "images").glob("*.toml"))


def test_main_non_interactive_happy_path(
    add_corpus: Path, png_bytes: bytes, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(corpus_manager, "download_url", lambda url: png_bytes)

    exit_code = main([
        "add",
        "https://images.example.test/cli-test.png",
        "--dataset",
        "CLI Dataset",
        "--license",
        "CC-BY-4.0",
        "--author",
        "CLI Author",
        "--source",
        "https://cli.source",
        "--tags",
        "cli, automated",
        "--corpus-dir",
        str(add_corpus),
    ])

    assert exit_code == 0
    entry_path = add_corpus / "images" / "cli-dataset-cli-test-png.toml"
    assert entry_path.is_file()
    content = entry_path.read_text(encoding="utf-8")
    assert 'dataset = "CLI Dataset"' in content
    assert 'tags = ["cli", "automated"]' in content


def test_main_non_interactive_missing_args_returns_two(
    add_corpus: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr("sys.stdin.isatty", lambda: False)

    exit_code = main(["add", "--corpus-dir", str(add_corpus)])

    assert exit_code == 2
    assert not list((add_corpus / "images").glob("*.toml"))


def test_pyproject_scripts_entry_points_registered() -> None:
    pyproject_path = REPO_ROOT / "pyproject.toml"
    assert pyproject_path.is_file()
    try:
        import tomllib
    except ModuleNotFoundError:
        import tomli as tomllib  # type: ignore[no-redef]
    data = tomllib.loads(pyproject_path.read_text(encoding="utf-8"))
    scripts = data.get("project", {}).get("scripts", {})
    assert "corpus-manager" in scripts
    assert scripts["corpus-manager"] == "benchmarks.corpus_manager:main"
    assert "corpus_manager" in scripts
    assert scripts["corpus_manager"] == "benchmarks.corpus_manager:main"


def test_entry_point_resolves_and_runs_verify(add_corpus: Path) -> None:
    import importlib
    module = importlib.import_module("benchmarks.corpus_manager")
    entry_point = getattr(module, "main", None)
    assert callable(entry_point)
    exit_code = entry_point(["verify", "--corpus-dir", str(add_corpus)])
    assert exit_code == 0


