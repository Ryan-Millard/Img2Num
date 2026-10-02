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
/** @typedef {0 | 1} ColorSpace 0 = CIE LAB, 1 = sRGB */

/**
 * @typedef {Object} ImageInput
 * @property {Uint8ClampedArray} pixels Flat RGBA pixel data.
 * @property {number} width Image width.
 * @property {number} height Image height.
 */

/**
 * @typedef {ImageInput & {
 *   sigma_pixels?: number
 * }} GaussianBlurOptions
 */

/**
 * @typedef {ImageInput & {
 *   sigma_spatial?: number,
 *   sigma_range?: number,
 *   color_space?: ColorSpace
 * }} BilateralFilterOptions
 */

/** @typedef {ImageInput & { num_colors: number }} BlackThresholdOptions */

/**
 * @typedef {ImageInput & {
 *   num_colors: number,
 *   out_pixels?: Uint8ClampedArray,
 *   out_labels?: Int32Array,
 *   max_iter?: number,
 *   color_space?: ColorSpace
 * }} KMeansOptions
 */

/** @typedef {{ pixels: Uint8ClampedArray, labels: Int32Array }} KMeansResult */

/**
 * @typedef {ImageInput & {
 *   labels: Int32Array,
 *   min_area?: number,
 *   min_thickness?: number
 * }} FindContoursOptions
 */

/**
 * @typedef {ImageInput & {
 *   sigma_spatial?: number,
 *   sigma_range?: number,
 *   num_colors?: number,
 *   max_iter?: number,
 *   min_area?: number,
 *   min_thickness?: number,
 *   color_space?: ColorSpace
 * }} ImageToSvgOptions
 */

/** @typedef {{ svg: string }} SvgResult */

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
 * @param {GaussianBlurOptions} options - The input options.
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
 * @param {BilateralFilterOptions} options - The input options.
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
 * @param {BlackThresholdOptions} options - The input options.
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
 * @param {KMeansOptions} options - The input options.
 * @returns {Promise<KMeansResult>} Clustered pixels and labels.
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
 * @param {FindContoursOptions} options - The input options.
 * @returns {Promise<SvgResult>} Generated SVG.
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
 * @param {ImageToSvgOptions} options - The input options.
 * @returns {Promise<SvgResult>} Generated SVG.
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
