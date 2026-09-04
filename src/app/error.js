"use client";

import { useEffect } from "react";
import styles from "./error.module.css";

/**
 * error.js — Next.js App Router error boundary.
 * Shown when the async page throws during rendering.
 */
export default function HomeError({ error, reset }) {
  useEffect(() => {
    console.error("Homepage error:", error);
  }, [error]);

  const isMissingKey =
    error?.message?.includes("TMDB_API_KEY") ||
    error?.message?.includes("not configured");

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.iconWrap} aria-hidden="true">
          <AlertIcon />
        </div>

        <h1 className={styles.title}>
          {isMissingKey ? "API key not configured" : "Something went wrong"}
        </h1>

        <p className={styles.desc}>
          {isMissingKey
            ? "Add your TMDB_API_KEY to .env.local and restart the dev server."
            : "LUMA couldn't load movie data. This is usually a network or API issue."}
        </p>

        {error?.message && !isMissingKey && (
          <pre className={styles.errorDetail}>{error.message}</pre>
        )}

        <div className={styles.actions}>
          <button className={styles.retryBtn} onClick={reset}>
            Try again
          </button>
          <a className={styles.homeLink} href="/">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

function AlertIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
