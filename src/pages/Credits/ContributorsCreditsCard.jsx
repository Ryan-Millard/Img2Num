import { useState, useEffect } from 'react';
import GlassCard from '@components/GlassCard';
import contributors from '@data/contributor-credits.json';
import styles from './ContributorsCreditsCard.module.css';
import FallbackImage from '@components/FallbackImage';
import Pagination from '@components/Pagination';
import Tooltip from '@components/Tooltip';
import { User } from 'lucide-react';

export default function ContributorsCreditsCard() {
  const chunk = (arr, size) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

  const chunkSize = 10;
  const tables = chunk(contributors, chunkSize);

  const [page, setPage] = useState(0);

  return (
    <GlassCard>
      <h2>Contributors</h2>

      <div className={styles.contributorsGrid}>
        {tables.map(
          (group, i) =>
            i === page && (
              <table key={i}>
                <tbody>
                  {group.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Tooltip content={`Open ${c.login}'s GitHub profile`}>
                          <a href={c.html_url} target="_blank" rel="noopener noreferrer">
                            <FallbackImage
                              src={c.avatar_url}
                              fallback={<User color="var(--color-text-light)" />}
                              alt={c.login}
                              width="28"
                              height="28"
                              className={styles.avatar}
                            />
                          </a>
                        </Tooltip>
                      </td>

                      <td>
                        <Tooltip content={`Visit ${c.login}'s GitHub profile`}>
                          <a href={c.html_url} target="_blank" rel="noopener noreferrer">
                            {c.login}
                          </a>
                        </Tooltip>
                      </td>

                      <td>{c.contributions} commits</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
        )}
      </div>

      <Pagination page={page} totalPages={tables.length} onChange={setPage} />
    </GlassCard>
  );
}
