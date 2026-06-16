import styles from "@site/src/css/changelog/topLevelIndex/PackageRow.module.css";

export default function PackageRow({ name, label, iconSrc, iconAlt, pkgHref, latestHref, badgeText }) {
  return (
    <div className={styles.container}>
      <h2 id={label.toLowerCase()}>
        <a href={pkgHref}>{label}</a>
      </h2>

      <div className={styles.body}>
        <p className={styles.pkgName}>
          Changelog:{" "}
          <a href={pkgHref}>
            <code>{name}</code>
          </a>
        </p>
        <p className={styles.meta}>
          Latest:{" "}
          <a href={latestHref} className={styles.badge}>
            {badgeText}
          </a>
        </p>
      </div>

      <div className={styles.iconWrap}>
        <a href={pkgHref}>
          <img src={iconSrc} alt={iconAlt} className={styles.icon} />
        </a>
      </div>
    </div>
  );
}
