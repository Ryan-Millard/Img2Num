#include <cstdlib>
#include <img2num.h>
#include <memory>
#include <optional>
#include <pybind11/numpy.h>
#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <sstream>

PYBIND11_MODULE(_img2num, m) {
    m.doc() = R"docstring(
    Python bindings for the img2num C++ library.

    This module provides access to Img2Num's image processing capabilities from Python.
    All image functions operate on ``numpy.ndarray`` buffers and return new image data,
    making them easy to integrate into Python-based image processing pipelines.

    )docstring";

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
        pybind11::arg("sigma"), R"docstring(
        Apply a Gaussian blur to the image using Fast Fourier Transform (FFT) for performance.

        Parameters
        ----------
        image : numpy.ndarray
            Input image as a uint8 numpy array.
        width : int
            Width of the image.
        height : int
            Height of the image.
        sigma : float
            Standard deviation for the Gaussian kernel.

        Returns
        -------
        numpy.ndarray
            Blurred image as a uint8 numpy array.
        )docstring"
    );

    m.def(
        "invert_image",
        [](pybind11::array_t<uint8_t, pybind11::array::c_style> image, int width, int height) {
            pybind11::buffer_info buf = image.request();
            pybind11::array_t<uint8_t, pybind11::array::c_style> out_image(buf.shape);
            std::memcpy(out_image.mutable_data(), buf.ptr, buf.size * sizeof(uint8_t));

            img2num::invert_image(out_image.mutable_data(), width, height);
            return out_image;
        },
        pybind11::arg("image"), pybind11::arg("width"), pybind11::arg("height"), R"docstring(
        Invert the pixel values of an image.

        Parameters
        ----------
        image : numpy.ndarray
            Input image as a uint8 numpy array.
        width : int
            Width of the image.
        height : int
            Height of the image.

        Returns
        -------
        numpy.ndarray
            Inverted image as a uint8 numpy array.
        )docstring"
    );

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
        pybind11::arg("num_thresholds"), R"docstring(
        Apply thresholding to the image.

        Parameters
        ----------
        image : numpy.ndarray
            Input image as a uint8 numpy array.
        width : int
            Width of the image.
        height : int
            Height of the image.
        num_thresholds : int
            Number of threshold levels to apply.

        Returns
        -------
        numpy.ndarray
            Thresholded image as a uint8 numpy array.
        )docstring"
    );

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
        pybind11::arg("num_thresholds"), R"docstring(
        Apply thresholding with a bias in favor of black to the image.

        Parameters
        ----------
        image : numpy.ndarray
            Input image as a uint8 numpy array.
        width : int
            Width of the image.
        height : int
            Height of the image.
        num_thresholds : int
            Number of threshold levels to apply.

        Returns
        -------
        numpy.ndarray
            Thresholded image as a uint8 numpy array.
        )docstring"
    );

    m.def(
        "bilateral_filter",
        [](pybind11::array_t<uint8_t, pybind11::array::c_style> image, size_t width, size_t height,
           double sigma_spatial, double sigma_range, uint8_t color_space) {
            pybind11::buffer_info buf = image.request();
            pybind11::array_t<uint8_t, pybind11::array::c_style> out_image(buf.shape);
            std::memcpy(out_image.mutable_data(), buf.ptr, buf.size * sizeof(uint8_t));

            img2num::bilateral_filter(
                out_image.mutable_data(), width, height, sigma_spatial, sigma_range, color_space
            );
            return out_image;
        },
        pybind11::arg("image"), pybind11::arg("width"), pybind11::arg("height"),
        pybind11::arg("sigma_spatial"), pybind11::arg("sigma_range"), pybind11::arg("color_space"),
        R"docstring(
        Apply a bilateral filter to the image.

        Parameters
        ----------
        image : numpy.ndarray
            Input image as a uint8 numpy array.
        width : int
            Width of the image.
        height : int
            Height of the image.
        sigma_spatial : float
            Standard deviation for the spatial Gaussian (proximity weight).
        sigma_range : float
            Standard deviation for the range Gaussian (intensity similarity weight).
        color_space : int
            Color space identifier (e.g., 0 for LAB, 1 for sRGB).

        Returns
        -------
        numpy.ndarray
            Filtered image as a uint8 numpy array.
        )docstring"
    );

    m.def(
        "kmeans",
        [](pybind11::array_t<uint8_t, pybind11::array::c_style> data, int32_t width, int32_t height,
           int32_t k, int32_t max_iter, uint8_t color_space) {
            pybind11::buffer_info data_buf = data.request();

            // Allocate NumPy arrays for the outputs
            pybind11::array_t<uint8_t, pybind11::array::c_style> out_data(data_buf.shape);
            pybind11::array_t<int32_t, pybind11::array::c_style> out_labels(
                {static_cast<size_t>(height), static_cast<size_t>(width)}
            );

            img2num::kmeans(
                static_cast<const uint8_t*>(data_buf.ptr),
                static_cast<uint8_t*>(out_data.mutable_data()),
                static_cast<int32_t*>(out_labels.mutable_data()), width, height, k, max_iter,
                color_space
            );
            return pybind11::make_tuple(out_data, out_labels);
        },
        pybind11::arg("data"), pybind11::arg("width"), pybind11::arg("height"), pybind11::arg("k"),
        pybind11::arg("max_iter"), pybind11::arg("color_space"), R"docstring(
        Perform K-means clustering on the image data.

        Parameters
        ----------
        data : numpy.ndarray
            Input image data as a uint8 numpy array.
        width : int
            Width of the image.
        height : int
            Height of the image.
        k : int
            Number of clusters to compute.
        max_iter : int
            Maximum number of iterations for the K-means algorithm.
        color_space : int
            Color space identifier (e.g., 0 for LAB, 1 for sRGB).

        Returns
        -------
        tuple
            A tuple containing two NumPy arrays: (clustered_data, labels).
        )docstring"
    );

    m.def(
        "color_quantize",
        [](pybind11::array_t<uint8_t, pybind11::array::c_style> data, int32_t width, int32_t height,
           int32_t k, float coverage, uint8_t color_space) {
            pybind11::buffer_info data_buf = data.request();

            // Allocate NumPy arrays for the outputs
            pybind11::array_t<uint8_t, pybind11::array::c_style> out_data(data_buf.shape);
            pybind11::array_t<int32_t, pybind11::array::c_style> out_labels(
                {static_cast<size_t>(height), static_cast<size_t>(width)}
            );

            img2num::color_quantize(
                static_cast<const uint8_t*>(data_buf.ptr),
                static_cast<uint8_t*>(out_data.mutable_data()),
                static_cast<int32_t*>(out_labels.mutable_data()), 
                width, height, 
                k, coverage,
                color_space
            );
            return pybind11::make_tuple(out_data, out_labels);
        },
        pybind11::arg("data"), pybind11::arg("width"), pybind11::arg("height"), pybind11::arg("k"),
        pybind11::arg("coverage"), pybind11::arg("color_space"), R"docstring(
        Perform K-means clustering on the image data.

        Parameters
        ----------
        data : numpy.ndarray
            Input image data as a uint8 numpy array.
        width : int
            Width of the image.
        height : int
            Height of the image.
        k : int
            Number of clusters to compute. If set to 0 - autodetermine the number of dominant colors
        coverage : float
            Area fraction needed to determine the number of dominant colors if k=0. Recommended value: 0.9 (90%).
        color_space : int
            Color space identifier (e.g., 0 for LAB, 1 for sRGB).

        Returns
        -------
        tuple
            A tuple containing two NumPy arrays: (clustered_data, labels).
        )docstring"
    );

    m.def(
        "labels_to_svg",
        [](pybind11::array_t<uint8_t, pybind11::array::c_style> data,
           pybind11::array_t<int32_t, pybind11::array::c_style> labels, int width, int height,
           int min_area, int min_thickness) {
            const uint8_t* data_ptr {static_cast<const uint8_t*>(data.request().ptr)};
            const int32_t* labels_ptr {static_cast<const int32_t*>(labels.request().ptr)};

            std::string svg {img2num::labels_to_svg(
                data_ptr, labels_ptr, width, height, min_area, min_thickness
            )};
            pybind11::str svg_py_str(std::move(svg));

            return pybind11::str(std::move(svg));
        },
        pybind11::arg("data"), pybind11::arg("labels"), pybind11::arg("width"),
        pybind11::arg("height"), pybind11::arg("min_area"), pybind11::arg("min_thickness"),
        R"docstring(
        Convert labels to an SVG string.

        Parameters
        ----------
        data : numpy.ndarray
            Input image data as a uint8 numpy array.
        labels : numpy.ndarray
            Label map as an int32 numpy array.
        width : int
            Width of the image.
        height : int
            Height of the image.
        min_area : int
            Minimum cluster area to include in the SVG.
        min_thickness: int
            Minimum thickness a region must have to include in the SVG.

        Returns
        -------
        str
            An SVG string containing data roughly approximate to the input image.
        )docstring"
    );

    // ------------------------------------------ Config Structs ----------------------
    pybind11::class_<img2num::ImageToSvgConfig> config(m, "ImageToSvgConfig", R"docstring(
    Configuration options for image_to_svg.

    This class holds parameters for bilateral filtering, K-means clustering,
    and SVG generation. All parameters have sensible defaults.
    )docstring");
    pybind11::class_<img2num::ImageToSvgConfig::BilateralFilterConfig>(
        config, "BilateralFilterConfig", R"docstring(
    Configuration for the bilateral filter used in image_to_svg.
    )docstring"
    )
        .def(pybind11::init<>())
        .def_readwrite(
            "sigma_spatial", &img2num::ImageToSvgConfig::BilateralFilterConfig::sigma_spatial,
            R"docstring(
    Standard deviation for spatial Gaussian (proximity weight). Default: 3.0
    )docstring"
        )
        .def_readwrite(
            "sigma_range", &img2num::ImageToSvgConfig::BilateralFilterConfig::sigma_range,
            R"docstring(
    Standard deviation for range Gaussian (intensity similarity weight). Default: 50.0
    )docstring"
        )
        .def("__repr__", [](const img2num::ImageToSvgConfig::BilateralFilterConfig& c) {
            return "{'sigma_spatial': " + std::to_string(c.sigma_spatial) +
                   ", 'sigma_range': " + std::to_string(c.sigma_range) + "}";
        });
    pybind11::class_<img2num::ImageToSvgConfig::KMeansConfig>(config, "KMeansConfig", R"docstring(
    Configuration for the K-means clustering used in image_to_svg.
    )docstring")
        .def(pybind11::init<>())
        .def_readwrite("k", &img2num::ImageToSvgConfig::KMeansConfig::k, R"docstring(
    Number of clusters to compute. Roughly represents number of unique colors discovered. Default: 16
    )docstring")
        .def_readwrite("max_iter", &img2num::ImageToSvgConfig::KMeansConfig::max_iter, R"docstring(
    Maximum number of iterations for the K-means algorithm. Default: 100
    )docstring")
        .def("__repr__", [](const img2num::ImageToSvgConfig::KMeansConfig& c) {
            return "{'k': " + std::to_string(c.k) + ", 'max_iter': " + std::to_string(c.max_iter) +
                   "}";
        });
    pybind11::class_<img2num::ImageToSvgConfig::QuantizeConfig>(config, "QuantizeConfig", R"docstring(
    Configuration for the color quantization used in image_to_svg for synthetic images.
    )docstring")
        .def(pybind11::init<>())
        .def_readwrite("k", &img2num::ImageToSvgConfig::QuantizeConfig::k, R"docstring(
    Number of dominant colors to find in the image. If 0 (default) use `coverage` to threshold based on area. Default: 0
    )docstring")
        .def_readwrite("coverage", &img2num::ImageToSvgConfig::QuantizeConfig::coverage, R"docstring(
    Area ratio to consider when determining dominant colors. Default: 0.9
    )docstring")
        .def("__repr__", [](const img2num::ImageToSvgConfig::QuantizeConfig& c) {
            return "{'k': " + std::to_string(c.k) + ", 'coverage': " + std::to_string(c.coverage) +
                   "}";
        });

    config
        .def(
            pybind11::init([](pybind11::dict bf_dict, pybind11::dict km_dict,
                              pybind11::dict quant_dict,
                              pybind11::kwargs kwargs) {
                // hand over ownership to python
                std::unique_ptr<img2num::ImageToSvgConfig> c =
                    std::make_unique<img2num::ImageToSvgConfig>();
                if (bf_dict.contains("sigma_spatial"))
                    c->bilateral_filter.sigma_spatial = bf_dict["sigma_spatial"].cast<double>();
                if (bf_dict.contains("sigma_range"))
                    c->bilateral_filter.sigma_range = bf_dict["sigma_range"].cast<double>();

                // 3. Process KMeans overrides from the 'km' dictionary
                if (km_dict.contains("k"))
                    c->kmeans.k = km_dict["k"].cast<int>();
                if (km_dict.contains("max_iter"))
                    c->kmeans.max_iter = km_dict["max_iter"].cast<int>();

                // 4. Color quantization overrides from 'quant' dictionary
                if (quant_dict.contains("k"))
                    c->quantize.k = quant_dict["k"].cast<int>();
                if (quant_dict.contains("coverage"))
                    c->quantize.coverage = quant_dict["coverage"].cast<float>();

                // 5. Process remaining top-level kwargs (like color_space or min_cluster_area)
                if (kwargs.contains("min_cluster_area"))
                    c->min_cluster_area = kwargs["min_cluster_area"].cast<int>();
                if (kwargs.contains("min_thickness"))
                    c->min_thickness = kwargs["min_thickness"].cast<int>();
                if (kwargs.contains("color_space"))
                    c->color_space = kwargs["color_space"].cast<uint8_t>();
                if (kwargs.contains("synthetic"))
                    c->synthetic = kwargs["synthetic"].cast<uint8_t>();

                return c;
            }),
            pybind11::arg("bilateral_filter") = pybind11::dict(), // Defaults to empty dict
            pybind11::arg("kmeans") = pybind11::dict(),           // Defaults to empty dict
            pybind11::arg("quantize") = pybind11::dict()          // Defaults to empty dict
        )
        .def_readwrite("bilateral_filter", &img2num::ImageToSvgConfig::bilateral_filter)
        .def_readwrite("min_cluster_area", &img2num::ImageToSvgConfig::min_cluster_area)
        .def_readwrite("min_thickness", &img2num::ImageToSvgConfig::min_thickness)
        .def_readwrite("color_space", &img2num::ImageToSvgConfig::color_space)
        .def_readwrite("kmeans", &img2num::ImageToSvgConfig::kmeans)
        .def_readwrite("quantize", &img2num::ImageToSvgConfig::quantize)
        .def_readwrite("synthetic", &img2num::ImageToSvgConfig::synthetic)
        .def("__repr__", [](const img2num::ImageToSvgConfig& c) {
            // We use pybind11::repr() to trigger the __repr__ of the nested objects
            std::stringstream ss;
            ss << "<ImageToSvgConfig {"
               << "bilateral_filter: "
               << pybind11::repr(pybind11::cast(c.bilateral_filter)).cast<std::string>() << ", "
               << "min_cluster_area: " << c.min_cluster_area << ", "
               << "min_thickness: " << c.min_thickness << ", "
               << "color_space: " << (int)c.color_space << ", "
               << "kmeans: " << pybind11::repr(pybind11::cast(c.kmeans)).cast<std::string>() << ", "
               << "synthetic: " << int(c.synthetic) << ", "
               << "color quantize: " << pybind11::repr(pybind11::cast(c.quantize)).cast<std::string>()
               << "}>";
            return ss.str();
        });

    m.def(
        "image_to_svg",
        [](pybind11::array_t<uint8_t, pybind11::array::c_style> data, int width, int height,
           const img2num::ImageToSvgConfig& cfg) {
            const uint8_t* data_ptr {static_cast<const uint8_t*>(data.request().ptr)};

            std::string svg {img2num::image_to_svg(data_ptr, width, height, cfg)};

            return pybind11::str(std::move(svg));
        },
        pybind11::arg("data"), pybind11::arg("width"), pybind11::arg("height"),
        pybind11::arg("cfg"),
        R"docstring(
        Convert Image to SVG string.

        Parameters
        ----------
        data : numpy.ndarray
            Input image buffer.
        width : int
            Width of the image.
        height : int
            Height of the image.
        cfg : ImageToSvgConfig
            Configuration object containing filter and clustering parameters.

        Returns
        -------
        str
            SVG string representation of the image.
        )docstring"
    );
}
