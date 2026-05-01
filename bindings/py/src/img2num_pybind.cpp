#include <img2num.h>
#include <pybind11/numpy.h>
#include <pybind11/pybind11.h>

#include <cstdlib>

PYBIND11_MODULE(_img2num, m) {
    m.doc() = "Python bindings for the img2num C++ library";

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
        pybind11::arg("image"), pybind11::arg("width"), pybind11::arg("height"),
        pybind11::arg("sigma"), "Apply Gaussian blur using FFT");

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
        pybind11::arg("image"), pybind11::arg("width"), pybind11::arg("height"),
        pybind11::arg("num_thresholds"), "Apply thresholding to the image");

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
        pybind11::arg("image"), pybind11::arg("width"), pybind11::arg("height"),
        pybind11::arg("num_thresholds"), "Apply black thresholding to the image");

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
        pybind11::arg("image"), pybind11::arg("width"), pybind11::arg("height"),
        pybind11::arg("sigma_spatial"), pybind11::arg("sigma_range"), pybind11::arg("color_space"),
        "Apply bilateral filter");

    m.def(
        "kmeans",
        [](pybind11::array_t<uint8_t, pybind11::array::c_style> data, int32_t width, int32_t height,
           int32_t k, int32_t max_iter, uint8_t color_space) {
            pybind11::buffer_info data_buf = data.request();

            // Allocate NumPy arrays for the outputs
            auto out_data = pybind11::array_t<uint8_t>(data_buf.shape);
            auto out_labels = pybind11::array_t<int32_t>({(ssize_t)height, (ssize_t)width});

            auto out_data_ptr = static_cast<uint8_t *>(out_data.mutable_data());
            auto out_labels_ptr = static_cast<int32_t *>(out_labels.mutable_data());

            // Call C function
            img2num::kmeans(static_cast<const uint8_t *>(data_buf.ptr), out_data_ptr,
                            out_labels_ptr, width, height, k, max_iter, color_space);

            // Return a tuple of (out_data, out_labels)
            return pybind11::make_tuple(out_data, out_labels);
        },
        pybind11::arg("data"), pybind11::arg("width"), pybind11::arg("height"), pybind11::arg("k"),
        pybind11::arg("max_iter"), pybind11::arg("color_space"),
        "Run K-Means clustering. Returns a tuple: (quantized_image, labels_array)");

    m.def(
        "labels_to_svg",
        [](pybind11::array_t<uint8_t, pybind11::array::c_style> data,
           pybind11::array_t<int32_t, pybind11::array::c_style> labels, int width, int height,
           int min_area) {
            const uint8_t *data_ptr{static_cast<const uint8_t *>(data.request().ptr)};
            const int32_t *labels_ptr{static_cast<const int32_t *>(labels.request().ptr)};

            std::string svg{img2num::labels_to_svg(data_ptr, labels_ptr, width, height, min_area)};
            pybind11::str svg_py_str(std::move(svg));

            return svg_py_str;
        },
        pybind11::arg("data"), pybind11::arg("labels"), pybind11::arg("width"),
        pybind11::arg("height"), pybind11::arg("min_area"), "Convert labels to SVG string");

    pybind11::class_<img2num::ImageToSvgConfig> config(m, "ImageToSvgConfig");
    pybind11::class_<img2num::ImageToSvgConfig::BilateralFilterConfig>(config,
                                                                       "BilateralFilterConfig")
        .def(pybind11::init<>())
        .def_readwrite("sigma_spatial",
                       &img2num::ImageToSvgConfig::BilateralFilterConfig::sigma_spatial)
        .def_readwrite("sigma_range",
                       &img2num::ImageToSvgConfig::BilateralFilterConfig::sigma_range)
        .def("__repr__", [](const img2num::ImageToSvgConfig::BilateralFilterConfig &c) {
            return "{'sigma_spatial': " + std::to_string(c.sigma_spatial) +
                   ", 'sigma_range': " + std::to_string(c.sigma_range) + "}";
        });
    pybind11::class_<img2num::ImageToSvgConfig::KMeansConfig>(config, "KMeansConfig")
        .def(pybind11::init<>())
        .def_readwrite("k", &img2num::ImageToSvgConfig::KMeansConfig::k)
        .def_readwrite("max_iter", &img2num::ImageToSvgConfig::KMeansConfig::max_iter)
        .def("__repr__", [](const img2num::ImageToSvgConfig::KMeansConfig &c) {
            return "{'k': " + std::to_string(c.k) + ", 'max_iter': " + std::to_string(c.max_iter) +
                   "}";
        });
    config
        .def(pybind11::init(
            [](pybind11::dict bf_dict, pybind11::dict km_dict, pybind11::kwargs kwargs) {
                /*
                cfg = img2num.ImageToSvgConfig(
                    bf = {"sigma_spatial": 5.0, "sigma_range": 30.0},
                    km = {"k": 32},
                    min_cluster_area = 250,
                    color_space = 1
                )

                cfg = img2num.ImageToSvgConfig() will use default values
                */
                auto c = new img2num::ImageToSvgConfig(img2num::IMAGE_TO_SVG_DEFAULT_CONFIG);
                if (bf_dict.contains("sigma_spatial")) 
                    c->bilateral_filter.sigma_spatial = bf_dict["sigma_spatial"].cast<double>();
                if (bf_dict.contains("sigma_range"))   
                    c->bilateral_filter.sigma_range = bf_dict["sigma_range"].cast<double>();

                // 3. Process KMeans overrides from the 'km' dictionary
                if (km_dict.contains("k")) 
                    c->kmeans.k = km_dict["k"].cast<int>();
                if (km_dict.contains("max_iter"))      
                    c->kmeans.max_iter = km_dict["max_iter"].cast<int>();

                // 4. Process remaining top-level kwargs (like color_space or min_cluster_area)
                if (kwargs.contains("min_cluster_area"))
                    c->min_cluster_area = kwargs["min_cluster_area"].cast<int>();
                if (kwargs.contains("color_space"))
                    c->color_space = kwargs["color_space"].cast<uint8_t>();

                return c;
            }), pybind11::arg("bf") = pybind11::dict(), // Defaults to empty dict
                pybind11::arg("km") = pybind11::dict()  // Defaults to empty dict
            )
        .def_readwrite("bilateral_filter", &img2num::ImageToSvgConfig::bilateral_filter)
        .def_readwrite("min_cluster_area", &img2num::ImageToSvgConfig::min_cluster_area)
        .def_readwrite("color_space", &img2num::ImageToSvgConfig::color_space)
        .def_readwrite("kmeans", &img2num::ImageToSvgConfig::kmeans)
        .def("__repr__", [](const img2num::ImageToSvgConfig &c) {
            // We use pybind11::repr() to trigger the __repr__ of the nested objects
            std::stringstream ss;
            ss << "<ImageToSvgConfig {"
               << "bilateral_filter: "
               << pybind11::repr(pybind11::cast(c.bilateral_filter)).cast<std::string>() << ", "
               << "min_cluster_area: " << c.min_cluster_area << ", "
               << "color_space: " << (int)c.color_space << ", "
               << "kmeans: " << pybind11::repr(pybind11::cast(c.kmeans)).cast<std::string>()
               << "}>";
            return ss.str();
        });

    m.def(
        "image_to_svg",
        [](pybind11::array_t<uint8_t, pybind11::array::c_style> data, int width, int height,
           const img2num::ImageToSvgConfig &cfg) {
            const uint8_t *data_ptr{static_cast<const uint8_t *>(data.request().ptr)};
            std::string svg{img2num::image_to_svg(data_ptr, width, height, cfg)};
            pybind11::str svg_py_str(std::move(svg));
            return svg_py_str;
        },
        pybind11::arg("data"), pybind11::arg("width"), pybind11::arg("height"),
        pybind11::arg("config"), "Convert Image to SVG string");
}
