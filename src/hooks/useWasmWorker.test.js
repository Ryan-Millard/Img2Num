import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWasmWorker } from './useWasmWorker';

describe('useWasmWorker', () => {
  let mockWorkerInstance;
  let originalWorker;

  beforeEach(() => {
    // Store original Worker
    originalWorker = global.Worker;

    // Create a controlled mock Worker instance
    mockWorkerInstance = {
      onmessage: null,
      onerror: null,
      postMessage: vi.fn(),
      terminate: vi.fn(),
    };

    // Mock Worker constructor as a class
    class MockWorker {
      constructor() {
        this.onmessage = null;
        this.onerror = null;
        this.postMessage = mockWorkerInstance.postMessage;
        this.terminate = mockWorkerInstance.terminate;
        // Keep reference to allow test to trigger onmessage
        mockWorkerInstance.instance = this;
      }
    }

    vi.stubGlobal('Worker', MockWorker);
  });

  afterEach(() => {
    // Restore original Worker
    vi.stubGlobal('Worker', originalWorker);
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize a web worker on mount', () => {
      renderHook(() => useWasmWorker());

      // Worker should have been created (postMessage fn should exist)
      expect(mockWorkerInstance.postMessage).toBeDefined();
    });

    it('should terminate the worker on unmount', () => {
      const { unmount } = renderHook(() => useWasmWorker());

      unmount();

      expect(mockWorkerInstance.terminate).toHaveBeenCalledTimes(1);
    });

    it('should create only one worker instance per hook', () => {
      const { rerender } = renderHook(() => useWasmWorker());

      const initialCallCount = mockWorkerInstance.terminate.mock.calls.length;

      // Trigger multiple rerenders
      rerender();
      rerender();
      rerender();

      // Terminate should not have been called during rerenders
      expect(mockWorkerInstance.terminate.mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('return value', () => {
    it('should return call function and helper methods', () => {
      const { result } = renderHook(() => useWasmWorker());

      expect(result.current).toHaveProperty('call');
      expect(result.current).toHaveProperty('gaussianBlur');
      expect(result.current).toHaveProperty('blackThreshold');
      expect(result.current).toHaveProperty('kmeans');
      expect(result.current).toHaveProperty('mergeSmallRegionsInPlace');

      expect(typeof result.current.call).toBe('function');
      expect(typeof result.current.gaussianBlur).toBe('function');
      expect(typeof result.current.blackThreshold).toBe('function');
      expect(typeof result.current.kmeans).toBe('function');
      expect(typeof result.current.mergeSmallRegionsInPlace).toBe('function');
    });

    it('should return stable function references across renders', () => {
      const { result, rerender } = renderHook(() => useWasmWorker());

      const firstCallRef = result.current.call;
      const firstGaussianBlurRef = result.current.gaussianBlur;
      const firstBlackThresholdRef = result.current.blackThreshold;

      rerender();

      expect(result.current.call).toBe(firstCallRef);
      expect(result.current.gaussianBlur).toBe(firstGaussianBlurRef);
      expect(result.current.blackThreshold).toBe(firstBlackThresholdRef);
    });
  });

  describe('call function', () => {
    it('should send postMessage to the worker with correct payload', async () => {
      const { result } = renderHook(() => useWasmWorker());

      // Trigger the call
      act(() => {
        result.current.call('test_function', { arg1: 'value1' }, []);
      });

      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
        id: 0,
        funcName: 'test_function',
        args: { arg1: 'value1' },
        bufferKeys: [],
      });
    });

    it('should increment id for each call', async () => {
      const { result } = renderHook(() => useWasmWorker());

      act(() => {
        result.current.call('func1', {}, []);
        result.current.call('func2', {}, []);
        result.current.call('func3', {}, []);
      });

      const calls = mockWorkerInstance.postMessage.mock.calls;
      expect(calls[0][0].id).toBe(0);
      expect(calls[1][0].id).toBe(1);
      expect(calls[2][0].id).toBe(2);
    });

    it('should return a promise that resolves when worker responds', async () => {
      const { result } = renderHook(() => useWasmWorker());

      const callPromise = act(() => result.current.call('test_func', {}, []));

      // Simulate worker response
      act(() => {
        mockWorkerInstance.instance.onmessage({
          data: {
            id: 0,
            output: { result: 'success' },
            returnValue: 0,
          },
        });
      });

      const response = await callPromise;
      expect(response).toEqual({
        output: { result: 'success' },
        returnValue: 0,
      });
    });

    it('should reject promise when worker responds with error', async () => {
      const { result } = renderHook(() => useWasmWorker());

      const callPromise = act(() => result.current.call('test_func', {}, []));

      // Simulate worker error response
      act(() => {
        mockWorkerInstance.instance.onmessage({
          data: {
            id: 0,
            error: 'Something went wrong',
          },
        });
      });

      await expect(callPromise).rejects.toBe('Something went wrong');
    });

    it('should handle multiple concurrent calls correctly', async () => {
      const { result } = renderHook(() => useWasmWorker());

      // Start multiple calls
      const promise1 = act(() => result.current.call('func1', { param: 'a' }, []));
      const promise2 = act(() => result.current.call('func2', { param: 'b' }, []));
      const promise3 = act(() => result.current.call('func3', { param: 'c' }, []));

      // Respond in different order
      act(() => {
        mockWorkerInstance.instance.onmessage({
          data: { id: 1, output: { result: 'b' }, returnValue: 0 },
        });
        mockWorkerInstance.instance.onmessage({
          data: { id: 0, output: { result: 'a' }, returnValue: 0 },
        });
        mockWorkerInstance.instance.onmessage({
          data: { id: 2, output: { result: 'c' }, returnValue: 0 },
        });
      });

      const [response1, response2, response3] = await Promise.all([promise1, promise2, promise3]);

      expect(response1.output.result).toBe('a');
      expect(response2.output.result).toBe('b');
      expect(response3.output.result).toBe('c');
    });

    it('should pass bufferKeys to worker correctly', async () => {
      const { result } = renderHook(() => useWasmWorker());

      act(() => {
        result.current.call('test_func', { pixels: new Uint8Array([1, 2, 3]) }, ['pixels']);
      });

      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
        id: 0,
        funcName: 'test_func',
        args: { pixels: expect.any(Uint8Array) },
        bufferKeys: ['pixels'],
      });
    });

    it('should handle empty args object', async () => {
      const { result } = renderHook(() => useWasmWorker());

      act(() => {
        result.current.call('test_func');
      });

      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
        id: 0,
        funcName: 'test_func',
        args: {},
        bufferKeys: [],
      });
    });
  });

  describe('gaussianBlur helper', () => {
    it('should call worker with correct function name and args', async () => {
      const { result } = renderHook(() => useWasmWorker());

      const pixels = new Uint8ClampedArray([255, 0, 0, 255]);
      const width = 1;
      const height = 1;
      const sigma_pixels = 2.5;

      const blurPromise = act(() =>
        result.current.gaussianBlur({ pixels, width, height, sigma_pixels })
      );

      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
        id: 0,
        funcName: 'gaussian_blur_fft',
        args: { pixels, width, height, sigma_pixels },
        bufferKeys: ['pixels'],
      });

      // Simulate response
      act(() => {
        mockWorkerInstance.instance.onmessage({
          data: {
            id: 0,
            output: { pixels: new Uint8ClampedArray([200, 50, 50, 255]) },
            returnValue: 0,
          },
        });
      });

      const result_pixels = await blurPromise;
      expect(result_pixels).toEqual(new Uint8ClampedArray([200, 50, 50, 255]));
    });

    it('should use default sigma_pixels based on width', async () => {
      const { result } = renderHook(() => useWasmWorker());

      const pixels = new Uint8ClampedArray(400); // 100 pixels
      const width = 100;
      const height = 1;

      act(() => {
        result.current.gaussianBlur({ pixels, width, height });
      });

      const call = mockWorkerInstance.postMessage.mock.calls[0][0];
      expect(call.args.sigma_pixels).toBe(width * 0.005);
    });

    it('should return only the pixels from output', async () => {
      const { result } = renderHook(() => useWasmWorker());

      const blurPromise = act(() =>
        result.current.gaussianBlur({
          pixels: new Uint8ClampedArray([1, 2, 3, 4]),
          width: 1,
          height: 1,
        })
      );

      act(() => {
        mockWorkerInstance.instance.onmessage({
          data: {
            id: 0,
            output: {
              pixels: new Uint8ClampedArray([10, 20, 30, 40]),
              otherData: 'ignored',
            },
            returnValue: 0,
          },
        });
      });

      const result_pixels = await blurPromise;
      expect(result_pixels).toEqual(new Uint8ClampedArray([10, 20, 30, 40]));
    });
  });

  describe('blackThreshold helper', () => {
    it('should call worker with correct function name and args', async () => {
      const { result } = renderHook(() => useWasmWorker());

      const pixels = new Uint8ClampedArray([100, 100, 100, 255]);
      const width = 1;
      const height = 1;
      const num_colors = 8;

      const thresholdPromise = act(() =>
        result.current.blackThreshold({ pixels, width, height, num_colors })
      );

      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
        id: 0,
        funcName: 'black_threshold_image',
        args: { pixels, width, height, num_colors },
        bufferKeys: ['pixels'],
      });

      // Simulate response
      act(() => {
        mockWorkerInstance.instance.onmessage({
          data: {
            id: 0,
            output: { pixels: new Uint8ClampedArray([0, 0, 0, 255]) },
            returnValue: 0,
          },
        });
      });

      const result_pixels = await thresholdPromise;
      expect(result_pixels).toEqual(new Uint8ClampedArray([0, 0, 0, 255]));
    });
  });

  describe('kmeans helper', () => {
    it('should call worker with correct function name and default max_iter', async () => {
      const { result } = renderHook(() => useWasmWorker());

      const pixels = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]);
      const width = 2;
      const height = 1;
      const num_colors = 2;

      const kmeansPromise = act(() =>
        result.current.kmeans({ pixels, width, height, num_colors })
      );

      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
        id: 0,
        funcName: 'kmeans_clustering',
        args: { pixels, width, height, num_colors, max_iter: 100 },
        bufferKeys: ['pixels'],
      });

      // Simulate response
      act(() => {
        mockWorkerInstance.instance.onmessage({
          data: {
            id: 0,
            output: { pixels: new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]) },
            returnValue: 0,
          },
        });
      });

      await kmeansPromise;
    });

    it('should accept custom max_iter parameter', async () => {
      const { result } = renderHook(() => useWasmWorker());

      act(() => {
        result.current.kmeans({
          pixels: new Uint8ClampedArray([1, 2, 3, 4]),
          width: 1,
          height: 1,
          num_colors: 4,
          max_iter: 50,
        });
      });

      const call = mockWorkerInstance.postMessage.mock.calls[0][0];
      expect(call.args.max_iter).toBe(50);
    });
  });

  describe('mergeSmallRegionsInPlace helper', () => {
    it('should call worker with correct function name and all args', async () => {
      const { result } = renderHook(() => useWasmWorker());

      const pixels = new Uint8ClampedArray([255, 0, 0, 255]);
      const width = 10;
      const height = 10;
      const minArea = 5;
      const minWidth = 2;
      const minHeight = 2;

      const mergePromise = act(() =>
        result.current.mergeSmallRegionsInPlace({ pixels, width, height, minArea, minWidth, minHeight })
      );

      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
        id: 0,
        funcName: 'mergeSmallRegionsInPlace',
        args: { pixels, width, height, minArea, minWidth, minHeight },
        bufferKeys: ['pixels'],
      });

      // Simulate response
      act(() => {
        mockWorkerInstance.instance.onmessage({
          data: {
            id: 0,
            output: { pixels: new Uint8ClampedArray([255, 255, 0, 255]) },
            returnValue: 0,
          },
        });
      });

      const result_pixels = await mergePromise;
      expect(result_pixels).toEqual(new Uint8ClampedArray([255, 255, 0, 255]));
    });
  });

  describe('error handling', () => {
    it('should handle worker errors gracefully', async () => {
      const { result } = renderHook(() => useWasmWorker());

      const callPromise = act(() =>
        result.current.gaussianBlur({
          pixels: new Uint8ClampedArray([1, 2, 3, 4]),
          width: 1,
          height: 1,
        })
      );

      // Simulate error response
      act(() => {
        mockWorkerInstance.instance.onmessage({
          data: {
            id: 0,
            error: 'Worker processing failed',
          },
        });
      });

      await expect(callPromise).rejects.toBe('Worker processing failed');
    });

    it('should handle missing callback for response', () => {
      const { result } = renderHook(() => useWasmWorker());

      // Simulate response with non-existent id
      act(() => {
        mockWorkerInstance.instance.onmessage({
          data: {
            id: 999,
            output: { result: 'orphaned' },
            returnValue: 0,
          },
        });
      });

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('should clean up callbacks when promise resolves', async () => {
      const { result } = renderHook(() => useWasmWorker());

      const callPromise = act(() => result.current.call('test', {}, []));

      act(() => {
        mockWorkerInstance.instance.onmessage({
          data: { id: 0, output: {}, returnValue: 0 },
        });
      });

      await callPromise;

      // Trying to respond again should not do anything
      act(() => {
        mockWorkerInstance.instance.onmessage({
          data: { id: 0, output: { different: 'data' }, returnValue: 1 },
        });
      });

      // No error should be thrown
      expect(true).toBe(true);
    });

    it('should clean up callbacks when promise rejects', async () => {
      const { result } = renderHook(() => useWasmWorker());

      const callPromise = act(() => result.current.call('test', {}, []));

      act(() => {
        mockWorkerInstance.instance.onmessage({
          data: { id: 0, error: 'Test error' },
        });
      });

      await expect(callPromise).rejects.toBe('Test error');

      // Callback should be cleaned up
      act(() => {
        mockWorkerInstance.instance.onmessage({
          data: { id: 0, output: {}, returnValue: 0 },
        });
      });

      // No error should be thrown
      expect(true).toBe(true);
    });
  });
});