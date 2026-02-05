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

std::vector<Point> SavitzkyGolay::filter_wrap_with_constraints(
  const std::vector<Point> &data,
  const std::vector<bool> &locked,
  const std::vector<bool> &corner
) {
  // wrap around
  if (data.size() < window_size_) {
    return data; // Data too short to filter
  }

  std::vector<Point> result(data.size());
  std::copy(data.begin(), data.end(), result.begin());

  // Weights: Normal = 1.0, Fixed = 10000.0 (Hard constraint)
  float wNormal = 1.0;
  float wFixed = 1000.0;

  for (size_t i = 0; i < data.size(); ++i) {
    Point val{0.0, 0.0};
    float A[3][3] = {0};
    float Bx[3] = {0};
    float By[3] = {0};
    // if (locked[i] || corner[i]) { continue; }
    for (int j = -m_; j <= m_; ++j) {
      int k = i + j;
      if (k < 0) {
        k = data.size() + k;
      } else if (k >= data.size()) {
        k = k - data.size();
      }

      // weights
      float w;
      if (locked[k]) { //  || corner[k]
        w = wFixed;
      } else { w = wNormal; }

      float xVal = (float)j; // Relative x coordinate (-window ... +window)
      float yVal1 = data[k].x;
      float yVal2 = data[k].y;

      float x2 = xVal * xVal;
      float x3 = x2 * xVal;
      float x4 = x2 * x2;

      // Update Normal Matrix (X^T * W * X)
      // Row 0: Sum(w * 1 * [1, x, x2])
      A[0][0] += w;       A[0][1] += w*xVal;  A[0][2] += w*x2;
      // Row 1: Sum(w * x * [1, x, x2])
      A[1][0] += w*xVal;  A[1][1] += w*x2;    A[1][2] += w*x3;
      // Row 2: Sum(w * x2 * [1, x, x2])
      A[2][0] += w*x2;    A[2][1] += w*x3;    A[2][2] += w*x4;

      // Update Result Vector (X^T * W * Y)
      Bx[0] += w * yVal1;
      Bx[1] += w * yVal1 * xVal;
      Bx[2] += w * yVal1 * x2;

      By[0] += w * yVal2;
      By[1] += w * yVal2 * xVal;
      By[2] += w * yVal2 * x2;
      // val = val + data[k] * coeffs_[j + m_];
    } 
    val.x = solveQuadraticAtZero(A, Bx);
    val.y = solveQuadraticAtZero(A, By);

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
