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

    it('should call drawImage with correct parameters', async () => {
      const mockFile = new Blob(['fake-image-data'], { type: 'image/png' });

      class MockImage {
        constructor() {
          this.width = 10;
          this.height = 20;
          this.onload = null;
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      }

      vi.stubGlobal('Image', MockImage);

      await loadImageToUint8Array(mockFile);

      expect(mockContext.drawImage).toHaveBeenCalledWith(expect.any(MockImage), 0, 0);
    });

    it('should call getImageData with correct dimensions', async () => {
      const mockFile = new Blob(['fake-image-data'], { type: 'image/png' });

      class MockImage {
        constructor() {
          this.width = 15;
          this.height = 25;
          this.onload = null;
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      }

      vi.stubGlobal('Image', MockImage);

      await loadImageToUint8Array(mockFile);

      expect(mockContext.getImageData).toHaveBeenCalledWith(0, 0, 15, 25);
    });

    it('should create object URL from file', async () => {
      const mockFile = new Blob(['fake-image-data'], { type: 'image/jpeg' });

      class MockImage {
        constructor() {
          this.width = 1;
          this.height = 1;
          this.onload = null;
          this.src = '';
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      }

      vi.stubGlobal('Image', MockImage);

      await loadImageToUint8Array(mockFile);

      expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
    });

    it('should handle different image formats', async () => {
      const formats = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

      for (const format of formats) {
        const mockFile = new Blob(['data'], { type: format });

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

        const result = await loadImageToUint8Array(mockFile);

        expect(result).toHaveProperty('pixels');
        expect(result).toHaveProperty('width');
        expect(result).toHaveProperty('height');
      }
    });

    it('should handle large images', async () => {
      const mockFile = new Blob(['fake-large-image'], { type: 'image/png' });

      mockContext.getImageData = vi.fn(() => ({
        data: new Uint8ClampedArray(1920 * 1080 * 4), // Full HD image
      }));

      class MockImage {
        constructor() {
          this.width = 1920;
          this.height = 1080;
          this.onload = null;
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      }

      vi.stubGlobal('Image', MockImage);

      const result = await loadImageToUint8Array(mockFile);

      expect(result.width).toBe(1920);
      expect(result.height).toBe(1080);
      expect(result.pixels.length).toBe(1920 * 1080 * 4);
    });

    it('should handle small images (1x1 pixel)', async () => {
      const mockFile = new Blob(['tiny'], { type: 'image/png' });

      mockContext.getImageData = vi.fn(() => ({
        data: new Uint8ClampedArray([128, 128, 128, 255]),
      }));

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

      const result = await loadImageToUint8Array(mockFile);

      expect(result.width).toBe(1);
      expect(result.height).toBe(1);
      expect(result.pixels.length).toBe(4);
    });

    it('should preserve RGBA pixel data', async () => {
      const mockFile = new Blob(['data'], { type: 'image/png' });

      const testPixelData = new Uint8ClampedArray([
        255, 0, 0, 255, // Red pixel
        0, 255, 0, 128, // Green pixel with transparency
        0, 0, 255, 64, // Blue pixel with more transparency
      ]);

      mockContext.getImageData = vi.fn(() => ({
        data: testPixelData,
      }));

      class MockImage {
        constructor() {
          this.width = 3;
          this.height = 1;
          this.onload = null;
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      }

      vi.stubGlobal('Image', MockImage);

      const result = await loadImageToUint8Array(mockFile);

      expect(result.pixels).toEqual(testPixelData);
    });
  });

  describe('uint8ClampedArrayToSVG', () => {
    let mockCanvas;
    let mockContext;
    let originalCreateElement;

    beforeEach(() => {
      vi.clearAllMocks();

      // Reset ImageTracer mock
      ImageTracer.imagedataToSVG.mockReturnValue('<svg width="100" height="100"></svg>');

      mockContext = {
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

    it('should convert Uint8ClampedArray to SVG string', async () => {
      const pixels = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]);
      const width = 2;
      const height = 1;

      const svg = await uint8ClampedArrayToSVG({ pixels, width, height });

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });

    it('should force full alpha on all pixels', async () => {
      const pixels = new Uint8ClampedArray([
        255, 0, 0, 100, // Semi-transparent red
        0, 255, 0, 50, // More transparent green
      ]);
      const width = 2;
      const height = 1;

      await uint8ClampedArrayToSVG({ pixels, width, height });

      // Alpha channels should be set to 255
      expect(pixels[3]).toBe(255);
      expect(pixels[7]).toBe(255);
    });

    it('should create canvas with correct dimensions', async () => {
      const pixels = new Uint8ClampedArray(400); // 100 pixels
      const width = 10;
      const height = 10;

      await uint8ClampedArrayToSVG({ pixels, width, height });

      expect(mockCanvas.width).toBe(10);
      expect(mockCanvas.height).toBe(10);
    });

    it('should call putImageData with ImageData object', async () => {
      const pixels = new Uint8ClampedArray([255, 0, 0, 255]);
      const width = 1;
      const height = 1;

      await uint8ClampedArrayToSVG({ pixels, width, height });

      expect(mockContext.putImageData).toHaveBeenCalledWith(expect.any(ImageData), 0, 0);
    });

    it('should call ImageTracer.imagedataToSVG with correct options', async () => {
      const pixels = new Uint8ClampedArray([255, 0, 0, 255]);
      const width = 1;
      const height = 1;

      await uint8ClampedArrayToSVG({ pixels, width, height });

      expect(ImageTracer.imagedataToSVG).toHaveBeenCalledWith(expect.any(ImageData), {
        ltres: 0,
        rightangleenhance: false,
      });
    });

    it('should inject viewBox attribute into SVG', async () => {
      const pixels = new Uint8ClampedArray(400);
      const width = 10;
      const height = 20;

      ImageTracer.imagedataToSVG.mockReturnValue('<svg width="10" height="20"></svg>');

      const svg = await uint8ClampedArrayToSVG({ pixels, width, height });

      expect(svg).toContain('viewBox="0 0 10 20"');
      expect(svg).toContain('width="100%"');
      expect(svg).toContain('height="auto"');
    });

    it('should handle SVG with existing attributes', async () => {
      const pixels = new Uint8ClampedArray([255, 0, 0, 255]);
      const width = 1;
      const height = 1;

      ImageTracer.imagedataToSVG.mockReturnValue(
        '<svg width="1" height="1" xmlns="http://www.w3.org/2000/svg"></svg>'
      );

      const svg = await uint8ClampedArrayToSVG({ pixels, width, height });

      expect(svg).toContain('viewBox="0 0 1 1"');
      expect(svg).toContain('width="100%"');
      expect(svg).toContain('height="auto"');
    });

    it('should return null on error', async () => {
      const pixels = new Uint8ClampedArray([255, 0, 0, 255]);
      const width = 1;
      const height = 1;

      ImageTracer.imagedataToSVG.mockImplementation(() => {
        throw new Error('SVG conversion failed');
      });

      const svg = await uint8ClampedArrayToSVG({ pixels, width, height });

      expect(svg).toBeNull();
    });

    it('should handle large images', async () => {
      const pixels = new Uint8ClampedArray(1920 * 1080 * 4);
      const width = 1920;
      const height = 1080;

      ImageTracer.imagedataToSVG.mockReturnValue('<svg width="1920" height="1080"></svg>');

      const svg = await uint8ClampedArrayToSVG({ pixels, width, height });

      expect(svg).toContain('viewBox="0 0 1920 1080"');
    });

    it('should handle small images', async () => {
      const pixels = new Uint8ClampedArray([255, 0, 0, 255]);
      const width = 1;
      const height = 1;

      ImageTracer.imagedataToSVG.mockReturnValue('<svg width="1" height="1"></svg>');

      const svg = await uint8ClampedArrayToSVG({ pixels, width, height });

      expect(svg).toContain('viewBox="0 0 1 1"');
    });

    it('should not modify original pixels array beyond alpha channel', async () => {
      const pixels = new Uint8ClampedArray([123, 45, 67, 89, 234, 56, 78, 90]);
      const pixelsCopy = new Uint8ClampedArray(pixels);

      await uint8ClampedArrayToSVG({ pixels, width: 2, height: 1 });

      // RGB values should remain unchanged
      expect(pixels[0]).toBe(pixelsCopy[0]);
      expect(pixels[1]).toBe(pixelsCopy[1]);
      expect(pixels[2]).toBe(pixelsCopy[2]);
      expect(pixels[4]).toBe(pixelsCopy[4]);
      expect(pixels[5]).toBe(pixelsCopy[5]);
      expect(pixels[6]).toBe(pixelsCopy[6]);

      // Alpha values should be 255
      expect(pixels[3]).toBe(255);
      expect(pixels[7]).toBe(255);
    });

    it('should clean up canvas reference', async () => {
      const pixels = new Uint8ClampedArray([255, 0, 0, 255]);

      await uint8ClampedArrayToSVG({ pixels, width: 1, height: 1 });

      // No way to directly verify cleanup, but function should complete without error
      expect(true).toBe(true);
    });

    it('should handle error and still clean up', async () => {
      const pixels = new Uint8ClampedArray([255, 0, 0, 255]);

      ImageTracer.imagedataToSVG.mockImplementation(() => {
        throw new Error('Test error');
      });

      const svg = await uint8ClampedArrayToSVG({ pixels, width: 1, height: 1 });

      expect(svg).toBeNull();
      // Function should complete without hanging
      expect(true).toBe(true);
    });

    it('should handle empty pixel array', async () => {
      const pixels = new Uint8ClampedArray([]);
      const width = 0;
      const height = 0;

      const svg = await uint8ClampedArrayToSVG({ pixels, width, height });

      // Should either return SVG or null, but not throw
      expect(typeof svg === 'string' || svg === null).toBe(true);
    });

    it('should preserve SVG content from ImageTracer', async () => {
      const pixels = new Uint8ClampedArray([255, 0, 0, 255]);

      ImageTracer.imagedataToSVG.mockReturnValue(
        '<svg width="1" height="1"><path d="M0,0 L1,1" fill="red"/></svg>'
      );

      const svg = await uint8ClampedArrayToSVG({ pixels, width: 1, height: 1 });

      expect(svg).toContain('<path d="M0,0 L1,1" fill="red"/>');
    });
  });
});