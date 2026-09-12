from typing import Tuple
import numpy as np
import numpy.typing as npt
import inspect
import functools
from ._img2num import (
    gaussian_blur_fft       as _gaussian_blur_fft,
    invert_image            as _invert_image,
    threshold_image         as _threshold_image,
    black_threshold_image   as _black_threshold_image,
    bilateral_filter        as _bilateral_filter,
    kmeans                  as _kmeans,
    color_quantize          as _color_quantize,
    labels_to_svg           as _labels_to_svg,
    image_to_svg            as _image_to_svg,
    ImageToSvgConfig
)


def _inject_dimensions(image_arg="image"):
    def decorator(fn):
        sig = inspect.signature(fn)
        params = list(sig.parameters)
        idx = params.index(image_arg)

        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            if image_arg in kwargs:
                image = kwargs[image_arg]
            else:
                image = args[idx]
            if image.ndim < 2:
                raise ValueError("Expected (H, W) or (H, W, C)")
            height, width = image.shape[:2]
            return fn(*args, width=width, height=height, **kwargs)

        # Hide width/height from the public signature: they're injected
        # automatically from the image's shape and must not be passed in.
        public_params = [
            p for name, p in sig.parameters.items() if name not in ("width", "height")
        ]
        wrapper.__signature__ = sig.replace(parameters=public_params)

        return wrapper

    return decorator


@_inject_dimensions("image")
def gaussian_blur_fft(
    image: npt.NDArray[np.uint8], sigma: float, *, width: int, height: int
) -> npt.NDArray[np.uint8]:
    """
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
    """
    return _gaussian_blur_fft(image, width, height, sigma)


@_inject_dimensions("image")
def invert_image(image: npt.NDArray[np.uint8], *, width: int, height: int) -> npt.NDArray[np.uint8]:
    """
    Invert the pixel values of an image.

    Parameters
    ----------
    image : numpy.ndarray
        Input image as a uint8 numpy array.

    Returns
    -------
    numpy.ndarray
        Inverted image as a uint8 numpy array.
    """
    return _invert_image(image, width, height)


@_inject_dimensions("image")
def threshold_image(
    image: npt.NDArray[np.uint8], num_thresholds: int, *, width: int, height: int
) -> npt.NDArray[np.uint8]:
    """
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
    """
    return _threshold_image(image, width, height, num_thresholds)


@_inject_dimensions("image")
def black_threshold_image(
    image: npt.NDArray[np.uint8], num_thresholds: int, *, width: int, height: int
) -> npt.NDArray[np.uint8]:
    """
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
    """
    return _black_threshold_image(image, width, height, num_thresholds)


@_inject_dimensions("image")
def bilateral_filter(
    image: npt.NDArray[np.uint8],
    sigma_spatial: float,
    sigma_range: float,
    color_space: int,
    *,
    width: int,
    height: int,
) -> npt.NDArray[np.uint8]:
    """
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
    """
    return _bilateral_filter(image, width, height, sigma_spatial, sigma_range, color_space)


@_inject_dimensions("data")
def kmeans(
    data: npt.NDArray[np.uint8], k: int, max_iter: int, color_space: int, *, width: int, height: int
) -> Tuple[npt.NDArray[np.uint8], npt.NDArray[int]]:
    """
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
    """
    return _kmeans(data, width, height, k, max_iter, color_space)

@_inject_dimensions("data")
def color_quantize(
    data: npt.NDArray[np.uint8], k: int, coverage: float, color_space: int, *, width: int, height: int
) -> Tuple[npt.NDArray[np.uint8], npt.NDArray[int]]:
    """
    Perform K-means clustering on the image data.

    Parameters
    ----------
    data : numpy.ndarray
        Input image data as a uint8 numpy array.
    k : int
        Number of dominant colors to select. If k=0 set coverage.
    coverage : float
        Area ratio to consider when determining dominant colors.
    color_space : int
        Color space identifier (e.g., 0 for LAB, 1 for sRGB).

    Returns
    -------
    tuple
        A tuple containing two NumPy arrays: (clustered_data, labels).
    """
    return _color_quantize(data, width, height, k, coverage, color_space)


@_inject_dimensions("data")
def labels_to_svg(
    data: npt.NDArray[np.uint8],
    labels: npt.NDArray[int],
    min_area: int,
    min_thickness: int,
    *,
    width: int,
    height: int,
) -> str:
    """
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
    """
    return _labels_to_svg(data, labels, width, height, min_area, min_thickness)


@_inject_dimensions("image")
def image_to_svg(image: npt.NDArray[np.uint8], *, width: int, height: int, config=None) -> str:
    """
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
    """
    _config = ImageToSvgConfig() if config is None else config
    return _image_to_svg(
        image,
        width,
        height,
        # Use default
        _config,
    )
