import React from "react";
import Layout from "@theme/Layout";
import { usePluginData } from "@docusaurus/useGlobalData";
import { GitPullRequest, ExternalLink, GitCommit } from "lucide-react";

const CONTRIBUTORS_URL = "https://github.com/Ryan-Millard/Img2Num/graphs/contributors";

/**
 * Each featured card has 4 stacked parts: header, blurb, PR count, PR list.
 * Cards use CSS subgrid across these rows, so the same part lines up across
 * every card in a row regardless of how much content each card has.
 */
const ROWS_PER_CARD = 4;

const cardBase = {
  backgroundColor: "var(--ifm-card-background-color)",
  border: "1px solid var(--ifm-toc-border-color)",
  borderRadius: "12px",
  boxShadow: "var(--ifm-global-shadow-lw)",
};

const sectionHeadingStyle = {
  fontSize: "1.75rem",
  borderBottom: "2px solid var(--ifm-toc-border-color)",
  paddingBottom: "0.5rem",
  marginBottom: "1.5rem",
};

// Year groups sit side by side when there is room (e.g. 2026 | 2025), and
// stack on narrower screens, so wide monitors are not left mostly empty.
const yearsLayoutStyle = {
  display: "grid",
  // 664px = two 320px cards + the 24px gap between them
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 664px), 1fr))",
  columnGap: "clamp(1.5rem, 3vw, 4rem)",
  alignItems: "start",
  marginBottom: "2rem",
};

const featuredGridStyle = {
  display: "grid",
  // min(100%, 320px) stops a single column overflowing very narrow screens
  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
  columnGap: "1.5rem",
  rowGap: 0, // vertical spacing comes from each card's margin-bottom
};

const featuredCardStyle = {
  ...cardBase,
  padding: "1.5rem",
  marginBottom: "1.5rem",
  display: "grid",
  gridRow: `span ${ROWS_PER_CARD}`,
  gridTemplateRows: "subgrid",
  rowGap: 0,
};

const contributorGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
  gap: "1rem",
};

/** Round avatar with an initial-letter fallback when no image URL exists. */
function Avatar({ src, name, size }) {
  if (src) {
    return <img src={src} alt={`${name}'s avatar`} loading="lazy" width={size} height={size} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  }

  return (
    <div
      aria-hidden="true"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--ifm-color-emphasis-200)",
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

/**
 * A featured member card. Always renders all 4 grid rows (empty ones as
 * placeholders) so the subgrid stays aligned with neighbouring cards.
 */
function FeaturedCard({ member }) {
  const prs = member.recentPRs.slice(0, 3);

  return (
    <div style={featuredCardStyle}>
      {/* Row 1: profile header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <Avatar src={member.avatarUrl} name={member.name} size={48} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <a
            href={member.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontWeight: "bold",
              fontSize: "1.1rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            {member.name}
            <ExternalLink size={14} />
          </a>
          <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>@{member.username}</div>
        </div>
      </div>

      {/* Row 2: blurb */}
      {member.blurb ? (
        <p
          style={{
            margin: "1rem 0 0",
            fontStyle: "italic",
            fontSize: "0.95rem",
          }}
        >
          "{member.blurb}"
        </p>
      ) : (
        <div aria-hidden="true" />
      )}

      {/* Row 3: merged PR count */}
      {member.mergedPRCount !== null ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            marginTop: "1rem",
            color: "var(--ifm-color-success)",
          }}
        >
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
        <ul
          style={{
            margin: "0.5rem 0 0",
            paddingLeft: "1.2rem",
            fontSize: "0.85rem",
            opacity: 0.85,
          }}
        >
          {prs.map((pr) => (
            <li key={pr.number} style={{ marginBottom: "0.25rem" }}>
              <a href={pr.url} target="_blank" rel="noopener noreferrer">
                #{pr.number}: {pr.title}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div aria-hidden="true" />
      )}
    </div>
  );
}

/** Compact card for the "All Contributors" grid. */
function ContributorCard({ contributor }) {
  const { username, avatarUrl, profileUrl, contributions } = contributor;

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={`Open ${username}'s GitHub profile`}
      style={{
        ...cardBase,
        padding: "0.75rem 1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <Avatar src={avatarUrl} name={username} size={40} />

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {username}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            fontSize: "0.8rem",
            opacity: 0.7,
          }}
        >
          <GitCommit size={14} />
          {contributions} {contributions === 1 ? "commit" : "commits"}
        </div>
      </div>
    </a>
  );
}

export default function HallOfFame() {
  const { featured = [], contributors = [] } = usePluginData("hall-of-fame");

  return (
    <Layout title="Hall of Fame" description="Honoring top contributors and featured community members of Img2Num.">
      <main
        style={{
          // Docusaurus renders pages inside a flex column wrapper. Without an
          // explicit width, `margin: auto` makes <main> shrink to its content
          // (the 700px intro paragraph) instead of filling the screen.
          width: "100%",
          boxSizing: "border-box",
          padding: "3rem clamp(1rem, 4vw, 4rem)",
          maxWidth: "2400px", // use wide screens instead of a narrow column
          margin: "0 auto",
        }}
      >
        <header style={{ marginBottom: "3rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800 }}>Hall of Fame</h1>

          <p
            style={{
              fontSize: "1.15rem",
              opacity: 0.8,
              maxWidth: "700px",
              margin: "0.5rem auto 0",
            }}
          >
            Celebrating the key contributors whose efforts helped build, refine, and expand Img2Num. Featured members are hand-picked by the maintainers. See everyone on the{" "}
            <a href={CONTRIBUTORS_URL} target="_blank" rel="noopener noreferrer">
              full contributors list
            </a>
            .
          </p>
        </header>

        {/* Featured members, grouped by year */}
        <div style={yearsLayoutStyle}>
          {featured.map(({ year, members }) => (
            <section key={year}>
              <h2 style={sectionHeadingStyle}>{year}</h2>

              <div style={featuredGridStyle}>
                {members.map((member) => (
                  <FeaturedCard key={member.username} member={member} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Every contributor to the repository */}
        {contributors.length > 0 && (
          <section style={{ marginBottom: "3.5rem" }}>
            <h2 style={sectionHeadingStyle}>All Contributors ({contributors.length})</h2>

            <div style={contributorGridStyle}>
              {contributors.map((c) => (
                <ContributorCard key={c.username} contributor={c} />
              ))}
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}
