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
  const showSkeletons = movies.length === 0;
  const items = showSkeletons ? Array.from({ length: skeletonCount }) : movies;

  return (
    <section className={styles.section} aria-label={title}>
      <SectionHeader title={title} subtitle={subtitle} href={seeAllHref} />
      <div className={styles.track}>
        {items.map((movie, i) =>
          showSkeletons ? (
            <MovieCard key={i} size={cardSize} />
          ) : (
            <MovieCard
              key={movie.id ?? i}
              id={movie.id}
              title={movie.title}
              year={movie.year}
              rating={movie.rating}
              genre={movie.genre}
              posterUrl={movie.posterUrl}
              size={cardSize}
            />
          )
        )}
      </div>
    </section>
  );
}
