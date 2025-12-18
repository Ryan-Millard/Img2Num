import PropTypes from 'prop-types';
import { Tooltip as ReactTooltip } from 'react-tooltip';

export default function Tooltip({ content, children, id }) {
  if (!content) {
    throw new Error('Tooltip requires a `content` prop');
  }

  const tooltipId = id || `tooltip-${Math.random().toString(36).slice(2)}`;

  return (
    <>
      <span data-tooltip-id={tooltipId} data-tooltip-content={content}>
        {children}
      </span>

      <ReactTooltip id={tooltipId} />
    </>
  );
}

Tooltip.propTypes = {
  content: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  id: PropTypes.string,
};
