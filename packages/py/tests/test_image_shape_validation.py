import numpy as np
import pytest

from img2num.api import _inject_dimensions

INVALID_SHAPES = [
    (64, 64),  # GREYSCALE
    (64, 64, 3),  # RGB
    (64, 64, 1),  # SINGLE-CHANNEL
]


@_inject_dimensions(image_arg="image")
def dummy_image_fn(image, *, width: int, height: int):
    return image


@pytest.mark.parametrize("shape", INVALID_SHAPES)
def test_non_rgba_shapes_raise_value_error(shape):
    invalid_array = np.zeros(shape, dtype=np.uint8)

    with pytest.raises(ValueError, match="Expected an RGBA image with shape"):
        dummy_image_fn(invalid_array)


def test_valid_rgba_shape_succeeds():
    valid_array = np.zeros((64, 64, 4), dtype=np.uint8)
    result = dummy_image_fn(valid_array)

    assert result.shape == (64, 64, 4)
