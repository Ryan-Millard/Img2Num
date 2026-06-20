---
id: cpp-api-reference
title: C++ API Reference
sidebar_position: 1
---

# C++ API Reference

The C++ API lives in the `img2num` namespace and is declared in `img2num.h`.

## `image_to_svg`

```cpp
#include <img2num.h>

std::string result = img2num::image_to_svg(
    data,       // uint8_t* — image buffer (H×W×4, RGBA)
    width,      // int
    height,     // int
    config      // img2num::ImageToSvgConfig
);
```

### ImageToSvgConfig

| Member                           | Default | Description                               |
| :------------------------------- | :------ | :---------------------------------------- |
| `bilateral_filter.sigma_spatial` | 3.0     | Spatial smoothing distance                |
| `bilateral_filter.sigma_range`   | 50.0    | Color intensity smoothing                 |
| `kmeans.k`                       | 16      | Number of colors                          |
| `kmeans.max_iter`                | 100     | K-means iterations                        |
| `min_cluster_area`               | 100     | Minimum contour area (px)                 |
| `min_thickness`                  | 0       | Minimum region thickness (px); 0 disables |
| `color_space`                    | 0       | 0 = CIE LAB, 1 = sRGB                     |

## `gaussian_blur_fft`

```cpp
void img2num::gaussian_blur_fft(uint8_t* image, size_t width, size_t height, double sigma);
```

Applies a Gaussian blur using a 2-D FFT. Modifies `image` in-place.

## `invert_image`

```cpp
void img2num::invert_image(uint8_t* ptr, int width, int height);
```

Inverts pixel values in-place.

## `threshold_image`

```cpp
void img2num::threshold_image(uint8_t* ptr, int width, int height, int num_thresholds);
```

Reduces the image to `num_thresholds` discrete intensity levels.

## `black_threshold_image`

```cpp
void img2num::black_threshold_image(uint8_t* ptr, int width, int height, int num_thresholds);
```

Like `threshold_image`, but biased toward darker output.

## `kmeans`

```cpp
void img2num::kmeans(
    const uint8_t* data,
    uint8_t* out_data,
    int32_t* out_labels,
    int32_t width,
    int32_t height,
    int32_t k,
    int32_t max_iter,
    uint8_t color_space
);
```

Fills `out_data` with clustered pixel values and `out_labels` with per-pixel cluster indices.

## `bilateral_filter`

```cpp
void img2num::bilateral_filter(
    uint8_t* image,
    size_t width,
    size_t height,
    double sigma_spatial,
    double sigma_range,
    uint8_t color_space
);
```

Edge-preserving smoothing applied in-place.

## `labels_to_svg`

```cpp
std::string img2num::labels_to_svg(
    const uint8_t* data,
    const int32_t* labels,
    int width,
    int height,
    int min_area,
    int min_thickness
);
```

Converts a labeled region map into SVG markup.
