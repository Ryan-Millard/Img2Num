import { useEffect, useState, useId, useRef, useCallback, useMemo } from 'react';
import { Upload } from 'lucide-react';
import { loadImageToUint8Array, uint8ClampedArrayToSVG } from '@utils/image-utils';
import { useWasmWorker } from '@hooks/useWasmWorker';
import GlassCard from '@components/GlassCard';
import styles from './WasmImageProcessor.module.css';
import { useNavigate } from 'react-router-dom';
import LoadingHedgehog from '@components/LoadingHedgehog';
import Tooltip from '@components/Tooltip';

const WasmImageProcessor = () => {
  const navigate = useNavigate();
  const inputId = useId();
  const inputRef = useRef(null);

  const { bilateralFilter, blackThreshold, kmeans, mergeSmallRegionsInPlace } = useWasmWorker();

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
      // NOTE: Gaussian blur destroys the sharp outlines first, preventing the Bilateral filter from detecting and preserving them
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
      const { pixels: kmeansed, labels } = await kmeans({
        ...fileData,
        pixels: thresholded,
        num_colors: 8,
      });
      console.log(kmeansed);

      // TODO: Remove the below and uncomment the code underneath
      setOriginalSrc(( (pixels, width, height) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imageData = new ImageData(pixels, width, height);
        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL(); // or URL.createObjectURL(blob)
      } )(kmeansed, fileData.width, fileData.height));

      //// Get 2% of the input dimension (width / height), but default to 1 pixel
      //const twoPercentOrOne = (dimension) => Math.ceil(Math.max(dimension * 0.02, 1));
      //const minWidth = twoPercentOrOne(width);
      //const minHeight = twoPercentOrOne(height);

      //const area = width * height;
      //// Prevents minArea from being too small
      //const minimumAllowedMinArea = area > 100_000_000 ? 25 : area > 10_000_000 ? 20 : area > 1_000_000 ? 15 : 10;
      //const minArea = Math.ceil(Math.max(area / 10_000, minimumAllowedMinArea));

      //const merged = await mergeSmallRegionsInPlace({
        //pixels: kmeansed,
        //width,
        //height,
        //minArea,
        //minWidth,
        //minHeight,
      //});

      //step(95);
      //const svg = await uint8ClampedArrayToSVG({
        //pixels: merged,
        //width,
        //height,
      //});

      //step(100);

      //navigate('/editor', {
        //state: { svg },
      //});
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        step(0);
      }, 800);
    }
  }, [fileData, bilateralFilter, blackThreshold, kmeans, mergeSmallRegionsInPlace, navigate, step]);

  /* Memo'd UI fragments */
  const EmptyState = useMemo(
    () => (
      <>
        <Tooltip content="Upload an image from your device">
          <Upload className={`anchor-style ${styles.uploadIcon}`} />
        </Tooltip>

        <p className={`text-center ${styles.dragDropText}`}>
          Drag & Drop or{' '}
          <Tooltip content="Select an image file from your computer">
            <span className={`anchor-style ${styles.noTextWrap}`}>Choose File</span>
          </Tooltip>
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
          <Tooltip content="Process the image and convert it to numbers">
            <button
              className="uppercase button"
              onClick={(e) => {
                e.stopPropagation();
                processImage();
              }}>
              Ok
            </button>
          </Tooltip>
        ) : (
          <LoadingHedgehog progress={progress} text={`Processing — ${Math.round(progress)}%`} />
        )}
      </>
    );
  }, [originalSrc, isProcessing, progress, processImage]);

  return (
    <GlassCard
      className={`flex-center flex-column ${styles.dropZone}`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => {
        if (!originalSrc) inputRef.current?.click();
      }}
      data-image-loaded={!!originalSrc}>
      {originalSrc ? LoadedState : EmptyState}

      <input ref={inputRef} id={inputId} type="file" accept="image/*" hidden onChange={handleSelect} />
    </GlassCard>
  );
};

export default WasmImageProcessor;
