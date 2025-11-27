#!/usr/bin/env node
import fs from 'fs';

// Read package.json dynamically
const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url)));

// Descriptions for scripts
const descriptions = {
  dev: 'Run Vite dev server',
  'dev:debug': 'Build WASM in debug mode then start dev server',
  preview: 'Preview the production build locally',
  build: 'Build WASM then build the site',
  'build-js': 'Build only the JS/React site',
  'build-wasm': 'Build the WebAssembly modules',
  'build-wasm:debug': 'Build WASM modules in debug mode',
  clean: 'Clean WASM build artifacts and dist folder',
  'clean-js': 'Remove dist folder',
  'clean-wasm': 'Clean WASM build artifacts',
  format: 'Format all files with Prettier and clang-format',
  'format-js': 'Format all non-C++ files with Prettier',
  'format-wasm': 'Format all C++ files with clang-format',
  lint: 'Run ESLint to check for code issues',
  'lint:fix': 'Run ESLint and automatically fix issues',
  'lint:style': 'Check all files against .editorconfig rules',
};

// Print all scripts dynamically
console.log('Available scripts:');
for (const [key, _command] of Object.entries(pkg.scripts)) {
  const desc = descriptions[key] ? `: ${descriptions[key]}` : '';
  console.log(`- ${key}${desc}`);
}
