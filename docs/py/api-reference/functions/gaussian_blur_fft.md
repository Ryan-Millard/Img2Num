# gaussian_blur_fft

URL: https://img2num.dev/docs/py/api-reference/functions/gaussian_blur_fft

Signature

```python
def gaussian_blur_fft(
    image: npt.NDArray[np.uint8],
    sigma: float,
) -> npt.NDArray[np.uint8]
```

Apply a Gaussian blur to the image using Fast Fourier Transform (FFT) for performance.

## Parameters

| Name | Type | Description | `image` | `numpy.ndarray` | Input image as a uint8 numpy array. | `sigma` | `float` | Standard deviation for the Gaussian kernel. 

## Returns

| Type | Description | `numpy.ndarray` | Blurred image as a uint8 numpy array.
