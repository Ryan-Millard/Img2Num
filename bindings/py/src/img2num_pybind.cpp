#include <img2num.h>
#include <pybind11/numpy.h>
#include <pybind11/pybind11.h>

#include <cstdlib>

PYBIND11_MODULE(_img2num, m) {
    m.doc() = "Python bindings for the img2num C library";

    // -----------------------------------------------------------------------
    // All Functions return new image data
    // -----------------------------------------------------------------------

    m.def(
        "gaussian_blur_fft",
        [](pybind11::array_t<uint8_t, pybind11::array::c_style> image, size_t width, size_t height,
           double sigma) {
            pybind11::buffer_info buf = image.request();
            pybind11::array_t<uint8_t, pybind11::array::c_style> out_image(buf.shape);
            std::memcpy(out_image.mutable_data(), buf.ptr, buf.size * sizeof(uint8_t));

            img2num::gaussian_blur_fft(out_image.mutable_data(), width, height, sigma);
            return out_image;
        },
        pybind11::arg("image"), pybind11::arg("width"), pybind11::arg("height"), pybind11::arg("sigma"),
        "Apply Gaussian blur using FFT");

    m.def(
        "invert_image",
        [](pybind11::array_t<uint8_t, pybind11::array::c_style> image, int width, int height) {
            pybind11::buffer_info buf = image.request();
            pybind11::array_t<uint8_t, pybind11::array::c_style> out_image(buf.shape);
            std::memcpy(out_image.mutable_data(), buf.ptr, buf.size * sizeof(uint8_t));

            img2num::invert_image(out_image.mutable_data(), width, height);
            return out_image;
        },
        pybind11::arg("image"), pybind11::arg("width"), pybind11::arg("height"),
        "Invert image colors");

    m.def(
        "threshold_image",
        [](pybind11::array_t<uint8_t, pybind11::array::c_style> image, int width, int height,
           int num_thresholds) {
            pybind11::buffer_info buf = image.request();
            pybind11::array_t<uint8_t, pybind11::array::c_style> out_image(buf.shape);
            std::memcpy(out_image.mutable_data(), buf.ptr, buf.size * sizeof(uint8_t));
            img2num::threshold_image(out_image.mutable_data(), width, height, num_thresholds);
            return out_image;
        },
        pybind11::arg("image"), pybind11::arg("width"), pybind11::arg("height"), pybind11::arg("num_thresholds"),
        "Apply thresholding to the image");

    m.def(
        "black_threshold_image",
        [](pybind11::array_t<uint8_t, pybind11::array::c_style> image, int width, int height,
           int num_thresholds) {
            pybind11::buffer_info buf = image.request();
            pybind11::array_t<uint8_t, pybind11::array::c_style> out_image(buf.shape);
            std::memcpy(out_image.mutable_data(), buf.ptr, buf.size * sizeof(uint8_t));

            img2num::black_threshold_image(out_image.mutable_data(), width, height, num_thresholds);
            return out_image;
        },
        pybind11::arg("image"), pybind11::arg("width"), pybind11::arg("height"), pybind11::arg("num_thresholds"),
        "Apply black thresholding to the image");

    m.def(
        "bilateral_filter",
        [](pybind11::array_t<uint8_t, pybind11::array::c_style> image, size_t width, size_t height,
           double sigma_spatial, double sigma_range, uint8_t color_space) {
            pybind11::buffer_info buf = image.request();
            pybind11::array_t<uint8_t, pybind11::array::c_style> out_image(buf.shape);
            std::memcpy(out_image.mutable_data(), buf.ptr, buf.size * sizeof(uint8_t));

            img2num::bilateral_filter(out_image.mutable_data(), width, height, sigma_spatial,
                                     sigma_range, color_space);
            return out_image;
        },
        pybind11::arg("image"), pybind11::arg("width"), pybind11::arg("height"), pybind11::arg("sigma_spatial"),
        pybind11::arg("sigma_range"), pybind11::arg("color_space"),
        "Apply bilateral filter");

    m.def(
        "kmeans",
        [](pybind11::array_t<uint8_t, pybind11::array::c_style> data, int32_t width, int32_t height, int32_t k,
           int32_t max_iter, uint8_t color_space) {
            pybind11::buffer_info data_buf = data.request();

            // Allocate NumPy arrays for the outputs
            auto out_data = pybind11::array_t<uint8_t>(data_buf.shape);
            auto out_labels = pybind11::array_t<int32_t>({(ssize_t)height, (ssize_t)width});

            auto out_data_ptr = static_cast<uint8_t*>(out_data.mutable_data());
            auto out_labels_ptr = static_cast<int32_t*>(out_labels.mutable_data());

            // Call C function
            img2num::kmeans(static_cast<const uint8_t*>(data_buf.ptr), out_data_ptr, out_labels_ptr,
                           width, height, k, max_iter, color_space);

            // Return a tuple of (out_data, out_labels)
            return pybind11::make_tuple(out_data, out_labels);
        },
        pybind11::arg("data"), pybind11::arg("width"), pybind11::arg("height"), pybind11::arg("k"), pybind11::arg("max_iter"),
        pybind11::arg("color_space"),
        "Run K-Means clustering. Returns a tuple: (quantized_image, labels_array)");

    m.def(
        "labels_to_svg",
        [](pybind11::array_t<uint8_t, pybind11::array::c_style> data,
           pybind11::array_t<int32_t, pybind11::array::c_style> labels, int width, int height, int min_area) {

            const uint8_t* data_ptr{static_cast<const uint8_t*>(data.request().ptr)};
            const int32_t* labels_ptr{static_cast<const int32_t*>(labels.request().ptr)};
            char* svg_c_str = img2num::labels_to_svg(data_ptr, labels_ptr, width, height, min_area);

            if (!svg_c_str) {
                throw std::runtime_error("img2num::labels_to_svg returned a null pointer.");
            }

            // Convert to Python string
            pybind11::str svg_py_str(svg_c_str);

            // NOTE: If your C library dynamically allocates this string using malloc/calloc,
            // you MUST free it here to prevent a memory leak. If it returns a static pointer,
            // remove this line.
            std::free(svg_c_str);

            return svg_py_str;
        },
        pybind11::arg("data"), pybind11::arg("labels"), pybind11::arg("width"), pybind11::arg("height"),
        pybind11::arg("min_area"), "Convert labels to SVG string");
}
