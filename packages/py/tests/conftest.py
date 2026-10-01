"""Shared fixtures for the img2num Python binding tests.

All inputs are small, synthetic and generated in code (no binary fixtures),
so the suite stays fast and needs no extra licensing.
"""

import numpy as np
import pytest

import img2num

# Pixel colours (RGBA) used by the structured fixtures.
BLACK = (0, 0, 0, 255)
BLUE = (0, 0, 255, 255)
GREEN = (0, 255, 0, 255)

# GPU-backed ops (bilateral_filter, kmeans) may differ by one intensity level
# between GPU vendors/drivers because of float rounding before uint8 storage.
GPU_ATOL = 1


def solid(height: int, width: int, rgba=(120, 120, 120, 255)) -> np.ndarray:
    img = np.empty((height, width, 4), dtype=np.uint8)
    img[...] = rgba
    return img


@pytest.fixture
def make_solid():
    """Factory fixture: make_solid(h, w, rgba) -> uniform RGBA image."""
    return solid


@pytest.fixture
def rng() -> np.random.Generator:
    return np.random.default_rng(seed=1234)


@pytest.fixture
def random_rgba(rng) -> np.ndarray:
    """Opaque random RGBA image (H=24, W=32: non-square on purpose)."""
    img = rng.integers(0, 256, size=(24, 32, 4), dtype=np.uint8)
    img[..., 3] = 255
    return img


@pytest.fixture
def two_colour() -> np.ndarray:
    """Left half black, right half blue (H=16, W=24). K-means with k=2 has
    exactly one optimal solution, so results are deterministic despite the
    library's random k-means++ seeding."""
    img = solid(16, 24, BLACK)
    img[:, 12:] = BLUE
    return img


@pytest.fixture
def two_colour_with_speck() -> np.ndarray:
    """Two halves plus a 3x3 green speck: used to test min_cluster_area."""
    img = solid(40, 40, BLACK)
    img[:, 20:] = BLUE
    img[5:8, 5:8] = GREEN
    return img


@pytest.fixture(scope="session", autouse=True)
def _working_compute_backend():
    """Fail fast with an actionable message if the compute backend is broken.

    On Linux machines without any Vulkan driver, Dawn can select its Null
    adapter; the GPU code path then returns uninitialised memory instead of
    falling back to the CPU implementation. A bilateral filter must leave a
    uniform image unchanged, so that is a cheap, unambiguous probe.
    """
    probe = solid(8, 8)
    out = img2num.bilateral_filter(probe, 3.0, 50.0, 0)
    # Real GPUs may round differently by 1; garbage output is far off.
    if np.abs(out.astype(int) - probe.astype(int)).max() > GPU_ATOL:
        pytest.exit(
            "img2num's compute backend returned garbage for a trivial input. "
            "This usually means no GPU/Vulkan driver is installed and Dawn "
            "selected its Null adapter. Install a software Vulkan driver "
            "(e.g. `apt install mesa-vulkan-drivers`) or run the tests inside "
            "the dev container (./img2num).",
            returncode=3,
        )
