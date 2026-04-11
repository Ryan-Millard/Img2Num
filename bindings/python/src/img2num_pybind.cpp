#include <cimg2num.h>
#include <pybind11/numpy.h>
#include <pybind11/pybind11.h>

#include <cstdlib>

namespace py = pybind11;

PYBIND11_MODULE(img2num, m) {
    m.doc() = "Python bindings for the img2num C library";

    // -----------------------------------------------------------------------
    // In-place Image Modification Functions
    // -----------------------------------------------------------------------

    m.def(
        "gaussian_blur_fft",
        [](py::array_t<uint8_t, py::array::c_style> image, size_t width, size_t height,
           double sigma) {
            // mutable_data() gets the raw pointer and ensures the array is writable
            img2num_gaussian_blur_fft(image.mutable_data(), width, height, sigma);
        },
        py::arg("image"), py::arg("width"), py::arg("height"), py::arg("sigma"),
        "Apply Gaussian blur using FFT (modifies image in-place)");

    m.def(
        "invert_image",
        [](py::array_t<uint8_t, py::array::c_style> image, int width, int height) {
            img2num_invert_image(image.mutable_data(), width, height);
        },
        py::arg("image"), py::arg("width"), py::arg("height"),
        "Invert image colors (modifies image in-place)");

    m.def(
        "threshold_image",
        [](py::array_t<uint8_t, py::array::c_style> image, int width, int height,
           int num_thresholds) {
            img2num_threshold_image(image.mutable_data(), width, height, num_thresholds);
        },
        py::arg("image"), py::arg("width"), py::arg("height"), py::arg("num_thresholds"),
        "Apply thresholding to the image (modifies image in-place)");

    m.def(
        "black_threshold_image",
        [](py::array_t<uint8_t, py::array::c_style> image, int width, int height,
           int num_thresholds) {
            img2num_black_threshold_image(image.mutable_data(), width, height, num_thresholds);
        },
        py::arg("image"), py::arg("width"), py::arg("height"), py::arg("num_thresholds"),
        "Apply black thresholding to the image (modifies image in-place)");

    m.def(
        "bilateral_filter",
        [](py::array_t<uint8_t, py::array::c_style> image, size_t width, size_t height,
           double sigma_spatial, double sigma_range, uint8_t color_space) {
            img2num_bilateral_filter(image.mutable_data(), width, height, sigma_spatial,
                                     sigma_range, color_space);
        },
        py::arg("image"), py::arg("width"), py::arg("height"), py::arg("sigma_spatial"),
        py::arg("sigma_range"), py::arg("color_space"),
        "Apply bilateral filter (modifies image in-place)");

    // -----------------------------------------------------------------------
    // Functions that Return New Data
    // -----------------------------------------------------------------------

    m.def(
        "kmeans",
        [](py::array_t<uint8_t, py::array::c_style> data, int32_t width, int32_t height, int32_t k,
           int32_t max_iter, uint8_t color_space) {
            py::buffer_info data_buf = data.request();

            // Allocate NumPy arrays for the outputs
            auto out_data = py::array_t<uint8_t>(data_buf.shape);
            auto out_labels = py::array_t<int32_t>({(ssize_t)height, (ssize_t)width});

            auto out_data_ptr = static_cast<uint8_t*>(out_data.mutable_data());
            auto out_labels_ptr = static_cast<int32_t*>(out_labels.mutable_data());

            // Call C function
            img2num_kmeans(static_cast<const uint8_t*>(data_buf.ptr), out_data_ptr, out_labels_ptr,
                           width, height, k, max_iter, color_space);

            // Return a tuple of (out_data, out_labels)
            return py::make_tuple(out_data, out_labels);
        },
        py::arg("data"), py::arg("width"), py::arg("height"), py::arg("k"), py::arg("max_iter"),
        py::arg("color_space"),
        "Run K-Means clustering. Returns a tuple: (quantized_image, labels_array)");

    m.def(
        "labels_to_svg",
        [](py::array_t<uint8_t, py::array::c_style> data,
           py::array_t<int32_t, py::array::c_style> labels, int width, int height, int min_area) {
            char* svg_c_str = img2num_labels_to_svg(
                static_cast<const uint8_t*>(data.request().ptr),
                static_cast<const int32_t*>(labels.request().ptr), width, height, min_area);

            if (!svg_c_str) {
                throw std::runtime_error("img2num_labels_to_svg returned a null pointer.");
            }

            // Convert to Python string
            py::str svg_py_str(svg_c_str);

            // NOTE: If your C library dynamically allocates this string using malloc/calloc,
            // you MUST free it here to prevent a memory leak. If it returns a static pointer,
            // remove this line.
            free(svg_c_str);

            return svg_py_str;
        },
        py::arg("data"), py::arg("labels"), py::arg("width"), py::arg("height"),
        py::arg("min_area"), "Convert labels to SVG string");
}