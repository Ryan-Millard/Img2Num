import { useEffect, useState, useId, useRef, useCallback, useMemo } from 'react';
import { Upload } from 'lucide-react';
import { loadImageToUint8Array, uint8ClampedArrayToSVG } from '@utils/image-utils';
import { useWasmWorker } from '@hooks/useWasmWorker';
import GlassCard from '@components/GlassCard';
import styles from './WasmImageProcessor.module.css';
import { useNavigate } from 'react-router-dom';
import LoadingHedgehog from '@components/LoadingHedgehog';

const WasmImageProcessor = () => {
  const navigate = useNavigate();
  const inputId = useId();
  const inputRef = useRef(null);

  const { gaussianBlur, blackThreshold, kmeans, mergeSmallRegionsInPlace } = useWasmWorker();

  const [originalSrc, setOriginalSrc] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

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

    const { pixels, width, height } = await loadImageToUint8Array(file);
    setFileData({ pixels, width, height });
  }, []);

  /* Paste support */
  useEffect(() => {
    const handlePaste = (e) => {
      for (const item of e.clipboardData?.items || []) {
        if (item.type.startsWith('image/')) {
          loadOriginal(item.getAsFile());
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [loadOriginal]);

  /* Drag & drop */
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      loadOriginal(e.dataTransfer.files[0]);
    },
    [loadOriginal]
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
      const blurred = await gaussianBlur(fileData);

      step(45);
      const thresholded = await blackThreshold({
        ...fileData,
        pixels: blurred,
        num_colors: 8,
      });

      step(70);
      const kmeansed = await kmeans({
        ...fileData,
        pixels: thresholded,
        num_colors: 8,
      });

      const minWidth = Math.ceil(Math.max(width / 50, 1)); // 2% of width or 1px
      const minHeight = Math.ceil(Math.max(height / 50, 1)); // 2% of width or 1px
      const area = width * height;
      // Prevents minArea from being too small
      const minimumAllowedMinArea = area > 100_000_000 ? 25 : area > 10_000_000 ? 20 : area > 1_000_000 ? 15 : 10;
      const minArea = Math.ceil(Math.max(area / 10_000, minimumAllowedMinArea));
      console.table({ minWidth, minHeight, minArea, area, minimumAllowedMinArea });
      const merged = await mergeSmallRegionsInPlace({
        pixels: kmeansed,
        width,
        height,
        minArea,
        minWidth,
        minHeight,
      });

      step(95);
      const svg = await uint8ClampedArrayToSVG({
        pixels: merged,
        width,
        height,
      });

      step(100);

      navigate('/editor', {
        state: { svg, imgData: { pixels: merged, width, height } },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        step(0);
      }, 800);
    }
  }, [fileData, gaussianBlur, blackThreshold, kmeans, mergeSmallRegionsInPlace, navigate, step]);

  /* Memo’d UI fragments */
  const EmptyState = useMemo(
    () => (
      <>
        <Upload className={`anchor-style ${styles.uploadIcon}`} title="Upload an image from your device" />
        <p className={`text-center ${styles.dragDropText}`}>
          Drag & Drop or <span className={`anchor-style ${styles.noTextWrap}`} title="Select an image file from your computer" >Choose File</span>
        </p>
      </>
    ),
    []
  );

  const LoadedState = useMemo(() => {
    if (!originalSrc) return null;

    return (
      <>
        <img src={originalSrc} alt="Original" className={styles.preview} />

        {!isProcessing ? (
          <button
            className="uppercase button"
            title="Process the image and convert it to numbers"
            onClick={(e) => {
              e.stopPropagation();
              processImage();
            }}>
            Ok
          </button>
        ) : (
          <LoadingHedgehog progress={progress} text={`Processing — ${Math.round(progress)}%`} />
        )}
      </>
    );
  }, [originalSrc, isProcessing, progress, processImage]);

  return (
    <GlassCard
      className={`flex-center flex-column ${styles.dropZone}`}
      title="Drag and drop an image here or click to choose a file"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => {
        if (!originalSrc) inputRef.current?.click();
      }}
      data-image-loaded={!!originalSrc}>
      {originalSrc ? LoadedState : EmptyState}

      <input ref={inputRef} id={inputId} type="file" accept="image/*" hidden title="Choose an image file to upload" onChange={handleSelect} />
    </GlassCard>
  );
};

export default WasmImageProcessor;
