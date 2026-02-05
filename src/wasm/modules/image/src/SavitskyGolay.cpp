#include "SavitskyGolay.h"
#include <cassert>
#include <cmath>
#include <numeric>
#include <stdexcept>

SavitzkyGolay::SavitzkyGolay(int radius, int poly_order)
    : window_radius_(radius), window_size_(2 * radius + 1),
      poly_order_(poly_order) {

  assert(radius >= 0);
  assert(window_size_ > poly_order_);

  compute_coefficients();
}

std::vector<Point> SavitzkyGolay::filter(const std::vector<Point> &data) {
  if (data.size() < window_size_) {
    return data; // Data too short to filter
  }

  std::vector<Point> result(data.size());

  // 1. Convolution for the valid range
  for (size_t i = window_radius_; i < data.size() - window_radius_; ++i) {
    Point val{0.0, 0.0};
    for (int j = -window_radius_; j <= window_radius_; ++j) {
      val += data[i + j] * coeffs_[j + window_radius_];
    }
    result[i] = val;
  }

  // 2. Handle Edges (Simple Repeat/Nearest padding strategy)
  // For a robust production app, you might calculate asymmetric kernels here.
  for (int i = 0; i < window_radius_; ++i)
    result[i] = data[i];
  for (size_t i = data.size() - window_radius_; i < data.size(); ++i)
    result[i] = data[i];

  return result;
}

std::vector<Point> SavitzkyGolay::filter_wrap(const std::vector<Point> &data) {
  // wrap around
  if (data.size() < window_size_) {
    return data; // Data too short to filter
  }

  std::vector<Point> result(data.size());
  std::copy(data.begin(), data.end(), result.begin());

  for (size_t i = 0; i < data.size(); ++i) {
    Point val{0.0, 0.0};
    for (int j = -window_radius_; j <= window_radius_; ++j) {
      int k = i + j;
      if (k < 0) {
        k = data.size() + k;
      } else if (k >= data.size()) {
        k = k - data.size();
      }
      val = val + data[k] * coeffs_[j + window_radius_];
    }
    result[i] = val;
  }

  return result;
}

// Helper: Invert a matrix using Gauss-Jordan Elimination
// A is (N x N), returns A_inv
std::vector<std::vector<float>>
SavitzkyGolay::invert_matrix(std::vector<std::vector<float>> A) {
  int n = A.size();
  std::vector<std::vector<float>> inv(n, std::vector<float>(n, 0.0));

  // Initialize inverse as identity
  for (int i = 0; i < n; ++i)
    inv[i][i] = 1.0;

  for (int i = 0; i < n; ++i) {
    // Find pivot
    float pivot = A[i][i];
    // (Simple pivot check, typically you'd swap rows for stability)
    if (std::abs(pivot) < 1e-10)
      throw std::runtime_error("Matrix singular, cannot invert.");

    // Normalize row
    for (int j = 0; j < n; ++j) {
      A[i][j] /= pivot;
      inv[i][j] /= pivot;
    }

    // Eliminate other rows
    for (int k = 0; k < n; ++k) {
      if (k != i) {
        float factor = A[k][i];
        for (int j = 0; j < n; ++j) {
          A[k][j] -= factor * A[i][j];
          inv[k][j] -= factor * inv[i][j];
        }
      }
    }
  }
  return inv;
}

void SavitzkyGolay::compute_coefficients() {
  // 1. Create the matrix J = (A^T * A)
  // Size is (poly_order + 1) x (poly_order + 1)
  // Element J[i][j] is the sum of k^(i+j) for k in -m..m

  int rows = poly_order_ + 1;
  std::vector<std::vector<float>> J(rows, std::vector<float>(rows));

  for (int i = 0; i < rows; ++i) {
    for (int j = 0; j < rows; ++j) {
      float sum = 0;
      for (int k = -window_radius_; k <= window_radius_; ++k) {
        sum += std::pow(k, i + j);
      }
      J[i][j] = sum;
    }
  }

  // 2. Invert J to solve the normal equations
  auto J_inv = invert_matrix(J);

  // 3. Compute the weights
  // The smoothed value is the coefficient c_0 of the polynomial.
  // c_0 = sum( weight_k * y_k )
  // weight_k = sum( J_inv[0][j] * k^j ) for j=0..order

  coeffs_.resize(window_size_);
  for (int k = -window_radius_; k <= window_radius_; ++k) {
    float weight = 0.0;
    for (int j = 0; j < rows; ++j) {
      weight += J_inv[0][j] * std::pow(k, j);
    }
    coeffs_[k + window_radius_] = weight;
  }
}
