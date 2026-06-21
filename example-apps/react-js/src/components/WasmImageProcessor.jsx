import GlassCard from "@components/GlassCard";
import LoadingHedgehog from "@components/LoadingHedgehog";
import Tooltip from "@components/Tooltip";
import { bilateralFilter, findContours, imageToUint8ClampedArray, kmeans } from "img2num";
import { ChevronDown, ChevronUp, RotateCcw, Settings, Upload } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./WasmImageProcessor.module.css";

const WasmImageProcessor = () => {
  const navigate = useNavigate();
  const inputId = useId();
  const inputRef = useRef(null);

  const [originalSrc, setOriginalSrc] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [numColors, setNumColors] = useState(16);
  const [minArea, setMinArea] = useState(100);
  const [minThickness, setMinThickness] = useState(10);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  /* Cleanup object URLs on unmount or src change */
  useEffect(() => {
    return () => {
      if (originalSrc) URL.revokeObjectURL(originalSrc);
    };
  }, [originalSrc]);

  /* Stable loader for images */
  const loadOriginal = useCallback(async (file) => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    setOriginalSrc(url);

    const { pixels, width, height } = await imageToUint8ClampedArray(file);
    setFileData({ pixels, width, height });
  }, []);

  /* Paste support */
  useEffect(() => {
    const handlePaste = (e) => {
      for (const item of e.clipboardData?.items || []) {
        if (item.type.startsWith("image/")) {
          loadOriginal(item.getAsFile());
          break;
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [loadOriginal]);

  /* Drag & drop */
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      loadOriginal(e.dataTransfer.files[0]);
    },
    [loadOriginal],
  );

  const handleSelect = useCallback((e) => loadOriginal(e.target.files[0]), [loadOriginal]);

  /* Hashed steps to keep pipeline aligned */
  const step = useCallback((p) => setProgress(p), []);

  /* Main pipeline */
  const processImage = useCallback(async () => {
    if (!fileData) return;

    setIsProcessing(true);
    step(5);

    try {
      const { width, height } = fileData;

      step(20);
      // NOTE: Gaussian blur destroys the sharp outlines first, preventing the Bilateral filter from detecting and preserving them
      const imgBilateralFiltered = await bilateralFilter({
        pixels: fileData.pixels,
        width,
        height,
      });

      step(70);
      // kmeansed pixels are unused - filtered pixels are better for findContours
      const { labels } = await kmeans({
        ...fileData,
        pixels: imgBilateralFiltered,
        num_colors: numColors,
      });

      step(95);
      const { svg } = await findContours({
        pixels: imgBilateralFiltered,
        labels,
        width,
        height,
        min_area: minArea,
        min_thickness: minThickness,
      });

      navigate("/editor", {
        state: {
          svg,
          fileData,
          originalSrc,
          imgBilateralFiltered,
          initialSettings: { numColors, minArea, minThickness }
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        step(0);
      }, 800);
    }
  }, [fileData, navigate, step, numColors, minArea, minThickness]);

  /* Memo'd UI fragments */
  const EmptyState = useMemo(
    () => (
      <>
        <Tooltip content="Upload an image">
          <Upload className={`anchor-style ${styles.uploadIcon}`} />
        </Tooltip>

        <Tooltip content="Choose an image">
          <p className={`text-center ${styles.dragDropText}`}>
            Drag & Drop or&nbsp;
            <span className={`anchor-style ${styles.noTextWrap}`}>Choose Image</span>
          </p>
        </Tooltip>
      </>
    ),
    [],
  );

  const LoadedState = useMemo(() => {
    if (!originalSrc) return null;

    return (
      <div className={styles.loadedContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.previewContainer}>
          <img src={originalSrc} alt="Original" className={styles.preview} />

          <div className={styles.controlsWrapper}>
            {!isProcessing ? (
              <div className="flex-center gap-md">
                <button
                  type="button"
                  className={`button flex-center gap-xs ${styles.settingsToggle}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSettingsOpen((prev) => !prev);
                  }}
                  aria-expanded={isSettingsOpen}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                  {isSettingsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                <Tooltip content="Process the image and convert it to numbers">
                  <button
                    className="uppercase button"
                    onClick={(e) => {
                      e.stopPropagation();
                      processImage();
                    }}
                  >
                    Ok
                  </button>
                </Tooltip>
              </div>
            ) : (
              <LoadingHedgehog progress={progress} text={`Processing — ${Math.round(progress)}%`} />
            )}
          </div>
        </div>

        {/* Settings Panel */}
        <div className={`${styles.settingsPanel} ${isSettingsOpen ? styles.settingsOpen : ""}`}>
          <h3 className={styles.settingsHeading}>Configuration</h3>

          <div className={styles.settingGroup}>
            <div className={styles.settingLabelWrapper}>
              <label htmlFor="k-colors">
                Colors: <strong>{numColors}</strong>
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
            />
          </div>

          <button
            type="button"
            className={`button flex-center gap-xs ${styles.resetButton}`}
            onClick={(e) => {
              e.stopPropagation();
              setNumColors(16);
              setMinArea(100);
              setMinThickness(10);
            }}
          >
            <RotateCcw size={16} />
            <span>Use Defaults</span>
          </button>
        </div>
      </div>
    );
  }, [originalSrc, isProcessing, progress, processImage, numColors, minArea, minThickness, isSettingsOpen]);

  return (
    <GlassCard
      className={`flex-center flex-column ${styles.dropZone}`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => {
        if (!originalSrc) inputRef.current?.click();
      }}
      data-image-loaded={!!originalSrc}
    >
      {originalSrc ? LoadedState : EmptyState}

      <input ref={inputRef} id={inputId} type="file" accept="image/*" hidden onChange={handleSelect} />
    </GlassCard>
  );
};

export default WasmImageProcessor;
