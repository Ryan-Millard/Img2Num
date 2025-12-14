import React from 'react';
import styles from './index.module.css';

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null; // don't render if modal is closed

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) onClose(); // close when clicking outside content
  };

  return (
    <div className={`glass flex-center ${styles.modalOverlay}`} onClick={handleBackgroundClick}>
      <div className={styles.modalContent}>
        {title && <h2 className={`text-center ${styles.modalTitle}`}>{title}</h2>}
        <button className={styles.modalClose} onClick={onClose}>
          &times;
        </button>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
