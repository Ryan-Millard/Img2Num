"""Command-line interface for Img2Num.

Usage:
    img2num input.png -o output.svg          # single file
    img2num photos/*.jpg -o out/             # batch into a directory
    img2num photos/ -o out/                  # recurse into a directory
    img2num input.png                        # default: input.svg next to it
    img2num - < input.png > output.svg       # stdin/stdout
"""

import argparse
import glob
import io
import os
import os.path as pth
import sys

import numpy as np
from PIL import Image

import img2num

# Target image extensions (must be lowercase)
IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".tif", ".webp")
STDIO = "-"


def log(msg):
    # Status goes to stderr so stdout stays clean for SVG output
    print(msg, file=sys.stderr)


def fail(msg):
    log(f"img2num: error: {msg}")
    sys.exit(2)


def find_image_files(start_directory):
    image_paths = []
    for root, _dirs, files in os.walk(start_directory):
        for file in sorted(files):
            # Lowercase the filename to catch extensions like .PNG or .JPG
            if file.lower().endswith(IMAGE_EXTENSIONS):
                image_paths.append(pth.join(root, file))
    return sorted(image_paths)


def looks_like_folder(path):
    return (
        pth.isdir(path)
        or str(path).endswith(("/", "\\"))
        or pth.splitext(path)[1] == ""
    )


def expand_inputs(raw_inputs):
    """Turn CLI inputs into a list of (input_path, relative_output_stem) pairs.

    Directories are walked recursively and keep their sub-folder layout in the
    output directory. Glob patterns are expanded here too, for shells (e.g.
    Windows cmd/PowerShell) that don't expand them.
    """
    jobs = []
    for raw in raw_inputs:
        if pth.isdir(raw):
            for image_path in find_image_files(raw):
                rel = pth.relpath(image_path, raw)
                jobs.append((image_path, pth.splitext(rel)[0]))
            continue

        if pth.exists(raw):
            matches = [raw]
        elif glob.has_magic(raw):
            matches = sorted(glob.glob(raw, recursive=True))
            if not matches:
                fail(f"no files match '{raw}'")
        else:
            fail(f"'{raw}' does not exist")

        for path in matches:
            if pth.isfile(path):
                jobs.append((path, pth.splitext(pth.basename(path))[0]))
    return jobs


def convert(image_source, cfg):
    img = np.asarray(Image.open(image_source).convert("RGBA"))
    return img2num.image_to_svg(img, config=cfg)


def write_svg(svg, output_path):
    if output_path == STDIO:
        sys.stdout.write(svg)
        sys.stdout.flush()
        return
    parent = pth.dirname(output_path)
    if parent:
        os.makedirs(parent, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(svg)


def build_parser():
    parser = argparse.ArgumentParser(
        prog="img2num",
        description="Convert images to paint-by-number style SVGs with Img2Num.",
        epilog=(
            "examples:\n"
            "  img2num input.png -o output.svg\n"
            "  img2num photos/*.jpg -o out/\n"
            "  img2num input.png              (writes input.svg next to it)\n"
            "  img2num - < input.png > output.svg"
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "inputs", nargs="+", metavar="INPUT",
        help="image file(s), director(ies), glob pattern(s), or '-' for stdin",
    )
    parser.add_argument(
        "--output", "-o", default=None,
        help="output .svg file, output directory, or '-' for stdout "
             "(default: <input>.svg next to each input; stdout when reading stdin)",
    )
    # color space option
    parser.add_argument("--color-space", "-c", default=0, type=int, choices=(0, 1),
                        help="0 indicates CIELAB, 1 indicates RGB color space")
    # bilateral filter options
    parser.add_argument("--sigma-range", "-sr", default=50.0, type=float,
                        help="bilateral filter sigma range (color)")
    parser.add_argument("--sigma-spatial", "-ss", default=3.0, type=float,
                        help="bilateral filter sigma spatial")
    # kmeans options
    parser.add_argument("--k", "-k", default=16, type=int,
                        help="number of unique colors")
    parser.add_argument("--max-iter", default=100, type=int,
                        help="number of kmeans iterations")
    # cluster options
    parser.add_argument("--min-cluster-area", "-area", default=100, type=int,
                        help="smallest cluster area")
    parser.add_argument("--min-thickness", "-thick", default=10, type=int,
                        help="smallest cluster thickness")
    # other options
    parser.add_argument("--overwrite", "-f", action="store_true",
                        help="overwrite existing SVG files")
    parser.add_argument("--quiet", "-q", action="store_true",
                        help="suppress progress messages")
    return parser


def plan_jobs(args):
    """Resolve inputs + --output into a list of (source, output_path) pairs."""
    output = args.output

    # stdin mode: '-' must be the only input
    if STDIO in args.inputs:
        if len(args.inputs) > 1:
            fail("'-' (stdin) cannot be combined with other inputs")
        if output is not None and output != STDIO and looks_like_folder(output):
            fail("when reading from stdin, --output must be a file or '-'")
        return [(STDIO, output or STDIO)]

    jobs = expand_inputs(args.inputs)
    if not jobs:
        fail("no image files found")

    single_file = (
        len(args.inputs) == 1 and pth.isfile(args.inputs[0]) and len(jobs) == 1
    )

    # No --output: write next to each input
    if output is None:
        return [(src, pth.splitext(src)[0] + ".svg") for src, _ in jobs]

    if output == STDIO:
        if not single_file:
            fail("--output '-' (stdout) only works with a single input")
        return [(jobs[0][0], STDIO)]

    if single_file and not looks_like_folder(output):
        return [(jobs[0][0], output)]

    if not looks_like_folder(output) or (pth.exists(output) and not pth.isdir(output)):
        fail(f"multiple inputs require --output to be a directory, got '{output}'")

    planned = [(src, pth.join(output, stem + ".svg")) for src, stem in jobs]

    # Different inputs (e.g. a.jpg and a.png) could map to the same SVG
    seen = {}
    for src, out in planned:
        key = pth.normcase(pth.abspath(out))
        if key in seen:
            fail(f"'{seen[key]}' and '{src}' would both be written to '{out}'")
        seen[key] = src
    return planned


def main(argv=None):
    args = build_parser().parse_args(argv)
    say = (lambda _msg: None) if args.quiet else log

    cfg = img2num.ImageToSvgConfig(
        bilateral_filter={
            "sigma_range": args.sigma_range,
            "sigma_spatial": args.sigma_spatial,
        },
        kmeans={"k": args.k, "max_iter": args.max_iter},
        color_space=args.color_space,
        min_cluster_area=args.min_cluster_area,
        min_thickness=args.min_thickness,
    )

    jobs = plan_jobs(args)
    failures = 0
    for i, (src, out) in enumerate(jobs, 1):
        progress = f"[{i}/{len(jobs)}] " if len(jobs) > 1 else ""
        label = "<stdin>" if src == STDIO else src
        if out != STDIO and pth.exists(out) and not args.overwrite:
            say(f"{progress}{out} already exists, skipping (use --overwrite to replace)")
            continue
        try:
            source = io.BytesIO(sys.stdin.buffer.read()) if src == STDIO else src
            svg = convert(source, cfg)
            write_svg(svg, out)
        except KeyboardInterrupt:
            log("interrupted")
            return 130
        except Exception as e:  # keep going in batch mode
            failures += 1
            log(f"{progress}failed: {label}: {e}")
            continue
        if out != STDIO:
            say(f"{progress}{label} -> {out}")

    if failures:
        log(f"{failures} of {len(jobs)} conversion(s) failed")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
