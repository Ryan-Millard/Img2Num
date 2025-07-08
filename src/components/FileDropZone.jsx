import React, { useId } from 'react';
import LetterGlitch from './LetterGlitch';
import styles from './FileDropZone.module.css';

export default function FileDropZone({ originalSrc, onFile }) {
	const inputId = useId();

	const handleDrop = async (e) => {
		e.preventDefault();
		const file = e.dataTransfer.files[0];
		onFile(file);
	};

	return (
		<label
			htmlFor={inputId}
			className={styles.dropZone}
			onDrop={handleDrop}
			onDragOver={(e) => e.preventDefault()}
		>
			<LetterGlitch glitchSpeed={50} className={styles.letterGlitch} />
			{originalSrc ? (
				<img src={originalSrc} alt="Original" className={styles.preview} />
			) : (
				<p className={styles.dragDropText}>
					Drag & Drop or <span>Choose File</span>
				</p>
			)}
			<input
				id={inputId}
				type="file"
				accept="image/*"
				onChange={e => onFile(e.target.files[0])}
				hidden
			/>
		</label>
	);
}
