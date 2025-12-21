import PropTypes from 'prop-types';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { useId } from 'react';

export default function Tooltip({
  content,
  children,
  id,
  dynamicPositioning = true,
}) {
  const reactId = useId();
  const tooltipId = id || `tooltip-${reactId}`;

  return (
    <>
      <span data-tooltip-id={tooltipId} data-tooltip-content={content}>
        {children}
      </span>

      <ReactTooltip
        id={tooltipId}
        place="right"
        appendTo={document.body}
        positionStrategy="fixed"
        fallbackPlacements={
          dynamicPositioning ? ['bottom', 'top', 'left'] : []
        }
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
