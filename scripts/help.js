#!/usr/bin/env node
import fs from 'fs';
import readline from 'readline';
import fuzzy from 'fuzzy';

(function main() {
  console.log(
`──────────────────────────────────────────────────────────────────────────
Img2Num CLI Scripts Documentation
For more details on each script:
https://ryan-millard.github.io/Img2Num/info/docs/category/-project-scripts
──────────────────────────────────────────────────────────────────────────

`
  );

  const flatScripts = readPkgJsonScriptsData();

  displayBasicCommands(flatScripts);

  cliFuzzySearch(flatScripts);
})();

function displayBasicCommands(flatScripts) {
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
}

function readPkgJsonScriptsData() {
  // Read package.json dynamically
  const { scriptsInfo, scripts } = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url)));

  // Flatten scripts for easy lookup and fuzzy search
  const flatScripts = {};
  for (const [group, scripts] of Object.entries(scriptsInfo)) {
    for (const [name, desc] of Object.entries(scripts)) {
      flatScripts[name] = { desc, command: scripts[name] || 'No command defined', group };
    }
  }

  return flatScripts;
}

// Interactive CLI with fuzzy search
function cliFuzzySearch(flatScripts) {
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
      rl.prompt();
      return;
    }

    const matches = fuzzy.filter(input, Object.keys(flatScripts)).map((el) => el.original);
    if (matches.length === 0) {
      console.log('No matching scripts found.');
      rl.prompt();
      return;
    }

    for (const name of matches) {
      const info = flatScripts[name];
      console.log(`\n${name} (${info.group})`);
      console.log(`  - ${info.desc}`);
      console.log(`      > ${info.command}`);
    }


    rl.prompt();
  });

  rl.on('close', () => {
    console.log('Exiting help.');
    process.exit(0);
  });
}
