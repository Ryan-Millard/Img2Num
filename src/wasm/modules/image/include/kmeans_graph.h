#ifndef KMEANS_GRAPH_H
#define KMEANS_GRAPH_H

#include "exported.h" // EXPORTED macro

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

#include "Image.h"
#include "PixelConverters.h"
#include "RGBAPixel.h"

struct RGB {
  float r, g, b;
};

struct XY {
    int x, y;
};

struct RGBXY {
    uint8_t r, g, b;
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
        // int m_area;
        // std::unique_ptr<std::vector<XY>> m_coords;
        // std::unique_ptr<std::vector<RGB>> m_colors;
        std::unique_ptr<std::vector<RGBXY>> m_pixels;
        std::set<Node_ptr> m_edges {};

    public:
        Node(
            int id, 
            // int area, 
            // std::unique_ptr<std::vector<XY>>& coords, 
            // std::unique_ptr<std::vector<RGB>>& colors
            std::unique_ptr<std::vector<RGBXY>>& pixels
        );
        ~Node();

        XY centroid(void);
        RGB color(void);

        /* access member variables */
        int id() const;
        int area() const;
        const std::set<Node_ptr>& edges() const;
        int num_edges() const;
        // const std::vector<XY>& get_coords();
        // const std::vector<RGB>& get_colors();
        std::vector<RGBXY>& get_pixels() const;

        /* modify member variables */
        // void add_area(int new_area);
        // void add_coords(std::vector<XY>& new_coords);
        // void add_colors(std::vector<RGB>& new_colors);
        void add_pixels(const std::vector<RGBXY>& new_pixels);

        void clear_all();

        void add_edge(const Node_ptr& node);
        void remove_edge(const Node_ptr& node);
        void remove_all_edges();
};

class Graph {
    protected:
        std::unique_ptr<std::vector<Node_ptr>> m_nodes;
        std::map<int, int> m_node_ids;

        void hash_node_ids(void);

    public:
        Graph(std::unique_ptr<std::vector<Node_ptr>>& nodes);
        ~Graph();

        void add_edge(int node_id1, int node_id2);
        void merge_nodes(const Node_ptr& node_to_keep, const Node_ptr& node_to_remove);

        void clear_unconnected_nodes(void);

        const std::vector<Node_ptr>& get_nodes() const;

        bool allAreasBiggerThan(int min_area);
        const int size();
};

EXPORTED void kmeans_clustering_graph(uint8_t *data, int width, int height, int k,
                                int max_iter, int min_area);
#endif