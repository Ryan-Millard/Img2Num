#include "graph.h"

/*
Graph class - manages Node class
*/

Graph::Graph(std::unique_ptr<std::vector<Node_ptr>>& nodes) : m_nodes(std::move(nodes)) {
    hash_node_ids();
}

void Graph::hash_node_ids() {
    /* 
    to quickly search m_nodes (std::vector) for the index of a node id
    create an std::unordered_map of node id - index pairs
    indexing time of std::vector by value is O(N)
    lookup time of std::unordered_map by key is O(log(N))
    */
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
        if (n->area() < min_area) {
            return false;
        }
    }

    return true;
}

const int Graph::size() {
    return m_nodes->size();
}

bool Graph::add_edge(int node_id1, int node_id2) {
    int idx1 = -1;
    int idx2 = -1;

    auto end_node_ids{m_node_ids.end()};
    auto node1_it = m_node_ids.find(node_id1);
    auto node2_it = m_node_ids.find(node_id2);
    if (node1_it == end_node_ids || node2_it == end_node_ids) {
        return false;
    }

    idx1 = node1_it->second;
    idx2 = node2_it->second;

    m_nodes->at(idx1)->add_edge(m_nodes->at(idx2));
    m_nodes->at(idx2)->add_edge(m_nodes->at(idx1));
    return true;
}

bool Graph::merge_nodes(const Node_ptr& node_to_keep, const Node_ptr& node_to_remove){
    int idx_k = -1;
    int idx_r = -1;

    auto end_node_ids{m_node_ids.end()};
    auto node1_it = m_node_ids.find(node_to_keep->id());
    auto node2_it = m_node_ids.find(node_to_remove->id());
    if (node1_it == end_node_ids || node2_it == end_node_ids) {
        return false;
    }

    idx_k = node1_it->second;
    idx_r = node2_it->second;

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

    return true;
}

void Graph::clear_unconnected_nodes() {
    auto &nodes = *m_nodes;
    nodes.erase(
        std::remove_if(nodes.begin(), nodes.end(),
                        [](const Node_ptr &n) { return n->area() == 0; }),
        nodes.end()
    );
    hash_node_ids();
}

void discover_edges(Graph& G, const std::vector<int>& region_labels, size_t width, size_t height){
    auto index = [width](int x, int y){ return y * width + x; };
    int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}}; // 4 moore directions
    
    int rneigh[4];

    for (int i=0; i < width; i++) {
        for (int j=0; j < height; j++) {
            int rid = region_labels[index(i, j)];
            
            for (int k=0; k < 4; k++) {
                rneigh[k] = region_labels[
                    size_t(index(
                            std::clamp(i + dirs[k][0], 0, (int)width - 1),
                            std::clamp(j + dirs[k][1], 0, (int)height - 1)
                    ))
                ];
            }

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
            if (n->area() < min_area) {
                // std::cout << "Node " << n->id() << " has area " << n->area() << std::endl;

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

        G.clear_unconnected_nodes();
        counter++;
    }
    std::cout << "Done merging after " << counter << " iterations" << std::endl;
}