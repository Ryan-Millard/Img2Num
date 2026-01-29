---
id: api
title: Graph / Node API
sidebar_label: API / Usage
sidebar_position: 5
---

# Graph / Node API

Each `Node` is a collection of pixels. A `Node` holds a `unique_ptr` to a vectors of pixels with `RGBXY` structure. \
Each pixel has its own color and position.

`Node`s reference neigbors through node pointers (`shared_ptr`)
```
Node_ptr n_ptr = std::make_shared<Node>(<id>, <std::unique_ptr<std::vector<RGBXY>> pixels>);
```

A `Graph` takes ownership over a collection of Nodes. It does so by referencing a list of Node pointers.
```
std::unique_ptr<std::vector<Node_ptr>> node_ptr =
      std::make_unique<std::vector<Node_ptr>>(std::move(nodes));
Graph G(node_ptr, width, height);
```

In sum, `Graph`s manage a list of Nodes through their pointers. Each `Node` can reference neighboring nodes as edges also through their pointers.

Since multiple entities can reference the same `Node` we use `shared_ptr`.

# Usage
This follow the step-by-step guide in the [explanation](explained.md).

1. Graph creation from kmeans labels
- Initialze nodes and region map
- Use floodfill to fill out the region map and construct nodes

![code](../../../../../../../src/wasm/modules/image/src/kmeans_graph.cpp#L73)

```
std::vector<int32_t> region_labels;
std::vector<Node_ptr> nodes;

region_labeling(image_data, kmeans_labels, region_labels, width, height, nodes);
```
In `region_labeling` each Node is assigned an id and a collections of pixels:
```
Node_ptr n_ptr = std::make_shared<Node>(r_lbl, p_ptr);
nodes.push_back(n_ptr);
```

Then initialize the `Graph`
```
std::unique_ptr<std::vector<Node_ptr>> node_ptr =
      std::make_unique<std::vector<Node_ptr>>(std::move(nodes));
Graph G(node_ptr, width, height);
```

Finally add edges between `Nodes`:
```
G.discover_edges(region_labels, width, height);
```

2. Merge small regions/nodes
```
G.merge_small_area_nodes(min_area);
```

3. Compute contours and manage gaps
```
G.compute_contours();
```

In this function nodes are iterated over one at a time.
Pseudocode:
```
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
![code2](../../../../../../../src/wasm/modules/image/src/kmeans_graph.cpp#L252)