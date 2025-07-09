import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Cropper } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import styles from './CropModal.module.css';
import flipHorizontalIcon from '@assets/flip-horizontal-icon.svg';
import flipVerticalIcon from '@assets/flip-vertical-icon.svg';
import zoomInIcon from '@assets/zoom-in-icon.svg';
import zoomOutIcon from '@assets/zoom-out-icon.svg';

// Predefined aspect options
const ASPECT_PRESETS = [
	{ label: 'Free', value: null },
	{ label: '1:1', value: 1 },
	{ label: '4:3', value: 4 / 3 },
	{ label: '16:9', value: 16 / 9 },
	{ label: 'Custom', value: 'custom' },
];

// Memoized radio option component
const AspectRadioOption = React.memo(({ option, isChecked, onChange }) => (
	<label className={styles.radioLabel}>
		<input
			type="radio"
			name="aspect"
			value={option.value === null ? '' : option.value}
			checked={isChecked}
			onChange={onChange}
		/>
		{option.label}
	</label>
));

export default function CropModal({ imageSrc, onApply, onCancel }) {
	const [aspectChoice, setAspectChoice] = useState(null);
	const [customWidth, setCustomWidth] = useState(1);
	const [customHeight, setCustomHeight] = useState(1);
	const [rotation, setRotation] = useState(0);
	const [flipHorizontal, setFlipHorizontal] = useState(false);
	const [flipVertical, setFlipVertical] = useState(false);
	const cropperRef = useRef(null);

	// Compute actual aspect ratio
	const aspect = useMemo(() => (
		aspectChoice === 'custom' ? customWidth / customHeight : aspectChoice
	), [aspectChoice, customWidth, customHeight]);

	// Stencil props
	const stencilProps = useMemo(() => {
		const base = { resizable: true, movable: true };
		return aspect ? { ...base, aspectRatio: aspect } : base;
	}, [aspect]);

	// Apply cropping
	const applyCrop = useCallback(async () => {
		const cropper = cropperRef.current;
		if (!cropper) return;
		const canvas = cropper.getCanvas();
		if (!canvas) return;
		onApply(canvas.toDataURL());
	}, [onApply]);

	// Reset when image changes
	useEffect(() => {
		setAspectChoice(null);
		setRotation(0);
		setFlipHorizontal(false);
		setFlipVertical(false);
	}, [imageSrc]);

	// Sync transformation on flip changes
	const transformCropperImage = useCallback((data) => {
		cropper.transformImage({
			data
		});
	}, []);
	useEffect(() => {
		const cropper = cropperRef.current;
		if (!cropper) return;
		// NOTE: Flips only occur if flip value is true.
		cropper.transformImage({ flip: { horizontal: true, }, });
	}, [flipHorizontal]);
	useEffect(() => {
		const cropper = cropperRef.current;
		if (!cropper) return;
		// NOTE: Flips only occur if flip value is true.
		cropper.transformImage({ flip: { vertical: true, }, });
	}, [flipVertical]);

	// Handlers
	const handleAspectChange = useCallback((val) => setAspectChoice(val), []);
	const handleFlipHorizontal = useCallback(() => setFlipHorizontal(prev => !prev), []);
	const handleFlipVertical = useCallback(() => setFlipVertical(prev => !prev), []);
	const handleCustomWidthChange = useCallback(e => setCustomWidth(Number(e.target.value) || 1), []);
	const handleCustomHeightChange = useCallback(e => setCustomHeight(Number(e.target.value) || 1), []);
	// Util for next 2 handlers
	const rotateCropper = useCallback((rotation) => {
		const cropper = cropperRef.current;
		if (!cropper) return;
		cropper.rotateImage(rotation);
	}, []);
	const handleRotateLeft = useCallback(() => {
		setRotation(prev => (prev - 90) % 360);
		rotateCropper(-90);
	}, []);
	const handleRotateRight = useCallback(() => {
		setRotation(prev => (prev + 90) % 360);
		rotateCropper(+90);
	}, []);
	// Util for next 2 handlers
	const zoomCropper = useCallback((zoomVal) => {
		const cropper = cropperRef.current;
		if (!cropper) return;
		cropper.zoomImage(zoomVal);
	}, []);
	const handleZoomIn = useCallback(() => {
		zoomCropper(1.5);
	}, []);
	const handleZoomOut = useCallback(() => {
		zoomCropper(0.75);
	}, []);

	const radioOptions = useMemo(() => 
		ASPECT_PRESETS.map(opt => (
			<AspectRadioOption
				key={opt.label}
				option={opt}
				isChecked={aspectChoice === opt.value}
				onChange={() => handleAspectChange(opt.value)}
			/>
		))
	, [aspectChoice, handleAspectChange]);

	return (
		<div className={styles.overlay}>
			<div className={styles.modal}>
				<h2>Crop Image</h2>
				<div className={styles.radioGroup}>{radioOptions}</div>

				{aspectChoice === 'custom' && (
					<div className={styles.customInputs}>
						<label>
							Width ratio:
							<input type="number" min="1" step="0.1" value={customWidth} onChange={handleCustomWidthChange} />
						</label>
						<label>
							Height ratio:
							<input type="number" min="1" step="0.1" value={customHeight} onChange={handleCustomHeightChange} />
						</label>
					</div>
				)}

				<div className={styles.imageControls}>
					<div className={styles.controlsContainer}>
						<button
							className={`${styles.controlButton} ${flipHorizontal ? styles.active : ''}`}
							onClick={handleFlipHorizontal}
							title="Flip Horizontal"
						>
							<img src={flipHorizontalIcon} alt="Flip Horizontal" style={{ width: 20 }} />
						</button>
						<button
							className={`${styles.controlButton} ${flipVertical ? styles.active : ''}`}
							onClick={handleFlipVertical}
							title="Flip Vertical"
						>
							<img src={flipVerticalIcon} alt="Flip Vertical" style={{ width: 20 }} />
						</button>
						<button
							className={`${styles.controlButton} ${styles.rotateButton}`}
							onClick={handleRotateLeft}
							title="Rotate Left 90°"
						>
							↺
						</button>
						<button
							className={`${styles.controlButton} ${styles.rotateButton}`}
							onClick={handleRotateRight}
							title="Rotate Right 90°"
						>
							↻
						</button>
					</div>

					<div className={styles.controlsContainer}>
						<button
							className={styles.controlButton}
							onClick={handleZoomIn}
							title="Zoom In"
						>
							<img src={zoomInIcon} alt="Zoom In" />
						</button>
						<button
							className={styles.controlButton}
							onClick={handleZoomOut}
							title="Zoom Out"
						>
							<img src={zoomOutIcon} alt="Zoom Out" />
						</button>
					</div>
				</div>

				<Cropper
					ref={cropperRef}
					src={imageSrc}
					className={styles.cropper}
					stencilProps={stencilProps}
					backgroundClass={styles.cropperBackground}
				/>

				<div className={styles.controls}>
					<button className="button" onClick={applyCrop}>Apply</button>
					<button className="button" onClick={onCancel}>Cancel</button>
				</div>
			</div>
		</div>
	);
}

