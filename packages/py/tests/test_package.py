"""Packaging and import-surface tests."""

import importlib.resources
from pathlib import Path

import img2num

PUBLIC_API = {
    "ImageToSvgConfig",
    "bilateral_filter",
    "black_threshold_image",
    "gaussian_blur_fft",
    "image_to_svg",
    "invert_image",
    "kmeans",
    "labels_to_svg",
    "threshold_image",
}


def test_public_api_is_exported():
    assert set(img2num.__all__) == PUBLIC_API
    for name in PUBLIC_API:
        assert hasattr(img2num, name), name


def test_extension_is_imported_from_the_installed_package():
    """Guards against the tests silently importing packages/py/img2num from
    the source tree (which has no compiled extension)."""
    ext = Path(img2num._img2num.__file__)
    assert ext.parent == Path(img2num.__file__).parent
    assert ext.suffix in {".so", ".pyd"}


def test_type_information_is_shipped():
    files = importlib.resources.files("img2num")
    assert files.joinpath("py.typed").is_file()
