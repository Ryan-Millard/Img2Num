import { useState, useEffect } from "react";
import GlassCard from "@components/GlassCard";
import { useQueries } from "@tanstack/react-query";
import Tooltip from "@components/Tooltip";

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000; // milliseconds

export default function DependencyCreditsCard() {
  const [deps, setDeps] = useState([]);
  const [devDeps, setDevDeps] = useState([]);

  useEffect(() => {
    const url = "https://raw.githubusercontent.com/Ryan-Millard/Img2Num/main/package.json";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setDeps(Object.entries(data.dependencies || {}));
        setDevDeps(Object.entries(data.devDependencies || {}));
      });
  }, []);

  const createQueries = (items) =>
    items.map(([name, version]) => ({
      queryKey: ["dependency", name],
      queryFn: async () => {
        const res = await fetch(`https://registry.npmjs.org/${name}`);
        const info = await res.json();
        const url = info.repository?.url?.replace(/^git\+/, "").replace(/\.git$/, "") || info.homepage || "";
        return { name, version, url };
      },
      staleTime: ONE_WEEK,
      cacheTime: ONE_WEEK,
    }));

  const depQueries = useQueries({ queries: createQueries(deps) });
  const devDepQueries = useQueries({ queries: createQueries(devDeps) });

  const renderTable = (items, queries) => (
    <table>
      <tbody>
        {items.map(([name, version], index) => {
          const query = queries[index];
          const data = query?.data;

          return (
            <tr key={`${name}-${index}`}>
              <td>{name}</td>
              <td>{version}</td>
              <td>
                {query?.isLoading ? (
                  "Loading..."
                ) : data?.url ? (
                  <Tooltip content={`Open ${name} homepage`}>
                    <a href={data.url} target="_blank" rel="noopener noreferrer">
                      {data.url}
                    </a>
                  </Tooltip>
                ) : (
                  "No URL"
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
