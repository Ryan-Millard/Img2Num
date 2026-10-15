# black_threshold_image

URL: https://img2num.dev/docs/py/api-reference/functions/black_threshold_image

Signature

```python
def black_threshold_image(
    image: npt.NDArray[np.uint8],
    num_thresholds: int,
) -> npt.NDArray[np.uint8]
```

Force near-black pixels to pure black.

A pixel is set to black when all three of its colour channels are strictly below `num_thresholds` ; every other pixel is left untouched. Because the comparison is applied per channel, `num_thresholds` is a brightness cutoff, not a number of output colour levels.

## Parameters

| Name | Type | Description | `image` | `numpy.ndarray` | Input image as a uint8 numpy array. | `num_thresholds` | `int` | Per-channel brightness cutoff in the 0-255 range. Pixels whose red, green and blue values are all below this value become black. Values of 0 or less leave the image unchanged. 

## Returns

| Type | Description | `numpy.ndarray` | A copy of the image with near-black pixels darkened to pure black, as a uint8 numpy array. 

note
Darkened pixels also have their alpha channel set to an opaque 255.
