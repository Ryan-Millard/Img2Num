import { useEffect, useRef } from 'react';
import styles from './ProcessedImageDisplay.module.css';
import LetterGlitch from './LetterGlitch';

const ProcessedImageDisplay = ({ data, className = '' }) => {
	const { pixels, width, height } = data;
	const canvasRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');
		const imageData = new ImageData(pixels, width, height);
		ctx.putImageData(imageData, 0, 0);
	}, [pixels, width, height]);

	return (
		<div className={`${styles.wrapper} ${className}`}>
			<LetterGlitch glitchSpeed={50} className={styles.letterGlitch} />

			<canvas ref={canvasRef} className={styles.canvas} />
		</div>
	);
};

export default ProcessedImageDisplay;
