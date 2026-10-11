# Benchmark corpus

The benchmark corpus records metadata for source images used by the benchmark
suite. It keeps the source files out of the repository and gives each image a
stable identity and SHA-256 digest so contributors and CI can retrieve and
verify the same bytes.

## Directory layout

```text
benchmarks/
├── README.md
├── corpus.toml          # Corpus schema version and shared configuration
└── images/
    ├── .gitkeep
    └── <id>.toml         # One metadata entry per image
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

From the repository root, set the metadata values you have verified and run
`add`:

```sh
IMAGE_URL='<direct image URL>'
DATASET='<dataset name>'
LICENSE_ID='<allow-listed license identifier>'
AUTHOR='<author or rights holder>'
SOURCE_URL='<source or attribution reference>'

uv run --group dev python scripts/corpus_manager.py add "$IMAGE_URL" \
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

The default cache location is
`~/.cache/img2num-bench/<sha256>`. Set `IMG2NUM_BENCH_CACHE` to use a different
cache root, for example when testing:

```sh
IMG2NUM_BENCH_CACHE=/tmp/img2num-bench-cache \
  uv run --group dev python scripts/corpus_manager.py fetch
```

`fetch` downloads only entries whose hash-addressed cache file is missing. It
checks each download against the entry's SHA-256 before atomically placing it in
the cache. A mismatch or unreachable URL is reported as an error.

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
uv run --group dev python scripts/corpus_manager.py verify
```

To fetch missing images and then verify the cached bytes and their hashes, run:

```sh
uv run --group dev python scripts/corpus_manager.py fetch
uv run --group dev python scripts/corpus_manager.py verify --hashes
```

CI runs the corpus tests and offline `verify` check. It restores the cache at
`~/.cache/img2num-bench` using a key derived from `benchmarks/**`. When at least
one image entry exists, CI runs `fetch` followed by `verify --hashes`; an empty
corpus does not trigger image downloads.
