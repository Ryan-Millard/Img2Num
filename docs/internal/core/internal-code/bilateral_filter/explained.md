# Bilateral Filter — Implementation Explained

URL: https://img2num.dev/docs/internal/core/internal-code/bilateral_filter/explained

This section explains the inner workings of the **bilateral filter** implementation.

## Overview

The bilateral filter smoothes an image while **preserving edges** . It achieves this by weighting neighboring pixels based on two criteria:

1. **Spatial Distance** : Pixels closer to the center have higher weight.
2. **Range (Color) Difference** : Pixels with similar colors to the center have higher weight.
This prevents the "blurring" from crossing strong edges, where the color difference is large.

## How It Works

For each pixel in the image, we look at a local window (kernel) around it. The new pixel value is a weighted average of its neighbors:

I n e w ( x ) = 1 W p ∑ x i ∈ Ω I ( x i ) ⋅ w s p a t i a l ( ∥ x i − x ∥ ) ⋅ w r a n g e ( ∣ I ( x i ) − I ( x ) ∣ ) I_{new}(x) = \frac{1}{W_p} \sum_{x_i \in \Omega} I(x_i) \cdot w_{spatial}(\|x_i - x\|) \cdot w_{range}(|I(x_i) - I(x)|) I n e w ( x )= W p1x i ∈ Ω ∑I ( x i )⋅ w s p a t ia l ( ∥ x i− x ∥ )⋅ w r an g e ( ∣ I ( x i )− I ( x ) ∣ )Where each component means:

- x x x : The coordinates of the **center pixel** being filtered.
- Ω \Omega Ω : The set of **neighboring pixels** in the local kernel around x x x (from `-radius` to `+radius` ).
- I ( x i ) I(x_i) I ( x i ) : The **color or intensity** of a neighbor pixel x i x_i x i .
- C ( x i ) C(x_i) C ( x i ) : The **color vector** of pixel x i x_i x i .
- RGB: `[R, G, B]`
- CIELAB: `[L*, a*, b*]`
- w s p a t i a l ( ∣ x i − x ∣ ) w_{spatial}(|x_i - x|) w s p a t ia l ( ∣ x i− x ∣ ) : A **Gaussian weight** based on the **spatial distance** between the neighbor and the center.
- Pixels closer to the center have **larger weights** .
- Formula: exp ⁡ ( − distance 2 2 σ s 2 ) \exp\Big(-\frac{\text{distance}^2}{2\sigma_s^2}\Big) exp(− 2 σ s 2distance 2 )
- w range ( ∣ C ( x i ) − C ( x ) ∣ ) w_\text{range}(|C(x_i) - C(x)|) w range ( ∣ C ( x i )− C ( x ) ∣ ) : A **Gaussian weight** based on the **color difference** between neighbor and center.
- Pixels with **similar colors** have higher weights, preserving edges.
- Formula: exp ⁡ ( − ∣ C ( x i ) − C ( x ) ∣ 2 2 σ r 2 ) \exp\Big(-\frac{|C(x_i) - C(x)|^2}{2\sigma_r^2}\Big) exp(− 2 σ r 2∣ C ( x i ) − C ( x ) ∣ 2 )
- RGB: Precomputed via **LUT**
- CIELAB: Computed **on the fly**
- W p = ∑ x i ∈ Ω w s p a t i a l ⋅ w range W_p = \sum_{x_i \in \Omega} w_{spatial} \cdot w_\text{range} W p= ∑ x i ∈ Ωw s p a t ia l⋅ w range : **Normalization factor** to ensure the weighted average sums to a valid color.
- **Result I new ( x ) I_\text{new}(x) I new ( x )** : The **filtered color** of the center pixel after combining spatial and color-based weighting.
- ∣ I ( x i ) − I ( x ) ∣ |I(x_i) - I(x)| ∣ I ( x i )− I ( x ) ∣ : The Euclidean norm.
- **RGB** : ∣ I ( x i ) − I ( x ) ∣ = Δ R 2 + Δ G 2 + Δ B 2 |I(x_i) - I(x)| = \sqrt{ \Delta R² + \Delta G² + \Delta B² } ∣ I ( x i )− I ( x ) ∣= Δ R 2+Δ G 2+Δ B 2
- **CIELAB** : ∣ I ( x i ) − I ( x ) ∣ = Δ L 2 + Δ a 2 + Δ b 2 |I(x_i) - I(x)| = \sqrt{ \Delta L² + \Delta a² + \Delta b² } ∣ I ( x i )− I ( x ) ∣= Δ L 2+Δ a 2+Δ b 2
info
In this implementation, both weighting terms are **Gaussian kernels** :

w s p a t i a l ( d ) = exp ⁡ ( − d 2 2 σ s 2 ) ,w range ( d ) = exp ⁡ ( − d 2 2 σ r 2 ) w_{spatial}(d) = \exp\left(-\frac{d^2}{2\sigma_s^2}\right), \quad w_{\text{range}}(d) = \exp\left(-\frac{d^2}{2\sigma_r^2}\right) w s p a t ia l ( d )= exp( − 2 σ s 2d 2 ),w range ( d )= exp( − 2 σ r 2d 2 ) where σ s \sigma_s σ s controls spatial smoothing and σ r \sigma_r σ r controls edge sensitivity.

## Implementation Details

Our implementation uses a **naive sliding window** approach with **Look-Up Table (LUT) optimizations / "On the Fly" computations** to improve performance.

### 1. Precomputed Look-Up Tables (RGB color space)

Calculating `std::exp()` inside the inner loop is expensive. We precompute the two Gaussian functions:

- **Spatial Weights** : A 2D grid of weights based on the kernel radius. Since the spatial distance between a neighbor and the center never changes, this is calculated once per filter application.
- **Range Weights** : A 1D array mapping squared color distance ( 0 0 0 to 255 2 × 3 255^2 \times 3 25 5 2× 3 ) to a weight. This allows O(1) lookups for the "edge preservation" factor.
Precomputing Range Weights

```cpp
std::vector<double> range_lut(MAX_RGB_DIST_SQ + 1);
for (int i = 0; i <= MAX_RGB_DIST_SQ; ++i) {
    range_lut[i] = std::exp(-static_cast<double>(i) / two_sigma_range_sq);
}
```

### 2. On-the-fly Range weights (CIE-LAB color space)

When deriving range weights in the CIELAB color space, the LUT approach does not work (see the [Range Weights section in the implementation docs](/docs/internal/core/internal-code/bilateral_filter/implementation/#range-weights) to understand why). Instead range weights are computed on the fly using the `gaussian` function.

Since the RGB to CIELAB conversion is expensive, redundant computations are minimized by initially converting the full RGB image to CIELAB image.

In the convolution step LAB distance is computed by reading those values from the CIELAB image buffer, and the gaussian is then evaluated.

```cpp
dL = cie_image[neighbor_idx] - L0;
dA = cie_image[neighbor_idx + 1] - A0;
dB = cie_image[neighbor_idx + 2] - B0;

dist = std::sqrt(dL * dL + dA * dA + dB * dB);
w_range = gaussian(dist, sigma_range);
```

note
`gaussian` itself is expensive to run. Future optimizations will include polynomial approximations of `exp(-x^2)` via Taylor expansion or Horner's method.

### 3. The Loop

We iterate over every pixel `(y, x)` and then over every neighbor `(ky, kx)` within the kernel radius:

1. **Load Neighbor** : Get RGB values of the neighbor.
2. **Spatial Weight** : Look up precomputed G σ s p a t i a l G_{\sigma_{spatial}} G σ s p a t ia l .
3. **Range Weight** : Calculate squared color distance ∥ C p − C q ∥ 2 \|C_p - C_q\|^2 ∥ C p− C q ∥ 2 and look up precomputed G σ r a n g e G_{\sigma_{range}} G σ r an g e if using RGB, or compute on the fly if using CIELAB.
4. **Accumulate** : `pixel_acc += neighbor_rgb * (spatial_w * range_w)` .
5. **Normalize** : Divide by probability sum.

### Complexity

- **Time Complexity** : O ( W ⋅ H ⋅ R 2 ) O(W \cdot H \cdot R^2) O ( W⋅ H⋅ R 2 ) , where R R R is the kernel radius.
- **Space Complexity** : O ( W ⋅ H ) O(W \cdot H) O ( W⋅ H ) for the output buffer.
This complexity is why the filter can be slow for large radii ( σ s p a t i a l > 5.0 \sigma_{spatial} > 5.0 σ s p a t ia l> 5.0 ), but we currently parameterize the radius to be small ( σ s p a t i a l ≤ 3.0 \sigma_{spatial} \leq 3.0 σ s p a t ia l≤ 3.0 ) so it is not a problem.
