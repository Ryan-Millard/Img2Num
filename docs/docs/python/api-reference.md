---
id: python-api-reference
title: Python API Reference
sidebar_position: 1
---

# Python API Reference

All functions are exposed via the `img2num` Python package. They accept NumPy arrays and automatically inject `width`/`height` from the array shape.

## `image_to_svg(image, *, width, height, config=None)`

Convert a raster image buffer into an SVG string.

**Parameters:**

| Name | Type | Description |
| :--- | :--- | :--- |
| `image` | `NDArray[np.uint8]` | Input image (H, W, C). |
| `width` | `int` | Image width (injected automatically from array shape). |
| `height` | `int` | Image height (injected automatically from array shape). |
| `config` | `ImageToSvgConfig` | Optional override of defaults. |

**Returns:** `str` — SVG markup.

```python
from img2num import image_to_svg

svg = image_to_svg(image, width=800, height=600)
```

## `bilateral_filter(image, sigma_spatial, sigma_range, color_space, *, width, height)`

Edge-preserving smoothing.

**Parameters:**

| Name | Type | Default |
| :--- | :--- | :--- |
| `image` | `NDArray[np.uint8]` | — |
| `sigma_spatial` | `float` | — |
| `sigma_range` | `float` | — |
| `color_space` | `int` | — |

**Returns:** `NDArray[np.uint8]` — Filtered image.

## `kmeans(data, k, max_iter, color_space, *, width, height)`

K-means color clustering.

**Parameters:**

| Name | Type | Default |
| :--- | :--- | :--- |
| `data` | `NDArray[np.uint8]` | — |
| `k` | `int` | — |
| `max_iter` | `int` | — |
| `color_space` | `int` | — |

**Returns:** `(NDArray[np.uint8], NDArray[np.int])` — `(clustered_data, labels)`

## `findContours(labels, min_area=100, *, width, height)`

Convert label map to vector paths.

**Parameters:**

| Name | Type | Default |
| :--- | :--- | :--- |
| `labels` | `NDArray[np.int]` | — |
| `min_area` | `int` | 100 |

**Returns:** `str` — SVG markup.
