import { useEffect, useState } from 'react';
import { loadImageToUint8Array } from '@utils/image-utils';
import createImageModule from '@wasm/image_utils';

export function useWasmProcessor() {
	const [mod, setMod] = useState(null);
	const [fileData, setFileData] = useState(null);
	const [editedImageData, setEditedImageData] = useState(null);

	useEffect(() => {
		createImageModule().then(setMod);
	}, []);

	async function loadFromFile(file) {
		if (!file) return;
		const url = URL.createObjectURL(file);
		const { pixels, width, height } = await loadImageToUint8Array(file);
		setFileData({ pixels, width, height, url });
	}

	function invertImageColors() {
		if (!fileData || !mod) return;
		const { pixels, width, height } = fileData;
		const size = pixels.length;
		let ptr = null;
		try {
			ptr = mod._malloc(size);
			mod.HEAPU8.set(pixels, ptr);
			mod._invert_image(ptr, size);
			const modified = new Uint8ClampedArray(mod.HEAPU8.subarray(ptr, ptr + size));

			// Draw into a temporary canvas and get a data URL
			const imageData = new ImageData(modified, width, height);
			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext('2d');
			ctx.putImageData(imageData, 0, 0);
			const url = canvas.toDataURL();

			setEditedImageData({ pixels: modified, width, height, url });
		} catch (err) {
			console.error(err);
		} finally {
			if (ptr) mod._free(ptr);
		}
	}

	return {
		mod,
		fileData,
		editedImageData,
		loadFromFile,
		invertImageColors,
	};
}
