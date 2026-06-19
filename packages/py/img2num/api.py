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
    labels_to_svg           as _labels_to_svg,
    image_to_svg            as _image_to_svg,
    ImageToSvgConfig
)

def _inject_dims(image_arg="image"):
    def decorator(fn):
        params = list(inspect.signature(fn).parameters)
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

        return wrapper
    return decorator


@_inject_dims("image")
def gaussian_blur_fft(image: npt.NDArray[np.uint8], sigma: float, *, width: int, height: int) -> npt.NDArray[np.uint8]:
    return _gaussian_blur_fft(image, width, height, sigma)

@_inject_dims("image")
def invert_image(image: npt.NDArray[np.uint8], *, width: int, height: int) -> npt.NDArray[np.uint8]:
    return _invert_image(image, width, height)

@_inject_dims("image")
def threshold_image(image: npt.NDArray[np.uint8], num_thresholds: int, *, width: int, height: int) -> npt.NDArray[np.uint8]:
    return _threshold_image(image, width, height, num_thresholds)

@_inject_dims("image")
def black_threshold_image(image: npt.NDArray[np.uint8], num_thresholds: int, *, width: int, height: int) -> npt.NDArray[np.uint8]:
    return _black_threshold_image(image, width, height, num_thresholds)

@_inject_dims("image")
def bilateral_filter(image: npt.NDArray[np.uint8], sigma_spatial: float, sigma_range: float, color_space: int, *, width: int, height: int) -> npt.NDArray[np.uint8]:
    return _bilateral_filter(image, width, height, sigma_spatial, sigma_range, color_space)

@_inject_dims("data")
def kmeans(data: npt.NDArray[np.uint8], k: int, max_iter: int, color_space: int, *, width: int, height: int) -> Tuple[npt.NDArray[np.uint8], npt.NDArray[int]]:
    return _kmeans(data, width, height, k, max_iter, color_space)

@_inject_dims("data")
def labels_to_svg(data: npt.NDArray[np.uint8], labels: npt.NDArray[int], min_area: int, min_thickness: int, *, width: int, height: int) -> str:
    return _labels_to_svg(data, labels, width, height, min_area, min_thickness)

@_inject_dims("image")
def image_to_svg(image: npt.NDArray[np.uint8], *, width: int, height: int, config=None) -> str:
    _config = ImageToSvgConfig() if config is None else config

    return _image_to_svg(
        image,
        width,
        height,
        # Use default
        _config,
    )
