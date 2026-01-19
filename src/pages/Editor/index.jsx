import { useRef, useState } from 'react';
import parse from 'html-react-parser';
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
  const [svgElements] = useState(() => (svg ? parse(svg) : null));
  const [isColorMode, setIsColorMode] = useState(true);
  const viewportRef = useRef(null);
  const innerRef = useRef(null);
  const [transform, setTransform] = useState({ scale: 1, tx: 0, ty: 0 });
  const pointerState = useRef({ dragging: false, lastX: 0, lastY: 0, moved: false });
  const activePointersRef = useRef(new Map());
  const pinchRef = useRef({
    active: false,
    startDist: 0,
    startScale: 1,
    startTx: 0,
    startTy: 0,
    startCx: 0,
    startCy: 0,
  });

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // Wheel zoom (keeps tx/ty; can be improved later to zoom to pointer)
  const handleWheel = (e) => {
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

    // Only start a drag for primary button on mouse.
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    pointerState.current.dragging = true;
    pointerState.current.moved = false;
    pointerState.current.lastX = e.clientX;
    pointerState.current.lastY = e.clientY;

    // Pinch start when second pointer goes down
    if (activePointersRef.current.size === 2) {
      const points = Array.from(activePointersRef.current.values());
      const p1 = points[0];
      const p2 = points[1];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      pinchRef.current.active = true;
      pinchRef.current.startDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      pinchRef.current.startScale = transform.scale;
      pinchRef.current.startTx = transform.tx;
      pinchRef.current.startTy = transform.ty;

      // content coordinate under the pinch midpoint at start
      pinchRef.current.startCx = (midX - transform.tx) / transform.scale;
      pinchRef.current.startCy = (midY - transform.ty) / transform.scale;

      // don't treat pinch as a tap
      pointerState.current.moved = true;
    }

    try {
      viewportRef.current.setPointerCapture(e.pointerId);
    } catch {}
    viewportRef.current.classList.add(styles.grabbing);
  };

  const onPointerMove = (e) => {
    if (!pointerState.current.dragging) return;

    // Keep active pointer positions updated
    if (activePointersRef.current.has(e.pointerId)) {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // Pinch zoom: when two pointers are active
    if (pinchRef.current.active && activePointersRef.current.size === 2) {
      const points = Array.from(activePointersRef.current.values());
      const p1 = points[0];
      const p2 = points[1];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

      if (pinchRef.current.startDist > 0) {
        const scaleFactor = dist / pinchRef.current.startDist;
        const nextScale = clamp(pinchRef.current.startScale * scaleFactor, 0.25, 6);

        // Keep the content point under the pinch midpoint anchored under the fingers.
        const nextTx = midX - pinchRef.current.startCx * nextScale;
        const nextTy = midY - pinchRef.current.startCy * nextScale;

        setTransform((t) => ({ ...t, scale: nextScale, tx: nextTx, ty: nextTy }));
      }
      return;
    }

    // Pan only when exactly one pointer is active
    if (activePointersRef.current.size !== 1) return;

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

    // Remove pointer from active set first
    activePointersRef.current.delete(e.pointerId);

    if (activePointersRef.current.size < 2) {
      pinchRef.current.active = false;
    }

    // Keep dragging true if another pointer remains down
    pointerState.current.dragging = activePointersRef.current.size > 0;

    // If exactly one pointer remains, reset lastX/lastY so pan can continue smoothly
    if (activePointersRef.current.size === 1) {
      const remaining = Array.from(activePointersRef.current.values())[0];
      pointerState.current.lastX = remaining.x;
      pointerState.current.lastY = remaining.y;
    }

    try {
      viewportRef.current.releasePointerCapture(e.pointerId);
    } catch {}
    viewportRef.current?.classList.remove(styles.grabbing);

    // Only treat as click if user didn't drag
    if (!moved && isColorMode) {
      // Find nearest shape inside SVG
      const svgRoot = innerRef.current?.querySelector('svg');
      if (!svgRoot) return;

      const shape = document.elementFromPoint(e.clientX, e.clientY)?.closest(SHAPE_SELECTOR);
      if (!shape || !svgRoot.contains(shape)) return;

      // Adds original colour on tap/click
      shape.classList.add(styles.coloredRegion);
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
            onChange={() => {
              setIsColorMode((prev) => !prev);
            }}
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
          onPointerCancel={onPointerUp}>
          <div ref={innerRef} className={styles.inner} style={transformStyle}>
            {svgElements}
          </div>
        </GlassCard>

        <div className={styles.hint}>
         Click shapes to reveal their original colour. Use mouse wheel to zoom, drag to pan. Switching modes preserves fills.
        </div>
      </GlassCard>
    </>
  );
}
