import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Cropper } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import styles from './ImageEditModal.module.css';
import { useWasmProcessor } from '@hooks/useWasmProcessor';

import OrientationControls from './OrientationControls';
import ZoomControls from './ZoomControls';
import AspectRadioOption from './AspectRadioOption';
import ModeSlider from './ModeSlider';
import ModeSelector from './ModeSelector';

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
	const [flipHorizontal, setFlipHorizontal] = useState(false);
	const [flipVertical, setFlipVertical] = useState(false);
	const [saturation, setSaturation] = useState(0);
	const lastSaturationRef = useRef(0);
	const [brightness, setBrightness] = useState(0);
	const [contrast, setContrast] = useState(0);
	const [hue, setHue] = useState(0);
	const [isInverted, setIsInverted] = useState(false);
	const [mode, setMode] = useState('crop');
	const cropperRef = useRef(null);

	const getModeString = useMemo(() => mode.toString(), [mode]);
	const getModeValue = () => {
		switch(getModeString) {
			case 'saturation': return saturation;
			case 'brightness': return brightness;
			case 'contrast': return contrast;
			case 'hue': return hue;
			default: return 0;
		}
	};

	const aspect = useMemo(() => (
		aspectChoice === 'custom' ? customWidth / customHeight : aspectChoice
	), [aspectChoice, customWidth, customHeight]);

	const stencilProps = useMemo(() => {
		const base = { resizable: true, movable: true };
		return aspect ? { ...base, aspectRatio: aspect } : base;
	}, [aspect]);

	const applyCrop = useCallback(async () => {
		const cropper = cropperRef.current;
		if (!cropper) return;
		const canvas = cropper.getCanvas();
		if (!canvas) return;
		onApply(canvas.toDataURL());
	}, [onApply]);

	useEffect(() => {
		setAspectChoice(null);
		setFlipHorizontal(false);
		setFlipVertical(false);
		(async () => {
			const res = await fetch(imageSource);
			const blob = await res.blob();
			await loadFromFile(new File([blob], 'inverted.png', { type: blob.type }));
		})();
	}, [imageSource]);

	useEffect(() => {
		if (editedImageData?.url) setImageSource(editedImageData.url);
	}, [editedImageData?.url]);

	useEffect(() => {
		if (!fileData) return;
		if (mode === 'invert') {
			invertImageColors();
		} else if (mode === 'saturation') {
			let newFactor;
			if (lastSaturationRef.current !== 0) {
				const oldFactor = 1 + (lastSaturationRef.current / 100);
				const undoOldFactor = 1 / oldFactor;
				const currentFactor = 1 + (saturation / 100);
				newFactor = currentFactor * undoOldFactor;
			} else {
				newFactor = 1 + (saturation / 100);
			}
			adjustImageSaturation(newFactor);
			lastSaturationRef.current = saturation;
		}
	}, [isInverted, saturation]);

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

	const handleRangeChange = async (event) => {
		switch(getModeString) {
			case 'saturation': setSaturation(event.target.value); break;
			case 'brightness': setBrightness(event.target.value); break;
			case 'contrast': setContrast(event.target.value); break;
			case 'hue': setHue(event.target.value); break;
			default: break;
		}
	};

	return (
		<div className={styles.overlay}>
			<div className={styles.modal}>
				<h2>Crop Image</h2>

				<div className={styles.imageControls}>
					<OrientationControls
						flipHorizontal={flipHorizontal}
						flipVertical={flipVertical}
						setFlipHorizontal={setFlipHorizontal}
						setFlipVertical={setFlipVertical}
						cropperRef={cropperRef}
					/>
					<ZoomControls cropperRef={cropperRef} />
				</div>

				<Cropper
					ref={cropperRef}
					src={imageSource}
					className={styles.cropper}
					stencilProps={stencilProps}
					backgroundClass={styles.cropperBackground}
					disabled={mode !== 'crop'}
				/>

				{mode === 'crop'
					? <AspectRadioOption
						aspectChoice={aspectChoice}
						customWidth={customWidth}
						customHeight={customHeight}
						setAspectChoice={setAspectChoice}
						setCustomWidth={setCustomWidth}
						setCustomHeight={setCustomHeight}
					/>
					: mode !== 'invert' && (
						<ModeSlider value={getModeValue()} onChange={handleRangeChange} />
					)}

				<ModeSelector
					mode={mode}
					setMode={setMode}
					isInverted={isInverted}
					setIsInverted={setIsInverted}
				/>

				<div className={styles.controls}>
					<button className="button" onClick={applyCrop}>Apply</button>
					<button className="button" onClick={onCancel}>Cancel</button>
				</div>
			</div>
		</div>
	);
}
