import { useEffect, useRef, useState, useId } from 'react';
import { loadImageToUint8Array } from '@utils/image-utils';
import { useWasmWorker } from '@hooks/useWasmWorker';
import ProcessedImageDisplay from './ProcessedImageDisplay';
import styles from './WasmImageProcessor.module.css';
import LetterGlitch from './LetterGlitch';

const WasmImageProcessor = () => {
	const { call } = useWasmWorker();
	const [originalSrc, setOriginalSrc] = useState(null);
	const [fileData, setFileData] = useState(null);
	const [editedImageData, setEditedImageData] = useState(null);
	const canvasRef = useRef(null);
	const inputId = useId();

	useEffect(() => {
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
		if (originalSrc) URL.revokeObjectURL(originalSrc); // cleanup - prevent memory leaks
		const url = URL.createObjectURL(file);
		setOriginalSrc(url);
		const { pixels, width, height } = await loadImageToUint8Array(file);
		setFileData({ pixels, width, height });
	};

	const processImage = async () => {
		if (!fileData) return;
		const { pixels, width, height } = fileData;

		try {
			const sigma_pixels = width * 0.005; // ~0.5% of width
			const num_colors = 8;
			let newPixels = pixels;

			const start = performance.now();
			// console.log(`Starting forward ms: ${start}`);

			// Run Gaussian blur
			newPixels = ( await call(
				'gaussian_blur_fft',
				{ pixels: newPixels, width, height, sigma_pixels },
				['pixels']
			) ).output.pixels;

			// Run Thresholding
			newPixels = ( await call(
				'black_threshold_image',
				{ pixels: newPixels, width, height, num_colors },
				['pixels']
			) ).output.pixels;

			// Run k-means on blurred image
			newPixels = ( await call(
				'kmeans_clustering',
				{ pixels: newPixels, width, height, num_colors, max_iter: 100 },
				['pixels']
			) ).output.pixels;

			// console.log(`WASM processing took ${performance.now() - start}ms`);
			// console.log('fileData pixels sample (after forward):', kmeansResult.output.pixels.slice(0, 16));

			setEditedImageData({ pixels: newPixels, width, height });
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<div className={styles.container}>
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
