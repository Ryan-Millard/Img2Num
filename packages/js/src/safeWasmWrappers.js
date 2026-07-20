/**
 * @packageDocumentation
 * High-level image operations exposed via WASM.
 *
 * The exports defined here abstract away the manual memory management required
 * when importing raw WASM functions, making them more JavaScript-friendly.
 *
 * @file Safely wraps unsafe WASM (C++) function calls.
 *
 * @module image-wasm
 * @license MIT
 * @copyright Ryan Millard 2026
 * @author Ryan Millard
 * @since 0.0.0
 * @description This module provides high-level image processing functions using WASM.
 *              Each function handles memory management and exposes a JavaScript-friendly API.
 */

import { callWasm } from "./wasmClient.js";

/**
 * @summary Apply a Gaussian blur to an image using FFT in WASM.
 *
 * @description
 * Takes a Uint8ClampedArray and its dimensions and applies a Gaussian blur on the Uint8ClampedArray image.
 * The `sigma_pixels` parameter determines the blur radius and has a dynamic default value equal to 5% of the image's width.
 * Useful for denoising images by applying a low-pass filter. Sped up by a 2-D FFT.
 *
 * @async
 * @function gaussianBlur
 * @param {Object} options - The input options.
 * @param {Uint8ClampedArray} options.pixels - The image pixel data (flat RGBA array).
 * @param {number} options.width - The width of the image.
 * @param {number} options.height - The height of the image.
 * @param {number} [options.sigma_pixels=width*0.005] - Standard deviation of the Gaussian blur (default=width*0.005; 5% of width).
 * @returns {Promise<Uint8ClampedArray>} The blurred image pixels.
 * @throws {Error} If the WASM function fails or memory allocation fails.
 * @example
 * const blurred = await gaussianBlur({ pixels, width, height });
 * @todo Fix FFT zero-padding bug around edges of the image.
 * @variation Standard Gaussian blur using FFT
 * @since 0.0.0
 */
export const gaussianBlur = async ({ pixels, width, height, sigma_pixels = width * 0.005 }) => {
  const result = await callWasm({
    funcName: "gaussian_blur_fft",
    args: { pixels, width, height, sigma_pixels },
    bufferKeys: [{ key: "pixels", type: "Uint8ClampedArray" }],
  });
  return result.output.pixels;
};

/**
 * @summary Apply a bilateral filter to an image using WASM.
 *
 * @description
 * Takes a Uint8ClampedArray and its dimensions and applies a bilateral filter on the Uint8ClampedArray image.
 * The `sigma_spatial` and `sigma_range` set weights to the respective Gaussian kernels applied to spatial (x, y) and range (color) data -
 * they both have recommended default values applied.
 * The default `color_space` is 0, which is CIE LAB, but sRGB can be chosen by setting `color_space` = 1. CIE LAB is more
 * accurate, but sRGB is slightly faster.
 *
 * @async
 * @function bilateralFilter
 * @param {Object} options - The input options.
 * @param {Uint8ClampedArray} options.pixels - The image pixel data (flat RGBA array).
 * @param {number} options.width - The width of the image.
 * @param {number} options.height - The height of the image.
 * @param {number} [options.sigma_spatial=3] - Spatial standard deviation.
 * @param {number} [options.sigma_range=50] - Range (color) standard deviation.
 * @param {number} [options.color_space=0] - Color space mode (0: CIE LAB; 1: sRGB).
 * @returns {Promise<Uint8ClampedArray>} The filtered image pixels.
 * @throws {Error} If the WASM function fails.
 * @example
 * const filtered = await bilateralFilter({ pixels, width, height });
 * @variation Standard bilateral filter with default parameters
 * @since 0.0.0
 */
export const bilateralFilter = async ({ pixels, width, height, sigma_spatial = 3, sigma_range = 50, color_space = 0 }) => {
  const result = await callWasm({
    funcName: "bilateral_filter",
    args: { pixels, width, height, sigma_spatial, sigma_range, color_space },
    bufferKeys: [{ key: "pixels", type: "Uint8ClampedArray" }],
  });
  return result.output.pixels;
};

/**
 * @summary Apply a black-biased threshold filter to reduce colors in an image.
 *
 * @description
 * Apply a simple sRGB bin-based threshold on the Uint8ClampedArray image.
 * The bins in this function are determined by the `num_colors` parameter.
 *
 * @async
 * @function blackThreshold
 * @param {Object} options - The input options.
 * @param {Uint8ClampedArray} options.pixels - The image pixel data (flat RGBA array).
 * @param {number} options.width - The width of the image.
 * @param {number} options.height - The height of the image.
 * @param {number} options.num_colors - Number of colors to reduce the image to.
 * @returns {Promise<Uint8ClampedArray>} The thresholded image pixels.
 * @throws {Error} If the WASM function fails.
 * @example
 * const thresholded = await blackThreshold({ pixels, width, height, num_colors: 16 });
 * @see {@link https://en.wikipedia.org/wiki/Color_quantization|Color Quantization Wiki}
 * @todo Support different bias levels for black/white thresholds.
 * @variation Black-biased threshold with customizable number of colors
 * @since 0.0.0
 */
export const blackThreshold = async ({ pixels, width, height, num_colors }) => {
  const result = await callWasm({
    funcName: "black_threshold_image",
    args: { pixels, width, height, num_colors },
    bufferKeys: [{ key: "pixels", type: "Uint8ClampedArray" }],
  });
  return result.output.pixels;
};

/**
 * @summary Cluster pixels using the K-Means algorithm in WASM.
 *
 * @description
 * Apply a standard K-Means clustering algorithm to the input image in the specified `color_space`
 * (default is 0: CIE LAB, but 1: sRGB can be use) using pre-specified maximum color and iteration counts.
 * You can provide the `out_pixels` and `out_labels` arrays,
 * however this is atypical in JavaScript (since it is modified in-place and you will need to allocate a sufficiently large array),
 * so it is recommended to use the default arguments and returns.
 *
 * @async
 * @function kmeans
 * @param {Object} options - The input options.
 * @param {Uint8ClampedArray} options.pixels - Original image pixels.
 * @param {Uint8ClampedArray} [options.out_pixels=new Uint8ClampedArray(pixels.length)] - Output pixels array.
 * @param {Int32Array} [options.out_labels=new Int32Array(pixels.length/4)] - Output labels array.
 * @param {number} options.width - Image width.
 * @param {number} options.height - Image height.
 * @param {number} options.num_colors - Number of color clusters.
 * @param {number} [options.max_iter=100] - Maximum number of iterations.
 * @param {number} [options.color_space=0] - Color space mode.
 * @returns {Promise<{pixels: Uint8ClampedArray, labels: Int32Array}>} Clustered pixels and labels.
 * @throws {Error} If the WASM function fails or iterations do not converge.
 * @example
 * const { pixels: clusteredPixels, labels } = await kmeans({ pixels, width, height, num_colors: 8 });
 * @variation K-means clustering with default color space
 * @since 0.0.0
 */
export const kmeans = async ({
  pixels,
  out_pixels = new Uint8ClampedArray(pixels.length),
  out_labels = new Int32Array(pixels.length / 4),
  width,
  height,
  num_colors,
  max_iter = 100,
  color_space = 0,
}) => {
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

/**
 * @summary Convert labeled regions to SVG contours.
 *
 * @description
 * Convert an input image and its labeled regions into an SVG.
 *
 * @async
 * @function findContours
 * @param {Object} options - The input options.
 * @param {Uint8ClampedArray} options.pixels - Original image pixels.
 * @param {Int32Array} options.labels - Label array from clustering (e.g., K-Means) or segmentation.
 * @param {number} options.width - Image width.
 * @param {number} options.height - Image height.
 * @param {number} [options.min_area=100] - Minimum area of a region to be considered a contour.
 * @param {number} [options.min_thickness=10] - Minimum thickness of a region to be considered a contour.
 * @returns {Promise<{svg: string}>} Generated SVG.
 * @throws {Error} If the WASM function fails or input labels are invalid.
 * @example
 * const { svg } = await findContours({ pixels, labels, width, height });
 * @variation Converts labeled (from a clustering algorithm, e.g. K-Means) image into an SVG.
 * @since 0.0.0
 */
export const findContours = async ({ pixels, labels, width, height, min_area = 100, min_thickness = 10 }) => {
  const result = await callWasm({
    funcName: "labels_to_svg",
    args: { pixels, labels, width, height, min_area, min_thickness },
    bufferKeys: [
      { key: "pixels", type: "Uint8ClampedArray" },
      { key: "labels", type: "Int32Array" },
    ],
    returnType: "string",
  });
  return { svg: result.returnValue };
};

/**
 * @summary Convert raster images (e.g., JPEG, PNG) to SVGs.
 *
 * @description
 * Convert an input raster image into an SVG. A unification of `bilateralFilter`, `kmeans`, and `findContours`.
 *
 * @async
 * @function imageToSvg
 * @param {Object} options - The input options.
 * @param {Uint8ClampedArray} options.pixels - Original image pixels.
 * @param {number} options.width - Image width.
 * @param {number} options.height - Image height.
 * @param {number} [options.sigma_spatial=3] - Spatial standard deviation.
 * @param {number} [options.sigma_range=50] - Range (color) standard deviation.
 * @param {number} [options.num_colors=16] - Number of color clusters.
 * @param {number} [options.max_iter=100] - Maximum number of iterations.
 * @param {number} [options.min_area=100] - Minimum area of a region to be considered a contour.
 * @param {number} [options.min_thickness=10] - Minimum thickness of a region to be considered a contour.
 * @param {number} [options.color_space=0] - Color space mode.
 * @returns {Promise<{svg: string}>} Generated SVG.
 * @throws {Error} If the WASM function fails or input labels are invalid.
 * @example
 * const { svg } = await findContours({ pixels, labels, width, height });
 * @variation Convert a raster image (e.g., PNG, JPG) into an SVG.
 * @since 0.0.0
 */
export const imageToSvg = async ({ pixels, width, height, sigma_spatial = 3, sigma_range = 50, num_colors = 16, max_iter = 100, min_area = 100, min_thickness = 10, color_space = 0 }) => {
  const result = await callWasm({
    funcName: "image_to_svg",
    args: { pixels, width, height, sigma_spatial, sigma_range, num_colors, max_iter, min_area, min_thickness, color_space },
    bufferKeys: [{ key: "pixels", type: "Uint8ClampedArray" }],
    returnType: "string",
  });
  return { svg: result.returnValue };
};
