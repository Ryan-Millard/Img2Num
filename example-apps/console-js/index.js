import { writeFileSync } from 'fs';
import { imageToSvg } from 'img2num';

// 1x1 white pixel PNG for testing
const pixels = new Uint8ClampedArray([255, 255, 255, 255]);
const width = 1;
const height = 1;

console.log('Running img2num in Node.js...');
const { svg } = await imageToSvg({ pixels, width, height });
console.log('SVG output:', svg);
writeFileSync('output.svg', svg);
console.log('Saved to output.svg');