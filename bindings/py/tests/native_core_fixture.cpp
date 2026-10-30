// Controlled native core for testing the real binding's GIL and lock boundary.
// This is compiled only by the tests, never into the distributed extension.
#include <atomic>
#include <chrono>
#include <cstring>
#include <img2num.h>
#include <Python.h>
#include <stdexcept>
#include <thread>

namespace {
std::atomic<int> active_calls {0};
std::atomic<bool> pause_svg {false};
std::atomic<bool> resume_svg {false};

struct CoreCall {
    CoreCall() {
        if (PyGILState_Check()) {
            throw std::runtime_error("native core entered with GIL held");
        }
        if (active_calls.fetch_add(1) != 0) {
            active_calls.fetch_sub(1);
            throw std::runtime_error("concurrent access to shared native state");
        }
        std::this_thread::sleep_for(std::chrono::milliseconds(20));
    }
    ~CoreCall() {
        active_calls.fetch_sub(1);
    }
};
} // namespace

extern "C" void gil_test_pause_svg() {
    resume_svg.store(false);
    pause_svg.store(true);
}
extern "C" int gil_test_core_active() {
    return active_calls.load();
}
extern "C" void gil_test_resume_svg() {
    resume_svg.store(true);
}

namespace img2num {
void gaussian_blur_fft(uint8_t*, size_t, size_t, double sigma) {
    CoreCall call;
    if (sigma == -13.0) {
        throw std::runtime_error("injected native failure");
    }
}
void invert_image(uint8_t*, int, int) {
    CoreCall call;
}
void threshold_image(uint8_t*, int, int, int) {
    CoreCall call;
}
void black_threshold_image(uint8_t*, int, int, int) {
    CoreCall call;
}
void bilateral_filter(uint8_t*, size_t, size_t, double, double, uint8_t) {
    CoreCall call;
}
void kmeans(
    const uint8_t* data, uint8_t* output, int32_t* labels, int32_t width, int32_t height, int32_t,
    int32_t, uint8_t
) {
    CoreCall call;
    std::memcpy(output, data, static_cast<size_t>(width) * height * 4);
    std::memset(labels, 0, static_cast<size_t>(width) * height * sizeof(int32_t));
}
std::string labels_to_svg(const uint8_t*, const int32_t*, int, int, int, int) {
    CoreCall call;
    return "<svg xmlns=\"http://www.w3.org/2000/svg\"><path /></svg>";
}
std::string image_to_svg(const uint8_t*, int, int, const ImageToSvgConfig& config) {
    CoreCall call;
    if (pause_svg.exchange(false)) {
        while (!resume_svg.load()) {
            std::this_thread::sleep_for(std::chrono::milliseconds(1));
        }
    }
    return "<svg area=\"" + std::to_string(config.min_cluster_area) + "\" />";
}
} // namespace img2num
