import clsx from "clsx";
import React, { useState } from "react";
import styles from "./Avatar.module.css";

const PIXELS = { sm: 40, md: 48 };

/**
 * Round avatar. Falls back to the first letter of the name when there is no image URL or
 * the image fails to load (a GitHub avatar behind a rate limit, say). `size` is "sm" (40px)
 * or "md" (48px).
 */
export default function Avatar({ src, name, size = "md" }) {
  const [failed, setFailed] = useState(false);
  const className = clsx(styles.avatar, styles[size]);

  if (src && !failed) {
    return <img className={className} src={src} alt={`${name}'s avatar`} loading="lazy" width={PIXELS[size]} height={PIXELS[size]} onError={() => setFailed(true)} />;
  }

  return (
    <div className={clsx(className, styles.fallback)} aria-hidden="true">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
