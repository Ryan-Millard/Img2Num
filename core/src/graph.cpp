#include "graph.h"

#include <algorithm>
#include <iostream>
#include <iterator>
#include <queue>
#include <string>

#include "Pixel.h"
#include "bezier.h"
/*
 Graph class - manages Node class
*/

static inline float colorDistance(const ImageLib::RGBPixel<uint8_t> &a,
                                  const ImageLib::RGBPixel<uint8_t> &b) {
    ImageLib::RGBPixel<float> af{static_cast<float>(a.red), static_cast<float>(a.green),
                                 static_cast<float>(a.blue)};
    ImageLib::RGBPixel<float> bf{static_cast<float>(b.red), static_cast<float>(b.green),
                                 static_cast<float>(b.blue)};
    return std::sqrt((af.red - bf.red) * (af.red - bf.red) +
                     (af.green - bf.green) * (af.green - bf.green) +
                     (af.blue - bf.blue) * (af.blue - bf.blue));
}

/*
To quickly search m_nodes (std::vector) for the index of a node id
create an std::unordered_map of node id - index pairs
indexing time of std::vector by value is O(N)
lookup time of std::unordered_map by key is O(log(N))
*/
void Graph::hash_node_ids() {
    for (int32_t i{0}; i < m_nodes->size(); i++) {
        const int32_t key{m_nodes->at(i)->id()};
        m_node_ids[key] = i;
    }
}

bool Graph::all_areas_bigger_than(int32_t min_area) {
    for (auto &n : *m_nodes) {
        if (n->area() < min_area) {
            return false;
        }
    }

    return true;
}

bool Graph::add_edge(int32_t node_id1, int32_t node_id2) {
    auto end_node_ids{m_node_ids.end()};
    auto node1_it{m_node_ids.find(node_id1)};
    auto node2_it{m_node_ids.find(node_id2)};

    if (node1_it == end_node_ids || node2_it == end_node_ids) {
        return false;
    }

    const int32_t idx1{node1_it->second};
    const int32_t idx2{node2_it->second};

    m_nodes->at(idx1)->add_edge(m_nodes->at(idx2));
    m_nodes->at(idx2)->add_edge(m_nodes->at(idx1));
    return true;
}

bool Graph::merge_nodes(const Node_ptr &node_to_keep, const Node_ptr &node_to_remove) {
    auto end_node_ids{m_node_ids.end()};
    auto node1_it{m_node_ids.find(node_to_keep->id())};
    auto node2_it{m_node_ids.find(node_to_remove->id())};

    if (node1_it == end_node_ids || node2_it == end_node_ids) {
        return false;
    }

    const int32_t idx_k{node1_it->second};
    const int32_t idx_r{node2_it->second};

    // transfer edges from node_to_remove to node_to_keep
    for (Node_ptr n : m_nodes->at(idx_r)->edges()) {
        if (n->id() != node_to_keep->id()) {
            // prevents self referencing
            n->remove_edge(node_to_remove);
            n->add_edge(node_to_keep);
            node_to_keep->add_edge(n);
        }
    }

    node_to_keep->add_pixels(node_to_remove->get_pixels());

    node_to_remove->clear_all();

    return true;
}

void Graph::clear_unconnected_nodes() {
    std::vector<Node_ptr> &nodes{*m_nodes};

    nodes.erase(std::remove_if(nodes.begin(), nodes.end(),
                               [](const Node_ptr &n) { return n->area() == 0; }),
                nodes.end());

    hash_node_ids();
}

void Graph::discover_edges(const std::vector<int32_t> &region_labels, const int32_t width,
                           const int32_t height) {
    // Moore 8-connected neighbourhood
    constexpr int8_t dirs[8][2]{{1, 0}, {-1, 0},  {0, 1},  {0, -1},
                                {1, 1}, {-1, -1}, {-1, 1}, {1, -1}};

    int32_t rneigh[8];

    for (int32_t y{0}; y < height; ++y) {
        for (int32_t x{0}; x < width; ++x) {
            const int32_t idx{y * width + x};
            const int32_t rid{region_labels[idx]};

            for (int32_t k{0}; k < 8; ++k) {
                const int32_t nx{x + dirs[k][0]};
                const int32_t ny{y + dirs[k][1]};

                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    rneigh[k] = region_labels[ny * width + nx];
                } else {
                    rneigh[k] = rid;  // ignore out-of-bounds
                }
            }

            for (int32_t r : rneigh) {
                if (r != rid) {
                    add_edge(rid, r);
                }
            }
        }
    }
}

void Graph::compute_contours() {
    // overlap edge pixels
    // then compute contours

    std::set<std::pair<int, int>> adjusted_neighbors{};

    constexpr int8_t dirs[8][2]{{1, 0}, {-1, 0},  {0, 1},  {0, -1},
                                {1, 1}, {-1, -1}, {-1, 1}, {1, -1}};

    for (const Node_ptr &n : get_nodes()) {
        if (n->area() == 0) continue;

        std::vector<std::vector<uint8_t>> full_neighborhood;
        std::vector<std::array<int32_t, 4>> xywh;

        std::vector<uint8_t> node_binary;
        std::array<int32_t, 4> xywh0 = n->create_binary_image(node_binary);

        full_neighborhood.push_back(node_binary);
        xywh.push_back(xywh0);

        std::vector<Node_ptr> considered_neigbors;
        for (const auto &neighbor : n->edges()) {
            if (neighbor->area() == 0) continue;

            // check if this neighbor pairing has already been addressed
            std::pair<int, int> id1 = std::make_pair(n->id(), neighbor->id());
            std::pair<int, int> id2 = std::make_pair(neighbor->id(), n->id());
            auto _end{adjusted_neighbors.end()};
            auto _it1{adjusted_neighbors.find(id1)};
            auto _it2{adjusted_neighbors.find(id2)};

            if (_it1 != _end || _it2 != _end) {
                continue;
            }

            considered_neigbors.push_back(neighbor);

            std::vector<uint8_t> neighbor_binary;
            std::array<int32_t, 4> xywh1 = neighbor->create_binary_image(neighbor_binary);
            full_neighborhood.push_back(neighbor_binary);
            xywh.push_back(xywh1);

            adjusted_neighbors.insert(id1);
        }

        // address overlaps
        std::vector<uint8_t> neighborhood;
        std::array<int32_t, 4> bounds = {std::numeric_limits<int>::max(),
                                         std::numeric_limits<int>::max(), -1, -1};
        for (auto &_xywh : xywh) {
            if (_xywh[0] < bounds[0]) {
                bounds[0] = _xywh[0];
            }  // xmin
            if (_xywh[1] < bounds[1]) {
                bounds[1] = _xywh[1];
            }  // ymin
            if (_xywh[2] + _xywh[0] - 1 > bounds[2]) {
                bounds[2] = _xywh[2] + _xywh[0] - 1;
            }  // xmax
            if (_xywh[3] + _xywh[1] - 1 > bounds[3]) {
                bounds[3] = _xywh[3] + _xywh[1] - 1;
            }  // ymax
        }

        bounds[2] = bounds[2] - bounds[0] + 1;  // w
        bounds[3] = bounds[3] - bounds[1] + 1;  // h

        // build joined neighborhood map
        neighborhood.resize(
            static_cast<std::size_t>(bounds[2]) * static_cast<std::size_t>(bounds[3]), 0);

        for (int i = 0; i < full_neighborhood.size(); ++i) {
            for (int y = 0; y < xywh[i][3]; ++y) {
                for (int x = 0; x < xywh[i][2]; ++x) {
                    int global_y = y + xywh[i][1] - bounds[1];
                    int global_x = x + xywh[i][0] - bounds[0];
                    uint8_t val = full_neighborhood[i][y * xywh[i][2] + x];
                    if (val != 0) {
                        neighborhood[global_y * bounds[2] + global_x] = (i + 1);
                    }
                }
            }
        }

        // 0 = background, 1 = this node, 2+ = neighboring nodes

        // find touching edges
        for (int y = 0; y < bounds[3]; ++y) {
            for (int x = 0; x < bounds[2]; ++x) {
                uint8_t val = neighborhood[y * bounds[2] + x];
                // check neighbors
                if (val == 1) {
                    for (int32_t k{0}; k < 8; ++k) {
                        int32_t nx{x + dirs[k][0]};
                        int32_t ny{y + dirs[k][1]};
                        nx = std::clamp(nx, 0, bounds[2] - 1);
                        ny = std::clamp(ny, 0, bounds[3] - 1);
                        uint8_t n_val = neighborhood[ny * bounds[2] + nx];
                        if ((n_val != val) & (n_val != 0)) {
                            // need a smarter approach to prevent pinching
                            bool is_too_thin = false;
                            // check around (nx,ny) if we can stretch into another region,
                            // then it's too thin
                            for (int32_t k{0}; k < 8; ++k) {
                                int32_t mx{nx + dirs[k][0]};
                                int32_t my{ny + dirs[k][1]};
                                mx = std::clamp(mx, 0, bounds[2] - 1);
                                my = std::clamp(my, 0, bounds[3] - 1);
                                uint8_t m_val = neighborhood[my * bounds[2] + mx];

                                if ((m_val != val) & (m_val != n_val)) {
                                    is_too_thin = true;
                                }
                            }

                            if (is_too_thin) {
                                considered_neigbors[n_val - 2]->add_edge_pixel(
                                    XY{x + bounds[0], y + bounds[1]});
                            } else {
                                n->add_edge_pixel(XY{nx + bounds[0], ny + bounds[1]});
                            }
                        }
                    }
                }
            }
        }
    }

    // ask each Node to compute contours
    for (const Node_ptr &n : get_nodes()) {
        if (n->area() == 0) continue;
        n->compute_contour();
    }

    // smoothing
    std::vector<std::vector<Point>> all_contours;
    for (const Node_ptr &n : get_nodes()) {
        if (n->area() == 0) continue;

        ColoredContours *c0 = &n->m_contours;
        for (size_t i = 0; i < c0->contours.size(); ++i) {
            all_contours.push_back(c0->contours[i]);
        }
    }

    contours::coupled_smooth(
        all_contours, Rect{0.0f, 0.0f, static_cast<float>(m_width), static_cast<float>(m_height)});

    std::vector<std::vector<QuadBezier>> all_curves;
    fit_curve_reduction(all_contours, all_curves, 0.5f);

    int j = 0;
    for (const Node_ptr &n : get_nodes()) {
        if (n->area() == 0) continue;

        ColoredContours *c0 = &n->m_contours;
        for (size_t i = 0; i < c0->contours.size(); ++i) {
            std::copy(all_contours[j].begin(), all_contours[j].end(), c0->contours[i].begin());

            c0->curves[i].resize(all_curves[j].size());
            std::copy(all_curves[j].begin(), all_curves[j].end(), c0->curves[i].begin());
            j++;
        }
    }
}

void Graph::merge_small_area_nodes(const int32_t min_area) {
    int32_t counter{0};
    while (!all_areas_bigger_than(min_area)) {
        for (const Node_ptr &n : get_nodes()) {
            if (n->area() < min_area) {
                std::vector<Node_ptr> neighbors;
                neighbors.reserve(n->num_edges());
                std::copy(n->edges().begin(), n->edges().end(), std::back_inserter(neighbors));

                ImageLib::RGBPixel<uint8_t> col = n->color();
                // sort by size and color similarity
                std::sort(neighbors.begin(), neighbors.end(), [col](Node_ptr a, Node_ptr b) {
                    float cdista = ImageLib::RGBPixel<uint8_t>::colorDistance(a->color(), col);
                    float cdistb = ImageLib::RGBPixel<uint8_t>::colorDistance(b->color(), col);
                    return (static_cast<float>(a->area()) + 10.f * cdista) <
                           (static_cast<float>(b->area()) + 10.f * cdistb);
                });

                int32_t idx{0};
                // find first non-zero area neighbor
                for (Node_ptr &ne : neighbors) {
                    if (ne->area() > 0) {
                        break;
                    }
                    ++idx;
                }

                // no valid neighbor found, skip this node
                if (idx >= static_cast<int32_t>(neighbors.size())) {
                    continue;
                }

                if (neighbors[idx]->area() >= n->area()) {
                    merge_nodes(neighbors[idx], n);
                } else {
                    merge_nodes(n, neighbors[idx]);
                }
            }
        }

        clear_unconnected_nodes();
        ++counter;
    }
}
