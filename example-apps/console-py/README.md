# Img2Num Python console example

A small command-line app that converts an image to SVG with the
[`img2num`](https://pypi.org/project/img2num/) Python package. It runs the
conversion twice, in two worker threads: once stage by stage, saving each
intermediate result, and once with the single-call `image_to_svg` API.

## Running it

### In the development container

Open a shell in the [Docker development container](https://img2num.dev/docs/contributing/img2num-docker-script/)
from the repository root (`.\img2num.ps1 sh` in PowerShell or
`.\img2num.bat sh` in CMD on Windows):

```bash
./img2num sh
```

Inside the container, build and install the Python package, then run the
example:

```bash
just py build
just console-py <path-to-image>
```

The `console-py` recipe installs `opencv-python` into the environment and runs
`example-apps/console-py/main.py`.

### With uv

The example is a member of the repository's uv workspace and exposes a `dev`
script (`main:main`). CI runs it from the repository root with:

```bash
uv run --package console-py dev <path-to-image>
```

`console-py` does not list `img2num` as a dependency, so the package must
already be built and installed in the environment, for example with
`just py build` or `uv sync` (which is what CI runs first).

## What the script does

1. Reads the image with `cv2.imread` (exiting with an error if it cannot be
   read), converts it to RGBA (see [RGBA input](#rgba-input)), then creates
   and prints the config for the single-call API:

   ```python
   cfg = img2num.ImageToSvgConfig(kmeans={"k": 64}, min_thickness=10)
   ```

2. Submits two functions to a `ThreadPoolExecutor` with two workers, both
   reading the same `img`:

   - `step_by_step(img)` runs each stage separately:
     1. `bilateral_filter(img, 3, 50, 0)` smooths the image while preserving
        edges (`sigma_spatial`, `sigma_range`, `color_space`; `0` is CIE LAB).
     2. `kmeans(img_bf, 64, 100, 0)` quantizes the filtered image into 64
        clusters (`k`, `max_iter`, `color_space`). It returns the quantized
        image and a `(height, width)` `int32` label map.
     3. `labels_to_svg(img, labels, 100, 10)` merges regions smaller than
        `min_area` or thinner than `min_thickness` and traces them into an
        SVG string. Each region is filled with the average color of its
        pixels in the first argument, which here is the original `img`.
   - `combined_process(img, cfg)` calls `image_to_svg(img, config=cfg)`,
     which performs the same three stages internally, also passing the
     original image to `labels_to_svg`.

3. Waits for both results with `.result()`, then writes the four
   [output files](#output).

`ImageToSvgConfig` accepts `bilateral_filter` (`sigma_spatial`,
`sigma_range`) and `kmeans` (`k`, `max_iter`) as dicts, plus
`min_cluster_area`, `min_thickness` and `color_space` as keyword arguments.
Anything left out keeps its default, and here those defaults
(`sigma_spatial=3.0`, `sigma_range=50.0`, `max_iter=100`,
`min_cluster_area=100`, `color_space=0`) match the arguments used by
`step_by_step`.

The functions return new arrays (or strings) and do not modify their inputs.
Image width and height are read from the array's shape.

K-Means picks its initial centroids randomly, with no fixed seed, so
`kmeans_image.png`, `result.svg` and `result2.svg` can differ between runs, and
`result.svg` and `result2.svg` are generally not identical.

### Threads

Each `img2num` processing function releases the GIL while its native code
runs, but the bindings also hold a single lock around each native call, so the
two workers overlap only in Python code: the native calls themselves still run
one at a time.

If either worker raises an exception, `.result()` re-raises it in the main
thread. The output files are written only after both workers finish, so in
that case no new output files are written (the `console-py_outputs/`
directory is created before processing starts).

## Output

Results are written to `console-py_outputs/` in the current working directory
(the repository root with the commands above). The directory is listed in the
repository's `.gitignore`.

| File | Contents |
| --- | --- |
| `bilateral_image.png` | Output of `bilateral_filter` |
| `kmeans_image.png` | Quantized image from `kmeans` |
| `result.svg` | SVG from `step_by_step` (`labels_to_svg`) |
| `result2.svg` | SVG from `combined_process` (`image_to_svg`) |

## RGBA input

Img2Num expects a `uint8` array of shape `(height, width, 4)` with channels in
RGBA order. The channel count is not checked: the native code always assumes
4 bytes per pixel, so with a 3-channel array it reads past the end of the
input (and `bilateral_filter` and `kmeans` also write past the end of the
array they return). This is undefined behavior and can crash the process.

`cv2.imread` returns a 3-channel image in BGR order (any alpha channel in the
file is dropped), so the script converts it first:

```python
img = cv2.cvtColor(img, cv2.COLOR_BGR2RGBA)
```

This swaps the red and blue channels and adds an opaque alpha channel. Because
`cv2.imwrite` expects BGR, the intermediate images are converted back with
`cv2.COLOR_RGBA2BGR` before they are saved.

## Dependencies

The example's [`pyproject.toml`](./pyproject.toml) depends on `numpy` and
`opencv-python`. OpenCV is used only to read the input image, convert between
BGR and RGBA, and write the PNG outputs. The `img2num` package itself has a
single runtime dependency, `numpy>=1.23.5` (see the repository's root
`pyproject.toml`), so any library that produces an RGBA `uint8` NumPy array
can be used instead.
