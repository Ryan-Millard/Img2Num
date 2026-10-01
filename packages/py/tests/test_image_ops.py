"""Contract tests for the per-pixel / filtering functions."""

import numpy as np
import pytest

import img2num

# Each entry: (name, callable taking an RGBA image).
IMAGE_OPS = [
    ("invert_image", lambda im: img2num.invert_image(im)),
    ("threshold_image", lambda im: img2num.threshold_image(im, 4)),
    ("black_threshold_image", lambda im: img2num.black_threshold_image(im, 4)),
    ("gaussian_blur_fft", lambda im: img2num.gaussian_blur_fft(im, 1.5)),
    ("bilateral_filter_lab", lambda im: img2num.bilateral_filter(im, 3.0, 50.0, 0)),
    ("bilateral_filter_rgb", lambda im: img2num.bilateral_filter(im, 3.0, 50.0, 1)),
]
OP_IDS = [name for name, _ in IMAGE_OPS]
OPS = [op for _, op in IMAGE_OPS]


@pytest.mark.parametrize("op", OPS, ids=OP_IDS)
def test_returns_new_uint8_array_of_same_shape(op, random_rgba):
    out = op(random_rgba)
    assert isinstance(out, np.ndarray)
    assert out.dtype == np.uint8
    assert out.shape == random_rgba.shape
    assert out.flags.c_contiguous and out.flags.writeable
    assert not np.shares_memory(out, random_rgba)


@pytest.mark.parametrize("op", OPS, ids=OP_IDS)
def test_input_is_not_modified(op, random_rgba):
    before = random_rgba.copy()
    op(random_rgba)
    np.testing.assert_array_equal(random_rgba, before)


@pytest.mark.parametrize("op", OPS, ids=OP_IDS)
def test_read_only_input_is_accepted(op, random_rgba):
    random_rgba.setflags(write=False)
    assert op(random_rgba).shape == random_rgba.shape


@pytest.mark.parametrize("dtype", [np.float32, np.float64, np.int64, np.uint16])
def test_non_uint8_input_is_rejected(dtype):
    with pytest.raises(TypeError):
        img2num.invert_image(np.zeros((4, 4, 4), dtype=dtype))


def test_one_dimensional_input_is_rejected():
    with pytest.raises(ValueError, match=r"\(H, W\)"):
        img2num.invert_image(np.zeros(16, dtype=np.uint8))


def test_passing_width_explicitly_is_rejected():
    with pytest.raises(TypeError):
        img2num.invert_image(np.zeros((4, 4, 4), np.uint8), width=4)


def test_invert_is_an_involution_that_preserves_alpha(random_rgba):
    random_rgba[..., 3] = (
        np.arange(random_rgba[..., 3].size).reshape(random_rgba.shape[:2]) % 256
    )
    out = img2num.invert_image(random_rgba)
    np.testing.assert_array_equal(out[..., :3], 255 - random_rgba[..., :3])
    np.testing.assert_array_equal(out[..., 3], random_rgba[..., 3])
    np.testing.assert_array_equal(img2num.invert_image(out), random_rgba)


def test_non_contiguous_views_are_handled(rng):
    base = rng.integers(0, 256, size=(8, 20, 4), dtype=np.uint8)
    view = base[:, ::2]  # strided, not C-contiguous
    assert not view.flags.c_contiguous
    np.testing.assert_array_equal(
        img2num.invert_image(view), img2num.invert_image(np.ascontiguousarray(view))
    )


def test_transposed_input_uses_the_transposed_shape(rng):
    img = rng.integers(0, 256, size=(4, 6, 4), dtype=np.uint8).transpose(1, 0, 2)
    out = img2num.invert_image(img)
    assert out.shape == (6, 4, 4)
    np.testing.assert_array_equal(out[..., :3], 255 - img[..., :3])


@pytest.mark.parametrize("levels", [2, 4, 8])
def test_threshold_produces_at_most_n_levels(levels, random_rgba):
    out = img2num.threshold_image(random_rgba, levels)
    assert len(np.unique(out[..., :3])) <= levels
    np.testing.assert_array_equal(out[..., 3], random_rgba[..., 3])


BLUR_ZERO_PADDING = pytest.mark.xfail(
    strict=True,
    reason=(
        "gaussian_blur_fft zero-pads to the next power of two, darkening the "
        "borders of non-power-of-two images (#651)"
    ),
)


@pytest.mark.parametrize(
    ("op", "shape"),
    [
        pytest.param(
            lambda im: img2num.gaussian_blur_fft(im, 2.0),
            (16, 16),
            id="gaussian_blur_fft-pow2",
        ),
        pytest.param(
            lambda im: img2num.gaussian_blur_fft(im, 2.0),
            (13, 17),
            id="gaussian_blur_fft-odd",
            marks=BLUR_ZERO_PADDING,
        ),
        pytest.param(
            lambda im: img2num.bilateral_filter(im, 3.0, 50.0, 0),
            (16, 16),
            id="bilateral_lab-pow2",
        ),
        pytest.param(
            lambda im: img2num.bilateral_filter(im, 3.0, 50.0, 0),
            (13, 17),
            id="bilateral_lab-odd",
        ),
        pytest.param(
            lambda im: img2num.bilateral_filter(im, 3.0, 50.0, 1),
            (16, 16),
            id="bilateral_rgb-pow2",
        ),
        pytest.param(
            lambda im: img2num.bilateral_filter(im, 3.0, 50.0, 1),
            (13, 17),
            id="bilateral_rgb-odd",
        ),
    ],
)
def test_smoothing_leaves_a_uniform_image_unchanged(op, shape, make_solid):
    img = make_solid(*shape, rgba=(77, 140, 200, 255))
    # atol=1 tolerates GPU rounding differences (see GPU_ATOL in conftest.py).
    np.testing.assert_allclose(op(img).astype(int), img.astype(int), atol=1, rtol=0)


@pytest.mark.parametrize(
    "color_space",
    [
        0,
        pytest.param(
            1,
            marks=pytest.mark.xfail(
                strict=True,
                reason=(
                    "GPU RGB shader compares rgba8unorm colours in [0, 1] "
                    "against sigma_range in [0, 255], so edges are not "
                    "preserved (#650)"
                ),
            ),
        ),
    ],
    ids=["lab", "rgb"],
)
def test_bilateral_filter_preserves_strong_edges(color_space, two_colour):
    # Black|blue differ by 255 in the blue channel, far above sigma_range=50,
    # so an edge-preserving filter must keep every pixel close to the input.
    out = img2num.bilateral_filter(two_colour, 3.0, 50.0, color_space)
    max_change = np.abs(out.astype(int) - two_colour.astype(int)).max()
    assert max_change <= 32
