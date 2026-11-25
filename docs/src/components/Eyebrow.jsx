import clsx from "clsx";
import React from "react";
import styles from "./Eyebrow.module.css";

/**
 * The homepage's eyebrow: a short accent bar and a small mono, uppercase label above a
 * title ("filter · segment · trace"). `compact` is the smaller version for inside cards.
 */
export default function Eyebrow({ as: Tag = "div", compact = false, className, children, ...rest }) {
  return (
    <Tag className={clsx(styles.eyebrow, compact && styles.compact, className)} {...rest}>
      <span className={styles.bar} aria-hidden="true" />
      {children}
    </Tag>
  );
}
