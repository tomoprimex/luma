import { notFound } from "next/navigation";
import TopBar from "@/app/components/TopBar";
import BrowseGrid from "@/app/components/BrowseGrid";
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
        <BrowseGrid movies={movies} />
      </main>
    </>
  );
}
