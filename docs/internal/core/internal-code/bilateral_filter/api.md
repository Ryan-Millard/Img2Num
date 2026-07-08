# Bilateral Filter — API & Reference

URL: https://img2num.dev/docs/internal/core/internal-code/bilateral_filter/api

Quick reference for the function implemented in the header.

Applies a bilateral filter to an RGBA uint8_t* image (modified in-place).

```cpp
void bilateral_filter(uint8_t *image, size_t width, size_t height, double sigma_spatial, double sigma_range, uint8_t color_space)
```

:::important Alpha Channel Preservation The alpha channel, `image[i + 3]` , is left untouched - it is not part of the bilateral filter implementation. :::

## Parameters

| Parameter | Type | Description | `image` | `uint8_t*` | Pointer to the RGBA image data (4 bytes per pixel). Modified in-place. | `width` | `size_t` | Width of the image in pixels. | `height` | `size_t` | Height of the image in pixels. | `sigma_spatial` | `double` | Spatial standard deviation ( σ s \sigma_s σ s ). Controls how far pixels influence each other spatially. | `sigma_range` | `double` | Range standard deviation ( σ r \sigma_r σ r ). Controls how much color definition is preserved (edge preservation). | `color_space` | `uint8_t` | Toggle color space to use for range distance (0 - CIELAB, 1 - RGB). CIELAB produces perceptually better results but requires more computation. 

:::info Implementation Details

- **Namespace** : `bilateral` (C++)
- **Export** : Exposed to WASM via `extern "C"` wrapper as `bilateral_filter` . :::
:::tip Color Space Discrepancies As noted on the [Color Space Selection page](/docs/internal/core/internal-code/bilateral_filter/color-spaces/#why-the-scaling-factor-exists-and-why-418-works) , the bilateral filter will produce **different results** depending on the selected `color_space` , even with identical parameters.

To achieve **visually equivalent filtering behavior** between CIELAB and RGB, treat CIELAB as the reference space and scale `sigma_range` for RGB:

σ range, RGB ≈ 4.18 × σ range, CIELAB \sigma_{\text{range, RGB}} \approx 4.18 \times \sigma_{\text{range, CIELAB}} σ range, RGB≈ 4.18× σ range, CIELAB
> The factor **4.18** is empirically derived for natural images and equalizes bilateral range weights across color spaces. Any value in the range **[4.1, 4.3]** will typically produce comparable results. This is a recommended default, not a universal constant. :::
