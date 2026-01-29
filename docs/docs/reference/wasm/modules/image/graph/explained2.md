---
id: explained2
title: Node Explained
sidebar_position: 4
---

`Node`s contain a reference to image pixels and to neighboring nodes represented as edges:
```
std::unique_ptr<std::vector<RGBXY>> m_pixels;
std::set<Node_ptr> m_edges{};
```

pixels can be used to convert `Node`s back into image space preversing location and color.

Each Node optionally can track additional pixels that may affect its contour. These pixels _do not_ affect the color of the node.
```
std::set<XY> m_edge_pixels{};
```