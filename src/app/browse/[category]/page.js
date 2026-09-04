import { notFound } from "next/navigation";
import TopBar from "@/app/components/TopBar";
import MovieCard from "@/app/components/MovieCard";
import { getTrendingMovies, getPopularMovies, getTopRatedMovies } from "@/lib/tmdb";
import styles from "./browse.module.css";

const CATEGORIES = {
  trending:   { label: "Trending Now",   fetch: () => getTrendingMovies("week") },
  popular:    { label: "Popular Movies", fetch: () => getPopularMovies(1) },
  "top-rated":{ label: "Top Rated",      fetch: () => getTopRatedMovies(1) },
};

export async function generateMetadata({ params }) {
  const { category } = await params;
  const cat = CATEGORIES[category];
  return { title: cat ? cat.label : "Browse" };
}

export default async function BrowsePage({ params }) {
  const { category } = await params;
  const cat = CATEGORIES[category];
  if (!cat) notFound();

  let movies = [];
  try { movies = await cat.fetch(); } catch { /* show empty grid */ }

  return (
    <>
      <TopBar title={cat.label} />
      <main className={styles.main}>
        <div className={styles.grid}>
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              id={movie.id}
              title={movie.title}
              year={movie.year}
              rating={movie.rating}
              genre={movie.genre}
              posterUrl={movie.posterUrl}
              size="md"
            />
          ))}
        </div>
      </main>
    </>
  );
}
