import { gaussianBlur, kmeans } from "img2num";

declare const pixels: Uint8ClampedArray;

export const blurred: Promise<Uint8ClampedArray> = gaussianBlur({ pixels, width: 1, height: 1 });
export const clustered: Promise<{ pixels: Uint8ClampedArray; labels: Int32Array }> = kmeans({
  pixels,
  width: 1,
  height: 1,
  num_colors: 8,
});

// @ts-expect-error num_colors is required
kmeans({ pixels, width: 1, height: 1 });
