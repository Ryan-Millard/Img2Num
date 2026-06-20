---
id: c-api-reference
title: C API Reference
sidebar_position: 1
---

# C API Reference

The C API is declared in `cimg2num.h` and uses the `img2num_` prefix for all symbols.

## Types

### `img2num_ImageToSvgConfig`

```c
typedef struct img2num_ImageToSvgConfig {
    struct {
        double sigma_spatial;
        double sigma_range;
    } bilateral_filter;

    struct {
        int32_t k;
        int32_t max_iter;
    } kmeans;

    int min_cluster_area;
    int min_thickness;
    uint8_t color_space;
} img2num_ImageToSvgConfig;
```

### `img2num_ImageToSvgConfig_default()`

Returns a config struct with all default values.

## Functions

### `img2num_gaussian_blur_fft`

```c
void img2num_gaussian_blur_fft(uint8_t *image, size_t width, size_t height, double sigma);
```

Applies a Gaussian blur using FFT.

### `img2num_invert_image`

```c
void img2num_invert_image(uint8_t *ptr, int width, int height);
```

Inverts pixel values in-place.

### `img2num_threshold_image`

```c
void img2num_threshold_image(uint8_t *ptr, int width, int height, int num_thresholds);
```

Reduces the image to `num_thresholds` discrete levels.

### `img2num_black_threshold_image`

```c
void img2num_black_threshold_image(uint8_t *ptr, int width, int height, int num_thresholds);
```

Bias-weighted thresholding toward darker output.

### `img2num_kmeans`

```c
void img2num_kmeans(
    const uint8_t *data,
    uint8_t *out_data,
    int32_t *out_labels,
    int32_t width,
    int32_t height,
    int32_t k,
    int32_t max_iter,
    uint8_t color_space
);
```

K-means color clustering.

### `img2num_bilateral_filter`

```c
void img2num_bilateral_filter(
    uint8_t *image,
    size_t width,
    size_t height,
    double sigma_spatial,
    double sigma_range,
    uint8_t color_space
);
```

Edge-preserving bilateral smoothing.

### `img2num_labels_to_svg`

```c
char *img2num_labels_to_svg(
    const uint8_t *data,
    const int32_t *labels,
    int width,
    int height,
    int min_area,
    int min_thickness
);
```

Converts a labeled region map to SVG. Caller is responsible for `free()`ing the result.

### `img2num_image_to_svg`

```c
char *img2num_image_to_svg(
    const uint8_t *data,
    int width,
    int height,
    const img2num_ImageToSvgConfig *config
);
```

Full raster-to-SVG pipeline. Caller is responsible for `free()`ing the result.
