#ifndef GRAPH_H
#define GRAPH_H

#include "internal/node.h"

#include <unordered_map>

/*
   Graph and Node classes support conversion of a region divided image into a
graph structure. Each Node represents a region of pixels which tracks the color
and coordinates (RGBXY) of belonging pixels, and its neighbors as edges.

usage:

std::vector<Node_ptr> nodes; // list of all nodes to be tracked

std::unique_ptr<std::vector<RGBXY>> p_ptr =
std::make_unique<std::vector<RGBXY>>(); // vector of pixels belonging to this
region Node_ptr n_ptr = std::make_shared<Node>(<node id>, p_ptr);
nodes.push_back(n_ptr);

Graph manages a collection of nodes. It will take ownership of `nodes`.
A graph is initialized as a list of disconnected nodes.

std::unique_ptr<std::vector<Node_ptr>> node_ptr =
std::make_unique<std::vector<Node_ptr>>(std::move(nodes)); Graph G(node_ptr);

Given a region image, edges are discovered and recorded:
discover_edges(G, region_labels, width, height);

*/

class Graph {
  protected:
    int m_width, m_height;
    std::unique_ptr<std::vector<Node_ptr>> m_nodes;
    std::unordered_map<int32_t, int32_t> m_node_ids;

    void hash_node_ids(void);
    void process_overlapping_edges();

<<<<<<< HEAD
    inline uint8_t getPixel(const std::vector<uint8_t>& img, int w, int h, int x, int y) {
        if (x < 0 || x >= w || y < 0 || y >= h) return 0; // Boundary check
        return img[y * w + x];
    }

    std::vector<uint8_t> analyzeJunctions(const std::vector<uint8_t>& skel, int w, int h);

   public:
    inline Graph(std::unique_ptr<std::vector<Node_ptr>> &nodes, int width, int height)
        : m_nodes(std::move(nodes)), m_width(width), m_height(height) {
=======
    /**
     * `@brief` Safely retrieves a pixel value from a binary image with bounds checking.
     *
     * `@param` img Binary image buffer
     * `@param` w Image width
     * `@param` h Image height
     * `@param` x Pixel x-coordinate
     * `@param` y Pixel y-coordinate
     * `@return` Pixel value at (x, y), or 0 if out of bounds
     */
    inline uint8_t getPixel(const std::vector<uint8_t>& img, int w, int h, int x, int y) {
        if (x < 0 || x >= w || y < 0 || y >= h)
            return 0; // Boundary check
        return img[y * w + x];
    }

    /**
     * `@brief` Analyzes a skeleton image to detect junction points using 8-neighbor
     * crossing-number.
     *
     * Scans the skeleton image and marks pixels as junctions where three or more branches meet,
     * using the crossing-number method (counts 0→1 transitions in the 8-neighbor ring).
     *
     * `@param` skel Binary skeleton image (nonzero = skeleton pixel)
     * `@param` w Image width
     * `@param` h Image height
     * `@return` Junction mask with nonzero entries marking junction pixels
     */
    std::vector<uint8_t> analyzeJunctions(const std::vector<uint8_t>& skel, int w, int h);

  public:
    inline Graph(std::unique_ptr<std::vector<Node_ptr>>& nodes, int width, int height)
        : m_nodes(std::move(nodes))
        , m_width(width)
        , m_height(height) {
>>>>>>> dev_sync
        hash_node_ids();
    }

    inline ~Graph() {
        // Break the circular references so the shared_ptrs can reach 0
        for (auto& node : *m_nodes) {
            node->clear_all();
        }
    }

    bool add_edge(int32_t node_id1, int32_t node_id2);
    bool merge_nodes(const Node_ptr& node_to_keep, const Node_ptr& node_to_remove);

    void clear_unconnected_nodes();

    inline const std::vector<Node_ptr>& get_nodes() const {
        return *m_nodes;
    }

    bool all_areas_bigger_than(int32_t min_area);
    inline const size_t size() {
        return m_nodes->size();
    }

    void discover_edges(
        const std::vector<int32_t>& region_labels, const int32_t width, const int32_t height
    );
    void merge_small_area_nodes(const int32_t min_area, const int32_t min_thickness = 0);
    void compute_contours();
};

#endif
