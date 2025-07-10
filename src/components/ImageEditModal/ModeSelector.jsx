import React from 'react';
import styles from './ImageEditModal.module.css';
import {
	brightnessIcon,
	contrastIcon,
	cropIcon,
	flipHorizontalIcon,
	flipVerticalIcon,
	hueIcon,
	invertIcon,
	saturationIcon
} from '@assets/icons';

const buttons = [
	{ mode: 'crop', icon: cropIcon, label: 'Crop' },
	{ mode: 'saturation', icon: saturationIcon, label: 'Saturation' },
	{ mode: 'brightness', icon: brightnessIcon, label: 'Brightness' },
	{ mode: 'contrast', icon: contrastIcon, label: 'Contrast' },
	{ mode: 'hue', icon: hueIcon, label: 'Hue' },
];

export default function ModeSelector({ mode, setMode, isInverted, setIsInverted }) {
	return (
		<div className={styles.imageControls}>
			{buttons.map(({ mode: m, icon, label }) => (
				<div className={styles.flipControls} key={m}>
					<button
						className={`${styles.controlButton} ${mode === m ? styles.active : ''}`}
						onClick={() => setMode(m)}
						title={label}
					>
						<img src={icon} alt={label} style={{ width: 20 }} />
					</button>
				</div>
			))}
			<div className={styles.flipControls}>
				<button
					className={`${styles.controlButton} ${isInverted ? styles.active : ''}`}
					onClick={() => {
						setMode('invert');
						setIsInverted(prev => !prev);
					}}
					title="Invert Colors"
				>
					<img src={invertIcon} alt="Invert Colors" style={{ width: 20 }} />
				</button>
			</div>
		</div>
	);
}
