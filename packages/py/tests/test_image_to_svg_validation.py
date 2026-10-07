"""Input validation for ``img2num.image_to_svg``.

The C++ core raises ``std::invalid_argument``; pybind11 turns that into
``ValueError``. These tests check the exception type *and* that the helpful
message survives the translation. Bad input is rejected before any processing,
so none of these cases need a GPU.
"""

import numpy as np
import pytest

import img2num
from img2num import ImageToSvgConfig


def rgba(h: int, w: int) -> np.ndarray:
    return np.full((h, w, 4), 128, dtype=np.uint8)


def cfg(*, bilateral_filter=None, kmeans=None, **kwargs) -> ImageToSvgConfig:
    return ImageToSvgConfig(bilateral_filter or {}, kmeans or {}, **kwargs)


# ---- image size / shape -----------------------------------------------------


@pytest.mark.parametrize("h, w", [(1, 1), (8, 8), (15, 64), (64, 15), (3, 4000)])
def test_image_below_minimum_size_raises(h, w):
    with pytest.raises(ValueError, match=r"too small.*16 pixels"):
        img2num.image_to_svg(rgba(h, w))


def test_error_message_reports_the_actual_size():
    with pytest.raises(ValueError, match=r"got 8 x 10"):
        img2num.image_to_svg(rgba(10, 8))  # width=8, height=10


@pytest.mark.parametrize("shape", [(0, 0, 4), (0, 64, 4), (64, 0, 4)])
def test_empty_image_raises(shape):
    with pytest.raises(ValueError, match="positive"):
        img2num.image_to_svg(np.zeros(shape, dtype=np.uint8))


def test_rgb_image_is_rejected_instead_of_read_out_of_bounds():
    rgb = np.zeros((64, 64, 3), dtype=np.uint8)
    with pytest.raises(ValueError, match="RGBA"):
        img2num.image_to_svg(rgb)


def test_grayscale_2d_image_is_rejected():
    with pytest.raises(ValueError, match="RGBA"):
        img2num.image_to_svg(np.zeros((64, 64), dtype=np.uint8))


def test_1d_input_is_rejected():
    with pytest.raises(ValueError, match=r"\(H, W\)"):
        img2num.image_to_svg(np.zeros(100, dtype=np.uint8))


def test_raises_exactly_value_error_not_a_generic_runtime_error():
    with pytest.raises(ValueError) as excinfo:
        img2num.image_to_svg(rgba(4, 4))
    assert type(excinfo.value) is ValueError


# ---- configuration ----------------------------------------------------------


@pytest.mark.parametrize("k", [0, -1])
def test_k_below_one_raises(k):
    with pytest.raises(ValueError, match=r"kmeans\.k must be >= 1"):
        img2num.image_to_svg(rgba(32, 32), config=cfg(kmeans={"k": k}))


def test_k_above_pixel_count_raises():
    with pytest.raises(ValueError, match=r"kmeans\.k \(1025\).*1024"):
        img2num.image_to_svg(rgba(32, 32), config=cfg(kmeans={"k": 32 * 32 + 1}))


@pytest.mark.parametrize("sigma", [0.0, -1.0, float("nan"), float("inf")])
def test_bad_sigma_spatial_raises(sigma):
    with pytest.raises(ValueError, match="sigma_spatial"):
        img2num.image_to_svg(
            rgba(32, 32), config=cfg(bilateral_filter={"sigma_spatial": sigma})
        )


@pytest.mark.parametrize("sigma", [0.0, -0.5])
def test_bad_sigma_range_raises(sigma):
    with pytest.raises(ValueError, match="sigma_range"):
        img2num.image_to_svg(
            rgba(32, 32), config=cfg(bilateral_filter={"sigma_range": sigma})
        )


def test_max_iter_below_one_raises():
    with pytest.raises(ValueError, match="max_iter"):
        img2num.image_to_svg(rgba(32, 32), config=cfg(kmeans={"max_iter": 0}))


def test_negative_min_cluster_area_raises():
    with pytest.raises(ValueError, match="min_cluster_area"):
        img2num.image_to_svg(rgba(32, 32), config=cfg(min_cluster_area=-1))


def test_negative_min_thickness_raises():
    with pytest.raises(ValueError, match="min_thickness"):
        img2num.image_to_svg(rgba(32, 32), config=cfg(min_thickness=-1))


def test_unknown_color_space_raises():
    with pytest.raises(ValueError, match="color_space"):
        img2num.image_to_svg(rgba(32, 32), config=cfg(color_space=2))


def test_config_attributes_can_be_mutated_into_an_invalid_state():
    c = ImageToSvgConfig()
    c.kmeans.k = 0
    with pytest.raises(ValueError, match=r"kmeans\.k"):
        img2num.image_to_svg(rgba(32, 32), config=c)
