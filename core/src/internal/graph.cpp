#include "internal/graph.h"

#include <algorithm>
#include <iterator>
#include <queue>
#include <string>
#include <chrono>

#include "internal/Pixel.h"
#include "internal/bezier.h"
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

void Graph::process_overlapping_edges() {
    // 1. Build the Global Label Map ONCE (0 = background, else = node->id())
    std::vector<int32_t> label_map(m_width * m_height, 0);

    for (const Node_ptr &n : get_nodes()) {
        if (n->area() == 0) continue;
        
        // Assuming you have a way to get the pixels of a node directly.
        // If not, you can use your create_binary_image logic here just ONE time per node.
        for (auto &[_, p] : n->get_pixels()) {
            label_map[p.y * m_width + p.x] = n->id();
        }
    }

    constexpr int8_t dirs[8][2]{{1, 0}, {-1, 0},  {0, 1},  {0, -1},
                                {1, 1}, {-1, -1}, {-1, 1}, {1, -1}};

    // 2. Iterate directly over the pixels of each node
    for (const Node_ptr &n : get_nodes()) {
        if (n->area() == 0) continue;
        int32_t val = n->id();

        for (auto &[_, p] : n->get_pixels()) {
            int x = p.x;
            int y = p.y;

            // Check 8 neighbors in the global map
            for (int k = 0; k < 8; ++k) {
                int nx = x + dirs[k][0];
                int ny = y + dirs[k][1];

                // Fast boundary check (replaces std::clamp)
                if (nx < 0 || nx >= m_width || ny < 0 || ny >= m_height) continue;

                int32_t n_val = label_map[ny * m_width + nx];

                // Is it a neighbor? AND have we not processed this pairing yet?
                if (n_val != 0 && n_val != val && val < n_val) {
                    
                    bool is_too_thin = false;

                    // Check around the neighbor pixel for a 3rd region (pinching)
                    for (int mk = 0; mk < 8; ++mk) {
                        int mx = nx + dirs[mk][0];
                        int my = ny + dirs[mk][1];

                        if (mx < 0 || mx >= m_width || my < 0 || my >= m_height) continue;

                        int32_t m_val = label_map[my * m_width + mx];
                        
                        if (m_val != 0 && m_val != val && m_val != n_val) {
                            is_too_thin = true;
                            break; // CRITICAL: Stop checking immediately once proven thin!
                        }
                    }

                    if (is_too_thin) {
                        // Give our pixel to the neighbor
                        Node_ptr neighbor_node = m_nodes->at(m_node_ids[n_val]); // get_node_by_id(n_val); // Assuming you have this lookup
                        if (neighbor_node) {
                            neighbor_node->add_edge_pixel(XY{x, y});
                        }
                    } else {
                        // Take the neighbor's pixel
                        n->add_edge_pixel(XY{nx, ny});
                    }
                }
            }
        }
    }
}

void Graph::compute_contours() {
    // overlap edge pixels
    // then compute contours
    auto t0 = std::chrono::steady_clock::now();
    process_overlapping_edges();
    auto t1 = std::chrono::steady_clock::now();
    std::cout << "edge adjust: " << std::chrono::duration_cast<std::chrono::milliseconds>(t1 - t0).count() << std::endl;
    // ask each Node to compute contours
    t0 = std::chrono::steady_clock::now();
    for (const Node_ptr &n : get_nodes()) {
        if (n->area() == 0) continue;
        n->compute_contour();
    }
    t1 = std::chrono::steady_clock::now();
    std::cout << "recompute contours: " << std::chrono::duration_cast<std::chrono::milliseconds>(t1 - t0).count() << std::endl;

    // smoothing
    t0 = std::chrono::steady_clock::now();
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
    t1 = std::chrono::steady_clock::now();
    std::cout << "smooth contours: " << std::chrono::duration_cast<std::chrono::milliseconds>(t1 - t0).count() << std::endl;
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
                
                Node_ptr best_neighbor = nullptr;
                float best_score = std::numeric_limits<float>::max();
                for (const Node_ptr &ne : n->edges()) {
                    if (ne->area() > 0) {
                        float cdist = ImageLib::RGBPixel<uint8_t>::colorDistance(ne->color(), col);
                        float score = static_cast<float>(ne->area()) + 10.f * cdist;
                        if (score < best_score) {
                            best_score = score;
                            best_neighbor = ne;
                        }
                    }
                }

                // no valid neighbor found, skip this node
                if (!best_neighbor) { continue; }
                
                if (best_neighbor->area() >= n->area()) {
                    merge_nodes(best_neighbor, n);
                } else {
                    merge_nodes(n, best_neighbor);
                }
            }
        }

        clear_unconnected_nodes();
        ++counter;
    }
}
