import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Cropper } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import styles from './ImageEditModal.module.css';
import { useWasmProcessor } from '@hooks/useWasmProcessor';
import useLinkedList from '@hooks/useLinkedList';

import OrientationControls from './OrientationControls';
import ZoomControls from './ZoomControls';
import AspectRadioOption from './AspectRadioOption';
import ModeSlider from './ModeSlider';
import ModeSelector from './ModeSelector';

const DEFAULT_EDIT_STATE = {
	flipHorizontal: false,
	flipVertical: false,
	saturation: 0,
	brightness: 0,
	contrast: 0,
	hue: 0,
	isInverted: false,
	mode: 'crop',
	aspectChoice: null,
	customWidth: 1,
	customHeight: 1,
};

export default function ImageEditModal({ imageSrc, onApply, onCancel }) {
	const {
		mod,
		fileData,
		editedImageData,
		loadFromFile,
		invertImageColors,
		adjustImageSaturation,
	} = useWasmProcessor();

	const imageHistory = useLinkedList(imageSrc);

	const [editState, setEditState] = useState(DEFAULT_EDIT_STATE);
	const lastSaturationRef = useRef(0);
	const cropperRef = useRef(null);

	const updateState = (key, val) => setEditState(prev => ({ ...prev, [key]: val }));

	const getModeValue = () => {
		const { mode, saturation, brightness, contrast, hue } = editState;
		switch (mode) {
			case 'saturation': return saturation;
			case 'brightness': return brightness;
			case 'contrast': return contrast;
			case 'hue': return hue;
			default: return 0;
		}
	};

	const aspect = useMemo(() => {
		const { aspectChoice, customWidth, customHeight } = editState;
		return aspectChoice === 'custom' ? customWidth / customHeight : aspectChoice;
	}, [editState.aspectChoice, editState.customWidth, editState.customHeight]);

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
		setEditState(DEFAULT_EDIT_STATE);
		(async () => {
			const res = await fetch(imageSrc);
			const blob = await res.blob();
			await loadFromFile(new File([blob], 'inverted.png', { type: blob.type }));
		})();
	}, [imageSrc]);

	useEffect(() => {
		if (editedImageData?.url) imageHistory.set(editedImageData.url);
	}, [editedImageData?.url]);

	useEffect(() => {
		if (!fileData) return;
		const { mode, saturation } = editState;
		if (mode === 'invert') {
			invertImageColors();
		} else if (mode === 'saturation') {
			let newFactor = 1 + (saturation / 100);
			if (lastSaturationRef.current !== 0) {
				const oldFactor = 1 + (lastSaturationRef.current / 100);
				const undoOldFactor = 1 / oldFactor;
				const currentFactor = 1 + (saturation / 100);
				newFactor = currentFactor * undoOldFactor;
			}
			adjustImageSaturation(newFactor);
			lastSaturationRef.current = saturation;
		}
	}, [editState.isInverted, editState.saturation]);

	useEffect(() => {
		const cropper = cropperRef.current;
		if (!cropper) return;
		if (editState.flipHorizontal) {
			cropper.transformImage({ flip: { horizontal: true } });
		}
	}, [editState.flipHorizontal]);

	useEffect(() => {
		const cropper = cropperRef.current;
		if (!cropper) return;
		if (editState.flipVertical) {
			cropper.transformImage({ flip: { vertical: true } });
		}
	}, [editState.flipVertical]);

	const handleRangeChange = (event) => {
		updateState(editState.mode, Number(event.target.value));
	};

	return (
		<div className={styles.overlay}>
			<div className={styles.modal}>
				<h2>Crop Image</h2>

				<div className={styles.imageControls}>
					<OrientationControls
						flipHorizontal={editState.flipHorizontal}
						flipVertical={editState.flipVertical}
						setFlipHorizontal={val => updateState('flipHorizontal', val)}
						setFlipVertical={val => updateState('flipVertical', val)}
						cropperRef={cropperRef}
					/>
					<ZoomControls cropperRef={cropperRef} />
				</div>

				<Cropper
					ref={cropperRef}
					src={imageHistory.value}
					className={styles.cropper}
					stencilProps={stencilProps}
					backgroundClass={styles.cropperBackground}
					disabled={editState.mode !== 'crop'}
				/>

				{editState.mode === 'crop' ? (
					<AspectRadioOption
						aspectChoice={editState.aspectChoice}
						customWidth={editState.customWidth}
						customHeight={editState.customHeight}
						setAspectChoice={val => updateState('aspectChoice', val)}
						setCustomWidth={val => updateState('customWidth', val)}
						setCustomHeight={val => updateState('customHeight', val)}
					/>
				) : editState.mode !== 'invert' && (
					<ModeSlider value={getModeValue()} onChange={handleRangeChange} />
				)}

				<ModeSelector
					mode={editState.mode}
					setMode={val => updateState('mode', val)}
					isInverted={editState.isInverted}
					setIsInverted={val => updateState('isInverted', val)}
				/>

				<div className={styles.controls}>
					<button className="button" onClick={applyCrop}>Apply</button>
					<button className="button" onClick={onCancel}>Cancel</button>
				</div>
			</div>
		</div>
	);
}
