import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runFuzzyCli } from '../../lib/cli-fuzzy.js';
import readline from 'readline';

vi.mock('readline');
vi.mock('../../lib/colors.js', () => ({
  Colors: {
    BLUE: 'blue',
    BOLD: 'bold',
    CYAN: 'cyan',
    YELLOW: 'yellow',
    RED: 'red',
    MAGENTA: 'magenta'
  },
  colorText: (text, color) => `[${color}]${text}[/]`
}));

describe('cli-fuzzy.js', () => {
  let consoleLogSpy;
  let processExitSpy;
  let mockRl;

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

  describe('runFuzzyCli - parameter validation', () => {
    it('should throw TypeError when items is null', () => {
      expect(() => {
        runFuzzyCli({ items: null, basicItems: [], title: 'Test' });
      }).toThrow(TypeError);
      expect(() => {
        runFuzzyCli({ items: null, basicItems: [], title: 'Test' });
      }).toThrow('items must be a non-null object');
    });

    it('should throw TypeError when items is undefined', () => {
      expect(() => {
        runFuzzyCli({ items: undefined, basicItems: [], title: 'Test' });
      }).toThrow(TypeError);
    });

    it('should throw TypeError when items is not an object', () => {
      expect(() => {
        runFuzzyCli({ items: 'string', basicItems: [], title: 'Test' });
      }).toThrow('items must be a non-null object');
    });

    it('should throw TypeError when basicItems is not an array', () => {
      expect(() => {
        runFuzzyCli({ items: {}, basicItems: 'not-array', title: 'Test' });
      }).toThrow(TypeError);
      expect(() => {
        runFuzzyCli({ items: {}, basicItems: 'not-array', title: 'Test' });
      }).toThrow('basicItems must be an array');
    });

    it('should throw TypeError when title is not a string', () => {
      expect(() => {
        runFuzzyCli({ items: {}, basicItems: [], title: 123 });
      }).toThrow(TypeError);
      expect(() => {
        runFuzzyCli({ items: {}, basicItems: [], title: 123 });
      }).toThrow('title must be a string');
    });

    it('should accept valid parameters', () => {
      expect(() => {
        runFuzzyCli({
          items: { test: { desc: 'Test', command: 'test' } },
          basicItems: ['test'],
          title: 'Test CLI'
        });
      }).not.toThrow();
    });
  });

  describe('runFuzzyCli - header display', () => {
    it('should print header with title', () => {
      const title = 'My CLI Tool';
      runFuzzyCli({
        items: {},
        basicItems: [],
        title
      });

      expect(consoleLogSpy).toHaveBeenCalled();
      const calls = consoleLogSpy.mock.calls.map(call => call[0]);
      expect(calls.some(call => call.includes('My CLI Tool'))).toBe(true);
    });

    it('should print instructions', () => {
      runFuzzyCli({
        items: {},
        basicItems: [],
        title: 'Test'
      });

      const calls = consoleLogSpy.mock.calls.map(call => call[0]);
      expect(calls.some(call => call.includes('quit'))).toBe(true);
    });
  });

  describe('runFuzzyCli - basic scripts display', () => {
    it('should show basic scripts when no initial search', () => {
      const items = {
        build: { desc: 'Build project', command: 'vite build', group: 'Build' },
        test: { desc: 'Run tests', command: 'vitest', group: 'Testing' }
      };
      const basicItems = ['build', 'test'];

      runFuzzyCli({ items, basicItems, title: 'Test' });

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls.map(c => c[0]).join('\n');
      expect(output).toContain('Basic scripts');
    });

    it('should not show basic scripts when initial search provided', () => {
      const items = {
        build: { desc: 'Build', command: 'build' }
      };
      const basicItems = ['build'];
      const initialSearch = ['build'];

      runFuzzyCli({ items, basicItems, title: 'Test', initialSearch });

      const output = consoleLogSpy.mock.calls.map(c => c[0]).join('\n');
      expect(output).not.toContain('Basic scripts');
    });

    it('should handle empty basicItems array', () => {
      expect(() => {
        runFuzzyCli({
          items: { test: { desc: 'Test' } },
          basicItems: [],
          title: 'Test'
        });
      }).not.toThrow();
    });

    it('should skip items not in items object', () => {
      const items = {
        build: { desc: 'Build', command: 'build' }
      };
      const basicItems = ['build', 'nonexistent'];

      runFuzzyCli({ items, basicItems, title: 'Test' });

      // Should not throw error
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('runFuzzyCli - initial search', () => {
    it('should execute initial search terms', () => {
      const items = {
        build: { desc: 'Build project', command: 'build' },
        test: { desc: 'Test project', command: 'test' }
      };
      const initialSearch = ['build'];

      runFuzzyCli({ items, basicItems: [], title: 'Test', initialSearch });

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should execute multiple initial search terms', () => {
      const items = {
        build: { desc: 'Build', command: 'build' },
        test: { desc: 'Test', command: 'test' },
        dev: { desc: 'Dev', command: 'dev' }
      };
      const initialSearch = ['build', 'test'];

      runFuzzyCli({ items, basicItems: [], title: 'Test', initialSearch });

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should close readline when initial search provided', () => {
      const items = { build: { desc: 'Build', command: 'build' } };
      const initialSearch = ['build'];

      runFuzzyCli({ items, basicItems: [], title: 'Test', initialSearch });

      expect(mockRl.close).toHaveBeenCalled();
    });
  });

  describe('runFuzzyCli - readline configuration', () => {
    it('should create readline interface', () => {
      runFuzzyCli({ items: {}, basicItems: [], title: 'Test' });

      expect(readline.createInterface).toHaveBeenCalled();
    });

    it('should configure readline with stdin and stdout', () => {
      runFuzzyCli({ items: {}, basicItems: [], title: 'Test' });

      expect(readline.createInterface).toHaveBeenCalledWith(
        expect.objectContaining({
          input: process.stdin,
          output: process.stdout
        })
      );
    });

    it('should set up completer function', () => {
      const items = {
        build: { desc: 'Build', command: 'build' },
        test: { desc: 'Test', command: 'test' }
      };

      runFuzzyCli({ items, basicItems: [], title: 'Test' });

      const config = readline.createInterface.mock.calls[0][0];
      expect(config.completer).toBeDefined();
      expect(typeof config.completer).toBe('function');
    });

    it('should set prompt when not skipping interactive', () => {
      runFuzzyCli({ items: {}, basicItems: [], title: 'Test' });

      expect(mockRl.setPrompt).toHaveBeenCalled();
      expect(mockRl.prompt).toHaveBeenCalled();
    });

    it('should not call prompt when skipping interactive', () => {
      runFuzzyCli({
        items: {},
        basicItems: [],
        title: 'Test',
        initialSearch: ['test']
      });

      expect(mockRl.prompt).not.toHaveBeenCalled();
    });
  });

  describe('runFuzzyCli - item display format', () => {
    it('should display item with description', () => {
      const items = {
        build: {
          desc: 'Build the project',
          command: 'vite build',
          group: 'Build'
        }
      };

      runFuzzyCli({ items, basicItems: ['build'], title: 'Test' });

      const output = consoleLogSpy.mock.calls.map(c => c[0]).join('\n');
      expect(output).toContain('build');
      expect(output).toContain('Build the project');
    });

    it('should display item with command', () => {
      const items = {
        test: {
          desc: 'Run tests',
          command: 'vitest run',
          group: 'Testing'
        }
      };

      runFuzzyCli({ items, basicItems: ['test'], title: 'Test' });

      const output = consoleLogSpy.mock.calls.map(c => c[0]).join('\n');
      expect(output).toContain('vitest run');
    });

    it('should display item with args', () => {
      const items = {
        build: {
          desc: 'Build',
          command: 'build',
          args: ['--mode production', '--base /app/']
        }
      };

      runFuzzyCli({ items, basicItems: ['build'], title: 'Test' });

      const output = consoleLogSpy.mock.calls.map(c => c[0]).join('\n');
      expect(output).toContain('--mode production');
    });

    it('should handle array description by joining', () => {
      const items = {
        test: {
          desc: ['Run all tests', 'in the project'],
          command: 'test'
        }
      };

      runFuzzyCli({ items, basicItems: ['test'], title: 'Test' });

      const output = consoleLogSpy.mock.calls.map(c => c[0]).join('\n');
      expect(output).toContain('Run all tests in the project');
    });

    it('should display group when present', () => {
      const items = {
        build: {
          desc: 'Build',
          command: 'build',
          group: 'Build Tasks'
        }
      };

      runFuzzyCli({ items, basicItems: ['build'], title: 'Test' });

      const output = consoleLogSpy.mock.calls.map(c => c[0]).join('\n');
      expect(output).toContain('Build Tasks');
    });
  });

  describe('edge cases', () => {
    it('should handle empty items object', () => {
      expect(() => {
        runFuzzyCli({ items: {}, basicItems: [], title: 'Test' });
      }).not.toThrow();
    });

    it('should handle items with missing description', () => {
      const items = {
        build: {
          command: 'build'
        }
      };

      expect(() => {
        runFuzzyCli({ items, basicItems: ['build'], title: 'Test' });
      }).not.toThrow();
    });

    it('should handle items with missing command', () => {
      const items = {
        build: {
          desc: 'Build the project'
        }
      };

      expect(() => {
        runFuzzyCli({ items, basicItems: ['build'], title: 'Test' });
      }).not.toThrow();
    });

    it('should handle empty title', () => {
      expect(() => {
        runFuzzyCli({ items: {}, basicItems: [], title: '' });
      }).not.toThrow();
    });

    it('should handle multiline title', () => {
      const title = 'Line 1\nLine 2\nLine 3';
      
      expect(() => {
        runFuzzyCli({ items: {}, basicItems: [], title });
      }).not.toThrow();
    });

    it('should handle very long item names', () => {
      const longName = 'a'.repeat(100);
      const items = {
        [longName]: {
          desc: 'Test',
          command: 'test'
        }
      };

      expect(() => {
        runFuzzyCli({ items, basicItems: [longName], title: 'Test' });
      }).not.toThrow();
    });

    it('should handle special characters in item names', () => {
      const items = {
        'dev:all:debug': {
          desc: 'Development mode with debug',
          command: 'dev'
        }
      };

      expect(() => {
        runFuzzyCli({ items, basicItems: ['dev:all:debug'], title: 'Test' });
      }).not.toThrow();
    });
  });
});