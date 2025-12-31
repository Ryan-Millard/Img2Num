import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
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

  it('should return call function and helper methods', () => {
    const { result } = renderHook(() => useWasmWorker());

    expect(result.current).toHaveProperty('call');
    expect(result.current).toHaveProperty('gaussianBlur');
    expect(result.current).toHaveProperty('bilateralFilter');
    expect(result.current).toHaveProperty('blackThreshold');
    expect(result.current).toHaveProperty('kmeans');
    expect(result.current).toHaveProperty('mergeSmallRegionsInPlace');

    expect(typeof result.current.call).toBe('function');
    expect(typeof result.current.gaussianBlur).toBe('function');
    expect(typeof result.current.bilateralFilter).toBe('function');
    expect(typeof result.current.blackThreshold).toBe('function');
    expect(typeof result.current.kmeans).toBe('function');
    expect(typeof result.current.mergeSmallRegionsInPlace).toBe('function');
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

    it('should resolve promise when worker responds with success', async () => {
      const { result } = renderHook(() => useWasmWorker());

      let callPromise;
      act(() => {
        callPromise = result.current.call('test_function', {}, []);
      });

      // Simulate worker response
      act(() => {
        mockWorkerInstance.instance.onmessage({
          data: { id: 0, output: { result: 'success' }, returnValue: 42 },
        });
      });

      const response = await callPromise;
      expect(response).toEqual({ output: { result: 'success' }, returnValue: 42 });
    });

    it('should reject promise when worker responds with error', async () => {
      const { result } = renderHook(() => useWasmWorker());

      let callPromise;
      act(() => {
        callPromise = result.current.call('failing_function', {}, []);
      });

      // Simulate worker error response
      act(() => {
        mockWorkerInstance.instance.onmessage({
          data: { id: 0, error: 'Something went wrong' },
        });
      });

      await expect(callPromise).rejects.toBe('Something went wrong');
    });

    it('should handle bufferKeys correctly', async () => {
      const { result } = renderHook(() => useWasmWorker());

      const pixels = new Uint8ClampedArray([255, 0, 0, 255]);

      act(() => {
        result.current.call('process_image', { pixels, width: 1, height: 1 }, ['pixels']);
      });

      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith({
        id: 0,
        funcName: 'process_image',
        args: { pixels, width: 1, height: 1 },
        bufferKeys: ['pixels'],
      });
    });
  });

  describe('gaussianBlur', () => {
    it('should call worker with gaussian_blur_fft function', async () => {
      const { result } = renderHook(() => useWasmWorker());

      const pixels = new Uint8ClampedArray([255, 0, 0, 255]);
      const width = 1;
      const height = 1;

      act(() => {
        result.current.gaussianBlur({ pixels, width, height });
      });

      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          funcName: 'gaussian_blur_fft',
          args: expect.objectContaining({
            pixels,
            width,
            height,
            sigma_pixels: width * 0.005,
          }),
          bufferKeys: ['pixels'],
        })
      );
    });

    it('should use custom sigma_pixels when provided', async () => {
      const { result } = renderHook(() => useWasmWorker());

      const pixels = new Uint8ClampedArray([255, 0, 0, 255]);

      act(() => {
        result.current.gaussianBlur({ pixels, width: 100, height: 100, sigma_pixels: 5 });
      });

      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          args: expect.objectContaining({
            sigma_pixels: 5,
          }),
        })
      );
    });
  });

  describe('bilateralFilter', () => {
    it('should call worker with bilateral_filter function', async () => {
      const { result } = renderHook(() => useWasmWorker());

      const pixels = new Uint8ClampedArray([255, 0, 0, 255]);
      const width = 1;
      const height = 1;

      act(() => {
        result.current.bilateralFilter({ pixels, width, height });
      });

      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          funcName: 'bilateral_filter',
          args: expect.objectContaining({
            pixels,
            width,
            height,
            sigma_spatial: 3.0,
            sigma_range: 50.0,
          }),
          bufferKeys: ['pixels'],
        })
      );
    });

    it('should use custom sigma_spatial and sigma_range when provided', async () => {
      const { result } = renderHook(() => useWasmWorker());

      const pixels = new Uint8ClampedArray([255, 0, 0, 255]);

      act(() => {
        result.current.bilateralFilter({
          pixels,
          width: 100,
          height: 100,
          sigma_spatial: 5.0,
          sigma_range: 25.0,
        });
      });

      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          args: expect.objectContaining({
            sigma_spatial: 5.0,
            sigma_range: 25.0,
          }),
        })
      );
    });
  });

  describe('blackThreshold', () => {
    it('should call worker with black_threshold_image function', async () => {
      const { result } = renderHook(() => useWasmWorker());

      const pixels = new Uint8ClampedArray([255, 255, 255, 255]);

      act(() => {
        result.current.blackThreshold({ pixels, width: 1, height: 1, num_colors: 2 });
      });

      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          funcName: 'black_threshold_image',
          args: { pixels, width: 1, height: 1, num_colors: 2 },
          bufferKeys: ['pixels'],
        })
      );
    });
  });

  describe('kmeans', () => {
    it('should call worker with kmeans_clustering function', async () => {
      const { result } = renderHook(() => useWasmWorker());

      const pixels = new Uint8ClampedArray([255, 0, 0, 255]);

      act(() => {
        result.current.kmeans({ pixels, width: 1, height: 1, num_colors: 4 });
      });

      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          funcName: 'kmeans_clustering',
          args: expect.objectContaining({
            num_colors: 4,
            max_iter: 100,
          }),
          bufferKeys: ['pixels'],
        })
      );
    });

    it('should allow custom max_iter', async () => {
      const { result } = renderHook(() => useWasmWorker());

      const pixels = new Uint8ClampedArray([255, 0, 0, 255]);

      act(() => {
        result.current.kmeans({ pixels, width: 1, height: 1, num_colors: 4, max_iter: 50 });
      });

      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          args: expect.objectContaining({
            max_iter: 50,
          }),
        })
      );
    });
  });

  describe('mergeSmallRegionsInPlace', () => {
    it('should call worker with mergeSmallRegionsInPlace function', async () => {
      const { result } = renderHook(() => useWasmWorker());

      const pixels = new Uint8ClampedArray([255, 0, 0, 255]);

      act(() => {
        result.current.mergeSmallRegionsInPlace({
          pixels,
          width: 10,
          height: 10,
          minArea: 100,
          minWidth: 5,
          minHeight: 5,
        });
      });

      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          funcName: 'mergeSmallRegionsInPlace',
          args: {
            pixels,
            width: 10,
            height: 10,
            minArea: 100,
            minWidth: 5,
            minHeight: 5,
          },
          bufferKeys: ['pixels'],
        })
      );
    });
  });

  describe('message handling edge cases', () => {
    it('should ignore messages with unknown ids', async () => {
      const { result } = renderHook(() => useWasmWorker());

      // Start a call
      let callPromise;
      act(() => {
        callPromise = result.current.call('test', {}, []);
      });

      // Send a message with wrong id - should be ignored
      act(() => {
        mockWorkerInstance.instance.onmessage({
          data: { id: 999, output: {}, returnValue: 0 },
        });
      });

      // Verify the original promise is still pending by resolving with correct id
      act(() => {
        mockWorkerInstance.instance.onmessage({
          data: { id: 0, output: { correct: true }, returnValue: 1 },
        });
      });

      const response = await callPromise;
      expect(response.output.correct).toBe(true);
    });
  });
});
