# image_to_svg

URL: https://img2num.dev/docs/py/api-reference/functions/image_to_svg

Signature

```python
def image_to_svg(image: npt.NDArray[np.uint8], *, config=None) -> str
```

Convert Image to SVG string.

## Parameters

| Name | Type | Description | `image` | `numpy.ndarray` | Input image buffer. | `config` | `ImageToSvgConfig, optional` | Configuration object containing filter and clustering parameters. Defaults to `ImageToSvgConfig()` if not provided. 

## Returns

| Type | Description | `str` | SVG string representation of the image.
