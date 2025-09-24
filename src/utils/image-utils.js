// Try this import instead
import ImageTracer from 'imagetracerjs';

// Or if that doesn't work, try:
// const ImageTracer = require('imagetracerjs');

// Add this debug line to verify the import
console.log('ImageTracer object:', ImageTracer);

export function loadImageToUint8Array(file) {
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement('canvas');
			canvas.width = img.width;
			canvas.height = img.height;

			const ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0);
			const { data } = ctx.getImageData(0, 0, img.width, img.height); // RGBA

			resolve({ pixels: data, width: img.width, height: img.height });
		};
		img.src = URL.createObjectURL(file);
	});
}

export const uint8ClampedArrayToSVG = async ({ pixels, width, height }) => {
	console.log('Starting SVG conversion...', { width, height, pixelsLength: pixels.length });

	// Force full alpha
	for (let i = 3; i < pixels.length; i += 4) pixels[i] = 255;

	// Create a canvas
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');

	try {
		const imageData = new ImageData(pixels, width, height);
		ctx.putImageData(imageData, 0, 0);
		console.log('Canvas created and image data set');

		// Use the synchronous method instead
		console.log('About to call ImageTracer.imagedataToSVG...');
		const svgString = ImageTracer.imagedataToSVG(imageData, {
			pathomit: 50, // omit paths smaller than 20 pixels
		});

		console.log('ImageTracer completed! SVG length:', svgString?.length);
		return svgString;

	} catch (error) {
		console.error('Error in SVG conversion:', error);
		return null;
	}
};
