import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";
import { ArrowLeft, ExternalLink, GitPullRequest, Sparkles, Users } from "lucide-react";
import React from "react";
import Avatar from "../Avatar";
import Card from "../Card";
import CardGrid from "../CardGrid";
import PageHeader from "../PageHeader";
import Section from "../Section";
import SectionHeader from "../SectionHeader";
import Stat from "../Stat";
import BadgeCard from "./BadgeCard";
import BackgroundBand from "@site/src/components/BackgroundBand";
import styles from "./EventPage.module.css";

const DISCORD_URL = "https://discord.com/invite/BHjxcCqAnU";

/** Pull requests shown on a card before "and N more" takes over, so cards in a row stay the same height. */
const VISIBLE_PRS = 3;

function plural(count, singular, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/** The headline numbers. The first two link to GitHub filtered to the event's dates; GitHub has no filter for first-timers. */
function Stats({ event }) {
  const { stats, urls } = event;

  return (
    <div className={styles.stats}>
      <Stat icon={<Users size={22} />} value={stats.contributors} label={stats.contributors === 1 ? "contributor" : "contributors"} to={urls.contributors} />
      <Stat icon={<GitPullRequest size={22} />} value={stats.prs} label={stats.prs === 1 ? "merged pull request" : "merged pull requests"} to={urls.mergedPrs} />
      {stats.firstTime !== null && <Stat icon={<Sparkles size={22} />} value={stats.firstTime} label={stats.firstTime === 1 ? "first-time contributor" : "first-time contributors"} />}
    </div>
  );
}

/**
 * One contributor: who they are and what they merged. Always renders all three
 * subgrid rows (an empty footer when there is nothing more to link) so the rows
 * stay aligned with the neighbouring cards.
 */
function ContributorCard({ contributor }) {
  const { username, anchor, profileUrl, avatarUrl, firstTime, prs, allPrsUrl } = contributor;
  const hidden = prs.length - VISIBLE_PRS;

  return (
    <Card as="article" id={anchor} rows={3} className={styles.contributor}>
      {/* Row 1: who */}
      <div className={styles.contributorHeader}>
        <Avatar src={avatarUrl} name={username} />

        <div className={styles.contributorDetails}>
          <Link className={styles.contributorName} to={profileUrl}>
            <span className={styles.contributorLogin}>@{username}</span>
            <ExternalLink size={14} />
          </Link>

          <div className={styles.contributorMeta}>
            <span className={styles.prCount}>
              <GitPullRequest size={15} />
              {plural(prs.length, "merged pull request")}
            </span>
            {firstTime && <span className={styles.firstTime}>First contribution</span>}
          </div>
        </div>
      </div>

      {/* Row 2: what, capped so one prolific contributor cannot stretch the whole row */}
      <ul className={styles.prList}>
        {prs.slice(0, VISIBLE_PRS).map((pr) => (
          <li key={pr.number} className={styles.pr}>
            <Link className={styles.prNumber} to={pr.url}>
              #{pr.number}
            </Link>
            <span className={styles.prTitle}>{pr.title}</span>
          </li>
        ))}
      </ul>

      {/* Row 3: the rest, on GitHub */}
      {hidden > 0 ? (
        <Link className={styles.morePrs} to={allPrsUrl}>
          and {hidden} more on GitHub
          <ExternalLink size={12} />
        </Link>
      ) : (
        <div aria-hidden="true" />
      )}
    </Card>
  );
}

/** An event page. `event` is the prepared JSON the events plugin passes in. */
export default function EventPage({ event }) {
  // Social previews need a raster image, so prefer the PNG when the event has one.
  const socialImage = useBaseUrl(event.badge.png ?? event.badge.image, { absolute: true });
  const count = event.stats.contributors;

  return (
    <Layout title={event.title} description={event.tagline}>
      <Head>
        <meta property="og:image" content={socialImage} />
        <meta name="twitter:image" content={socialImage} />
      </Head>

      <BackgroundBand>
        <PageHeader
          before={
            <Link className={styles.backLink} to="/events/">
              <ArrowLeft size={14} />
              All events
            </Link>
          }
          eyebrow={event.dateRange}
          title={event.title}
          lead={event.tagline}
        >
          <Stats event={event} />
        </PageHeader>
      </BackgroundBand>

      <Section as="main">
        <BadgeCard event={event} />

        <Section className={styles.block} aria-labelledby="contributors-heading">
          <SectionHeader id="contributors-heading" title={`Contributors (${count})`} link={count > 0 ? { to: event.urls.mergedPrs, label: "All merged pull requests" } : undefined} />

          {count > 0 ? (
            <CardGrid size="md" aligned>
              {event.contributors.map((contributor) => (
                <ContributorCard key={contributor.username} contributor={contributor} />
              ))}
            </CardGrid>
          ) : (
            <Card as="p" className={styles.empty}>
              The contributor list is compiled once the event closes on {event.endText}. Check back soon.
            </Card>
          )}
        </Section>

        <Section className={styles.block} aria-label="Maintainers and next steps">
          <CardGrid size="sm">
            <Card>
              <h3 className={styles.asideHeading}>Reviewed and merged by</h3>
              <p>
                {event.maintainers.map((maintainer, index) => (
                  <React.Fragment key={maintainer.username}>
                    {index > 0 && ", "}
                    <Link to={maintainer.profileUrl}>@{maintainer.username}</Link>
                  </React.Fragment>
                ))}
              </p>
              <p className={styles.asideNote}>Maintainers' own pull requests are not counted above.</p>
            </Card>

            {event.links.length > 0 && (
              <Card>
                <h3 className={styles.asideHeading}>Read more</h3>
                <ul className={styles.asideList}>
                  {event.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to ?? link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <Card>
              <h3 className={styles.asideHeading}>Stay around</h3>
              <p>
                Contributors get the Contributor role and the private channel on <Link to={DISCORD_URL}>Discord</Link>. Post your GitHub username there and we will match it to this list.
              </p>
              <p className={styles.asideNote}>
                All-time credits live on the <Link to="/hall-of-fame/">Hall of Fame</Link>.
              </p>
            </Card>
          </CardGrid>
        </Section>
      </Section>
    </Layout>
  );
}
