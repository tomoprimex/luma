"use client";

import styles from "./InlineTrailer.module.css";

/**
 * InlineTrailer — replaces the modal with an in-page trailer section.
 *
 * Props:
 *   trailerKey  {string}
 *   movieTitle  {string}
 *   onClose     {function}
 */
export default function InlineTrailer({ trailerKey, movieTitle, onClose }) {
  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <p className={styles.label}>Trailer</p>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close trailer"
          type="button"
        >
          <CloseIcon />
        </button>
      </div>

      <div className={styles.wrap}>
        <iframe
          src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
          title={`${movieTitle} trailer`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
