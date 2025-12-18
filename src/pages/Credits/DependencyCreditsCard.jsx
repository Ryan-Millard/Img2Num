import { useState, useEffect } from 'react';
import GlassCard from '@components/GlassCard';
import { useQueries } from '@tanstack/react-query';

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000; /**
 * Display two cards listing project dependencies and devDependencies with their versions and project URLs.
 *
 * Fetches this project's package.json on mount, queries the npm registry for each dependency to obtain a repository or homepage URL (cached for one week), and renders a table row per package showing its name, the version declared in package.json, and either a link to the package's project page, "Loading..." while the registry query is in progress, or "No URL" when none is available.
 *
 * @returns {JSX.Element} A React element containing two GlassCard sections: "Dependencies" and "Dev Dependencies", each with a table of package name, declared version, and project URL or status. 
 */

export default function DependencyCreditsCard() {
  const [deps, setDeps] = useState([]);
  const [devDeps, setDevDeps] = useState([]);

  // Fetch package.json dependencies once
  useEffect(() => {
    const url = 'https://raw.githubusercontent.com/Ryan-Millard/Img2Num/main/package.json';

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setDeps(Object.entries(data.dependencies || {}));
        setDevDeps(Object.entries(data.devDependencies || {}));
      });
  }, []);

  // Create queries for each dependency
  const depQueries = useQueries({
    queries: deps.map(([name, version]) => ({
      queryKey: ['dependency', name],
      queryFn: async () => {
        const res = await fetch(`https://registry.npmjs.org/${name}`);
        const info = await res.json();
        const url = info.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '') || info.homepage || '';
        return { name, version, url };
      },
      staleTime: ONE_WEEK,
      cacheTime: ONE_WEEK,
    })),
  });

  const devDepQueries = useQueries({
    queries: devDeps.map(([name, version]) => ({
      queryKey: ['dependency', name],
      queryFn: async () => {
        const res = await fetch(`https://registry.npmjs.org/${name}`);
        const info = await res.json();
        const url = info.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '') || info.homepage || '';
        return { name, version, url };
      },
      staleTime: ONE_WEEK,
      cacheTime: ONE_WEEK,
    })),
  });

  // Render a table
  const renderTable = (items, queries) => (
    <table>
      <tbody>
        {items.map(([name, version], index) => {
          const data = queries[index]?.data || { name, version, url: null };
          return (
            <tr key={`${name}-${index}`}>
              <td>{name}</td>
              <td>{version}</td>
              <td>
                {queries[index]?.isLoading ? (
                  'Loading...'
                ) : data.url ? (
                  <a href={data.url} target="_blank" rel="noopener noreferrer" title={`Open ${name} project page`}>
                    {data.url}
                  </a>
                ) : (
                  'No URL'
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <>
      <GlassCard>
        <h2>Dependencies</h2>
        {renderTable(deps, depQueries)}
      </GlassCard>

      <GlassCard>
        <h2>Dev Dependencies</h2>
        {renderTable(devDeps, devDepQueries)}
      </GlassCard>
    </>
  );
}