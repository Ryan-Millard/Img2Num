import React, { useState } from 'react';
import GlassModal from './GlassModal';

/**
 * Example usage of GlassModal component
 * This file demonstrates how to use the modal in your application
 */
export default function GlassModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>

      <GlassModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="medium"
        overlayOpacity={0.5}
        ariaLabel="Example Dialog">
        <h2>Modal Title</h2>
        <p>This is the modal content. You can put any React components here.</p>
        <button onClick={() => setIsOpen(false)}>Close</button>
      </GlassModal>
    </div>
  );
}

/**
 * Size variations:
 * - size="small"   // max-width: 400px
 * - size="medium"  // max-width: 640px (default)
 * - size="large"   // max-width: 900px
 *
 * Advanced ARIA:
 * <GlassModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   ariaLabelledBy="modal-title"
 *   ariaDescribedBy="modal-description"
 * >
 *   <h2 id="modal-title">Modal Title</h2>
 *   <p id="modal-description">Modal description</p>
 * </GlassModal>
 */
