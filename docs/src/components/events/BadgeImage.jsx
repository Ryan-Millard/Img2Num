import useBaseUrl from "@docusaurus/useBaseUrl";
import ThemedImage from "@theme/ThemedImage";
import React from "react";

/** An event's badge, switching to the dark variant with the site theme when the event has one. */
export default function BadgeImage({ badge, alt, className, size }) {
  const light = useBaseUrl(badge.image);
  const dark = useBaseUrl(badge.imageDark ?? badge.image);

  if (!badge.imageDark) {
    return <img className={className} src={light} alt={alt} width={size} height={size} />;
  }
  return <ThemedImage className={className} sources={{ light, dark }} alt={alt} width={size} height={size} />;
}
