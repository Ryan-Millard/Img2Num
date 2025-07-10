import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Cropper } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import styles from './ImageEditModal.module.css';
import { useWasmProcessor } from '../hooks/useWasmProcessor';

// Icons
import flipHorizontalIcon from '@assets/flip-horizontal-icon.svg';
import flipVerticalIcon from '@assets/flip-vertical-icon.svg';
import zoomInIcon from '@assets/zoom-in-icon.svg';
import zoomOutIcon from '@assets/zoom-out-icon.svg';
import cropIcon from '@assets/crop-icon.svg';
import saturationIcon from '@assets/saturation-icon.svg';
import brightnessIcon from '@assets/brightness-icon.svg';
import hueIcon from '@assets/hue-icon.svg';
import contrastIcon from '@assets/contrast-icon.svg';
import invertIcon from '@assets/invert-icon.svg';

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

export default function ImageEditModal({ imageSrc, onApply, onCancel }) {
	const {
		mod,
		fileData,
		editedImageData,
		loadFromFile,
		invertImageColors,
		adjustImageSaturation
	} = useWasmProcessor();
	const [imageSource, setImageSource] = useState(imageSrc);

	const [aspectChoice, setAspectChoice] = useState(null);
	const [customWidth, setCustomWidth] = useState(1);
	const [customHeight, setCustomHeight] = useState(1);

	// Image orientation
	const [rotation, setRotation] = useState(0);
	const [flipHorizontal, setFlipHorizontal] = useState(false);
	const [flipVertical, setFlipVertical] = useState(false);

	// Image colours (modes)
	const [saturation, setSaturation] = useState(0);
	const lastSaturationRef = useRef(0);
	const [brightness, setBrightness] = useState(0);
	const [contrast, setContrast] = useState(0);
	const [hue, setHue] = useState(0);
	// Inversion (mode)
	const [isInverted, setIsInverted] = useState(false);

	// Action being done to image
	const [mode, setMode] = useState('crop');
	const getModeString = useMemo(() => mode.toString(), [mode]);
	const getModeValue = () => {
		switch(getModeString) {
			case 'saturation':
				return saturation;
			case 'brightness':
				return brightness;
			case 'contrast':
				return contrast;
			case 'hue':
				return hue;
			default:
				return 0;
				break;
		}
	};

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

		const setUpFileData = async() => {
			// fetch the current image
			const res = await fetch(imageSource);
			const blob = await res.blob();
			// load into WASM (and wait for fileData to update)
			await loadFromFile(new File([blob], 'inverted.png', { type: blob.type }));
		};
		setUpFileData();
	}, [imageSource]);

	// Sync whenever we get a new inverted URL
	useEffect(() => {
		if (editedImageData?.url) { setImageSource(editedImageData.url); }
	}, [editedImageData?.url]);

	useEffect(() => {
		if (!fileData) { return; }

		if (mode === 'invert') {
			invertImageColors();
		}
		else if (mode === 'saturation') {
			// Only calculate undo factor if there was a previous saturation applied
			let newFactor;
			if (lastSaturationRef.current !== 0) {
				const oldFactor = 1 + (lastSaturationRef.current / 100);
				const undoOldFactor = 1 / oldFactor;
				const currentFactor = 1 + (saturation / 100);
				newFactor = currentFactor * undoOldFactor; // Fixed math too
			} else {
				// First time applying saturation, no need to undo
				newFactor = 1 + (saturation / 100);
			}

			console.log(newFactor);
			adjustImageSaturation(newFactor);

			// Update the ref to track the current saturation value
			lastSaturationRef.current = saturation;
		}
	}, [isInverted, saturation]);

	// Sync transformation on flip changes
	const transformCropperImage = useCallback((data) => {
		cropper.transformImage({ data });
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
	const handleRangeChange = async (event) => {
		switch(getModeString) {
			case 'saturation':
				setSaturation(event.target.value);
				break;
			case 'brightness':
				setBrightness(event.target.value);
				break;
			case 'contrast':
				setContrast(event.target.value);
				break;
			case 'hue':
				setHue(event.target.value);
				break;
			default:
				break;
		}
	};

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
					src={imageSource}
					className={styles.cropper}
					stencilProps={stencilProps}
					backgroundClass={styles.cropperBackground}
					disabled={mode !== 'crop'}
				/>

				{mode === 'crop' && (
					<div className={styles.radioGroup}>
						{radioOptions}
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
					</div>
				) || mode !== 'invert' && (
					<input
						type="range"
						min="-99"
						max="100"
						step="1"
						value={getModeValue()}
						onChange={handleRangeChange}
					/>
				)}
				<div className={styles.imageControls}>
					<div className={styles.flipControls}>
						<button
							className={`${styles.controlButton} ${mode === 'crop' ? styles.active : ''}`}
							onClick={() => setMode('crop')}
							title="Crop"
						>
							<img src={cropIcon} alt="Flip Horizontal" style={{ width: 20 }} />
						</button>
					</div>
					<div className={styles.flipControls}>
						<button
							className={`${styles.controlButton} ${mode === 'saturation' ? styles.active : ''}`}
							onClick={() => setMode('saturation')}
							title="Saturation"
						>
							<img src={saturationIcon} alt="Saturation" style={{ width: 20 }} />
						</button>
					</div>
					<div className={styles.flipControls}>
						<button
							className={`${styles.controlButton} ${mode === 'brightness' ? styles.active : ''}`}
							onClick={() => setMode('brightness')}
							title="Brightness"
						>
							<img src={brightnessIcon} alt="Brightness" style={{ width: 20 }} />
						</button>
					</div>
					<div className={styles.flipControls}>
						<button
							className={`${styles.controlButton} ${mode === 'contrast' ? styles.active : ''}`}
							onClick={() => setMode('contrast')}
							title="Contrast"
						>
							<img src={contrastIcon} alt="Contrast" style={{ width: 20 }} />
						</button>
					</div>
					<div className={styles.flipControls}>
						<button
							className={`${styles.controlButton} ${mode === 'hue' ? styles.active : ''}`}
							onClick={() => setMode('hue')}
							title="Hue"
						>
							<img src={hueIcon} alt="Hue" style={{ width: 20 }} />
						</button>
					</div>
					<div className={styles.flipControls}>
						<button
							className={`${styles.controlButton} ${isInverted ? styles.active : ''}`}
							onClick={async () => {
								setMode('invert');
								setIsInverted(prev => !prev);
							}}
							title="Invert Colors"
						>
							<img src={invertIcon} alt="Invert Colors" style={{ width: 20 }} />
						</button>
					</div>
				</div>

				<div className={styles.controls}>
					<button className="button" onClick={applyCrop}>Apply</button>
					<button className="button" onClick={onCancel}>Cancel</button>
				</div>
			</div>
		</div>
	);
}

