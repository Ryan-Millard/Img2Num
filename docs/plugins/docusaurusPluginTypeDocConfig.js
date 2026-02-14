const config = [
  "docusaurus-plugin-typedoc",
  {
    name: "API",
    entryPoints: [
      "../packages/js/index.js",
    ],
    entryPointStrategy: "expand",
    out: "docs/js/api",
    json: "static/js/api.json",
    readme: "none",
    tsconfig: "../packages/js/tsconfig.typedoc.json",
    exclude: [
      "node_modules/",
      "build-wasm/",
      ".gitignore",
      "package.json",
      "*.test.*"
    ],
    blockTags: [
      "@param",
      "@returns",
      "@throws",
      "@example",
      "@async",
      "@summary",
      "@property",
      "@todo",
      "@variation",
      "@description",
      "@module",
      "@author",
      "@license",
      "@exports",
      "@see",
      "@since"
    ],
    gitRevision: "main",
    sourceLinkTemplate: "https://github.com/Ryan-Millard/Img2Num/blob/{gitRevision}/{path}#L{line}",
    useFirstParagraphOfCommentAsSummary: true,
    includeHierarchySummary: true,
    excludePrivate: true,
    excludeInternal: true,
    readme: "none",
    hideGenerator: false,
    categoryOrder: ["Public API"],
  }
];

export default config;
