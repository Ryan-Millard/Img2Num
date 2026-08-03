---
id: api-reference
title: Python API Reference
sidebar_position: 1
---

<a id="img2num.__init__"></a>

# img2num.\_\_init\_\_

<a id="img2num.api"></a>

# img2num.api

<a id="img2num.api.gaussian_blur_fft"></a>

#### gaussian\_blur\_fft

```python
@_inject_dimensions("image")
def gaussian_blur_fft(image: npt.NDArray[np.uint8], sigma: float, *,
                      width: int, height: int) -> npt.NDArray[np.uint8]
```

Apply a Gaussian blur to the image using Fast Fourier Transform (FFT) for performance.

Parameters
----------
image : numpy.ndarray
    Input image as a uint8 numpy array.
sigma : float
    Standard deviation for the Gaussian kernel.

Returns
-------
numpy.ndarray
    Blurred image as a uint8 numpy array.

<a id="img2num.api.invert_image"></a>

#### invert\_image

```python
@_inject_dimensions("image")
def invert_image(image: npt.NDArray[np.uint8], *, width: int,
                 height: int) -> npt.NDArray[np.uint8]
```

Invert the pixel values of an image.

Parameters
----------
image : numpy.ndarray
    Input image as a uint8 numpy array.

Returns
-------
numpy.ndarray
    Inverted image as a uint8 numpy array.

<a id="img2num.api.threshold_image"></a>

#### threshold\_image

```python
@_inject_dimensions("image")
def threshold_image(image: npt.NDArray[np.uint8], num_thresholds: int, *,
                    width: int, height: int) -> npt.NDArray[np.uint8]
```

Apply thresholding to the image.

Parameters
----------
image : numpy.ndarray
    Input image as a uint8 numpy array.
num_thresholds : int
    Number of threshold levels to apply.

Returns
-------
numpy.ndarray
    Thresholded image as a uint8 numpy array.

<a id="img2num.api.black_threshold_image"></a>

#### black\_threshold\_image

```python
@_inject_dimensions("image")
def black_threshold_image(image: npt.NDArray[np.uint8], num_thresholds: int, *,
                          width: int, height: int) -> npt.NDArray[np.uint8]
```

Apply thresholding with a bias in favor of black to the image.

Parameters
----------
image : numpy.ndarray
    Input image as a uint8 numpy array.
num_thresholds : int
    Number of threshold levels to apply.

Returns
-------
numpy.ndarray
    Thresholded image as a uint8 numpy array.

<a id="img2num.api.bilateral_filter"></a>

#### bilateral\_filter

```python
@_inject_dimensions("image")
def bilateral_filter(image: npt.NDArray[np.uint8], sigma_spatial: float,
                     sigma_range: float, color_space: int, *, width: int,
                     height: int) -> npt.NDArray[np.uint8]
```

Apply a bilateral filter to the image.

Parameters
----------
image : numpy.ndarray
    Input image as a uint8 numpy array.
sigma_spatial : float
    Standard deviation for the spatial Gaussian (proximity weight).
sigma_range : float
    Standard deviation for the range Gaussian (intensity similarity weight).
color_space : int
    Color space identifier (e.g., 0 for LAB, 1 for sRGB).

Returns
-------
numpy.ndarray
    Filtered image as a uint8 numpy array.

<a id="img2num.api.kmeans"></a>

#### kmeans

```python
@_inject_dimensions("data")
def kmeans(data: npt.NDArray[np.uint8], k: int, max_iter: int,
           color_space: int, *, width: int,
           height: int) -> Tuple[npt.NDArray[np.uint8], npt.NDArray[int]]
```

Perform K-means clustering on the image data.

Parameters
----------
data : numpy.ndarray
    Input image data as a uint8 numpy array.
k : int
    Number of clusters to compute.
max_iter : int
    Maximum number of iterations for the K-means algorithm.
color_space : int
    Color space identifier (e.g., 0 for LAB, 1 for sRGB).

Returns
-------
tuple
    A tuple containing two NumPy arrays: (clustered_data, labels).

<a id="img2num.api.labels_to_svg"></a>

#### labels\_to\_svg

```python
@_inject_dimensions("data")
def labels_to_svg(data: npt.NDArray[np.uint8], labels: npt.NDArray[int],
                  min_area: int, min_thickness: int, *, width: int,
                  height: int) -> str
```

Convert labels to an SVG string.

Parameters
----------
data : numpy.ndarray
    Input image data as a uint8 numpy array.
labels : numpy.ndarray
    Label map as an int32 numpy array.
min_area : int
    Minimum cluster area to include in the SVG.
min_thickness : int
    Minimum thickness a region must have to include in the SVG.

Returns
-------
str
    An SVG string containing data roughly approximate to the input image.

<a id="img2num.api.image_to_svg"></a>

#### image\_to\_svg

```python
@_inject_dimensions("image")
def image_to_svg(image: npt.NDArray[np.uint8],
                 *,
                 width: int,
                 height: int,
                 config=None) -> str
```

Convert Image to SVG string.

Parameters
----------
image : numpy.ndarray
    Input image buffer.
config : ImageToSvgConfig, optional
    Configuration object containing filter and clustering parameters.
    Defaults to ``ImageToSvgConfig()`` if not provided.

Returns
-------
str
    SVG string representation of the image.

