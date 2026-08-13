# black_threshold_image

URL: https://img2num.dev/docs/py/api-reference/functions/black_threshold_image

Signature

```python
def black_threshold_image(
    image: npt.NDArray[np.uint8],
    num_thresholds: int,
) -> npt.NDArray[np.uint8]
```

Apply thresholding with a bias in favor of black to the image.

## Parameters

| Name | Type | Description | `image` | `numpy.ndarray` | Input image as a uint8 numpy array. | `num_thresholds` | `int` | Number of threshold levels to apply. 

## Returns

| Type | Description | `numpy.ndarray` | Thresholded image as a uint8 numpy array.
