import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import { BookOpen, Cpu, FileText, GitBranch, Globe, Layers, Package, Palette, Target, Terminal, Zap } from "lucide-react";
import React, { useEffect, useState } from "react";
import Hedgehog from "../components/Hedgehog";
import styles from "./index.module.css";

function RasterToSvgDemo() {
  return (
    <section className={styles.panel}>
      <div className={styles.chrome}>
        <div className={styles.dots}>
          <span className={`${styles.dot} ${styles.red}`} />
          <span className={`${styles.dot} ${styles.yellow}`} />
          <span className={`${styles.dot} ${styles.green}`} />
        </div>
        <span className={styles.chromeText}>
          <a href="https://images.nasa.gov/details/PIA01481" target="_blank" rel="noopener noreferrer">
            NASA/JPL (PIA01481)
          </a>{" "}
          demo
        </span>
      </div>
      <div className={styles.grid}>
        <figure className={styles.figure}>
          <img src={"./img/homepage-demo.jpg"} alt="Jupiter system montage raster image" className={styles.image} />
          <figcaption className={styles.caption}>raster input</figcaption>
        </figure>
        <figure className={styles.figure}>
          <img src={"./img/homepage-demo.svg"} alt="Vectorized SVG output" className={styles.image} />
          <figcaption className={styles.caption}>svg output</figcaption>
        </figure>
      </div>
    </section>
  );
}

//core hero section
function HeroSection() {
  const [stats, setStats] = useState({
    stars: null,
    forks: null,
  });

  useEffect(() => {
    fetch("https://api.github.com/repos/Ryan-Millard/Img2Num")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setStats({
            stars: data.stargazers_count,
            forks: data.forks_count,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroLeft}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowBar}></span>
            vectorize · quantize · export
          </div>

          <h1 className={styles.heroTitle}>
            Raster to <em className={styles.heroTitleAccent}>SVG</em>
            <br />
            in C++, Python,
            <br />
            JavaScript &amp; C
          </h1>

          <p className={styles.heroLead}>Img2Num is a cross-platform library that converts PNG/JPEG to clean, layered SVG paths. Built for speed, zero dependencies, and multi-language bindings.</p>

          <div className={styles.heroActionsWrapper}>
            <div className={styles.heroActions} style={{ marginBottom: 0 }}>
              <Link className={styles.btnPrimary} to="./docs">
                <Package size={16} style={{ marginRight: "6px" }} /> Installation and Setup
              </Link>
              <Link className={styles.btnGhost} to="/changelog">
                Changelog
              </Link>
              <Link className={styles.btnGhost} to="https://github.com/Ryan-Millard/Img2Num">
                GitHub →
              </Link>
            </div>
            <Hedgehog size={60} />
          </div>

          <div className={styles.statsBar}>
            <div className={styles.stat}>
              <span className={styles.statNum}>★ {stats.stars !== null ? stats.stars : "—"}</span>
              <span className={styles.statLabel}>stars</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>⑂ {stats.forks !== null ? stats.forks : "—"}</span>
              <span className={styles.statLabel}>forks</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>C++/C/Py/JS</span>
              <span className={styles.statLabel}>bindings</span>
            </div>
          </div>
        </div>

        <div className={styles.heroRight}>
          <RasterToSvgDemo />
          <Link className={styles.btnPrimary} to="https://ryan-millard.github.io/Img2Num/example-apps/react-js/">
            Try Live Demo →
          </Link>
        </div>
      </div>
    </section>
  );
}

function BindingsSection() {
  const bindings = [
    {
      lang: "C++17",
      icon: <Zap size={22} color="var(--accent)" />,
      accentVar: "--accent-light",
      title: "Native speed",
      desc: "Quantisation, contour tracing, SVG writer. Add it as a submodule.",
      code: `#include "img2num"\n` + `img2num::ImageToSvgConfig config;\n` + `config.kmeans.k = 32;\n` + `std::string svg {img2num::image_to_svg(img_data, width, height, config)};`,
      docLinks: [
        { href: "./docs/cpp", text: "C++ Docs" },
        { href: "./docs/c", text: "C Docs" },
      ],
    },
    {
      lang: "Python",
      icon: <Terminal size={22} color="var(--amber)" />,
      accentVar: "--amber-light",
      title: "pip install img2num",
      desc: "Numpy array in → SVG string out. Seamless integration.",
      code: `import img2num\n\n` + `cfg = img2num.ImageToSvgConfig(kmeans = {"k": 16})\n` + `svg = img2num.image_to_svg(img, config=cfg)`,
      docLinks: [],
    },
    {
      lang: "JS",
      icon: <Globe size={22} color="var(--blue)" />,
      accentVar: "--blue-light",
      title: "npm i img2num",
      desc: "Browser / Node. Same C++ core compiled to WebAssembly.",
      code:
        `import { imageToUint8ClampedArray, imageToSvg } from "img2num"\n\n` +
        `const { pixels, width, height } = await imageToUint8ClampedArray(file);\n` +
        `const svg = await imageToSvg({ pixels, width, height });`,
      docLinks: [{ href: "./docs/js/api", text: "JsDoc" }],
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Use it anywhere</h2>
        <Link className={styles.sectionLink} to="./docs">
          See all bindings →
        </Link>
      </div>
      <div className={styles.bindingsGrid}>
        {bindings.map((b) => (
          <div key={b.lang} className={styles.bindingCard}>
            <span className={styles.bindingLang}>{b.lang}</span>
            <div className={styles.bindingIcon} style={{ background: `var(${b.accentVar})` }}>
              {b.icon}
            </div>
            <h3 className={styles.bindingTitle}>{b.title}</h3>
            <p className={styles.bindingDesc}>{b.desc}</p>
            <pre className={styles.codeSnippet}>
              <code>{b.code}</code>
            </pre>
            <p>
              {b.docLinks.map(({ href, text }, index) => (
                <React.Fragment key={href}>
                  {index > 0 && <span aria-hidden="true"> · </span>}
                  <Link to={href}>{text}</Link>
                </React.Fragment>
              ))}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      color: "rgba(82,183,136,0.2)",
      icon: <Target size={18} color="#52b788" />,
      title: "Precise contour extraction",
      desc: "Edge detection & polygon simplification with tunable fidelity.",
    },
    {
      color: "rgba(199,122,39,0.2)",
      icon: <Palette size={18} color="#e08c38" />,
      title: "Colour quantization + palette",
      desc: "Automatically reduce colours to any K value, output SVG with groups.",
    },
    {
      color: "rgba(29,111,164,0.2)",
      icon: <Package size={18} color="#3a9ad9" />,
      title: "Zero-copy bindings",
      desc: "Direct memory access in Python (numpy) and JS (TypedArray).",
    },
    {
      color: "rgba(194,68,30,0.2)",
      icon: <Cpu size={18} color="#d95e36" />,
      title: "Cross-platform CI",
      desc: "Tested on Linux, macOS, Windows, and WASM in CI.",
    },
  ];

  return (
    <section className={styles.featuresSectionBg}>
      <div className={styles.featuresInner}>
        <h2 className={styles.featuresSectionTitle}>Designed for developers</h2>
        <div className={styles.featuresGrid}>
          {features.map((f) => (
            <div key={f.title} className={styles.featureCardDark}>
              <h4 className={styles.featureTitleDark}>
                <span className={styles.featureIconDark} style={{ background: f.color }}>
                  {f.icon}
                </span>
                {f.title}
              </h4>
              <p className={styles.featureDescDark}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className={styles.ctaBand}>
      <div className={styles.ctaInner}>
        <h2 className={styles.ctaTitle}>Ready to integrate SVG vectorization into your stack?</h2>
        <Link className={styles.ctaBtn} to="./docs">
          Get started →
        </Link>
      </div>
    </section>
  );
}

//handle the links here
function LinksSection() {
  const links = [
    {
      eyebrow: "Docs",
      icon: <BookOpen size={16} color="var(--accent)" />,
      title: "C++ API Reference",
      desc: "Full reference, parameter tuning, build instructions.",
      to: "./docs",
    },
    {
      eyebrow: "PyPI",
      icon: <Package size={16} color="var(--amber)" />,
      title: "img2num on PyPI",
      desc: "pip install img2num, examples notebook.",
      to: "https://pypi.org/project/img2num",
    },
    {
      eyebrow: "npm",
      icon: <Layers size={16} color="var(--blue)" />,
      title: "img2num",
      desc: "Node.js and browser ready.",
      to: "https://www.npmjs.com/package/img2num",
    },
    {
      eyebrow: "Conan",
      icon: <Layers size={16} color="var(--coral)" />,
      title: "Conan Center",
      desc: "C++ package manager integration.",
      to: "https://conan.io/center",
    },
    {
      eyebrow: "Contributing",
      icon: <GitBranch size={16} color="var(--accent)" />,
      title: "GitHub issues",
      desc: "Report bugs, request bindings, contribute.",
      to: "https://github.com/Ryan-Millard/Img2Num/issues",
    },
    {
      eyebrow: "License",
      icon: <FileText size={16} color="var(--ink-3)" />,
      title: "MIT",
      desc: "Permissive, commercial friendly.",
      to: "https://github.com/Ryan-Millard/Img2Num/blob/main/LICENSE",
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Ecosystem</h2>
      </div>
      <div className={styles.linksGrid}>
        {links.map((l) => (
          <Link key={l.title} className={styles.linkCard} to={l.to}>
            <div className={styles.linkEyebrow}>
              {l.icon}
              <span className={styles.linkEyebrowText}>{l.eyebrow}</span>
            </div>
            <h4 className={styles.linkTitle}>
              {l.title} <span style={{ fontSize: "12px", opacity: 0.5 }}>➚</span>
            </h4>
            <p className={styles.linkDesc}>{l.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description="Cross-platform library that converts PNG/JPEG to clean, layered SVG paths.">
      <main>
        <HeroSection />
        <BindingsSection />
        <FeaturesSection />
        <CtaBand />
        <LinksSection />
      </main>
    </Layout>
  );
}
