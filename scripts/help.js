#!/usr/bin/env node
import fs from 'fs';
import readline from 'readline';
import fuzzy from 'fuzzy';

// Read package.json dynamically
const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url)));

// Grouped scripts and descriptions
const scriptsInfo = {
  Development: {
    dev: 'Run Vite dev server',
    'dev:debug': 'Build WASM in debug mode then start dev server',
    'dev:all': 'Run Vite dev server and Docusaurus server',
    'dev:all:debug': 'Build WASM in debug mode then start dev and Docusaurus server',
    preview: 'Preview the production build locally',
  },
  Build: {
    build: 'Build WASM then build the site',
    'build-js': 'Build only the JS/React site',
    'build-wasm': 'Build the WebAssembly modules',
    'build-wasm:debug': 'Build WASM modules in debug mode',
  },
  Cleaning: {
    clean: 'Clean WASM build artifacts and dist folder',
    'clean-js': 'Remove dist folder',
    'clean-wasm': 'Clean WASM build artifacts',
  },
  Formatting: {
    format: 'Format all files with Prettier and clang-format',
    'format-js': 'Format all non-C++ files with Prettier',
    'format-wasm': 'Format all C++ files with clang-format',
  },
  Linting: {
    lint: 'Run ESLint to check for code issues',
    'lint:fix': 'Run ESLint and automatically fix issues',
    'lint:style': 'Check all files against .editorconfig rules',
  },
  Testing: {
    test: 'Run all tests once using Vitest',
    'test:watch': 'Run tests in watch mode with Vitest',
    'test:coverage': 'Run tests and generate a coverage report',
  },
  Release: {
    release: 'Generate and update changelog, then handle release versioning',
  },
  Other: {
    help: 'Show this help message',
    docs: 'Run docs scripts (use `npm run docs help` to see available commands)',
  },
};

// Flatten known scripts for lookup
const knownScripts = new Set();
for (const group of Object.values(scriptsInfo)) {
  for (const name of Object.keys(group)) {
    knownScripts.add(name);
  }
}

// Add extra scripts dynamically
const extraScripts = Object.keys(pkg.scripts).filter((name) => !knownScripts.has(name));
if (extraScripts.length > 0) {
  scriptsInfo['Other'] = {
    ...scriptsInfo['Other'],
    ...Object.fromEntries(extraScripts.map((s) => [s, 'No description'])),
  };
}

// Flatten scripts for easy lookup and fuzzy search
const flatScripts = {};
for (const [group, scripts] of Object.entries(scriptsInfo)) {
  for (const [name, desc] of Object.entries(scripts)) {
    flatScripts[name] = { desc, command: pkg.scripts[name] || 'No command defined', group };
  }
}

// List a beginner-friendly set of basic commands
const basicCommands = ['dev', 'build', 'clean', 'format', 'lint', 'help'];
console.log('Basic scripts (get started quickly):');
for (const name of basicCommands) {
  if (flatScripts[name]) {
    const info = flatScripts[name];
    console.log(`  - ${name}: ${info.desc}`);
    console.log(`      > ${info.command}`);
  }
}
console.log("\nSearch for a script using fuzzy finding. Type 'a' to list everything, 'q' to quit.\n");

// Interactive CLI with fuzzy search
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer: (line) => {
    const names = Object.keys(flatScripts);
    const hits = fuzzy.filter(line, names).map((el) => el.original);
    return [hits.length ? hits : names, line];
  },
});

rl.setPrompt('> ');
rl.prompt();

rl.on('line', (line) => {
  const input = line.trim();
  if (input === 'q') {
    rl.close();
    return;
  }

  if (input === 'a') {
    for (const [name, info] of Object.entries(flatScripts)) {
      console.log(`\n${name} (${info.group})`);
      console.log(`  - ${info.desc}`);
      console.log(`      > ${info.command}`);
    }
  } else {
    const matches = fuzzy.filter(input, Object.keys(flatScripts)).map((el) => el.original);
    if (matches.length === 0) {
      console.log('No matching scripts found.');
    } else {
      for (const name of matches) {
        const info = flatScripts[name];
        console.log(`\n${name} (${info.group})`);
        console.log(`  - ${info.desc}`);
        console.log(`      > ${info.command}`);
      }
    }
  }
  rl.prompt();
});

rl.on('close', () => {
  console.log('Exiting help.');
  process.exit(0);
});
