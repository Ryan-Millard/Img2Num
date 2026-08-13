# kmeans

URL: https://img2num.dev/docs/py/api-reference/functions/kmeans

Signature

```python
def kmeans(
    data: npt.NDArray[np.uint8],
    k: int,
    max_iter: int,
    color_space: int,
) -> Tuple[npt.NDArray[np.uint8], npt.NDArray[int]]
```

Perform K-means clustering on the image data.

## Parameters

| Name | Type | Description | `data` | `numpy.ndarray` | Input image data as a uint8 numpy array. | `k` | `int` | Number of clusters to compute. | `max_iter` | `int` | Maximum number of iterations for the K-means algorithm. | `color_space` | `int` | Color space identifier (e.g., 0 for LAB, 1 for sRGB). 

## Returns

| Type | Description | `tuple` | A tuple containing two NumPy arrays: (clustered_data, labels).
