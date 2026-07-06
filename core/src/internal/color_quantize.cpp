#include "img2num.h"
#include "internal/cielab.h"
#include "internal/Image.h"
#include "internal/LABAPixel.h"
#include "internal/PixelConverters.h"
#include "internal/RGBAPixel.h"

#include <algorithm>
#include <cmath>
#include <cstdlib>
#include <cstring>
#include <ctime>
#include <functional>
#include <limits>
#include <numeric>
#include <random>
#include <vector>
#include <map>

static constexpr uint8_t COLOR_SPACE_OPTION_CIELAB {0};
static constexpr uint8_t COLOR_SPACE_OPTION_RGB {1};

template <typename PixelT>
void frequency_histogram(
    const ImageLib::Image<PixelT>& pixels, ImageLib::Image<PixelT>& out_centroids, int k, float coverage
) {
    const int32_t num_pixels {pixels.getSize()};
    std::vector<PixelT> centroids;
    std::map <PixelT, int> colorHistogram;

    for (int i {0}; i < num_pixels; ++i) {
        // if color exists increment counter, else add to map and initialize with 1
        if (colorHistogram.find(pixels[i]) != colorHistogram.end()){
            colorHistogram[pixels[i]] += 1;
        }
        else {
            colorHistogram[pixels[i]] = 1;
        }
    }

    std::vector<std::pair<PixelT, int>> vec(colorHistogram.begin(), colorHistogram.end());
    if (k > 0) {
        std::nth_element(vec.begin(), vec.begin() + k, vec.end(), 
            [](const auto& a, const auto& b) {
                return a.second > b.second; // Sort descending by value
            });

        for (int i = 0; i < k; ++i) {
            centroids.push_back(vec[i].first);
        }
    }
    else {
        // select colors that cover at least 90% of image area
        std::sort(vec.begin(), vec.end(),
            [](const auto& a, const auto& b) {
                return a.second > b.second; // Sort descending by value
            });
        int cum_pixels{0};
        for (int i = 0; i < vec.size(); ++i) {
            cum_pixels += vec[i].second;
            if (float(cum_pixels) >= coverage * float(num_pixels)) {
                break;
            }
            centroids.push_back(vec[i].first);
        }
        out_centroids.resize(centroids.size(), 1, PixelT());
    }
    std::copy(centroids.begin(), centroids.end(), out_centroids.begin());
}

void dominant_colors(
    const uint8_t* data, uint8_t* out_data, int32_t* out_labels, const int32_t width,
    const int32_t height, const int32_t k, const float coverage, const uint8_t color_space
) {
    ImageLib::Image<ImageLib::RGBAPixel<float>> pixels;
    pixels.loadFromBuffer(data, width, height, ImageLib::RGBA_CONVERTER<float>);
    const int32_t num_pixels {pixels.getSize()};

    ImageLib::Image<ImageLib::RGBAPixel<float>> centroids {k, 1};
    ImageLib::Image<ImageLib::LABAPixel<float>> centroids_lab {k, 1};
    std::vector<int32_t> labels(num_pixels, 0);

    ImageLib::Image<ImageLib::LABAPixel<float>> lab(pixels.getWidth(), pixels.getHeight());
    if (color_space == COLOR_SPACE_OPTION_CIELAB) {
        for (int i {0}; i < pixels.getSize(); ++i) {
            rgb_to_lab<float, float>(pixels[i], lab[i]);
        }
    }

    // make sure coverage is (0.0f, 1.0f)
    float cov = std::clamp(coverage, 0.0f, 1.0f);

    int32_t _k {k};
    switch (color_space) {
    case COLOR_SPACE_OPTION_RGB: {
        frequency_histogram<ImageLib::RGBAPixel<float>>(pixels, centroids, k, cov);
        if (k == 0) {
            _k = centroids.getSize();
            centroids_lab.resize(_k, 1, ImageLib::LABAPixel<float>());
        }
        break;
    }
    case COLOR_SPACE_OPTION_CIELAB: {
        frequency_histogram<ImageLib::LABAPixel<float>>(lab, centroids_lab, k, cov);
        if (k == 0) {
            _k = centroids_lab.getSize();
            centroids.resize(_k, 1, ImageLib::RGBAPixel<float>());
        }
        break;
    }
    }
    
    if (color_space == COLOR_SPACE_OPTION_CIELAB) {
        for (int32_t i {0}; i < _k; ++i) {
            lab_to_rgb<float, float>(centroids_lab[i], centroids[i]);
        }
    }

    // Iterate over pixels
    for (int32_t i {0}; i < num_pixels; ++i) {
        float min_color_dist {std::numeric_limits<float>::max()};
        int32_t best_cluster {0};

        // Iterate over centroids to find centroid with most similar color to
        // pixels[i]
        float dist;
        for (int32_t j {0}; j < _k; ++j) {
            switch (color_space) {
            case COLOR_SPACE_OPTION_RGB: {
                dist = ImageLib::RGBAPixel<float>::colorDistance(pixels[i], centroids[j]);
                break;
            }
            case COLOR_SPACE_OPTION_CIELAB: {
                dist = ImageLib::LABAPixel<float>::colorDistance(lab[i], centroids_lab[j]);
                break;
            }
            }
            if (dist < min_color_dist) {
                min_color_dist = dist;
                best_cluster = j;
            }
        }

        labels[i] = best_cluster;
        out_data[i * 4 + 0] =
            static_cast<uint8_t>(std::clamp(centroids[best_cluster].red, 0.0f, 255.0f));
        out_data[i * 4 + 1] =
            static_cast<uint8_t>(std::clamp(centroids[best_cluster].green, 0.0f, 255.0f));
        out_data[i * 4 + 2] =
            static_cast<uint8_t>(std::clamp(centroids[best_cluster].blue, 0.0f, 255.0f));
        out_data[i * 4 + 3] = 255;
    }

    // Write labels to out_labels
    std::memcpy(out_labels, labels.data(), labels.size() * sizeof(int32_t));
}

namespace img2num {
void color_quantize(
    const uint8_t* data, uint8_t* out_data, int32_t* out_labels, const int32_t width,
    const int32_t height, const int32_t k, const float coverage, const uint8_t color_space
) {
    dominant_colors(data, out_data, out_labels, width, height, k, coverage, color_space);
}
} // namespace img2num