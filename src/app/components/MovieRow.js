"use client";

import { useAuth } from "@/app/components/AuthProvider";
import MovieCard from "./MovieCard";
import SectionHeader from "./SectionHeader";
import styles from "./MovieRow.module.css";

export default function MovieRow({
  title,
  subtitle,
  movies = [],
  cardSize = "md",
  seeAllHref,
  skeletonCount = 8,
}) {
  const { isAuthenticated, isFavorite, addToFavorites, removeFromFavorites } = useAuth();
  const showSkeletons = movies.length === 0;
  const items = showSkeletons ? Array.from({ length: skeletonCount }) : movies;

  const handleFavoriteToggle = async (movieId) => {
    if (!isAuthenticated) return;
    if (isFavorite(movieId, "movie")) {
      await removeFromFavorites(movieId, "movie");
    } else {
      await addToFavorites(movieId, "movie");
    }
  };

  return (
    <section className={styles.section} aria-label={title}>
      <SectionHeader title={title} subtitle={subtitle} href={seeAllHref} />
      <div className={styles.track}>
        {items.map((movie, i) => {
          if (showSkeletons) {
            return <MovieCard key={i} size={cardSize} />;
          }
          const favorite = isAuthenticated && isFavorite(movie.id, "movie");
          return (
            <MovieCard
              key={movie.id ?? i}
              id={movie.id}
              title={movie.title}
              year={movie.year}
              rating={movie.rating}
              genre={movie.genre}
              posterUrl={movie.posterUrl}
              size={cardSize}
              onFavoriteToggle={isAuthenticated ? handleFavoriteToggle : undefined}
              isFavorite={favorite}
            />
          );
        })}
      </div>
    </section>
  );
}
