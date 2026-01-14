#include "node.h"

/*
Node class
*/
Node::Node(
    int id, // int area, 
    std::unique_ptr<std::vector<RGBXY>>& pixels
): m_id(id), 
   m_pixels(std::move(pixels))
{}

XY Node::centroid() {
    XY centroid = XY{.x=0, .y=0};
    for (auto &c : *m_pixels) {
        centroid.x += c.x;
        centroid.y += c.y;
    }
    centroid.x = centroid.x / m_pixels->size();
    centroid.y = centroid.y / m_pixels->size();
    return centroid;
}

RGB Node::color() {
    RGB mean_col = RGB{.r=0, .g=0, .b=0};
    for (auto &c : *m_pixels) {
        mean_col.r += c.r;
        mean_col.g += c.g;
        mean_col.b += c.b;
    }
    mean_col.r = mean_col.r / m_pixels->size();
    mean_col.g = mean_col.g / m_pixels->size();
    mean_col.b = mean_col.b / m_pixels->size();
    return mean_col;
}

int Node::id() const { return m_id; };
int Node::area() const { return m_pixels->size(); };

const std::set<Node_ptr>& Node::edges() const {
    return m_edges;
}

int Node::num_edges() const {
    return m_edges.size();
}

std::vector<RGBXY>& Node::get_pixels() const {
    return *m_pixels;
}

void Node::add_edge(const Node_ptr& node) {
    m_edges.insert(node);
}

void Node::remove_edge(const Node_ptr& node) {
    m_edges.erase(node);
}

void Node::remove_all_edges() {
    m_edges.clear();
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