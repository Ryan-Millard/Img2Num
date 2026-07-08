# Img2Num Python Bindings

URL: https://img2num.dev/docs/internal/bindings/py

The **Img2Num Python Bindings** provide a Python interface to the core Img2Num image processing library via pybind11. These bindings wrap the underlying C++ functions, exposing high-performance image processing operations to Python projects.

## Overview

The bindings wrap the underlying C++ functions (from`core/` ) using pybind11 and operate on `numpy.ndarray` buffers. They provide access to key image processing operations such as filtering, clustering, and SVG conversion.

## Key Functions

- `gaussian_blur_fft` — Apply FFT-based Gaussian blur
- `invert_image` — Invert pixel values in an image
- `threshold_image` — Apply thresholding to an image
- `black_threshold_image` — Apply black-thresholding
- `kmeans` — Perform k-means clustering on image pixels
- `bilateral_filter` — Apply bilateral filtering
- `labels_to_svg` — Convert labeled image to SVG
- `image_to_svg` — Convert image to SVG with configurable parameters
Each function is fully documented with Doxygen and mirrors the corresponding C++ function in `core/img2num.h` .

## Building the Python Bindings

Run this in the root of the project

```bash
cmake -B build .
cmake --build build
cmake --install build
```

> `cmake --install build` might need elevated permissions, but that shouldn't be a problem in the Docker container.

- The compiled `_img2num` module is installed under `img2num/` .
- Ensure that the core `Img2Num` library is built and accessible.

## Usage Example

:::important Proper Examples See the [`example-apps/`](https://github.com/Ryan-Millard/Img2Num/tree/main/example-apps/) folder for the most up-to-date usage examples. :::

Applying basic image processing operations using the Python API

```python
import numpy as np
from img2num import (
    gaussian_blur_fft,
    invert_image,
    threshold_image,
    image_to_svg,
)

# Load image as uint8 numpy array (H, W, C)
image = np.zeros((256, 256, 3), dtype=np.uint8)

# Apply Gaussian blur
blurred = gaussian_blur_fft(image, sigma=1.5)

# Invert colors
inverted = invert_image(blurred)

# Threshold
thresholded = threshold_image(inverted, num_thresholds=4)

# SVG conversion
svg_str = image_to_svg(thresholded)
```

## Documentation

The Doxygen documentation provides detailed descriptions of all functions, their parameters, and usage examples. Refer to thegenerated docs for guidance on integrating the bindings into internal projects.
