import TopBar from "./components/TopBar";
import FeaturedMovie from "./components/FeaturedMovie";
import MovieRow from "./components/MovieRow";
import { getTrendingMovies, getPopularMovies, getTopRatedMovies } from "@/lib/tmdb";
import styles from "./page.module.css";

export default async function Home() {
  const [trending, popular, topRated] = await Promise.all([
    getTrendingMovies("day"),
    getPopularMovies(1),
    getTopRatedMovies(1),
  ]);

  // Check if all arrays are empty (likely API key not configured)
  const hasError = trending.length === 0 && popular.length === 0 && topRated.length === 0;

  // Use the top trending movie as the featured film
  const featured = trending[0] ?? null;

  return (
    <>
      <TopBar title="Discover" />
      <main className={styles.main}>
        {/* Error message if API key not configured */}
        {hasError && (
          <div className={styles.errorMessage}>
            TMDB API key is not configured. Please add TMDB_API_KEY to your .env.local file.
          </div>
        )}

        {/* Featured */}
        <FeaturedMovie movie={featured} />

        {/* Dense movie rows */}
        <div className={styles.rows}>
          <MovieRow
            title="Trending Now"
            movies={trending}
            seeAllHref="/browse/trending"
            skeletonCount={10}
          />
          <MovieRow
            title="Popular Movies"
            movies={popular}
            seeAllHref="/browse/popular"
            skeletonCount={10}
          />
          <MovieRow
            title="Top Rated"
            movies={topRated}
            cardSize="md"
            seeAllHref="/browse/top-rated"
            skeletonCount={10}
          />
        </div>

        {/* Compact genre grid */}
        <section className={styles.genreSection} aria-label="Browse by genre">
          <div className={styles.genreHeader}>
            <h2 className={styles.genreTitle}>Browse by Genre</h2>
          </div>
          <div className={styles.genreGrid}>
            {GENRES.map((g) => (
              <a key={g.id} href={`/browse/genre/${g.id}`} className={styles.genreChip}>
                {g.name}
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span className={styles.footerLogo}>
          <span className={styles.footerMark}>L</span>UMA
        </span>
        <span className={styles.footerCopy}>
          © {new Date().getFullYear()} LUMA · Data by{" "}
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
            TMDB
          </a>
        </span>
      </footer>
    </>
  );
}

const GENRES = [
  { id: 28,   name: "Action" },
  { id: 12,   name: "Adventure" },
  { id: 16,   name: "Animation" },
  { id: 35,   name: "Comedy" },
  { id: 80,   name: "Crime" },
  { id: 99,   name: "Documentary" },
  { id: 18,   name: "Drama" },
  { id: 14,   name: "Fantasy" },
  { id: 36,   name: "History" },
  { id: 27,   name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878,  name: "Sci-Fi" },
  { id: 53,   name: "Thriller" },
];
