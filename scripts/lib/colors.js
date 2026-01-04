// Terminal color utility with enum-safe colors

const supportsColor = process.stdout.isTTY;

// Define allowed color names as an enum
export const Colors = Object.freeze({
  RESET: 'reset',
  BOLD: 'bold',
  DIM: 'dim',
  RED: 'red',
  GREEN: 'green',
  YELLOW: 'yellow',
  BLUE: 'blue',
  MAGENTA: 'magenta',
  CYAN: 'cyan',
  WHITE: 'white',
  BG_RED: 'bgRed',
  BG_GREEN: 'bgGreen',
  BG_YELLOW: 'bgYellow',
  BG_BLUE: 'bgBlue',
  BG_MAGENTA: 'bgMagenta',
  BG_CYAN: 'bgCyan',
  BG_WHITE: 'bgWhite',
});

// Mapping from enum to ANSI codes
const codes = Object.freeze({
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
});

/**
 * Wraps the provided text with the ANSI escape sequence for the given color when the terminal supports color and the color token is recognized.
 *
 * @param {*} text - The value to colorize. If `null` or `undefined`, an empty string is returned.
 * @param {string} colorEnum - A color token from the exported `Colors` set (e.g., `"red"`, `"bgBlue"`); if unrecognized the original `text` is returned unchanged.
 * @returns {string} The text wrapped with the color's ANSI code and a reset code when applied, otherwise the original text (or empty string for `null`/`undefined`).
 */
export function colorText(text, colorEnum) {
  if (text == null) return '';
  if (!supportsColor || !codes[colorEnum]) return text;
  return `${codes[colorEnum]}${text}${codes.reset}`;
}

/**
 * Logs text to the console, applying the specified color when the terminal supports it.
 * @param {?string} text - The text to log; if `null` or `undefined`, an empty string is logged.
 * @param {string} colorEnum - Color token name (one of the exported `Colors`); if the token is unsupported the original text is logged without color.
 */
export function logColor(text, colorEnum) {
  console.log(colorText(text, colorEnum));
}
