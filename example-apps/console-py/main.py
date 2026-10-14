import argparse
import os
import img2num
import numpy as np
from PIL import Image

"""
Note: Images sent to img2num functions must be RGBA
"""


def main():
    parser = argparse.ArgumentParser(description="Convert an image with Img2Num")
    parser.add_argument("image_path", help="path to the input image")
    args = parser.parse_args()

    OUTDIR = "console-py_outputs"
    os.makedirs(OUTDIR, exist_ok=True)

    img = Image.open(args.image_path).convert("RGBA")
    if img is None:
        parser.error(f"could not read image: {args.image_path}")

    img = np.asarray(img)
    # bilateral filter in-place
    img_bf = img2num.bilateral_filter(img, 3, 50, 0)
    Image.fromarray(img_bf).convert("RGB").save(
        os.path.join(OUTDIR, "bilateral_image.png"),
    )

    # kmeans
    img_kmeans, labels = img2num.kmeans(img_bf, 64, 100, 0)
    Image.fromarray(img_kmeans).convert("RGB").save(
        os.path.join(OUTDIR, "kmeans_image.png"),
    )

    # svg file
    res_svg = img2num.labels_to_svg(img, labels, 100, 10)
    with open(os.path.join(OUTDIR, "result.svg"), "w") as f:
        f.write(res_svg)

    # res_svg2 should match res_svg
    cfg = img2num.ImageToSvgConfig(kmeans={"k": 64}, min_thickness=10)
    print(cfg)

    res_svg2 = img2num.image_to_svg(img, config=cfg)
    with open(os.path.join(OUTDIR, "result2.svg"), "w") as f:
        f.write(res_svg2)


if __name__ == "__main__":
    main()
