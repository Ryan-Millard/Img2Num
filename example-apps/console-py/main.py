"""
Note: Images sent to img2num functions must be RGBA
"""

import argparse
import os
from concurrent.futures import ThreadPoolExecutor

import img2num
import numpy as np
from PIL import Image

def step_by_step(img):
    """Convert the image in stages, retaining the intermediate images."""
    img_bf = img2num.bilateral_filter(img, 3, 50, 0)
    img_kmeans, labels = img2num.kmeans(img_bf, 64, 100, 0)
    res_svg = img2num.labels_to_svg(img, labels, 100, 10)
    return res_svg, img_bf, img_kmeans


def combined_process(img, cfg):
    """Convert the image using the combined pipeline."""
    return img2num.image_to_svg(img, config=cfg)


def main():
    parser = argparse.ArgumentParser(description="Convert an image with Img2Num")
    parser.add_argument("image_path", help="path to the input image")
    args = parser.parse_args()

    OUTDIR = "console-py_outputs"
    os.makedirs(OUTDIR, exist_ok=True)

    # =============================================================================
    # WARNING: RGBA is the only format Img2Num supports.
    # DO NOT PASS RGB or any other format.
    # =============================================================================
    img = Image.open(args.image_path).convert("RGBA")
    if img is None:
        parser.error(f"could not read image: {args.image_path}")

    img = np.asarray(img)
    cfg = img2num.ImageToSvgConfig(kmeans={"k": 64}, min_thickness=10)
    print(cfg)

    # Python workers can run while the GIL is released; native calls stay serialized.
    # Both workers only read the shared input image and configuration.
    with ThreadPoolExecutor(max_workers=2) as executor:
        step_by_step_future = executor.submit(step_by_step, img)
        combined_future = executor.submit(combined_process, img, cfg)

        res_svg, img_bf, img_kmeans = step_by_step_future.result()
        res_svg2 = combined_future.result()

    # bilateral filter
    Image.fromarray(img_bf).save(
        os.path.join(OUTDIR, "bilateral_image.png"),
    )

    # kmeans
    Image.fromarray(img_kmeans).save(
        os.path.join(OUTDIR, "kmeans_image.png"),
    )

    # svg file
    with open(os.path.join(OUTDIR, "result.svg"), "w", encoding="utf-8") as f:
        f.write(res_svg)

    # K-means uses random initialization, so the two SVGs may differ.
    with open(os.path.join(OUTDIR, "result2.svg"), "w", encoding="utf-8") as f:
        f.write(res_svg2)


if __name__ == "__main__":
    main()
