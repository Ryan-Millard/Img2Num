import { useEffect, useState, useId, useRef, useCallback, useMemo } from "react";
import { Upload } from "lucide-react";
import { loadImageToUint8Array } from "@utils/image-utils"; // keep your existing loader
import { bilateralFilter } from "img2num";
import GlassCard from "@components/GlassCard";
import styles from "./WasmImageProcessor.module.css";
import LoadingHedgehog from "@components/LoadingHedgehog";
import Tooltip from "@components/Tooltip";

const WasmImageProcessor = () => {
  const inputId = useId();
  const inputRef = useRef(null);

  const [originalSrc, setOriginalSrc] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [filteredSrc, setFilteredSrc] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Cleanup object URLs on unmount or src change
  useEffect(() => {
    return () => {
      if (originalSrc) URL.revokeObjectURL(originalSrc);
      if (filteredSrc) URL.revokeObjectURL(filteredSrc);
    };
  }, [originalSrc, filteredSrc]);

  // Load original image
  const loadOriginal = useCallback(async (file) => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    setOriginalSrc(url);

    const { pixels, width, height } = await loadImageToUint8Array(file);
    setFileData({ pixels, width, height });
    setFilteredSrc(null); // clear previous filtered image
  }, []);

  // Paste support
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

  // Drag & drop
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      loadOriginal(e.dataTransfer.files[0]);
    },
    [loadOriginal]
  );

  const handleSelect = useCallback((e) => loadOriginal(e.target.files[0]), [loadOriginal]);

  const step = useCallback((p) => setProgress(p), []);

  // Apply bilateral filter
  const applyBilateralFilter = useCallback(async () => {
    if (!fileData) return;

    setIsProcessing(true);
    step(5);

    try {
      const { width, height, pixels } = fileData;
      step(20);

      const filteredPixels = await bilateralFilter({ pixels, width, height });
      step(80);

      // Convert filtered pixels to a data URL using canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      const imageData = new ImageData(new Uint8ClampedArray(filteredPixels), width, height);
      ctx.putImageData(imageData, 0, 0);

      const filteredDataUrl = canvas.toDataURL();
      setFilteredSrc(filteredDataUrl);

      step(100);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        step(0);
      }, 500);
    }
  }, [fileData, step]);

  // Empty state UI
  const EmptyState = useMemo(
    () => (
      <>
        <Tooltip content="Upload an image from your device">
          <Upload className={`anchor-style ${styles.uploadIcon}`} />
        </Tooltip>

        <p className={`text-center ${styles.dragDropText}`}>
          Drag & Drop or{" "}
          <Tooltip content="Select an image file from your computer">
            <span className={`anchor-style ${styles.noTextWrap}`}>Choose File</span>
          </Tooltip>
        </p>
      </>
    ),
    []
  );

  // Loaded state UI
  const LoadedState = useMemo(() => {
    if (!originalSrc) return null;

    return (
      <>
        <img src={originalSrc} alt="Original" className={styles.preview} />

        {!isProcessing ? (
          <Tooltip content="Apply bilateral filter">
            <button
              className="uppercase button"
              onClick={(e) => {
                e.stopPropagation();
                applyBilateralFilter();
              }}
            >
              Apply Filter
            </button>
          </Tooltip>
        ) : (
          <LoadingHedgehog progress={progress} text={`Processing – ${Math.round(progress)}%`} />
        )}

        {filteredSrc && (
          <>
            <h4 className="text-center">Filtered Output</h4>
            <img src={filteredSrc} alt="Filtered" className={styles.preview} />
          </>
        )}
      </>
    );
  }, [originalSrc, isProcessing, progress, applyBilateralFilter, filteredSrc]);

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
