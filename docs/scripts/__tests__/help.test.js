import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the dependencies
vi.mock('../../../scripts/lib/cli-fuzzy.js', () => ({
  runFuzzyCli: vi.fn()
}));

vi.mock('../../../scripts/lib/read-packageJson-scripts.js', () => ({
  readPackageJsonScripts: vi.fn()
}));

describe('docs/scripts/help.js', () => {
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
    const cliFuzzy = await import('../../../scripts/lib/cli-fuzzy.js');
    const readPkg = await import('../../../scripts/lib/read-packageJson-scripts.js');
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
    it('should read docs package.json scripts', async () => {
      readPackageJsonScripts.mockReturnValue({
        flat: { start: { desc: 'Start dev server', command: 'docusaurus start' } },
        basicItems: ['start']
      });

      await import('../help.js?t=' + Date.now()).catch(() => {});

      expect(readPackageJsonScripts).toHaveBeenCalled();
    });

    it('should call runFuzzyCli with docs-specific title', async () => {
      const mockData = {
        flat: { 
          start: { desc: 'Start docs server', command: 'docusaurus start', group: 'Development' },
          build: { desc: 'Build docs', command: 'docusaurus build', group: 'Build' }
        },
        basicItems: ['start', 'build']
      };
      
      readPackageJsonScripts.mockReturnValue(mockData);
      process.argv = ['node', 'help.js'];

      await import('../help.js?t=' + Date.now()).catch(() => {});

      expect(runFuzzyCli).toHaveBeenCalledWith(
        expect.objectContaining({
          items: mockData.flat,
          basicItems: mockData.basicItems,
          title: expect.stringContaining('Img2Num Docs CLI Scripts'),
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
        flat: { start: { desc: 'Start', command: 'start' } },
        basicItems: []
      });
      
      process.argv = ['node', 'help.js', 'start', 'build'];

      await import('../help.js?t=' + Date.now()).catch(() => {});

      expect(runFuzzyCli).toHaveBeenCalledWith(
        expect.objectContaining({
          initialSearch: ['start', 'build']
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
  });

  describe('error handling', () => {
    it('should catch and log errors with docs-specific message', async () => {
      readPackageJsonScripts.mockImplementation(() => {
        throw new Error('Failed to read package.json');
      });

      await import('../help.js?t=' + Date.now()).catch(() => {});

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to read docs package.json scripts')
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
      const errorMsg = 'Custom docs error';
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
    it('should use correct relative path to docs package.json', async () => {
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

  describe('docusaurus-specific scenarios', () => {
    it('should handle docusaurus scripts', async () => {
      const mockData = {
        flat: {
          start: { desc: 'Start dev server', command: 'docusaurus start', group: 'Development' },
          build: { desc: 'Build site', command: 'docusaurus build', group: 'Build' },
          deploy: { desc: 'Deploy to GitHub Pages', command: 'docusaurus deploy', group: 'Deployment' },
          swizzle: { desc: 'Customize theme', command: 'docusaurus swizzle', group: 'Maintenance' }
        },
        basicItems: ['start', 'build']
      };

      readPackageJsonScripts.mockReturnValue(mockData);
      process.argv = ['node', 'help.js'];

      await import('../help.js?t=' + Date.now()).catch(() => {});

      expect(runFuzzyCli).toHaveBeenCalledWith(
        expect.objectContaining({
          items: mockData.flat,
          basicItems: ['start', 'build']
        })
      );
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
});