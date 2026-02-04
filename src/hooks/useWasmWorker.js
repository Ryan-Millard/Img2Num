/*
 *IMPORTANT:
 *The args array to all convenience wrapper functions passed to call()
 *must match the order of the arguments defined in C++ exactly.
 *  e.g.,
 *  ```js
 *  args = [a, b];
 *  ```
 *  ```cpp
 *  int add(int a, int b);
 *  ```
 */

import { useEffect, useRef, useCallback } from "react";

export function useWasmWorker() {
  const workerRef = useRef();
  const idRef = useRef(0);
  const callbacks = useRef(new Map());

  // Once-off worker setup (WASM manager)
  useEffect(() => {
    workerRef.current = new Worker(new URL("@workers/wasmWorker.js", import.meta.url), {
      type: "module",
    });

    workerRef.current.onmessage = ({ data }) => {
      const { id, output, returnValue, error } = data;
      const cb = callbacks.current.get(id);
      if (!cb) return;

      if (error) cb.reject(error);
      else cb.resolve({ output, returnValue });

      callbacks.current.delete(id);
    };

    return () => workerRef.current.terminate();
  }, []);

  // Get worker to call a WASM function
  const call = useCallback(({ funcName, args = undefined, bufferKeys = undefined, returnType = "void" }) => {
    const id = idRef.current++;
    return new Promise((resolve, reject) => {
      callbacks.current.set(id, { resolve, reject });
      workerRef.current.postMessage({ id, funcName, args, bufferKeys, returnType });
    });
  }, []);

  // Convenience functions
  return {
    gaussianBlur: async ({ pixels, width, height, sigma_pixels = width * 0.005 }) => {
      const result = await call({
        funcName: "gaussian_blur_fft",
        args: { pixels, width, height, sigma_pixels },
        bufferKeys: [{ key: "pixels", type: "Uint8ClampedArray" }],
      });
      return result.output.pixels;
    },

    bilateralFilter: async ({ pixels, width, height, sigma_spatial = 3, sigma_range = 50, color_space = 0, n_threads = 8 }) => {
      const result = await call({
        funcName: "bilateral_filter",
        args: { pixels, width, height, sigma_spatial, sigma_range, color_space, n_threads },
        bufferKeys: [{ key: "pixels", type: "Uint8ClampedArray" }],
      });
      return result.output.pixels;
    },

    blackThreshold: async ({ pixels, width, height, num_colors }) => {
      const result = await call({
        funcName: "black_threshold_image",
        args: { pixels, width, height, num_colors },
        bufferKeys: [{ key: "pixels", type: "Uint8ClampedArray" }],
      });
      return result.output.pixels;
    },

    kmeans: async ({
      pixels,
      out_pixels = new Uint8ClampedArray(pixels.length),
      out_labels = new Int32Array(pixels.length / 4),
      width,
      height,
      num_colors,
      max_iter = 100,
      color_space = 0,
      n_threads = 8,
    }) => {
      const result = await call({
        funcName: "kmeans",
        args: { pixels, out_pixels, out_labels, width, height, num_colors, max_iter, color_space, n_threads },
        bufferKeys: [
          { key: "pixels", type: "Uint8ClampedArray" },
          { key: "out_pixels", type: "Uint8ClampedArray" },
          { key: "out_labels", type: "Int32Array" },
        ],
      });
      return { pixels: result.output.out_pixels, labels: result.output.out_labels };
    },

    findContours: async ({ pixels, labels, width, height, min_area = 100, draw_contour_borders = false }) => {
      const result = await call({
        funcName: "kmeans_clustering_graph",
        args: { pixels, labels, width, height, min_area, draw_contour_borders },
        bufferKeys: [
          { key: "pixels", type: "Uint8ClampedArray" },
          { key: "labels", type: "Int32Array" },
        ],
        returnType: "string",
      });
      return { svg: result.returnValue, visualization: result.output.pixels };
    },

    testSvg: async () => {
      const result = await call({
        funcName: "test_svg",
        returnType: "string",
      });
      return result.returnValue;
    },
  };
}
