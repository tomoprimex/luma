import { searchMovies } from "@/lib/tmdb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || searchParams.get("query") || "";
    const page = parseInt(searchParams.get("page")) || 1;

    if (!query.trim()) {
      return Response.json(
        { error: "Search query is required", movies: [], page: 1, total_pages: 0, total_results: 0 },
        { status: 400 }
      );
    }

    const result = await searchMovies(query.trim(), page);

    return Response.json({
      movies: result.movies,
      query,
      page: result.page,
      total_pages: result.total_pages,
      total_results: result.total_results,
    });
  } catch (error) {
    console.error("Error searching movies:", error);

    if (error.message.includes("TMDB_API_KEY is not configured")) {
      return Response.json(
        { error: "TMDB API key is not configured", movies: [], page: 1, total_pages: 0, total_results: 0 },
        { status: 500 }
      );
    }

    return Response.json(
      { error: "Failed to search movies", movies: [], page: 1, total_pages: 0, total_results: 0 },
      { status: 500 }
    );
  }
}
