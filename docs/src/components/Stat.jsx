import { ArrowUpRight } from "lucide-react";
import React from "react";
import Card from "./Card";
import styles from "./Stat.module.css";

/**
 * One headline number on a card: an icon, the value and what it counts. With `to`, the
 * whole tile links there (a GitHub search, say) and shows an arrow.
 */
export default function Stat({ icon, value, label, to }) {
  return (
    <Card to={to} className={styles.stat}>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.text}>
        <span className={styles.value}>{value}</span>
        <span className={styles.label}>{label}</span>
      </span>
      {to && <ArrowUpRight className={styles.arrow} size={16} aria-hidden="true" />}
    </Card>
  );
}
