"use client";

import { useState } from "react";
import TrailerModal from "./TrailerModal";
import styles from "../movie/[id]/movie.module.css";

/**
 * MovieDetailClient — handles all interactive parts of the detail page.
 * Kept as a thin client shell so the parent page stays a server component.
 *
 * Props:
 *   trailerKey  {string|null}
 *   movieTitle  {string}
 *   children    {ReactNode}  — the full server-rendered page content
 */
export default function MovieDetailClient({ trailerKey, movieTitle, children }) {
  const [trailerOpen, setTrailerOpen] = useState(false);

  return (
    <>
      {/* Inject trailer button into the actions slot via context-free prop drilling */}
      {children({ openTrailer: () => setTrailerOpen(true), trailerKey })}

      {trailerOpen && trailerKey && (
        <TrailerModal
          trailerKey={trailerKey}
          movieTitle={movieTitle}
          onClose={() => setTrailerOpen(false)}
        />
      )}
    </>
  );
}
