import Link from "next/link";
import styles from "./FeaturedMovie.module.css";

/**
 * FeaturedMovie — cinematic banner using real TMDB data.
 * Server component — receives pre-fetched movie object.
 */
export default function FeaturedMovie({ movie }) {
  if (!movie) return null;

  const genres = movie.genres?.slice(0, 3) ?? [];
  const overview = movie.overview
    ? movie.overview.slice(0, 180) + (movie.overview.length > 180 ? "…" : "")
    : null;

  return (
    <div className={styles.featured}>
      {/* Backdrop */}
      {movie.backdropUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={movie.backdropUrl}
          alt=""
          className={styles.backdrop}
          aria-hidden="true"
        />
      ) : (
        <div className={styles.backdropFallback} aria-hidden="true" />
      )}

      {/* Gradients */}
      <div className={styles.gradLeft}  aria-hidden="true" />
      <div className={styles.gradBottom} aria-hidden="true" />

      {/* Content */}
      <div className={styles.content}>
        {genres.length > 0 && (
          <div className={styles.genres}>
            {genres.map((g) => (
              <span key={g} className={styles.genreTag}>{g}</span>
            ))}
          </div>
        )}

        <h2 className={styles.title}>{movie.title}</h2>

        <div className={styles.meta}>
          {movie.rating && (
            <span className={styles.rating}>
              <StarIcon />
              {movie.rating}
            </span>
          )}
          {movie.year && (
            <span className={styles.metaItem}>{movie.year}</span>
          )}
          {movie.runtime && (
            <span className={styles.metaItem}>
              {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
            </span>
          )}
        </div>

        {overview && <p className={styles.overview}>{overview}</p>}

        <div className={styles.actions}>
          <Link href={`/movie/${movie.id}`} className={styles.btnPrimary}>
            More Details
          </Link>
        </div>
      </div>
    </div>
  );
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}
