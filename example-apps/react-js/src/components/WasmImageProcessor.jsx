import { useEffect, useState, useId, useRef, useCallback, useMemo } from "react";
import { Upload, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { imageToUint8ClampedArray, bilateralFilter, kmeans, findContours } from "img2num";
import GlassCard from "@components/GlassCard";
import styles from "./WasmImageProcessor.module.css";
import { useNavigate } from "react-router-dom";
import LoadingHedgehog from "@components/LoadingHedgehog";
import Tooltip from "@components/Tooltip";
import ConfigPanel from "@components/ConfigPanel";

const WasmImageProcessor = () => {
  const navigate = useNavigate();
  const inputId = useId();
  const inputRef = useRef(null);

  const [originalSrc, setOriginalSrc] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Configuration States
  const [numColors, setNumColors] = useState(16);
  const [minArea, setMinArea] = useState(100);
  const [minThickness, setMinThickness] = useState(10);
  const [sigmaSpatial, setSigmaSpatial] = useState(3);
  const [sigmaRange, setSigmaRange] = useState(50);
  const [colorSpace, setColorSpace] = useState(0);

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
    setIsSettingsOpen(false);

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
        sigma_spatial: sigmaSpatial,
        sigma_range: sigmaRange,
        color_space: colorSpace,
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
          initialSettings: {
            numColors,
            minArea,
            minThickness,
            sigmaSpatial,
            sigmaRange,
            colorSpace,
          },
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
  }, [fileData, navigate, step, numColors, minArea, minThickness, sigmaSpatial, sigmaRange, colorSpace]);

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

  if (originalSrc) {
    return (
      <div className={styles.loadedContainer} onClick={(e) => e.stopPropagation()}>
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
          isOpen={isSettingsOpen}
          onReset={() => {
            setNumColors(16);
            setMinArea(100);
            setMinThickness(10);
            setSigmaSpatial(3);
            setSigmaRange(50);
            setColorSpace(0);
          }}
          onAction={processImage}
          actionLabel="Ok"
          isProcessing={isProcessing}
          onClose={() => setIsSettingsOpen(false)}
        />

        <GlassCard
          className={`flex-center flex-column ${styles.previewCard}`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
          }}
          data-image-loaded={true}
        >
          <img src={originalSrc} alt="Original" className={styles.preview} />

          {!isProcessing && !isSettingsOpen && (
            <>
              <button
                type="button"
                className={`button flex-center ${styles.settingsToggle}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSettingsOpen(true);
                }}
                aria-expanded={isSettingsOpen}
                aria-label="Toggle settings"
              >
                <Settings size={18} />
              </button>

              <button
                type="button"
                className={`button ${styles.okButton}`}
                onClick={(e) => {
                  e.stopPropagation();
                  processImage();
                }}
                disabled={isProcessing}
              >
                Ok
              </button>
            </>
          )}

          {isProcessing && (
            <div className={styles.controlsWrapper}>
              <LoadingHedgehog progress={progress} text={`Processing — ${Math.round(progress)}%`} />
            </div>
          )}
        </GlassCard>
        <input ref={inputRef} id={inputId} type="file" accept="image/*" hidden onChange={handleSelect} />
      </div>
    );
  }

  return (
    <GlassCard
      className={`flex-center flex-column ${styles.dropZone}`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => {
        inputRef.current?.click();
      }}
      data-image-loaded={false}
    >
      {EmptyState}

      <input ref={inputRef} id={inputId} type="file" accept="image/*" hidden onChange={handleSelect} />
    </GlassCard>
  );
};

export default WasmImageProcessor;
