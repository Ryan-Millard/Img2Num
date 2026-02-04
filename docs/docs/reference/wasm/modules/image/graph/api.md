---
id: api
title: Graph / Node API
sidebar_label: API / Usage
sidebar_position: 5
---

# Graph / Node API

Each `Node` is a collection of pixels. A `Node` holds a `unique_ptr` to a vectors of pixels with `RGBXY` structure. \
Each pixel has its own color and position.

`Node`s reference neighbors through node pointers (`shared_ptr`)

```cpp title="Nodes reference neigbors through node shared pointers"
Node_ptr n_ptr = std::make_shared<Node>(<id>, <std::unique_ptr<std::vector<RGBXY>> pixels>);
```

A `Graph` takes ownership over a collection of Nodes. It does so by referencing a list of Node pointers.

```cpp title="A Graph takes ownership over a collection of Nodes. It does so by referencing a list of Node pointers."
std::unique_ptr<std::vector<Node_ptr>> node_ptr =
      std::make_unique<std::vector<Node_ptr>>(std::move(nodes));
Graph G(node_ptr, width, height);
```

:::tip
In sum, `Graph`s manage a list of Nodes through their pointers. Each `Node` can reference neighboring nodes as edges also through their pointers.
Since multiple entities can reference the same `Node` we use `shared_ptr`.
:::

# Usage

This follows the step-by-step guide in the [explanation](explained.md).

1. Graph creation from kmeans labels

- Initialize nodes and region map
- Use floodfill to fill out the region map and construct nodes

```cpp
std::vector<int32_t> region_labels;
std::vector<Node_ptr> nodes;

region_labeling(image_data, kmeans_labels, region_labels, width, height, nodes);
```

In `region_labeling` each Node is assigned an id and a collections of pixels:

```cpp
Node_ptr n_ptr = std::make_shared<Node>(r_lbl, p_ptr);
nodes.push_back(n_ptr);
```

Then initialize the `Graph`

```cpp
std::unique_ptr<std::vector<Node_ptr>> node_ptr =
      std::make_unique<std::vector<Node_ptr>>(std::move(nodes));
Graph G(node_ptr, width, height);
```

Finally add edges between `Nodes`:

```cpp
G.discover_edges(region_labels, width, height);
```

2. Merge small regions/nodes

```cpp
G.merge_small_area_nodes(min_area);
```

3. Compute contours and manage gaps

```cpp
G.compute_contours();
```

In this function nodes are iterated over one at a time.
Pseudocode:

```text
for node in G.nodes
{
    // Consider all neigbors
    for neigbor in node.edges
    {
        // collect pixels for each neighbor
    }
    /*
    1. Create joint grid plot of all pixels in node and neighbors
    2. Find edge pixels
    3. Decide if edge pixel should be added to the `node`'s or `neigbor`'s edge_pixel collection to ensure contour overlap
    */
}

for node in G.nodes
{
    // compute contour per node
}
```

4. Collect all contours for SVG export

---

# Node Class Documentation

## Member Variables

### Protected Members (Internal State)

| Variable Name   | Type                                  | Description                                                                                                              |
| :-------------- | :------------------------------------ | :----------------------------------------------------------------------------------------------------------------------- |
| `m_id`          | `int32_t`                             | Unique identifier for the node.                                                                                          |
| `m_pixels`      | `std::unique_ptr<std::vector<RGBXY>>` | Exclusive ownership of the raw pixel data defining this region.                                                          |
| `m_edges`       | `std::set<Node_ptr>`                  | Adjacency list containing pointers to neighboring `Node` objects.                                                        |
| `m_edge_pixels` | `std::set<XY>`                        | Auxiliary pixels used for contour tracing. These are distinct from `m_pixels` and do not affect color/area calculations. |

### Public Members

| Variable Name | Type              | Description                                                                                     |
| :------------ | :---------------- | :---------------------------------------------------------------------------------------------- |
| `m_contours`  | `ColoredContours` | Vector representation of the node boundaries. Populated only after calling `compute_contour()`. |

---

## API Reference

### 1. Lifecycle

#### `Node(int32_t id, std::unique_ptr<std::vector<RGBXY>> &pixels)`

Constructs a new Node.

- **id:** The unique integer ID.
- **pixels:** Reference to a unique pointer containing pixel data. Ownership is transferred to the Node using `std::move`.

#### `void clear_all()`

Resets the node completely, clearing pixel data, edges, and internal buffers.

---

### 2. Geometric & Visual Properties

#### `XY centroid() const`

Calculates the geometric center of mass (average X, Y) of the region.

#### `ImageLib::RGBPixel<uint8_t> color() const`

Computes the representative color of the node (typically the average color of all pixels in `m_pixels`).

#### `std::array<int32_t, 4> bounding_box_xywh() const`

Calculates the axis-aligned bounding box.

- **Returns:** `[min_x, min_y, width, height]`

#### `size_t area() const`

Returns the total number of pixels currently contained in the node.

---

### 3. Graph Topology Management

Methods to manage the adjacency list (`m_edges`).

- `void add_edge(const Node_ptr &node)`: Adds a connection to a neighbor.
- `void remove_edge(const Node_ptr &node)`: Removes a specific connection.
- `void remove_all_edges()`: Clears all connections (isolates the node).
- `const std::set<Node_ptr> &edges() const`: Returns a read-only reference to the neighbor set.
- `size_t num_edges() const`: Returns the degree of the node.

---

### 4. Image & Contour Operations

#### `std::array<int, 4> create_binary_image(std::vector<uint8_t> &binary) const`

Rasterizes the node into a binary mask.

- **binary:** Output buffer where the mask is written.
- **Returns:** Array describing dimensions/offsets of the generated mask.

#### `void compute_contour()`

Calculates the vector contours of the node based on edge pixels and populates `m_contours`.

#### `void add_edge_pixel(const XY edge_pixel)`

Adds a coordinate to the set used specifically for boundary tracing.

#### `void clear_edge_pixels()`

Clears the temporary edge pixel buffer.

---

### 5. Data Access & Modification

- `int32_t id() const`: Getter for the Node ID.
- `const std::vector<RGBXY> &get_pixels() const`: Read-only access to the raw pixel vector.
- `ColoredContours &get_contours()`: Mutable access to the contour data.
- `void add_pixels(const std::vector<RGBXY> &new_pixels)`: Merges new pixels into the existing node.

---

# Graph Class Documentation

## Member Variables

### Protected Members (Internal State)

| Variable Name         | Type                                     | Description                                                          |
| --------------------- | ---------------------------------------- | -------------------------------------------------------------------- |
| `m_width`, `m_height` | `int`                                    | Dimensions of the original source image.                             |
| `m_nodes`             | `std::unique_ptr<std::vector<Node_ptr>>` | The collection of all nodes in the graph.                            |
| `m_node_ids`          | `std::unordered_map<int32_t, int32_t>`   | A lookup map linking `Node ID` to `Vector Index` for fast retrieval. |

---

### 1. Initialization

#### `Graph(std::unique_ptr<std::vector<Node_ptr>> &nodes, int width, int height)`

Constructs the Graph.

- **nodes:** A unique pointer to a vector of Node pointers.
- **Behavior:** The constructor calls `std::move` on the `nodes` argument, taking full ownership of the data. It also triggers `hash_node_ids()` to build the internal lookup map.

---

### 2. Topology Analysis (Edge Discovery)

#### `void discover_edges(const std::vector<int32_t> &region_labels, int32_t width, int32_t height)`

Iterates through a raster label image to find adjacent regions.

- **region_labels:** A flattened vector where each value represents the Node ID that the pixel belongs to.
- **Behavior:** Scans neighbors (8-connected) in the label map. If two adjacent pixels have different labels, an edge is added between the corresponding Nodes.

#### `bool add_edge(int32_t node_id1, int32_t node_id2)`

Manually creates a connection between two nodes identified by their IDs.
Calls `add_edge` for both Nodes

- **Returns:** `true` if the edge was successfully added, `false` if nodes were not found.

---

### 3. Graph Simplification (Merging & Pruning)

#### `bool merge_nodes(const Node_ptr &node_to_keep, const Node_ptr &node_to_remove)`

Combines two nodes into one. Called by `merge_small_area_nodes`.

- **Behavior:**

1. Transfers pixels and edges from `node_to_remove` to `node_to_keep`.
2. Updates the topology of neighbors.
3. Removes `node_to_remove` from the active graph.

- **Returns:** `true` if merge successful.

#### `void merge_small_area_nodes(int32_t min_area)`

Iteratively merges nodes smaller than `min_area` into their largest neighbors. This is used to clean up "speckle" noise or insignificant regions.

#### `void clear_unconnected_nodes()`

Removes nodes that have no edges (orphaned regions) from the internal list.

---

### 4. Data Processing & Access

#### `void compute_contours()`

Iterates through all nodes in the graph and triggers their individual `compute_contour()` methods.

#### `const std::vector<Node_ptr> &get_nodes() const`

Returns a read-only reference to the underlying vector of nodes.

#### `size_t size()`

Returns the number of nodes currently in the graph.

#### `bool all_areas_bigger_than(int32_t min_area)`

Utility check to verify if the graph simplification process (merging small nodes) is complete.

- **Returns:** `true` if every node in the graph has an area greater than `min_area`.
