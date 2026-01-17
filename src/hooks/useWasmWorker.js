import { useEffect, useRef, useCallback } from 'react';

// React hook for interacting with the wasmWorker (a web worker)
export function useWasmWorker() {
  const workerRef = useRef(); // Current web worker instance
  const idRef = useRef(0); // Unique ID counter for async responses (see call below)
  const callbacks = useRef(new Map()); // Maps IDs to resolve/reject handlers

  // initialize once
  useEffect(() => {
    workerRef.current = new Worker(new URL('@workers/wasmWorker.js', import.meta.url), { type: 'module' });

    // Listen to messages from web worker
    workerRef.current.onmessage = ({ data }) => {
      const { id, error, output, returnValue } = data;
      const cb = callbacks.current.get(id);
      if (!cb) return;
      // Handle promise based on ID
      error ? cb.reject(error) : cb.resolve({ output, returnValue });
      callbacks.current.delete(id);
    };

    return () => workerRef.current.terminate();
  }, []);

  // Send a task to the worker
  const call = useCallback((funcName, args = {}, bufferKeys = []) => {
    const id = idRef.current++;

    return new Promise((resolve, reject) => {
      callbacks.current.set(id, { resolve, reject });
      workerRef.current.postMessage({ id, funcName, args, bufferKeys });
    });
  }, []);
  
  const gaussianBlur = async ({ pixels, width, height, sigma_pixels = width * 0.005 }) => {
    return (await call('gaussian_blur_fft', { pixels, width, height, sigma_pixels }, ['pixels'])).output.pixels;
  };
  const bilateralFilter = async ({
    pixels,
    width,
    height,
    sigma_spatial = 3.0,
    sigma_range = 50.0,
    color_space = 0,
  }) => {
    return (
      await call('bilateral_filter', { pixels, width, height, sigma_spatial, sigma_range, color_space }, ['pixels'])
    ).output.pixels;
  };

  const bilateralFilterGpu = async ({
    pixels,
    width,
    height,
    sigma_spatial = 3.0,
    sigma_range = 50.0,
    color_space = 1, // rgb onlu for now
  }) => {
    return (
      await call('bilateral_filter_gpu', { pixels, width, height, sigma_spatial, sigma_range, color_space }, ['pixels'])
    ).output.pixels;
  };

  const blackThreshold = async ({ pixels, width, height, num_colors }) => {
    return (await call('black_threshold_image', { pixels, width, height, num_colors }, ['pixels'])).output.pixels;
  };
  const kmeans = async ({
    pixels,
    out_pixels = new Uint8ClampedArray(pixels.length),
    width,
    height,
    out_labels = new Int32Array(width * height),
    num_colors,
    max_iter = 100,
  }) => {
    const result = (await call(
      'kmeans',
      { pixels, out_pixels, out_labels, width, height, num_colors, max_iter },
      ['pixels', 'out_pixels', 'out_labels']
    )).output;
    return {
      pixels: result.out_pixels,
      labels: result.out_labels,
    };
  };
  const mergeSmallRegionsInPlace = async ({ pixels, width, height, minArea, minWidth, minHeight }) => {
    return (await call('mergeSmallRegionsInPlace', { pixels, width, height, minArea, minWidth, minHeight }, ['pixels']))
      .output.pixels;
  };
  const findContours = async ({
    pixels,
    labels,
    width,
    height,
    min_area = 10,
  }) => {
    return (
      await call(
        'kmeans_clustering_graph',
        { pixels, labels, width, height, min_area },
        ['pixels', 'labels'])
    ).output.pixels;
  }

  return { call, gaussianBlur, bilateralFilter, bilateralFilterGpu, blackThreshold, kmeans, mergeSmallRegionsInPlace, findContours };
}
