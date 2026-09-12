"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import MovieCard from "@/app/components/MovieCard";
import styles from "./search.module.css";

const RESULTS_PER_PAGE = 20;

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || searchParams.get("query") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const abortRef = useRef(null);

  const trimmedQuery = query.trim();

  useEffect(() => {
    if (!trimmedQuery) {
      setResults([]);
      setError(null);
      setPage(1);
      setTotalPages(1);
      setTotalResults(0);
      return;
    }

    setLoading(true);
    setError(null);
    setPage(1);
    setTotalPages(1);
    setTotalResults(0);
    setResults([]);

    const controller = new AbortController();
    abortRef.current = controller;

    fetch(`/api/movies/search?q=${encodeURIComponent(trimmedQuery)}&page=1`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error && !data.results?.length) {
          setError(data.error);
        } else {
          setResults(data.results || []);
          setPage(data.page || 1);
          setTotalPages(data.total_pages || 1);
          setTotalResults(data.total_results || 0);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Search failed. Please try again.");
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [trimmedQuery]);

  const loadMore = useCallback(() => {
    if (loadingMore || page >= totalPages) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    setError(null);

    fetch(`/api/movies/search?q=${encodeURIComponent(trimmedQuery)}&page=${nextPage}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setResults((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const fresh = (data.results || []).filter((m) => !existingIds.has(m.id));
            return [...prev, ...fresh];
          });
          setPage(data.page || nextPage);
          setTotalPages(data.total_pages || totalPages);
          setTotalResults(data.total_results || totalResults);
        }
        setLoadingMore(false);
      })
      .catch(() => {
        setError("Failed to load more results.");
        setLoadingMore(false);
      });
  }, [loadingMore, page, totalPages, trimmedQuery, totalResults]);

  const hasMore = page < totalPages;

  const skeletonCount = useMemo(() => Math.min(RESULTS_PER_PAGE, 20), []);

  useEffect(() => {
    if (trimmedQuery) {
      document.title = `Search: ${trimmedQuery} | LUMA`;
    } else {
      document.title = "Search | LUMA";
    }
  }, [trimmedQuery]);

  if (!trimmedQuery) {
    return (
      <div className={styles.page}>
        <div className={styles.discovery}>
          <div className={styles.discoveryIcon} aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h1 className={styles.discoveryTitle}>Search for a movie or TV show</h1>
          <p className={styles.discoveryText}>
            Start typing in the search bar above to discover titles, or browse trending and popular movies.
          </p>
          <div className={styles.emptyActions}>
            <Link href="/browse/trending" className={styles.emptyLink}>Trending</Link>
            <Link href="/browse/popular" className={styles.emptyLink}>Popular</Link>
            <Link href="/browse/top-rated" className={styles.emptyLink}>Top Rated</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.queryLabel}>Search</div>
        <div className={styles.queryText}>&ldquo;{trimmedQuery}&rdquo;</div>
      </div>

      {results.length > 0 && !loading && (
        <div className={styles.resultsHeading}>
          <span className={styles.resultsCount}>
            {totalResults.toLocaleString()} result{totalResults !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {loading && (
        <div className={styles.skeletonGrid} aria-hidden="true">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonPoster} />
              <div className={styles.skeletonLine} style={{ width: "80%" }} />
              <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className={styles.errorState}>
          <h2 className={styles.errorTitle}>Search failed</h2>
          <p className={styles.errorText}>
            We couldn&apos;t complete your search. Please check your connection and try again.
          </p>
          <button className={styles.retryBtn} onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && results.length === 0 && trimmedQuery && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon} aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h2 className={styles.emptyTitle}>No results found</h2>
          <p className={styles.emptyText}>
            We couldn&apos;t find anything matching &ldquo;{trimmedQuery}&rdquo;. Try a different search term or browse our collections.
          </p>
          <div className={styles.emptyActions}>
            <Link href="/browse/trending" className={styles.emptyLink}>Trending</Link>
            <Link href="/browse/popular" className={styles.emptyLink}>Popular</Link>
            <Link href="/" className={styles.emptyLinkPrimary}>Back to Home</Link>
          </div>
        </div>
      )}

        {!loading && results.length > 0 && (
          <div className={styles.grid}>
            {results.map((item) => {
              const isTV = item.media_type === "tv";
              const displayTitle = isTV ? `TV: ${item.title}` : item.title;

              if (isTV) {
                return (
                  <a
                    key={`tv-${item.id}`}
                    href={`https://www.themoviedb.org/tv/${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <MovieCard
                      title={displayTitle}
                      year={item.year}
                      rating={item.rating}
                      genre={item.genre}
                      posterUrl={item.posterUrl}
                      size="md"
                      layout="list"
                    />
                  </a>
                );
              }

              return (
                <MovieCard
                  key={`movie-${item.id}`}
                  id={item.id}
                  title={displayTitle}
                  year={item.year}
                  rating={item.rating}
                  genre={item.genre}
                  posterUrl={item.posterUrl}
                  size="md"
                  layout="list"
                />
              );
            })}
          </div>
        )}

      {hasMore && !loading && !error && results.length > 0 && (
        <div className={styles.loadMore}>
          <button className={styles.loadMoreBtn} onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading…" : `Load more (page ${page + 1} of ${totalPages})`}
          </button>
        </div>
      )}

      {!hasMore && results.length > 0 && !loading && !error && (
        <div className={styles.loadMore}>
          <span className={styles.endLabel}>All {totalResults.toLocaleString()} results shown</span>
        </div>
      )}
    </div>
  );
}
