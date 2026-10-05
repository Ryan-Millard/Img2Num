import hallOfFameInput from "../src/datab/hall-of-fame.json";

const REPO = "Ryan-Millard/Img2Num";
const API = "https://api.github.com";
const PER_PAGE = 50;
const MAX_PAGES = 10;

const isBot = (user) =>
  user?.type === "Bot" || user?.login?.endsWith("[bot]");

const withAvatarSize = (url) =>
  url ? `${url}${url.includes("?") ? "&" : "?"}s=96` : null;

async function fetchAllContributors(headers) {
  const all = [];

  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const res = await fetch(
        `${API}/repos/${REPO}/contributors?per_page=${PER_PAGE}&page=${page}`,
        { headers },
      );
      if (!res.ok) break;

      const batch = await res.json();
      if (!Array.isArray(batch) || batch.length === 0) break;

      all.push(...batch);
      if (batch.length < PER_PAGE) break;
    }
  } catch {
  }

  return all
    .filter((c) => !isBot(c))
    .map((c) => ({
      username: c.login,
      avatarUrl: withAvatarSize(c.avatar_url),
      profileUrl: c.html_url,
      contributions: c.contributions,
    }));
}

async function fetchFeaturedMember(entry, headers) {
  const fallback = {
    username: entry.username,
    name: entry.username,
    avatarUrl: null,
    profileUrl: `https://github.com/${entry.username}`,
    year: entry.year,
    blurb: entry.blurb || "",
    mergedPRCount: null,
    recentPRs: [],
  };

  try {
    const userRes = await fetch(`${API}/users/${entry.username}`, { headers });
    if (!userRes.ok) return fallback;

    const userData = await userRes.json();
    if (isBot(userData)) return null;

    const user = {
      ...fallback,
      username: userData.login || entry.username,
      name: userData.name || userData.login || entry.username,
      avatarUrl: withAvatarSize(userData.avatar_url),
      profileUrl: userData.html_url || fallback.profileUrl,
    };

    const searchUrl = `${API}/search/issues?q=repo:${REPO}+type:pr+author:${entry.username}+is:merged&sort=created&order=desc&per_page=5`;
    const prRes = await fetch(searchUrl, { headers });

    if (prRes.ok) {
      const prData = await prRes.json();
      user.mergedPRCount = prData.total_count ?? 0;
      user.recentPRs = (prData.items || []).map((pr) => ({
        title: pr.title,
        url: pr.html_url,
        number: pr.number,
      }));
    }

    return user;
  } catch {
    return fallback;
  }
}

export async function fetchHallOfFameData({ token } = {}) {
  const headers = {
    "User-Agent": "Img2Num-Docs",
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const [contributors, featuredRaw] = await Promise.all([
    fetchAllContributors(headers),
    Promise.all(hallOfFameInput.map((e) => fetchFeaturedMember(e, headers))),
  ]);

  // Group featured members by year, newest first
  const grouped = featuredRaw.filter(Boolean).reduce((acc, item) => {
    (acc[item.year] ||= []).push(item);
    return acc;
  }, {});

  const featured = Object.keys(grouped)
    .sort((a, b) => Number(b) - Number(a))
    .map((year) => ({ year: Number(year), members: grouped[year] }));

  return { featured, contributors };
}