import argparse
import img2num
import numpy as np
import os
from PIL import Image

def main():
    # Capture standard CLI arguments if not using a library
    parser = argparse.ArgumentParser(description="Convert an image with Img2Num")
    parser.add_argument("image_path", help="path to the input image")
    parser.add_argument("--output", "-o", default="./result.svg")
    # color space option
    parser.add_argument("--color-space", "-c", default=0, type=int, 
                        help="0 indicates CIELAB, 1 indicates RGB color space")
    # bilateral filter options
    parser.add_argument("--sigma-range", "-sr", default=50.0, type=float,
                        help="bilateral filter sigma range (color)")
    parser.add_argument("--sigma-spatial", "-ss", default=3.0, type=float,
                            help="bilateral filter sigma spatial")
    # kmeans options
    parser.add_argument("--k", default=16, type=int,
                        help="number of unique colors")
    parser.add_argument("--max-iter", default=100, type=int,
                            help="number of kmeans iterations")
    # cluster options
    parser.add_argument("--min-cluster-area", "-area", default=100, type=int,
                            help="smallest cluster area")
    parser.add_argument("--min-thickness", "-thick", default=10, type=int,
                            help="smallest cluster thickness")
    args = parser.parse_args()

    img = np.asarray(Image.open(args.image_path).convert("RGBA"))

    cfg = img2num.ImageToSvgConfig(
        bilateral_filter={
            "sigma_range": args.sigma_range, 
            "sigma_spatial": args.sigma_spatial
        },
        kmeans={"k": args.k, "max_iter": args.max_iter},
        color_space=args.color_space,
        min_cluster_area=args.min_cluster_area,
        min_thickness=args.min_thickness,
    )
    
    res_svg = img2num.image_to_svg(img, config=cfg)
    with open(os.path.join(args.output), "w") as f:
        f.write(res_svg)

if __name__ == "__main__":
    main()