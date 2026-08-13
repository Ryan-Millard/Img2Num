# ImageToSvgConfig

URL: https://img2num.dev/docs/py/api-reference/classes/ImageToSvgConfig

Configuration options for image_to_svg.

This class holds parameters for bilateral filtering, K-means clustering, and SVG generation. All parameters have sensible defaults.

## BilateralFilterConfig

Configuration for the bilateral filter used in image_to_svg.

### Properties

| Property | Type | Default | Description | `sigma_range` | `float` | `50.0` | Standard deviation for range Gaussian (intensity similarity weight) | `sigma_spatial` | `float` | `3.0` | Standard deviation for spatial Gaussian (proximity weight) 

## KMeansConfig

Configuration for the K-means clustering used in image_to_svg.

### Properties

| Property | Type | Default | Description | `k` | `int` | `16` | Number of clusters to compute. Roughly represents number of unique colors discovered | `max_iter` | `int` | `100` | Maximum number of iterations for the K-means algorithm
