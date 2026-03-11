import { useEffect, useRef, useState } from "react";
import parse from "html-react-parser";
import { useLocation } from "react-router-dom";
import GlassCard from "@components/GlassCard";
import styles from "./Editor.module.css";
import EditorHelmet from "./EditorHelmet";
import EditorControls from "./EditorControls";

const SHAPE_SELECTOR = "path,rect,circle,polygon,ellipse";

export default function Editor() {
  const { state } = useLocation();
  const { svg } = state || {};

  const [svgElements] = useState(() => (svg ? parse(svg) : null));
  const [isColorMode, setIsColorMode] = useState(true);

  const viewportRef = useRef(null);
  const innerRef = useRef(null);

  const rafRef = useRef(null);

  const transformRef = useRef({
    scale: 1,
    tx: 0,
    ty: 0,
  });

  const pointerState = useRef({
    dragging: false,
    lastX: 0,
    lastY: 0,
    moved: false,
  });

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

  const scheduleRender = () => {
    if (rafRef.current) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;

      const { scale, tx, ty } = transformRef.current;

      if (innerRef.current) {
        innerRef.current.style.transform =
          `translate(${tx}px, ${ty}px) scale(${scale})`;
      }
    });
  };

  const updateTransform = (callback) => {
    callback(transformRef.current);
    scheduleRender();
  };

  // Wheel zoom
  const handleWheel = (e) => {
    const delta = Math.sign(e.deltaY);

    updateTransform((t) => {
      const step = 1.12;
      let nextScale = delta > 0 ? t.scale / step : t.scale * step;
      t.scale = clamp(nextScale, 0.25, 6);
    });
  };

  const onPointerDown = (e) => {
    if (!viewportRef.current) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    activePointersRef.current.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
    });

    pointerState.current.dragging = true;
    pointerState.current.moved = false;
    pointerState.current.lastX = e.clientX;
    pointerState.current.lastY = e.clientY;

    if (activePointersRef.current.size === 2) {
      const [p1, p2] = Array.from(activePointersRef.current.values());

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      const t = transformRef.current;

      pinchRef.current.active = true;
      pinchRef.current.startDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      pinchRef.current.startScale = t.scale;
      pinchRef.current.startTx = t.tx;
      pinchRef.current.startTy = t.ty;

      pinchRef.current.startCx = (midX - t.tx) / t.scale;
      pinchRef.current.startCy = (midY - t.ty) / t.scale;

      pointerState.current.moved = true;
    }

    try {
      viewportRef.current.setPointerCapture(e.pointerId);
    } catch {}

    viewportRef.current.classList.add(styles.grabbing);
  };

  const onPointerMove = (e) => {
    if (!pointerState.current.dragging) return;

    if (activePointersRef.current.has(e.pointerId)) {
      activePointersRef.current.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY,
      });
    }

    if (pinchRef.current.active && activePointersRef.current.size === 2) {
      const [p1, p2] = Array.from(activePointersRef.current.values());

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

      if (pinchRef.current.startDist > 0) {
        const scaleFactor = dist / pinchRef.current.startDist;

        const nextScale = clamp(
          pinchRef.current.startScale * scaleFactor,
          0.25,
          6
        );

        const nextTx = midX - pinchRef.current.startCx * nextScale;
        const nextTy = midY - pinchRef.current.startCy * nextScale;

        updateTransform((t) => {
          t.scale = nextScale;
          t.tx = nextTx;
          t.ty = nextTy;
        });
      }

      return;
    }

    if (activePointersRef.current.size !== 1) return;

    const dx = e.clientX - pointerState.current.lastX;
    const dy = e.clientY - pointerState.current.lastY;

    if (!pointerState.current.moved && Math.hypot(dx, dy) > 5) {
      pointerState.current.moved = true;
    }

    pointerState.current.lastX = e.clientX;
    pointerState.current.lastY = e.clientY;

    if (pointerState.current.moved) {
      updateTransform((t) => {
        t.tx += dx;
        t.ty += dy;
      });
    }
  };

  const onPointerUp = (e) => {
    const moved = pointerState.current.moved;

    activePointersRef.current.delete(e.pointerId);

    if (activePointersRef.current.size < 2) {
      pinchRef.current.active = false;
    }

    pointerState.current.dragging = activePointersRef.current.size > 0;

    if (activePointersRef.current.size === 1) {
      const remaining = Array.from(activePointersRef.current.values())[0];
      pointerState.current.lastX = remaining.x;
      pointerState.current.lastY = remaining.y;
    }

    try {
      viewportRef.current.releasePointerCapture(e.pointerId);
    } catch {}

    viewportRef.current?.classList.remove(styles.grabbing);

    if (!moved && isColorMode) {
      const svgRoot = innerRef.current?.querySelector("svg");
      if (!svgRoot) return;

      const shape = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest(SHAPE_SELECTOR);

      if (!shape || !svgRoot.contains(shape)) return;

      shape.classList.add(styles.coloredRegion);
    }
  };

  const resetColors = () => {
    const svgRoot = innerRef.current?.querySelector("svg");
    if (!svgRoot) return;

    const shapes = svgRoot.querySelectorAll(SHAPE_SELECTOR);

    shapes.forEach((shape) => {
      shape.classList.remove(styles.coloredRegion);
    });
  };

  const cardClass = isColorMode
    ? styles.colorMode
    : styles.previewMode;

  // Speed boost - better than React version
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    el.addEventListener("pointerrawupdate", onPointerMove);

    return () => {
      el.removeEventListener("pointerrawupdate", onPointerMove);
    };
  }, []);

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
        <EditorControls
          svg={svg}
          fileName={"edited-image"}
          isColorMode={isColorMode}
          setIsColorMode={setIsColorMode}
          onResetColors={resetColors}
        />

        <div className={styles.hint}>
          Click shapes to reveal their original colour.
        </div>

        <GlassCard
          className={`flex-center ${styles.viewport}`}
          ref={viewportRef}
          onWheel={handleWheel}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div ref={innerRef} className={styles.inner}>
            {svgElements}
          </div>
        </GlassCard>
      </GlassCard>
    </>
  );
}
