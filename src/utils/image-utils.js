export function loadImageToUint8Array(file) {
	const p = new Promise((resolve) => {
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
	return p;
}

export async function getCroppedImg(imageSrc, pixelCrop) {
	const image = await new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => resolve(img);
		img.onerror = (err) => reject(err);
		img.src = imageSrc;
	});

	const canvas = document.createElement('canvas');
	canvas.width = pixelCrop.width;
	canvas.height = pixelCrop.height;
	const ctx = canvas.getContext('2d');

	ctx.drawImage(
		image,
		pixelCrop.x,
		pixelCrop.y,
		pixelCrop.width,
		pixelCrop.height,
		0,
		0,
		pixelCrop.width,
		pixelCrop.height
	);

	return new Promise((resolve) => {
		canvas.toBlob((blob) => {
			const url = URL.createObjectURL(blob);
			resolve(url);
		}, 'image/png');
	});
}
