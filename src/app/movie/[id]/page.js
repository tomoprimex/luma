import { notFound } from "next/navigation";
import Link from "next/link";
import TopBar from "@/app/components/TopBar";
import MovieRow from "@/app/components/MovieRow";
import TrailerButton from "@/app/components/TrailerButton";
import WatchProviders from "@/app/components/WatchProviders";
import {
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
  getSimilarMovies,
  getMovieWatchProviders,
} from "@/lib/tmdb";
import styles from "./movie.module.css";

/* ── Metadata ───────────────────────────────────────────────── */
export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const movie = await getMovieDetails(Number(id));
    return {
      title: movie.title,
      description: movie.overview?.slice(0, 155) ?? `Discover ${movie.title} on LUMA.`,
      openGraph: {
        title: `${movie.title} | LUMA`,
        description: movie.overview?.slice(0, 155) ?? "",
        images: movie.backdropUrl ? [{ url: movie.backdropUrl }] : [],
      },
    };
  } catch {
    return { title: "Movie" };
  }
}

/* ── Safe fetch ─────────────────────────────────────────────── */
async function safeFetch(fn, fallback) {
  try { return await fn(); } catch (err) {
    console.error("LUMA detail fetch error:", err.message);
    return fallback;
  }
}

/* ── Page ───────────────────────────────────────────────────── */
export default async function MovieDetailPage({ params }) {
  const { id } = await params;
  const movieId = Number(id);
  if (!movieId || isNaN(movieId)) notFound();

  let movie;
  try {
    movie = await getMovieDetails(movieId);
  } catch (err) {
    if (err.message.includes("404")) notFound();
    throw err;
  }

  const [credits, trailerKey, similar, watchProviders] = await Promise.all([
    safeFetch(() => getMovieCredits(movieId),      { cast: [], director: null }),
    safeFetch(() => getMovieVideos(movieId),        null),
    safeFetch(() => getSimilarMovies(movieId),      []),
    safeFetch(() => getMovieWatchProviders(movieId), null),
  ]);

  const { cast, director } = credits;

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

  return (
    <>
      <TopBar title={movie.title} />

      <div className={styles.page}>
        {/* ── Backdrop ──────────────────────────────────────── */}
        <div className={styles.backdropWrap}>
          {movie.backdropUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
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

        {/* ── Content ───────────────────────────────────────── */}
        <div className={styles.content}>
          <div className={styles.layout}>
            {/* Poster */}
            <aside className={styles.posterCol}>
              <div className={styles.posterWrap}>
                {movie.posterUrlLarge || movie.posterUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
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

            {/* Info */}
            <div className={styles.infoCol}>
              {/* Genres */}
              {movie.genres?.length > 0 && (
                <div className={styles.genres}>
                  {movie.genres.map((g) => (
                    <span key={g} className={styles.genreTag}>{g}</span>
                  ))}
                </div>
              )}

              <h1 className={styles.title}>{movie.title}</h1>

              {movie.tagline && (
                <p className={styles.tagline}>&ldquo;{movie.tagline}&rdquo;</p>
              )}

              {/* Meta */}
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

              {/* Actions */}
              <div className={styles.actions}>
                {trailerKey && (
                  <TrailerButton trailerKey={trailerKey} movieTitle={movie.title} />
                )}
                <button className={styles.watchlistBtn}>
                  <BookmarkIcon /> Add to Watchlist
                </button>
              </div>

              {/* Watch providers */}
              <WatchProviders providers={watchProviders} movieTitle={movie.title} />

              {/* Overview */}
              {movie.overview && (
                <div className={styles.overviewSection}>
                  <p className={styles.sectionLabel}>Overview</p>
                  <p className={styles.overview}>{movie.overview}</p>
                </div>
              )}

              {/* Details grid */}
              <div className={styles.detailsGrid}>
                {releaseDateFormatted && <Detail label="Release Date" value={releaseDateFormatted} />}
                {director           && <Detail label="Director"      value={director.name} />}
                {movie.status       && <Detail label="Status"        value={movie.status} />}
                {movie.originalTitle && movie.originalTitle !== movie.title &&
                  <Detail label="Original Title" value={movie.originalTitle} />}
                {movie.productionCountries?.length > 0 &&
                  <Detail label="Country" value={movie.productionCountries.join(", ")} />}
                {movie.budget  > 0 && <Detail label="Budget"     value={`$${(movie.budget  / 1_000_000).toFixed(1)}M`} />}
                {movie.revenue > 0 && <Detail label="Box Office" value={`$${(movie.revenue / 1_000_000).toFixed(1)}M`} />}
              </div>

              {/* Cast */}
              {cast.length > 0 && (
                <div className={styles.castSection}>
                  <p className={styles.sectionLabel}>Cast</p>
                  <div className={styles.castTrack}>
                    {cast.map((person) => (
                      <div key={person.id} className={styles.castCard}>
                        <div className={styles.castPhoto}>
                          {person.profileUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
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

          {/* Similar movies */}
          {similar.length > 0 && (
            <div className={styles.similarSection}>
              <MovieRow title="More Like This" movies={similar} cardSize="md" skeletonCount={6} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */
function Detail({ label, value }) {
  return (
    <div className={styles.detailItem}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  );
}

/* ── Icons ──────────────────────────────────────────────────── */
function BackIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>;
}
function StarIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
}
function ClockIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function BookmarkIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
}
function FilmIcon() {
  return <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>;
}
