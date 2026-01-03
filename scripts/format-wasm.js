#!/usr/bin/env node
import { execSync } from 'child_process';
import fg from 'fast-glob';

const files = fg.sync('src/wasm/**/*.{cpp,h}', { dot: false });

if (!files.length) {
  console.log('No C++ files found.');
  process.exit(0);
}

const checkOnly = process.argv.includes('--check');

files.forEach((file) => {
  try {
    if (checkOnly) {
      execSync(`clang-format --dry-run --Werror "${file}"`, { stdio: 'inherit' });
      return;
    }

    execSync(`clang-format -i "${file}"`, { stdio: 'inherit' });
    console.log(`Formatted: ${file}`);
  } catch (err) {
    console.error(`Error formatting ${file}:`, err.message);
    process.exit(1);
  }
});

console.log(`C++ ${checkOnly ? 'format check' : 'formatting'} complete.`);
