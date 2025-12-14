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
import { existsSync, rmSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { platform } from 'node:os';

const WASM_DIR = resolve(import.meta.dirname, '..', 'src', 'wasm');
const BUILD_DIR = join(WASM_DIR, 'cmake-build');

const args = process.argv.slice(2);
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
  } catch {
    return false;
  }
}

/**
 * Clean build directories
 */
function clean() {
  console.log('Cleaning build directories...');

  // Remove CMake build directory
  if (existsSync(BUILD_DIR)) {
    rmSync(BUILD_DIR, { recursive: true, force: true });
    console.log(`  Removed: ${BUILD_DIR}`);
  }

  // Remove module build outputs
  const moduleBuildDir = join(WASM_DIR, 'modules', 'image', 'build');
  if (existsSync(moduleBuildDir)) {
    rmSync(moduleBuildDir, { recursive: true, force: true });
    console.log(`  Removed: ${moduleBuildDir}`);
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
    mkdirSync(BUILD_DIR, { recursive: true });
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
