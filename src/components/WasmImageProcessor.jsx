import { useEffect, useState, useId } from 'react';
import { loadImageToUint8Array, uint8ClampedArrayToSVG } from '@utils/image-utils';
import { useWasmWorker } from '@hooks/useWasmWorker';
import GlassCard from '@components/GlassCard';
import styles from './WasmImageProcessor.module.css';
import uploadIcon from '@assets/upload-icon.svg';
import { useNavigate } from 'react-router-dom';
import LoadingHedgehog from '@components/LoadingHedgehog';

const WasmImageProcessor = () => {
	const { gaussianBlur, blackThreshold, kmeans } = useWasmWorker();
	const [originalSrc, setOriginalSrc] = useState(null);
	const [fileData, setFileData] = useState(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const inputId = useId();
	const navigate = useNavigate();

	useEffect(() => {
		const handlePaste = async (e) => {
			const items = e.clipboardData?.items;
			if (!items) return;

			for (const item of items) {
				if (item.type.startsWith('image/')) {
					const file = item.getAsFile();
					await loadOriginal(file);
					break;
				}
			}
		};
		document.addEventListener('paste', handlePaste);
		return () => document.removeEventListener('paste', handlePaste);
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
		if (originalSrc) URL.revokeObjectURL(originalSrc);
		const url = URL.createObjectURL(file);
		setOriginalSrc(url);
		const { pixels, width, height } = await loadImageToUint8Array(file);
		setFileData({ pixels, width, height });
	};

	const processImage = async () => {
		if (!fileData) return;
		const { pixels, width, height } = fileData;

		setIsProcessing(true);
		setProgress(5);

		try {
			// 1) Blur
			setProgress(15);
			const blurred = await gaussianBlur(fileData);
			setProgress(40);

			// 2) Threshold
			const thresholded = await blackThreshold({ ...fileData, pixels: blurred, num_colors: 8 });
			setProgress(65);

			// 3) K-means
			const kmeansed = await kmeans({ ...fileData, pixels: thresholded, num_colors: 8 });
			setProgress(95);

			// final small step: convert to SVG
			const svgString = await uint8ClampedArrayToSVG({ pixels: kmeansed, width, height });
			setProgress(100);

			if (svgString) {
				navigate('/editor', { state: { svg: svgString, imgData: { pixels: kmeansed, width, height } } });
			} else {
				console.error('SVG conversion returned null/undefined');
			}
		} catch (err) {
			console.error(err);
		} finally {
			// keep the sleeping animation visible briefly so the user sees it
			setTimeout(() => {
				setIsProcessing(false);
				setProgress(0);
			}, 800);
		}
	};

	return (
		<label htmlFor={inputId} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
			<GlassCard className={`flex-center flex-column ${styles.dropZone}`}>
				{originalSrc ? (
					<>
						<img src={originalSrc} alt="Original Image" className={styles.preview} />
						{!isProcessing ? (
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
						) : (
							<LoadingHedgehog progress={progress} text={`Processing — ${Math.round(progress)}%`} />
						)}
					</>
				) : (
					<>
						<img src={uploadIcon} alt="Upload Icon" className={styles.uploadIcon} />
						<p className={`text-center ${styles.dragDropText}`}>Drag & Drop or <span className="anchor-style">Choose File</span></p>
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
