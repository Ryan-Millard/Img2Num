// @ts-check

import { createRequire } from 'module';
import { themes as prismThemes } from 'prism-react-renderer';
import path from 'path';
import webpackAliasPlugin from './plugins/webpack-alias/index.js';
import { changelogSidebarGenerator } from './changelogSidebarGenerator.js';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const require = createRequire(import.meta.url);
require('dotenv').config();

const hasAlgoliaEnvDefined =
  process.env.ALGOLIA_APP_ID &&
  process.env.ALGOLIA_API_KEY &&
  process.env.ALGOLIA_INDEX_NAME;

const algolia = hasAlgoliaEnvDefined
  ? {
      appId: process.env.ALGOLIA_APP_ID,
      apiKey: process.env.ALGOLIA_API_KEY,
      indexName: process.env.ALGOLIA_INDEX_NAME,
      contextualSearch: true,
    }
  : undefined;

const algoliaHeadTag = {
  name: 'algolia-site-verification',
  content: 'DB4B5FEC1545D32B',
};

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Img2Num',
  tagline:
    'Transforms any image into a printable or digital colour-by-number template using WebAssembly-powered C++ image processing.',
  favicon: 'img/og-icon.png',

  future: {
    v4: true,
  },

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  url: 'https://ryan-millard.github.io/',
  baseUrl: '/Img2Num/info/',

  // GitHub Pages settings
  trailingSlash: true,
  organizationName: 'Ryan-Millard',
  projectName: 'Img2Num',
  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  staticDirectories: [
    path.resolve(__dirname, 'static'),
    path.resolve(__dirname, '..', 'public'),
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'changelog',
        path: 'changelog',
        routeBasePath: 'changelog',
        sidebarPath: require.resolve('./sidebars.js'),
        sidebarItemsGenerator: changelogSidebarGenerator,
      },
    ],
    webpackAliasPlugin,
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/Ryan-Millard/Img2Num/edit/main/docs/',
          routeBasePath: 'docs',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/Ryan-Millard/Img2Num/edit/main/docs/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',

    colorMode: {
      respectPrefersColorScheme: true,
    },

    metadata: [algoliaHeadTag],

    algolia,

    navbar: {
      title: 'Img2Num',
      logo: {
        alt: 'Img2Num Logo',
        src: 'img/og-icon.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
          to: '/docs',
        },
        { to: '/blog', label: 'Blog', position: 'left' },
        { to: '/changelog', label: 'Changelog', position: 'left' },
        {
          href: 'https://github.com/Ryan-Millard/Img2Num',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },

    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [{ label: 'Docs', to: '/docs' }],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/Ryan-Millard/Img2Num/discussions',
            },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'Blog', to: '/blog' },
            {
              label: 'GitHub',
              href: 'https://github.com/Ryan-Millard/Img2Num',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Img2Num.`,
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;
