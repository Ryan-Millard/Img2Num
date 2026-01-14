#ifndef NODE_H
#define NODE_H

#include <cmath>
#include <cstdint>
#include <cstdlib>
#include <ctime>
#include <iostream>
#include <limits>
#include <vector>
#include <set>
#include <map>
#include <memory>

/*
Graph and Node classes support conversion of a region divided image into a graph structure.
Each Node represents a region of pixels which tracks the color and coordinates (RGBXY) of belonging pixels, and its neighbors as edges.

usage:

std::vector<Node_ptr> nodes; // list of all nodes to be tracked

std::unique_ptr<std::vector<RGBXY>> p_ptr = std::make_unique<std::vector<RGBXY>>(); // vector of pixels belonging to this region
Node_ptr n_ptr = std::make_shared<Node>(<node id>, p_ptr);
nodes.push_back(n_ptr);

Graph manages a collection of nodes. It will take ownership of `nodes`.
A graph is initialized as a list of disconnected nodes.

std::unique_ptr<std::vector<Node_ptr>> node_ptr = std::make_unique<std::vector<Node_ptr>>(std::move(nodes));
Graph G(node_ptr);

Given a region image, edges are discovered and recorded:
discover_edges(G, region_labels, width, height);

*/

struct RGB {
  float r, g, b;
};

struct XY {
    int x, y;
};

struct RGBXY {
    float r, g, b;
    int x, y;
};

class Node;
typedef std::shared_ptr<Node> Node_ptr;

/*
Node represents a region - collection of pixels, and their neighboring regions (edges)
*/

class Node {
    protected:
        int m_id;
        std::unique_ptr<std::vector<RGBXY>> m_pixels;
        std::set<Node_ptr> m_edges {};

    public:
        Node(
            int id, 
            std::unique_ptr<std::vector<RGBXY>>& pixels
        );
        ~Node() = default;

        XY centroid(void);
        RGB color(void);

        /* access member variables */
        int id() const;
        int area() const;
        const std::set<Node_ptr>& edges() const;
        int num_edges() const;
        std::vector<RGBXY>& get_pixels() const;

        /* modify member variables */
        void add_pixels(const std::vector<RGBXY>& new_pixels);

        void clear_all();

        void add_edge(const Node_ptr& node);
        void remove_edge(const Node_ptr& node);
        void remove_all_edges();
};

#endif