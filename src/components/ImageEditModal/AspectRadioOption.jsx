import React from 'react';
import styles from './ImageEditModal.module.css';

const ASPECT_PRESETS = [
	{ label: 'Free', value: null },
	{ label: '1:1', value: 1 },
	{ label: '4:3', value: 4 / 3 },
	{ label: '16:9', value: 16 / 9 },
	{ label: 'Custom', value: 'custom' },
];

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

export default function AspectRatioSelector({
	aspectChoice,
	customWidth,
	customHeight,
	setAspectChoice,
	setCustomWidth,
	setCustomHeight
}) {
	return (
		<div className={styles.radioGroup}>
			{ASPECT_PRESETS.map(opt => (
				<AspectRadioOption
					key={opt.label}
					option={opt}
					isChecked={aspectChoice === opt.value}
					onChange={() => setAspectChoice(opt.value)}
				/>
			))}
			{aspectChoice === 'custom' && (
				<div className={styles.customInputs}>
					<label>
						Width ratio:
						<input
							type="number"
							min="1"
							step="0.1"
							value={customWidth}
							onChange={(e) => setCustomWidth(Number(e.target.value) || 1)}
						/>
					</label>
					<label>
						Height ratio:
						<input
							type="number"
							min="1"
							step="0.1"
							value={customHeight}
							onChange={(e) => setCustomHeight(Number(e.target.value) || 1)}
						/>
					</label>
				</div>
			)}
		</div>
	);
}
