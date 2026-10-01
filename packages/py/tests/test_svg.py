"""SVG generation: labels_to_svg and the full image_to_svg pipeline."""

import re
import xml.etree.ElementTree as ET

import numpy as np
import pytest

import img2num
from img2num import ImageToSvgConfig

SVG_NS = "{http://www.w3.org/2000/svg}"
FILL = re.compile(r'fill="(#[0-9A-Fa-f]{6})"')


def parse_svg(svg: str) -> ET.Element:
    assert isinstance(svg, str)
    root = ET.fromstring(svg)  # raises ParseError if not well-formed
    assert root.tag == f"{SVG_NS}svg"
    return root


def test_image_to_svg_returns_well_formed_svg_with_image_size(random_rgba):
    root = parse_svg(img2num.image_to_svg(random_rgba))
    h, w = random_rgba.shape[:2]
    assert root.attrib["width"] == str(w)
    assert root.attrib["height"] == str(h)
    paths = root.findall(f"{SVG_NS}path")
    assert paths, "expected at least one <path>"
    for p in paths:
        assert p.attrib["d"].startswith("M")
        assert FILL.fullmatch(f'fill="{p.attrib["fill"]}"')


def test_default_config_equals_explicit_default_config(two_colour):
    # two_colour has a unique optimal clustering, so output is deterministic.
    assert img2num.image_to_svg(two_colour) == img2num.image_to_svg(
        two_colour, config=ImageToSvgConfig()
    )


def test_two_colour_image_produces_exactly_its_colours(two_colour):
    svg = img2num.image_to_svg(
        two_colour, config=ImageToSvgConfig(kmeans={"k": 2}, min_cluster_area=1)
    )
    assert {c.upper() for c in FILL.findall(svg)} == {"#000000", "#0000FF"}


def test_min_cluster_area_removes_small_regions(two_colour_with_speck):
    def path_count(min_area: int) -> int:
        cfg = ImageToSvgConfig(kmeans={"k": 3}, min_cluster_area=min_area)
        return len(parse_svg(img2num.image_to_svg(two_colour_with_speck, config=cfg)))

    assert path_count(50) < path_count(1)


def test_labels_to_svg_matches_the_documented_types(two_colour):
    pixels, labels = img2num.kmeans(two_colour, 2, 50, 0)
    root = parse_svg(img2num.labels_to_svg(two_colour, labels, 1, 0))
    assert len(root.findall(f"{SVG_NS}path")) >= 2


def test_labels_must_be_int32(two_colour):
    labels = np.zeros(two_colour.shape[:2], dtype=np.int64)
    with pytest.raises(TypeError):
        img2num.labels_to_svg(two_colour, labels, 1, 0)


def test_config_must_be_passed_by_keyword(two_colour):
    with pytest.raises(TypeError):
        img2num.image_to_svg(two_colour, ImageToSvgConfig())


@pytest.mark.parametrize("size", [(1, 1), (1, 7), (7, 1)])
def test_tiny_images_return_svg_or_raise_value_error(size):
    """Must never crash. Issue #635 may start rejecting images below a minimum
    size with ValueError; until then a valid SVG is returned."""
    img = np.zeros((*size, 4), dtype=np.uint8)
    img[..., 3] = 255
    try:
        svg = img2num.image_to_svg(img)
    except ValueError:
        return
    parse_svg(svg)
