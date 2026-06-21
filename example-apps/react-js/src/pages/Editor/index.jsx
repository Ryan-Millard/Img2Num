import GlassCard from "@components/GlassCard";
import GlassModal from "@components/GlassModal";
import useFullscreen from "@hooks/useFullscreen";
import parse from "html-react-parser";
import { bilateralFilter, findContours, kmeans } from "img2num";
import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import EditorControls from "./EditorControls";
import EditorHelmet from "./EditorHelmet";

import styles from "./Editor.module.css";

const SHAPE_SELECTOR = "path,rect,circle,polygon,ellipse";

export default function Editor() {
  const { state } = useLocation();
  const { svg: initialSvg, fileData, originalSrc, imgBilateralFiltered, initialSettings } = state || {};

  const [svg, setSvg] = useState(initialSvg);
  const [svgElements, setSvgElements] = useState(null);
  const [isColorMode, setIsColorMode] = useState(true);

  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [initialSnapshot, setInitialSnapshot] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);

  const [numColors, setNumColors] = useState(initialSettings?.numColors ?? 16);
  const [minArea, setMinArea] = useState(initialSettings?.minArea ?? 100);
  const [minThickness, setMinThickness] = useState(initialSettings?.minThickness ?? 10);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);

  useEffect(() => {
    if (svg) {
      setSvgElements(parse(svg));
    }
  }, [svg]);

  const reprocessImage = async () => {
    if (!fileData) return;
    setIsReprocessing(true);
    try {
      const { width, height } = fileData;

      let filteredPixels = imgBilateralFiltered;
      if (!filteredPixels) {
        filteredPixels = await bilateralFilter({
          pixels: fileData.pixels,
          width,
          height,
        });
      }

      const { labels } = await kmeans({
        ...fileData,
        pixels: filteredPixels,
        num_colors: numColors,
      });

      const { svg: newSvg } = await findContours({
        pixels: filteredPixels,
        labels,
        width,
        height,
        min_area: minArea,
        min_thickness: minThickness,
      });

      setSvg(newSvg);
    } catch (err) {
      console.error(err);
    } finally {
      setIsReprocessing(false);
    }
  };

  const viewportRef = useRef(null);
  const innerRef = useRef(null);

  const rafRef = useRef(null);

  const transformRef = useRef({
    scale: 1,
    tx: 0,
    ty: 0,
  });

  const { ref: fsRef, toggle: toggleFullscreen } = useFullscreen();

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
        innerRef.current.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
      }
    });
  };

  const updateTransform = (callback) => {
    callback(transformRef.current);
    scheduleRender();
  };

  // Wheel zoom
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();

      const delta = Math.sign(e.deltaY);

      updateTransform((t) => {
        const step = 1.12;
        let nextScale = delta > 0 ? t.scale / step : t.scale * step;
        t.scale = clamp(nextScale, 0.25, 6);
      });
    },
    [updateTransform],
  );
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    el.addEventListener("wheel", handleWheel, { passive: false });

    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

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

  const onPointerMove = useCallback((e) => {
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

        const nextScale = clamp(pinchRef.current.startScale * scaleFactor, 0.25, 6);

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
  }, []);

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

      const shape = document.elementFromPoint(e.clientX, e.clientY)?.closest(SHAPE_SELECTOR);

      if (!shape || !svgRoot.contains(shape) || shape.classList.contains(styles.coloredRegion)) return;

      shape.classList.add(styles.coloredRegion);

      // Record history snapshot
      const currentShapes = Array.from(svgRoot.querySelectorAll(`.${styles.coloredRegion}`)).map((el) => el.dataset.id);

      const newHistory = history.slice(0, historyIndex + 1); // drop redo steps
      newHistory.push(currentShapes);

      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;

    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    restoreHistory(history[newIndex]);
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;

    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    restoreHistory(history[newIndex]);
  }, [history, historyIndex]);

  const restoreHistory = (snapshot) => {
    const svgRoot = innerRef.current?.querySelector("svg");
    if (!svgRoot) return;

    // Remove all colored classes
    svgRoot.querySelectorAll(`.${styles.coloredRegion}`).forEach((el) => {
      el.classList.remove(styles.coloredRegion);
    });

    // Apply snapshot
    snapshot.forEach((id) => {
      const el = svgRoot.querySelector(`[data-id="${id}"]`);
      if (el) el.classList.add(styles.coloredRegion);
    });
  };

  const cardClass = isColorMode ? styles.colorMode : styles.previewMode;

  // useEffect for pointer moves with RAF batching and raw/fallback support
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const queuedEvent = { e: null };
    let ticking = false;

    const handlePointerMove = (e) => {
      queuedEvent.e = e;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          if (queuedEvent.e) {
            onPointerMove(queuedEvent.e);
            queuedEvent.e = null;
          }
          ticking = false;
        });
      }
    };

    const supportsRawUpdate = typeof window !== "undefined" && "onpointerrawupdate" in window;
    const pointerEventType = supportsRawUpdate ? "pointerrawupdate" : "pointermove";

    el.addEventListener(pointerEventType, handlePointerMove);

    return () => {
      el.removeEventListener(pointerEventType, handlePointerMove);
    };
  }, [onPointerMove]);

  // Keybindings
  useEffect(() => {
    const handler = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      const target = e.target;
      const isEditable = target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

      if (!mod || isEditable) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((key === "y" && !e.shiftKey) || (key === "z" && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [historyIndex, history, redo, undo]);

  useEffect(() => {
    const svgRoot = innerRef.current?.querySelector("svg");
    if (!svgRoot) return;

    const shapes = svgRoot.querySelectorAll(SHAPE_SELECTOR);
    shapes.forEach((shape, i) => {
      if (!shape.dataset.id) {
        shape.dataset.id = `shape-${i}`;
      }
    });

    // Store the empty initial snapshot
    setInitialSnapshot([]);
    setHistory([[]]); // history starts with empty selection
    setHistoryIndex(0);
  }, [svgElements]);

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
          onReset={() => setModalOpen(true)}
          onUndo={undo}
          onRedo={redo}
          onFullscreen={toggleFullscreen}
          showSettingsButton={!!fileData}
          isSettingsOpen={isSettingsOpen}
          onToggleSettings={() => setIsSettingsOpen((prev) => !prev)}
        />

        <GlassModal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          <h2>Reset your progress</h2>
          <p>If you click confirm, all of your progress will be reset and you will start coloring in the image from scratch.</p>
          <div className="flex-center gap-md">
            <button onClick={() => setModalOpen(false)} className="button">
              Cancel
            </button>
            <button
              onClick={() => {
                restoreHistory(initialSnapshot);
                setHistory([initialSnapshot]);
                setHistoryIndex(0);
                setModalOpen(false);
              }}
              className="button"
            >
              Confirm
            </button>
          </div>
        </GlassModal>

        <div className={styles.hint}>Click shapes to reveal their original colour.</div>

        <div className={styles.editorMainContainer}>
          {/* Settings Panel */}
          {fileData && (
            <div className={`${styles.settingsPanel} ${isSettingsOpen ? styles.settingsOpen : ""}`} onClick={(e) => e.stopPropagation()}>
              <h3 className={styles.settingsHeading}>Configuration</h3>

              <div className={styles.settingGroup}>
                <div className={styles.settingLabelWrapper}>
                  <label htmlFor="k-colors">
                    Colors (k): <strong>{numColors}</strong>
                  </label>
                  <span className={styles.rangeLimits}>2 - 64</span>
                </div>
                <input
                  id="k-colors"
                  type="range"
                  min="2"
                  max="64"
                  value={numColors}
                  onChange={(e) => setNumColors(parseInt(e.target.value, 10))}
                  className={styles.rangeInput}
                  disabled={isReprocessing}
                />
              </div>

              <div className={styles.settingGroup}>
                <div className={styles.settingLabelWrapper}>
                  <label htmlFor="min-area">
                    Min Area: <strong>{minArea}</strong>
                  </label>
                  <span className={styles.rangeLimits}>100 - 1000</span>
                </div>
                <input
                  id="min-area"
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={minArea}
                  onChange={(e) => setMinArea(parseInt(e.target.value, 10))}
                  className={styles.rangeInput}
                  disabled={isReprocessing}
                />
              </div>

              <div className={styles.settingGroup}>
                <div className={styles.settingLabelWrapper}>
                  <label htmlFor="min-thickness">
                    Min Thickness: <strong>{minThickness === 0 ? "0 (Disabled)" : minThickness}</strong>
                  </label>
                  <span className={styles.rangeLimits}>0 - 100</span>
                </div>
                <input
                  id="min-thickness"
                  type="range"
                  min="0"
                  max="100"
                  value={minThickness}
                  onChange={(e) => setMinThickness(parseInt(e.target.value, 10))}
                  className={styles.rangeInput}
                  disabled={isReprocessing}
                />
              </div>

              <div className="flex-center gap-sm" style={{ marginTop: "var(--spacing-xs)", width: "100%" }}>
                <button
                  type="button"
                  className={`button flex-center gap-xs ${styles.resetButton}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setNumColors(16);
                    setMinArea(100);
                    setMinThickness(10);
                  }}
                  disabled={isReprocessing}
                >
                  <RotateCcw size={16} />
                  <span>Use Defaults</span>
                </button>

                <button
                  type="button"
                  className="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    reprocessImage();
                  }}
                  disabled={isReprocessing}
                  style={{ flex: 1 }}
                >
                  {isReprocessing ? "Applying..." : "Apply"}
                </button>
              </div>
            </div>
          )}

          <GlassCard
            className={`flex-center ${styles.viewport}`}
            ref={(el) => {
              viewportRef.current = el;
              fsRef.current = el; // link fullscreen ref to viewport
            }}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div ref={innerRef} className={styles.inner}>
              {svgElements}
            </div>
          </GlassCard>
        </div>
      </GlassCard>
    </>
  );
}
