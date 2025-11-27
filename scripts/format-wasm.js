#!/usr/bin/env node
import { execSync } from 'child_process';
import fg from 'fast-glob';

const files = fg.sync('src/wasm/**/*.{cpp,h}', { dot: false });

if (!files.length) {
  console.log('No C++ files found.');
  process.exit(0);
}

files.forEach((file) => {
  try {
    execSync(`npx clang-format -i "${file}"`, { stdio: 'inherit' });
    console.log(`Formatted: ${file}`);
  } catch (err) {
    console.error(`Error formatting ${file}:`, err.message);
  }
});

console.log('C++ formatting complete.');
