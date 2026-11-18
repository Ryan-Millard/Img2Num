#include "internal/graph.h"

#include "internal/bezier.h"
#include "internal/Pixel.h"
#include "internal/shared_contours.h"

#include <algorithm>
#include <cmath>
#include <cstdlib>
#include <iterator>
#include <queue>
#include <string>
/*
 Graph class - manages Node class
*/

/*
To quickly search m_nodes (std::vector) for the index of a node id
create an std::unordered_map of node id - index pairs
indexing time of std::vector by value is O(N)
lookup time of std::unordered_map by key is O(log(N))
*/
void Graph::hash_node_ids() {
    for (int32_t i {0}; i < m_nodes->size(); i++) {
        const int32_t key {m_nodes->at(i)->id()};
        m_node_ids[key] = i;
    }
}

bool Graph::add_edge(int32_t node_id1, int32_t node_id2) {
    auto end_node_ids {m_node_ids.end()};
    auto node1_it {m_node_ids.find(node_id1)};
    auto node2_it {m_node_ids.find(node_id2)};

    if (node1_it == end_node_ids || node2_it == end_node_ids) {
        return false;
    }

    const int32_t idx1 {node1_it->second};
    const int32_t idx2 {node2_it->second};

    m_nodes->at(idx1)->add_edge(m_nodes->at(idx2));
    m_nodes->at(idx2)->add_edge(m_nodes->at(idx1));
    return true;
}

bool Graph::merge_nodes(const Node_ptr& node_to_keep, const Node_ptr& node_to_remove) {
    auto end_node_ids {m_node_ids.end()};
    auto node1_it {m_node_ids.find(node_to_keep->id())};
    auto node2_it {m_node_ids.find(node_to_remove->id())};

    if (node1_it == end_node_ids || node2_it == end_node_ids) {
        return false;
    }

    const int32_t idx_k {node1_it->second};
    const int32_t idx_r {node2_it->second};

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
    std::vector<Node_ptr>& nodes {*m_nodes};

    nodes.erase(
        std::remove_if(
            nodes.begin(), nodes.end(), [](const Node_ptr& n) { return n->area() == 0; }
        ),
        nodes.end()
    );

    hash_node_ids();
}

void Graph::discover_edges(
    const std::vector<int32_t>& region_labels, const int32_t width, const int32_t height
) {
    // Moore 8-connected neighbourhood
    constexpr int8_t dirs[8][2] {{1, 0}, {-1, 0},  {0, 1},  {0, -1},
                                 {1, 1}, {-1, -1}, {-1, 1}, {1, -1}};

    int32_t rneigh[8];

    for (int32_t y {0}; y < height; ++y) {
        for (int32_t x {0}; x < width; ++x) {
            const int32_t idx {y * width + x};
            const int32_t rid {region_labels[idx]};

            for (int32_t k {0}; k < 8; ++k) {
                const int32_t nx {x + dirs[k][0]};
                const int32_t ny {y + dirs[k][1]};

                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    rneigh[k] = region_labels[ny * width + nx];
                } else {
                    rneigh[k] = rid; // ignore out-of-bounds
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

    /*
    Shared-edge mode: build region boundaries on the crack grid so
    neighbouring contours are exactly coincident along shared edges -- no
    overlap band, no gaps
    */

    float eps = 0.25f;

    std::vector<int32_t> labels(static_cast<size_t>(m_width) * m_height, -1);
    for (const Node_ptr& n : get_nodes()) {
        if (n->area() == 0)
            continue;
        for (auto& p : n->get_pixels())
            labels[static_cast<size_t>(p.position.y) * m_width + p.position.x] = n->id();
    }

    auto loops = build_shared_loops(labels, m_width, m_height, eps);

    for (const Node_ptr& n : get_nodes()) {
        if (n->area() == 0)
            continue;
        n->clear_contour();
        auto it = loops.find(n->id());
        if (it == loops.end())
            continue;
        ImageLib::RGBPixel<uint8_t> c = n->color();
        ImageLib::RGBAPixel<uint8_t> col {c.red, c.green, c.blue, 255};
        for (std::vector<QuadBezier>& curve : it->second) {
            std::vector<Point> anchors; // keep contours[] parallel to curves[]
            anchors.reserve(curve.size() + 1);
            for (const QuadBezier& q : curve)
                anchors.push_back(q.p0);
            if (!curve.empty())
                anchors.push_back(curve.back().p2);
            n->m_contours.contours.push_back(std::move(anchors));
            n->m_contours.curves.push_back(std::move(curve));
            n->m_contours.colors.push_back(col);
            n->m_contours.hierarchy.push_back({-1, -1, -1, -1});
            n->m_contours.is_hole.push_back(false);
        }
    }
}

namespace {

// 1D squared-distance transform (Felzenszwalb & Huttenlocher): for every q,
// d[q] = min_p ( (q - p)^2 + f[p] ). O(n).
void dt_1d(const std::vector<float>& f, std::vector<float>& d, int n) {
    constexpr float INF = 1e20f;
    std::vector<int> v(n);
    std::vector<float> z(n + 1);
    int k = 0;
    v[0] = 0;
    z[0] = -INF;
    z[1] = INF;
    for (int q = 1; q < n; ++q) {
        float s;
        while (true) {
            s = ((f[q] + static_cast<float>(q) * q) - (f[v[k]] + static_cast<float>(v[k]) * v[k])) /
                (2.0f * static_cast<float>(q - v[k]));
            if (s <= z[k] && k > 0) {
                --k;
            } else {
                break;
            }
        }
        ++k;
        v[k] = q;
        z[k] = s;
        z[k + 1] = INF;
    }
    k = 0;
    for (int q = 0; q < n; ++q) {
        while (z[k + 1] < static_cast<float>(q))
            ++k;
        const float dq = static_cast<float>(q - v[k]);
        d[q] = dq * dq + f[v[k]];
    }
}

// Largest inscribed-disk radius (in pixels) of a region: the maximum over all
// region pixels of the Euclidean distance to the nearest non-region pixel.
// Computed with an exact squared Euclidean distance transform, so the result is
// independent of how long or how curved the region is -- a property that a
// bounding-box aspect ratio does not have. Thickness ~= 2 * this radius.
float max_inscribed_radius(const Node_ptr& n) {
    std::vector<uint8_t> mask;
    const std::array<int, 4> xywh = n->create_binary_image(mask); // tight bbox
    const int w = xywh[2];
    const int h = xywh[3];
    if (w <= 0 || h <= 0)
        return 0.0f;

    // Pad by one pixel so the region's boundary against the exterior is treated
    // as background by the distance transform.
    const int pw = w + 2;
    const int ph = h + 2;
    constexpr float INF = 1e20f;

    std::vector<float> grid(static_cast<size_t>(pw) * ph);
    for (int y = 0; y < ph; ++y) {
        for (int x = 0; x < pw; ++x) {
            const bool inside = x >= 1 && x <= w && y >= 1 && y <= h &&
                                mask[static_cast<size_t>(y - 1) * w + (x - 1)];
            grid[static_cast<size_t>(y) * pw + x] = inside ? INF : 0.0f;
        }
    }

    // Separable two-pass transform: columns first, then rows.
    std::vector<float> in, out(std::max(pw, ph));
    in.resize(ph);
    for (int x = 0; x < pw; ++x) {
        for (int y = 0; y < ph; ++y)
            in[y] = grid[static_cast<size_t>(y) * pw + x];
        dt_1d(in, out, ph);
        for (int y = 0; y < ph; ++y)
            grid[static_cast<size_t>(y) * pw + x] = out[y];
    }
    in.resize(pw);
    float max_d2 = 0.0f;
    for (int y = 0; y < ph; ++y) {
        for (int x = 0; x < pw; ++x)
            in[x] = grid[static_cast<size_t>(y) * pw + x];
        dt_1d(in, out, pw);
        for (int x = 0; x < pw; ++x)
            if (out[x] > max_d2)
                max_d2 = out[x];
    }
    return std::sqrt(max_d2);
}

} // namespace

void Graph::merge_small_area_nodes(const int32_t min_area, const int32_t min_thickness) {
    // Keep merging while any pass still makes progress. Using "did this pass
    // merge anything?" as the loop guard (instead of re-testing every node)
    // also avoids spinning forever on a node that is too small/thin but has no
    // valid neighbour to merge into.
    bool merged_any = true;
    while (merged_any) {
        merged_any = false;

        for (const Node_ptr& n : get_nodes()) {
            if (n->area() == 0)
                continue;

            bool needs_merge = n->area() < static_cast<size_t>(min_area);
            if (!needs_merge && min_thickness > 0) {
                // too thin == no inscribed disk of radius min_thickness/2 fits.
                needs_merge = 2.0f * max_inscribed_radius(n) < static_cast<float>(min_thickness);
            }
            if (!needs_merge)
                continue;

            ImageLib::RGBPixel<uint8_t> col = n->color();

            Node_ptr best_neighbor = nullptr;
            float best_score = std::numeric_limits<float>::max();
            for (const Node_ptr& ne : n->edges()) {
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
            if (!best_neighbor) {
                continue;
            }

            if (best_neighbor->area() >= n->area()) {
                merge_nodes(best_neighbor, n);
            } else {
                merge_nodes(n, best_neighbor);
            }
            merged_any = true;
        }

        clear_unconnected_nodes();
    }
}
