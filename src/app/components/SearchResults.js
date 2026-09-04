"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import styles from "./SearchResults.module.css";

/**
 * SearchResults — fetches /api/movies/search, supports Load More pagination.
 *
 * Props:
 *   query    {string}    The search query (must be non-empty to trigger fetch)
 *   onClose  {function}  Called when a result is clicked or Escape is pressed
 */
export default function SearchResults({ query, onClose }) {
  const [results, setResults]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]             = useState(null);
  const [moreError, setMoreError]     = useState(null);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const abortRef = useRef(null);

  // Fetch page 1 whenever the query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      setPage(1);
      setTotalPages(1);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setMoreError(null);
    setResults([]);
    setPage(1);

    fetch(`/api/movies/search?q=${encodeURIComponent(query.trim())}&page=1`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error && !data.movies?.length) {
          setError(data.error);
        } else {
          setResults(data.movies || []);
          setPage(data.page || 1);
          setTotalPages(data.total_pages || 1);
          setTotalResults(data.total_results || 0);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError("Search failed. Please try again.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [query]);

  // Load next page — appends to existing results, deduplicates by id
  const loadMore = useCallback(() => {
    if (loadingMore || page >= totalPages) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    setMoreError(null);

    fetch(`/api/movies/search?q=${encodeURIComponent(query.trim())}&page=${nextPage}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setMoreError(data.error);
        } else {
          setResults((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const fresh = (data.movies || []).filter((m) => !existingIds.has(m.id));
            return [...prev, ...fresh];
          });
          setPage(data.page || nextPage);
          setTotalPages(data.total_pages || totalPages);
        }
        setLoadingMore(false);
      })
      .catch(() => {
        setMoreError("Failed to load more results.");
        setLoadingMore(false);
      });
  }, [loadingMore, page, totalPages, query]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const hasMore = page < totalPages;

  return (
    <div className={styles.dropdown} role="listbox" aria-label="Search results">

      {/* Initial load spinner */}
      {loading && (
        <div className={styles.statusRow}>
          <div className={styles.spinner} aria-hidden="true" />
          Searching…
        </div>
      )}

      {/* Initial load error */}
      {!loading && error && (
        <p className={styles.errorMsg}>{error}</p>
      )}

      {/* No results */}
      {!loading && !error && results.length === 0 && query.trim() && (
        <div className={styles.statusRow}>
          No results for &ldquo;{query}&rdquo;
        </div>
      )}

      {/* Results list */}
      {!loading && results.length > 0 && (
        <>
          <div className={styles.header}>
            <span className={styles.headerLabel}>Results</span>
            <span className={styles.headerCount}>
              {results.length} of {totalResults.toLocaleString()}
            </span>
          </div>

          <ul className={styles.list} role="list">
            {results.map((movie) => (
              <li key={movie.id} role="option">
                <Link
                  href={`/movie/${movie.id}`}
                  className={styles.resultItem}
                  onClick={onClose}
                  aria-label={`${movie.title}${movie.year ? `, ${movie.year}` : ""}`}
                >
                  <div className={styles.poster}>
                    {movie.posterUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={movie.posterUrl} alt="" className={styles.posterImg} loading="lazy" />
                    ) : (
                      <div className={styles.posterFallback} aria-hidden="true">🎬</div>
                    )}
                  </div>
                  <div className={styles.resultInfo}>
                    <span className={styles.resultTitle}>{movie.title}</span>
                    <div className={styles.resultMeta}>
                      {movie.year && <span>{movie.year}</span>}
                      {movie.year && movie.genre && <span>·</span>}
                      {movie.genre && <span>{movie.genre}</span>}
                      {movie.rating && (
                        <>
                          <span>·</span>
                          <span className={styles.resultRating}>
                            <StarIcon />
                            {movie.rating}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Load More / end / error */}
          <div className={styles.footer}>
            {moreError && (
              <p className={styles.moreError}>{moreError}</p>
            )}

            {hasMore && !moreError && (
              <button
                className={styles.loadMoreBtn}
                onClick={loadMore}
                disabled={loadingMore}
                aria-label="Load more results"
              >
                {loadingMore ? (
                  <>
                    <div className={styles.spinnerSm} aria-hidden="true" />
                    Loading…
                  </>
                ) : (
                  `Load more (page ${page + 1} of ${totalPages})`
                )}
              </button>
            )}

            {!hasMore && !moreError && (
              <span className={styles.endLabel}>
                All {totalResults.toLocaleString()} results shown
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StarIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
