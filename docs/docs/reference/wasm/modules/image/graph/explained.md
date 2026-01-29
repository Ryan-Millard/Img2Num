---
id: explained
title: Graph Explained
sidebar_position: 3
---

To explain Graph creation from image regions we show a concrete step-by-step example.

1. Consider starting from an image (after bilateral-filtering).
![Image](./img/image.png)

We use KMeans or a similar method to generate initial regions. But these regions do not have unique identifiers. \
Notice also that there are many tiny regions caused by quantization noise even after filtering.
![KMeans](./img/kmeans.png)

We want a smart approach to merge small regions into neighboring regions. To do this build a `Graph`.

2. Building graphs consists of 2 steps:
    - Uniquely label neighboring regions. Floodfill is used for this. This discovers connected components - each connected component becomes a `Node`
    ![Regions](./img/regions.png)

    - Tracking neighbors - the region labels are parsed to check for neighbors by looking at 3x3 neighborhoods. Each `Node` is updated with a list of neighbors forming an undirected graph.
    ![Graph](./img/region_graph.png)

NOTE: Since many regions are concave, their centroids may appear to be lying far away, but this is correct. Centroids here are just used for visualizing the graph.

3. Merging small regions

The `Graph` is parsed to locate small area nodes. A small nodes are merged with a neighboring node by transfering its pixels and edges to the absorbing node.
![Graph2](./img/region_graph2.png)
![Regions2](./img/regions2.png)

4. Contour creation

Now that small nodes have been pruned, each `Node` can compute its own contour using the Suzuki-Abe method.
![Contours](./img/contours.png)

However, while correct adjacent nodes will have parallel contours which becomes a problem in SVG creation.
![ContoursZ](./img/contours_zoom.png)

5. Contour Management

To solve this problem `Graph` has to overlap neighboring contours. For this `Nodes` have a special `edge_pixel` property to keep track of additional pixels to be considered for the contour. This forces neighboring contours to perfectly overlap creating no gaps or holes, which is important for SVGs.

Before gap management
![gaps](./img/cow_contours_gap.png)

After gap management
![nogaps](./img/cow_contours.png)