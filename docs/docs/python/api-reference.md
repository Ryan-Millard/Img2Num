---
id: python-api-reference
title: Python API Reference
sidebar_position: 1
---

# Python API Reference

All functions are exposed via the `img2num` Python package. They accept NumPy
arrays and **automatically inject `width`/`height` from the array shape** — you
do not pass these yourself.

:::important Input images must be RGBA
The core library operates on 4-channel RGBA buffers. Convert your image before
calling any function, e.g. with OpenCV:

```python
import cv2

img = cv2.imread("input.png")
img = cv2.cvtColor(img, cv2.COLOR_BGR2RGBA)  # VERY IMPORTANT
```

:::

## `image_to_svg(image, *, config=None)`

Full raster → SVG pipeline (bilateral filter → k-means → contour tracing).

**Parameters:**

| Name     | Type                | Description                                       |
| :------- | :------------------ | :------------------------------------------------ |
| `image`  | `NDArray[np.uint8]` | Input image of shape `(H, W, 4)` (RGBA).          |
| `config` | `ImageToSvgConfig`  | Optional configuration. Defaults are used if omitted. |

**Returns:** `str` — SVG markup.

```python
from img2num import image_to_svg, ImageToSvgConfig

svg = image_to_svg(img)

# Or with an explicit config:
cfg = ImageToSvgConfig(kmeans={"k": 16})
svg = image_to_svg(img, config=cfg)
```

## `bilateral_filter(image, sigma_spatial, sigma_range, color_space)`

Edge-preserving smoothing.

**Parameters:**

| Name            | Type                | Description                                          |
| :-------------- | :------------------ | :--------------------------------------------------- |
| `image`         | `NDArray[np.uint8]` | Input RGBA image.                                    |
| `sigma_spatial` | `float`             | Spatial Gaussian standard deviation (proximity).    |
| `sigma_range`   | `float`             | Range Gaussian standard deviation (color similarity).|
| `color_space`   | `int`               | `0` = CIE LAB, `1` = sRGB.                           |

**Returns:** `NDArray[np.uint8]` — Filtered image.

```python
from img2num import bilateral_filter

filtered = bilateral_filter(img, 3, 50, 0)
```

## `kmeans(data, k, max_iter, color_space)`

K-means color clustering.

**Parameters:**

| Name          | Type                | Description                          |
| :------------ | :------------------ | :----------------------------------- |
| `data`        | `NDArray[np.uint8]` | Input RGBA image.                    |
| `k`           | `int`               | Number of clusters (colors).         |
| `max_iter`    | `int`               | Maximum k-means iterations.          |
| `color_space` | `int`               | `0` = CIE LAB, `1` = sRGB.           |

**Returns:** `tuple[NDArray[np.uint8], NDArray[np.int32]]` — `(clustered_data, labels)`.

```python
from img2num import kmeans

clustered, labels = kmeans(img, 16, 100, 0)
```

## `labels_to_svg(data, labels, min_area)`

Convert a label map into vector paths.

**Parameters:**

| Name       | Type                | Description                              |
| :--------- | :------------------ | :--------------------------------------- |
| `data`     | `NDArray[np.uint8]` | Input RGBA image.                        |
| `labels`   | `NDArray[np.int32]` | Per-pixel cluster labels (from `kmeans`).|
| `min_area` | `int`               | Minimum region area (px) to include.     |

**Returns:** `str` — SVG markup.

```python
from img2num import kmeans, labels_to_svg

_, labels = kmeans(img, 16, 100, 0)
svg = labels_to_svg(img, labels, 100)
```

## `gaussian_blur_fft(image, sigma)`

Apply a Gaussian blur via FFT.

**Parameters:**

| Name    | Type                | Description                            |
| :------ | :------------------ | :------------------------------------- |
| `image` | `NDArray[np.uint8]` | Input RGBA image.                      |
| `sigma` | `float`             | Standard deviation of the Gaussian.    |

**Returns:** `NDArray[np.uint8]` — Blurred image.

## `invert_image(image)`

Invert pixel values.

**Parameters:**

| Name    | Type                | Description       |
| :------ | :------------------ | :---------------- |
| `image` | `NDArray[np.uint8]` | Input RGBA image. |

**Returns:** `NDArray[np.uint8]` — Inverted image.

## `threshold_image(image, num_thresholds)`

Reduce the image to `num_thresholds` discrete intensity levels.

**Parameters:**

| Name             | Type                | Description                  |
| :--------------- | :------------------ | :--------------------------- |
| `image`          | `NDArray[np.uint8]` | Input RGBA image.            |
| `num_thresholds` | `int`               | Number of threshold levels.  |

**Returns:** `NDArray[np.uint8]` — Thresholded image.

## `black_threshold_image(image, num_thresholds)`

Like `threshold_image`, but biased toward darker output.

**Parameters:**

| Name             | Type                | Description                  |
| :--------------- | :------------------ | :--------------------------- |
| `image`          | `NDArray[np.uint8]` | Input RGBA image.            |
| `num_thresholds` | `int`               | Number of threshold levels.  |

**Returns:** `NDArray[np.uint8]` — Thresholded image.

## `ImageToSvgConfig`

Configuration object passed to `image_to_svg`. All parameters have sensible
defaults and can be set via constructor or attribute assignment.

| Attribute                        | Type    | Default | Description                  |
| :------------------------------- | :------ | :------ | :--------------------------- |
| `bilateral_filter.sigma_spatial` | `float` | `3.0`   | Bilateral spatial sigma.     |
| `bilateral_filter.sigma_range`   | `float` | `50.0`  | Bilateral range sigma.       |
| `kmeans.k`                       | `int`   | `16`    | Number of clusters.          |
| `kmeans.max_iter`                | `int`   | `100`   | Maximum k-means iterations.  |
| `min_cluster_area`               | `int`   | `100`   | Minimum region area (px).    |
| `color_space`                    | `int`   | `0`     | `0` = CIE LAB, `1` = sRGB.   |

```python
from img2num import ImageToSvgConfig

# Construct with nested dicts...
cfg = ImageToSvgConfig(
    bilateral_filter={"sigma_spatial": 3.0, "sigma_range": 50.0},
    kmeans={"k": 32},
    min_cluster_area=50,
    color_space=0,
)

# ...or set attributes directly:
cfg.kmeans.k = 32
cfg.min_cluster_area = 50
```
