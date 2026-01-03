import readline from 'readline';
import fuzzy from 'fuzzy';
import { Colors, colorText } from './colors.js';

/**
 * Start an interactive fuzzy-search CLI for the provided script items.
 *
 * Displays a header using the given title, optionally prints a set of basic items,
 * performs any initial one-shot searches, and then enters an interactive prompt
 * that supports fuzzy matching, listing all items, and quitting.
 *
 * @param {Object} params
 * @param {Object<string, Object>} params.items - Mapping of item names to their metadata (description, command, args, group, etc.).
 * @param {string[]} params.basicItems - Ordered list of item names to show as "basic" scripts when no initial searches are provided.
 * @param {string} params.title - Title text to render in the CLI header.
 * @param {string[]} [params.initialSearch=[]] - Optional list of search terms to run once before starting interactive mode.
 * @throws {TypeError} If `items` is not a non-null object, `basicItems` is not an array, or `title` is not a string.
 */
export function runFuzzyCli({ items, basicItems, title, initialSearch = [] }) {
  if (!items || typeof items !== 'object') {
    throw new TypeError('items must be a non-null object');
  }
  if (!Array.isArray(basicItems)) {
    throw new TypeError('basicItems must be an array');
  }
  if (typeof title !== 'string') {
    throw new TypeError('title must be a string');
  }

  printHeader(title);

  // Only show basic scripts if no initial search is provided
  if (initialSearch.length === 0) {
    printBasics(items, basicItems);
  }

  // Run initial search terms if provided
  if (initialSearch.length > 0) {
    initialSearch.forEach((term) => runSearch(term, items));
  }

  startInteractive(items, initialSearch.length > 0);
}

const HEADER_LINE_WIDTH = 80;
const HEADER_INSTRUCTIONS = "Type 'a' to list all, 'q' to quit.";
const HEADER_LINE = colorText('─'.repeat(HEADER_LINE_WIDTH), Colors.BLUE);
/**
 * Prints a styled header block containing the provided title and header instructions.
 * @param {string} title - The header title displayed between decorative horizontal lines.
 */
function printHeader(title) {
  console.log(HEADER_LINE);
  console.log(colorText(title, Colors.BOLD));
  console.log(HEADER_INSTRUCTIONS);
  console.log(HEADER_LINE);
}

/**
 * Print a "Basic scripts:" section and render each named basic script that exists.
 *
 * @param {Object} items - Mapping of script names to their info objects.
 * @param {string[]} basicItems - Ordered list of script names to include in the basic section.
 */
function printBasics(items, basicItems) {
  console.log('\nBasic scripts:');
  for (const name of basicItems) {
    if (items[name]) printItem(name, items[name]);
  }
  console.log('');
}

/**
 * Start an interactive fuzzy-search CLI session for the provided items.
 *
 * Creates a readline interface with fuzzy completion over item names, prompts the user,
 * and responds to input commands:
 *  - "q": quit and close the interface
 *  - "a": list all items grouped by their `info.group`
 *  - any other input: run a fuzzy search and display matched items
 *
 * @param {Object<string, Object>} items - Mapping of item names to their metadata (used for completion and display).
 * @param {boolean} [skipIfInitialSearch=false] - If true, close the interface immediately (used when initial one-shot searches were performed).
 */
function startInteractive(items, skipIfInitialSearch = false) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    completer(line) {
      const names = Object.keys(items);
      const hits = fuzzy.filter(line, names).map((x) => x.original);
      return [hits, line];
    },
  });

  rl.setPrompt(colorText('> ', Colors.CYAN));

  // If initialSearch was provided, and we just want one-shot results, skip the interactive prompt
  if (skipIfInitialSearch) {
    return rl.close();
  }

  rl.prompt();

  rl.on('line', (line) => {
    const input = line.trim();
    if (input === 'q') return rl.close();
    if (input === 'a') return printAll(items, rl);

    runSearch(input, items);

    rl.prompt();
  });

  rl.on('close', () => {
    console.log(colorText('Exiting.', Colors.MAGENTA));
    process.exit(0);
  });
}

/**
 * Finds item names that fuzzy-match the given input and prints matching items' details to the console.
 *
 * If no matches are found, prints "No matches." and returns.
 *
 * @param {string} input - The search query to fuzzy-match against item names.
 * @param {Object.<string, Object>} items - Mapping of item names to metadata used when printing matches.
 */
function runSearch(input, items) {
  const matches = fuzzy.filter(input, Object.keys(items)).map((x) => x.original);
  if (!matches.length) {
    console.log(colorText('No matches.', Colors.RED));
    return;
  }

  for (const name of matches) {
    printItem(name, items[name]);
  }
}

/**
 * Print all scripts grouped by their `info.group` and re-prompt the given readline interface.
 *
 * Groups items by the `group` property on each info object (uses "Other" when absent),
 * prints a blue header for each group, lists each script using `printItem`, and then
 * calls `rl.prompt()` to resume the interactive prompt.
 *
 * @param {Object<string, Object>} items - Mapping of script names to their info objects.
 * @param {import('readline').Interface} rl - Readline interface used to re-prompt after listing.
 */
function printAll(items, rl) {
  const groups = {};

  for (const [name, info] of Object.entries(items)) {
    const group = info.group || 'Other';
    if (!groups[group]) groups[group] = [];
    groups[group].push([name, info]);
  }

  for (const [groupName, scripts] of Object.entries(groups)) {
    console.log(`\n${colorText(`=== ${groupName} ===`, Colors.BLUE)}`);
    for (const [name, info] of scripts) {
      printItem(name, info);
    }
  }

  rl.prompt();
}

/**
 * Print a script item to the console with colorized name, optional group, description, arguments, and command.
 * @param {string} name - The item's name.
 * @param {Object} info - Item metadata.
 * @param {string} [info.group] - Optional group label displayed after the name.
 * @param {string|string[]} [info.desc] - Description text or array of lines; arrays are joined with spaces.
 * @param {string[]} [info.args] - Optional list of argument lines to display.
 * @param {string} [info.command] - Optional command string displayed as a cyan-prefixed line.
 */
function printItem(name, info) {
  console.log(`\n\t${colorText(name, Colors.YELLOW)}${info.group ? ` (${info.group})` : ''}`);
  const description = Array.isArray(info.desc) ? info.desc.join(' ') : info.desc;
  if (description) {
    console.log(`\t\t- ${colorText(description, Colors.YELLOW)}`);
  }

  if (Array.isArray(info.args) && info.args.length) {
    for (const arg of info.args) {
      console.log(`\t\t  ${colorText(arg, Colors.YELLOW)}`);
    }
  }

  if (info.command) {
    console.log(`\t\t\t\t> ${colorText(info.command, Colors.CYAN)}`);
  }
}
