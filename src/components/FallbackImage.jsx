import { useState } from 'react';

/**
 * Image with a fallback.
 *
 * @param {string} src - Image URL
 * @param {React.Component} fallback - React component to render on error
 * @param {object} style - Optional additional styles
 */
const FallbackImage = ({ src, fallback, ...rest }) => {
  const [hasError, setHasError] = useState(false);
  const FallbackComponent =
    typeof fallback === 'function'
      ? fallback
      : () => fallback;

  return (!src || hasError) ? (
    <FallbackComponent {...rest} />
  ): (
    <img
      src={src}
      onError={() => setHasError(true)}
      {...rest}
    />
  );
};

export default FallbackImage;
