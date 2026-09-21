import { fetchContributorCount, fetchRepoStats } from "../../lib/githubStats.js";

export default function githubStatsPlugin() {
  return {
    name: "github-stats",

    // Runs at build time, in Node.
    async loadContent() {
      const token = process.env.GITHUB_TOKEN;

      const [repo, contributors] = await Promise.all([fetchRepoStats({ token }), fetchContributorCount({ token })]);

      // Every field falls back to null. The shared functions never throw,
      // so a GitHub outage or rate limit can never fail the build.
      return {
        stars: repo?.stars ?? null,
        forks: repo?.forks ?? null,
        contributors: contributors ?? null,
      };
    },

    // Makes the loaded content available to components.
    async contentLoaded({ content, actions }) {
      actions.setGlobalData(content);
    },
  };
}
