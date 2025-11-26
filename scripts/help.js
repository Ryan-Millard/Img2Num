#!/usr/bin/env node
import fs from 'fs';

// Read the package.json dynamically
const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url)));

// Optional descriptions for scripts you want to explain
const descriptions = {
	dev: 'Run Vite dev server',
	'dev:debug': 'Build WASM in debug mode then start dev server',
	preview: 'Preview the production build locally',
	build: 'Build WASM then build the site',
	'build-wasm': 'Build the WebAssembly modules',
	'build-wasm:debug': 'Build WASM modules in debug mode',
	'clean-wasm': 'Clean WASM build artifacts',
	clean: 'Clean WASM and dist folders',
	format: 'Format all files with Prettier',
	lint: 'Run ESLint to check for code issues',
	'lint:fix': 'Run ESLint and fix issues automatically',
	'lint:style': 'Check all files against .editorconfig rules'
};

// Print all scripts dynamically
console.log('Available scripts:');
for (const [key, command] of Object.entries(pkg.scripts)) {
	const desc = descriptions[key] ? `: ${descriptions[key]}` : '';
	console.log(`- ${key}${desc}`);
}
