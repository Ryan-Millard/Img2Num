import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Colors, colorText, logColor } from '../../lib/colors.js';

describe('colors.js', () => {
  describe('Colors enum', () => {
    it('should be frozen and immutable', () => {
      expect(Object.isFrozen(Colors)).toBe(true);
      
      // Attempt to modify should fail silently or throw in strict mode
      expect(() => {
        Colors.RED = 'modified';
      }).toThrow();
    });

    it('should contain all expected color keys', () => {
      const expectedKeys = [
        'RESET', 'BOLD', 'DIM', 'RED', 'GREEN', 'YELLOW', 
        'BLUE', 'MAGENTA', 'CYAN', 'WHITE',
        'BG_RED', 'BG_GREEN', 'BG_YELLOW', 'BG_BLUE', 
        'BG_MAGENTA', 'BG_CYAN', 'BG_WHITE'
      ];
      
      expectedKeys.forEach(key => {
        expect(Colors).toHaveProperty(key);
      });
    });

    it('should map to correct string values', () => {
      expect(Colors.RESET).toBe('reset');
      expect(Colors.BOLD).toBe('bold');
      expect(Colors.RED).toBe('red');
      expect(Colors.BG_RED).toBe('bgRed');
    });
  });

  describe('colorText', () => {
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

    describe('with TTY support', () => {
      beforeEach(() => {
        process.stdout.isTTY = true;
      });

      it('should add ANSI codes for valid color', () => {
        const result = colorText('Hello', Colors.RED);
        expect(result).toBe('\x1b[31mHello\x1b[0m');
      });

      it('should handle BOLD color', () => {
        const result = colorText('Bold text', Colors.BOLD);
        expect(result).toBe('\x1b[1mBold text\x1b[0m');
      });

      it('should handle background colors', () => {
        const result = colorText('Background', Colors.BG_BLUE);
        expect(result).toBe('\x1b[44mBackground\x1b[0m');
      });

      it('should handle all foreground colors', () => {
        expect(colorText('red', Colors.RED)).toContain('\x1b[31m');
        expect(colorText('green', Colors.GREEN)).toContain('\x1b[32m');
        expect(colorText('yellow', Colors.YELLOW)).toContain('\x1b[33m');
        expect(colorText('blue', Colors.BLUE)).toContain('\x1b[34m');
        expect(colorText('magenta', Colors.MAGENTA)).toContain('\x1b[35m');
        expect(colorText('cyan', Colors.CYAN)).toContain('\x1b[36m');
        expect(colorText('white', Colors.WHITE)).toContain('\x1b[37m');
      });

      it('should handle all background colors', () => {
        expect(colorText('bg', Colors.BG_RED)).toContain('\x1b[41m');
        expect(colorText('bg', Colors.BG_GREEN)).toContain('\x1b[42m');
        expect(colorText('bg', Colors.BG_YELLOW)).toContain('\x1b[43m');
        expect(colorText('bg', Colors.BG_BLUE)).toContain('\x1b[44m');
        expect(colorText('bg', Colors.BG_MAGENTA)).toContain('\x1b[45m');
        expect(colorText('bg', Colors.BG_CYAN)).toContain('\x1b[46m');
        expect(colorText('bg', Colors.BG_WHITE)).toContain('\x1b[47m');
      });

      it('should always end with reset code', () => {
        const result = colorText('Text', Colors.GREEN);
        expect(result.endsWith('\x1b[0m')).toBe(true);
      });
    });

    describe('without TTY support', () => {
      beforeEach(() => {
        process.stdout.isTTY = false;
      });

      it('should return plain text without color codes', () => {
        const result = colorText('Hello', Colors.RED);
        expect(result).toBe('Hello');
        expect(result).not.toContain('\x1b[');
      });

      it('should work with all color types', () => {
        expect(colorText('plain', Colors.BOLD)).toBe('plain');
        expect(colorText('plain', Colors.BG_BLUE)).toBe('plain');
      });
    });

    describe('edge cases', () => {
      beforeEach(() => {
        process.stdout.isTTY = true;
      });

      it('should return empty string for null text', () => {
        expect(colorText(null, Colors.RED)).toBe('');
      });

      it('should return empty string for undefined text', () => {
        expect(colorText(undefined, Colors.RED)).toBe('');
      });

      it('should handle empty string', () => {
        const result = colorText('', Colors.RED);
        expect(result).toBe('\x1b[31m\x1b[0m');
      });

      it('should return plain text for invalid color', () => {
        const result = colorText('Hello', 'invalid-color');
        expect(result).toBe('Hello');
      });

      it('should return plain text for undefined color', () => {
        const result = colorText('Hello', undefined);
        expect(result).toBe('Hello');
      });

      it('should handle numeric text', () => {
        const result = colorText(123, Colors.BLUE);
        expect(result).toBe('\x1b[34m123\x1b[0m');
      });

      it('should handle multiline text', () => {
        const multiline = 'Line 1\nLine 2\nLine 3';
        const result = colorText(multiline, Colors.GREEN);
        expect(result).toBe('\x1b[32mLine 1\nLine 2\nLine 3\x1b[0m');
      });

      it('should handle text with special characters', () => {
        const special = 'Text with 🎨 emoji and ñ special chars';
        const result = colorText(special, Colors.CYAN);
        expect(result).toContain(special);
        expect(result).toContain('\x1b[36m');
      });
    });
  });

  describe('logColor', () => {
    let consoleLogSpy;

    beforeEach(() => {
      process.stdout.isTTY = true;
      consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it('should call console.log with colored text', () => {
      logColor('Test message', Colors.RED);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith('\x1b[31mTest message\x1b[0m');
    });

    it('should handle all color types', () => {
      logColor('Bold', Colors.BOLD);
      logColor('Green', Colors.GREEN);
      logColor('BgYellow', Colors.BG_YELLOW);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
    });

    it('should handle edge cases', () => {
      logColor(null, Colors.RED);
      expect(consoleLogSpy).toHaveBeenCalledWith('');
      
      logColor('', Colors.BLUE);
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('integration tests', () => {
    beforeEach(() => {
      process.stdout.isTTY = true;
    });

    it('should work with nested color calls', () => {
      const inner = colorText('inner', Colors.RED);
      const outer = colorText(`outer ${inner} text`, Colors.BLUE);
      
      expect(outer).toContain('\x1b[34m');
      expect(outer).toContain('\x1b[31m');
    });

    it('should preserve text content integrity', () => {
      const originalText = 'Important message with numbers 12345';
      const colored = colorText(originalText, Colors.GREEN);
      
      // Remove ANSI codes to verify text integrity
      const plainText = colored.replace(/\x1b\[\d+m/g, '');
      expect(plainText).toBe(originalText);
    });

    it('should handle rapid color switching', () => {
      const colors = [Colors.RED, Colors.GREEN, Colors.BLUE, Colors.YELLOW];
      const results = colors.map((color, i) => colorText(`Text ${i}`, color));
      
      results.forEach((result, i) => {
        expect(result).toContain(`Text ${i}`);
        expect(result).toContain('\x1b[0m');
      });
    });
  });
});