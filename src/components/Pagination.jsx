import { useEffect } from 'react';
import styles from './Pagination.module.css';

function getVisiblePages(current, total, delta = 1) {
  const pages = [];
  const left = Math.max(0, current - delta);
  const right = Math.min(total - 1, current + delta);

  for (let i = left; i <= right; i++) {
    pages.push(i);
  }

  return pages;
}

export default function Pagination({ page, totalPages, onChange }) {
  // ⌨️ keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' && page < totalPages - 1) {
        onChange(page + 1);
      }
      if (e.key === 'ArrowLeft' && page > 0) {
        onChange(page - 1);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [page, totalPages, onChange]);

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      {/* Previous */}
      <button
        className={styles.arrow}
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        aria-label="Previous page">
        ‹
      </button>

      {/* First page */}
      {visiblePages[0] > 0 && (
        <>
          <button className={styles.page} onClick={() => onChange(0)}>
            1
          </button>
          <span className={styles.ellipsis}>…</span>
        </>
      )}

      {/* Visible pages */}
      {visiblePages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`${styles.page} ${p === page ? styles.active : ''}`}
          aria-current={p === page ? 'page' : undefined}>
          {p + 1}
        </button>
      ))}

      {/* Last page */}
      {visiblePages.at(-1) < totalPages - 1 && (
        <>
          <span className={styles.ellipsis}>…</span>
          <button className={styles.page} onClick={() => onChange(totalPages - 1)}>
            {totalPages}
          </button>
        </>
      )}

      {/* Next */}
      <button
        className={styles.arrow}
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages - 1}
        aria-label="Next page">
        ›
      </button>
    </nav>
  );
}
