import Link from "@docusaurus/Link";
import clsx from "clsx";
import React from "react";
import styles from "./Card.module.css";

/**
 * The site's card: a white panel with a soft border that lifts and lights up on hover, as the
 * homepage cards do.
 *
 * - `to`: an internal path or external URL makes the whole card a link (external ones open
 *   in a new tab, as every Docusaurus Link does).
 * - `as`: the element to render otherwise (default "div").
 * - `rows`: inside an aligned `CardGrid`, the number of subgrid rows this card spans, so each
 *   part lines up with the neighbouring cards.
 *
 * The frame leaves the inside alone: set display, gap and so on from your own class, and
 * change the padding by setting `--card-padding` in that class.
 */
export default function Card({ as: Tag = "div", to, rows, className, children, ...rest }) {
  const classes = clsx(styles.card, to && styles.link, rows && styles[`rows${rows}`], className);

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
