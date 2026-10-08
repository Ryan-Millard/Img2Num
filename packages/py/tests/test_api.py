"""Tests for the pure-Python layer in ``img2num/api.py``.

The compiled functions (``img2num.api._invert_image`` and friends) are replaced
with recording fakes, so these tests exercise only the Python code:

* the ``_inject_dimensions`` decorator (reads ``(height, width)`` from the
  array shape, rejects inputs with fewer than two dimensions, and hides
  ``width``/``height`` from the public signatures), and
* each wrapper's forwarding of its arguments to the extension.

No C++ code runs, so the results do not depend on the compute backend. What
the C++ functions compute is tested by the C++ suites (see #185).
"""

import inspect

import numpy as np
import pytest

import img2num
import img2num.api as api

# A non-square shape makes a swapped width/height visible.
HEIGHT, WIDTH = 3, 5
LABELS = np.zeros((HEIGHT, WIDTH), dtype=np.int32)

# name -> (public parameters, extra args after the image, expected extension
#          args after the image, given the image's width and height).
# Extra args avoid default-looking values (e.g. color_space=1, not 0) so a
# wrapper that drops or hard-codes an argument is caught.
WRAPPERS = {
    "gaussian_blur_fft": (
        ["image", "sigma"],
        (1.5,),
        lambda w, h: (w, h, 1.5),
    ),
    "invert_image": (
        ["image"],
        (),
        lambda w, h: (w, h),
    ),
    "threshold_image": (
        ["image", "num_thresholds"],
        (4,),
        lambda w, h: (w, h, 4),
    ),
    "black_threshold_image": (
        ["image", "num_thresholds"],
        (4,),
        lambda w, h: (w, h, 4),
    ),
    "bilateral_filter": (
        ["image", "sigma_spatial", "sigma_range", "color_space"],
        (3.0, 50.0, 1),
        lambda w, h: (w, h, 3.0, 50.0, 1),
    ),
    "kmeans": (
        ["data", "k", "max_iter", "color_space"],
        (5, 20, 1),
        lambda w, h: (w, h, 5, 20, 1),
    ),
    "labels_to_svg": (
        ["data", "labels", "min_area", "min_thickness"],
        (LABELS, 7, 2),
        # labels_to_svg is the one wrapper whose dimensions are not
        # directly after the image.
        lambda w, h: (LABELS, w, h, 7, 2),
    ),
}

ALL_WRAPPERS = [*WRAPPERS, "image_to_svg"]


class Recorder:
    """Stands in for one compiled function and records how it was called."""

    def __init__(self):
        self.calls = []
        self.result = object()

    def __call__(self, *args, **kwargs):
        self.calls.append((args, kwargs))
        return self.result


@pytest.fixture
def fake_extension(monkeypatch):
    """Replace every compiled function used by ``api.py`` with a Recorder."""
    fakes = {}
    for name in ALL_WRAPPERS:
        fakes[name] = Recorder()
        monkeypatch.setattr(api, f"_{name}", fakes[name])
    return fakes


@pytest.fixture
def image():
    return np.zeros((HEIGHT, WIDTH, 4), dtype=np.uint8)


# ---- forwarding --------------------------------------------------------------


@pytest.mark.parametrize("name", WRAPPERS)
def test_forwards_arguments_with_dimensions_from_the_shape(name, fake_extension, image):
    _, extra, expected = WRAPPERS[name]
    fake = fake_extension[name]

    result = getattr(img2num, name)(image, *extra)

    assert result is fake.result
    assert len(fake.calls) == 1
    args, kwargs = fake.calls[0]
    assert args[0] is image
    assert args[1:] == expected(WIDTH, HEIGHT)
    assert kwargs == {}


@pytest.mark.parametrize("name", WRAPPERS)
def test_arguments_can_be_passed_by_keyword(name, fake_extension, image):
    params, extra, expected = WRAPPERS[name]
    fake = fake_extension[name]

    getattr(img2num, name)(**dict(zip(params, (image, *extra), strict=True)))

    args, _ = fake.calls[0]
    assert args[0] is image
    assert args[1:] == expected(WIDTH, HEIGHT)


def test_two_dimensional_input_uses_its_shape(fake_extension):
    grey = np.zeros((HEIGHT, WIDTH), dtype=np.uint8)

    img2num.invert_image(grey)

    args, _ = fake_extension["invert_image"].calls[0]
    assert args == (grey, WIDTH, HEIGHT)


# ---- input checks done in Python ---------------------------------------------


@pytest.mark.parametrize("name", ALL_WRAPPERS)
@pytest.mark.parametrize("shape", [(), (16,)], ids=["0d", "1d"])
def test_input_with_fewer_than_two_dimensions_is_rejected(name, shape, fake_extension):
    fn = getattr(img2num, name)
    extra = WRAPPERS[name][1] if name in WRAPPERS else ()

    with pytest.raises(ValueError, match=r"\(H, W\)"):
        fn(np.zeros(shape, dtype=np.uint8), *extra)
    assert fake_extension[name].calls == []


@pytest.mark.parametrize("name", ALL_WRAPPERS)
@pytest.mark.parametrize("dimension", ["width", "height"])
def test_explicit_width_or_height_is_rejected(name, dimension, fake_extension, image):
    fn = getattr(img2num, name)
    extra = WRAPPERS[name][1] if name in WRAPPERS else ()

    with pytest.raises(TypeError):
        fn(image, *extra, **{dimension: 1})
    assert fake_extension[name].calls == []


# ---- image_to_svg configuration handling -------------------------------------


def test_image_to_svg_uses_a_new_default_config_on_each_call(fake_extension, image):
    img2num.image_to_svg(image)
    img2num.image_to_svg(image)

    calls = fake_extension["image_to_svg"].calls
    assert [args[:3] for args, _ in calls] == [(image, WIDTH, HEIGHT)] * 2
    first, second = calls[0][0][3], calls[1][0][3]
    assert isinstance(first, img2num.ImageToSvgConfig)
    assert isinstance(second, img2num.ImageToSvgConfig)
    assert first is not second


def test_image_to_svg_forwards_the_given_config(fake_extension, image):
    config = img2num.ImageToSvgConfig()

    result = img2num.image_to_svg(image, config=config)

    assert result is fake_extension["image_to_svg"].result
    args, _ = fake_extension["image_to_svg"].calls[0]
    assert args == (image, WIDTH, HEIGHT, config)
    assert args[3] is config


def test_image_to_svg_config_cannot_be_passed_positionally(fake_extension, image):
    with pytest.raises(TypeError):
        img2num.image_to_svg(image, img2num.ImageToSvgConfig())
    assert fake_extension["image_to_svg"].calls == []


# ---- public signatures and metadata ------------------------------------------


@pytest.mark.parametrize("name", WRAPPERS)
def test_public_signature_hides_width_and_height(name):
    params = list(inspect.signature(getattr(img2num, name)).parameters)
    assert params == WRAPPERS[name][0]


def test_image_to_svg_signature():
    params = inspect.signature(img2num.image_to_svg).parameters
    assert list(params) == ["image", "config"]
    assert params["config"].kind is inspect.Parameter.KEYWORD_ONLY
    assert params["config"].default is None


@pytest.mark.parametrize("name", ALL_WRAPPERS)
def test_wrapper_keeps_its_name_and_docstring(name):
    fn = getattr(img2num, name)
    assert fn.__name__ == name
    assert fn.__module__ == "img2num.api"
    assert fn.__doc__
