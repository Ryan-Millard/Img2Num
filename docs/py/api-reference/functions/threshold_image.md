# threshold_image

URL: https://img2num.dev/docs/py/api-reference/functions/threshold_image

Signature

```python
def threshold_image(
    image: npt.NDArray[np.uint8],
    num_thresholds: int,
) -> npt.NDArray[np.uint8]
```

Apply thresholding to the image.

## Parameters

| Name | Type | Description | `image` | `numpy.ndarray` | Input image as a uint8 numpy array. | `num_thresholds` | `int` | Number of threshold levels to apply. 

## Returns

| Type | Description | `numpy.ndarray` | Thresholded image as a uint8 numpy array.
