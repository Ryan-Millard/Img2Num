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

:::tip Color Space Discrepancies
As noted on the
[Color Space Selection page](../color-spaces/#why-the-scaling-factor-exists-and-why-418-works),
the bilateral filter will produce **different results** depending on the selected
`color_space`, even with identical parameters.

To achieve **visually equivalent filtering behavior** between CIELAB and RGB,
treat CIELAB as the reference space and scale `sigma_range` for RGB:

$$
\sigma_{\text{range, RGB}} \approx 4.18 \times \sigma_{\text{range, CIELAB}}
$$

> The factor **4.18** is empirically derived for natural images and equalizes bilateral
> range weights across color spaces. Any value in the range **[4.1, 4.3]** will typically
> produce comparable results. This is a recommended default, not a universal constant.
> :::
