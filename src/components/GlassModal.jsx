import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import FocusTrap from 'focus-trap-react';
import styles from './GlassModal.module.css';
import GlassCard from './GlassCard';

export default function GlassModal({
  isOpen,
  onClose,
  children,
  size = 'medium',
  overlayOpacity = 0.5,
  ariaLabel = 'Dialog',
  ariaLabelledBy,
  ariaDescribedBy,
}) {
  const previousFocusRef = useRef(null);
  const modalRef = useRef(null);

  // Handle body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    // Store the element that had focus before the modal opened
    previousFocusRef.current = document.activeElement;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      // Restore body scroll
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;

      // Restore focus to the element that had focus before the modal opened
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    function onKey(e) {
      if (e.key === 'Escape') {
        onClose?.();
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Auto-focus the modal when it opens
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus the modal wrapper
      const focusableElement = modalRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElement) {
        focusableElement.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div className={styles.modalRoot} style={{ '--overlay-opacity': overlayOpacity }}>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div
        ref={modalRef}
        className={styles.wrapper}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabelledBy ? undefined : ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}>
        <FocusTrap
          focusTrapOptions={{
            initialFocus: false,
            allowOutsideClick: true,
            escapeDeactivates: false,
          }}>
          <GlassCard className={styles.content}>
            <button aria-label="Close" className={`pt-0 ${styles.close}`} onClick={onClose} type="button">
              {'\u00D7'}
            </button>
            <div className={styles.body} data-size={size}>
              {children}
            </div>
          </GlassCard>
        </FocusTrap>
      </div>
    </div>
  );

  // Render modal in a portal attached to document.body
  return createPortal(modalContent, document.body);
}

GlassModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  overlayOpacity: PropTypes.number,
  ariaLabel: PropTypes.string,
  ariaLabelledBy: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
};
