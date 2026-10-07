\---

title: Img2Num Python Usage Guide

sidebar\_label: Usage

sidebar\_position: 4

\---



\# Usage Guide



\## Basic Usage



The Img2Num Python binding accepts images as NumPy arrays in \*\*RGBA format\*\*.

The simplest way to convert an image to SVG is to use `image\_to\_svg()`.



```python

from PIL import Image

import numpy as np

from img2num import image\_to\_svg



\# Load the image as RGBA

img = np.array(Image.open("input.png").convert("RGBA"))



\# Convert the image to SVG

svg = image\_to\_svg(img)



with open("output.svg", "w") as f:

&#x20;   f.write(svg)

```



The image dimensions are inferred automatically from the NumPy array shape.

You do not need to pass `width` or `height` to `image\_to\_svg()`.



\## 1. Loading an Image



\### Pillow



Pillow can load an image and convert it directly to RGBA before passing it to

Img2Num.



```python

from PIL import Image

import numpy as np



img = np.array(Image.open("input.png").convert("RGBA"))

```



The resulting array has the shape:



```text

(height, width, 4)

```



The four channels are red, green, blue, and alpha.



\### OpenCV



OpenCV loads images as BGR by default. Img2Num expects RGBA, so the image must

be converted before using it.



```python

import cv2



img = cv2.imread("input.png")

img = cv2.cvtColor(img, cv2.COLOR\_BGR2RGBA)

```



This conversion is important. Passing an RGB or BGR image directly to Img2Num

can produce incorrect results.



\## 2. Raster → SVG



`image\_to\_svg()` runs the complete raster-to-SVG conversion pipeline.



```python

from PIL import Image

import numpy as np

from img2num import image\_to\_svg



img = np.array(Image.open("input.png").convert("RGBA"))



svg = image\_to\_svg(img)



with open("output.svg", "w") as f:

&#x20;   f.write(svg)

```



You can also print the SVG directly:



```python

print(svg)

```



\## 3. Configuring the Conversion



Use `ImageToSvgConfig` to customize the conversion.



```python

from PIL import Image

import numpy as np

from img2num import image\_to\_svg, ImageToSvgConfig



img = np.array(Image.open("input.png").convert("RGBA"))



config = ImageToSvgConfig()

config.kmeans.k = 32

config.min\_cluster\_area = 50



svg = image\_to\_svg(img, config=config)



with open("output.svg", "w") as f:

&#x20;   f.write(svg)

```



The configuration allows you to change parameters used by the conversion

pipeline. For example, increasing `kmeans.k` can preserve more colors, while

`min\_cluster\_area` controls filtering of small clusters.



\## 4. Running the Pipeline Manually



Instead of using `image\_to\_svg()`, you can run the individual processing

stages yourself:



```text

RGBA image

&#x20;   ↓

bilateral\_filter

&#x20;   ↓

kmeans

&#x20;   ↓

labels\_to\_svg

&#x20;   ↓

SVG

```



This is useful when you want more control over the individual stages.



```python

import cv2

import img2num



img = cv2.imread("input.png")

img = cv2.cvtColor(img, cv2.COLOR\_BGR2RGBA)



img\_bf = img2num.bilateral\_filter(

&#x20;   img,

&#x20;   3,

&#x20;   50,

&#x20;   0,

)



img\_kmeans, labels = img2num.kmeans(

&#x20;   img\_bf,

&#x20;   64,

&#x20;   100,

&#x20;   0,

)



svg = img2num.labels\_to\_svg(

&#x20;   img,

&#x20;   labels,

&#x20;   100,

&#x20;   10,

)



with open("output.svg", "w") as f:

&#x20;   f.write(svg)

```



The three stages perform different parts of the conversion:



\- `bilateral\_filter()` applies edge-preserving smoothing.

\- `kmeans()` groups similar colors and produces a label map.

\- `labels\_to\_svg()` converts the label map into SVG paths.



\## 5. Common Mistakes



\### Passing RGB or BGR Data



Img2Num expects \*\*RGBA\*\* input.



With OpenCV, this is incorrect:



```python

img = cv2.imread("input.png")

svg = image\_to\_svg(img)

```



OpenCV returns BGR data by default. Convert it first:



```python

img = cv2.imread("input.png")

img = cv2.cvtColor(img, cv2.COLOR\_BGR2RGBA)



svg = image\_to\_svg(img)

```



With Pillow, use `convert("RGBA")`:



```python

img = np.array(Image.open("input.png").convert("RGBA"))

```



\### Passing Width and Height Manually



The Python API infers the image dimensions from the NumPy array.



Do not pass `width` and `height` to `image\_to\_svg()`:



```python

svg = image\_to\_svg(img, width=800, height=600)

```



Instead, simply pass the image:



```python

svg = image\_to\_svg(img)

```



\## Summary



For most applications, the recommended workflow is:



```python

from PIL import Image

import numpy as np

from img2num import image\_to\_svg



img = np.array(Image.open("input.png").convert("RGBA"))

svg = image\_to\_svg(img)



with open("output.svg", "w") as f:

&#x20;   f.write(svg)

```



Use `ImageToSvgConfig` when you need to customize the conversion, or use

`bilateral\_filter()`, `kmeans()`, and `labels\_to\_svg()` individually when you

need control over the processing pipeline.