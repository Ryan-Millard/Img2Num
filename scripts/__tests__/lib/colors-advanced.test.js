import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Colors, colorText, logColor } from '../../lib/colors.js';

describe('colors.js - Advanced Edge Cases', () => {
  let originalIsTTY;
  let consoleLogSpy;

  beforeEach(() => {
    originalIsTTY = process.stdout.isTTY;
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.stdout.isTTY = originalIsTTY;
    consoleLogSpy.mockRestore();
  });

  describe('colorText with various input types', () => {
    beforeEach(() => {
      process.stdout.isTTY = true;
    });

    it('should handle boolean values', () => {
      expect(colorText(true, Colors.RED)).toBe('\x1b[31mtrue\x1b[0m');
      expect(colorText(false, Colors.GREEN)).toBe('\x1b[32mfalse\x1b[0m');
    });

    it('should handle zero', () => {
      const result = colorText(0, Colors.YELLOW);
      expect(result).toBe('\x1b[33m0\x1b[0m');
    });

    it('should handle negative numbers', () => {
      const result = colorText(-42, Colors.CYAN);
      expect(result).toBe('\x1b[36m-42\x1b[0m');
    });

    it('should handle floating point numbers', () => {
      const result = colorText(3.14159, Colors.MAGENTA);
      expect(result).toBe('\x1b[35m3.14159\x1b[0m');
    });

    it('should handle NaN', () => {
      const result = colorText(NaN, Colors.RED);
      expect(result).toBe('\x1b[31mNaN\x1b[0m');
    });

    it('should handle Infinity', () => {
      const result = colorText(Infinity, Colors.BLUE);
      expect(result).toBe('\x1b[34mInfinity\x1b[0m');
    });

    it('should handle BigInt values', () => {
      const result = colorText(BigInt(12345), Colors.GREEN);
      expect(result).toBe('\x1b[32m12345\x1b[0m');
    });

    it('should handle symbols by converting to string', () => {
      const sym = Symbol('test');
      const result = colorText(sym, Colors.YELLOW);
      expect(result).toContain('Symbol(test)');
    });

    it('should handle arrays', () => {
      const arr = [1, 2, 3];
      const result = colorText(arr, Colors.CYAN);
      expect(result).toBe('\x1b[36m1,2,3\x1b[0m');
    });

    it('should handle objects', () => {
      const obj = { a: 1, b: 2 };
      const result = colorText(obj, Colors.MAGENTA);
      expect(result).toContain('[object Object]');
    });

    it('should handle functions', () => {
      const fn = () => {};
      const result = colorText(fn, Colors.RED);
      expect(result).toContain('function');
    });
  });

  describe('ANSI code sequences', () => {
    beforeEach(() => {
      process.stdout.isTTY = true;
    });

    it('should properly escape reset codes in content', () => {
      const text = 'Text with \x1b[0m reset inside';
      const result = colorText(text, Colors.RED);
      expect(result.startsWith('\x1b[31m')).toBe(true);
      expect(result.endsWith('\x1b[0m')).toBe(true);
    });

    it('should handle text already containing ANSI codes', () => {
      const text = '\x1b[32mGreen text\x1b[0m';
      const result = colorText(text, Colors.RED);
      expect(result).toContain('\x1b[31m');
      expect(result).toContain('\x1b[32m');
    });

    it('should handle consecutive color applications', () => {
      let text = 'Start';
      text = colorText(text, Colors.RED);
      text = colorText(text, Colors.BLUE);
      
      expect(text).toContain('\x1b[34m');
      expect(text).toContain('\x1b[31m');
    });
  });

  describe('TTY detection edge cases', () => {
    it('should handle undefined isTTY', () => {
      process.stdout.isTTY = undefined;
      const result = colorText('test', Colors.RED);
      expect(result).toBe('test');
    });

    it('should handle null isTTY', () => {
      process.stdout.isTTY = null;
      const result = colorText('test', Colors.GREEN);
      expect(result).toBe('test');
    });

    it('should handle string "false" as truthy', () => {
      process.stdout.isTTY = 'false'; // Truthy!
      const result = colorText('test', Colors.BLUE);
      expect(result).toContain('\x1b[34m');
    });

    it('should handle 0 as falsy', () => {
      process.stdout.isTTY = 0;
      const result = colorText('test', Colors.YELLOW);
      expect(result).toBe('test');
    });
  });

  describe('color enum value edge cases', () => {
    beforeEach(() => {
      process.stdout.isTTY = true;
    });

    it('should handle empty string as color', () => {
      const result = colorText('test', '');
      expect(result).toBe('test');
    });

    it('should handle number as color', () => {
      const result = colorText('test', 123);
      expect(result).toBe('test');
    });

    it('should handle object as color', () => {
      const result = colorText('test', { color: 'red' });
      expect(result).toBe('test');
    });

    it('should handle null as color', () => {
      const result = colorText('test', null);
      expect(result).toBe('test');
    });

    it('should handle color with extra whitespace', () => {
      const result = colorText('test', ' red ');
      expect(result).toBe('test');
    });

    it('should be case-sensitive for color keys', () => {
      const result = colorText('test', 'RED');
      expect(result).toBe('test');
    });
  });

  describe('special character handling', () => {
    beforeEach(() => {
      process.stdout.isTTY = true;
    });

    it('should handle tabs', () => {
      const result = colorText('\t\tIndented', Colors.GREEN);
      expect(result).toBe('\x1b[32m\t\tIndented\x1b[0m');
    });

    it('should handle carriage returns', () => {
      const result = colorText('Line\rReturn', Colors.BLUE);
      expect(result).toBe('\x1b[34mLine\rReturn\x1b[0m');
    });

    it('should handle form feed', () => {
      const result = colorText('Text\fFeed', Colors.CYAN);
      expect(result).toBe('\x1b[36mText\fFeed\x1b[0m');
    });

    it('should handle vertical tab', () => {
      const result = colorText('Text\vTab', Colors.MAGENTA);
      expect(result).toBe('\x1b[35mText\vTab\x1b[0m');
    });

    it('should handle backspace', () => {
      const result = colorText('Text\bBack', Colors.RED);
      expect(result).toBe('\x1b[31mText\bBack\x1b[0m');
    });

    it('should handle null bytes', () => {
      const result = colorText('Text\x00Null', Colors.YELLOW);
      expect(result).toBe('\x1b[33mText\x00Null\x1b[0m');
    });

    it('should handle mixed line endings', () => {
      const result = colorText('Line1\r\nLine2\nLine3\rLine4', Colors.WHITE);
      expect(result).toBe('\x1b[37mLine1\r\nLine2\nLine3\rLine4\x1b[0m');
    });
  });

  describe('logColor edge cases', () => {
    beforeEach(() => {
      process.stdout.isTTY = true;
    });

    it('should handle being called with no arguments', () => {
      expect(() => logColor()).not.toThrow();
      expect(consoleLogSpy).toHaveBeenCalledWith('');
    });

    it('should handle being called with only text', () => {
      expect(() => logColor('test')).not.toThrow();
    });

    it('should handle being called with only color', () => {
      expect(() => logColor(undefined, Colors.RED)).not.toThrow();
    });

    it('should handle multiple rapid calls', () => {
      for (let i = 0; i < 100; i++) {
        logColor(`Message ${i}`, Colors.BLUE);
      }
      expect(consoleLogSpy).toHaveBeenCalledTimes(100);
    });

    it('should preserve call order', () => {
      logColor('First', Colors.RED);
      logColor('Second', Colors.GREEN);
      logColor('Third', Colors.BLUE);
      
      const calls = consoleLogSpy.mock.calls;
      expect(calls[0][0]).toContain('First');
      expect(calls[1][0]).toContain('Second');
      expect(calls[2][0]).toContain('Third');
    });
  });

  describe('Colors enum integrity', () => {
    it('should not allow adding new properties', () => {
      expect(() => {
        Colors.NEW_COLOR = 'newcolor';
      }).toThrow();
    });

    it('should not allow deleting properties', () => {
      expect(() => {
        delete Colors.RED;
      }).toThrow();
    });

    it('should not allow modifying property descriptors', () => {
      expect(() => {
        Object.defineProperty(Colors, 'RED', { value: 'modified' });
      }).toThrow();
    });

    it('should have all properties as enumerable', () => {
      const keys = Object.keys(Colors);
      expect(keys.length).toBeGreaterThan(0);
      keys.forEach(key => {
        expect(Colors[key]).toBeDefined();
      });
    });

    it('should match specific expected color count', () => {
      const keys = Object.keys(Colors);
      expect(keys).toHaveLength(17); // All defined colors
    });
  });

  describe('performance and memory', () => {
    beforeEach(() => {
      process.stdout.isTTY = true;
    });

    it('should handle very long strings efficiently', () => {
      const longString = 'a'.repeat(100000);
      const start = Date.now();
      colorText(longString, Colors.RED);
      const end = Date.now();
      expect(end - start).toBeLessThan(100); // Should be fast
    });

    it('should not leak memory on repeated calls', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      for (let i = 0; i < 10000; i++) {
        colorText(`Test ${i}`, Colors.BLUE);
      }
      
      // Force garbage collection if available
      if (global.gc) global.gc();
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('should handle concurrent calls without issues', async () => {
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(Promise.resolve(colorText(`Concurrent ${i}`, Colors.GREEN)));
      }
      
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });
  });

  describe('combination scenarios', () => {
    beforeEach(() => {
      process.stdout.isTTY = true;
    });

    it('should handle combining foreground and background (sequential)', () => {
      let text = 'Test';
      text = colorText(text, Colors.RED);
      text = colorText(text, Colors.BG_BLUE);
      
      expect(text).toContain('\x1b[31m');
      expect(text).toContain('\x1b[44m');
    });

    it('should handle bold combined with colors', () => {
      let text = 'Bold and Red';
      text = colorText(text, Colors.BOLD);
      text = colorText(text, Colors.RED);
      
      expect(text).toContain('\x1b[1m');
      expect(text).toContain('\x1b[31m');
    });

    it('should handle dim combined with colors', () => {
      let text = 'Dim and Green';
      text = colorText(text, Colors.DIM);
      text = colorText(text, Colors.GREEN);
      
      expect(text).toContain('\x1b[2m');
      expect(text).toContain('\x1b[32m');
    });

    it('should handle all modifiers with all colors', () => {
      const modifiers = [Colors.BOLD, Colors.DIM];
      const colors = [Colors.RED, Colors.GREEN, Colors.BLUE];
      
      modifiers.forEach(modifier => {
        colors.forEach(color => {
          const result = colorText('Test', modifier);
          const final = colorText(result, color);
          expect(final).toBeDefined();
          expect(final.length).toBeGreaterThan(0);
        });
      });
    });
  });
});