import React from 'react';
import styles from './ImageEditModal.module.css';

export default function ModeSlider({ value, onChange }) {
	return <input type="range" min="-99" max="100" step="1" value={value} onChange={onChange} />;
}

