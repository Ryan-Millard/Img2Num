"""Native GIL boundaries plus integration checks against the built extension.

The controlled core compiles the actual production binding source. Its native
calls require a released GIL and serialized entry, and provide deterministic
exception/config-snapshot scenarios. Separate tests exercise the real core.
All threaded scenarios run in subprocesses so deadlocks have an external limit.
"""

import os
from pathlib import Path
import subprocess
import sys
import sysconfig
import textwrap

import pybind11
import pytest

ROOT = Path(__file__).resolve().parents[3]
OPERATIONS = (
    "gaussian_blur_fft",
    "invert_image",
    "threshold_image",
    "black_threshold_image",
    "bilateral_filter",
    "kmeans",
    "labels_to_svg",
    "image_to_svg",
)
SETUP = """
import numpy as np
image = np.full((24, 24, 4), 120, dtype=np.uint8)
image[:, :, 3] = 255
labels = np.zeros((24, 24), dtype=np.int32)
config = native.ImageToSvgConfig(kmeans={"k": 1, "max_iter": 2}, min_cluster_area=1)
calls = {
    "gaussian_blur_fft": lambda: native.gaussian_blur_fft(image, 24, 24, 1.0),
    "invert_image": lambda: native.invert_image(image, 24, 24),
    "threshold_image": lambda: native.threshold_image(image, 24, 24, 4),
    "black_threshold_image": lambda: native.black_threshold_image(image, 24, 24, 80),
    "bilateral_filter": lambda: native.bilateral_filter(image, 24, 24, 3.0, 50.0, 0),
    "kmeans": lambda: native.kmeans(image, 24, 24, 1, 2, 1),
    "labels_to_svg": lambda: native.labels_to_svg(image, labels, 24, 24, 1, 0),
    "image_to_svg": lambda: native.image_to_svg(image, 24, 24, config),
}
"""


def run_child(code, extension_dir=None):
    environment = os.environ.copy()
    if extension_dir is not None:
        environment["PYTHONPATH"] = str(extension_dir)
        prefix = "import _img2num as native\n"
    else:
        prefix = "from img2num import _img2num as native\n"
    result = subprocess.run(
        [sys.executable, "-c", prefix + SETUP + textwrap.dedent(code)],
        env=environment,
        capture_output=True,
        text=True,
        timeout=60,
    )
    assert result.returncode == 0, result.stdout + result.stderr


@pytest.fixture(scope="session")
def controlled_extension(tmp_path_factory):
    if sys.platform == "win32":
        pytest.skip("controlled fixture build requires a POSIX C++ toolchain")
    output_dir = tmp_path_factory.mktemp("native-gil-fixture")
    # A baseline source override lets maintainers demonstrate the regression.
    binding = Path(
        os.environ.get(
            "IMG2NUM_TEST_BINDINGS_SOURCE", ROOT / "bindings/py/src/img2num_pybind.cpp"
        )
    )
    output = output_dir / ("_img2num" + sysconfig.get_config_var("EXT_SUFFIX"))
    command = [
        os.environ.get("CXX", "c++"),
        "-std=c++17",
        "-bundle" if sys.platform == "darwin" else "-shared",
        "-fPIC",
        "-pthread",
        "-O0",
        "-I" + pybind11.get_include(),
        "-I" + sysconfig.get_path("include"),
        "-I" + str(ROOT / "core/include"),
        str(binding),
        str(Path(__file__).with_name("native_core_fixture.cpp")),
        *(["-undefined", "dynamic_lookup"] if sys.platform == "darwin" else []),
        "-o",
        str(output),
    ]
    subprocess.run(command, check=True, capture_output=True, text=True, timeout=120)
    return output_dir


@pytest.mark.parametrize("operation", OPERATIONS)
def test_each_binding_releases_gil(controlled_extension, operation):
    run_child(f"calls[{operation!r}]()", controlled_extension)


def test_native_entries_share_one_lock(controlled_extension):
    run_child(
        """
        import concurrent.futures
        import threading
        gate = threading.Barrier(len(calls) + 1)
        def run(operation):
            gate.wait()
            return operation()
        with concurrent.futures.ThreadPoolExecutor(max_workers=len(calls)) as pool:
            futures = [pool.submit(run, operation) for operation in calls.values()]
            gate.wait()
            for future in futures:
                future.result()
    """,
        controlled_extension,
    )


def test_native_exception_restores_gil_and_unlocks_core(controlled_extension):
    run_child(
        """
        try:
            native.gaussian_blur_fft(image, 24, 24, -13.0)
        except RuntimeError as error:
            assert str(error) == "injected native failure"
        else:
            raise AssertionError("Expected the controlled native exception")
        output = calls["invert_image"]()
        np.testing.assert_array_equal(output, image)
    """,
        controlled_extension,
    )


def test_config_is_snapshotted_before_release(controlled_extension):
    run_child(
        """
        import concurrent.futures
        import ctypes
        import time
        control = ctypes.PyDLL(native.__file__)
        control.gil_test_core_active.restype = ctypes.c_int
        config.min_cluster_area = 101
        control.gil_test_pause_svg()
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            future = pool.submit(calls["image_to_svg"])
            deadline = time.monotonic() + 5
            while not control.gil_test_core_active():
                assert time.monotonic() < deadline, "Native operation did not start"
                time.sleep(0.001)
            config.min_cluster_area = 999
            # Publishing this atomic flag orders the write before the core's
            # later read; the regression test introduces no unsynchronized read.
            control.gil_test_resume_svg()
            assert future.result() == '<svg area="101" />'
    """,
        controlled_extension,
    )


@pytest.mark.parametrize("operation", OPERATIONS)
def test_real_core_returns_valid_results_and_preserves_inputs(operation):
    run_child(f"""
        import xml.etree.ElementTree as ET
        original = image.copy()
        original_labels = labels.copy()
        result = calls[{operation!r}]()
        if isinstance(result, str):
            assert ET.fromstring(result).tag == "{{http://www.w3.org/2000/svg}}svg"
            assert "<path" in result
        else:
            output = result[0] if isinstance(result, tuple) else result
            assert output.shape == image.shape and output.dtype == np.uint8
            assert not np.shares_memory(output, image)
            assert np.all(output[:, :, 3] == 255)
            if {operation!r} == "invert_image":
                assert np.all(output[:, :, :3] == 135)
            if {operation!r} == "kmeans":
                assert result[1].shape == labels.shape and result[1].dtype == np.int32
                assert np.all(result[1] == 0)
                np.testing.assert_allclose(output[:, :, :3], 120, atol=1)
        np.testing.assert_array_equal(image, original)
        np.testing.assert_array_equal(labels, original_labels)
    """)


def test_python_thread_advances_during_real_native_call():
    run_child("""
        import threading
        import time
        grey = np.random.default_rng(7).integers(0, 256, (320, 320), dtype=np.uint8)
        pixels = np.ascontiguousarray(
            np.dstack([grey, grey, grey, np.full_like(grey, 255)])
        )
        fixed_labels = np.ascontiguousarray((grey // 64).astype(np.int32))
        ready, go = threading.Event(), threading.Event()
        state = {}
        def work():
            ready.set()
            go.wait()
            state["start"] = time.perf_counter()
            state["svg"] = native.labels_to_svg(pixels, fixed_labels, 320, 320, 30, 0)
            state["end"] = time.perf_counter()
        worker = threading.Thread(target=work)
        worker.start()
        assert ready.wait(5)
        ticks = []
        go.set()
        while worker.is_alive():
            ticks.append(time.perf_counter())
            time.sleep(0.005)
        worker.join()
        elapsed = state["end"] - state["start"]
        # Exclude setup and return-boundary ticks. No exact rate is asserted.
        assert any(state["start"] + elapsed * 0.2 < tick <
                   state["end"] - elapsed * 0.2 for tick in ticks)
        assert "<svg" in state["svg"]
    """)


def test_concurrent_first_use_of_gpu_reaching_operations():
    run_child("""
        import concurrent.futures
        import threading
        import xml.etree.ElementTree as ET
        kinds = ("bilateral_filter", "kmeans", "image_to_svg")
        gate = threading.Barrier(4)
        def work(kind):
            gate.wait()
            return calls[kind]()
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
            futures = [pool.submit(work, kind) for kind in kinds]
            gate.wait()
            filtered, clustered, svg = [future.result() for future in futures]
        assert filtered.shape == image.shape
        assert clustered[0].shape == image.shape and np.all(clustered[1] == 0)
        assert ET.fromstring(svg).tag == "{http://www.w3.org/2000/svg}svg"
    """)


def test_two_concurrent_image_to_svg_calls_finish():
    run_child("""
        import concurrent.futures
        import threading
        import xml.etree.ElementTree as ET
        gate = threading.Barrier(3)
        def work():
            gate.wait()
            return calls["image_to_svg"]()
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            futures = [pool.submit(work) for _ in range(2)]
            gate.wait()
            results = [future.result() for future in futures]
        for svg in results:
            assert ET.fromstring(svg).tag == "{http://www.w3.org/2000/svg}svg"
            assert "<path" in svg
    """)
