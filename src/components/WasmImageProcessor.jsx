import { useEffect, useRef, useState, useId } from 'react';
import { loadImageToUint8Array } from '@utils/image-utils';
import createImageModule from '@wasm/image_utils';
import ProcessedImageDisplay from './ProcessedImageDisplay';
import styles from './WasmImageProcessor.module.css';
import LetterGlitch from './LetterGlitch';

const WasmImageProcessor = () => {
	const [mod, setMod] = useState(null);
	const [originalSrc, setOriginalSrc] = useState(null);
	const [fileData, setFileData] = useState(null);
	const [editedImageData, setEditedImageData] = useState(null);
	const canvasRef = useRef(null);
	const inputId = useId();

	useEffect(() => {
		createImageModule().then(setMod);

		const handlePaste = async (e) => {
			const items = e.clipboardData?.items;
			if (!items) return;

			for (const item of items) {
				if (item.type.startsWith("image/")) {
					const file = item.getAsFile();
					await loadOriginal(file);
					break;
				}
			}
		};
		document.addEventListener("paste", handlePaste);
		return () => document.removeEventListener("paste", handlePaste);
	}, []);

	const handleDrop = async (e) => {
		e.preventDefault();
		const file = e.dataTransfer.files[0];
		await loadOriginal(file);
	};

	const handleSelect = async (e) => {
		const file = e.target.files[0];
		await loadOriginal(file);
	};

	const loadOriginal = async (file) => {
		if (!file) return;
		const url = URL.createObjectURL(file);
		setOriginalSrc(url);
		const { pixels, width, height } = await loadImageToUint8Array(file);
		setFileData({ pixels, width, height });
	};

	const processImage = () => {
		if (!fileData || !mod) return;
		const { pixels, width, height } = fileData;
		const size = pixels.length;
		let ptr = null;
		try {
			ptr = mod._malloc(size);
			mod.HEAPU8.set(pixels, ptr);
			mod._invert_image(ptr, size);

			const modified = new Uint8ClampedArray(mod.HEAPU8.subarray(ptr, ptr + size));
			setEditedImageData({ pixels: modified, width, height });
		} catch (err) {
			console.error('Processing failed', err);
			alert('Error during image processing');
		} finally {
			if (ptr) mod._free(ptr);
		}
	};

	return (
		<div className={styles.container}>
			{!mod && <p>Loading WASM Engine...</p>}
			<label htmlFor={inputId} className={styles.dropZone}
				onDrop={handleDrop}
				onDragOver={(e) => e.preventDefault()}
			>
				<LetterGlitch glitchSpeed={50} className={styles.letterGlitch} />

				{originalSrc ? (
					<img src={originalSrc} alt="Original" className={styles.preview} />
				) : (
					<>
						<p className={`text-center ${styles.dragDropText}`}>Drag & Drop or <span>Choose File</span></p>
					</>
				)}

				{/* Always keep input in the DOM to allow new image click selections */}
				<input
					id={inputId}
					type="file"
					accept="image/*"
					onChange={handleSelect}
					hidden
				/>
			</label>

			{originalSrc && (
				<button className="button" onClick={processImage}>
					OK
				</button>
			)}

			{editedImageData && (
				<ProcessedImageDisplay data={editedImageData} />
			)}
		</div>
	);
};

export default WasmImageProcessor;
