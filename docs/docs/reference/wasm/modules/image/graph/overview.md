---
id: overview
title: Graph Data Structure Overview
sidebar_label: Overview
sidebar_position: 2
---

# Graph Data Structure Overview

Images are pixels on a 2D grid. This is a type of densely connected graph, where each pixel in a quantized local region is a node and each neighbor is an edge. We can break images into regions using KMeans or SLIC. In this case we want to track neighboring relations between these regions. We convert images into a `Graph` datastructure consisting of `Node` nodes. Each `Node` is a collection of pixels representing a unique region. Each `Node` tracks its immediate neighbors. The `Graph` manages all `Node`s.
![illustration](./diagrams/diagram1.svg)
