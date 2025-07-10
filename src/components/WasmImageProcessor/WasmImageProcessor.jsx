import React, { useEffect } from 'react';
import FileDropZone from '@components/FileDropZone';
import ImageEditModal from '@components/ImageEditModal';
import ProcessedImageDisplay from '@components/ProcessedImageDisplay';
import { useWasmProcessor } from '@hooks/useWasmProcessor';
import styles from './WasmImageProcessor.module.css';

export default function WasmImageProcessor() {
	const {
		mod,
		fileData,
		editedImageData,
		loadFromFile,
		invertImageColors,
	} = useWasmProcessor();
	const [editOpen, setEditOpen] = React.useState(false);

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

	const openEdit = () => setEditOpen(true);
	const closeEdit = () => setEditOpen(false);
	const handleEditApply = url => {
		fetch(url)
			.then(res => res.blob())
			.then(blob => loadFromFile(new File([blob], 'edited.png', { type: blob.type })));
		closeEdit();
	};

	return (
		<div className={styles.container}>
			{!mod && <p>Loading WASM Engine...</p>}

			<FileDropZone originalSrc={fileData?.url} onFile={loadFromFile} />

			{fileData?.url && !editOpen && (
				<div className={styles.controls}>
					<button className="button" onClick={openEdit}>Edit</button>
					<button className="button" onClick={invertImageColors}>OK</button>
				</div>
			)}

			{editOpen && (
				<ImageEditModal
					imageSrc={fileData.url}
					onApply={handleEditApply}
					onCancel={closeEdit}
				/>
			)}

			{editedImageData && (
				<ProcessedImageDisplay data={editedImageData} />
			)}
		</div>
	);
}
