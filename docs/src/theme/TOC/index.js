import React from "react";
import clsx from "clsx";
import TOCItems from "@theme/TOCItems";
import CopyPageButton from "docusaurus-plugin-copy-page-button/react";
import styles from "./index.module.css";
import GitHub from "@site/static/img/github.svg";
import Link from "@docusaurus/Link";

export default function TOCWrapper(props) {
  const LINK_CLASS_NAME = "table-of-contents__link toc-highlight";
  const LINK_ACTIVE_CLASS_NAME = "table-of-contents__link--active";

  return (
    <aside className={styles.tocContainer}>
      <div className={clsx(styles.tableOfContents, "thin-scrollbar", props.className)}>
        <p className={styles.tocHeader}>Contents</p>

        <TOCItems
          {...props}
          linkClassName={LINK_CLASS_NAME}
          linkActiveClassName={LINK_ACTIVE_CLASS_NAME}
        />
      </div>

      <div className={styles.copyContainer}>
        <CopyPageButton generateMarkdownRoutes />
      </div>

      <Link
        href="https://github.com/Ryan-Millard/Img2Num/issues/new"
        className={styles.reportIssueLink}
      >
        <GitHub className={styles.githubIcon} />
        <span>Report issue</span>
      </Link>
    </aside>
  );
}
