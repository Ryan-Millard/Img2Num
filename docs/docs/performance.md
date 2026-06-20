---
id: performance
title: Performance
sidebar_position: 11
---

# Performance Tips

Img2Num runs inside WASM on a Web Worker. Here are tips to maximize throughput.

## Parallel Processing

Each function call spawns a message to the worker. For batch processing, process images in parallel:

```js
const results = await Promise.all(images.map((img) => imageToSvg(img)));
```

## Tune Parameters

| Parameter       | Tuning Direction | Effect                   |
| :-------------- | :--------------- | :----------------------- |
| `sigma_spatial` | Lower → faster   | Less spatial smoothing   |
| `num_colors`    | Lower → faster   | Fewer clusters           |
| `max_iter`      | Lower → faster   | Fewer k-means iterations |
| `min_area`      | Higher → faster  | Fewer contours to trace  |

## Downscale Large Images

Processing at full resolution can be slow. Scale down to 1080p or 720p before conversion:

```js
const canvas = document.createElement("canvas");
canvas.width = 720;
canvas.height = 720;
const ctx = canvas.getContext("2d");
ctx.drawImage(image, 0, 0, 720, 720);
const { pixels, width, height } = ctx.getImageData(0, 0, 720, 720);
```

## Worker Lifecycle

If you call Img2Num repeatedly in a single page, keep the worker alive. Img2Num initializes the worker once and reuses it automatically.

## Node.js Performance

In Node.js, the worker is process-isolated. For server-side rendering, consider:

- Using a worker pool
- Reusing the same process across multiple requests
