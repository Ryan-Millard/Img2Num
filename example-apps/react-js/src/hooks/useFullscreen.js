import { useEffect, useRef, useCallback } from "react";

/**
 * React hook for managing fullscreen mode on an element.
 * Supports modern browsers, Safari, IE11.
 * Handles Escape key and browser back button to exit fullscreen.
 *
 * @param {React.RefObject<HTMLElement>} initialRef - Optional ref to the element to fullscreen
 * @returns {{
 *   ref: React.RefObject<HTMLElement>,
 *   open: () => void,
 *   close: () => void,
 *   toggle: () => void
 * }}
 */
export default function useFullscreen(initialRef) {
  const _fallbackRef = useRef(document.documentElement);
  const ref = initialRef || _fallbackRef;

  // Track whether THIS hook pushed history
  const hasPushedRef = useRef(false);

  const getFullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;

  const exitFullscreen = () => {
    if (document.exitFullscreen) return document.exitFullscreen();
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
    if (document.msExitFullscreen) return document.msExitFullscreen();
  };

  const requestFullscreen = (elem) => {
    if (elem.requestFullscreen) return elem.requestFullscreen();
    if (elem.webkitRequestFullscreen) return elem.webkitRequestFullscreen();
    if (elem.msRequestFullscreen) return elem.msRequestFullscreen();
  };

  const close = useCallback(() => {
    if (getFullscreenElement()) {
      exitFullscreen();
    }
  }, []);

  const open = useCallback(() => {
    const elem = ref.current;
    if (!elem) return;

    // Only request fullscreen — NO history manipulation here
    requestFullscreen(elem);
  }, [ref]);

  const toggle = useCallback(() => {
    if (getFullscreenElement()) {
      close();
    } else {
      open();
    }
  }, [open, close]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!getFullscreenElement();

      if (isFullscreen && !hasPushedRef.current) {
        // Entered fullscreen → push history
        window.history.pushState({ fullscreen: true }, "");
        window.addEventListener("popstate", close);
        hasPushedRef.current = true;
      }

      if (!isFullscreen && hasPushedRef.current) {
        // Exited fullscreen → clean up history
        window.removeEventListener("popstate", close);

        // Go back ONLY if we added a state
        if (window.history.state?.fullscreen) {
          window.history.back();
        }

        hasPushedRef.current = false;
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, [close]);

  useEffect(() => {
    const handleEscape = (e) => {
      // Only act if actually in fullscreen
      if (e.key === "Escape" && getFullscreenElement()) {
        close();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [close]);

  return { ref, open, close, toggle };
}
