#!/usr/bin/env node
const fs = require('fs');

// Read package.json dynamically
const pkg = JSON.parse(fs.readFileSync(require('path').resolve(__dirname, '../package.json'), 'utf-8'));

// Optional descriptions for scripts
const descriptions = {
  docusaurus: 'Run Docusaurus CLI',
  start: 'Start the Docusaurus dev server',
  build: 'Build the Docusaurus site',
  swizzle: 'Customize Docusaurus theme components',
  deploy: 'Deploy the site',
  clear: 'Clear Docusaurus cache',
  serve: 'Serve the production build locally',
  'write-translations': 'Write translation files',
  'write-heading-ids': 'Add heading IDs for MDX',
};

// Print scripts
console.log('Available docs scripts:');
for (const [name, command] of Object.entries(pkg.scripts)) {
  const desc = descriptions[name] || 'No description';
  console.log(`\n- ${name}: ${desc}`);
  console.log(`    > ${command}`);
}

console.log('\nRun a script with `npm run <script-name>`');
