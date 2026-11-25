import clsx from "clsx";
import React from "react";
import styles from "./CardGrid.module.css";

/**
 * A responsive grid of cards: as many columns of at least the `size` width as fit
 * ("sm" 260px, "md" 320px, "lg" 360px), one column on narrow screens.
 *
 * `aligned` is for cards with varying amounts of content: give each child Card a `rows`
 * count and its parts line up with the neighbouring cards (CSS subgrid) instead of one
 * long card stretching the whole row.
 */
export default function CardGrid({ size = "md", aligned = false, className, children, ...rest }) {
  return (
    <div className={clsx(styles.grid, styles[size], aligned && styles.aligned, className)} {...rest}>
      {children}
    </div>
  );
}
