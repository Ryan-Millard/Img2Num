import { useState, useEffect } from "react";
import GlassCard from "@components/GlassCard";
import { useQueries } from "@tanstack/react-query";
import Tooltip from "@components/Tooltip";
import Pagination from "@components/Pagination";
import { ExternalLink } from "lucide-react";
import styles from "./DependencyCreditsCard.module.css";

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000; // milliseconds
const PAGE_SIZE = 10;

export default function DependencyCreditsCard() {
  const [deps, setDeps] = useState([]);
  const [devDeps, setDevDeps] = useState([]);

  const [depPage, setDepPage] = useState(0);
  const [devDepPage, setDevDepPage] = useState(0);

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

  // pagination helper
  const paginatedItems = (items, page) => items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const renderTable = (items, queries, page) => {
    const visibleItems = paginatedItems(items, page);

    return (
      <table className={styles.table}>
        <tbody>
          {visibleItems.map(([name, version], localIndex) => {
            const globalIndex = page * PAGE_SIZE + localIndex;
            const query = queries[globalIndex];
            const data = query?.data;

            return (
              <tr key={`${name}-${globalIndex}`}>
                <td>{name}</td>
                <td>{version}</td>
                <td>
                  {query?.isLoading ? (
                    "Loading..."
                  ) : data?.url ? (
                    <Tooltip content={`Open ${name} homepage`}>
                      <a href={data.url} target="_blank" rel="noopener noreferrer">
                        <span className={styles.fullUrl}>{data.url}</span>
                        <ExternalLink className={styles.iconUrl} size={18} />
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
  };

  return (
    <>
      <GlassCard>
        <h2>Dependencies</h2>

        {renderTable(deps, depQueries, depPage)}

        <Pagination page={depPage} totalPages={Math.ceil(deps.length / PAGE_SIZE)} onChange={setDepPage} />
      </GlassCard>

      <GlassCard>
        <h2>Dev Dependencies</h2>

        {renderTable(devDeps, devDepQueries, devDepPage)}

        <Pagination page={devDepPage} totalPages={Math.ceil(devDeps.length / PAGE_SIZE)} onChange={setDevDepPage} />
      </GlassCard>
    </>
  );
}
