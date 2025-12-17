import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the dependencies
vi.mock('../lib/cli-fuzzy.js', () => ({
  runFuzzyCli: vi.fn()
}));

vi.mock('../lib/read-packageJson-scripts.js', () => ({
  readPackageJsonScripts: vi.fn()
}));

describe('help.js', () => {
  let consoleErrorSpy;
  let processExitSpy;
  let originalArgv;
  let runFuzzyCli;
  let readPackageJsonScripts;

  beforeEach(async () => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
    originalArgv = process.argv;

    // Get mocked functions
    const cliFuzzy = await import('../lib/cli-fuzzy.js');
    const readPkg = await import('../lib/read-packageJson-scripts.js');
    runFuzzyCli = cliFuzzy.runFuzzyCli;
    readPackageJsonScripts = readPkg.readPackageJsonScripts;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
    process.argv = originalArgv;
    vi.resetModules();
  });

  describe('initialization', () => {
    it('should read package.json scripts', async () => {
      readPackageJsonScripts.mockReturnValue({
        flat: { build: { desc: 'Build', command: 'build' } },
        basicItems: ['build']
      });

      await import('../help.js?t=' + Date.now()).catch(() => {});

      expect(readPackageJsonScripts).toHaveBeenCalled();
    });

    it('should call runFuzzyCli with correct parameters', async () => {
      const mockData = {
        flat: { 
          build: { desc: 'Build project', command: 'vite build', group: 'Build' },
          test: { desc: 'Run tests', command: 'vitest', group: 'Testing' }
        },
        basicItems: ['build', 'test']
      };
      
      readPackageJsonScripts.mockReturnValue(mockData);
      process.argv = ['node', 'help.js'];

      await import('../help.js?t=' + Date.now()).catch(() => {});

      expect(runFuzzyCli).toHaveBeenCalledWith(
        expect.objectContaining({
          items: mockData.flat,
          basicItems: mockData.basicItems,
          title: expect.stringContaining('Img2Num CLI Scripts'),
          initialSearch: []
        })
      );
    });

    it('should include documentation URL in title', async () => {
      readPackageJsonScripts.mockReturnValue({
        flat: {},
        basicItems: []
      });

      await import('../help.js?t=' + Date.now()).catch(() => {});

      expect(runFuzzyCli).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('ryan-millard.github.io')
        })
      );
    });
  });

  describe('command line arguments', () => {
    it('should pass CLI arguments as initialSearch', async () => {
      readPackageJsonScripts.mockReturnValue({
        flat: { build: { desc: 'Build', command: 'build' } },
        basicItems: []
      });
      
      // Simulate: npm run help -- build test
      process.argv = ['node', 'help.js', 'build', 'test'];

      await import('../help.js?t=' + Date.now()).catch(() => {});

      expect(runFuzzyCli).toHaveBeenCalledWith(
        expect.objectContaining({
          initialSearch: ['build', 'test']
        })
      );
    });

    it('should handle no CLI arguments', async () => {
      readPackageJsonScripts.mockReturnValue({
        flat: {},
        basicItems: []
      });
      
      process.argv = ['node', 'help.js'];

      await import('../help.js?t=' + Date.now()).catch(() => {});

      expect(runFuzzyCli).toHaveBeenCalledWith(
        expect.objectContaining({
          initialSearch: []
        })
      );
    });

    it('should handle multiple search terms', async () => {
      readPackageJsonScripts.mockReturnValue({
        flat: {},
        basicItems: []
      });
      
      process.argv = ['node', 'help.js', 'build', 'test', 'dev'];

      await import('../help.js?t=' + Date.now()).catch(() => {});

      expect(runFuzzyCli).toHaveBeenCalledWith(
        expect.objectContaining({
          initialSearch: ['build', 'test', 'dev']
        })
      );
    });
  });

  describe('error handling', () => {
    it('should catch and log errors from readPackageJsonScripts', async () => {
      readPackageJsonScripts.mockImplementation(() => {
        throw new Error('Failed to read package.json');
      });

      await import('../help.js?t=' + Date.now()).catch(() => {});

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to read root package.json scripts')
      );
    });

    it('should exit with code 1 on error', async () => {
      readPackageJsonScripts.mockImplementation(() => {
        throw new Error('File not found');
      });

      await import('../help.js?t=' + Date.now()).catch(() => {});

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should include error message in output', async () => {
      const errorMsg = 'Custom error message';
      readPackageJsonScripts.mockImplementation(() => {
        throw new Error(errorMsg);
      });

      await import('../help.js?t=' + Date.now()).catch(() => {});

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(errorMsg)
      );
    });
  });

  describe('package.json path resolution', () => {
    it('should use correct relative path to package.json', async () => {
      readPackageJsonScripts.mockReturnValue({
        flat: {},
        basicItems: []
      });

      await import('../help.js?t=' + Date.now()).catch(() => {});

      expect(readPackageJsonScripts).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('package.json')
        })
      );
    });

    it('should resolve path relative to help.js location', async () => {
      readPackageJsonScripts.mockReturnValue({
        flat: {},
        basicItems: []
      });

      await import('../help.js?t=' + Date.now()).catch(() => {});

      const callArg = readPackageJsonScripts.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(URL);
      expect(callArg.pathname).toContain('package.json');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete workflow with valid data', async () => {
      const mockData = {
        flat: {
          dev: { desc: 'Run dev server', command: 'vite', group: 'Development' },
          build: { desc: 'Build project', command: 'vite build', group: 'Build' },
          test: { desc: 'Run tests', command: 'vitest', group: 'Testing' }
        },
        basicItems: ['dev', 'build', 'test']
      };

      readPackageJsonScripts.mockReturnValue(mockData);
      process.argv = ['node', 'help.js', 'build'];

      await import('../help.js?t=' + Date.now()).catch(() => {});

      expect(readPackageJsonScripts).toHaveBeenCalled();
      expect(runFuzzyCli).toHaveBeenCalledWith(
        expect.objectContaining({
          items: mockData.flat,
          basicItems: mockData.basicItems,
          initialSearch: ['build']
        })
      );
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it('should handle empty package.json gracefully', async () => {
      readPackageJsonScripts.mockReturnValue({
        flat: {},
        basicItems: []
      });

      await import('../help.js?t=' + Date.now()).catch(() => {});

      expect(runFuzzyCli).toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
});