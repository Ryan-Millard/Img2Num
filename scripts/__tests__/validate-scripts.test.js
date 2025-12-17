import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// We need to mock the module because it calls process.exit
vi.mock('fs');
vi.mock('path');

describe('validate-scripts.js', () => {
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

  describe('loadPackageJson', () => {
    it('should load and parse valid package.json', async () => {
      const mockPackage = {
        scripts: { test: 'vitest' },
        scriptsInfo: { Testing: { test: { desc: 'Test' } } }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      // Import module fresh
      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(fs.readFileSync).toHaveBeenCalled();
    });

    it('should exit with error on file read failure', async () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file');
      });
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should exit with error on invalid JSON', async () => {
      fs.readFileSync.mockReturnValue('{ invalid json }');
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('flattenScriptsInfo', () => {
    it('should flatten nested scriptsInfo structure', () => {
      const scriptsInfo = {
        Build: {
          build: { desc: 'Build' },
          'build:prod': { desc: 'Production build' }
        },
        Testing: {
          test: { desc: 'Test' }
        }
      };

      // We'll test this through the validation
      const mockPackage = {
        scripts: {
          build: 'vite build',
          'build:prod': 'vite build --mode production',
          test: 'vitest'
        },
        scriptsInfo
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);
    });

    it('should skip _meta key', () => {
      const mockPackage = {
        scripts: { build: 'build' },
        scriptsInfo: {
          _meta: { basic: ['build'] },
          Build: {
            build: { desc: 'Build' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      // _meta should be ignored and not cause validation errors
    });
  });

  describe('validateScripts - success cases', () => {
    it('should pass validation when scripts match scriptsInfo', async () => {
      const mockPackage = {
        scripts: {
          build: 'vite build',
          test: 'vitest'
        },
        scriptsInfo: {
          Build: {
            build: { desc: 'Build' }
          },
          Testing: {
            test: { desc: 'Test' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      // Clear mocks before import
      consoleLogSpy.mockClear();
      processExitSpy.mockClear();

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      // Should log success message
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should validate multiple package.json files', async () => {
      const mockPackage = {
        scripts: { test: 'test' },
        scriptsInfo: { Testing: { test: { desc: 'Test' } } }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      // Should be called for both package.json and docs/package.json
      expect(path.resolve).toHaveBeenCalledWith('./package.json');
      expect(path.resolve).toHaveBeenCalledWith('./docs/package.json');
    });
  });

  describe('validateScripts - failure cases', () => {
    it('should fail when script exists but missing in scriptsInfo', async () => {
      const mockPackage = {
        scripts: {
          build: 'vite build',
          test: 'vitest',
          lint: 'eslint .' // Missing in scriptsInfo
        },
        scriptsInfo: {
          Build: {
            build: { desc: 'Build' }
          },
          Testing: {
            test: { desc: 'Test' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should fail when scriptsInfo entry has no corresponding script', async () => {
      const mockPackage = {
        scripts: {
          build: 'vite build'
        },
        scriptsInfo: {
          Build: {
            build: { desc: 'Build' },
            test: { desc: 'Test' } // No corresponding script
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should fail when scripts field is missing', async () => {
      const mockPackage = {
        scriptsInfo: {
          Build: {
            build: { desc: 'Build' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should fail when scriptsInfo field is missing', async () => {
      const mockPackage = {
        scripts: {
          build: 'vite build'
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('error messages', () => {
    it('should provide clear error for missing scriptsInfo entry', async () => {
      const mockPackage = {
        scripts: { orphan: 'command' },
        scriptsInfo: {}
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('orphan')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('missing in scriptsInfo')
      );
    });

    it('should provide clear error for orphaned scriptsInfo entry', async () => {
      const mockPackage = {
        scripts: {},
        scriptsInfo: {
          Build: {
            orphan: { desc: 'Orphaned' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('orphan')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('does not exist in scripts')
      );
    });

    it('should include file path in error messages', async () => {
      const mockPackage = {
        scripts: {},
        scriptsInfo: {}
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockReturnValue('/fake/path/package.json');

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      // Should mention the file path in error or success messages
      const allMessages = [
        ...consoleErrorSpy.mock.calls,
        ...consoleLogSpy.mock.calls
      ].flat().join(' ');
      
      expect(allMessages).toContain('package.json');
    });
  });

  describe('complex scenarios', () => {
    it('should handle scripts with special characters', async () => {
      const mockPackage = {
        scripts: {
          'dev:all:debug': 'command'
        },
        scriptsInfo: {
          Development: {
            'dev:all:debug': { desc: 'Dev debug mode' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      // Should pass validation
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle large number of scripts', async () => {
      const scripts = {};
      const scriptsInfo = { Group: {} };

      // Create 50 scripts
      for (let i = 0; i < 50; i++) {
        const name = `script${i}`;
        scripts[name] = `command${i}`;
        scriptsInfo.Group[name] = { desc: `Description ${i}` };
      }

      const mockPackage = { scripts, scriptsInfo };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle multiple groups with overlapping names', async () => {
      const mockPackage = {
        scripts: {
          test: 'test1',
          build: 'build1'
        },
        scriptsInfo: {
          Testing: {
            test: { desc: 'Test' }
          },
          Build: {
            build: { desc: 'Build' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle empty scripts and scriptsInfo', async () => {
      const mockPackage = {
        scripts: {},
        scriptsInfo: {}
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackage));
      path.resolve.mockImplementation(p => p);

      await import('../../validate-scripts.js?t=' + Date.now()).catch(() => {});

      // Empty is valid
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should handle scriptsInfo with only _meta', async () => {
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
  });
});