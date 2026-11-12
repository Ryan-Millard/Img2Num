import { usePluginData } from "@docusaurus/useGlobalData";
import Layout from "@theme/Layout";
import React from "react";
import EventList from "../components/events/EventList";
import PageHeader from "../components/PageHeader";
import Section from "../components/Section";
import SectionHeader from "../components/SectionHeader";
import BackgroundBand from "@site/src/components/BackgroundBand";
import styles from "./events.module.css";

/** Every contributor event, newest first, grouped by year like the Hall of Fame. */
export default function Events() {
  const { events = [] } = usePluginData("contributor-events");
  const years = [...new Set(events.map((event) => event.year))];

  return (
    <Layout title="Events" description="Hacktoberfest and other events where the community shipped Img2Num forward, with everyone who took part.">
      <BackgroundBand>
        <PageHeader
          eyebrow="hacktoberfest · sprints · badges"
          title="Events"
          link={{ to: "/hall-of-fame/", label: "Hall of Fame" }}
          lead="Hacktoberfest and other events where the community shipped Img2Num forward. Each page lists everyone who had a pull request merged and the badge they earned."
        />
      </BackgroundBand>

      <Section as="main">
        {years.map((year) => (
          <section key={year} className={styles.year}>
            <SectionHeader title={year} />
            <EventList events={events.filter((event) => event.year === year)} />
          </section>
        ))}

        {events.length === 0 && <p className={styles.empty}>No events yet.</p>}
      </Section>
    </Layout>
  );
}
