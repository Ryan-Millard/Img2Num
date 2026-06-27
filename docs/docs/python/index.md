---
title: Img2Num Python
sidebar_label: Python
sidebar_position: 10
---

# Python Binding

The Python binding provides NumPy-backed wrappers around the Img2Num core
library. Under the hood it is a native [pybind11](https://pybind11.readthedocs.io/)
extension that calls directly into the C++ `img2num` library — there is no WASM
involved.

## Requirements

- Python ≥ 3.7
- NumPy

## Installation

:::warning[Not yet on PyPI]
The Python package has not had its first release yet, so `pip install img2num`
is not available. Build the wheel from source instead.
:::

Build the wheel with the [Justfile](/docs/contributing/quickstart) (inside the Docker dev
environment):

```bash
just build py
```

This produces a wheel in `dist/` that you can install into your environment:

```bash
pip install dist/img2num-*.whl
```

Once the first release is published, installation will simply be:

```bash
pip install img2num
```

## Usage

Input images must be **RGBA** (4 channels). `width`/`height` are inferred from
the array shape automatically — you don't pass them.

```python
import cv2
from img2num import image_to_svg

# Load and convert to RGBA (img2num requires 4 channels)
img = cv2.imread("input.png")
img = cv2.cvtColor(img, cv2.COLOR_BGR2RGBA)  # VERY IMPORTANT

svg = image_to_svg(img)
print(svg)
```

## Available Functions

| Function                | Description                          |
| :---------------------- | :----------------------------------- |
| `image_to_svg`          | Full raster → SVG pipeline           |
| `bilateral_filter`      | Edge-preserving smoothing            |
| `kmeans`                | Color clustering                     |
| `labels_to_svg`         | Convert a label map to SVG paths     |
| `gaussian_blur_fft`     | FFT-based Gaussian blur              |
| `invert_image`          | Invert pixel values                  |
| `threshold_image`       | Posterize to N intensity levels      |
| `black_threshold_image` | Posterize, biased toward dark output |

See the [Python API Reference](/docs/python/python-api-reference) for full
signatures.

## Configuration

Override defaults by passing an `ImageToSvgConfig` object:

```python
from img2num import ImageToSvgConfig

config = ImageToSvgConfig()
config.kmeans.k = 32          # More colors
config.min_cluster_area = 50  # Less filtering

svg = image_to_svg(img, config=config)
```
