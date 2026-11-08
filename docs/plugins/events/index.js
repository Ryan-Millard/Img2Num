import fs from "node:fs/promises";
import path from "node:path";
import { byNewest, prepareEvent, validateEvent } from "../../src/utils/events.js";

const DATA_DIR = ["src", "data", "events"];
const PAGE_COMPONENT = "@site/src/components/events/EventPage.jsx";

/**
 * Contributor event pages (Hacktoberfest, 24 Pull Requests, ...).
 *
 * Every `src/data/events/<slug>.json` becomes a page at `/events/<slug>/`,
 * the way a dated file becomes a blog post: add a file, get a page, and the
 * listings sort by date. Everything comes from committed data at build time,
 * so nothing here calls the GitHub API.
 *
 * The `/events/` index and the Hall of Fame read the summaries from global
 * data with `usePluginData("contributor-events")`.
 */
export default function eventsPlugin(context) {
  const dataDir = path.join(context.siteDir, ...DATA_DIR);

  return {
    name: "contributor-events",

    // Reload the dev server when an event file changes.
    getPathsToWatch() {
      return [path.join(dataDir, "*.json")];
    },

    async loadContent() {
      let files;
      try {
        files = (await fs.readdir(dataDir)).filter((file) => file.endsWith(".json")).sort();
      } catch (error) {
        if (error.code === "ENOENT") return [];
        throw error;
      }

      const events = [];
      for (const file of files) {
        const source = `src/data/events/${file}`;
        const raw = JSON.parse(await fs.readFile(path.join(dataDir, file), "utf8"));
        const event = prepareEvent(validateEvent(raw, source));
        if (file !== `${event.slug}.json`) throw new Error(`${source}: rename the file to ${event.slug}.json to match its slug.`);
        events.push(event);
      }

      return events.sort(byNewest);
    },

    async contentLoaded({ content, actions }) {
      const { addRoute, createData, setGlobalData } = actions;

      for (const event of content) {
        const eventData = await createData(`${event.slug}.json`, JSON.stringify(event));
        addRoute({ path: event.path, component: PAGE_COMPONENT, modules: { event: eventData }, exact: true });
      }

      // Summaries only; the contributor lists stay on their own pages.
      setGlobalData({
        events: content.map((event) => ({
          slug: event.slug,
          path: event.path,
          title: event.title,
          tagline: event.tagline,
          start: event.start,
          end: event.end,
          year: event.year,
          dateRange: event.dateRange,
          badge: event.badge,
          stats: event.stats,
        })),
      });
    },
  };
}
