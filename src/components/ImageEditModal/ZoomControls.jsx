import React, { useCallback } from 'react';
import styles from './ImageEditModal.module.css';
import zoomInIcon from '@assets/icons/zoom-in-icon.svg';
import zoomOutIcon from '@assets/icons/zoom-out-icon.svg';

export default function CropperControls({ cropperRef }) {
	const zoomCropper = useCallback((zoomVal) => {
		const cropper = cropperRef.current;
		if (!cropper) return;
		cropper.zoomImage(zoomVal);
	}, [cropperRef]);

	return (
		<div className={styles.controlsContainer}>
			<button
				className={styles.controlButton}
				onClick={() => zoomCropper(1.5)}
				title="Zoom In"
			>
				<img src={zoomInIcon} alt="Zoom In" />
			</button>
			<button
				className={styles.controlButton}
				onClick={() => zoomCropper(0.75)}
				title="Zoom Out"
			>
				<img src={zoomOutIcon} alt="Zoom Out" />
			</button>
		</div>
	);
}
