// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { createRequire } from "module";
import { themes as prismThemes } from "prism-react-renderer";
import path from "path";
import { changelogSidebarGenerator } from "./changelogSidebarGenerator.js";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import docusaurusPluginTypeDocConfig from "./plugins/docusaurusPluginTypeDocConfig.js";

const require = createRequire(import.meta.url);
require("dotenv").config();

const hasAlgoliaEnvDefined = process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_API_KEY && process.env.ALGOLIA_INDEX_NAME;
const algolia = hasAlgoliaEnvDefined
  ? {
      appId: process.env.ALGOLIA_APP_ID,
      apiKey: process.env.ALGOLIA_API_KEY,
      indexName: process.env.ALGOLIA_INDEX_NAME,
      contextualSearch: false,
    }
  : undefined;
const algoliaHeadTag = {
  name: "algolia-site-verification",
  content: "DB4B5FEC1545D32B",
};

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Img2Num",
  tagline: "Transform any image into an SVG.",
  favicon: "img/favicon.svg",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  markdown: {
    mermaid: true,
  },

  themes: ["@docusaurus/theme-mermaid"],

  // Set the production url of your site here
  url: "https://ryan-millard.github.io/",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/Img2Num/info/",

  // GitHub Pages fix: canonical URL with trailing slash
  trailingSlash: true,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "Ryan-Millard", // Usually your GitHub org/user name.
  projectName: "Img2Num", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenAnchors: "throw",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  // Folders with static resources
  staticDirectories: [
    path.resolve(__dirname, "static"), // default docusaurus folder
    path.resolve(__dirname, "..", "public"), // main app's public folder
  ],

  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "changelog",
        path: "changelog",
        routeBasePath: "changelog",
        sidebarPath: require.resolve("./sidebars.js"),
        sidebarItemsGenerator: changelogSidebarGenerator,
      },
    ],
    [
      "@docusaurus/plugin-google-gtag",
      {
        trackingID: "G-C7LD33MNTX",
        anonymizeIP: true,
      },
    ],
    docusaurusPluginTypeDocConfig,
  ],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: "./sidebars.js",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/Ryan-Millard/Img2Num/edit/main/docs/",
          routeBasePath: "docs",
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/Ryan-Millard/Img2Num/edit/main/docs/",
          // Useful options to enforce blogging best practices
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],
  stylesheets: [
    {
      href: "https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css",
      type: "text/css",
      integrity: "sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM",
      crossorigin: "anonymous",
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      docs: {
        versionPersistence: 'localStorage',
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
      },

      blog: {
        sidebar: {
          groupByYear: true,
        },
      },

      // Replace with your project's social card
      image: "img/favicon.png",
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },

      //announcementBar: {
        //id: 'announcement-docusarusus_config_js',
        //content: 'Announcement',
        //isCloseable: true,
        ////backgroundColor: '#fafbfc',
        ////textColor: '#091E42',
      //},

      metadata: [algoliaHeadTag],

      algolia,

      navbar: {
        title: "Img2Num",
        logo: {
          alt: "Img2Num Logo",
          src: "img/favicon.svg",
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "tutorialSidebar",
            position: "left",
            label: "Documentation",
            to: "/docs",
          },
          { to: "/blog", label: "Blog", position: "left" },
          { to: "/changelog", label: "Changelog", position: "left" },
          {
            href: "https://github.com/Ryan-Millard/Img2Num",
            label: "GitHub",
            position: "right",
          },
        ],
        hideOnScroll: false,
      },
      footer: {
        logo: {
          alt: "Img2Num Logo",
          src: "img/favicon.svg",
        },
        style: "dark",
        links: [
          {
            title: "Documentation",
            items: [
              {
                label: "Documentation",
                to: "/docs",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "GitHub Discussions",
                href: "https://github.com/Ryan-Millard/Img2Num/discussions",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Blog",
                to: "/blog",
              },
              {
                label: "GitHub",
                href: "https://github.com/Ryan-Millard/Img2Num",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Img2Num.`,
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 5,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
