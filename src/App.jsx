import { useEffect, useRef, useState } from 'react';
import { loadImageToUint8Array } from './utils/image-utils.js';
import createImageModule from '@wasm/image_utils.js';

function App() {
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
		console.log(pixels);

		// Allocate memory in WASM
		const ptr = mod._malloc(size);
		mod.HEAPU8.set(pixels, ptr); // Copy data into WASM memory

		// Call C++ function
		mod._invert_image(ptr, size);

		// Copy back modified data
		const modified = new Uint8ClampedArray(mod.HEAPU8.subarray(ptr, ptr + size));

		// Free WASM memory
		mod._free(ptr);

		// Do something with the modified image (e.g. draw to canvas)
		const canvas = document.getElementById('out');
		const ctx = canvas.getContext('2d');
		const imageData = new ImageData(modified, width, height);
		canvas.width = width;
		canvas.height = height;
		ctx.putImageData(imageData, 0, 0);
	};

	return (
		<>
			<input type="file" accept="image/*" onChange={handleFile} />
			<canvas ref={canvasRef} id="out" />
		</>
	);
}

export default App;
