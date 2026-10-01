"""ImageToSvgConfig construction, defaults and attribute access."""

import pytest

from img2num import ImageToSvgConfig


def test_defaults_match_the_cpp_core():
    cfg = ImageToSvgConfig()
    assert cfg.bilateral_filter.sigma_spatial == pytest.approx(3.0)
    assert cfg.bilateral_filter.sigma_range == pytest.approx(50.0)
    assert cfg.kmeans.k == 16
    assert cfg.kmeans.max_iter == 100
    assert cfg.min_cluster_area == 100
    assert cfg.min_thickness == 0
    assert cfg.color_space == 0


def test_dict_and_keyword_overrides():
    cfg = ImageToSvgConfig(
        bilateral_filter={"sigma_spatial": 1.5, "sigma_range": 10},
        kmeans={"k": 4, "max_iter": 7},
        min_cluster_area=5,
        min_thickness=2,
        color_space=1,
    )
    assert cfg.bilateral_filter.sigma_spatial == pytest.approx(1.5)
    assert cfg.bilateral_filter.sigma_range == pytest.approx(10.0)
    assert (cfg.kmeans.k, cfg.kmeans.max_iter) == (4, 7)
    assert (cfg.min_cluster_area, cfg.min_thickness, cfg.color_space) == (5, 2, 1)


def test_partial_dict_keeps_other_defaults():
    cfg = ImageToSvgConfig(kmeans={"k": 3})
    assert cfg.kmeans.k == 3
    assert cfg.kmeans.max_iter == 100


def test_attributes_are_writable():
    cfg = ImageToSvgConfig()
    cfg.min_cluster_area = 1
    cfg.color_space = 1
    assert (cfg.min_cluster_area, cfg.color_space) == (1, 1)


def test_nested_configs_are_references_not_copies():
    cfg = ImageToSvgConfig()
    cfg.kmeans.k = 3
    cfg.bilateral_filter.sigma_range = 12.5
    assert cfg.kmeans.k == 3
    assert cfg.bilateral_filter.sigma_range == pytest.approx(12.5)


def test_repr_reflects_values():
    text = repr(ImageToSvgConfig(kmeans={"k": 7}, min_cluster_area=9))
    assert "ImageToSvgConfig" in text
    assert "'k': 7" in text
    assert "min_cluster_area: 9" in text


@pytest.mark.parametrize("value", [-1, 256])
def test_color_space_must_fit_in_uint8(value):
    cfg = ImageToSvgConfig()
    with pytest.raises(TypeError):
        cfg.color_space = value


def test_wrong_type_in_override_dict_is_rejected():
    # pybind11 reports cast failures from the custom __init__ as RuntimeError.
    with pytest.raises((TypeError, RuntimeError)):
        ImageToSvgConfig(kmeans={"k": "four"})
