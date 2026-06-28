import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import styles from "./Editor.module.css";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Extract a loose, conservative bounding box from a path's numeric data.
// Numbers are paired as (x, y) sequentially; control points only inflate the
// box, which is fine — it is used purely to cull/prefilter, never to clip.
function bboxFromPathData(d) {
  const nums = d.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi);
  if (!nums || nums.length < 2) return null;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const x = +nums[i];
    const y = +nums[i + 1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}

const attr = (attrs, name) => {
  const m = new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, "i").exec(attrs);
  return m ? m[1] : null;
};

// Parse the SVG string into a flat list of drawable regions plus the view box.
//
// We deliberately do NOT use DOMParser: for a large SVG it builds a complete
// in-memory DOM document (5-10x the string size, allocated all at once), which
// is enough to OOM-kill the tab. The img2num pipeline emits flat
// `<path d=… fill=…/>` elements, so a streaming string scan extracts everything
// we need with a fraction of the peak memory and no intermediate DOM.
function parseSvg(svgString) {
  if (typeof Path2D === "undefined") {
    return { vb: { x: 0, y: 0, w: 0, h: 0 }, regions: [] };
  }
  const s = svgString || "";

  // Root <svg> attributes → view box + default fill-rule.
  let vb = { x: 0, y: 0, w: 0, h: 0 };
  let rootFillRule = "nonzero";
  const svgTag = /<svg\b([^>]*)>/i.exec(s);
  if (svgTag) {
    const a = svgTag[1];
    const vbAttr = attr(a, "viewBox");
    if (vbAttr) {
      const [x, y, w, h] = vbAttr
        .trim()
        .split(/[\s,]+/)
        .map(Number);
      vb = { x, y, w, h };
    } else {
      vb = { x: 0, y: 0, w: parseFloat(attr(a, "width")) || 0, h: parseFloat(attr(a, "height")) || 0 };
    }
    rootFillRule = attr(a, "fill-rule") || rootFillRule;
  }

  const regions = [];
  const pathRe = /<path\b([^>]*?)\/?>/gi;
  let m;
  while ((m = pathRe.exec(s)) !== null) {
    const attrs = m[1];
    const d = attr(attrs, "d");
    if (!d) continue;
    let path;
    try {
      path = new Path2D(d);
    } catch {
      continue;
    }
    regions.push({
      path,
      fill: attr(attrs, "fill") || "#000",
      fillRule: attr(attrs, "fill-rule") || rootFillRule,
      bbox: bboxFromPathData(d),
    });
  }

  return { vb, regions };
}

const STROKE_COLOR = "#000";
const STROKE_WIDTH = 0.5;
const UNREVEALED_FILL = "#fff";

/**
 * Canvas-based renderer for large coloring-book SVGs.
 *
 * Instead of mounting thousands of interactive <path> DOM nodes (which
 * choke/crash the browser past ~10k shapes), every region is drawn into a
 * single <canvas>. Click-to-reveal hit-testing is done geometrically with
 * Path2D + isPointInPath (bbox-prefiltered), so it stays exact at any zoom
 * without any extra DOM. The original SVG string is never modified, so
 * fidelity and export are fully preserved.
 *
 * Exposes undo/redo/reset and the container element via an imperative ref.
 */
const SvgCanvas = forwardRef(function SvgCanvas({ svg, isColorMode, onHistoryChange }, ref) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const sceneRef = useRef({ vb: { x: 0, y: 0, w: 0, h: 0 }, regions: [] });
  const revealedRef = useRef(new Set());
  const historyRef = useRef([[]]); // each entry is an array of revealed region indices
  const historyIndexRef = useRef(0);

  const transformRef = useRef({ scale: 1, tx: 0, ty: 0 });
  const scaleBoundsRef = useRef({ min: 0.05, max: 50 });
  const fittedRef = useRef(false);

  const rafRef = useRef(null);
  const settleRef = useRef(null);
  const colorModeRef = useRef(isColorMode);
  colorModeRef.current = isColorMode;

  // --- Rendering ----------------------------------------------------------

  const draw = useCallback((quality) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    const { scale, tx, ty } = transformRef.current;
    const colorAll = !colorModeRef.current; // preview mode reveals every region

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, tx * dpr, ty * dpr);

    // World-space bounds of the visible viewport, for culling.
    const viewLeft = -tx / scale;
    const viewTop = -ty / scale;
    const viewRight = (cssW - tx) / scale;
    const viewBottom = (cssH - ty) / scale;

    ctx.lineWidth = STROKE_WIDTH;
    ctx.strokeStyle = STROKE_COLOR;
    ctx.lineJoin = "round";

    const regions = sceneRef.current.regions;
    const revealed = revealedRef.current;
    const drawStroke = quality !== "fast";

    for (let i = 0; i < regions.length; i++) {
      const r = regions[i];
      const b = r.bbox;
      if (b && (b.maxX < viewLeft || b.minX > viewRight || b.maxY < viewTop || b.minY > viewBottom)) {
        continue;
      }
      ctx.fillStyle = colorAll || revealed.has(i) ? r.fill : UNREVEALED_FILL;
      ctx.fill(r.path, r.fillRule);
      if (drawStroke) ctx.stroke(r.path);
    }
  }, []);

  const renderNow = useCallback(
    (quality) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        draw(quality);
      });
    },
    [draw],
  );

  // During pan/zoom we render strokes-off for speed, then re-render with full
  // crisp outlines once interaction settles.
  const renderInteractive = useCallback(() => {
    renderNow("fast");
    if (settleRef.current) clearTimeout(settleRef.current);
    settleRef.current = setTimeout(() => {
      settleRef.current = null;
      renderNow("full");
    }, 120);
  }, [renderNow]);

  // --- Sizing & fit -------------------------------------------------------

  const resizeBackingStore = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      return true;
    }
    return false;
  }, []);

  const fitToView = useCallback(() => {
    const canvas = canvasRef.current;
    const { vb } = sceneRef.current;
    if (!canvas || !vb.w || !vb.h) return;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (!cssW || !cssH) return;

    const s = Math.min(cssW / vb.w, cssH / vb.h) * 0.95;
    transformRef.current = {
      scale: s,
      tx: (cssW - vb.w * s) / 2 - vb.x * s,
      ty: (cssH - vb.h * s) / 2 - vb.y * s,
    };
    scaleBoundsRef.current = { min: s * 0.5, max: s * 50 };
    fittedRef.current = true;
  }, []);

  // --- History ------------------------------------------------------------

  const emitHistory = useCallback(() => {
    onHistoryChange?.({
      canUndo: historyIndexRef.current > 0,
      canRedo: historyIndexRef.current < historyRef.current.length - 1,
    });
  }, [onHistoryChange]);

  const applySnapshot = useCallback((snapshot) => {
    revealedRef.current = new Set(snapshot);
  }, []);

  const pushHistory = useCallback(() => {
    const snapshot = Array.from(revealedRef.current);
    const next = historyRef.current.slice(0, historyIndexRef.current + 1);
    next.push(snapshot);
    historyRef.current = next;
    historyIndexRef.current = next.length - 1;
    emitHistory();
  }, [emitHistory]);

  // --- Parse on svg change ------------------------------------------------

  useEffect(() => {
    sceneRef.current = parseSvg(svg || "");
    revealedRef.current = new Set();
    historyRef.current = [[]];
    historyIndexRef.current = 0;
    fittedRef.current = false;
    emitHistory();

    if (resizeBackingStore() || true) {
      fitToView();
      renderNow("full");
    }
  }, [svg, emitHistory, fitToView, renderNow, resizeBackingStore]);

  // Re-render when the color/preview mode flips.
  useEffect(() => {
    renderNow("full");
  }, [isColorMode, renderNow]);

  // --- Context + resize observer ------------------------------------------

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext("2d");

    const onResize = () => {
      resizeBackingStore();
      if (!fittedRef.current) fitToView();
      renderNow("full");
    };

    let observer;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(onResize);
      observer.observe(canvas);
    }
    // Initial sizing/fit once the element has been laid out.
    onResize();

    return () => observer?.disconnect();
  }, [fitToView, renderNow, resizeBackingStore]);

  // --- Hit testing --------------------------------------------------------

  const hitTest = useCallback((worldX, worldY) => {
    const ctx = ctxRef.current;
    if (!ctx) return -1;
    const regions = sceneRef.current.regions;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    let found = -1;
    for (let i = regions.length - 1; i >= 0; i--) {
      const r = regions[i];
      const b = r.bbox;
      if (b && (worldX < b.minX || worldX > b.maxX || worldY < b.minY || worldY > b.maxY)) continue;
      if (ctx.isPointInPath(r.path, worldX, worldY, r.fillRule)) {
        found = i;
        break;
      }
    }
    ctx.restore();
    return found;
  }, []);

  // --- Pointer interaction (pan / zoom / pinch / click) -------------------

  const pointerState = useRef({ dragging: false, lastX: 0, lastY: 0, moved: false });
  const activePointersRef = useRef(new Map());
  const pinchRef = useRef({ active: false, startDist: 0, startScale: 1, startCx: 0, startCy: 0 });

  const onPointerDown = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    pointerState.current.dragging = true;
    pointerState.current.moved = false;
    pointerState.current.lastX = e.clientX;
    pointerState.current.lastY = e.clientY;

    if (activePointersRef.current.size === 2) {
      const [p1, p2] = Array.from(activePointersRef.current.values());
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const rect = canvas.getBoundingClientRect();
      const { scale, tx, ty } = transformRef.current;
      pinchRef.current = {
        active: true,
        startDist: Math.hypot(p1.x - p2.x, p1.y - p2.y),
        startScale: scale,
        startCx: (midX - rect.left - tx) / scale,
        startCy: (midY - rect.top - ty) / scale,
      };
      pointerState.current.moved = true;
    }

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {}
    canvas.classList.add(styles.grabbing);
  }, []);

  const onPointerMove = useCallback(
    (e) => {
      if (!pointerState.current.dragging) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (activePointersRef.current.has(e.pointerId)) {
        activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      if (pinchRef.current.active && activePointersRef.current.size === 2) {
        const [p1, p2] = Array.from(activePointersRef.current.values());
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (pinchRef.current.startDist > 0) {
          const rect = canvas.getBoundingClientRect();
          const { min, max } = scaleBoundsRef.current;
          const nextScale = clamp((pinchRef.current.startScale * dist) / pinchRef.current.startDist, min, max);
          transformRef.current = {
            scale: nextScale,
            tx: midX - rect.left - pinchRef.current.startCx * nextScale,
            ty: midY - rect.top - pinchRef.current.startCy * nextScale,
          };
          renderInteractive();
        }
        return;
      }

      if (activePointersRef.current.size !== 1) return;

      const dx = e.clientX - pointerState.current.lastX;
      const dy = e.clientY - pointerState.current.lastY;
      if (!pointerState.current.moved && Math.hypot(dx, dy) > 5) pointerState.current.moved = true;
      pointerState.current.lastX = e.clientX;
      pointerState.current.lastY = e.clientY;

      if (pointerState.current.moved) {
        transformRef.current.tx += dx;
        transformRef.current.ty += dy;
        renderInteractive();
      }
    },
    [renderInteractive],
  );

  const onPointerUp = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      const moved = pointerState.current.moved;

      activePointersRef.current.delete(e.pointerId);
      if (activePointersRef.current.size < 2) pinchRef.current.active = false;
      pointerState.current.dragging = activePointersRef.current.size > 0;

      if (activePointersRef.current.size === 1) {
        const remaining = Array.from(activePointersRef.current.values())[0];
        pointerState.current.lastX = remaining.x;
        pointerState.current.lastY = remaining.y;
      }

      try {
        canvas?.releasePointerCapture(e.pointerId);
      } catch {}
      canvas?.classList.remove(styles.grabbing);

      if (moved || !colorModeRef.current || !canvas) return;

      // A clean tap in color mode → reveal the region under the pointer.
      const rect = canvas.getBoundingClientRect();
      const { scale, tx, ty } = transformRef.current;
      const worldX = (e.clientX - rect.left - tx) / scale;
      const worldY = (e.clientY - rect.top - ty) / scale;

      const idx = hitTest(worldX, worldY);
      if (idx < 0 || revealedRef.current.has(idx)) return;

      revealedRef.current.add(idx);
      pushHistory();
      renderNow("full");
    },
    [hitTest, pushHistory, renderNow],
  );

  // Wheel zoom toward the cursor (non-passive so we can preventDefault).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const cssX = e.clientX - rect.left;
      const cssY = e.clientY - rect.top;
      const { scale, tx, ty } = transformRef.current;
      const worldX = (cssX - tx) / scale;
      const worldY = (cssY - ty) / scale;

      const step = 1.12;
      const { min, max } = scaleBoundsRef.current;
      const nextScale = clamp(e.deltaY > 0 ? scale / step : scale * step, min, max);

      transformRef.current = {
        scale: nextScale,
        tx: cssX - worldX * nextScale,
        ty: cssY - worldY * nextScale,
      };
      renderInteractive();
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [renderInteractive]);

  // Use coalesced pointerrawupdate when available for smoother panning.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const queued = { e: null };
    let ticking = false;
    const handler = (e) => {
      queued.e = e;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (queued.e) {
          onPointerMove(queued.e);
          queued.e = null;
        }
        ticking = false;
      });
    };

    const supportsRaw = typeof window !== "undefined" && "onpointerrawupdate" in window;
    const type = supportsRaw ? "pointerrawupdate" : "pointermove";
    canvas.addEventListener(type, handler);
    return () => canvas.removeEventListener(type, handler);
  }, [onPointerMove]);

  // --- Imperative API for the toolbar -------------------------------------

  useImperativeHandle(
    ref,
    () => ({
      undo() {
        if (historyIndexRef.current <= 0) return;
        historyIndexRef.current -= 1;
        applySnapshot(historyRef.current[historyIndexRef.current]);
        emitHistory();
        renderNow("full");
      },
      redo() {
        if (historyIndexRef.current >= historyRef.current.length - 1) return;
        historyIndexRef.current += 1;
        applySnapshot(historyRef.current[historyIndexRef.current]);
        emitHistory();
        renderNow("full");
      },
      reset() {
        revealedRef.current = new Set();
        historyRef.current = [[]];
        historyIndexRef.current = 0;
        emitHistory();
        renderNow("full");
      },
      getContainer: () => canvasRef.current,
    }),
    [applySnapshot, emitHistory, renderNow],
  );

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (settleRef.current) clearTimeout(settleRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} data-testid="svg-canvas" />;
});

export default SvgCanvas;
