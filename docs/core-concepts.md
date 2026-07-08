# Core Concepts

URL: https://img2num.dev/docs/core-concepts

Understanding these concepts will help you get the best results from Img2Num.

## Color Spaces

Img2Num supports two color spaces for k-means clustering:

| Space | ID | Description | Use when… | **CIE LAB** | `0` | Perceptually uniform — distances match human color perception. | Accurate color matching matters more than speed. | **sRGB** | `1` | Faster computation in the native display space. | You need speed and color accuracy is secondary. 

## Bilateral Filtering

The bilateral filter applies two Gaussian kernels:

result = weighted_average ( input_pixels ) weight = exp ⁡ ( − dist 2 2 σ s 2 )⋅exp ⁡ ( − Δ intensity 2 2 σ r 2 ) \begin{aligned} \text{result} &= \text{weighted\_average}(\text{input\_pixels}) \\ \text{weight} &= \exp\left(-\frac{\text{dist}^2}{2\sigma_{\text{s}}^2}\right)\; \cdot\; \exp\left(-\frac{\Delta \text{intensity}^2}{2\sigma_{\text{r}}^2}\right) \end{aligned} result weight =weighted_average ( input_pixels ) =exp( − 2 σ s 2dist 2 )⋅exp( − 2 σ r 2Δ intensity 2 )
### Spatial Kernel

> **Typical value:** 3

σ s \sigma_{s} σ s ( `sigma_spatial` ) is the parameter that controls neighbor pixel smoothing in the image plane. Neighbors are pixels that are close to each other.

RGB LUT CIELAB (on-the-fly)Color difference ΔRGB Color difference ΔLAB Above, σ r = 20 for RGB and σ r = 15 for CIELAB.

### Range Kernel

> **Typical value:** 50

σ r \sigma_{r} σ r ( `sigma_range` ) is the parameter that controls smoothing of pixels with similar intensity values.

For example, a pixel with value `rgba(213,13,67)` and another with `rgba(195,17,87)` may be considered similar and get smoothed together.

## K-Means Clustering

K-means groups pixels into *k* clusters based on color distance in the chosen color space.

- **`k` (num_colors)** : How many colors the output should contain.
- **`max_iter`** : Maximum iterations allowed before forcing termination.
note
`k` and `max_iter` are not guarantees.
- `k` cannot force new colors: if the image only has `2` colors and k = 5 k=5 k= 5 , the image cannot gain more color.
- `max_iter` is an upper limit **only** : if m a x i t e r = 999 max_{iter}=999 ma x i t er= 999 and it only takes `50` iterations to cluster the image, the function will return early (before the 999 th iteration).

Choosing the Value of `k`
Larger images benefit from more colors ( `k` ), but too many will produce noisy contours.
