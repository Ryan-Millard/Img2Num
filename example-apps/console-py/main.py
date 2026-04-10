import numpy as np
import cv2
import os

import sys
sys.path.append("../../build-c-cpp/bindings/python/")
import img2num

"""
Note: Images sent to img2num functions must be RGBA
"""
OUTDIR = "outputs"
os.makedirs(OUTDIR, exist_ok=True)

img = cv2.imread("../../IMG_5554.jpg")
img = cv2.cvtColor(img, cv2.COLOR_BGR2RGBA) # VERY IMPORTANT!!!

height, width = img.shape[:2]

# bilateral filter in-place
img2num.bilateral_filter(img, width, height, 3, 50, 0)
cv2.imwrite(os.path.join(OUTDIR, "bilateral_image.png"), cv2.cvtColor(img, cv2.COLOR_RGBA2BGR))

# kmeans
img_kmeans, labels = img2num.kmeans(img, width, height, 16, 100, 1)
cv2.imwrite(os.path.join(OUTDIR, "kmeans_image.png"), cv2.cvtColor(img_kmeans, cv2.COLOR_RGBA2BGR))
# svg file
res_svg = img2num.labels_to_svg(img, labels, width, height, 100)
with open(os.path.join(OUTDIR, "result.svg"),"w") as f:
    f.writelines(res_svg)
