/**
 * TMDB API Utility
 * Server-side utility for fetching data from The Movie Database (TMDB) API.
 * This keeps API keys secure on the server and never exposes them to the client.
 */

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

/**
 * Fetch data from TMDB API with proper error handling
 */
async function fetchFromTMDB(endpoint, params = {}) {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    throw new Error("TMDB_API_KEY is not configured");
  }

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append("api_key", apiKey);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `TMDB API error: ${response.status} ${response.statusText} - ${errorData.status_message || "Unknown error"}`
    );
  }

  return response.json();
}

/**
 * Transform TMDB movie data to our app's format (list view)
 */
function transformMovie(movie) {
  return {
    id: movie.id,
    title: movie.title || movie.name,
    year: movie.release_date
      ? new Date(movie.release_date).getFullYear()
      : movie.first_air_date
      ? new Date(movie.first_air_date).getFullYear()
      : null,
    rating: movie.vote_average ? movie.vote_average.toFixed(1) : null,
    genre: movie.genre_ids?.[0] ? getGenreName(movie.genre_ids[0]) : null,
    posterUrl: movie.poster_path
      ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`
      : null,
    backdropUrl: movie.backdrop_path
      ? `${TMDB_IMAGE_BASE_URL}/w1280${movie.backdrop_path}`
      : null,
    overview: movie.overview || null,
  };
}

/**
 * Transform a full TMDB movie detail response (richer shape)
 */
function transformMovieDetail(movie) {
  return {
    id: movie.id,
    title: movie.title,
    tagline: movie.tagline || null,
    overview: movie.overview || null,
    releaseDate: movie.release_date || null,
    year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
    runtime: movie.runtime || null,
    rating: movie.vote_average ? movie.vote_average.toFixed(1) : null,
    voteCount: movie.vote_count || 0,
    genres: (movie.genres || []).map((g) => g.name),
    originalLanguage: movie.original_language || null,
    originalTitle: movie.original_title || null,
    status: movie.status || null,
    budget: movie.budget || null,
    revenue: movie.revenue || null,
    posterUrl: movie.poster_path
      ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`
      : null,
    posterUrlLarge: movie.poster_path
      ? `${TMDB_IMAGE_BASE_URL}/w780${movie.poster_path}`
      : null,
    backdropUrl: movie.backdrop_path
      ? `${TMDB_IMAGE_BASE_URL}/w1280${movie.backdrop_path}`
      : null,
    backdropUrlFull: movie.backdrop_path
      ? `${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path}`
      : null,
    homepage: movie.homepage || null,
    imdbId: movie.imdb_id || null,
    productionCountries: (movie.production_countries || []).map((c) => c.name),
    spokenLanguages: (movie.spoken_languages || []).map((l) => l.english_name),
  };
}

/**
 * Map TMDB genre IDs to names (subset of common genres)
 */
function getGenreName(genreId) {
  const genreMap = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Sci-Fi",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
  };
  return genreMap[genreId] || null;
}

// ── Public API ────────────────────────────────────────────────

/**
 * Fetch trending movies
 */
export async function getTrendingMovies(timeWindow = "day") {
  const data = await fetchFromTMDB(`/trending/movie/${timeWindow}`);
  return data.results.map(transformMovie);
}

/**
 * Fetch popular movies
 */
export async function getPopularMovies(page = 1) {
  const data = await fetchFromTMDB("/movie/popular", { page });
  return data.results.map(transformMovie);
}

/**
 * Fetch top rated movies
 */
export async function getTopRatedMovies(page = 1) {
  const data = await fetchFromTMDB("/movie/top_rated", { page });
  return data.results.map(transformMovie);
}

/**
 * Fetch full movie details by ID (rich shape for detail page)
 */
export async function getMovieDetails(movieId) {
  const data = await fetchFromTMDB(`/movie/${movieId}`);
  return transformMovieDetail(data);
}

/**
 * Fetch movie cast & crew
 * Returns the top cast members (ordered by TMDB cast order)
 */
export async function getMovieCredits(movieId) {
  const data = await fetchFromTMDB(`/movie/${movieId}/credits`);
  const cast = (data.cast || []).slice(0, 10).map((person) => ({
    id: person.id,
    name: person.name,
    character: person.character || null,
    profileUrl: person.profile_path
      ? `${TMDB_IMAGE_BASE_URL}/w185${person.profile_path}`
      : null,
    order: person.order,
  }));
  const director = (data.crew || []).find((c) => c.job === "Director") || null;
  return {
    cast,
    director: director
      ? {
          id: director.id,
          name: director.name,
          profileUrl: director.profile_path
            ? `${TMDB_IMAGE_BASE_URL}/w185${director.profile_path}`
            : null,
        }
      : null,
  };
}

/**
 * Fetch movie videos (trailers, teasers, clips)
 * Returns the best YouTube trailer key if one exists, otherwise null.
 */
export async function getMovieVideos(movieId) {
  const data = await fetchFromTMDB(`/movie/${movieId}/videos`);
  const videos = data.results || [];

  // Prefer official trailer, then any trailer, then teaser
  const trailer =
    videos.find(
      (v) => v.site === "YouTube" && v.type === "Trailer" && v.official
    ) ||
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
    videos.find((v) => v.site === "YouTube" && v.type === "Teaser") ||
    null;

  return trailer ? trailer.key : null;
}

/**
 * Fetch similar movies
 */
export async function getSimilarMovies(movieId) {
  const data = await fetchFromTMDB(`/movie/${movieId}/similar`);
  return (data.results || []).slice(0, 12).map(transformMovie);
}

/**
 * Search movies by query.
 * Returns movies + pagination metadata so the client can load more pages.
 */
export async function searchMovies(query, page = 1) {
  const data = await fetchFromTMDB("/search/movie", { query, page });
  return {
    movies: data.results.map(transformMovie),
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results,
  };
}

/**
 * Fetch watch providers for a movie (powered by JustWatch via TMDB).
 * Returns streaming, rent, and buy options for a given region (default: GB).
 * Each provider includes name, logo URL, and the official TMDB provider link.
 */
export async function getMovieWatchProviders(movieId, region = "GB") {
  const data = await fetchFromTMDB(`/movie/${movieId}/watch/providers`);
  const results = data.results || {};

  // Try requested region first, fall back to US
  const regionData = results[region] || results["US"] || null;

  if (!regionData) return null;

  const mapProviders = (list = []) =>
    list.map((p) => ({
      id: p.provider_id,
      name: p.provider_name,
      logoUrl: p.logo_path
        ? `${TMDB_IMAGE_BASE_URL}/w92${p.logo_path}`
        : null,
    }));

  return {
    link: regionData.link || null, // Official TMDB/JustWatch link for this movie+region
    streaming: mapProviders(regionData.flatrate),
    rent: mapProviders(regionData.rent),
    buy: mapProviders(regionData.buy),
    region: Object.keys(results).includes(region) ? region : "US",
  };
}
