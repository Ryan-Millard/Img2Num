#ifndef SOLVER_H
#define SOLVER_H

#include "Point.h"
#include <cmath>
#include <iomanip>
#include <numeric>
#include <stdexcept>
#include <vector>

struct Point;

class SavitzkyGolay {
private:
  int window_size_;
  int m_; // half window size
  int poly_order_;
  std::vector<float> coeffs_;

  std::vector<std::vector<float>>
  invert_matrix(std::vector<std::vector<float>> A);
  void compute_coefficients();

public:
  SavitzkyGolay(int window_size, int poly_order);
  std::vector<Point> filter(const std::vector<Point> &data);
  std::vector<Point> filter_wrap(const std::vector<Point> &data);
  std::vector<float> get_coeffs() const { return coeffs_; }
};

#endif