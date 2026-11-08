# Contributor events

Each JSON file here is one event, dated with `start` and `end` the way a blog post is dated with `date`. The
`contributor-events` plugin (`plugins/events/index.js`) turns every file into a page at `/events/<slug>/`, lists them
newest first on `/events/`, and shows the newest few at the top of the Hall of Fame. It reads the files at build time
and never calls the GitHub API, so the pages cannot break on a rate limit or a missing token.

## Adding an event

1. Copy `hacktoberfest-2026.json` to `<slug>.json` (for example `24-pull-requests-2026.json`) and change `slug`,
   `title`, `tagline`, `start`, `end` and `maintainers`. The file name must match the slug. `repo` is the GitHub
   repository the pull requests were merged into; the headline numbers on the page link to its merged pull requests
   and contributors graph filtered to the event's dates.
2. Put the badge artwork in `static/img/events/<slug>/` — an SVG, plus a PNG for sites that refuse SVG — and point
   `badge.image` and `badge.png` at it. Optional `badge.imageDark` / `badge.pngDark` are dark-mode variants: the site
   then switches badges with its theme and the README snippet becomes `<picture>` markup that follows the reader's
   colour scheme on GitHub. `badge.alt` doubles as the alt text of that snippet.
3. Commit. The page is live with a "list is compiled once the event closes" notice until step 4.
4. After the event closes, fill `contributors` (below) and commit again.
5. Optional: `links` to the wrap-up post and the like — `{"label": "...", "to": "/blog/..."}` for internal pages,
   `{"label": "...", "href": "https://..."}` for external ones. The build fails on broken internal links, so add the
   post before linking to it.

The build validates every file and fails with a message naming the field, so a typo cannot ship a half-rendered page.
`maintainers` are credited on the page but removed from the contributor list and the numbers.

## Collecting the contributors

With the [GitHub CLI](https://cli.github.com/) signed in, adjust the dates and run from this folder:

```bash
gh pr list --repo Ryan-Millard/Img2Num --state merged --limit 500 \
  --search 'merged:2026-10-01..2026-10-31' \
  --json number,title,url,author,mergedAt \
  --jq 'map(select(.author.is_bot | not))
        | group_by(.author.login)
        | map({ username: .[0].author.login,
                prs: (map({number, title, url, mergedAt: .mergedAt[:10]}) | sort_by(.number)) })
        | sort_by(.username | ascii_downcase)' > contributors.tmp.json

node -e '
  const fs = require("fs");
  const file = "hacktoberfest-2026.json";
  const event = JSON.parse(fs.readFileSync(file, "utf8"));
  event.contributors = JSON.parse(fs.readFileSync("contributors.tmp.json", "utf8"));
  fs.writeFileSync(file, JSON.stringify(event, null, 2) + "\n");
'
rm contributors.tmp.json
```

Then `pnpm format:js` from the repository root so Prettier lays the JSON out the way the format check expects.
Merge dates are UTC, which is what GitHub shows.

Optional `firstTime` flag — the page shows a "First contribution" pill and a headline number when any contributor has
it. This lists everyone who had a pull request merged before the event:

```bash
gh pr list --repo Ryan-Millard/Img2Num --state merged --limit 1000 \
  --search 'merged:<2026-10-01' --json author --jq '[.[].author.login] | unique'
```

Anyone from the first command who is not in that list gets `"firstTime": true`, everyone else `"firstTime": false`.

## Shape

```json
{
  "slug": "hacktoberfest-2026",
  "title": "Hacktoberfest 2026",
  "tagline": "One sentence shown under the title.",
  "repo": "Ryan-Millard/Img2Num",
  "start": "2026-10-01",
  "end": "2026-10-31",
  "badge": {
    "image": "/img/events/hacktoberfest-2026/badge.svg",
    "imageDark": "/img/events/hacktoberfest-2026/badge-dark.svg",
    "png": "/img/events/hacktoberfest-2026/badge.png",
    "pngDark": "/img/events/hacktoberfest-2026/badge-dark.png",
    "alt": "Img2Num contributor — Hacktoberfest 2026"
  },
  "links": [{ "label": "Wrap-up post", "to": "/blog/hacktoberfest-2026-recap" }],
  "maintainers": ["Ryan-Millard"],
  "contributors": [
    {
      "username": "octocat",
      "firstTime": true,
      "prs": [{ "number": 123, "title": "fix(core): ...", "url": "https://github.com/Ryan-Millard/Img2Num/pull/123", "mergedAt": "2026-10-12" }]
    }
  ]
}
```

Every contributor card has the id `<username>` (lowercase), so `/events/<slug>/#<username>` links straight to it.
