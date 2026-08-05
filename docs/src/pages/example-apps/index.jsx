import Link from "@docusaurus/Link";
import Layout from "@theme/Layout";
import CodeBlock from "@theme/CodeBlock";
import { Atom, Box, Braces, Code2, Cpu, Hexagon, Layers, MoveRight, Terminal, Zap } from "lucide-react";
import React from "react";
import styles from "../index.module.css";

/**
 * Index page for the example applications.
 *
 * Browser apps are standalone builds served from static/example-apps/ and
 * link to their live pages. Console apps are not published as pages; their
 * cards link to the source on GitHub (C/C++) or the published package
 * (npm/PyPI). Add new apps to the list below when one is added.
 */

const repoDir = "https://github.com/Ryan-Millard/Img2Num/tree/main/example-apps";
const apps = [
  {
    lang: "React",
    slug: "react",
    dir: "react-js",
    codeLang: "javascript",
    icon: <Atom size={22} color="var(--blue)" />,
    accentVar: "--blue-light",
    title: "React live demo",
    desc: "Full interactive demo, bundled with Vite - the setup most web apps use.",
    code: `import { imageToUint8ClampedArray, imageToSvg } from "img2num";

const { pixels, width, height } = await imageToUint8ClampedArray(file);
const { svg } = await imageToSvg({ pixels, width, height });`,
    href: "/example-apps/react-js/",
    cta: "Open live demo",
  },
  {
    lang: "ESM",
    slug: "esm",
    dir: "html-js",
    codeLang: "html",
    icon: <Braces size={22} color="var(--accent)" />,
    accentVar: "--accent-light",
    title: "HTML + ES Modules",
    desc: "The browser ESM build loaded natively. No bundler, no build step.",
    code: `<script type="module">
  import { imageToUint8ClampedArray, imageToSvg }
    from "https://cdn.jsdelivr.net/npm/img2num/dist/browser/img2num.js";
  // ...
</script>`,
    href: "/example-apps/html-js/esm/",
    cta: "Open live demo",
  },
  {
    lang: "IIFE",
    slug: "iife",
    dir: "html-js",
    codeLang: "html",
    icon: <Code2 size={22} color="var(--amber)" />,
    accentVar: "--amber-light",
    title: "HTML + IIFE",
    desc: "One plain script tag, one global object. The simplest integration.",
    code: `<script src="https://cdn.jsdelivr.net/npm/img2num/dist/standalone/img2num.iife.js"></script>
<script>
  const { imageToUint8ClampedArray, imageToSvg } = Img2Num;
  // ...
</script>`,
    href: "/example-apps/html-js/iife/",
    cta: "Open live demo",
  },
  {
    lang: "UMD",
    slug: "umd",
    dir: "html-js",
    codeLang: "javascript",
    icon: <Layers size={22} color="var(--coral)" />,
    accentVar: "--coral-light",
    title: "HTML + UMD (RequireJS)",
    desc: "Loaded as an AMD module - nothing is added to the global scope.",
    code: `requirejs.config({ paths: { img2num: ".../dist/standalone/img2num.umd" } });
requirejs(["img2num"], ({ imageToUint8ClampedArray, imageToSvg }) => {
  // ...
});`,
    href: "/example-apps/html-js/umd/",
    cta: "Open live demo",
  },
  {
    lang: "Node ESM",
    slug: "node-esm",
    dir: "console-js-esm",
    codeLang: "javascript",
    icon: <Hexagon size={22} color="var(--blue)" />,
    accentVar: "--blue-light",
    title: "console-js-esm",
    desc: "The same WASM build in Node.js: decode with sharp, convert with imageToSvg.",
    code: `import { imageToSvg } from "img2num";
import sharp from "sharp";

const { data, info } = await sharp(imagePath).ensureAlpha().raw()
  .toBuffer({ resolveWithObject: true });
const { svg } = await imageToSvg({ pixels: new Uint8ClampedArray(data.buffer), ...info });`,
    href: "https://www.npmjs.com/package/img2num",
    cta: "img2num on npm",
  },
  {
    lang: "Node CJS",
    slug: "node-cjs",
    dir: "console-js-cjs",
    codeLang: "javascript",
    icon: <Box size={22} color="var(--ink-3)" />,
    accentVar: "--surface-2",
    title: "console-js-cjs",
    desc: "Identical to the ESM app, consumed with require() from CommonJS.",
    code: `const { imageToSvg } = require("img2num");
const sharp = require("sharp");
// ... decode, then:
const { svg } = await imageToSvg({ pixels, width, height });`,
    href: "https://www.npmjs.com/package/img2num",
    cta: "img2num on npm",
  },
  {
    lang: "Python",
    slug: "python",
    dir: "console-py",
    codeLang: "python",
    icon: <Terminal size={22} color="var(--amber)" />,
    accentVar: "--amber-light",
    title: "console-py",
    desc: "OpenCV image in, SVG out with numpy zero-copy.",
    code: `import img2num

cfg = img2num.ImageToSvgConfig(kmeans={"k": 64}, min_thickness=10)
svg = img2num.image_to_svg(img, config=cfg)`,
    href: "https://pypi.org/project/img2num/",
    cta: "img2num on PyPI",
  },
  {
    lang: "C++17",
    slug: "cpp",
    dir: "console-cpp",
    codeLang: "cpp",
    icon: <Zap size={22} color="var(--accent)" />,
    accentVar: "--accent-light",
    title: "console-cpp",
    desc: "The native core: step-by-step pipeline and the unified call.",
    code: `img2num::ImageToSvgConfig config;
config.kmeans.k = 32;
std::string svg {img2num::image_to_svg(img_data, width, height, config)};`,
    href: `${repoDir}/console-cpp`,
    cta: "Source on GitHub",
  },
  {
    lang: "C",
    slug: "c",
    dir: "console-c",
    codeLang: "c",
    icon: <Cpu size={22} color="var(--coral)" />,
    accentVar: "--coral-light",
    title: "console-c",
    desc: "The C bindings with stb_image: filter, k-means, SVG output.",
    code: `img2num_ImageToSvgConfig cfg = img2num_ImageToSvgConfig_default();
char* svg = img2num_image_to_svg(image_data, width, height, &cfg);`,
    href: `${repoDir}/console-c`,
    cta: "Source on GitHub",
  },
];

export default function ExampleApps() {
  return (
    <Layout title="Example Apps" description="Runnable example applications showing how to use Img2Num in the browser (React, ESM, IIFE, UMD) and from the command line (C, C++, Python, Node.js).">
      <main>
        <section className={styles.section}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowBar}></span>
            upload · convert · copy the code
          </div>

          <div className={styles.sectionHeader} style={{ marginBottom: "auto" }}>
            <h1 className={styles.heroTitle}>Example Apps</h1>
            <Link className={styles.sectionLink} to="/docs">
              All Docs <MoveRight size={15} />
            </Link>
          </div>

          <p>
            One conversion pipeline - filter, segment, trace - run from every binding. The browser apps are live: upload a raster image, get an SVG back, and see the exact code that did it. The
            console apps run the same pipeline from the command line in <Link to="/docs/c">C</Link>, <Link to="/docs/cpp">C++</Link>, <Link to="/docs/py">Python</Link>, and Node.js. Pick whichever
            matches your stack and copy it as a starting point.
          </p>
        </section>

        <section className={styles.section}>
          <div className={styles.bindingsGrid}>
            {apps.map((app) => (
              <div key={app.title} id={app.slug} className={styles.bindingCard}>
                <span className={styles.bindingLang}>{app.lang}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "1em" }}>
                  <div className={styles.bindingIcon} style={{ background: `var(${app.accentVar})` }}>
                    {app.icon}
                  </div>
                  <div>
                    <h3 className={styles.bindingTitle}>{app.title}</h3>
                    <Link to={`https://github.com/Ryan-Millard/Img2Num/tree/main/${app.repoDir}`}>
                      <code>example-apps/{app.dir}</code>
                    </Link>
                  </div>
                </div>
                <p className={styles.bindingDesc}>{app.desc}</p>
                <CodeBlock language={app.codeLang} className={styles.codeSnippet}>
                  {app.code}
                </CodeBlock>
                <p>
                  <a href={app.href}>
                    {app.cta} <MoveRight size={15} style={{ verticalAlign: "middle" }} />
                  </a>
                </p>
              </div>
            ))}
          </div>

          <br />

          <p>
            Each browser example page shows its complete code, and the plain-HTML apps are fully standalone - use your browser's <i>View Source</i> to see the whole page. All example source and build
            setup lives in{" "}
            <Link to="https://github.com/Ryan-Millard/Img2Num/tree/main/example-apps">
              <code>example-apps/</code> on GitHub
            </Link>
            .
          </p>
        </section>
      </main>
    </Layout>
  );
}
