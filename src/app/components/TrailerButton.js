"use client";

import { useState } from "react";
import TrailerModal from "./TrailerModal";

/**
 * TrailerButton — self-contained client component.
 * Renders the "Watch Trailer" button and manages modal state.
 *
 * Props:
 *   trailerKey  {string}  YouTube video key
 *   movieTitle  {string}
 */
export default function TrailerButton({ trailerKey, movieTitle }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`Watch ${movieTitle} trailer`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 24px",
          background: "var(--blue-electric)",
          color: "#fff",
          fontSize: "0.9rem",
          fontWeight: 700,
          borderRadius: "10px",
          border: "none",
          fontFamily: "var(--font-sans)",
          cursor: "pointer",
          transition: "background 150ms ease, box-shadow 150ms ease, transform 150ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--blue-bright)";
          e.currentTarget.style.boxShadow = "0 0 24px rgba(33,150,243,0.35)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--blue-electric)";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        <PlayIcon />
        Watch Trailer
      </button>

      {open && (
        <TrailerModal
          trailerKey={trailerKey}
          movieTitle={movieTitle}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
