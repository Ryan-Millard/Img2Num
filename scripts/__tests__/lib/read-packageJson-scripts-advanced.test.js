import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readPackageJsonScripts } from '../../lib/read-packageJson-scripts.js';
import fs from 'fs';

vi.mock('fs');

describe('read-packageJson-scripts.js - Advanced Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('complex scriptsInfo structures', () => {
    it('should handle deeply nested groups', () => {
      const mockPackageJson = {
        scripts: { a: 'a', b: 'b', c: 'c' },
        scriptsInfo: {
          'Group::Nested::Deep': {
            a: { desc: 'A' },
            b: { desc: 'B' },
            c: { desc: 'C' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.a.group).toBe('Group::Nested::Deep');
    });

    it('should handle numeric group names', () => {
      const mockPackageJson = {
        scripts: { test: 'test' },
        scriptsInfo: {
          '1': {
            test: { desc: 'Test' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.test.group).toBe('1');
    });

    it('should handle group names with special characters', () => {
      const mockPackageJson = {
        scripts: { test: 'test' },
        scriptsInfo: {
          'Testing@#$%^&*()': {
            test: { desc: 'Test' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.test.group).toBe('Testing@#$%^&*()');
    });

    it('should handle empty group names', () => {
      const mockPackageJson = {
        scripts: { test: 'test' },
        scriptsInfo: {
          '': {
            test: { desc: 'Test' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.test.group).toBe('');
    });
  });

  describe('description variations', () => {
    it('should handle very long single-line descriptions', () => {
      const longDesc = 'A'.repeat(10000);
      const mockPackageJson = {
        scripts: { test: 'test' },
        scriptsInfo: {
          Testing: {
            test: { desc: longDesc }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.test.desc).toBe(longDesc);
    });

    it('should handle descriptions with escape characters', () => {
      const mockPackageJson = {
        scripts: { test: 'test' },
        scriptsInfo: {
          Testing: {
            test: { desc: 'Line 1\\nLine 2\\tTabbed' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.test.desc).toContain('\\n');
    });

    it('should handle descriptions with quotes', () => {
      const mockPackageJson = {
        scripts: { test: 'test' },
        scriptsInfo: {
          Testing: {
            test: { desc: 'Test with "quotes" and \'apostrophes\'' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.test.desc).toContain('"quotes"');
    });

    it('should handle descriptions as numbers', () => {
      const mockPackageJson = {
        scripts: { test: 'test' },
        scriptsInfo: {
          Testing: {
            test: { desc: 12345 }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.test.desc).toBe(12345);
    });

    it('should handle descriptions as boolean', () => {
      const mockPackageJson = {
        scripts: { test: 'test' },
        scriptsInfo: {
          Testing: {
            test: { desc: true }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.test.desc).toBe(true);
    });

    it('should handle descriptions as objects', () => {
      const mockPackageJson = {
        scripts: { test: 'test' },
        scriptsInfo: {
          Testing: {
            test: { desc: { nested: 'value' } }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.test.desc).toEqual({ nested: 'value' });
    });

    it('should handle descriptions as arrays of mixed types', () => {
      const mockPackageJson = {
        scripts: { test: 'test' },
        scriptsInfo: {
          Testing: {
            test: { desc: ['string', 123, true, null] }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.test.desc).toEqual(['string', 123, true, null]);
    });
  });

  describe('args array variations', () => {
    it('should handle args with very long strings', () => {
      const longArg = '--flag ' + 'x'.repeat(5000);
      const mockPackageJson = {
        scripts: { test: 'test' },
        scriptsInfo: {
          Testing: {
            test: {
              desc: 'Test',
              args: [longArg]
            }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.test.args[0]).toBe(longArg);
    });

    it('should handle args with mixed types', () => {
      const mockPackageJson = {
        scripts: { test: 'test' },
        scriptsInfo: {
          Testing: {
            test: {
              desc: 'Test',
              args: ['string', 123, true, null, { obj: 'value' }]
            }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.test.args).toHaveLength(5);
      expect(result.flat.test.args[4]).toEqual({ obj: 'value' });
    });

    it('should handle hundreds of args', () => {
      const manyArgs = Array.from({ length: 500 }, (_, i) => `--flag${i}`);
      const mockPackageJson = {
        scripts: { test: 'test' },
        scriptsInfo: {
          Testing: {
            test: {
              desc: 'Test',
              args: manyArgs
            }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.test.args).toHaveLength(500);
    });

    it('should handle args as string instead of array', () => {
      const mockPackageJson = {
        scripts: { test: 'test' },
        scriptsInfo: {
          Testing: {
            test: {
              desc: 'Test',
              args: '--single-string-arg'
            }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.test.args).toBe('--single-string-arg');
    });

    it('should handle args with unicode and emojis', () => {
      const mockPackageJson = {
        scripts: { test: 'test' },
        scriptsInfo: {
          Testing: {
            test: {
              desc: 'Test',
              args: ['--flag 🚀', '--option ñ', '--param 中文']
            }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.test.args).toContain('--flag 🚀');
    });
  });

  describe('command variations', () => {
    it('should handle very long commands', () => {
      const longCommand = 'node script.js ' + '--flag '.repeat(1000);
      const mockPackageJson = {
        scripts: { test: longCommand },
        scriptsInfo: {
          Testing: {
            test: { desc: 'Test' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.test.command).toBe(longCommand);
    });

    it('should handle commands with pipe operators', () => {
      const mockPackageJson = {
        scripts: { test: 'cat file.txt | grep pattern | wc -l' },
        scriptsInfo: {
          Testing: {
            test: { desc: 'Test' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.test.command).toContain('|');
    });

    it('should handle commands with redirections', () => {
      const mockPackageJson = {
        scripts: { test: 'echo "output" > file.txt 2>&1' },
        scriptsInfo: {
          Testing: {
            test: { desc: 'Test' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.test.command).toContain('>');
    });

    it('should handle commands with subshells', () => {
      const mockPackageJson = {
        scripts: { test: 'echo $(date +%Y-%m-%d)' },
        scriptsInfo: {
          Testing: {
            test: { desc: 'Test' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.test.command).toContain('$(');
    });

    it('should handle commands with environment variables', () => {
      const mockPackageJson = {
        scripts: { test: 'NODE_ENV=production npm run build' },
        scriptsInfo: {
          Testing: {
            test: { desc: 'Test' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.test.command).toContain('NODE_ENV=');
    });
  });

  describe('_meta.basic edge cases', () => {
    it('should handle basic array with duplicates', () => {
      const mockPackageJson = {
        scripts: { a: 'a', b: 'b' },
        scriptsInfo: {
          _meta: {
            basic: ['a', 'a', 'b', 'b', 'a']
          },
          Group: {
            a: { desc: 'A' },
            b: { desc: 'B' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.basicItems).toEqual(['a', 'a', 'b', 'b', 'a']);
    });

    it('should handle basic array with non-existent scripts', () => {
      const mockPackageJson = {
        scripts: { a: 'a' },
        scriptsInfo: {
          _meta: {
            basic: ['a', 'nonexistent', 'another-missing']
          },
          Group: {
            a: { desc: 'A' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.basicItems).toContain('nonexistent');
    });

    it('should handle basic as non-array value', () => {
      const mockPackageJson = {
        scripts: { test: 'test' },
        scriptsInfo: {
          _meta: {
            basic: 'single-value'
          },
          Group: {
            test: { desc: 'Test' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.basicItems).toBe('single-value');
    });

    it('should handle _meta with no basic property but other props', () => {
      const mockPackageJson = {
        scripts: { test: 'test' },
        scriptsInfo: {
          _meta: {
            version: '1.0',
            author: 'Test'
          },
          Group: {
            test: { desc: 'Test' }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.basicItems).toEqual([]);
    });
  });

  describe('extreme scenarios', () => {
    it('should handle hundreds of scripts', () => {
      const scripts = {};
      const scriptsInfo = { Group: {} };
      
      for (let i = 0; i < 500; i++) {
        const name = `script-${i}`;
        scripts[name] = `command-${i}`;
        scriptsInfo.Group[name] = { desc: `Description ${i}` };
      }

      const mockPackageJson = { scripts, scriptsInfo };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(Object.keys(result.flat)).toHaveLength(500);
    });

    it('should handle dozens of groups', () => {
      const scripts = { test: 'test' };
      const scriptsInfo = {};
      
      for (let i = 0; i < 50; i++) {
        scriptsInfo[`Group${i}`] = {
          [`test${i}`]: { desc: `Test ${i}` }
        };
        scripts[`test${i}`] = `command${i}`;
      }

      const mockPackageJson = { scripts, scriptsInfo };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(Object.keys(result.flat).length).toBeGreaterThan(40);
    });

    it('should handle JSON with maximum nesting', () => {
      const mockPackageJson = {
        scripts: { test: 'test' },
        scriptsInfo: {
          Group: {
            test: {
              desc: {
                level1: {
                  level2: {
                    level3: {
                      value: 'deeply nested'
                    }
                  }
                }
              }
            }
          }
        }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///fake/package.json'));

      expect(result.flat.test.desc).toBeDefined();
    });
  });

  describe('URL handling', () => {
    it('should handle file:// protocol URLs', () => {
      const mockPackageJson = {
        scripts: { test: 'test' },
        scriptsInfo: { Group: { test: { desc: 'Test' } } }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///absolute/path/package.json'));

      expect(fs.readFileSync).toHaveBeenCalled();
    });

    it('should handle URLs with query parameters', () => {
      const mockPackageJson = {
        scripts: { test: 'test' },
        scriptsInfo: { Group: { test: { desc: 'Test' } } }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///path/package.json?t=123'));

      expect(result.flat).toBeDefined();
    });

    it('should handle URLs with hash fragments', () => {
      const mockPackageJson = {
        scripts: { test: 'test' },
        scriptsInfo: { Group: { test: { desc: 'Test' } } }
      };

      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const result = readPackageJsonScripts(new URL('file:///path/package.json#section'));

      expect(result.flat).toBeDefined();
    });
  });
});