import numpy as np
import cv2

import sys
sys.path.append("../../build-c-cpp/bindings/python/")
import img2num

img = cv2.imread("../../IMG_5554.jpg")
img = cv2.cvtColor(img, cv2.COLOR_BGR2RGBA) # VERY IMPORTANT!!!

# bilateral filter in-place
img2num.bilateral_filter(img, img.shape[1], img.shape[0], 3, 50, 0)

# kmeans
im, labels = img2num.kmeans(img, img.shape[1], img.shape[0], 16, 100, 0)

# 