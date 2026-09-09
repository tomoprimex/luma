"use client";

import { useState } from "react";
import TrailerModal from "./TrailerModal";
import styles from "./TrailerButton.module.css";

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
        className={styles.btn}
        aria-label={`Watch ${movieTitle} trailer`}
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
