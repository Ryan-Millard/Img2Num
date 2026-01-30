import PropTypes from "prop-types";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { useState, useEffect, useRef, useId, cloneElement, isValidElement } from "react";

export default function Tooltip({ children, content = "Tooltip content", id = undefined, position = "right", dynamicPositioning = true }) {
  const reactId = useId();
  const tooltipId = id ?? `tooltip-${reactId}`;

  const [isOpen, setIsOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const hideTimeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Detect touch devices only on the client, after mount
  useEffect(() => {
    let mediaQuery;

    const detectTouch = () => {
      // Method 1: Check touch points (most reliable)
      if (navigator.maxTouchPoints > 0) {
        return true;
      }

      // Method 2: Check pointer media query
      if (window.matchMedia("(any-pointer: coarse)").matches) {
        return true;
      }

      // Method 3: Fallback for older browsers
      if ("ontouchstart" in window) {
        return true;
      }

      return false;
    };

    setIsTouchDevice(detectTouch());

    // Optional: Listen for input changes (e.g., plugging in a mouse)
    mediaQuery = window.matchMedia("(any-pointer: coarse)");
    const handleChange = () => setIsTouchDevice(detectTouch());

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    }

    // Cleanup listener on unmount
    return () => {
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      }
    };
  }, []);

  //onTouch open Tooltip
  const showTooltip = () => {
    if (!isTouchDevice) return;

    // Bail if ref is not a valid ref object (defensive in hot-reload scenarios)
    if (!hideTimeoutRef || typeof hideTimeoutRef !== "object") {
      return;
    }

    // Clear any existing timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    // If already open, don't re-open (prevents unnecessary re-render)
    setIsOpen((prev) => {
      if (prev) return prev; // Already open, don't update
      return true;
    });

    // auto hides after 1 sec.
    hideTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 1000);
  };

  const handleFocus = () => {
    if (isTouchDevice) {
      showTooltip();
    }
  };
  // If child is a single valid React element, attach tooltip attributes
  const childWithTooltip = isValidElement(children) ? (
    cloneElement(children, {
      "data-tooltip-id": tooltipId,
      "data-tooltip-content": content,
      onClick: (e) => {
        children.props.onClick?.(e);
        showTooltip(e);
      },
      onFocus: (e) => {
        children.props.onFocus?.(e);
        handleFocus(e);
      },
    })
  ) : (
    <span data-tooltip-id={tooltipId} data-tooltip-content={content} tabIndex={0} onClick={showTooltip} onFocus={handleFocus}>
      {children}
    </span>
  );

  return (
    <>
      {childWithTooltip}
      <ReactTooltip
        id={tooltipId}
        place={position}
        appendTo={typeof document !== "undefined" ? document.body : undefined}
        positionStrategy="absolute"
        fallbackPlacements={dynamicPositioning ? ["bottom", "top", "left"] : []}
        openOnFocus
        isOpen={isTouchDevice ? isOpen : undefined}
      />
    </>
  );
}

Tooltip.propTypes = {
  content: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  id: PropTypes.string.isRequired,
  dynamicPositioning: PropTypes.bool.isRequired,
  position: PropTypes.string.isRequired,
};
