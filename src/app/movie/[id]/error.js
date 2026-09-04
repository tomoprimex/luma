"use client";

import { useEffect } from "react";

export default function MovieError({ error, reset }) {
  useEffect(() => {
    console.error("Movie detail error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        padding: "32px",
        background: "var(--bg-base)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ef4444",
          fontSize: "1.5rem",
        }}
        aria-hidden="true"
      >
        ⚠
      </div>

      <h1
        style={{
          fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
          fontWeight: 800,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}
      >
        Couldn&apos;t load this movie
      </h1>

      <p style={{ color: "var(--text-secondary)", maxWidth: 400, lineHeight: 1.7 }}>
        There was a problem fetching the movie data. This is usually a temporary
        network or API issue.
      </p>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{
            padding: "12px 28px",
            background: "var(--blue-electric)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.9rem",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
          }}
        >
          Try again
        </button>
        <a
          href="/"
          style={{
            padding: "12px 24px",
            background: "transparent",
            color: "var(--text-muted)",
            fontWeight: 600,
            fontSize: "0.9rem",
            borderRadius: "10px",
            border: "1px solid var(--border-subtle)",
            textDecoration: "none",
          }}
        >
          Go home
        </a>
      </div>
    </div>
  );
}
