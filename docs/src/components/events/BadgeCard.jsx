import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import CodeBlock from "@theme/CodeBlock";
import TabItem from "@theme/TabItem";
import Tabs from "@theme/Tabs";
import React from "react";
import { badgeSnippets } from "../../utils/events";
import Card from "../Card";
import CopyButton from "../CopyButton";
import BadgeImage from "./BadgeImage";
import BackgroundBand from "@site/src/components/BackgroundBand";
import styles from "./BadgeCard.module.css";

/**
 * The one badge every contributor gets, and every way to use it: Markdown or HTML to
 * paste, the image addresses to copy, open or download, and the page's own address as a
 * credential link. Each snippet links back here, which is how anyone can verify a badge.
 */
export default function BadgeCard({ event }) {
  const { siteConfig } = useDocusaurusContext();
  const { badge } = event;
  const { pageUrl, markdown, html, images } = badgeSnippets(siteConfig.url, event);

  return (
    <Card as="section" className={styles.card} aria-labelledby="badge-heading">
      <BadgeImage className={styles.image} badge={badge} alt={badge.alt} size={240} />

      <div className={styles.body}>
        <h2 id="badge-heading" className={styles.heading}>
          Your contributor badge
        </h2>
        <p>If you are listed on this page, this badge is yours. Everything below links back to this page, which is how anyone can check it is real.</p>

        <Tabs className={styles.tabs}>
          <TabItem value="markdown" label="Markdown" default>
            <p className={styles.hint}>For a GitHub profile README, GitLab, Dev.to — anywhere Markdown works.</p>
            <CodeBlock language="markdown">{markdown}</CodeBlock>
          </TabItem>

          <TabItem value="html" label="HTML">
            <p className={styles.hint}>
              For your own site, and GitHub READMEs too.
              {badge.imageDark && " This one switches to the dark badge with the reader's colour scheme."}
            </p>
            <CodeBlock language="html">{html}</CodeBlock>
          </TabItem>

          <TabItem value="images" label="Images">
            <p className={styles.hint}>For anywhere that wants an image address or an upload: a LinkedIn post, Notion, a signature, Discord. PNG is for places that refuse SVG.</p>
            <ul className={styles.files}>
              {images.map(({ label, url }) => (
                <li key={label} className={styles.file}>
                  <span className={styles.fileLabel}>{label}</span>
                  <code className={styles.fileUrl}>{url}</code>
                  <span className={styles.fileActions}>
                    <CopyButton text={url} label="Copy link" />
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      Open
                    </a>
                    <a href={url} download>
                      Download
                    </a>
                  </span>
                </li>
              ))}
            </ul>
          </TabItem>
        </Tabs>

        <p className={styles.credential}>
          No image needed on LinkedIn: add it under <strong>Licenses &amp; certifications</strong> with Img2Num as the issuer and this page as the credential URL.
        </p>
        <div className={styles.credentialRow}>
          <code className={styles.fileUrl}>{pageUrl}</code>
          <CopyButton text={pageUrl} label="Copy link" />
        </div>
      </div>
    </Card>
  );
}
