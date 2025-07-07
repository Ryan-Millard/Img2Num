import { useEffect, useRef, useState } from 'react';
import { loadImageToUint8Array } from '@utils/image-utils';
import createImageModule from '@wasm/image_utils';

const WasmImageProcessor = () => {
	const [mod, setMod] = useState(null);
	const canvasRef = useRef(null);

	useEffect(() => {
		createImageModule().then(setMod);
	}, []);

	const handleFile = async (e) => {
		const file = e.target.files[0];
		if (!file || !mod) return;

		const { pixels, width, height } = await loadImageToUint8Array(file);
		const size = pixels.length;

		let ptr;
		try {
			ptr = mod._malloc(size);
			mod.HEAPU8.set(pixels, ptr);
			mod._invert_image(ptr, size);

			const modified = new Uint8ClampedArray(mod.HEAPU8.subarray(ptr, ptr + size));
			const imageData = new ImageData(modified, width, height);

			const canvas = canvasRef.current;
			if (!canvas) return;
			canvas.width = width;
			canvas.height = height;
			canvas.getContext('2d').putImageData(imageData, 0, 0);
		} catch (err) {
			console.error("Image processing failed:", err);
			alert("Something went wrong while processing the image.");
		} finally {
			if (ptr) mod._free(ptr);
		}
	};

	return (
		<div>
			{!mod && <p>Loading...</p>}
			<input type="file" accept="image/*" onChange={handleFile} />
			<canvas ref={canvasRef} id="out" />
		</div>
	);
}

export default WasmImageProcessor;
