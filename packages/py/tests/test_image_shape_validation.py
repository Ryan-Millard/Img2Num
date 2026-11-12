import numpy as np
import pytest

import img2num

FUNCTIONS = [
    ("invert_image", ()),
    ("threshold_image", (4,)),
    ("black_threshold_image", (4,)),
]

INVALID_SHAPES = [
    (64, 64),  # GREYSCALE
    (64, 64, 3),  # RGB
    (64, 64, 1),  # SINGLE-CHANNEL
]


@pytest.mark.parametrize("fn_name, extra_args", FUNCTIONS)
@pytest.mark.parametrize("shape", INVALID_SHAPES)
def test_non_rgba_shapes_raise_value_error(fn_name, extra_args, shape):
    fn = getattr(img2num, fn_name)
    invalid_array = np.zeros(shape, dtype=np.uint8)

    with pytest.raises(ValueError, match="Expected an RGBA image with shape"):
        fn(invalid_array, *extra_args)


@pytest.mark.parametrize("fn_name, extra_args", FUNCTIONS)
def test_valid_rgba_shape_succeeds(fn_name, extra_args):
    fn = getattr(img2num, fn_name)
    valid_array = np.zeros((64, 64, 4), dtype=np.uint8)

    result = fn(valid_array, *extra_args)

    assert result.shape == (64, 64, 4)
