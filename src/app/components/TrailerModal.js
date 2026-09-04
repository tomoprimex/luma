"use client";

import { useEffect, useCallback } from "react";
import styles from "./TrailerModal.module.css";

/**
 * TrailerModal — client component that renders a YouTube embed in a modal.
 *
 * Props:
 *   trailerKey  {string}    YouTube video key
 *   movieTitle  {string}    Used in the modal header
 *   onClose     {function}  Called when the modal should close
 */
export default function TrailerModal({ trailerKey, movieTitle, onClose }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div
      className={styles.modalBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label={`${movieTitle} trailer`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modalInner}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>{movieTitle} — Trailer</span>
          <button
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close trailer"
          >
            <CloseIcon />
          </button>
        </div>

        <div className={styles.iframeWrap}>
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
            title={`${movieTitle} trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
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
