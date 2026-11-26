import React from "react";
import EventCard from "./EventCard";
import styles from "./EventList.module.css";

/** Event cards two abreast where there is room; a single event takes the whole row. */
export default function EventList({ events }) {
  return (
    <div className={styles.list}>
      {events.map((event) => (
        <EventCard key={event.slug} event={event} />
      ))}
    </div>
  );
}
