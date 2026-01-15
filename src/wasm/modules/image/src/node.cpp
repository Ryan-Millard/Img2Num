#include "node.h"
#include <climits>

/*
Node class
*/

XY Node::centroid() const {
    XY centroid{0, 0};
    for (auto &c : *m_pixels) {
        centroid.x += c.x;
        centroid.y += c.y;
    }

    const int32_t m_pixels_size{static_cast<int32_t>( m_pixels->size() )};
    centroid.x /= m_pixels_size;
    centroid.y /= m_pixels_size;

    return centroid;
}

RGB Node::color() const {
    RGB mean_col{0,0,0};
    for (auto &c : *m_pixels) {
        mean_col.r += c.r;
        mean_col.g += c.g;
        mean_col.b += c.b;
    }

    const int32_t m_pixels_size{static_cast<int32_t>( m_pixels->size() )};
    mean_col.r /= m_pixels_size;
    mean_col.g /= m_pixels_size;
    mean_col.b /= m_pixels_size;

    return mean_col;
}

std::array<int32_t, 4> Node::bounding_box_xywh() const {
    int32_t x_min{INT_MAX};
    int32_t y_min{INT_MAX};
    int32_t x_max{0};
    int32_t y_max{0};
    for (auto &p : *m_pixels) {
        if (p.x < x_min) { x_min = p.x; }
        if (p.x > x_max) { x_max = p.x; }
        if (p.y < y_min) { y_min = p.y; }
        if (p.y > y_max) { y_max = p.y; }
    }

    const int32_t w{x_max - x_min + 1};
    const int32_t h{y_max - y_min + 1};

    return std::array<int32_t, 4>{x_min, y_min, w, h};
}

std::array<int, 4> Node::create_binary_image(std::vector<uint8_t>& binary) const {
    std::array<int, 4> xywh{ bounding_box_xywh() };

    binary.resize(xywh[2] * xywh[3], 0);

    for (auto &p : *m_pixels) {
        int32_t _x = p.x - xywh[0];
        int32_t _y = p.y - xywh[1];
        binary[_y * xywh[2] + _x] = 1;
    }

    return xywh;
}

void Node::add_pixels(const std::vector<RGBXY>& new_pixels) {
    for (auto &c : new_pixels) {
        m_pixels->push_back(c);
    }
}

void Node::clear_all() {
    m_edges.clear();
    m_pixels->clear();
}
