import fs from 'fs';
import path from 'path';

const owner = 'Ryan-Millard';
const repo = 'Img2Num';

async function fetchContributors() {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors`);
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const contributors = await res.json();

  return contributors.map(c => ({
    id: c.id,
    login: c.login,
    html_url: c.html_url,
    avatar_url: c.avatar_url,
    contributions: c.contributions,
  }));
}

export default function generateContributorCreditsPlugin() {
  return {
    name: 'vite:generate-credits-json',
    async buildStart() {
      try {
        console.log('⏳ Generating credits.json...');
        const contributors = await fetchContributors();

        const filePath = path.resolve('src/data/contributor-credits.json');
        fs.writeFileSync(filePath, JSON.stringify(contributors, null, 2));
        console.log('✅ contributor-credits.json generated!');
      } catch (err) {
        console.error('❌ Failed to generate contributor-credits.json:', err);
      }
    }
  };
}
