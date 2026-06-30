#!/usr/bin/env node

/**
 * Faithful local preview server for the production build.
 *
 * Why this exists instead of `docusaurus serve`:
 *   `docusaurus serve` uses serve-handler with `cleanUrls` enabled, which
 *   301-redirects any `*.html` request to an extension-less URL (and, with a
 *   baseUrl set, drops the baseUrl in the redirect). The embedded Doxygen API
 *   references are plain static `.html` files whose inter-page links are all
 *   `.html`, so clicking a link inside those iframes redirects to a broken,
 *   baseUrl-less, extension-less URL -> 404 -> the iframe goes blank.
 *
 *   GitHub Pages (our production host) serves `.html` files literally and does
 *   NOT clean URLs, so the iframes work in production. This server mirrors that
 *   behavior, making local preview match production and fixing the iframe bug.
 *
 * Usage:
 *   node scripts/serve.js [--dir build] [--port 3000] [--host 0.0.0.0]
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

// --- Tiny arg parser (supports `--key value` and `-p/-h` aliases) ----------
function getArg(names, fallback) {
  for (const name of names) {
    const i = process.argv.indexOf(name);
    if (i !== -1 && process.argv[i + 1]) return process.argv[i + 1];
  }
  return fallback;
}

const ROOT_DIR = path.join(__dirname, ".."); // docs/
const buildDir = path.resolve(ROOT_DIR, getArg(["--dir"], "build"));
const port = Number(getArg(["--port", "-p"], 3000));
const host = getArg(["--host", "-h"], "0.0.0.0");

// --- Read baseUrl from docusaurus.config.js (regex avoids ESM/CJS import) ---
function readBaseUrl() {
  try {
    const cfg = fs.readFileSync(path.join(ROOT_DIR, "docusaurus.config.js"), "utf8");
    const m = cfg.match(/baseUrl:\s*["'`]([^"'`]+)["'`]/);
    if (m) {
      let b = m[1];
      if (!b.startsWith("/")) b = "/" + b;
      if (!b.endsWith("/")) b += "/";
      return b;
    }
  } catch {
    /* fall through to default */
  }
  return "/";
}
const baseUrl = readBaseUrl();

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".cjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".wasm": "application/wasm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".pdf": "application/pdf",
};

function contentType(filePath) {
  return CONTENT_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

function sendFile(res, filePath, status = 200) {
  res.writeHead(status, { "Content-Type": contentType(filePath) });
  fs.createReadStream(filePath).pipe(res);
}

function sendNotFound(res) {
  const custom = path.join(buildDir, "404.html");
  if (fs.existsSync(custom)) return sendFile(res, custom, 404);
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("404 Not Found");
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    return sendNotFound(res);
  }

  // Convenience: redirect the bare root to the baseUrl.
  if (pathname === "/" && baseUrl !== "/") {
    res.writeHead(302, { Location: baseUrl });
    return res.end();
  }

  // Everything the site references lives under baseUrl.
  if (!pathname.startsWith(baseUrl)) return sendNotFound(res);

  const rel = pathname.slice(baseUrl.length);
  const resolved = path.resolve(buildDir, rel);

  // Block path traversal outside the build directory.
  if (resolved !== buildDir && !resolved.startsWith(buildDir + path.sep)) {
    return sendNotFound(res);
  }

  // Directory request: serve index.html, mirroring GitHub Pages.
  // (A directory URL without a trailing slash redirects to add one so that
  //  relative links inside the page resolve correctly.)
  if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
    if (!pathname.endsWith("/")) {
      res.writeHead(301, { Location: pathname + "/" });
      return res.end();
    }
    const indexFile = path.join(resolved, "index.html");
    return fs.existsSync(indexFile) ? sendFile(res, indexFile) : sendNotFound(res);
  }

  // Plain file request — served literally, no `.html` stripping.
  if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
    return sendFile(res, resolved);
  }

  return sendNotFound(res);
});

if (!fs.existsSync(buildDir)) {
  console.error(`Build directory not found: ${buildDir}\nRun \`pnpm build\` first.`);
  process.exit(1);
}

server.listen(port, host, () => {
  const shown = host === "0.0.0.0" ? "localhost" : host;
  console.log(`Serving "${path.relative(ROOT_DIR, buildDir)}" at: http://${shown}:${port}${baseUrl}`);
  console.log("(Static preview mirroring GitHub Pages — serves .html literally, no clean-URL rewrites.)");
});
