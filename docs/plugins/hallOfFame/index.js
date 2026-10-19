import { fetchHallOfFameData } from "../../lib/hallOfFame.js";

export default function hallOfFamePlugin() {
  return {
    name: "hall-of-fame",

    async loadContent() {
      const token = process.env.GITHUB_TOKEN;

      return await fetchHallOfFameData({ token });
    },

    async contentLoaded({ content, actions }) {
      actions.setGlobalData(content);
    },
  };
}
