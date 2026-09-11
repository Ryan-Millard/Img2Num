const REPO = "Ryan-Millard/Img2Num";

// Works in the browser and at build time (Node 18+).
// The optional token is only used at build time, where CI provides one.
export async function fetchContributorCount({ token } = {}) {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/contributors?per_page=1`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) return null;

    const link = res.headers.get("link");

    if (link) {
      const match = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
      return match ? Number(match[1]) : null;
    }

    const body = await res.json();
    return body.length;
  } catch {
    return null;
  }
}
