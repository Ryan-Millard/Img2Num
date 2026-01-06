import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Eye, Brush } from 'lucide-react';
import GlassCard from '@components/GlassCard';
import styles from './Editor.module.css';
import EditorHelmet from './EditorHelmet';
import GlassSwitch from '@components/GlassSwitch';

// shape selector we care about
const SHAPE_SELECTOR = 'path,rect,circle,polygon,ellipse';

export default function Editor() {
  const { state } = useLocation();
  const { svg } = state || {};
  const [isColorMode, setIsColorMode] = useState(true);
  const viewportRef = useRef(null);
  const innerRef = useRef(null);
  const [transform, setTransform] = useState({ scale: 1, tx: 0, ty: 0 });
  const pointerState = useRef({ dragging: false, lastX: 0, lastY: 0, moving: false });

  // Handle clicks: robustly find the nearest shape (in case the user clicks a child or <g>)
  const handleSvgClick = (e) => {
    if (!innerRef.current) return;
    const svgRoot = innerRef.current.querySelector('svg');
    if (!svgRoot) return;

    if (e.target.tagName === 'path' || e.target.tagName === 'PATH') {
      e.target.id = styles.coloredRegion;
    }
  };

  // Wheel zoom (keeps tx/ty; can be improved later to zoom to pointer)
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = Math.sign(e.deltaY);
    setTransform((t) => {
      const step = 1.12;
      let nextScale = delta > 0 ? t.scale / step : t.scale * step;
      nextScale = Math.max(0.25, Math.min(6, nextScale));
      return { ...t, scale: nextScale };
    });
  };

  // Panning handlers (pointer events)
  const onPointerDown = (e) => {
    if (!viewportRef.current) return;
    pointerState.current.dragging = true;
    pointerState.current.moved = false;
    pointerState.current.lastX = e.clientX;
    pointerState.current.lastY = e.clientY;
    try { viewportRef.current.setPointerCapture(e.pointerId); } catch {}
    viewportRef.current.classList.add('grabbing');
  };

  const onPointerMove = (e) => {
    if (!pointerState.current.dragging) return;
    const dx = e.clientX - pointerState.current.lastX;
    const dy = e.clientY - pointerState.current.lastY;

    // mark as moved if threshold exceeded
    if (!pointerState.current.moved && Math.hypot(dx, dy) > 5) {
      pointerState.current.moved = true;
    }

    pointerState.current.lastX = e.clientX;
    pointerState.current.lastY = e.clientY;

    if (pointerState.current.moved) {
      setTransform((t) => ({ ...t, tx: t.tx + dx, ty: t.ty + dy }));
    }
  };

  const onPointerUp = (e) => {
    const moved = pointerState.current.moved;
    pointerState.current.dragging = false;
    try { viewportRef.current.releasePointerCapture(e.pointerId); } catch {}
    viewportRef.current?.classList.remove('grabbing');

    // Only treat as click if user didn't drag
    if (!moved && isColorMode) {
      // Find nearest shape inside SVG
      const svgRoot = innerRef.current?.querySelector('svg');
      if (!svgRoot) return;

      const shape = document.elementFromPoint(e.clientX, e.clientY)?.closest(SHAPE_SELECTOR);
      if (!shape || !svgRoot.contains(shape)) return;

      // Apply your color class
      shape.id = styles.coloredRegion;
    }
  };

  const cardClass = isColorMode ? styles.colorMode : styles.previewMode;
  const transformStyle = {
    transform: `translate(${transform.tx}px, ${transform.ty}px) scale(${transform.scale})`,
  };

  if (!svg) {
    return (
      <GlassCard className="text-center p-8">
        <h2>No SVG data found</h2>
        <p>Please upload an image first.</p>
      </GlassCard>
    );
  }

  return (
    <>
      <EditorHelmet />

      <GlassCard className={cardClass}>
        <div className="controls" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <GlassSwitch
            isOn={isColorMode}
            onChange={() => { setIsColorMode((prev) => !prev); }}
            ariaLabel={`Switch to ${isColorMode ? 'preview' : 'color'} mode`}
            thumbContent={isColorMode ? <Eye /> : <Brush />}
          />
        </div>

        <GlassCard
          className={`flex-center ${styles.viewport}`}
          ref={viewportRef}
          onWheel={handleWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            ref={innerRef}
            className={styles.inner}
            style={transformStyle}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </GlassCard>

        <div className={styles.hint}>
          Click shapes to reveal their original colour. Use mouse wheel to zoom, drag to pan. Switching modes preserves fills.
        </div>
      </GlassCard>
    </>
  );
}
