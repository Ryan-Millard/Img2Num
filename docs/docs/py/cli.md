---
title: Img2Num CLI
sidebar_label: Command-line tool
sidebar_position: 2
---

# Command-line tool

The `img2num` command converts image files or folders into SVGs without requiring
you to write Python code. It is included in the Img2Num Python package.

## Installation

With Python 3.10 or newer, install the package with its optional CLI dependencies:

```bash title="Install the CLI"
pip install "img2num[cli]"
```

The `[cli]` extra installs Pillow for decoding images. The plain
`pip install img2num` command remains sufficient for using the Python library,
but does not install this extra dependency. Keep the quotes around
`img2num[cli]` so shells do not interpret the brackets as a glob pattern.

```sh title="Show available options"
img2num --help
```

:::note[Not the Docker development helper]

The installed `img2num` command converts images. The repository's `./img2num`,
`.\img2num.bat`, and `.\img2num.ps1` scripts are separate
[Docker development helpers](../contributing/img2num-docker-script.md).

:::

## Usage

### Single image

```sh
img2num input.png -o output.svg
```

Omit `-o` to write an SVG next to the input with the same filename stem:

```sh
img2num input.png
```

This writes `input.svg`. Existing output files are skipped unless you use
`--overwrite`.

### Folders and batches

```sh
img2num photos/ -o out/
img2num "photos/*.jpg" -o out/
img2num first.png second.jpg -o out/
```

Folder inputs are scanned recursively for PNG, JPEG, GIF, BMP, TIFF, and WebP
images. When converting a folder into an output directory, its subdirectory
structure is preserved. Output directories are created as needed.

Glob patterns are expanded by the CLI, including in Windows CMD and PowerShell.
For multiple inputs, `-o` must name a directory, not a single SVG file. Without
`-o`, each SVG is written next to its input image.

### Standard input and output

Use `-` as the only input to read an image from standard input. The output then
defaults to standard output. Use `-o -` to send a single image's SVG to standard
output instead of saving it directly to a file:

```bash title="Bash or Windows CMD"
img2num - < input.png > output.svg
img2num input.png -o - > output.svg
```

The input redirection syntax (`<`) above is not supported by PowerShell.
CLI progress messages go to standard error. Standard output cannot be used for
batch conversion.

### Configure conversion

```sh
img2num input.png -o output.svg --k 12 --min-cluster-area 50 --color-space 1
```

This uses 12 colors, a minimum cluster area of 50 pixels, and RGB color space.

## Options

Conversion options map to the fields of `ImageToSvgConfig`:

| Option                        | Default | Configuration field              | Description                     |
| ----------------------------- | ------- | -------------------------------- | ------------------------------- |
| `--color-space`, `-c`         | `0`     | `color_space`                    | `0` for CIELAB, `1` for RGB.    |
| `--sigma-range`, `-sr`        | `50.0`  | `bilateral_filter.sigma_range`   | Bilateral filter color sigma.   |
| `--sigma-spatial`, `-ss`      | `3.0`   | `bilateral_filter.sigma_spatial` | Bilateral filter spatial sigma. |
| `--k`, `-k`                   | `16`    | `kmeans.k`                       | Number of unique colors.        |
| `--max-iter`                  | `100`   | `kmeans.max_iter`                | Number of K-Means iterations.   |
| `--min-cluster-area`, `-area` | `100`   | `min_cluster_area`               | Minimum cluster area in pixels. |
| `--min-thickness`, `-thick`   | `10`    | `min_thickness`                  | Minimum cluster thickness.      |

Other options control input/output and progress:

| Option              | Default                              | Description                                             |
| ------------------- | ------------------------------------ | ------------------------------------------------------- |
| `--output`, `-o`    | Next to each input; stdout for stdin | Output SVG file, directory, or `-` for standard output. |
| `--overwrite`, `-f` | Off                                  | Replace existing SVG files instead of skipping them.    |
| `--quiet`, `-q`     | Off                                  | Suppress progress messages.                             |
| `--jobs`, `-j`      | `8`                                  | Number of concurrent jobs; use a positive integer.      |
| `--help`, `-h`      | —                                    | Show the help message and exit.                         |

## Troubleshooting

If Pillow is missing, the CLI displays:

```text
The img2num CLI requires extra dependencies.
Install them with: pip install 'img2num[cli]'
```

Install the extra in the same Python environment as the `img2num` command:

```sh
pip install "img2num[cli]"
```

To replace an existing SVG that would otherwise be skipped, pass `--overwrite`:

```sh
img2num input.png -o output.svg --overwrite
```
