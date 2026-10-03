const REPO = "Ryan-Millard/Img2Num";
import hallOfFameInput from "../src/data/hall-of-fame.json";

export async function fetchHallOfFameData({ token } = {}) {
  const headers = {
    "User-Agent": "Img2Num-Docs",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const enriched = await Promise.all(
    hallOfFameInput.map(async (entry) => {
      // Always return data, even if github is unavailable
      const fallback = {
        username: entry.username,
        name: entry.username,
        avatarUrl: null,
        profileUrl: `https://github.com/${entry.username}`,
        year: entry.year,
        blurb: entry.blurb || "",
        mergedPRCount: null,
        recentPRs: [],
      }
      
      try {
        // 1. Fetch user profile
        const userRes = await fetch(`https://api.github.com/users/${entry.username}`, { headers });
        if (!userRes.ok){
          return fallback;
        }

        const userData = await userRes.json();

        // Filter out bot accounts
        if (userData.type === "Bot" || entry.username.endsWith("[bot]")) {
          return null;
        }

        const avatarUrl = userData.avatar_url? `${userData.avatar_url}${userData.avatar_url.includes("?") ? "&" : "?"}s=96`: null;

        const user = {
          username: userData.login || entry.username,
          name: userData.name || userData.login || entry.username,
          avatarUrl: avatarUrl,
          profileUrl: userData.html_url || `https://github.com/${entry.username}`,
          year: entry.year,
          blurb: entry.blurb || "",
          mergedPRCount: null,
          recentPRs: []
        }

        // 2. Fetch merged PRs for Ryan-Millard/Img2Num
        const searchUrl = `https://api.github.com/search/issues?q=repo:${REPO}+type:pr+author:${entry.username}+is:merged&sort=created&order=desc&per_page=5`;
        const prRes = await fetch(searchUrl, { headers });
        
        if (prRes.ok){
          const prData = await prRes.json();

          user.mergedPRCount = prData.total_count ?? 0;
          user.recentPRs = (prData.items || []).map((pr)=>({
            title: pr.title,
            url: pr.html_url,
            number: pr.number,
          }))
        }

        return user
      } catch (err) {
        return fallback;
      }
    })
  );

  // Group by year descending
  const valid = enriched.filter(Boolean);
  const grouped = valid.reduce((acc, item) => {
    acc[item.year] = acc[item.year] || [];
    acc[item.year].push(item);
    return acc;
  }, {});

  const sortedYears = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  return sortedYears.map((year) => ({
    year: Number(year),
    members: grouped[year],
  }));
}
