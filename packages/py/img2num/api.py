import numpy as np
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
def gaussian_blur_fft(image, sigma, *, width, height):
    return _gaussian_blur_fft(image, width, height, sigma)

@_inject_dims("image")
def invert_image(image, *, width, height):
    return _invert_image(image, width, height)

@_inject_dims("image")
def threshold_image(image, num_thresholds, *, width, height):
    return _threshold_image(image, width, height, num_thresholds)

@_inject_dims("image")
def black_threshold_image(image, num_thresholds, *, width, height):
    return _black_threshold_image(image, width, height, num_thresholds)

@_inject_dims("image")
def bilateral_filter(image, sigma_spatial, sigma_range, color_space, *, width, height):
    return _bilateral_filter(image, width, height, sigma_spatial, sigma_range, color_space)

@_inject_dims("data")
def kmeans(data, k, max_iter, color_space, *, width, height):
    return _kmeans(data, width, height, k, max_iter, color_space)

@_inject_dims("data")
def labels_to_svg(data, labels, min_area, *, width, height):
    return _labels_to_svg(data, labels, width, height, min_area)

# @_inject_dims("image")
# def image_to_svg(image, sigma_spatial, sigma_range, k, max_iter, min_area, color_space, *, width, height):
#     return _image_to_svg(image, width, height, sigma_spatial, sigma_range, k, max_iter, min_area, color_space)

@_inject_dims("image")
def image_to_svg(image, config, *, width, height):
    return _image_to_svg(image, width, height, config)