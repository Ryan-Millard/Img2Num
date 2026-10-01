"""K-means contract tests.

The library seeds k-means++ from std::random_device, so label *values* differ
between runs. Tests therefore assert properties, or use inputs whose optimal
clustering is unique.
"""

import numpy as np
import pytest

import img2num


@pytest.mark.parametrize("color_space", [0, 1], ids=["lab", "rgb"])
def test_output_shapes_dtypes_and_label_range(color_space, random_rgba):
    k = 5
    pixels, labels = img2num.kmeans(random_rgba, k, 20, color_space)
    h, w = random_rgba.shape[:2]
    assert pixels.shape == (h, w, 4) and pixels.dtype == np.uint8
    assert labels.shape == (h, w) and labels.dtype == np.int32
    assert labels.min() >= 0 and labels.max() < k


@pytest.mark.parametrize("color_space", [0, 1], ids=["lab", "rgb"])
def test_output_has_at_most_k_opaque_colours(color_space, random_rgba):
    k = 4
    pixels, _ = img2num.kmeans(random_rgba, k, 20, color_space)
    assert len(np.unique(pixels.reshape(-1, 4), axis=0)) <= k
    assert np.all(pixels[..., 3] == 255)


@pytest.mark.parametrize("color_space", [0, 1], ids=["lab", "rgb"])
def test_two_colour_image_is_split_along_the_colour_boundary(color_space, two_colour):
    _, labels = img2num.kmeans(two_colour, 2, 50, color_space)
    left, right = labels[:, :12], labels[:, 12:]
    assert len(np.unique(left)) == 1
    assert len(np.unique(right)) == 1
    assert left[0, 0] != right[0, 0]


def test_pixels_with_the_same_label_share_a_colour(random_rgba):
    pixels, labels = img2num.kmeans(random_rgba, 6, 20, 0)
    for label in np.unique(labels):
        colours = pixels[labels == label]
        assert len(np.unique(colours, axis=0)) == 1


def test_k_larger_than_pixel_count_returns_valid_labels_or_value_error(rng):
    """Issue #635 proposes validating k <= pixel count (ValueError)."""
    img = rng.integers(0, 256, size=(2, 2, 4), dtype=np.uint8)
    try:
        _, labels = img2num.kmeans(img, 16, 10, 0)
    except ValueError:
        return
    assert labels.shape == (2, 2)
    assert labels.min() >= 0 and labels.max() < 16
