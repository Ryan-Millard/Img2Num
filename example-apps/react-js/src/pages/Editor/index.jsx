import ConfigPanel from "@components/ConfigPanel";
import GlassCard from "@components/GlassCard";
import GlassModal from "@components/GlassModal";
import useFullscreen from "@hooks/useFullscreen";
import { bilateralFilter, findContours, kmeans, color_quantize } from "img2num";
import { clearEditorHandoff, getEditorHandoff } from "@utils/editorHandoff";
import { useEffect, useRef, useState } from "react";
import EditorControls from "./EditorControls";
import EditorHelmet from "./EditorHelmet";
import SvgCanvas from "./SvgCanvas";

import styles from "./Editor.module.css";

export default function Editor() {
  const [handoff] = useState(() => getEditorHandoff());
  const { svg: initialSvg, fileData, imgBilateralFiltered, initialSettings } = handoff || {};

  useEffect(() => {
    return () => clearEditorHandoff();
  }, []);

  const [svg, setSvg] = useState(initialSvg);
  const [isColorMode, setIsColorMode] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);

  const [numColors, setNumColors] = useState(initialSettings?.numColors ?? 16);
  const [minArea, setMinArea] = useState(initialSettings?.minArea ?? 100);
  const [minThickness, setMinThickness] = useState(initialSettings?.minThickness ?? 10);
  const [sigmaSpatial, setSigmaSpatial] = useState(initialSettings?.sigmaSpatial ?? 3);
  const [sigmaRange, setSigmaRange] = useState(initialSettings?.sigmaRange ?? 50);
  const [colorSpace, setColorSpace] = useState(initialSettings?.colorSpace ?? 0);
  const [synthetic, setSyntheticFlag] = useState(initialSettings?.synthetic ?? false);

  const [cachedBilateralFiltered, setCachedBilateralFiltered] = useState(imgBilateralFiltered);
  const [appliedSigmaSpatial, setAppliedSigmaSpatial] = useState(initialSettings?.sigmaSpatial ?? 3);
  const [appliedSigmaRange, setAppliedSigmaRange] = useState(initialSettings?.sigmaRange ?? 50);
  const [appliedColorSpace, setAppliedColorSpace] = useState(initialSettings?.colorSpace ?? 0);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);

  const canvasRef = useRef(null);
  const viewportRef = useRef(null);
  const { ref: fsRef, toggle: toggleFullscreen } = useFullscreen();

  // Link the fullscreen target to the viewport once it is mounted.
  useEffect(() => {
    fsRef.current = viewportRef.current;
  }, [fsRef]);

  const reprocessImage = async () => {
    if (!fileData) return;
    setIsReprocessing(true);
    try {
      const { width, height } = fileData;

      let contourPixels = fileData.pixels;
      let labels;

      if (synthetic) {
        const result = await color_quantize({
          ...fileData,
          pixels: fileData.pixels,
          num_colors: 0,
        });
        labels = result.labels;
      } else {
        const bilateralChanged = sigmaSpatial !== appliedSigmaSpatial || sigmaRange !== appliedSigmaRange || colorSpace !== appliedColorSpace || !cachedBilateralFiltered;

        contourPixels = cachedBilateralFiltered;

        if (bilateralChanged) {
          contourPixels = await bilateralFilter({
            pixels: fileData.pixels,
            width,
            height,
            sigma_spatial: sigmaSpatial,
            sigma_range: sigmaRange,
            color_space: colorSpace,
          });
          setCachedBilateralFiltered(contourPixels);
          setAppliedSigmaSpatial(sigmaSpatial);
          setAppliedSigmaRange(sigmaRange);
          setAppliedColorSpace(colorSpace);
        }

        const kmeansResult = await kmeans({
          ...fileData,
          pixels: contourPixels,
          num_colors: numColors,
        });
        labels = kmeansResult.labels;
      }

      const { svg: newSvg } = await findContours({
        pixels: contourPixels,
        labels,
        width,
        height,
        min_area: minArea,
        min_thickness: minThickness,
      });
      canvasRef.current?.reset();
      setSvg(newSvg);
    } catch (err) {
      console.error(err);
    } finally {
      setIsReprocessing(false);
    }
  };

  // Undo / redo keybindings, delegated to the canvas component.
  useEffect(() => {
    const handler = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      const target = e.target;
      const isEditable = target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
      if (!mod || isEditable) return;

      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        canvasRef.current?.undo();
      } else if ((key === "y" && !e.shiftKey) || (key === "z" && e.shiftKey)) {
        e.preventDefault();
        canvasRef.current?.redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const cardClass = isColorMode ? styles.colorMode : styles.previewMode;

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
          onUndo={() => canvasRef.current?.undo()}
          onRedo={() => canvasRef.current?.redo()}
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
                canvasRef.current?.reset();
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
            <ConfigPanel
              numColors={numColors}
              setNumColors={setNumColors}
              minArea={minArea}
              setMinArea={setMinArea}
              minThickness={minThickness}
              setMinThickness={setMinThickness}
              sigmaSpatial={sigmaSpatial}
              setSigmaSpatial={setSigmaSpatial}
              sigmaRange={sigmaRange}
              setSigmaRange={setSigmaRange}
              colorSpace={colorSpace}
              setColorSpace={setColorSpace}
              synthetic={synthetic}
              setSyntheticFlag={setSyntheticFlag}
              isOpen={isSettingsOpen}
              onReset={() => {
                setNumColors(16);
                setMinArea(100);
                setMinThickness(10);
                setSigmaSpatial(3);
                setSigmaRange(50);
                setColorSpace(0);
                setSyntheticFlag(false);
              }}
              onAction={reprocessImage}
              actionLabel="Apply"
              isProcessing={isReprocessing}
              onClose={() => setIsSettingsOpen(false)}
              showWarning={true}
            />
          )}

          <GlassCard className={`flex-center ${styles.viewport}`} ref={viewportRef}>
            <SvgCanvas ref={canvasRef} svg={svg} isColorMode={isColorMode} />
          </GlassCard>
        </div>
      </GlassCard>
    </>
  );
}
