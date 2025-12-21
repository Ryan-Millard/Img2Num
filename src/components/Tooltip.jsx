import PropTypes from 'prop-types';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { useId, cloneElement, isValidElement } from 'react';

export default function Tooltip({
  content,
  children,
  id,
  dynamicPositioning = true,
}) {
  const reactId = useId();
  const tooltipId = id || `tooltip-${reactId}`;

  // If child is a single valid React element, attach tooltip attributes
  const childWithTooltip = isValidElement(children)
    ? cloneElement(children, {
        'data-tooltip-id': tooltipId,
        'data-tooltip-content': content,
      })
    : (
      <span
        data-tooltip-id={tooltipId}
        data-tooltip-content={content}
        tabIndex={0}
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
        appendTo={document.body}
        positionStrategy="fixed"
        fallbackPlacements={dynamicPositioning ? ['bottom', 'top', 'left'] : []}
        openOnFocus
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
