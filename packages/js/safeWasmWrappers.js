import { initWasmWorker, callWasm } from "./wasmClient.js";

// Ensure worker is ready as soon as this module is imported
initWasmWorker();

export const gaussianBlur = async ({ pixels, width, height, sigma_pixels = width * 0.005 }) => {
  const result = await callWasm({
    funcName: "gaussian_blur_fft",
    args: { pixels, width, height, sigma_pixels },
    bufferKeys: [{ key: "pixels", type: "Uint8ClampedArray" }],
  });
  return result.output.pixels;
};

export const bilateralFilter = async ({ pixels, width, height, sigma_spatial = 3, sigma_range = 50, color_space = 0 }) => {
  const result = await callWasm({
    funcName: "bilateral_filter",
    args: { pixels, width, height, sigma_spatial, sigma_range, color_space },
    bufferKeys: [{ key: "pixels", type: "Uint8ClampedArray" }],
  });
  return result.output.pixels;
};

export const blackThreshold = async ({ pixels, width, height, num_colors }) => {
  const result = await callWasm({
    funcName: "black_threshold_image",
    args: { pixels, width, height, num_colors },
    bufferKeys: [{ key: "pixels", type: "Uint8ClampedArray" }],
  });
  return result.output.pixels;
};

export const kmeans = async ({ pixels, out_pixels = new Uint8ClampedArray(pixels.length), out_labels = new Int32Array(pixels.length / 4), width, height, num_colors, max_iter = 100, color_space = 0 }) => {
  const result = await callWasm({
    funcName: "kmeans",
    args: { pixels, out_pixels, out_labels, width, height, num_colors, max_iter, color_space },
    bufferKeys: [
      { key: "pixels", type: "Uint8ClampedArray" },
      { key: "out_pixels", type: "Uint8ClampedArray" },
      { key: "out_labels", type: "Int32Array" },
    ],
  });
  return { pixels: result.output.out_pixels, labels: result.output.out_labels };
};

export const findContours = async ({ pixels, labels, width, height, min_area = 100, draw_contour_borders = false }) => {
  const result = await callWasm({
    funcName: "labels_to_svg",
    args: { pixels, labels, width, height, min_area, draw_contour_borders },
    bufferKeys: [
      { key: "pixels", type: "Uint8ClampedArray" },
      { key: "labels", type: "Int32Array" },
    ],
    returnType: "string",
  });
  return { svg: result.returnValue, visualization: result.output.pixels };
};
