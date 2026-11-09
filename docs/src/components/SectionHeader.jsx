import Link from "@docusaurus/Link";
import clsx from "clsx";
import { MoveRight } from "lucide-react";
import React from "react";
import styles from "./SectionHeader.module.css";

/**
 * A section title in the homepage's serif style, with an optional link on the right
 * ("Use it anywhere … See all bindings →"). `size="page"` is the large page title.
 * `link` is `{ to, label }`; external URLs open in a new tab like every Docusaurus Link.
 */
export default function SectionHeader({ as: Tag = "h2", size = "section", title, link, id, className }) {
  return (
    <div className={clsx(styles.header, size === "page" && styles.page, className)}>
      <Tag id={id} className={clsx(styles.title, size === "page" && styles.pageTitle)}>
        {title}
      </Tag>
      {link && (
        <Link className={styles.link} to={link.to}>
          {link.label} <MoveRight size={15} />
        </Link>
      )}
    </div>
  );
}
