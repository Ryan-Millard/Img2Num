---
title: Img2Num Python
sidebar_label: Python
sidebar_position: 5
---

# Python Binding

The Python binding provides NumPy-backed wrappers around the Img2Num core library.

## Requirements

- Python ≥ 3.7
- NumPy
- WASM runtime (automatically installed with the package)

## Installation

```bash
pip install img2num
```

## Usage

```python
import numpy as np
from img2num import image_to_svg

# Assuming `image` is a NumPy array of shape (H, W, C)
svg = image_to_svg(image, width=800, height=600)
print(svg)
```

## Available Functions

| Function | Description |
| :--- | :--- |
| `image_to_svg` | Full raster → SVG pipeline |
| `bilateral_filter` | Edge-preserving smoothing |
| `kmeans` | Color clustering |
| `findContours` | Contour detection |

## Configuration

Override defaults by passing an `ImageToSvgConfig` object:

```python
from img2num import ImageToSvgConfig

config = ImageToSvgConfig()
config.kmeans.k = 32  # More colors
config.min_cluster_area = 50  # Less filtering

svg = image_to_svg(image, width=800, height=600, config=config)
```
