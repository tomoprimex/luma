"use client";

import { useState, useEffect } from "react";
import TopBar from "@/app/components/TopBar";
import MovieCard from "@/app/components/MovieCard";
import { useAuth } from "@/app/components/AuthProvider";
import styles from "./recently-viewed.module.css";

export default function RecentlyViewedPage() {
  const { user, isAuthenticated, recentlyViewed, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(authLoading);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  if (loading) {
    return (
      <>
        <TopBar title="Recently Viewed" />
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

  const items = isAuthenticated ? recentlyViewed : [];

  return (
    <>
      <TopBar title="Recently Viewed" />
      <main className={styles.main}>
        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🕒</div>
            <h2 className={styles.emptyTitle}>No recently viewed movies</h2>
            <p className={styles.emptyText}>
              {isAuthenticated
                ? "Movies you view will appear here so you can pick up where you left off."
                : "Sign in to track your recently viewed movies across sessions."}
            </p>
            {!isAuthenticated && (
              <a href="/signin" className={styles.emptyCta}>Sign In</a>
            )}
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {items.map((item) => (
                <MovieCard
                  key={`${item.tmdb_id}-${item.media_type}`}
                  id={item.tmdb_id}
                  title={item.movie_title || item.title}
                  year={item.viewed_at ? new Date(item.viewed_at).getFullYear() : null}
                  posterUrl={item.poster_path}
                  size="md"
                />
              ))}
            </div>
            <p className={styles.itemCount}>
              {items.length} {items.length === 1 ? "title" : "titles"} recently viewed
            </p>
          </>
        )}
      </main>
    </>
  );
}
