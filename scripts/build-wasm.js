#!/usr/bin/env node
/**
 * Cross-platform WASM build script using CMake + Emscripten
 *
 * Usage:
 *   node scripts/build-wasm.js [--debug] [--clean]
 *
 * Options:
 *   --debug   Build with debug flags (unoptimized, with source maps)
 *   --clean   Remove build artifacts before building
 */

import { execFileSync } from 'node:child_process';
import { existsSync, rmSync, mkdirSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { platform } from 'node:os';

const WASM_DIR = resolve(import.meta.dirname, '..', 'src', 'wasm');
const BUILD_DIR = join(WASM_DIR, 'cmake-build');
const MODULES_DIR = join(WASM_DIR, 'modules');

const VALID_ARGS = ['--debug', '--clean'];
const args = process.argv.slice(2);

// Validate arguments
const unknownArgs = args.filter((arg) => !VALID_ARGS.includes(arg));
if (unknownArgs.length > 0) {
  console.error(`Unknown argument(s): ${unknownArgs.join(', ')}`);
  console.error(`Valid arguments: ${VALID_ARGS.join(', ')}`);
  process.exit(1);
}

const isDebug = args.includes('--debug');
const isClean = args.includes('--clean');

const isWindows = platform() === 'win32';

/**
 * Run a command with arguments (no shell)
 */
function run(cmd, cmdArgs, options = {}) {
  const fullCmd = [cmd, ...cmdArgs].join(' ');
  console.log(`\n> ${fullCmd}\n`);

  try {
    execFileSync(cmd, cmdArgs, {
      stdio: 'inherit',
      cwd: options.cwd || process.cwd(),
      env: { ...process.env, ...options.env },
    });
  } catch (error) {
    console.error(`Command failed: ${fullCmd}`);
    console.error(`  Exit code: ${error.status ?? 'unknown'}`);
    if (error.signal) {
      console.error(`  Signal: ${error.signal}`);
    }
    if (error.message) {
      console.error(`  Message: ${error.message}`);
    }
    process.exit(error.status || 1);
  }
}

/**
 * Check if emcmake is available
 */
function checkEmscripten() {
  const emcc = isWindows ? 'emcc.bat' : 'emcc';
  try {
    execFileSync(emcc, ['--version'], { stdio: 'pipe' });
    return true;
  } catch (error) {
    // ENOENT means the command was not found (expected when Emscripten not installed)
    if (error.code === 'ENOENT') {
      return false;
    }
    // For other errors, log diagnostics and return false
    console.error(`Error checking for Emscripten (${emcc}):`);
    console.error(`  Error code: ${error.code ?? 'unknown'}`);
    if (error.status !== undefined) {
      console.error(`  Exit status: ${error.status}`);
    }
    if (error.message) {
      console.error(`  Message: ${error.message}`);
    }
    return false;
  }
}

/**
 * Safely remove a directory with proper error handling
 * @param {string} dir - Directory path to remove
 * @returns {boolean} - true if successful, false if failed
 */
function safeRemoveDir(dir) {
  if (!existsSync(dir)) {
    return true; // Nothing to remove
  }

  try {
    rmSync(dir, { recursive: true, force: false });
    console.log(`  Removed: ${dir}`);
    return true;
  } catch (error) {
    console.error(`  Failed to remove: ${dir}`);
    console.error(`    Error code: ${error.code ?? 'unknown'}`);
    if (error.message) {
      console.error(`    Message: ${error.message}`);
    }
    console.log("You may need to forcefully remove it.");
    return false;
  }
}

/**
 * Discover all module directories dynamically
 * @returns {string[]} - Array of module names
 */
function discoverModules() {
  if (!existsSync(MODULES_DIR)) {
    return [];
  }

  try {
    const entries = readdirSync(MODULES_DIR, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  } catch (error) {
    console.error(`Failed to read modules directory: ${MODULES_DIR}`);
    console.error(`  Error: ${error.message}`);
    return [];
  }
}

/**
 * Clean build directories
 */
function clean() {
  console.log('Cleaning build directories...');

  const failedDirs = [];

  // Remove CMake build directory
  if (!safeRemoveDir(BUILD_DIR)) {
    failedDirs.push(BUILD_DIR);
  }

  // Discover and remove all module build directories dynamically
  const modules = discoverModules();
  for (const moduleName of modules) {
    const moduleBuildDir = join(MODULES_DIR, moduleName, 'build');
    if (!safeRemoveDir(moduleBuildDir)) {
      failedDirs.push(moduleBuildDir);
    }
  }

  if (failedDirs.length > 0) {
    console.error('\nClean completed with errors. Failed to remove:');
    for (const dir of failedDirs) {
      console.error(`  - ${dir}`);
    }
    process.exit(1);
  }

  console.log('Clean complete.');
}

/**
 * Main build function
 */
function build() {
  console.log(`\n🔧 Building WASM modules (${isDebug ? 'Debug' : 'Release'})...\n`);

  // Check Emscripten
  if (!checkEmscripten()) {
    console.error('❌ Emscripten not found in PATH.');
    console.error('');
    console.error('Please install Emscripten:');
    console.error('  1. git clone https://github.com/emscripten-core/emsdk.git');
    console.error('  2. cd emsdk && ./emsdk install latest && ./emsdk activate latest');
    console.error('  3. source ./emsdk_env.sh  (or emsdk_env.bat on Windows)');
    console.error('');
    console.error('See: https://emscripten.org/docs/getting_started/');
    process.exit(1);
  }

  // Create build directory
  if (!existsSync(BUILD_DIR)) {
    try {
      mkdirSync(BUILD_DIR, { recursive: true });
    } catch (error) {
      console.error(`Failed to create build directory: ${BUILD_DIR}`);
      console.error(`  Error code: ${error.code ?? 'unknown'}`);
      if (error.message) {
        console.error(`  Message: ${error.message}`);
      }
      console.error('');
      console.error('Possible causes:');
      console.error('  - Insufficient permissions to create directory');
      console.error('  - Parent directory does not exist and cannot be created');
      console.error('  - Disk is full or read-only');
      process.exit(1);
    }
  }

  // Configure with CMake via emcmake
  const buildType = isDebug ? 'Debug' : 'Release';
  const emcmake = isWindows ? 'emcmake.bat' : 'emcmake';

  run(emcmake, [
    'cmake',
    '-S', WASM_DIR,
    '-B', BUILD_DIR,
    `-DCMAKE_BUILD_TYPE=${buildType}`,
  ]);

  // Build
  run('cmake', ['--build', BUILD_DIR, '--parallel', '--config', buildType]);

  console.log('\n✅ WASM build complete!\n');
}

// Main
if (isClean && args.length === 1) {
  // Only clean, don't build
  clean();
} else {
  if (isClean) {
    clean();
  }
  build();
}
