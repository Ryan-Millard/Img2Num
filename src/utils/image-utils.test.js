import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadImageToUint8Array, uint8ClampedArrayToSVG } from './image-utils';

// Mock imagetracerjs
vi.mock('imagetracerjs', () => ({
  default: {
    imagedataToSVG: vi.fn(() => '<svg width="100" height="100"></svg>'),
  },
}));

import ImageTracer from 'imagetracerjs';

describe('image-utils', () => {
  describe('loadImageToUint8Array', () => {
    let mockCanvas;
    let mockContext;
    let originalCreateElement;

    beforeEach(() => {
      vi.clearAllMocks();

      // Mock canvas context
      mockContext = {
        drawImage: vi.fn(),
        getImageData: vi.fn(() => ({
          data: new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]), // 2 pixels: red, green
        })),
        putImageData: vi.fn(),
      };

      // Mock canvas
      mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockContext),
      };

      // Store original and mock document.createElement
      originalCreateElement = document.createElement.bind(document);
      document.createElement = vi.fn((tag) => {
        if (tag === 'canvas') {
          return mockCanvas;
        }
        return originalCreateElement(tag);
      });
    });

    afterEach(() => {
      document.createElement = originalCreateElement;
    });

    it('should load an image file and return pixel data with dimensions', async () => {
      const mockFile = new Blob(['fake-image-data'], { type: 'image/png' });

      // Mock Image class
      class MockImage {
        constructor() {
          this.width = 2;
          this.height = 1;
          this.onload = null;
          this.src = '';

          // Trigger onload after src is set
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      }

      vi.stubGlobal('Image', MockImage);

      const result = await loadImageToUint8Array(mockFile);

      expect(result).toHaveProperty('pixels');
      expect(result).toHaveProperty('width', 2);
      expect(result).toHaveProperty('height', 1);
      expect(result.pixels).toBeInstanceOf(Uint8ClampedArray);
      expect(result.pixels.length).toBe(8); // 2 pixels * 4 channels (RGBA)
    });

    it('should create a canvas with the image dimensions', async () => {
      const mockFile = new Blob(['fake-image-data'], { type: 'image/png' });

      class MockImage {
        constructor() {
          this.width = 100;
          this.height = 50;
          this.onload = null;
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      }

      vi.stubGlobal('Image', MockImage);

      await loadImageToUint8Array(mockFile);

      expect(mockCanvas.width).toBe(100);
      expect(mockCanvas.height).toBe(50);
    });

    it('should draw the image onto the canvas', async () => {
      const mockFile = new Blob(['fake-image-data'], { type: 'image/png' });

      let imageInstance;
      class MockImage {
        constructor() {
          this.width = 10;
          this.height = 10;
          this.onload = null;
          imageInstance = this;
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      }

      vi.stubGlobal('Image', MockImage);

      await loadImageToUint8Array(mockFile);

      expect(mockContext.drawImage).toHaveBeenCalledWith(imageInstance, 0, 0);
    });

    it('should call URL.createObjectURL with the file', async () => {
      const mockFile = new Blob(['fake-image-data'], { type: 'image/png' });

      class MockImage {
        constructor() {
          this.width = 1;
          this.height = 1;
          this.onload = null;
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      }

      vi.stubGlobal('Image', MockImage);

      await loadImageToUint8Array(mockFile);

      expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
    });
  });

  describe('uint8ClampedArrayToSVG', () => {
    let mockCanvas;
    let mockContext;
    let originalCreateElement;

    beforeEach(() => {
      vi.clearAllMocks();

      mockContext = {
        drawImage: vi.fn(),
        getImageData: vi.fn(() => ({
          data: new Uint8ClampedArray([255, 0, 0, 255]),
        })),
        putImageData: vi.fn(),
      };

      mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockContext),
      };

      originalCreateElement = document.createElement.bind(document);
      document.createElement = vi.fn((tag) => {
        if (tag === 'canvas') {
          return mockCanvas;
        }
        return originalCreateElement(tag);
      });
    });

    afterEach(() => {
      document.createElement = originalCreateElement;
    });

    it('should convert pixel data to SVG string', async () => {
      const pixels = new Uint8ClampedArray([255, 0, 0, 128, 0, 255, 0, 128]); // 2 pixels
      const width = 2;
      const height = 1;

      const result = await uint8ClampedArrayToSVG({ pixels, width, height });

      expect(result).toContain('<svg');
      expect(result).toContain('viewBox="0 0 2 1"');
      expect(result).toContain('width="100%"');
      expect(result).toContain('height="auto"');
    });

    it('should force alpha channel to 255 for all pixels', async () => {
      const pixels = new Uint8ClampedArray([255, 0, 0, 0, 0, 255, 0, 0]); // 2 pixels with 0 alpha
      const width = 2;
      const height = 1;

      await uint8ClampedArrayToSVG({ pixels, width, height });

      // After processing, alpha values at indices 3 and 7 should be 255
      expect(pixels[3]).toBe(255);
      expect(pixels[7]).toBe(255);
    });

    it('should create a canvas with correct dimensions', async () => {
      const pixels = new Uint8ClampedArray(400); // 10x10 image * 4 channels
      const width = 10;
      const height = 10;

      await uint8ClampedArrayToSVG({ pixels, width, height });

      expect(mockCanvas.width).toBe(10);
      expect(mockCanvas.height).toBe(10);
    });

    it('should call ImageTracer.imagedataToSVG', async () => {
      const pixels = new Uint8ClampedArray([255, 0, 0, 255]);
      const width = 1;
      const height = 1;

      await uint8ClampedArrayToSVG({ pixels, width, height });

      expect(ImageTracer.imagedataToSVG).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          ltres: 0,
          rightangleenhance: false,
        })
      );
    });

    it('should return null and log error when conversion fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Create a scenario that causes an error by making createElement throw
      document.createElement = vi.fn(() => {
        throw new Error('Canvas creation failed');
      });

      const pixels = new Uint8ClampedArray([255, 0, 0, 255]);
      const result = await uint8ClampedArrayToSVG({ pixels, width: 1, height: 1 });

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Error in SVG conversion:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should inject viewBox attribute into SVG', async () => {
      const pixels = new Uint8ClampedArray(160); // 5x8 image * 4 channels
      const width = 5;
      const height = 8;

      const result = await uint8ClampedArrayToSVG({ pixels, width, height });

      expect(result).toContain('viewBox="0 0 5 8"');
    });

    it('should put ImageData onto the canvas', async () => {
      const pixels = new Uint8ClampedArray([255, 0, 0, 255]);
      const width = 1;
      const height = 1;

      await uint8ClampedArrayToSVG({ pixels, width, height });

      expect(mockContext.putImageData).toHaveBeenCalledWith(expect.any(Object), 0, 0);
    });
  });
});
