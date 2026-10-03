import React from "react";
import Layout from "@theme/Layout";
import { usePluginData } from "@docusaurus/useGlobalData";
import { GitPullRequest, ExternalLink } from "lucide-react";

export default function HallOfFame() {
  const hallOfFameData = usePluginData("hall-of-fame");

  return (
    <Layout
      title="Hall of Fame"
      description="Honoring top contributors and featured community members of Img2Num."
    >
      <main
        style={{
          padding: "3rem 1.5rem",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            marginBottom: "3rem",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
            }}
          >
            Hall of Fame
          </h1>

          <p
            style={{
              fontSize: "1.15rem",
              opacity: 0.8,
              maxWidth: "600px",
              margin: "0.5rem auto 0",
            }}
          >
            Celebrating the key contributors whose efforts helped build,
            refine, and expand Img2Num.
          </p>
        </header>

        {hallOfFameData.map(({ year, members }) => (
          <section
            key={year}
            style={{
              marginBottom: "3.5rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.75rem",
                borderBottom: "2px solid var(--ifm-toc-border-color)",
                paddingBottom: "0.5rem",
                marginBottom: "1.5rem",
              }}
            >
              {year}
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {members.map((member) => (
                <div
                  key={member.username}
                  style={{
                    backgroundColor: "var(--ifm-card-background-color)",
                    border: "1px solid var(--ifm-toc-border-color)",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "var(--ifm-global-shadow-lw)",
                  }}
                >
                  {/* User Profile Header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={`${member.name}'s avatar`}
                        loading="lazy"
                        width="48"
                        height="48"
                        style={{
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor:
                            "var(--ifm-color-emphasis-200)",
                          fontWeight: 700,
                        }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
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

                      <div
                        style={{
                          fontSize: "0.85rem",
                          opacity: 0.7,
                        }}
                      >
                        @{member.username}
                      </div>
                    </div>
                  </div>

                  {/* Blurb */}
                  {member.blurb && (
                    <p
                      style={{
                        margin: "1rem 0 0.75rem",
                        fontStyle: "italic",
                        fontSize: "0.95rem",
                      }}
                    >
                      "{member.blurb}"
                    </p>
                  )}

                  {/* Merged PR Count */}
                  {member.mergedPRCount !== null && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        marginTop: "auto",
                        paddingTop: "1rem",
                        color: "var(--ifm-color-success)",
                      }}
                    >
                      <GitPullRequest size={16} />

                      <span>
                        {member.mergedPRCount} Merged Pull Request
                        {member.mergedPRCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  )}

                  {/* Recent PRs */}
                  {member.recentPRs.length > 0 && (
                    <ul
                      style={{
                        margin: "0.5rem 0 0",
                        paddingLeft: "1.2rem",
                        fontSize: "0.85rem",
                        opacity: 0.85,
                      }}
                    >
                      {member.recentPRs.slice(0, 3).map((pr) => (
                        <li
                          key={pr.number}
                          style={{
                            marginBottom: "0.25rem",
                          }}
                        >
                          <a
                            href={pr.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            #{pr.number}: {pr.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </Layout>
  );
}
