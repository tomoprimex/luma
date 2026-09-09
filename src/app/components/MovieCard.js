import Link from "next/link";
import styles from "./MovieCard.module.css";

export default function MovieCard({
  id,
  title,
  year,
  rating,
  genre,
  posterUrl,
  size = "md",
  onFavoriteToggle,
  isFavorite,
}) {
  const isEmpty = !title;

  if (isEmpty) {
    return (
      <div
        className={`${styles.card} ${styles[size]} ${styles.skeleton}`}
        aria-hidden="true"
      >
        <div className={styles.posterSkeleton} />
        <div className={styles.infoSkeleton}>
          <div className={styles.skeletonLine} style={{ width: "70%" }} />
          <div className={styles.skeletonLine} style={{ width: "40%" }} />
        </div>
      </div>
    );
  }

  const inner = (
    <>
      <div className={styles.posterWrap}>
        {posterUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={posterUrl}
            alt={`${title} poster`}
            className={styles.poster}
            loading="lazy"
          />
        ) : (
          <div className={styles.posterPlaceholder} aria-label="No poster available">
            <FilmIcon />
          </div>
        )}

        <div className={styles.overlay} aria-hidden="true">
          <div className={styles.playBtn}>
            <PlayIcon />
          </div>
        </div>

        {isFavorite && (
          <div className={styles.favoriteBadge} aria-label="In favorites">
            <HeartFilledIcon />
          </div>
        )}

        {rating && (
          <div className={styles.ratingBadge} aria-label={`Rating: ${rating}`}>
            <StarIcon />
            <span>{rating}</span>
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.meta}>
          {year && <span className={styles.year}>{year}</span>}
          {year && genre && (
            <span className={styles.dot} aria-hidden="true">·</span>
          )}
          {genre && <span className={styles.genre}>{genre}</span>}
        </div>
      </div>
    </>
  );

  const cardContent = (
    <div className={`${styles.card} ${styles[size]}`}>
      {inner}
      {onFavoriteToggle && id && (
        <button
          className={`${styles.favoriteBtn} ${isFavorite ? styles.favoriteBtnActive : ""}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onFavoriteToggle(id);
          }}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <HeartIcon filled={isFavorite} />
        </button>
      )}
    </div>
  );

  if (id) {
    return (
      <Link
        href={`/movie/${id}`}
        className={`${styles.cardLink} ${styles[size]}`}
        aria-label={`View details for ${title}`}
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" suppressHydrationWarning>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" suppressHydrationWarning>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" suppressHydrationWarning>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function HeartFilledIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" suppressHydrationWarning>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function FilmIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" suppressHydrationWarning>
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  );
}
