// TODO: The kmeans algorithm actually ignores the values of alpha where it
// should actually be taken into account.

#include "kmeans_graph.h"

inline float colorDistance(const RGB &a, const RGB &b) {
  return std::sqrt((a.r - b.r) * (a.r - b.r) + (a.g - b.g) * (a.g - b.g) +
                   (a.b - b.b) * (a.b - b.b));
}

inline float colorDistance(const ImageLib::RGBAPixel<float> &a, const RGB &b) {
  return std::sqrt((a.red - b.r) * (a.red - b.r) +
                   (a.green - b.g) * (a.green - b.g) +
                   (a.blue - b.b) * (a.blue - b.b));
}

inline float colorDistance(const ImageLib::RGBAPixel<float> &a,
                    const ImageLib::RGBAPixel<float> &b) {
  return std::sqrt((a.red - b.red) * (a.red - b.red) +
                   (a.green - b.green) * (a.green - b.green) +
                   (a.blue - b.blue) * (a.blue - b.blue));
}

/*
Node class
*/
Node::Node(
    int id, // int area, 
    //std::unique_ptr<std::vector<XY>>& coords,
    //std::unique_ptr<std::vector<RGB>>& colors
    std::unique_ptr<std::vector<RGBXY>>& pixels
): m_id(id), 
   m_pixels(std::move(pixels))
   //m_area(area), 
   //m_coords(std::move(coords)), 
   //m_colors(std::move(colors))
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

/*const std::vector<XY>& get_coords() {
    return *m_coords;
}

const std::vector<RGB>& get_colors() {
    return *m_colors;
}*/

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

/*
void Node::add_area(int new_area) {
    m_area += new_area;
}

void Node::add_coords(std::vector<XY>& new_coords) {
    for (auto &c : new_coords) {
        m_coords->push_back(std::move(c));
    }
}
void Node::add_colors(std::vector<RGB>& new_colors) {
    for (auto &c : new_colors) {
        m_colors->push_back(std::move(c));
    }
}
*/
void Node::add_pixels(const std::vector<RGBXY>& new_pixels) {
    for (auto &c : new_pixels) {
        m_pixels->push_back(std::move(c));
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

std::vector<Node_ptr>& Graph::get_nodes() const {
    return *m_nodes;
}

bool Graph::allAreasBiggerThan(int min_area) {
    for (auto &n : *m_nodes) {
        if (n->area() < min_area) {
            return false;
        }
    }

    return true;
}

int Graph::size() {
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

    std::cout << "Added edge between node " << node_id1 << " and " << node_id2 << std::endl;
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
        // Node_ptr n = m_nodes->at(idx_r).edges[i];
        n->add_edge(node_to_keep);
        node_to_keep->add_edge(n);
    }
    
    // node_to_remove.remove_all_edges();
    // node_to_keep.add_area(node_to_remove.area());
    // node_to_keep.add_colors(node_to_remove.get_colors());
    // node_to_keep.add_coords(node_to_remove.get_coords());
    node_to_keep->add_pixels(node_to_remove->get_pixels());

    node_to_remove->clear_all();
}

void Graph::clear_unconnected_nodes() {
    std::vector<Node_ptr> filtered_nodes;
    for (auto &n : *m_nodes){
        if (n->area() > 0) {
            filtered_nodes.push_back(std::move(n));
        }
    }

    std::unique_ptr<std::vector<Node_ptr>> ptr = std::make_unique<std::vector<Node_ptr>>(filtered_nodes);

    m_nodes = std::move(ptr);
    hash_node_ids();
}

/* Flood fill */
int flood_fill(std::vector<int>& label_array, std::vector<int>& region_array, const uint8_t* color_array, int x, int y, int target_value, int label_value, size_t width, size_t height, std::unique_ptr<std::vector<RGBXY>>& out_pixels) {
    std::queue<XY> queue;
    auto index = [width](int x, int y){ return y * width + x; };
    
    int count = 0;
    int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

    RGBXY pix = RGBXY{
        .r=color_array[4 * size_t(index(x, y))],
        .g=color_array[4 * size_t(index(x, y)) + 1],
        .b=color_array[4 * size_t(index(x, y)) + 2],
        .x=x, .y=y
    };

    queue.push(XY{.x=x, .y=y});
    
    region_array[size_t(index(x, y))] = label_value;
    
    out_pixels->push_back(pix);
    count++;

    while (!queue.empty()) {
        XY c = queue.front();
        queue.pop();
        for (auto &d : dirs) {
            int x1 = c.x + d[0];
            int y1 = c.y + d[1];

            // check conditions
            if (
                (x1 >= 0) &&
                (x1 < int(width) - 1) &&
                (y1 >= 0) &&
                (y1 < int(height) - 1) &&
                (label_array[size_t(index(x1, y1))] == target_value) &&
                (region_array[size_t(index(x1, y1))] == -1)
            )
            {
                RGBXY pix1 = RGBXY{
                    .r=color_array[4 * size_t(index(x1, y1))],
                    .g=color_array[4 * size_t(index(x1, y1)) + 1],
                    .b=color_array[4 * size_t(index(x1, y1)) + 2],
                    .x=x1, .y=y1
                };
                region_array[size_t(index(x1, y1))] = label_value;
                out_pixels->push_back(pix1);
                count++;

                queue.push(XY{.x=x1, .y=y1});
            }
        }
    }

    return count;

}

/* Kmeans */

void kmeans_labeling(const uint8_t *data, std::vector<int>& labels, int width, int height, int k,
                       int max_iter) {
  ImageLib::Image<ImageLib::RGBAPixel<float>> pixels;
  pixels.loadFromBuffer(data, width, height, ImageLib::RGBA_CONVERTER<float>);
  const int num_pixels{pixels.getSize()};

  // width = k, height = 1
  // k centroids, initialized to rgba(0,0,0,255)
  // Init of each pixel is from default in Image constructor
  ImageLib::Image<ImageLib::RGBAPixel<float>> centroids{k, 1};
  // std::vector<int> labels(num_pixels, 0);
  labels.resize(num_pixels, -1);

  // Step 2: Initialize centroids randomly
  srand(static_cast<unsigned int>(time(nullptr)));
  for (int i{0}; i < k; ++i) {
    int idx = rand() % num_pixels;
    centroids[i] = pixels[idx];
  }

  // Step 3: Run k-means iterations
  for (int iter{0}; iter < max_iter; ++iter) {
    bool changed{false};

    // Assignment step
    // Iterate over pixels
    for (int i{0}; i < num_pixels; ++i) {
      float min_color_dist{std::numeric_limits<float>::max()};
      int best_cluster{0};

      // Iterate over centroids to find centroid with most similar color to pixels[i]
      for (int j{0}; j < k; ++j) {
        float dist{colorDistance(pixels[i], centroids[j])};
        if (dist < min_color_dist) {
          min_color_dist = dist;
          best_cluster = j;
        }
      }

      if (labels[i] != best_cluster) {
        changed = true;
        labels[i] = best_cluster;
      }
    }

    // Stop if no changes
    if (!changed) {
      break;
    }

    // Update step
    // std::vector<RGB> new_centroids(k, { 0, 0, 0 });
    ImageLib::Image<ImageLib::RGBAPixel<float>> new_centroids(k, 1, 0);
    std::vector<int> counts(k, 0);

    for (int i = 0; i < num_pixels; ++i) {
      int cluster = labels[i];
      new_centroids[cluster].red += pixels[i].red;
      new_centroids[cluster].green += pixels[i].green;
      new_centroids[cluster].blue += pixels[i].blue;
      counts[cluster]++;
    }

    for (int j = 0; j < k; ++j) {
      /*
         A centroid may become a dead centroid if it never gets pixels assigned
         to it. May be good idea to reinitialize these dead centroids.
      */
      if (counts[j] > 0) {
        centroids[j].red = new_centroids[j].red / counts[j];
        centroids[j].green = new_centroids[j].green / counts[j];
        centroids[j].blue = new_centroids[j].blue / counts[j];
      }
    }
  }
  /*if (false) {
    // Write the final centroid values to each pixel in the cluster
    for (int i = 0; i < num_pixels; ++i) {
        const int cluster = labels[i];
        data[i * 4 + 0] = static_cast<uint8_t>(centroids[cluster].red);
        data[i * 4 + 1] = static_cast<uint8_t>(centroids[cluster].green);
        data[i * 4 + 2] = static_cast<uint8_t>(centroids[cluster].blue);
    }
  }*/
}

void region_labeling(const uint8_t *data, std::vector<int>& labels, std::vector<int>& regions, int width, int height, std::vector<Node_ptr>& nodes) {
    auto index = [width](int x, int y){ return y * width + x; };

    regions.resize(height * width, -1);
    int r_lbl = -1;

    for (int i=0; i < width; i++) {
        for (int j=0; j < height; j ++) {
            /*RGBXY pix = RGBXY{
                .r = data[4 * index(i, j)],
                .g = data[4 * index(i, j) + 1],
                .b = data[4 * index(i, j) + 2],
                .x = i, .y = j
            }*/
            int label = labels[size_t(index(i, j))];
            int rlab = regions[size_t(index(i, j))];

            if (rlab == -1) {
                r_lbl++;
                // track pixels for this region
                // std::vector<RGBXY> pixels;
                std::unique_ptr<std::vector<RGBXY>> p_ptr = std::make_unique<std::vector<RGBXY>>();
                int counts = flood_fill(labels, regions, data, i, j, label, r_lbl, width, height, p_ptr);
                int num_pixels = p_ptr->size();
                if (counts == num_pixels) {
                    // should always be true
                    std::cout << "Counts: " << counts << std::endl;

                    Node_ptr n_ptr = std::make_shared<Node>(r_lbl, p_ptr);
                    nodes.push_back(n_ptr);
                }
                else {
                    std::cout << "Floodfill error!!" << std::endl;
                    std::cout << "Counts: " << counts << std::endl;
                    std::cout << "Num pixels: " << num_pixels << std::endl;
                }
            }
        }
    }

}

void kmeans_clustering_graph(uint8_t *data, int width, int height, int k,
                       int max_iter, int min_area) 
{
    std::vector<int> kmeans_labels;
    std::vector<int> region_labels;

    std::cout << "Start kmeans_clustering_graph" << std::endl;

    // 1. create labels based on kmean colors
    kmeans_labeling(data, kmeans_labels, width, height, k, max_iter);
    std::cout << "Done kmeans labels" << std::endl;
    
    // 2. enumerate regions and convert to Nodes
    std::vector<Node_ptr> nodes;
    region_labeling(data, kmeans_labels, region_labels, width, height, nodes);
    std::cout << "Done region labels" << std::endl;

    // 3. initialize Graph from all Nodes
    std::unique_ptr<std::vector<Node_ptr>> node_ptr = std::make_unique<std::vector<Node_ptr>>(std::move(nodes));
    Graph G(node_ptr);
    std::cout << "Init graph" << std::endl;

    auto index = [width](int x, int y){ return y * width + x; };

    // 4. Discover node adjancencies - add edges to Graph
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
    std::cout << "Done edge discovery" << std::endl;
    // 5. Merge small area nodes until all nodes are minArea or larger
    while(G.allAreasBiggerThan(min_area)) {
        for (const Node_ptr& n : G.get_nodes()) {
            if ((n->area() < min_area) && (n->area() < 0)) {
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
    }
    std::cout << "Done merging" << std::endl;
    // 6. recolor image on new regions
    std::vector<uint8_t> results(4 * width * height);
    for (auto &n : G.get_nodes()) {
        RGB col = n->color();
        for (auto &p : n->get_pixels()) {
            results[4 * size_t(index(p.x, p.y))] = col.r;
            results[4 * size_t(index(p.x, p.y)) + 1] = col.g;
            results[4 * size_t(index(p.x, p.y)) + 2] = col.b;
            results[4 * size_t(index(p.x, p.y)) + 3] = data[4 * size_t(index(p.x, p.y)) + 3]; 
        }
    }
    std::cout << "Done coloring" << std::endl;
    std::memcpy(data, results.data(), results.size());

}