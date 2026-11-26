import clsx from "clsx";
import React from "react";
import Eyebrow from "./Eyebrow";
import SectionHeader from "./SectionHeader";
import styles from "./PageHeader.module.css";

/**
 * The top of a page, in the showcase's style: an eyebrow, the big serif title with an
 * optional link beside it (`{ to, label }`), and a lead paragraph. `before` renders above
 * the eyebrow (a back link, say) and children render below the lead (headline numbers, say).
 */
export default function PageHeader({ eyebrow, title, lead, link, before, children, className }) {
  return (
    <header className={clsx(styles.header, className)}>
      {before}
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <SectionHeader as="h1" size="page" title={title} link={link} />
      {lead && <p className={styles.lead}>{lead}</p>}
      {children}
    </header>
  );
}
