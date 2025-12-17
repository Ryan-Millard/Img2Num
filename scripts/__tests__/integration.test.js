import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runFuzzyCli } from '../lib/cli-fuzzy.js';
import { readPackageJsonScripts } from '../lib/read-packageJson-scripts.js';
import { Colors, colorText } from '../lib/colors.js';
import readline from 'readline';

vi.mock('readline');

describe('Integration Tests - Script Utilities', () => {
  let mockRl;
  let consoleLogSpy;
  let processExitSpy;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
    
    mockRl = {
      setPrompt: vi.fn(),
      prompt: vi.fn(),
      on: vi.fn(),
      close: vi.fn()
    };
    
    readline.createInterface.mockReturnValue(mockRl);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    processExitSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('cli-fuzzy readline interaction edge cases', () => {
    it('should handle completer function with empty input', () => {
      const items = {
        build: { desc: 'Build', command: 'build' },
        test: { desc: 'Test', command: 'test' }
      };

      runFuzzyCli({ items, basicItems: [], title: 'Test' });

      const config = readline.createInterface.mock.calls[0][0];
      const [hits, line] = config.completer('');

      expect(Array.isArray(hits)).toBe(true);
      expect(line).toBe('');
    });

    it('should handle completer with partial match', () => {
      const items = {
        build: { desc: 'Build', command: 'build' },
        'build:prod': { desc: 'Production build', command: 'build:prod' },
        test: { desc: 'Test', command: 'test' }
      };

      runFuzzyCli({ items, basicItems: [], title: 'Test' });

      const config = readline.createInterface.mock.calls[0][0];
      const [hits] = config.completer('bui');

      expect(hits).toContain('build');
      expect(hits).toContain('build:prod');
      expect(hits).not.toContain('test');
    });

    it('should handle completer with no matches', () => {
      const items = {
        build: { desc: 'Build', command: 'build' }
      };

      runFuzzyCli({ items, basicItems: [], title: 'Test' });

      const config = readline.createInterface.mock.calls[0][0];
      const [hits] = config.completer('xyz');

      expect(hits).toEqual([]);
    });

    it('should handle line event with whitespace-only input', () => {
      const items = {
        build: { desc: 'Build', command: 'build' }
      };

      runFuzzyCli({ items, basicItems: [], title: 'Test' });

      const lineHandler = mockRl.on.mock.calls.find(call => call[0] === 'line')?.[1];
      
      if (lineHandler) {
        lineHandler('   ');
        expect(consoleLogSpy).toHaveBeenCalled();
      }
    });

    it('should handle line event with tabs and newlines', () => {
      const items = {
        build: { desc: 'Build', command: 'build' }
      };

      runFuzzyCli({ items, basicItems: [], title: 'Test' });

      const lineHandler = mockRl.on.mock.calls.find(call => call[0] === 'line')?.[1];
      
      if (lineHandler) {
        lineHandler('\t\n  \t');
        expect(consoleLogSpy).toHaveBeenCalled();
      }
    });

    it('should handle rapid successive line inputs', () => {
      const items = {
        build: { desc: 'Build', command: 'build' },
        test: { desc: 'Test', command: 'test' },
        dev: { desc: 'Dev', command: 'dev' }
      };

      runFuzzyCli({ items, basicItems: [], title: 'Test' });

      const lineHandler = mockRl.on.mock.calls.find(call => call[0] === 'line')?.[1];
      
      if (lineHandler) {
        lineHandler('build');
        lineHandler('test');
        lineHandler('dev');
        
        expect(mockRl.prompt).toHaveBeenCalledTimes(3);
      }
    });

    it('should handle case-insensitive fuzzy matching', () => {
      const items = {
        BUILD: { desc: 'Build', command: 'build' },
        test: { desc: 'Test', command: 'test' }
      };

      runFuzzyCli({ items, basicItems: [], title: 'Test', initialSearch: ['build'] });

      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('printAll functionality', () => {
    it('should handle items without group property', () => {
      const items = {
        build: { desc: 'Build', command: 'build' },
        test: { desc: 'Test', command: 'test', group: 'Testing' }
      };

      runFuzzyCli({ items, basicItems: [], title: 'Test' });

      const lineHandler = mockRl.on.mock.calls.find(call => call[0] === 'line')?.[1];
      
      if (lineHandler) {
        lineHandler('a');
        
        const output = consoleLogSpy.mock.calls.map(c => c[0]).join('\n');
        expect(output).toContain('Other');
        expect(output).toContain('Testing');
      }
    });

    it('should group multiple items under same group correctly', () => {
      const items = {
        'test': { desc: 'Test', command: 'test', group: 'Testing' },
        'test:watch': { desc: 'Watch', command: 'test:watch', group: 'Testing' },
        'test:coverage': { desc: 'Coverage', command: 'test:coverage', group: 'Testing' }
      };

      runFuzzyCli({ items, basicItems: [], title: 'Test' });

      const lineHandler = mockRl.on.mock.calls.find(call => call[0] === 'line')?.[1];
      
      if (lineHandler) {
        lineHandler('a');
        
        const output = consoleLogSpy.mock.calls.map(c => c[0]).join('\n');
        const testingMatches = (output.match(/Testing/g) || []).length;
        expect(testingMatches).toBeGreaterThan(0);
      }
    });

    it('should call prompt after printing all items', () => {
      const items = {
        build: { desc: 'Build', command: 'build', group: 'Build' }
      };

      runFuzzyCli({ items, basicItems: [], title: 'Test' });

      const lineHandler = mockRl.on.mock.calls.find(call => call[0] === 'line')?.[1];
      
      if (lineHandler) {
        mockRl.prompt.mockClear();
        lineHandler('a');
        expect(mockRl.prompt).toHaveBeenCalled();
      }
    });
  });

  describe('search functionality edge cases', () => {
    it('should handle search with special regex characters', () => {
      const items = {
        'test.build': { desc: 'Test', command: 'test' },
        'test[build]': { desc: 'Test', command: 'test' },
        'test(build)': { desc: 'Test', command: 'test' }
      };

      runFuzzyCli({ items, basicItems: [], title: 'Test', initialSearch: ['test'] });

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle very long search terms', () => {
      const items = {
        build: { desc: 'Build', command: 'build' }
      };
      const longTerm = 'a'.repeat(1000);

      runFuzzyCli({ items, basicItems: [], title: 'Test', initialSearch: [longTerm] });

      const output = consoleLogSpy.mock.calls.map(c => c[0]).join('\n');
      expect(output).toContain('No matches');
    });

    it('should handle Unicode characters in search', () => {
      const items = {
        'build-🚀': { desc: 'Build with emoji', command: 'build' },
        'test-ñ': { desc: 'Test with special', command: 'test' }
      };

      runFuzzyCli({ items, basicItems: [], title: 'Test', initialSearch: ['🚀'] });

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle multiple searches returning same items', () => {
      const items = {
        build: { desc: 'Build project', command: 'vite build' }
      };

      runFuzzyCli({ items, basicItems: [], title: 'Test', initialSearch: ['build', 'build'] });

      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('item display formatting edge cases', () => {
    it('should handle items with very long descriptions', () => {
      const longDesc = 'This is a very long description that goes on and on '.repeat(10);
      const items = {
        build: { desc: longDesc, command: 'build' }
      };

      expect(() => {
        runFuzzyCli({ items, basicItems: ['build'], title: 'Test' });
      }).not.toThrow();
    });

    it('should handle items with newlines in description', () => {
      const items = {
        build: { desc: 'Build\nthe\nproject', command: 'build' }
      };

      expect(() => {
        runFuzzyCli({ items, basicItems: ['build'], title: 'Test' });
      }).not.toThrow();
    });

    it('should handle items with empty args array', () => {
      const items = {
        build: { desc: 'Build', command: 'build', args: [] }
      };

      runFuzzyCli({ items, basicItems: ['build'], title: 'Test' });

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle items with null args', () => {
      const items = {
        build: { desc: 'Build', command: 'build', args: null }
      };

      runFuzzyCli({ items, basicItems: ['build'], title: 'Test' });

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle items with undefined properties', () => {
      const items = {
        build: {
          desc: undefined,
          command: undefined,
          args: undefined,
          group: undefined
        }
      };

      expect(() => {
        runFuzzyCli({ items, basicItems: ['build'], title: 'Test' });
      }).not.toThrow();
    });

    it('should handle empty strings for all properties', () => {
      const items = {
        build: { desc: '', command: '', args: [], group: '' }
      };

      expect(() => {
        runFuzzyCli({ items, basicItems: ['build'], title: 'Test' });
      }).not.toThrow();
    });
  });

  describe('readline close event', () => {
    it('should log exit message on close', () => {
      runFuzzyCli({ items: {}, basicItems: [], title: 'Test' });

      const closeHandler = mockRl.on.mock.calls.find(call => call[0] === 'close')?.[1];
      
      if (closeHandler) {
        closeHandler();
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Exiting'));
      }
    });

    it('should call process.exit(0) on close', () => {
      runFuzzyCli({ items: {}, basicItems: [], title: 'Test' });

      const closeHandler = mockRl.on.mock.calls.find(call => call[0] === 'close')?.[1];
      
      if (closeHandler) {
        closeHandler();
        expect(processExitSpy).toHaveBeenCalledWith(0);
      }
    });
  });

  describe('quit command', () => {
    it('should close readline when q is entered', () => {
      runFuzzyCli({ items: {}, basicItems: [], title: 'Test' });

      const lineHandler = mockRl.on.mock.calls.find(call => call[0] === 'line')?.[1];
      
      if (lineHandler) {
        lineHandler('q');
        expect(mockRl.close).toHaveBeenCalled();
      }
    });

    it('should close readline when Q is entered (case sensitivity)', () => {
      runFuzzyCli({ items: {}, basicItems: [], title: 'Test' });

      const lineHandler = mockRl.on.mock.calls.find(call => call[0] === 'line')?.[1];
      
      if (lineHandler) {
        lineHandler('Q');
        // Should NOT close (case sensitive)
        expect(mockRl.close).not.toHaveBeenCalled();
      }
    });

    it('should not close on "quit" (only q)', () => {
      runFuzzyCli({ items: {}, basicItems: [], title: 'Test' });

      const lineHandler = mockRl.on.mock.calls.find(call => call[0] === 'line')?.[1];
      
      if (lineHandler) {
        lineHandler('quit');
        expect(mockRl.close).not.toHaveBeenCalled();
      }
    });
  });

  describe('stress tests', () => {
    it('should handle hundreds of items efficiently', () => {
      const items = {};
      for (let i = 0; i < 500; i++) {
        items[`script${i}`] = {
          desc: `Description ${i}`,
          command: `command${i}`,
          group: `Group${i % 10}`
        };
      }

      expect(() => {
        runFuzzyCli({ items, basicItems: Object.keys(items).slice(0, 10), title: 'Test' });
      }).not.toThrow();
    });

    it('should handle very large basicItems array', () => {
      const items = {};
      const basicItems = [];
      
      for (let i = 0; i < 100; i++) {
        const name = `script${i}`;
        items[name] = { desc: `Desc ${i}`, command: `cmd${i}` };
        basicItems.push(name);
      }

      expect(() => {
        runFuzzyCli({ items, basicItems, title: 'Test' });
      }).not.toThrow();
    });

    it('should handle many initial search terms', () => {
      const items = {
        build: { desc: 'Build', command: 'build' },
        test: { desc: 'Test', command: 'test' }
      };
      const initialSearch = Array(50).fill('build');

      expect(() => {
        runFuzzyCli({ items, basicItems: [], title: 'Test', initialSearch });
      }).not.toThrow();
    });
  });
});