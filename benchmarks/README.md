# Benchmark corpus

The benchmark corpus records metadata for source images used by the benchmark
suite. It keeps the source files out of the repository and gives each image a
stable identity and SHA-256 digest so contributors and CI can retrieve and
verify the same bytes.

## Directory layout

```text
benchmarks/
├── README.md
├── corpus_manager.py    # Benchmark corpus management tool
├── corpus.toml          # Corpus schema version and shared configuration
├── images/
│   ├── .gitkeep
│   └── <id>.toml        # One metadata entry per image
└── tests/
    └── test_corpus_manager.py
```

`corpus.toml` currently declares `schema_version = 1`. The `[config]` table is
reserved for shared corpus configuration. Each image entry lives in
`benchmarks/images/<id>.toml`; image bytes are stored only in the local cache.

## Entry schema

Every entry contains these fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `id` | string | Non-empty, unique entry ID. It must match the TOML filename, `<id>.toml`. |
| `dataset` | string | Non-empty name of the dataset. |
| `url` | string | HTTP or HTTPS URL used to download the image. |
| `sha256` | string | 64 lowercase hexadecimal characters identifying the downloaded bytes. |
| `size` | two-integer array | Positive image dimensions in pixels: `[width, height]`. |
| `license` | string | License identifier from the allow-list below. |
| `author` | string | Non-empty image author or rights holder. |
| `source` | string | Non-empty source or attribution reference. |
| `tags` | array of strings | Zero or more descriptive tags. |

The `add` command creates the entry and fills in its ID, digest, and dimensions
from the downloaded image. Entries should not be written by hand.

## Adding an image

The easiest, guided way to add an image to the benchmark corpus is through the
interactive prompter (similar to `npm create vite`) using the registered `corpus-manager` command:

```sh
uv run corpus-manager add --interactive
```

*(Or simply run `uv run corpus-manager add`, or direct module execution `python -m benchmarks.corpus_manager add` in an interactive terminal. Both `corpus-manager` and `corpus_manager` are registered script aliases in `pyproject.toml`.)*

The prompter walks you through each metadata field, validates inputs in place,
shows a summary of the entry for your review, and asks for confirmation before
downloading the image and writing the entry:

```text
Img2Num Benchmark Corpus
────────────────────────

Image URL: https://images.cocodataset.org/val2017/000000002153.jpg
Dataset name: COCO 2017 val
License identifier: CC-BY-SA-2.0
Author / rights holder: Jack (RiverRatt3)
Source / attribution reference: https://www.flickr.com/photos/44458147@N00/2535221304/
Tags (comma-separated, optional): natural
Entry ID (optional, press Enter for auto 'coco-2017-val-000000002153-jpg'):

Review your entry:
  Image URL: https://images.cocodataset.org/val2017/000000002153.jpg
  Dataset:   COCO 2017 val
  License:   CC-BY-SA-2.0
  Author:    Jack (RiverRatt3)
  Source:    https://www.flickr.com/photos/44458147@N00/2535221304/
  Tags:      natural
  Entry ID:  coco-2017-val-000000002153-jpg

Add this entry? (Y/n): y

Added coco-2017-val-000000002153-jpg (8795ff243cf20405bd442631d5d1cb7e60665dd459c8d57f5764333808dd49fd)
```

### Prompt guide

| Prompt | Required? | Meaning |
| --- | --- | --- |
| `Image URL` | Yes | Direct HTTP or HTTPS link to the source image file. |
| `Dataset name` | Yes | Name of the dataset (e.g. `COCO 2017 val`). |
| `License identifier` | Yes | An allow-listed license ID (e.g. `CC0-1.0`, `CC-BY-4.0`). |
| `Author / rights holder` | Yes | Original creator or copyright holder. |
| `Source / attribution reference` | Yes | Reference URL or publication documenting attribution. |
| `Tags` | No | Comma-separated descriptors. Press Enter to skip. |
| `Entry ID` | No | Unique slug. Press Enter to automatically derive `<dataset>-<filename>`. |

### Non-interactive / automation usage

For CI, scripts, and automation, you can still supply all arguments directly on
the command line using `corpus-manager`:

```sh
IMAGE_URL='<direct image URL>'
DATASET='<dataset name>'
LICENSE_ID='<allow-listed license identifier>'
AUTHOR='<author or rights holder>'
SOURCE_URL='<source or attribution reference>'

uv run corpus-manager add "$IMAGE_URL" \
  --dataset "$DATASET" \
  --license "$LICENSE_ID" \
  --author "$AUTHOR" \
  --source "$SOURCE_URL" \
  --tags 'optional,comma,separated,tags'
```

The command derives an ID from the dataset and image filename. Pass `--id ID`
to choose an explicit ID. It rejects duplicate IDs and duplicate image hashes,
disallowed licenses, invalid image data, and downloads larger than 50 MiB. Each
download has a 30-second timeout. On success, it writes the metadata TOML and
stores the bytes in the local hash-addressed cache.

## Source image and cache policy

Source image files are never committed to this repository or re-hosted by the
project. The entry records the original image URL and source reference. Downloaded
bytes stay in the contributor's local cache; sharing an entry does not add or
copy the image into Git.

### Default cache directory

By default, downloaded images are stored in a platform-appropriate user cache
directory under an application-specific `img2num-bench` folder:

- **Linux and Docker**: `$XDG_CACHE_HOME/img2num-bench` (defaults to `~/.cache/img2num-bench` when `$XDG_CACHE_HOME` is unset or empty), matching the XDG Base Directory specification and the project's Linux Docker container workflow.
- **macOS**: `~/Library/Caches/img2num-bench`, following standard macOS application cache conventions.
- **Windows**: `%LOCALAPPDATA%\img2num-bench` (e.g. `C:\Users\<Username>\AppData\Local\img2num-bench`), falling back to `~/AppData/Local/img2num-bench` if `%LOCALAPPDATA%` is unset. Windows users are never directed to a Unix-style `~/.cache` directory.

Within the cache directory, images are named strictly by their hex-encoded SHA-256 digest (`<cache_root>/<sha256>`). This flat layout provides content addressing, deduplicates images across entries, and enables instant integrity verification.

### Environment variable override (`IMG2NUM_BENCH_CACHE`)

Set `IMG2NUM_BENCH_CACHE` to override the cache location on any platform. Tilde (`~`) is expanded to the user's home directory. Paths containing spaces are fully supported by quoting the value:

```sh
# Linux / macOS (bash / zsh)
IMG2NUM_BENCH_CACHE="/tmp/my benchmark cache" \
  uv run corpus-manager fetch
```

```powershell
# Windows (PowerShell)
$env:IMG2NUM_BENCH_CACHE = "C:\Users\Username\My Benchmark Cache"
uv run corpus-manager fetch
```

```cmd
:: Windows (Command Prompt)
set IMG2NUM_BENCH_CACHE=C:\Users\Username\My Benchmark Cache
uv run corpus-manager fetch
```

### Cache lifecycle and missing files

The cache can be deleted safely at any time because all image bytes can be re-fetched from their documented upstream URLs.

- If cached files are missing, running `python benchmarks/corpus_manager.py verify --hashes` detects the missing files and reports:
  ```text
  <entry>.toml: cache for entry '<entry-id>' is missing; run fetch first
  ```
- Running `python benchmarks/corpus_manager.py fetch` checks each entry, downloads only files missing from the local cache, verifies the downloaded bytes against the recorded SHA-256 digest, and atomically writes them into the cache directory (creating any missing parent directories automatically).

## License policy

The allow-list is:

- `CC0-1.0`
- `CC-BY-2.0`
- `CC-BY-4.0`
- `CC-BY-SA-2.0`
- `CC-BY-SA-4.0`
- `Public-Domain`

Licenses containing `ND` (NoDerivs) are rejected because the benchmark SVGs are
derivatives of their source images. NonCommercial (`NC`) licenses are not
included in the allow-list; ask the maintainer before relying on one. Any other
identifier is rejected until the allow-list is deliberately updated.

## Verification and CI

Run offline metadata checks with:

```sh
uv run corpus-manager verify
```

To fetch missing images and then verify the cached bytes and their hashes, run:

```sh
uv run corpus-manager fetch
uv run corpus-manager verify --hashes
```

CI runs the corpus tests and offline `verify` check. It restores the cache at
`~/.cache/img2num-bench` using a key derived from `benchmarks/**`. When at least
one image entry exists, CI runs `fetch` followed by `verify --hashes`; an empty
corpus does not trigger image downloads.

## Command reference & execution options

The benchmark suite registers CLI entry points in `pyproject.toml` under `[project.scripts]`:

| Command | Registered Target | Description |
| --- | --- | --- |
| `corpus-manager` | `benchmarks.corpus_manager:main` | Primary command for corpus operations |
| `corpus_manager` | `benchmarks.corpus_manager:main` | Alias using Python underscore convention |

### Supported subcommands & options

- **`uv run corpus-manager add [url] [options]`**:
  - `-i`, `--interactive`: Launch Vite-style interactive prompter (default when running `add` without positional arguments in an interactive terminal).
  - `--dataset <name>`: Dataset name (e.g. `COCO 2017 val`). Required in non-interactive mode.
  - `--license <id>`: Allow-listed license identifier (e.g. `CC0-1.0`, `CC-BY-4.0`). Required in non-interactive mode.
  - `--author <author>`: Author or rights holder. Required in non-interactive mode.
  - `--source <url>`: Attribution or source reference URL. Required in non-interactive mode.
  - `--tags <tag1,tag2>`: Optional comma-separated tags.
  - `--id <id>`: Explicit entry slug (derived automatically from dataset and filename if omitted).
  - `--corpus-dir <path>`: Custom corpus directory (default: `benchmarks`).
- **`uv run corpus-manager fetch [--corpus-dir <path>]`**:
  - Downloads missing image assets directly into the content-addressed cache and verifies their SHA-256 digests.
- **`uv run corpus-manager verify [--hashes] [--corpus-dir <path>]`**:
  - Verifies entry TOML schema, ID uniqueness, license allow-list, and URL formatting.
  - Pass `--hashes` to also verify that every cached image file exists and matches its expected SHA-256 digest.

### Direct Python module execution

Direct Python invocation remains fully supported for environments without `uv` or when invoking specific Python interpreters:

```sh
# Run as an executable module:
python -m benchmarks.corpus_manager <subcommand>

# Or run the script directly:
python benchmarks/corpus_manager.py <subcommand>
```
