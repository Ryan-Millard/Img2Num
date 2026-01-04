import { runFuzzyCli } from './lib/cli-fuzzy.js';
import { readPackageJsonScripts } from './lib/read-packageJson-scripts.js';

const title = `Img2Num CLI Scripts
Also see: https://ryan-millard.github.io/Img2Num/info/docs/category/-project-scripts
`;

try {
  const { flat: items, basicItems } = readPackageJsonScripts(new URL('../package.json', import.meta.url));

  // Grab all CLI args after `npm run help --`
  const initialSearch = process.argv.slice(2);

  runFuzzyCli({
    title,
    items,
    basicItems,
    initialSearch,
  });
} catch (error) {
  console.error('Failed to read root package.json scripts:', error.message);
  process.exit(1);
}
