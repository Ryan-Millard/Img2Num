import { initWasmWorker, callWasm } from "./wasmClient.js";

// Ensure worker is ready as soon as this module is imported
initWasmWorker();

export async function gaussianBlur({
  pixels,
  width,
  height,
  sigma_pixels = width * 0.005,
}) {
  return (
    await callWasm(
      "gaussian_blur_fft",
      { pixels, width, height, sigma_pixels },
      ["pixels"]
    )
  ).output.pixels;
}

export async function bilateralFilter({
  pixels,
  width,
  height,
  sigma_spatial = 3.0,
  sigma_range = 50.0,
  color_space = 0,
  n_threads = 8,
}) {
  return (
    await callWasm(
      "bilateral_filter",
      {
        pixels,
        width,
        height,
        sigma_spatial,
        sigma_range,
        color_space,
        n_threads,
      },
      ["pixels"]
    )
  ).output.pixels;
}

export async function blackThreshold({
  pixels,
  width,
  height,
  num_colors,
}) {
  return (
    await callWasm(
      "black_threshold_image",
      { pixels, width, height, num_colors },
      ["pixels"]
    )
  ).output.pixels;
}

export async function kmeans({
  pixels,
  out_pixels = new Uint8ClampedArray(pixels.length),
  width,
  height,
  out_labels = new Int32Array(width * height),
  num_colors,
  max_iter = 100,
  color_space = 0,
  n_threads = 8,
}) {
  const result = (
    await callWasm(
      "kmeans",
      {
        pixels,
        out_pixels,
        out_labels,
        width,
        height,
        num_colors,
        max_iter,
        color_space,
        n_threads,
      },
      ["pixels", "out_pixels", "out_labels"]
    )
  ).output;

  return {
    pixels: result.out_pixels,
    labels: result.out_labels,
  };
}

export async function findContours({
  pixels,
  labels,
  width,
  height,
  min_area = 100,
  draw_contour_borders = false,
}) {
  return (
    await callWasm(
      "kmeans_clustering_graph",
      {
        pixels,
        labels,
        width,
        height,
        min_area,
        draw_contour_borders,
      },
      ["pixels", "labels"]
    )
  ).output.pixels;
}
