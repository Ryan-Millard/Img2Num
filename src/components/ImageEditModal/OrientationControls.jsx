import React, { useCallback, useMemo } from 'react';
import styles from './ImageEditModal.module.css';
import flipHorizontalIcon from '@assets/icons/flip-horizontal-icon.svg';
import flipVerticalIcon from '@assets/icons/flip-vertical-icon.svg';

export default function OrientationControls({
	flipHorizontal, setFlipHorizontal,
	flipVertical, setFlipVertical,
	cropperRef
}) {
	const rotateCropper = useCallback((angle) => {
		const cropper = cropperRef.current;
		if (cropper) cropper.rotateImage(angle);
	}, [cropperRef]);

	const buttons = useMemo(() => [
		{
			title: 'Flip Horizontal',
			active: flipHorizontal,
			icon: flipHorizontalIcon,
			onClick: () => setFlipHorizontal(prev => !prev),
		},
		{
			title: 'Flip Vertical',
			active: flipVertical,
			icon: flipVerticalIcon,
			onClick: () => setFlipVertical(prev => !prev),
		},
		{
			title: 'Rotate Left',
			icon: null,
			label: '⟲',
			onClick: () => rotateCropper(-90),
		},
		{
			title: 'Rotate Right',
			icon: null,
			label: '⟳',
			onClick: () => rotateCropper(90),
		}
	], [flipHorizontal, flipVertical, setFlipHorizontal, setFlipVertical, rotateCropper]);

	return (
		<div className={styles.controlsContainer}>
			{buttons.map(({ title, icon, label, onClick, active }, i) => (
				<button
					key={i}
					title={title}
					className={[
						styles.controlButton,
						active ? styles.active : '',
						title.startsWith('Rotate') ? styles.rotateButton : ''
					].join(' ').trim()}
					onClick={onClick}
				>
					{icon ? <img src={icon} alt={title} style={{ width: 20 }} /> : label}
				</button>
			))}
		</div>
	);
}
