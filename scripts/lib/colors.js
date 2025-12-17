// Terminal color utility with enum-safe colors

const supportsColor = process.stdout.isTTY;

// Define allowed color names as an enum
export const Colors = Object.freeze({
  RESET: "reset",
  BOLD: "bold",
  DIM: "dim",
  RED: "red",
  GREEN: "green",
  YELLOW: "yellow",
  BLUE: "blue",
  MAGENTA: "magenta",
  CYAN: "cyan",
  WHITE: "white",
  BG_RED: "bgRed",
  BG_GREEN: "bgGreen",
  BG_YELLOW: "bgYellow",
  BG_BLUE: "bgBlue",
  BG_MAGENTA: "bgMagenta",
  BG_CYAN: "bgCyan",
  BG_WHITE: "bgWhite",
});

// Mapping from enum to ANSI codes
const codes = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
};

// Main color function
export function colorText(text, colorEnum) {
  if (!supportsColor || !codes[colorEnum]) return text;
  return `${codes[colorEnum]}${text}${codes.reset}`;
}

// Convenience log function
export function logColor(text, colorEnum) {
  console.log(colorText(text, colorEnum));
}
