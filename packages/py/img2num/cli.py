import argparse
import img2num
import numpy as np
import os
import os.path as pth
from PIL import Image

def find_image_files(start_directory):
    # Tuple of target image extensions (must be lowercase)
    image_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp')
    image_paths = []

    # os.walk yields a 3-tuple: (current_folder_path, subdirectories, filenames)
    for root, dirs, files in os.walk(start_directory):
        for file in files:
            # Lowercase the filename to catch extensions like .PNG or .JPG
            if file.lower().endswith(image_extensions):
                # Construct the full absolute or relative path to the image
                full_path = os.path.join(root, file)
                image_paths.append(full_path)
                
    return image_paths

def is_folder(path):
    return (
        pth.isdir(path) 
        or str(path).endswith(('/', '\\')) 
        or pth.splitext(path)[1] == ""
    )

def process_one(input_path, output_path, cfg):
    img = np.asarray(Image.open(input_path).convert("RGBA"))
    res_svg = img2num.image_to_svg(img, config=cfg)
    with open(output_path, "w") as f:
        f.write(res_svg)
    
def main():
    # Capture standard CLI arguments if not using a library
    parser = argparse.ArgumentParser(description="Convert an image with Img2Num")
    parser.add_argument("image_path", help="path to the input image")
    parser.add_argument("--output", "-o", default="./result.svg", type=pth.abspath)
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
    # other options
    parser.add_argument("--overwrite", action="store_true", help="Allow overwriting exists svg")
    args = parser.parse_args()

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

    # check arguments
    if pth.isdir(args.image_path):
        if not is_folder(args.output):
            print("Input is a folder so output must also be a folder")
            exit()
        
        if not pth.exists(args.output):
            print(f"Creating {args.output}")
            os.makedirs(args.output, exist_ok=True)
        
        image_paths = find_image_files(args.image_path)
        for image_path in image_paths:
            filename, _ = pth.splitext(pth.basename(image_path))
            output_path = pth.join(args.output, f"{filename}.svg")
            if pth.exists(output_path) and (not args.overwrite):
                print(f"{output_path} already exists. Skipping...")
                continue

            process_one(image_path, output_path, cfg)
            print(f"Generated {output_path}")
    else:
        if is_folder(args.output):
            print("Input is a file so output must also be a file")
            exit()
        
        if pth.exists(args.output) and (not args.overwrite):
            print(f"{args.output} already exists. Skipping...")
        else:   
            process_one(args.image_path, args.output, cfg)
            print(f"Generated {args.output}")

if __name__ == "__main__":
    main()