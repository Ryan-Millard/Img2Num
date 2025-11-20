import { useEffect, useState, useId } from 'react';
import { loadImageToUint8Array, uint8ClampedArrayToSVG } from '@utils/image-utils';
import { useWasmWorker } from '@hooks/useWasmWorker';
import GlassCard from '@components/GlassCard';
import styles from './WasmImageProcessor.module.css';
import uploadIcon from '@assets/upload-icon.svg';
import { useNavigate } from 'react-router-dom';

const WasmImageProcessor = () => {
	const { gaussianBlur, blackThreshold, kmeans } = useWasmWorker();
	const [originalSrc, setOriginalSrc] = useState(null);
	const [fileData, setFileData] = useState(null);
	const inputId = useId();
	const navigate = useNavigate();

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
			//Process image:
			//1. Blur to reduce noise in provided image - helps in step 3 since K-Means is sensitive to noise
			//2. Threshold colors to reduce total number of colors to 8
			//3. Run K-Means to detect color clusters based on the 8 colors we have limited it to
			const newPixels = await gaussianBlur(fileData)
				.then(p => blackThreshold({ ...fileData, pixels: p, num_colors: 8 }))
				.then(p => kmeans({ ...fileData, pixels: p, num_colors: 8 }));

			// Convert result to SVG to allow coloring-in
			const svgString = await uint8ClampedArrayToSVG({ pixels: newPixels, width, height });
			if (svgString) {
				navigate("/editor", {
					state: { svg: svgString, imgData: { pixels: newPixels, width, height } }
				});
			} else {
				console.error('SVG conversion returned null/undefined');
			}
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<label htmlFor={inputId}
			onDrop={handleDrop}
			onDragOver={(e) => e.preventDefault()}
		>
			<GlassCard className={`flex-center flex-column ${styles.dropZone}`}>
				{originalSrc ? (
					<>
						<img src={originalSrc} alt="Original Image" className={styles.preview} />
						<button
							className="uppercase button"
							onClick={(e) => {
								e.stopPropagation();
								processImage();
							}}
							onTouchStart={(e) => e.stopPropagation()}
						>
							Ok
						</button>
					</>
				) : (
					<>
						<img src={uploadIcon} alt="Upload Icon" className={styles.uploadIcon} />
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
			</GlassCard>
		</label>
	);
};

export default WasmImageProcessor;
