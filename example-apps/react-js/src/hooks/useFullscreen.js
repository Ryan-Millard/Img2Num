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
  const ref = initialRef || useRef(document.documentElement);

  const open = useCallback(() => {
    const elem = ref.current;
    if (!elem) return;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }

    // Push state to detect back button
    window.history.pushState({}, "");
    window.addEventListener("popstate", close);
  }, [ref]);

  const close = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    window.removeEventListener("popstate", close);
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
      close();
    } else {
      open();
    }
  }, [open, close]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
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
