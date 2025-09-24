import ImageTracer from 'imagetracerjs';

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

		const svgString = ImageTracer.imagedataToSVG(imageData, {
			ltres: 0,
			rightangleenhance: false,
		});

		return svgString;

	} catch (error) {
		console.error('Error in SVG conversion:', error);
		return null;
	}
};
