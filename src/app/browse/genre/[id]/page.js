import { notFound } from "next/navigation";
import BrowseGrid from "@/app/components/BrowseGrid";
import styles from "../../[category]/browse.module.css";
const GENRE_NAMES = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 18: "Drama", 27: "Horror", 878: "Sci-Fi",
  53: "Thriller", 99: "Documentary", 14: "Fantasy", 9648: "Mystery",
  10749: "Romance", 36: "History", 10402: "Music",
};

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

async function fetchGenreMovies(genreId) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY is not configured");

  const url = new URL("https://api.themoviedb.org/3/discover/movie");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("with_genres", String(genreId));
  url.searchParams.set("sort_by", "popularity.desc");
  url.searchParams.set("page", "1");

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  const data = await res.json();

  return (data.results || []).map((m) => ({
    id: m.id,
    title: m.title,
    year: m.release_date ? new Date(m.release_date).getFullYear() : null,
    rating: m.vote_average ? m.vote_average.toFixed(1) : null,
    posterUrl: m.poster_path ? `${TMDB_IMAGE_BASE}/w500${m.poster_path}` : null,
  }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const name = GENRE_NAMES[Number(id)] ?? "Genre";
  return { title: `${name} Movies` };
}

export default async function GenrePage({ params }) {
  const { id } = await params;
  const genreId = Number(id);
  if (!genreId || !GENRE_NAMES[genreId]) notFound();

  const genreName = GENRE_NAMES[genreId];
  let movies = [];
  try { movies = await fetchGenreMovies(genreId); } catch { /* empty grid */ }

  return (
    <>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>{genreName}</h1>
        </div>
        <BrowseGrid movies={movies} />
      </main>
    </>
  );
}
