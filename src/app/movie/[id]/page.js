import { notFound } from "next/navigation";
import TopBar from "@/app/components/TopBar";
import MovieDetailClient from "@/app/components/MovieDetailClient";
import {
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
  getSimilarMovies,
  getMovieWatchProviders,
} from "@/lib/tmdb";

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

  return (
    <>
      <TopBar title={movie.title} />
      <MovieDetailClient
        movie={movie}
        credits={credits}
        trailerKey={trailerKey}
        similar={similar}
        watchProviders={watchProviders}
      />
    </>
  );
}
