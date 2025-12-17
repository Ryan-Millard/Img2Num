import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readPackageJsonScripts } from '../../lib/read-packageJson-scripts.js';
import fs from 'fs';

vi.mock('fs');

describe('read-packageJson-scripts.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('readPackageJsonScripts', () => {
    it('should read and parse package.json successfully', () => {
      const mockPackageJson = {
        scripts: {
          build: 'vite build',
          test: 'vitest',
          dev: 'vite'
        },
        scriptsInfo: {
          _meta: {
            basic: ['build', 'test']
          },
          Build: {
            build: {
              desc: 'Build the project',
              args: ['--mode production']
            }
          },
          Testing: {
            test: {
              desc: 'Run tests',
              args: []
            }
          },
          Development: {
            dev: {
              desc: 'Start dev server'
            }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const fileUrl = new URL('file:///fake/package.json');
      const result = readPackageJsonScripts(fileUrl);

      expect(fs.readFileSync).toHaveBeenCalledWith(fileUrl);
      expect(result).toHaveProperty('flat');
      expect(result).toHaveProperty('basicItems');
    });

    it('should correctly flatten scriptsInfo into flat structure', () => {
      const mockPackageJson = {
        scripts: {
          build: 'vite build',
          test: 'vitest'
        },
        scriptsInfo: {
          _meta: {
            basic: ['build']
          },
          Build: {
            build: {
              desc: 'Build the project',
              args: ['--mode production']
            }
          },
          Testing: {
            test: {
              desc: 'Run tests',
              args: ['--watch']
            }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat).toHaveProperty('build');
      expect(result.flat).toHaveProperty('test');
      expect(result.flat.build).toEqual({
        desc: 'Build the project',
        args: ['--mode production'],
        command: 'vite build',
        group: 'Build'
      });
      expect(result.flat.test).toEqual({
        desc: 'Run tests',
        args: ['--watch'],
        command: 'vitest',
        group: 'Testing'
      });
    });

    it('should extract basicItems from _meta', () => {
      const mockPackageJson = {
        scripts: {
          build: 'vite build',
          test: 'vitest',
          dev: 'vite'
        },
        scriptsInfo: {
          _meta: {
            basic: ['build', 'test', 'dev']
          },
          Build: {
            build: { desc: 'Build' }
          },
          Testing: {
            test: { desc: 'Test' }
          },
          Development: {
            dev: { desc: 'Dev' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.basicItems).toEqual(['build', 'test', 'dev']);
    });

    it('should handle missing _meta by providing empty basicItems', () => {
      const mockPackageJson = {
        scripts: {
          build: 'vite build'
        },
        scriptsInfo: {
          Build: {
            build: { desc: 'Build' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.basicItems).toEqual([]);
    });

    it('should handle missing desc field', () => {
      const mockPackageJson = {
        scripts: {
          build: 'vite build'
        },
        scriptsInfo: {
          Build: {
            build: {
              args: ['--mode production']
            }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.build.desc).toBe('');
    });

    it('should handle missing args field', () => {
      const mockPackageJson = {
        scripts: {
          build: 'vite build'
        },
        scriptsInfo: {
          Build: {
            build: {
              desc: 'Build the project'
            }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.build.args).toEqual([]);
    });

    it('should use "No command defined" when script is missing', () => {
      const mockPackageJson = {
        scripts: {
          build: 'vite build'
        },
        scriptsInfo: {
          Build: {
            build: { desc: 'Build' },
            missing: { desc: 'This script is missing' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.missing.command).toBe('No command defined');
    });

    it('should correctly assign group names', () => {
      const mockPackageJson = {
        scripts: {
          build: 'build',
          test: 'test',
          lint: 'lint'
        },
        scriptsInfo: {
          Build: {
            build: { desc: 'Build' }
          },
          Testing: {
            test: { desc: 'Test' }
          },
          Linting: {
            lint: { desc: 'Lint' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.build.group).toBe('Build');
      expect(result.flat.test.group).toBe('Testing');
      expect(result.flat.lint.group).toBe('Linting');
    });

    it('should handle multiple scripts in same group', () => {
      const mockPackageJson = {
        scripts: {
          'test': 'vitest',
          'test:watch': 'vitest --watch',
          'test:coverage': 'vitest --coverage'
        },
        scriptsInfo: {
          Testing: {
            test: { desc: 'Run tests' },
            'test:watch': { desc: 'Watch mode' },
            'test:coverage': { desc: 'With coverage' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.test.group).toBe('Testing');
      expect(result.flat['test:watch'].group).toBe('Testing');
      expect(result.flat['test:coverage'].group).toBe('Testing');
    });

    it('should handle empty scriptsInfo', () => {
      const mockPackageJson = {
        scripts: {
          build: 'vite build'
        },
        scriptsInfo: {}
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat).toEqual({});
      expect(result.basicItems).toEqual([]);
    });

    it('should handle complex args arrays', () => {
      const mockPackageJson = {
        scripts: {
          build: 'vite build'
        },
        scriptsInfo: {
          Build: {
            build: {
              desc: 'Build',
              args: [
                '-- --mode production',
                '-- --base /custom-base/',
                '-- --outDir dist'
              ]
            }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.build.args).toHaveLength(3);
      expect(result.flat.build.args).toContain('-- --mode production');
    });

    it('should throw error when file cannot be read', () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      expect(() => {
        readPackageJsonScripts(new URL('file:///nonexistent/package.json'));
      }).toThrow();
    });

    it('should throw error when JSON is malformed', () => {
      fs.readFileSync.mockReturnValue('{ invalid json }');

      expect(() => {
        readPackageJsonScripts(new URL('file:///fake/package.json'));
      }).toThrow();
    });

    it('should handle URL objects correctly', () => {
      const mockPackageJson = {
        scripts: { test: 'vitest' },
        scriptsInfo: {
          Testing: {
            test: { desc: 'Test' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const fileUrl = new URL('file:///path/to/package.json');
      readPackageJsonScripts(fileUrl);

      expect(fs.readFileSync).toHaveBeenCalledWith(fileUrl);
    });

    it('should handle scripts with colons in names', () => {
      const mockPackageJson = {
        scripts: {
          'dev:all:debug': 'command'
        },
        scriptsInfo: {
          Development: {
            'dev:all:debug': { desc: 'Debug all' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat).toHaveProperty('dev:all:debug');
      expect(result.flat['dev:all:debug'].desc).toBe('Debug all');
    });
  });

  describe('integration with real package structure', () => {
    it('should handle the actual project package.json structure', () => {
      const mockPackageJson = {
        scripts: {
          dev: 'vite',
          build: 'npm run build-wasm && vite build',
          test: 'vitest run'
        },
        scriptsInfo: {
          _meta: {
            basic: ['dev', 'build', 'test']
          },
          Development: {
            dev: {
              desc: 'Run Vite dev server',
              args: ['-- port PORT']
            }
          },
          Build: {
            build: {
              desc: 'Build WASM then build the site',
              args: ['-- mode MODE']
            }
          },
          Testing: {
            test: {
              desc: 'Run all tests once using Vitest'
            }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.basicItems).toEqual(['dev', 'build', 'test']);
      expect(Object.keys(result.flat)).toHaveLength(3);
      expect(result.flat.dev.command).toBe('vite');
      expect(result.flat.build.command).toContain('build-wasm');
    });
  });
});