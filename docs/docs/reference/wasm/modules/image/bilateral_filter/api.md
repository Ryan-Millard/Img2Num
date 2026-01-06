---
id: api
title: Bilateral Filter — API & Reference
sidebar_label: API / Usage
sidebar_position: 4
---

# Bilateral Filter — API & Reference

Quick reference for the function implemented in the header.

```cpp title="Applies a bilateral filter to an RGBA uint8_t* image (modified in-place)."
void bilateral_filter(uint8_t *image, size_t width, size_t height, double sigma_spatial, double sigma_range, uint8_t color_space)
```

:::important Alpha Channel Preservation
The alpha channel, `image[i + 3]`, is left untouched - it is not part of the bilateral filter implementation.
:::

## Parameters

| Parameter       | Type       | Description                                                                                                                                    |
| :-------------- | :--------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| `image`         | `uint8_t*` | Pointer to the RGBA image data (4 bytes per pixel). Modified in-place.                                                                         |
| `width`         | `size_t`   | Width of the image in pixels.                                                                                                                  |
| `height`        | `size_t`   | Height of the image in pixels.                                                                                                                 |
| `sigma_spatial` | `double`   | Spatial standard deviation ($\sigma_s$). Controls how far pixels influence each other spatially.                                               |
| `sigma_range`   | `double`   | Range standard deviation ($\sigma_r$). Controls how much color definition is preserved (edge preservation).                                    |
| `color_space`   | `uint8_t`  | Toggle color space to use for range distance (0 - CIELAB, 1 - RGB). CIELAB produces perceptually better results but requires more computation. |

:::info Implementation Details

- **Namespace**: `bilateral` (C++)
- **Export**: Exposed to WASM via `extern "C"` wrapper as `bilateral_filter`.
  :::
