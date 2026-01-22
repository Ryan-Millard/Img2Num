---
id: cielab-api
title: CIELAB Color Space API
sidebar_label: API Reference
sidebar_position: 2
---

# CIELAB Color Space Conversion API

## Overview

The CIELAB module provides bidirectional conversion between sRGB and CIELAB (CIE L\*a\*b\*) color spaces. CIELAB is a perceptually uniform color space designed to approximate human vision, where equal Euclidean distances correspond to roughly equal perceived color differences.

Functions are templated to accept arbitrary input and output datatypes:
```cpp
template <typename Tin, typename Tout>
```

NOTE: Data types for CIELAB color space should support signed values. Suggest using `float` or `double`.

## Functions

### `rgb_to_lab`

Convert sRGB to CIELAB color space.

```cpp
template <typename Tin, typename Tout>
void rgb_to_lab(
    const Tin r_u8,
    const Tin g_u8,
    const Tin b_u8,
    Tout& out_l,
    Tout& out_a,
    Tout& out_b
);

template <typename Tin, typename Tout>
void rgb_to_lab(
   const ImageLib::RGBPixel<Tin> &rgb,
   ImageLib::LABPixel<Tout> &lab
);

template <typename Tin, typename Tout>
void rgb_to_lab(
   const ImageLib::RGBAPixel<Tin> &rgba,
   ImageLib::LABAPixel<Tout> &laba
);
```

#### Parameters

| Parameter | Type      | Range        | Description                     |
| :-------- | :-------- | :----------- | :------------------------------ |
| `r_u8`    | `Tin` | [0, 255]     | Red channel (input)             |
| `g_u8`    | `Tin` | [0, 255]     | Green channel (input)           |
| `b_u8`    | `Tin` | [0, 255]     | Blue channel (input)            |
| `out_l`   | `Tout&` | [0, 100]     | L\* lightness (output, clamped) |
| `out_a`   | `Tout&` | ~[-128, 127] | a\* green-red axis (output)     |
| `out_b`   | `Tout&` | ~[-128, 127] | b\* blue-yellow axis (output)   |

#### Transformation Pipeline

1. **sRGB → Linear RGB**: Inverse gamma correction (gamma expansion)
   - Applies IEC 61966-2-1:1999 sRGB transfer function
   - Converts [0, 255] → [0, 1] → linear [0, 1]

2. **Linear RGB → XYZ**: Matrix multiplication
   - Uses D65 illuminant (standard daylight, 6500K)
   - Applies ITU-R BT.709 color primaries

3. **XYZ → CIELAB**: Normalization and nonlinear transform
   - Normalizes by D65 reference white point
   - Applies CIE-defined piecewise function (cube root or linear near zero)

#### Example

```cpp
#include "cielab.h"

// Convert bright red to LAB
uint8_t r = 255, g = 0, b = 0;
double L, a, b_lab;
rgb_to_lab(r, g, b, L, a, b_lab);
// Result: L ≈ 53.2, a ≈ 80.1, b ≈ 67.2
```

---

### `lab_to_rgb`

Convert CIELAB to sRGB color space.

```cpp
template <typename Tin, typename Tout>
void lab_to_rgb(
    const Tin L,
    const Tin A,
    const Tin B,
    Tout& r_u8,
    Tout& g_u8,
    Tout& b_u8
);

template <typename Tin, typename Tout>
void lab_to_rgb(
   const ImageLib::LABPixel<Tin> &lab,
   ImageLib::RGBPixel<Tout> &rgb
);

template <typename Tin, typename Tout>
void lab_to_rgb(
   const ImageLib::LABAPixel<Tin> &laba,
   ImageLib::RGBAPixel<Tout> &rgba
);
```

#### Parameters

| Parameter | Type       | Range        | Description                     |
| :-------- | :--------- | :----------- | :------------------------------ |
| `L`       | `Tout`   | [0, 100]     | L\* lightness (input)           |
| `A`       | `Tout`   | ~[-128, 127] | a\* green-red axis (input)      |
| `B`       | `Tout`   | ~[-128, 127] | b\* blue-yellow axis (input)    |
| `r_u8`    | `Tin&` | [0, 255]     | Red channel (output, clamped)   |
| `g_u8`    | `Tin&` | [0, 255]     | Green channel (output, clamped) |
| `b_u8`    | `Tin&` | [0, 255]     | Blue channel (output, clamped)  |

#### Transformation Pipeline

1. **CIELAB → XYZ**: Inverse nonlinear transform and denormalization
   - Applies inverse piecewise function (cube or linear)
   - Denormalizes by D65 white point

2. **XYZ → Linear RGB**: Inverse matrix multiplication
   - May produce out-of-gamut values (negative or >1.0)

3. **Linear RGB → sRGB**: Gamma correction
   - Applies gamma compression using sRGB transfer function
   - Clamps to [0, 1], rounds, and converts to [0, 255]

#### Out-of-Gamut Handling

:::warning Out-of-Gamut Colors
Not all LAB colors are representable in sRGB. Colors outside the sRGB gamut are clamped to the nearest valid RGB value, which may result in color shifts or loss of hue.
:::

#### Example

```cpp
#include "cielab.h"

// Convert LAB back to RGB
double L = 53.2, a = 80.1, b = 67.2;
uint8_t r, g, b_rgb;
lab_to_rgb(L, a, b, r, g, b_rgb);
// Result: r ≈ 255, g ≈ 0, b ≈ 0 (bright red)
```

---

## Technical Specifications

### Color Space Standards

| Property          | Value                         |
| :---------------- | :---------------------------- |
| **Color space**   | sRGB (IEC 61966-2-1:1999)     |
| **Illuminant**    | D65 (6500K daylight)          |
| **Observer**      | CIE 1931 2° Standard Observer |
| **Gamma**         | 2.4 (sRGB standard)           |
| **RGB primaries** | ITU-R BT.709                  |

### CIELAB Coordinate System

- **L\* (Lightness)**: Perceptual lightness
  - 0 = black
  - 100 = white
  - 50 ≈ mid-gray
- **a\* (Green-Red)**: Color opponent dimension
  - Negative values = green
  - Positive values = red
  - 0 = neutral (gray axis)
- **b\* (Blue-Yellow)**: Color opponent dimension
  - Negative values = blue
  - Positive values = yellow
  - 0 = neutral (gray axis)

### Distance Metric

Euclidean distance in CIELAB space approximates perceptual color difference:

$$
\Delta E = \sqrt{(\Delta L^*)^2 + (\Delta a^*)^2 + (\Delta b^*)^2}
$$

**Interpretation**:

- ΔE < 1: Imperceptible difference
- ΔE < 2: Perceptible with close observation
- ΔE < 10: Noticeable at a glance
- ΔE > 10: Significant color difference

---

## Usage in Bilateral Filter

The CIELAB color space is used in the bilateral filter to compute perceptually uniform range weights:

```cpp
// In bilateral_filter.cpp (CIELAB mode)
double dL = L_neighbor - L_center;
double dA = A_neighbor - A_center;
double dB = B_neighbor - B_center;
double dist = std::sqrt(dL*dL + dA*dA + dB*dB);
double w_range = gaussian(dist, sigma_range);
```

This produces more perceptually consistent smoothing compared to RGB Euclidean distance.

---

## Performance Considerations

### Computational Cost

| Operation    | Complexity                       |
| :----------- | :------------------------------- |
| `rgb_to_lab` | ~20-30 floating-point operations |
| `lab_to_rgb` | ~25-35 floating-point operations |

**Key operations**:

- Gamma correction: piecewise with `pow()` for nonlinear segment
- Matrix multiplication: 3×3 matrix
- XYZ transform: `cbrt()` or linear approximation

### Optimization Notes

- **Batch conversion**: When processing entire images, consider vectorization (SIMD)
- **LUT for gamma**: Can be precomputed for all 256 uint8_t values
- **Fast approximations**: Polynomial approximations for `pow()` and `cbrt()` can improve speed at slight accuracy cost

---

## See Also

- [Bilateral Filter Color Spaces](../../bilateral_filter/color-spaces) — How CIELAB is used in filtering
- [Bilateral Filter Implementation](../../bilateral_filter/implementation) — Implementation details
- [CIE 1976 L\*a\*b\* Color Space (Wikipedia)](https://en.wikipedia.org/wiki/CIELAB_color_space)
- [sRGB Specification (IEC 61966-2-1:1999)](https://www.color.org/chardata/rgb/srgb.xalter)
