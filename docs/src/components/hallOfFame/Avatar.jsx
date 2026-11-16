import React from "react";

/** Round avatar with an initial-letter fallback when no image URL exists. */
export default function Avatar({ src, name, size }) {
  if (src) {
    return <img src={src} alt={`${name}'s avatar`} loading="lazy" width={size} height={size} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  }

  return (
    <div
      aria-hidden="true"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--ifm-color-emphasis-200)",
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
