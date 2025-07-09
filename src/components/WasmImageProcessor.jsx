import React, { useEffect } from 'react';
import FileDropZone from './FileDropZone';
import CropModal from './CropModal';
import ProcessedImageDisplay from './ProcessedImageDisplay';
import { useWasmProcessor } from '../hooks/useWasmProcessor';
import styles from './WasmImageProcessor.module.css';

export default function WasmImageProcessor() {
	const {
		mod,
		fileData,
		editedImageData,
		loadFromFile,
		invertImageColors,
	} = useWasmProcessor();
	const [cropOpen, setCropOpen] = React.useState(false);

	useEffect(() => {
		const handlePaste = async e => {
			const items = e.clipboardData?.items;
			if (!items) return;
			for (const item of items) {
				if (item.type.startsWith('image/')) {
					loadFromFile(item.getAsFile());
					break;
				}
			}
		};
		document.addEventListener('paste', handlePaste);
		return () => document.removeEventListener('paste', handlePaste);
	}, [loadFromFile]);

	const openCrop = () => setCropOpen(true);
	const closeCrop = () => setCropOpen(false);
	const handleCropApply = url => {
		fetch(url)
			.then(res => res.blob())
			.then(blob => loadFromFile(new File([blob], 'cropped.png', { type: blob.type })));
		closeCrop();
	};

	return (
		<div className={styles.container}>
			{!mod && <p>Loading WASM Engine...</p>}

			<FileDropZone originalSrc={fileData?.url} onFile={loadFromFile} />

			{fileData?.url && !cropOpen && (
				<div className={styles.controls}>
					<button className="button" onClick={openCrop}>Crop</button>
					<button className="button" onClick={invertImageColors}>OK</button>
				</div>
			)}

			{cropOpen && (
				<CropModal
					imageSrc={fileData.url}
					onApply={handleCropApply}
					onCancel={closeCrop}
				/>
			)}

			{editedImageData && (
				<ProcessedImageDisplay data={editedImageData} />
			)}
		</div>
	);
}
