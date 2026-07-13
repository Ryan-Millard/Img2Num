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

  # res_svg2 should match res_svg
  cfg = img2num.ImageToSvgConfig(synthetic=1)
  print(cfg)

  res_svg2 = img2num.image_to_svg(img, config=cfg)
  with open(os.path.join(OUTDIR, "result.svg"),"w") as f:
      f.writelines(res_svg2)

if __name__ == "__main__":
    main()
