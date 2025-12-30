import PropTypes from 'prop-types';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import {
  useId,
  cloneElement,
  isValidElement,
  useState,
} from 'react';

export default function Tooltip({
  content,
  children,
  id,
  dynamicPositioning = true,
}) {
  const reactId = useId();
  const tooltipId = id || `tooltip-${reactId}`;
  const [isOpen, setIsOpen] = useState(false);

  // Detect touch-capable devices (mobile/tablet). Guard for SSR.
  const isTouchDevice = typeof window !== 'undefined' && (
    (typeof navigator !== 'undefined' && Number(navigator.maxTouchPoints) > 0) ||
    (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches)
  );

  // On touch: open + auto-close after 1s
  const showTooltip = () => {
    if (!isTouchDevice) return;

    setIsOpen(true);
    setTimeout(() => setIsOpen(false), 1000);
  };

    // If child is a single valid React element, attach tooltip attributes
  const childWithTooltip = isValidElement(children)
    ? cloneElement(children, {
        'data-tooltip-id': tooltipId,
        'data-tooltip-content': content,
        onClick: showTooltip,
      })
    : (
      <span
        data-tooltip-id={tooltipId}
        data-tooltip-content={content}
        tabIndex={0}
        onClick={showTooltip}
      >
        {children}
      </span>
    );

  return (
    <>
      {childWithTooltip}

      <ReactTooltip
        id={tooltipId}
        place="right"
        appendTo={typeof document !== 'undefined' ? document.body : undefined}
        positionStrategy="fixed"
        fallbackPlacements={dynamicPositioning ? ['bottom', 'top', 'left'] : []}
        openOnFocus
        isOpen={isTouchDevice ? isOpen : undefined}
      />
    </>
  );
}

Tooltip.propTypes = {
  content: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  id: PropTypes.string,
  dynamicPositioning: PropTypes.bool,
};
