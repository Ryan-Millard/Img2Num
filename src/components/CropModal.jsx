import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import styles from './CropModal.module.css';

// Predefined aspect options
const ASPECT_PRESETS = [
	{ label: 'Free', value: null },
	{ label: '1:1', value: 1 },
	{ label: '4:3', value: 4 / 3 },
	{ label: '16:9', value: 16 / 9 },
	{ label: 'Custom', value: 'custom' },
];

export default function CropModal({ imageSrc, onApply, onCancel }) {
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [aspectChoice, setAspectChoice] = useState(null);
	const [customWidth, setCustomWidth] = useState(1);
	const [customHeight, setCustomHeight] = useState(1);
	const [cropAreaPixels, setCropAreaPixels] = useState(null);

	// Compute actual aspect value from choice
	const aspect =
		aspectChoice === 'custom'
			? customWidth / customHeight
			: aspectChoice;

	const onCropComplete = useCallback((_, croppedAreaPixels) => {
		setCropAreaPixels(croppedAreaPixels);
	}, []);

	const applyCrop = useCallback(async () => {
		try {
			const canvas = document.createElement('canvas');
			const image = await createImage(imageSrc);
			const { width, height } = cropAreaPixels;
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext('2d');
			ctx.drawImage(
				image,
				cropAreaPixels.x,
				cropAreaPixels.y,
				width,
				height,
				0,
				0,
				width,
				height
			);
			const url = canvas.toDataURL();
			onApply(url);
		} catch (e) {
			console.error('Crop failed', e);
		}
	}, [cropAreaPixels, imageSrc, onApply]);

	// Helper to load an image
	function createImage(url) {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.addEventListener('load', () => resolve(img));
			img.addEventListener('error', error => reject(error));
			img.setAttribute('crossOrigin', 'anonymous');
			img.src = url;
		});
	}

	// Ensure initial preset is Free
	useEffect(() => {
		setAspectChoice(null);
	}, [imageSrc]);

	return (
		<div className={styles.overlay}>
			<div className={styles.modal}>
				<h2>Crop Image</h2>

				<div className={styles.radioGroup}>
					{ASPECT_PRESETS.map(opt => (
						<label key={opt.label} className={styles.radioLabel}>
							<input
								type="radio"
								name="aspect"
								value={opt.value === null ? '' : opt.value}
								checked={aspectChoice === opt.value}
								onChange={() => setAspectChoice(opt.value)}
							/>
							{opt.label}
						</label>
					))}
				</div>

				{aspectChoice === 'custom' && (
					<div className={styles.customInputs}>
						<label>
							Width ratio:
							<input
								type="number"
								min="1"
								step="0.1"
								value={customWidth}
								onChange={e => setCustomWidth(Number(e.target.value) || 1)}
							/>
						</label>
						<label>
							Height ratio:
							<input
								type="number"
								min="1"
								step="0.1"
								value={customHeight}
								onChange={e => setCustomHeight(Number(e.target.value) || 1)}
							/>
						</label>
					</div>
				)}

				<div className={styles.cropContainer}>
					<Cropper
						image={imageSrc}
						crop={crop}
						zoom={zoom}
						aspect={aspect}
						onCropChange={setCrop}
						onZoomChange={setZoom}
						onCropComplete={onCropComplete}
					/>
				</div>

				<div className={styles.controls}>
					<button className="button" onClick={applyCrop}>Apply</button>
					<button className="button" onClick={onCancel}>Cancel</button>
				</div>
			</div>
		</div>
	);
}
