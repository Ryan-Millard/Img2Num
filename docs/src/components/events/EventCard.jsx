import { GitPullRequest, MoveRight, Sparkles, Users } from "lucide-react";
import React from "react";
import Card from "../Card";
import Eyebrow from "../Eyebrow";
import BadgeImage from "./BadgeImage";
import styles from "./EventCard.module.css";

/** One event: its badge, when it ran, what it was and the headline numbers. The whole card links to the event page. */
export default function EventCard({ event }) {
  const { contributors, prs, firstTime } = event.stats;

  return (
    <Card to={event.path} className={styles.card}>
      <BadgeImage className={styles.badge} badge={event.badge} alt="" size={168} />

      <div className={styles.body}>
        <Eyebrow compact>{event.dateRange}</Eyebrow>
        <h3 className={styles.title}>{event.title}</h3>
        <p className={styles.tagline}>{event.tagline}</p>

        {contributors > 0 ? (
          <div className={styles.stats}>
            <span className={styles.stat}>
              <Users size={15} />
              {contributors} {contributors === 1 ? "contributor" : "contributors"}
            </span>
            <span className={styles.stat}>
              <GitPullRequest size={15} />
              {prs} merged pull {prs === 1 ? "request" : "requests"}
            </span>
            {firstTime !== null && (
              <span className={styles.stat}>
                <Sparkles size={15} />
                {firstTime} first-time
              </span>
            )}
          </div>
        ) : (
          <p className={styles.pending}>The contributor list is compiled once the event closes on {event.endText}.</p>
        )}

        <span className={styles.cta}>
          See everyone who took part <MoveRight size={15} />
        </span>
      </div>
    </Card>
  );
}
