"use client";

import { useState, useEffect } from "react";
import TopBar from "@/app/components/TopBar";
import MovieCard from "@/app/components/MovieCard";
import { useAuth } from "@/app/components/AuthProvider";
import styles from "./watchlist.module.css";

const STORAGE_KEY = "luma_watchlist";

export default function WatchlistPage() {
  const { user, isAuthenticated, watchlist, removeFromWatchlist, loading: authLoading } = useAuth();
  const [localMovies, setLocalMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(authLoading);
    } else {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setLocalMovies(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load watchlist:", e);
      }
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const movies = isAuthenticated ? watchlist : localMovies;

  const handleRemove = async (movieId) => {
    if (isAuthenticated) {
      await removeFromWatchlist(movieId);
    } else {
      const updated = localMovies.filter((m) => m.id !== movieId);
      setLocalMovies(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save watchlist:", e);
      }
    }
  };

  if (loading) {
    return (
      <>
        <TopBar title="Watchlist" />
        <main className={styles.main}>
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <MovieCard key={i} size="md" />
            ))}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar title="Watchlist" />
      <main className={styles.main}>
        {movies.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎬</div>
            <h2 className={styles.emptyTitle}>Your watchlist is empty</h2>
            <p className={styles.emptyText}>
              {isAuthenticated
                ? "Browse movies and add them to your watchlist to see them here."
                : "Sign in to sync your watchlist across devices, or add movies locally."}
            </p>
            {!isAuthenticated && (
              <a href="/signin" className={styles.emptyCta}>Sign In</a>
            )}
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {movies.map((movie) => (
                <div key={movie.id || movie.tmdb_id} className={styles.cardWrap}>
                  <MovieCard
                    id={movie.id || movie.tmdb_id}
                    title={movie.title}
                    year={movie.year}
                    rating={movie.rating}
                    posterUrl={movie.posterUrl}
                    size="md"
                  />
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemove(movie.id || movie.tmdb_id)}
                    aria-label={`Remove ${movie.title} from watchlist`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <p className={styles.itemCount}>
              {movies.length} {movies.length === 1 ? "movie" : "movies"} in your watchlist
            </p>
          </>
        )}
      </main>
    </>
  );
}
