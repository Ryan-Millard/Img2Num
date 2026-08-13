# labels_to_svg

URL: https://img2num.dev/docs/py/api-reference/functions/labels_to_svg

Signature

```python
def labels_to_svg(
    data: npt.NDArray[np.uint8],
    labels: npt.NDArray[int],
    min_area: int,
    min_thickness: int,
) -> str
```

Convert labels to an SVG string.

## Parameters

| Name | Type | Description | `data` | `numpy.ndarray` | Input image data as a uint8 numpy array. | `labels` | `numpy.ndarray` | Label map as an int32 numpy array. | `min_area` | `int` | Minimum cluster area to include in the SVG. | `min_thickness` | `int` | Minimum thickness a region must have to include in the SVG. 

## Returns

| Type | Description | `str` | An SVG string containing data roughly approximate to the input image.
