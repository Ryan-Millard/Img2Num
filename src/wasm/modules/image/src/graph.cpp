#include "graph.h"

/*
Node class
*/
Node::Node(
    int id, // int area, 
    std::unique_ptr<std::vector<RGBXY>>& pixels
): m_id(id), 
   m_pixels(std::move(pixels))
{}

Node::~Node() {}

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

/*
Graph class - manages Node class
*/

Graph::Graph(std::unique_ptr<std::vector<Node_ptr>>& nodes) : m_nodes(std::move(nodes)) {
    hash_node_ids();
}

Graph::~Graph() {}

void Graph::hash_node_ids() {
    for (int i=0; i < m_nodes->size(); i++) {
        m_node_ids[m_nodes->at(i)->id()] = i;
    }
}

const std::vector<Node_ptr>& Graph::get_nodes() const {
    return *m_nodes;
}

bool Graph::allAreasBiggerThan(int min_area) {
    for (auto &n : *m_nodes) {
        // ignore if area > 0 bc that will be removed
        if ((n->area() < min_area) && (n->area() > 0)) {
            return false;
        }
    }

    return true;
}

const int Graph::size() {
    return m_nodes->size();
}

void Graph::add_edge(int node_id1, int node_id2){
    int idx1 = -1;
    int idx2 = -1;
    auto it = m_node_ids.find(node_id1);
    if (it != m_node_ids.end()) {
        idx1 = it->second;
    } else {
        std::cout << "Could not find node " << node_id1 << std::endl;
    }
    it = m_node_ids.find(node_id2);
    if (it != m_node_ids.end()) {
        idx2 = it->second;
    } else {
        std::cout << "Could not find node " << node_id2 << std::endl;
    }
    
    m_nodes->at(idx1)->add_edge(m_nodes->at(idx2));
    m_nodes->at(idx2)->add_edge(m_nodes->at(idx1));

    // std::cout << "Added edge between node " << node_id1 << " and " << node_id2 << std::endl;
}

void Graph::merge_nodes(const Node_ptr& node_to_keep, const Node_ptr& node_to_remove){
    int idx_k = -1;
    int idx_r = -1;

    auto it = m_node_ids.find(node_to_keep->id());
    if (it != m_node_ids.end()) {
        idx_k = it->second;
    }
    it = m_node_ids.find(node_to_remove->id());
    if (it != m_node_ids.end()) {
        idx_r = it->second;
    }

    // transfer edges from node_to_remove to node_to_keep
    for (Node_ptr n : m_nodes->at(idx_r)->edges()) {
        if (n->id() != node_to_keep->id()) {
            // prevents self referencing
            n->add_edge(node_to_keep);
            node_to_keep->add_edge(n);
            // std::cout << "Added edge between node " << node_to_keep->id() << " and " << n->id() << std::endl;
        }
    }

    node_to_keep->add_pixels(node_to_remove->get_pixels());

    node_to_remove->clear_all();

    // std::cout << "Merge node " << node_to_remove->id() << " into " << node_to_keep->id() << std::endl;
}

void Graph::clear_unconnected_nodes() {
    std::unique_ptr<std::vector<Node_ptr>> ptr;
    for (auto &n : *m_nodes){
        if (n->area() > 0) {
            ptr->push_back(std::move(n));
        }
    }

    m_nodes.swap(ptr);
    hash_node_ids();
}

void discover_edges(Graph& G, const std::vector<int>& region_labels, size_t width, size_t height){
    auto index = [width](int x, int y){ return y * width + x; };

    for (int i=0; i < width; i++) {
        for (int j=0; j < height; j++) {
            int rid = region_labels[index(i, j)];
            int rneigh[4] = {
                region_labels[size_t(index(std::max(0, i - 1), j))],
                region_labels[size_t(index(std::min(i + 1, (int)width - 1), j))],
                region_labels[size_t(index(i, std::max(0, j - 1)))],
                region_labels[size_t(index(i, std::min(j + 1, (int)height - 1)))]
            };

            for (auto &r : rneigh) {
                if (r != rid) { G.add_edge(rid, r); }
            }
        }
    }
}

void mergeSmallAreaNodes(Graph& G, int min_area) {
    int counter = 0;
    while(!G.allAreasBiggerThan(min_area)) {
        std::cout << "Graph has " << G.size() << " nodes" << std::endl;
        for (const Node_ptr& n : G.get_nodes()) {
            if ((n->area() < min_area) && (n->area() > 0)) {
                std::cout << "Node " << n->id() << " has area " << n->area() << std::endl;

                std::vector<Node_ptr> neighbors(n->num_edges());
                std::copy(n->edges().begin(), n->edges().end(), std::back_inserter(neighbors));

                std::sort(neighbors.begin(), neighbors.end(), [](Node_ptr a, Node_ptr b) { return a->area() < b->area(); });
                
                int idx = 0;
                // find first non-zero area neighbor
                for (Node_ptr &ne : neighbors) {
                    if (ne->area() > 0){
                        break;
                    }
                    idx++;
                }

                if (neighbors[idx]->area() >= n->area()) {
                    G.merge_nodes(neighbors[idx], n);
                }
                else { 
                    G.merge_nodes(n, neighbors[idx]); 
                }

            }
        }

        // G.clear_unconnected_nodes();
        counter++;
        std::cout << counter << std::endl;
    }
    std::cout << "Done merging after " << counter << " iterations" << std::endl;
}