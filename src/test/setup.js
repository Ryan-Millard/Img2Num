import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock Worker class for tests that need Web Workers
class MockWorker {
  constructor() {
    this.onmessage = null;
    this.onerror = null;
  }

  postMessage(data) {
    // By default, simulate a successful response
    if (this.onmessage) {
      setTimeout(() => {
        this.onmessage({ data: { id: data.id, output: {}, returnValue: 0 } });
      }, 0);
    }
  }

  terminate() {
    // Cleanup
  }
}

global.Worker = MockWorker;

// Mock ImageData which is not available in jsdom
if (typeof global.ImageData === 'undefined') {
  global.ImageData = class ImageData {
    constructor(dataOrWidth, widthOrHeight, height) {
      if (dataOrWidth instanceof Uint8ClampedArray) {
        this.data = dataOrWidth;
        this.width = widthOrHeight;
        this.height = height || (dataOrWidth.length / 4 / widthOrHeight);
      } else {
        this.width = dataOrWidth;
        this.height = widthOrHeight;
        this.data = new Uint8ClampedArray(this.width * this.height * 4);
      }
    }
  };
}

global.ResizeObserver = class {
  observe(){} 
  unobserve(){} 
  disconnect(){} 
}
// Mock localStorage for tests
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

global.localStorage = localStorageMock;

// Mock window.matchMedia for theme detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
