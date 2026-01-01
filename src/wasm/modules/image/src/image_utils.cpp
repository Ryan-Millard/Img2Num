#include "image_utils.h"
#include "fft_iterative.h"
#include "cielab.h"

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <limits>
#include <vector>

double gaussian(float x, double sigma) {
  return exp(-(pow(x, 2))/(2 * pow(sigma, 2))) / (2 * M_PI * pow(sigma, 2));
}

void bilateral_filter(uint8_t *image, size_t width, size_t height, double sigma_pixels, double sigma_range)
{
  // sigma_pixel = spatial kernel
  if (!image || width == 0 || height == 0 || sigma_pixels <= 0 || sigma_range <= 0)
    return;
  
  const int radius = static_cast<int>(1.5 * sigma_pixels);
  const size_t diameter = radius * 2 + 1;

  // precompute
  double range_filter[diameter * diameter];
  for (int i = 0; i < diameter; i++){
    for (int j = 0; j < diameter; j++){
      float dist = static_cast<float>(sqrt(pow(i - radius, 2) + pow(j - radius, 2)));
      range_filter[i*diameter + j] = gaussian(dist, sigma_pixels);
    }
  }

  uint8_t result[4 * height * width];

  for (int i = 0; i < height; i++){
    for (int j = 0; j < width; j++) {
      int center_index = 4 * (i * width + j);
      uint8_t r0 = image[center_index];
      uint8_t g0 = image[center_index + 1];
      uint8_t b0 = image[center_index + 2];
      uint8_t a0 = image[center_index + 3];

      double L0, A0, B0;
      rgb_to_lab(r0, g0, b0, L0, A0, B0);

      double rf = 0.0;
      double gf = 0.0;
      double bf = 0.0;
      double rW = 0.0;
      double gW = 0.0;
      double bW = 0.0;

      for (int ki = -radius; ki < radius; ki++){
        for (int kj = -radius; kj < radius; kj ++){
          int _i = i + ki;
          int _j = j + kj;
          if (_i < 0)
            _i = 0;
          if (_i > height - 1)
            _i = height - 1;
          if (_j < 0)
            _j = 0;
          if (_j > width - 1)
            _j = width - 1;
          int index = (_i * width) + _j; // std::clamp(i + ki, 0, height-1) * width + std::clamp(j + kj, 0, width-1);

          uint8_t r = image[index];
          uint8_t g = image[index + 1];
          uint8_t b = image[index + 2];

          // independent weighting per channel
          //double wr = gaussian(static_cast<float>(r-r0), sigma_range) * range_filter[ (ki + radius) * diameter + (kj + radius) ];
          //double wg = gaussian(static_cast<float>(g-g0), sigma_range) * range_filter[ (ki + radius) * diameter + (kj + radius) ];
          //double wb = gaussian(static_cast<float>(b-b0), sigma_range) * range_filter[ (ki + radius) * diameter + (kj + radius) ];

          // euclidean color distance
          //float dist = sqrt(pow(static_cast<float>(r-r0), 2) + pow(static_cast<float>(g-g0), 2) + pow(static_cast<float>(b-b0), 2));
          
          double L, A, B;
          rgb_to_lab(r, g, b, L, A, B);
          // needs sqrt?
          float dist = sqrt(pow(static_cast<float>(L-L0), 2) + pow(static_cast<float>(A-A0), 2) + pow(static_cast<float>(B-B0), 2));
          
          double w_euc = gaussian(dist, sigma_range) * range_filter[ (ki + radius) * diameter + (kj + radius) ];
          double wr = w_euc;
          double wg = w_euc;
          double wb = w_euc;

          rf += r * wr;
          rW += wr;

          gf += g * wg;
          gW += wg;

          bf += b * wb;
          bW += wb;
        }
      }

      result[center_index] = static_cast<uint8_t>(rf / rW);
      result[center_index + 1] = static_cast<uint8_t>(gf / gW);
      result[center_index + 2] = static_cast<uint8_t>(bf / bW);
      result[center_index + 3] = a0;
    }
  }

  image = result;
}


// image: pointer to RGBA data
// width, height: dimensions
// sigma: standard deviation of Gaussian blur
void gaussian_blur_fft(uint8_t *image, size_t width, size_t height,
                       double sigma_pixels) {
  if (!image || width == 0 || height == 0 || sigma_pixels <= 0)
    return;

  const size_t Npix = width * height;

  // Compute padded dimensions (next power of two)
  const size_t W = fft::next_power_of_two(width);
  const size_t H = fft::next_power_of_two(height);
  const size_t Npix_padded = W * H;

  // Frequency coordinates helper (DC at corner)
  auto freq_coord = [](int k, int dim) -> double {
    return (k <= dim / 2) ? double(k) / dim : double(k - dim) / dim;
  };

  // Precompute Gaussian factor in frequency domain
  const double two_pi2_sigma2 = 2.0 * M_PI * M_PI * sigma_pixels * sigma_pixels;

  for (int channel = 0; channel < 3; channel++) {
    // Allocate padded buffer
    std::vector<fft::cd> data(Npix_padded, {0.0, 0.0});

    // Copy original image channel into padded buffer
    for (size_t y = 0; y < height; y++)
      for (size_t x = 0; x < width; x++)
        data[y * W + x] = fft::cd(image[(y * width + x) * 4 + channel], 0.0);

    // Forward 2D FFT
    fft::iterative_fft_2d(data, W, H, false);

    // Apply Gaussian filter in frequency domain
    for (size_t y = 0; y < H; y++) {
      double fy2 = freq_coord(y, H) * freq_coord(y, H);
      for (size_t x = 0; x < W; x++) {
        double fx2 = freq_coord(x, W) * freq_coord(x, W);
        double gain = std::exp(-two_pi2_sigma2 * (fx2 + fy2));
        data[y * W + x] *= gain;
      }
    }

    // Inverse 2D FFT
    fft::iterative_fft_2d(data, W, H, true);

    // Copy back only the original width/height and clamp
    for (size_t y = 0; y < height; y++)
      for (size_t x = 0; x < width; x++) {
        double v = data[y * W + x].real();
        v = std::clamp(v, 0.0, 255.0);
        image[(y * width + x) * 4 + channel] =
            static_cast<uint8_t>(std::lrint(v));
      }
  }

  // Alpha channel remains unchanged
}

uint8_t quantize(uint8_t value, uint8_t region_size) {
  uint8_t bucket = value / region_size; // Narrowing to colour boundary with
                                        // Range [0 : num_thresholds - 1].

  uint8_t bucket_boundary = (bucket * region_size);
  uint8_t bucket_midpoint =
      bucket_boundary +
      (region_size / 2); // Map to threshold region's midpoint.

  // In case of bucket_midpoint overflow: revert to a smaller bucket than the
  // largest possible value.
  bool overflow = bucket_midpoint < bucket_boundary;
  if (overflow) {
    bucket_midpoint =
        ((bucket - 1) * region_size) +
        (region_size /
         2); // Correction by reducing the bucket value belongs to.
  }

  return bucket_midpoint;
}

// Called from JS. `ptr` points to RGBA bytes.
void invert_image(uint8_t *ptr, int width, int height) {
  ImageLib::Image<ImageLib::RGBAPixel<uint8_t>> img;
  img.loadFromBuffer(ptr, width, height, ImageLib::RGBA_CONVERTER<uint8_t>);

  for (ImageLib::RGBAPixel<uint8_t> &p : img) {
    p.red = 255 - p.red;
    p.blue = 255 - p.blue;
    p.green = 255 - p.green;
  }

  const auto &modified = img.getData();
  std::memcpy(ptr, modified.data(),
              modified.size() * sizeof(ImageLib::RGBAPixel<uint8_t>));
}

void threshold_image(uint8_t *ptr, const int width, const int height,
                     const int num_thresholds) {
  const uint8_t REGION_SIZE(255 / num_thresholds); // Size of buckets per colour

  ImageLib::Image<ImageLib::RGBAPixel<uint8_t>> img;
  img.loadFromBuffer(ptr, width, height, ImageLib::RGBA_CONVERTER<uint8_t>);

  const auto imgWidth{img.getWidth()}, imgHeight{img.getHeight()};
  for (ImageLib::RGBAPixel<uint8_t> &p : img) {
    p.red = quantize(p.red, REGION_SIZE);
    p.green = quantize(p.green, REGION_SIZE);
    p.blue = quantize(p.blue, REGION_SIZE);
  }

  const auto &modified = img.getData();
  std::memcpy(ptr, modified.data(),
              modified.size() * sizeof(ImageLib::RGBAPixel<uint8_t>));
}

void black_threshold_image(uint8_t *ptr, const int width, const int height,
                           const int num_thresholds) {
  ImageLib::Image<ImageLib::RGBAPixel<uint8_t>> img;
  img.loadFromBuffer(ptr, width, height, ImageLib::RGBA_CONVERTER<uint8_t>);

  const auto imgWidth{img.getWidth()}, imgHeight{img.getHeight()};
  for (ImageLib::RGBAPixel<uint8_t> &p : img) {
    const bool R{p.red < num_thresholds};
    const bool G{p.green < num_thresholds};
    const bool B{p.blue < num_thresholds};
    if (R && B && G) {
      p.setGray(0);
    }
  }

  const auto &modified = img.getData();
  std::memcpy(ptr, modified.data(),
              modified.size() * sizeof(ImageLib::RGBAPixel<uint8_t>));
}
