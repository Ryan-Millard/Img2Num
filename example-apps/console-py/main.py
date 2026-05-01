import os
import sys

import img2num

# if not preset install these with
# python3 -m pip install -r requirements.txt --break-system-packages
import numpy as np
import cv2

"""
Note: Images sent to img2num functions must be RGBA
"""
def main():
  OUTDIR = "console-py_outputs"
  os.makedirs(OUTDIR, exist_ok=True)

  img = cv2.imread(sys.argv[1])
  img = cv2.cvtColor(img, cv2.COLOR_BGR2RGBA) # VERY IMPORTANT!!!

# bilateral filter in-place
  img_bf = img2num.bilateral_filter(img, 3, 50, 0)
  cv2.imwrite(os.path.join(OUTDIR, "bilateral_image.png"), cv2.cvtColor(img_bf, cv2.COLOR_RGBA2BGR))

# kmeans
  img_kmeans, labels = img2num.kmeans(img_bf, 16, 100, 0)
  cv2.imwrite(os.path.join(OUTDIR, "kmeans_image.png"), cv2.cvtColor(img_kmeans, cv2.COLOR_RGBA2BGR))
# svg file
  res_svg = img2num.labels_to_svg(img, labels, 100)
  with open(os.path.join(OUTDIR, "result.svg"),"w") as f:
      f.writelines(res_svg)

  # res_svg2 should match res_svg
  cfg = img2num.ImageToSvgConfig(km = {"k": 32})
  print(cfg)

  # cfg.bilateral_filter.sigma_spatial = 3
  # cfg.bilateral_filter.sigma_range = 50
  # cfg.kmeans.k = 16
  # cfg.kmeans.max_iter = 100
  # cfg.min_cluster_size = 100
  # cfg.color_space = 0

  res_svg2 = img2num.image_to_svg(img, cfg)
  with open(os.path.join(OUTDIR, "result2.svg"),"w") as f:
      f.writelines(res_svg2)

if __name__ == "__main__":
    main()
