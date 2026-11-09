import clsx from "clsx";
import React from "react";
import styles from "./Section.module.css";

/**
 * The page frame the homepage sections sit in: centred, 1400px wide, with the same
 * padding everywhere. `wide` (2400px) is for pages that are mostly card grids, so big
 * screens get more columns instead of a narrow column with empty sides.
 *
 * Use it for `<main>` too (`as="main"`): Docusaurus wraps pages in a flex column, and
 * without an explicit width a centred main shrinks to its content.
 */
export default function Section({ as: Tag = "section", wide = false, className, children, ...rest }) {
  return (
    <Tag className={clsx(styles.section, wide && styles.wide, className)} {...rest}>
      {children}
    </Tag>
  );
}
