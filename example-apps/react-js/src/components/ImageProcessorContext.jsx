import { createContext, useContext, useState, useCallback, useRef } from "react";

/**
 * Shares the processor's image state with distant components (e.g. the
 * TourButton inside Hero) without prop-drilling through Home.
 *
 * Wiring inside WasmImageProcessor (two small additions):
 *
 *   const { setImageLoaded, registerReset } = useImageProcessor();
 *
 *   // whenever an image is accepted / cleared:
 *   setImageLoaded(true);   // or false
 *
 *   // once, on mount — tell the context how to clear the image:
 *   useEffect(() => registerReset(() => {
 *     // ...your existing "clear image / back to dropzone" logic
 *   }), [registerReset]);
 */
const ImageProcessorContext = createContext(null);

export function ImageProcessorProvider({ children }) {
  const [isImageLoaded, setImageLoaded] = useState(false);
  const resetRef = useRef(null);

  const registerReset = useCallback((fn) => {
    resetRef.current = fn;
    return () => {
      if (resetRef.current === fn) resetRef.current = null;
    };
  }, []);

  const resetImage = useCallback(() => {
    resetRef.current?.();
    setImageLoaded(false);
  }, []);

  return (
    <ImageProcessorContext.Provider
      value={{ isImageLoaded, setImageLoaded, registerReset, resetImage }}
    >
      {children}
    </ImageProcessorContext.Provider>
  );
}

export function useImageProcessor() {
  const ctx = useContext(ImageProcessorContext);
  if (!ctx) {
    throw new Error("useImageProcessor must be used within ImageProcessorProvider");
  }
  return ctx;
}
