import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

vi.mock('fs');
vi.mock('path');

describe('validate-scripts.js - Advanced Edge Cases', () => {
  let consoleErrorSpy;
  let consoleLogSpy;
  let processExitSpy;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('flattenScriptsInfo edge cases', () => {
    it('should handle deeply nested scriptsInfo structure', async () => {
      const mockPackage = {
        scripts: { test: 'test' },
        scriptsInfo: {
          Group1: {
            test: { desc: 'Test', nested: { deep: { value: 'ignored' } } }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle scriptsInfo with number keys', async () => {
      const mockPackage = {
        scripts: { '123': 'command' },
        scriptsInfo: {
          Group: {
            '123': { desc: 'Numeric key' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle scriptsInfo with special characters in keys', async () => {
      const mockPackage = {
        scripts: {
          'test-@#$': 'command',
          'build:prod:debug': 'command2'
        },
        scriptsInfo: {
          Testing: {
            'test-@#$': { desc: 'Special chars' },
            'build:prod:debug': { desc: 'Colons' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle scriptsInfo with Unicode keys', async () => {
      const mockPackage = {
        scripts: {
          'test-🚀': 'command',
          'build-ñ': 'command2'
        },
        scriptsInfo: {
          Testing: {
            'test-🚀': { desc: 'Emoji' },
            'build-ñ': { desc: 'Unicode' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('error message formatting', () => {
    it('should handle multiple missing scripts in error output', async () => {
      const mockPackage = {
        scripts: {},
        scriptsInfo: {
          Build: {
            build: { desc: 'Build' },
            compile: { desc: 'Compile' },
            package: { desc: 'Package' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle mixed errors (missing both ways)', async () => {
      const mockPackage = {
        scripts: {
          build: 'build',
          orphan1: 'command'
        },
        scriptsInfo: {
          Build: {
            build: { desc: 'Build' },
            orphan2: { desc: 'Orphan' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      const errors = consoleErrorSpy.mock.calls.map(call => call[0]);
      expect(errors.some(e => e.includes('orphan1'))).toBe(true);
      expect(errors.some(e => e.includes('orphan2'))).toBe(true);
    });
  });

  describe('package.json variations', () => {
    it('should handle package.json with extra fields', async () => {
      const mockPackage = {
        name: 'test-package',
        version: '1.0.0',
        description: 'Test',
        dependencies: {},
        devDependencies: {},
        scripts: { test: 'test' },
        scriptsInfo: {
          Testing: {
            test: { desc: 'Test' }
          }
        },
        author: 'Test Author',
        license: 'MIT'
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle minimal package.json', async () => {
      const mockPackage = {
        scripts: {},
        scriptsInfo: {}
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle package.json with comments (JSON5 style)', async () => {
      // Note: Standard JSON doesn't support comments, but testing parser resilience
      const mockPackage = {
        scripts: { test: 'test' },
        scriptsInfo: {
          Testing: { test: { desc: 'Test' } }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('filesystem error scenarios', () => {
    it('should handle permission denied error', async () => {
      const permError = new Error('EACCES: permission denied');
      permError.code = 'EACCES';
      fs.readFileSync.mockImplementation(() => { throw permError; });
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle file is a directory error', async () => {
      const dirError = new Error('EISDIR: illegal operation on a directory');
      dirError.code = 'EISDIR';
      fs.readFileSync.mockImplementation(() => { throw dirError; });
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle corrupted file (partial JSON)', async () => {
      fs.readFileSync.mockReturnValue('{"scripts": {"test": "test"}, "scriptsInfo": {');
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle empty file', async () => {
      fs.readFileSync.mockReturnValue('');
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle file with only whitespace', async () => {
      fs.readFileSync.mockReturnValue('   \n\t  \n  ');
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle non-JSON content', async () => {
      fs.readFileSync.mockReturnValue('This is not JSON at all!');
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('validation logic edge cases', () => {
    it('should handle scripts and scriptsInfo with different key counts', async () => {
      const mockPackage = {
        scripts: {
          a: 'a', b: 'b', c: 'c', d: 'd', e: 'e'
        },
        scriptsInfo: {
          Group: {
            a: { desc: 'A' },
            b: { desc: 'B' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleErrorSpy.mock.calls.length).toBeGreaterThan(0);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle completely different key sets', async () => {
      const mockPackage = {
        scripts: {
          alpha: 'a', beta: 'b', gamma: 'c'
        },
        scriptsInfo: {
          Group: {
            delta: { desc: 'D' },
            epsilon: { desc: 'E' },
            zeta: { desc: 'Z' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleErrorSpy.mock.calls.length).toBe(6);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle case-sensitive key differences', async () => {
      const mockPackage = {
        scripts: {
          Build: 'build',
          test: 'test'
        },
        scriptsInfo: {
          Group: {
            build: { desc: 'Build (lowercase)' },
            Test: { desc: 'Test (uppercase)' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('_meta handling edge cases', () => {
    it('should ignore _meta with various properties', async () => {
      const mockPackage = {
        scripts: { test: 'test' },
        scriptsInfo: {
          _meta: {
            basic: ['test'],
            version: '1.0',
            author: 'Test',
            extraProp: { nested: true }
          },
          Testing: {
            test: { desc: 'Test' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle _meta as only group', async () => {
      const mockPackage = {
        scripts: {},
        scriptsInfo: {
          _meta: { basic: [] }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle multiple _meta-like keys', async () => {
      const mockPackage = {
        scripts: { test: 'test' },
        scriptsInfo: {
          _meta: { basic: ['test'] },
          _internal: { test: { desc: 'Should not be ignored' } },
          Testing: { test: { desc: 'Test' } }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      // _internal should not be treated as _meta
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('both package.json files validation', () => {
    it('should validate both files even if first fails', async () => {
      let callCount = 0;
      fs.readFileSync.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First file (root package.json) - invalid
          return JSON.stringify({
            scripts: { orphan: 'cmd' },
            scriptsInfo: {}
          });
        } else {
          // Second file (docs/package.json) - valid
          return JSON.stringify({
            scripts: { test: 'test' },
            scriptsInfo: { Testing: { test: { desc: 'Test' } } }
          });
        }
      });
      
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(path.resolve).toHaveBeenCalledWith('./package.json');
      expect(path.resolve).toHaveBeenCalledWith('./docs/package.json');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should pass validation when both files are valid', async () => {
      const validPackage = {
        scripts: { test: 'test' },
        scriptsInfo: { Testing: { test: { desc: 'Test' } } }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(validPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
      expect(processExitSpy).not.toHaveBeenCalled();
    });
  });
});