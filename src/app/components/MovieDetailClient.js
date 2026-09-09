"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider";
import styles from "@/app/movie/[id]/movie.module.css";
import TrailerButton from "./TrailerButton";
import WatchProviders from "./WatchProviders";
import AuthModal from "./AuthModal";
import {
  getMovieRating,
  upsertMovieRating,
  getMovieRatingSummary,
} from "@/lib/supabase";

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" suppressHydrationWarning>
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" suppressHydrationWarning>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" suppressHydrationWarning>
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" suppressHydrationWarning>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function BookmarkFilledIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" suppressHydrationWarning>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function FilmIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" suppressHydrationWarning>
      <rect x="2" y="2" width="20" height="20" rx="2.18"/>
      <line x1="7" y1="2" x2="7" y2="22"/>
      <line x1="17" y1="2" x2="17" y2="22"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <line x1="2" y1="7" x2="7" y2="7"/>
      <line x1="2" y1="17" x2="7" y2="17"/>
      <line x1="17" y1="17" x2="22" y2="17"/>
      <line x1="17" y1="7" x2="22" y2="7"/>
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <div className={styles.detailItem}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  );
}

export default function MovieDetailClient({
  movie,
  credits,
  trailerKey,
  similar,
  watchProviders
}) {
  const { cast, director } = credits;
  const {
    user,
    isAuthenticated,
    inWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    recordRecentlyViewed,
  } = useAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("signin");
  const [archiveItem, setArchiveItem] = useState(null);
  const [loadingArchive, setLoadingArchive] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [communityRating, setCommunityRating] = useState(null);

  const inWatchlistLocal = isAuthenticated ? inWatchlist(movie.id) : false;
  const isFavoriteLocal = isAuthenticated ? isFavorite(movie.id, "movie") : false;

  const runtimeFormatted = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;

  const releaseDateFormatted = movie.releaseDate
    ? new Date(movie.releaseDate).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  const languageLabel = movie.originalLanguage
    ? new Intl.DisplayNames(["en"], { type: "language" }).of(movie.originalLanguage)
    : null;

  useEffect(() => {
    if (isAuthenticated && movie.id) {
      recordRecentlyViewed({
        tmdb_id: movie.id,
        media_type: "movie",
        movie_title: movie.title,
        poster_path: movie.posterUrl,
        backdrop_path: movie.backdropUrl,
      });
    }
  }, [isAuthenticated, movie.id, movie.title, movie.posterUrl, movie.backdropUrl, recordRecentlyViewed]);

  useEffect(() => {
    const loadRatings = async () => {
      if (!movie.id) return;
      const summary = await getMovieRatingSummary(movie.id, "movie");
      if (summary) {
        setCommunityRating(summary.average_rating ? Number(summary.average_rating).toFixed(1) : null);
      }
      if (isAuthenticated && user) {
        const rating = await getMovieRating(user.id, movie.id, "movie");
        if (rating) setUserRating(rating.rating);
      }
    };
    loadRatings();
  }, [movie.id, isAuthenticated, user]);

  const handleRate = async (rating) => {
    if (!isAuthenticated || !user) {
      setAuthModalTab("signin");
      setShowAuthModal(true);
      return;
    }
    setRatingLoading(true);
    const { error } = await upsertMovieRating(user.id, movie.id, "movie", rating);
    setRatingLoading(false);
    if (!error) {
      setUserRating(rating);
    }
  };

  const ratingOptions = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

  useEffect(() => {
    const fetchArchiveItem = async () => {
      setLoadingArchive(true);
      try {
        const query = `${movie.title} ${movie.year}`;
        const response = await fetch(
          `https://archive.org/advancedsearch.php?q=${encodeURIComponent(query)}&rows=1&output=json`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.response && data.response.docs && data.response.docs.length > 0) {
            const item = data.response.docs.find((i) =>
              i.mediatype === "movies" ||
              i.mediatype === "video" ||
              (i.format && (i.format.includes("MPEG4") || i.format.includes("H.264")))
            );
            if (item) {
              setArchiveItem({
                identifier: item.identifier,
                title: item.title,
                year: item.date ? item.date.substring(0, 4) : null,
              });
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch Internet Archive item:", e);
      } finally {
        setLoadingArchive(false);
      }
    };

    fetchArchiveItem();
  }, [movie.title, movie.year]);

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      setAuthModalTab("signin");
      setShowAuthModal(true);
      return;
    }
    if (inWatchlistLocal) {
      await removeFromWatchlist(movie.id);
    } else {
      await addToWatchlist({
        id: movie.id,
        title: movie.title,
        year: movie.year,
        rating: movie.rating,
        posterUrl: movie.posterUrl,
        media_type: "movie",
      });
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      setAuthModalTab("signin");
      setShowAuthModal(true);
      return;
    }
    if (isFavoriteLocal) {
      await removeFromFavorites(movie.id, "movie");
    } else {
      await addToFavorites(movie.id, "movie");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.backdropWrap}>
        {movie.backdropUrl ? (
          <img
            src={movie.backdropUrlFull || movie.backdropUrl}
            alt=""
            className={styles.backdropImg}
            aria-hidden="true"
          />
        ) : (
          <div className={styles.backdropFallback} aria-hidden="true" />
        )}
        <div className={styles.backdropFade} aria-hidden="true" />
        <Link href="/" className={styles.backBtn} aria-label="Back to home">
          <BackIcon /> Back
        </Link>
      </div>

      <div className={styles.content}>
        <div className={styles.layout}>
          <aside className={styles.posterCol}>
            <div className={styles.posterWrap}>
              {movie.posterUrlLarge || movie.posterUrl ? (
                <img
                  src={movie.posterUrlLarge || movie.posterUrl}
                  alt={`${movie.title} poster`}
                  className={styles.posterImg}
                />
              ) : (
                <div className={styles.posterPlaceholder}><FilmIcon /></div>
              )}
            </div>
          </aside>

          <div className={styles.infoCol}>
            {movie.genres?.length > 0 && (
              <div className={styles.genres}>
                {movie.genres.map((g) => (
                  <span key={g} className={styles.genreTag}>{g}</span>
                ))}
              </div>
            )}

            <h1 className={styles.title}>{movie.title}</h1>

            {movie.tagline && (
              <p className={styles.tagline}>"{movie.tagline}"</p>
            )}

            <div className={styles.metaRow}>
              {movie.rating && (
                <span className={styles.ratingBadge}>
                  <StarIcon /> {movie.rating}
                  {movie.voteCount > 0 && (
                    <span className={styles.voteCount}>({movie.voteCount.toLocaleString()})</span>
                  )}
                </span>
              )}
              {movie.year && <span className={styles.metaItem}>{movie.year}</span>}
              {runtimeFormatted && (
                <span className={styles.metaItem}><ClockIcon /> {runtimeFormatted}</span>
              )}
              {languageLabel && <span className={styles.metaItem}>{languageLabel}</span>}
            </div>

            <div className={styles.actions}>
              {trailerKey && (
                <TrailerButton trailerKey={trailerKey} movieTitle={movie.title} />
              )}
              <button
                className={`${styles.watchlistBtn} ${inWatchlistLocal ? styles.active : ""}`}
                onClick={handleWatchlistToggle}
                aria-label={inWatchlistLocal ? "Remove from watchlist" : "Add to watchlist"}
              >
                {inWatchlistLocal ? <BookmarkFilledIcon /> : <BookmarkIcon />}
                {inWatchlistLocal ? "In Watchlist" : "Add to Watchlist"}
              </button>
              <button
                className={`${styles.favoriteBtn} ${isFavoriteLocal ? styles.favoriteBtnActive : ""}`}
                onClick={handleFavoriteToggle}
                aria-label={isFavoriteLocal ? "Remove from favorites" : "Add to favorites"}
                title={isFavoriteLocal ? "Remove from favorites" : "Add to favorites"}
              >
                <HeartIcon filled={isFavoriteLocal} />
              </button>
            </div>

            <div className={styles.ratingSection}>
              <p className={styles.sectionLabel}>Your Rating</p>
              <div className={styles.ratingControls}>
                <div className={styles.ratingScale}>
                  {ratingOptions.map((r) => (
                    <button
                      key={r}
                      className={`${styles.ratingOption} ${userRating === r ? styles.ratingOptionActive : ""}`}
                      onClick={() => handleRate(r)}
                      disabled={ratingLoading}
                      aria-label={`Rate ${r} out of 10`}
                      aria-pressed={userRating === r}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {userRating && (
                  <button className={styles.ratingClear} onClick={() => handleRate(null)} disabled={ratingLoading}>
                    Clear
                  </button>
                )}
              </div>
              {communityRating && (
                <p className={styles.communityRating}>
                  Community average: {communityRating}/10
                </p>
              )}
            </div>

            {archiveItem && (
              <div className={styles.archiveSection}>
                <a
                  href={`https://archive.org/details/${archiveItem.identifier}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.archiveLink}
                >
                  <span className={styles.archiveIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </span>
                  <span>Watch Free on Internet Archive</span>
                  <ExternalIcon />
                </a>
              </div>
            )}
            {loadingArchive && (
              <div className={styles.archiveLoading}>
                <span className={styles.archiveSpinner} aria-hidden="true" />
                <span>Checking for free versions...</span>
              </div>
            )}

            <WatchProviders providers={watchProviders} movieTitle={movie.title} />

            {movie.overview && (
              <div className={styles.overviewSection}>
                <p className={styles.sectionLabel}>Overview</p>
                <p className={styles.overview}>{movie.overview}</p>
              </div>
            )}

            <div className={styles.detailsGrid}>
              {releaseDateFormatted && <Detail label="Release Date" value={releaseDateFormatted} />}
              {director && <Detail label="Director" value={director.name} />}
              {movie.status && <Detail label="Status" value={movie.status} />}
              {movie.originalTitle && movie.originalTitle !== movie.title &&
                <Detail label="Original Title" value={movie.originalTitle} />}
              {movie.productionCountries?.length > 0 &&
                <Detail label="Country" value={movie.productionCountries.join(", ")} />}
              {movie.budget > 0 && <Detail label="Budget" value={`$${(movie.budget / 1_000_000).toFixed(1)}M`} />}
              {movie.revenue > 0 && <Detail label="Box Office" value={`$${(movie.revenue / 1_000_000).toFixed(1)}M`} />}
            </div>

            {cast.length > 0 && (
              <div className={styles.castSection}>
                <p className={styles.sectionLabel}>Cast</p>
                <div className={styles.castTrack}>
                  {cast.map((person) => (
                    <div key={person.id} className={styles.castCard}>
                      <div className={styles.castPhoto}>
                        {person.profileUrl ? (
                          <img src={person.profileUrl} alt={person.name} className={styles.castPhotoImg} loading="lazy" />
                        ) : (
                          <div className={styles.castPhotoFallback}>{person.name.charAt(0)}</div>
                        )}
                      </div>
                      <span className={styles.castName}>{person.name}</span>
                      {person.character && <span className={styles.castCharacter}>{person.character}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {similar.length > 0 && (
          <div className={styles.similarSection}>
            <div className={styles.similarTitle}>More Like This</div>
            <div className={styles.similarGrid}>
              {similar.slice(0, 6).map((m) => (
                <Link key={m.id} href={`/movie/${m.id}`} className={styles.similarCard}>
                  <div className={styles.similarPoster}>
                    {m.posterUrl ? (
                      <img src={m.posterUrl} alt={m.title} loading="lazy" />
                    ) : (
                      <div className={styles.similarPosterFallback}>🎬</div>
                    )}
                  </div>
                  <div className={styles.similarInfo}>
                    <span className={styles.similarTitle}>{m.title}</span>
                    {m.year && <span className={styles.similarMeta}>{m.year}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          initialTab={authModalTab}
          onAuthSuccess={() => {
            setShowAuthModal(false);
          }}
        />
      )}
    </div>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" suppressHydrationWarning>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
