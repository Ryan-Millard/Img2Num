// TODO: The kmeans algorithm actually ignores the values of alpha where it
// should actually be taken into account.

#include "kmeans_graph.h"
#include "contours.h"
#include <random>

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

/* Flood fill */
int flood_fill(std::vector<int>& label_array, std::vector<int>& region_array, const uint8_t* color_array, int x, int y, int target_value, int label_value, size_t width, size_t height, std::unique_ptr<std::vector<RGBXY>>& out_pixels) {
    std::queue<XY> queue;
    auto index = [width](int x, int y){ return y * width + x; };
    
    int count = 0;
    int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

    RGBXY pix = RGBXY{
        .r=(float)color_array[4 * size_t(index(x, y))],
        .g=(float)color_array[4 * size_t(index(x, y)) + 1],
        .b=(float)color_array[4 * size_t(index(x, y)) + 2],
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
                (x1 < int(width)) &&
                (y1 >= 0) &&
                (y1 < int(height)) &&
                (label_array[size_t(index(x1, y1))] == target_value) &&
                (region_array[size_t(index(x1, y1))] == -1)
            )
            {
                RGBXY pix1 = RGBXY{
                    .r=(float)color_array[4 * size_t(index(x1, y1))],
                    .g=(float)color_array[4 * size_t(index(x1, y1)) + 1],
                    .b=(float)color_array[4 * size_t(index(x1, y1)) + 2],
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

    for (int i = 0; i < width; i++) {
        for (int j = 0; j < height; j++) {
            
            int label = labels[size_t(index(i, j))];
            int rlab = regions[size_t(index(i, j))];

            if (rlab == -1) {
                r_lbl++;
                // track pixels for this region
                // std::vector<RGBXY> pixels;
                std::unique_ptr<std::vector<RGBXY>> p_ptr = std::make_unique<std::vector<RGBXY>>();
                int counts = flood_fill(labels, regions, data, i, j, label, r_lbl, width, height, p_ptr);
                int num_pixels = p_ptr->size();

                // num_pixels == counts always
                Node_ptr n_ptr = std::make_shared<Node>(r_lbl, p_ptr);
                nodes.push_back(n_ptr);
                
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

    // 4. Discover node adjancencies - add edges to Graph
    discover_edges(G, region_labels, width, height);
    std::cout << "Done edge discovery" << std::endl;

    // 5. Merge small area nodes until all nodes are minArea or larger
    mergeSmallAreaNodes(G, min_area);
    std::cout << "Done merging small nodes" << std::endl;

    // 6. recolor image on new regions
    std::vector<uint8_t> results(4 * width * height);
    auto index = [width](int x, int y){ return y * width + x; };

    for (auto &n : G.get_nodes()) {
        if (n->area() == 0) {
            continue;
        }
        RGB col = n->color();
        for (auto &p : n->get_pixels()) {
            size_t idx{4 * static_cast<size_t>(index(p.x, p.y))};
            results[idx] = col.r;
            results[idx + 1] = col.g;
            results[idx + 2] = col.b;
            results[idx + 3] = data[idx + 3]; 
        }
    }
    std::cout << "Done coloring" << std::endl;

    // 7. Contours
    for (auto &n : G.get_nodes()) {
        // for each node collect pixels, convert to binary image, find contours
        if (n->area() == 0) {
            continue;
        }        

        /*
        get tight bounding box the encapsulates 
        all pixels held by node.
        returns in format xmin, ymin, width, height
        return a binary image - pixel present = 1, pixel absent = 0
        */
        std::array<int, 4> xywh;
        std::vector<uint8_t> binary;

        xywh = n->create_binary_image(binary);

        int xmin = xywh[0]; int ymin = xywh[1];
        int bw = xywh[2]; int bh = xywh[3];

        ContoursResult contour_res = contours::find_contours(binary, bw, bh);
        for (auto &c: contour_res.contours) {

            // generate random color
            static std::mt19937 rng(std::random_device{}());
            static std::uniform_int_distribution<int> dist(0, 255);
            uint8_t color[4] = {
                static_cast<uint8_t>(dist(rng)),
                static_cast<uint8_t>(dist(rng)),
                static_cast<uint8_t>(dist(rng)),
                255
            };

            for (auto &p : c) {
                int _x = p.x + xmin;
                int _y = p.y + ymin;
                size_t idx{4 * static_cast<size_t>(index(_x, _y))};
                results[idx] = color[0];
                results[idx + 1] = color[1];
                results[idx + 2] = color[2];
                results[idx + 3] = color[3];
            }
        }

    }
    std::cout << "Done contouring" << std::endl;

    std::memcpy(data, results.data(), results.size());

}