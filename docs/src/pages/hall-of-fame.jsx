import Link from "@docusaurus/Link";
import { usePluginData } from "@docusaurus/useGlobalData";
import Layout from "@theme/Layout";
import clsx from "clsx";
import { ExternalLink, GitCommit, GitPullRequest } from "lucide-react";
import React from "react";
import Avatar from "../components/Avatar";
import Card from "../components/Card";
import CardGrid from "../components/CardGrid";
import EventList from "../components/events/EventList";
import PageHeader from "../components/PageHeader";
import Section from "../components/Section";
import BackgroundBand from "@site/src/components/BackgroundBand";
import SectionHeader from "../components/SectionHeader";
import styles from "./hall-of-fame.module.css";

const CONTRIBUTORS_URL = "https://github.com/Ryan-Millard/Img2Num/graphs/contributors";

/** How many of the newest events the Hall of Fame shows before pointing at /events/. */
const RECENT_EVENTS = 3;

/**
 * A featured member. The card has four parts (header, blurb, PR count, PR list) on
 * aligned subgrid rows, so the same part lines up across every card in a row however
 * much each member has to show; empty parts render as placeholders to keep the rows.
 */
function FeaturedCard({ member }) {
  const prs = member.recentPRs.slice(0, 3);

  return (
    <Card rows={4}>
      {/* Row 1: profile header */}
      <div className={styles.featuredHeader}>
        <Avatar src={member.avatarUrl} name={member.name} size="md" />

        <div className={styles.featuredDetails}>
          <Link className={styles.featuredName} to={member.profileUrl}>
            {member.name}
            <ExternalLink size={14} />
          </Link>
          <div className={styles.featuredLogin}>@{member.username}</div>
        </div>
      </div>

      {/* Row 2: blurb */}
      {member.blurb ? <p className={styles.blurb}>"{member.blurb}"</p> : <div aria-hidden="true" />}

      {/* Row 3: merged PR count */}
      {member.mergedPRCount !== null ? (
        <div className={styles.prCount}>
          <GitPullRequest size={16} />
          <span>
            {member.mergedPRCount} Merged Pull Request
            {member.mergedPRCount === 1 ? "" : "s"}
          </span>
        </div>
      ) : (
        <div aria-hidden="true" />
      )}

      {/* Row 4: recent PRs */}
      {prs.length > 0 ? (
        <ul className={styles.prList}>
          {prs.map((pr) => (
            <li key={pr.number}>
              <Link to={pr.url}>
                #{pr.number}: {pr.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div aria-hidden="true" />
      )}
    </Card>
  );
}

/** Compact card for the "All Contributors" grid. */
function ContributorCard({ contributor }) {
  const { username, avatarUrl, profileUrl, contributions } = contributor;

  return (
    <Card to={profileUrl} className={styles.contributor} title={`Open ${username}'s GitHub profile`}>
      <Avatar src={avatarUrl} name={username} size="sm" />

      <div className={styles.contributorDetails}>
        <div className={styles.contributorName}>{username}</div>
        <div className={styles.contributorCommits}>
          <GitCommit size={14} />
          {contributions} {contributions === 1 ? "commit" : "commits"}
        </div>
      </div>
    </Card>
  );
}

export default function HallOfFame() {
  const { featured = [], contributors = [] } = usePluginData("hall-of-fame");
  const { events = [] } = usePluginData("contributor-events");

  return (
    <Layout title="Hall of Fame" description="Honoring top contributors and featured community members of Img2Num.">
      <BackgroundBand>
        <PageHeader
          eyebrow="featured members · every contributor"
          title="Hall of Fame"
          lead={
            <>
              Celebrating the key contributors whose efforts helped build, refine, and expand Img2Num. Featured members are hand-picked by the maintainers. See everyone on the{" "}
              <Link to={CONTRIBUTORS_URL}>full contributors list</Link>.
            </>
          }
        />
      </BackgroundBand>

      <main>
        {/* The newest contributor events (Hacktoberfest, ...). Every event has a page under /events/ */}
        {events.length > 0 && (
          <Section>
            <SectionHeader title="Recent events" link={{ to: "/events/", label: "All events" }} />
            <EventList events={events.slice(0, RECENT_EVENTS)} />
          </Section>
        )}

        {/* Featured members, grouped by year */}
        <BackgroundBand>
          {featured.map(({ year, members }) => (
            <Section key={year}>
              <SectionHeader title={year} className={styles.featureSectionHeader} />
              <CardGrid size="md" aligned>
                {members.map((member) => (
                  <FeaturedCard key={member.username} member={member} />
                ))}
              </CardGrid>
            </Section>
          ))}
        </BackgroundBand>

        {/* Every contributor to the repository */}
        <BackgroundBand style={{ backgroundColor: "var(--accent)" }}>
          {contributors.length > 0 && (
            <section>
              <SectionHeader title={`All Contributors (${contributors.length})`} className={styles.allContributorsSectionHeader} />
              <CardGrid size="sm">
                {contributors.map((c) => (
                  <ContributorCard key={c.username} contributor={c} />
                ))}
              </CardGrid>
            </section>
          )}
        </BackgroundBand>
      </main>
    </Layout>
  );
}
