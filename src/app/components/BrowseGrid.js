"use client";

import { useAuth } from "@/app/components/AuthProvider";
import MovieCard from "@/app/components/MovieCard";
import styles from "./BrowseGrid.module.css";

export default function BrowseGrid({ movies = [] }) {
  const { isAuthenticated, isFavorite, addToFavorites, removeFromFavorites } = useAuth();

  const handleFavoriteToggle = async (movieId) => {
    if (!isAuthenticated) return;
    if (isFavorite(movieId, "movie")) {
      await removeFromFavorites(movieId, "movie");
    } else {
      await addToFavorites(movieId, "movie");
    }
  };

  return (
    <div className={styles.grid}>
      {movies.map((movie) => {
        const favorite = isAuthenticated && isFavorite(movie.id, "movie");
        return (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            year={movie.year}
            rating={movie.rating}
            genre={movie.genre}
            posterUrl={movie.posterUrl}
            size="md"
            layout="list"
            onFavoriteToggle={isAuthenticated ? handleFavoriteToggle : undefined}
            isFavorite={favorite}
          />
        );
      })}
    </div>
  );
}
