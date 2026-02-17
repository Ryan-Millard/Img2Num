import React, { useRef, useState, useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';

/**
 * FullscreenWrapper
 * Wraps any children and provides a breadcrumb-styled button to toggle fullscreen.
 */
export default function FullscreenWrapper({ children }) {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Listen to fullscreen changes
  useEffect(() => {
    const handler = () => {
      const fsElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;

      setIsFullscreen(fsElement === containerRef.current);
    };

    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);
    document.addEventListener('msfullscreenchange', handler);

    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
      document.removeEventListener('msfullscreenchange', handler);
    };
  }, []);

  const toggleFullscreen = () => {
    const elem = containerRef.current;
    if (!elem) return;

    if (!isFullscreen) {
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
  };

  // Breadcrumb-style button
  const breadcrumbButtonStyle = {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1000,
    background: 'var(--ifm-background-color)', // same as breadcrumbs background
    color: 'var(--ifm-color-primary)',        // same as breadcrumb text
    border: 'none',
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '0.875rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Fullscreen toggle button */}
      <button onClick={toggleFullscreen} style={breadcrumbButtonStyle}>
        {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
        <span style={{ display: 'inline-block' }}>
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </span>
      </button>

      {/* Children */}
      {children}
    </div>
  );
}
