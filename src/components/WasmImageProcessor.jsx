import { useEffect, useState, useId, useRef, useCallback, useMemo } from 'react';
import { Upload } from 'lucide-react';
import { loadImageToUint8Array } from '@utils/image-utils';
import { useWasmWorker } from '@hooks/useWasmWorker';
import GlassCard from '@components/GlassCard';
import LoadingHedgehog from '@components/LoadingHedgehog';
import Tooltip from '@components/Tooltip';
import styles from './WasmImageProcessor.module.css';

const WasmImageProcessor = () => {
  const inputId = useId();
  const inputRef = useRef(null);
  const contourCanvasRef = useRef(null);
  const mergedCanvasRef = useRef(null);

  const {
    bilateralFilter,
    blackThreshold,
    kmeans,
    mergeSmallRegionsInPlace,
    findContours,
  } = useWasmWorker();

  const [originalSrc, setOriginalSrc] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [mergedData, setMergedData] = useState(null);
  const [contourData, setContourData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  /* Cleanup object URLs */
  useEffect(() => {
    return () => {
      if (originalSrc) URL.revokeObjectURL(originalSrc);
    };
  }, [originalSrc]);

  /* Load image */
  const loadOriginal = useCallback(async (file) => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    setOriginalSrc(url);
    setMergedData(null);
    setContourData(null);

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

  const handleSelect = useCallback(
    (e) => loadOriginal(e.target.files[0]),
    [loadOriginal]
  );

  const step = useCallback((p) => setProgress(p), []);

  /* Main pipeline */
  const processImage = useCallback(async () => {
    if (!fileData) return;
    setIsProcessing(true);
    step(5);

    try {
      const { width, height } = fileData;

      step(20);
      const imgBilateralFiltered = await bilateralFilter({
        pixels: fileData.pixels,
        width,
        height,
      });

      step(45);
      const thresholded = await blackThreshold({
        ...fileData,
        pixels: imgBilateralFiltered,
        num_colors: 8,
      });

      step(70);
      const kmeansed = await kmeans({
        ...fileData,
        pixels: thresholded,
        num_colors: 8,
      });

      const twoPercentOrOne = (dimension) =>
        Math.ceil(Math.max(dimension * 0.02, 1));

      const minWidth = twoPercentOrOne(width);
      const minHeight = twoPercentOrOne(height);

      const area = width * height;
      const minimumAllowedMinArea =
        area > 100_000_000
          ? 25
          : area > 10_000_000
          ? 20
          : area > 1_000_000
          ? 15
          : 10;

      const minArea = Math.ceil(
        Math.max(area / 10_000, minimumAllowedMinArea)
      );

      step(75);
      const merged = await mergeSmallRegionsInPlace({
        pixels: kmeansed,
        width,
        height,
        minArea,
        minWidth,
        minHeight,
      });

      // Save merged image for display
      setMergedData({ pixels: merged, width, height });

      step(90);
      const contours = await findContours({
        pixels: merged,
        width,
        height,
      });

      setContourData({ pixels: contours, width, height });
      step(100);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        step(0);
      }, 800);
    }
  }, [
    fileData,
    bilateralFilter,
    blackThreshold,
    kmeans,
    mergeSmallRegionsInPlace,
    findContours,
    step,
  ]);

  /* Draw merged canvas */
  useEffect(() => {
    if (!mergedData || !mergedCanvasRef.current) return;
    const { pixels, width, height } = mergedData;
    const canvas = mergedCanvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(new ImageData(pixels, width, height), 0, 0);
  }, [mergedData]);

  /* Draw contours canvas */
  useEffect(() => {
    if (!contourData || !contourCanvasRef.current) return;
    const { pixels, width, height } = contourData;
    const canvas = contourCanvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(new ImageData(pixels, width, height), 0, 0);
  }, [contourData]);

  /* UI fragments */
  const EmptyState = useMemo(() => (
    <>
      <Tooltip content="Upload an image from your device">
        <Upload className={`anchor-style ${styles.uploadIcon}`} />
      </Tooltip>

      <p className={`text-center ${styles.dragDropText}`}>
        Drag & Drop or{' '}
        <Tooltip content="Select an image file from your computer">
          <span className={`anchor-style ${styles.noTextWrap}`}>
            Choose File
          </span>
        </Tooltip>
      </p>
    </>
  ), []);

  const LoadedState = useMemo(() => {
    if (!originalSrc) return null;

    return (
      <>
        <div className={styles.imageSection}>
          <p className={styles.previewLabel}>Original Image</p>
          <img src={originalSrc} alt="Original" className={styles.preview} />
        </div>

        {mergedData && (
          <div className={styles.imageSection}>
            <p className={styles.previewLabel}>Merged Regions</p>
            <canvas ref={mergedCanvasRef} className={styles.preview} />
          </div>
        )}

        {!isProcessing ? (
          <Tooltip content="Process the image and extract contours">
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
        ) : (
          <LoadingHedgehog
            progress={progress}
            text={`Processing – ${Math.round(progress)}%`}
          />
        )}

        {contourData && (
          <div className={styles.imageSection}>
            <p className={styles.previewLabel}>Contours</p>
            <canvas ref={contourCanvasRef} className={styles.preview} />
          </div>
        )}
      </>
    );
  }, [originalSrc, mergedData, contourData, isProcessing, progress, processImage]);

  return (
    <GlassCard
      className={`flex-center flex-column ${styles.dropZone}`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => !originalSrc && inputRef.current?.click()}
      data-image-loaded={!!originalSrc}
    >
      {originalSrc ? LoadedState : EmptyState}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        hidden
        onChange={handleSelect}
      />
    </GlassCard>
  );
};

export default WasmImageProcessor;

