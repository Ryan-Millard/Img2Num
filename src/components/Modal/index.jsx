import React from 'react';

import styles from './index.module.css';
import GlassCard from '@components/GlassCard';

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null; // don't render if modal is closed

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) onClose(); // close when clicking outside content
  };

  return (
    <div className={`glass flex-center ${styles.modalOverlay}`} onClick={handleBackgroundClick}>
      <GlassCard className={styles.modalContent}>
        {title && <h2 className={`text-center ${styles.modalTitle}`}>{title}</h2>}

        <button className={`anchor-style ${styles.modalClose}`} onClick={onClose}>
          &times;
        </button>

        <div className={styles.modalBody}>{children}</div>
      </GlassCard>
    </div>
  );
};

export default Modal;
