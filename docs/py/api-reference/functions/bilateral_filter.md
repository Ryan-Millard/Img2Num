# bilateral_filter

URL: https://img2num.dev/docs/py/api-reference/functions/bilateral_filter

Signature

```python
def bilateral_filter(
    image: npt.NDArray[np.uint8],
    sigma_spatial: float,
    sigma_range: float,
    color_space: int,
) -> npt.NDArray[np.uint8]
```

Apply a bilateral filter to the image.

## Parameters

| Name | Type | Description | `image` | `numpy.ndarray` | Input image as a uint8 numpy array. | `sigma_spatial` | `float` | Standard deviation for the spatial Gaussian (proximity weight). | `sigma_range` | `float` | Standard deviation for the range Gaussian (intensity similarity weight). | `color_space` | `int` | Color space identifier (e.g., 0 for LAB, 1 for sRGB). 

## Returns

| Type | Description | `numpy.ndarray` | Filtered image as a uint8 numpy array.
