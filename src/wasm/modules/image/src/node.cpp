#include "node.h"
#include <climits>

/*
   Node class
   */

XY Node::centroid() const {
  XY centroid{0, 0};
  const int32_t m_pixels_size{static_cast<int32_t>(m_pixels->size())};

  // Guard against division by zero after loop
  if (m_pixels_size == 0) {
    return centroid;
  }

  for (auto &[_, pos] : *m_pixels) {
    centroid.x += pos.x;
    centroid.y += pos.y;
  }

  centroid.x /= m_pixels_size;
  centroid.y /= m_pixels_size;

  return centroid;
}

ImageLib::RGBPixel<uint8_t> Node::color() const {
  const int32_t m_pixels_size{static_cast<int32_t>(m_pixels->size())};

  // Guard against division by zero after loop
  if (m_pixels_size == 0) {
    return {0, 0, 0};
  }

  float r{0};
  float g{0};
  float b{0};
  for (auto &[color, _] : *m_pixels) {
    r += color.red;
    g += color.green;
    b += color.blue;
  }

  r /= m_pixels_size;
  g /= m_pixels_size;
  b /= m_pixels_size;

  // Accept lossy conversion - the difference is very minimal
  return {static_cast<uint8_t>(r), static_cast<uint8_t>(g),
          static_cast<uint8_t>(b)};
}

std::array<int32_t, 4> Node::bounding_box_xywh() const {
  if (m_pixels->empty()) {
    return {0, 0, 0, 0};
  }

  int32_t x_min{INT_MAX};
  int32_t y_min{INT_MAX};
  int32_t x_max{0};
  int32_t y_max{0};
  for (auto &[_, p] : *m_pixels) {
    if (p.x < x_min) {
      x_min = p.x;
    }
    if (p.x > x_max) {
      x_max = p.x;
    }
    if (p.y < y_min) {
      y_min = p.y;
    }
    if (p.y > y_max) {
      y_max = p.y;
    }
  }

  const int32_t w{x_max - x_min + 1};
  const int32_t h{y_max - y_min + 1};

  return std::array<int32_t, 4>{x_min, y_min, w, h};
}

std::array<int, 4>
Node::create_binary_image(std::vector<uint8_t> &binary) const {
  std::array<int, 4> xywh{bounding_box_xywh()};

  binary.resize(static_cast<size_t>(xywh[2]) * static_cast<size_t>(xywh[3]), 0);

  for (auto &[_, p] : *m_pixels) {
    int32_t _x = p.x - xywh[0];
    int32_t _y = p.y - xywh[1];
    binary[_y * xywh[2] + _x] = 1;
  }

  return xywh;
}

void Node::compute_contour(void) {
  // return list of all contours present in Node.
  // usually 1 sometimes more if holes are present

  m_contours.contours.clear();
  m_contours.hierarchy.clear();
  m_contours.is_hole.clear();
  m_contours.colors.clear();

  std::vector<uint8_t> binary;
  std::array<int, 4> xywh{create_binary_image(binary)};

  int xmin = xywh[0];
  int ymin = xywh[1];
  int bw = xywh[2];
  int bh = xywh[3];

  ContoursResult contour_res = contours::find_contours(binary, bw, bh);

  for (size_t cidx = 0; cidx < contour_res.contours.size(); ++cidx) {
    auto &contour = contour_res.contours[cidx];
    for (auto &p : contour) {
      p.x += xmin;
      p.y += ymin;
    }

    // if (contour_res.is_hole[cidx]) { continue; }
    
    ImageLib::RGBPixel<uint8_t> _col = color();
    ImageLib::RGBAPixel<uint8_t> col{_col.red, _col.green, _col.blue, 255};
    m_contours.contours.push_back(contour);
    m_contours.hierarchy.push_back(contour_res.hierarchy[cidx]);
    m_contours.is_hole.push_back(contour_res.is_hole[cidx]);
    m_contours.colors.push_back(col);
  }
  
}

void Node::add_pixels(const std::vector<RGBXY> &new_pixels) {
  for (auto &c : new_pixels) {
    m_pixels->push_back(c);
  }
}

void Node::clear_all() {
  m_edges.clear();
  m_pixels->clear();
}
