import { searchMovies, searchTV, searchMulti } from "@/lib/tmdb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || searchParams.get("query") || "";
    const page = parseInt(searchParams.get("page")) || 1;
    const type = searchParams.get("type") || "movie";

    if (!query.trim()) {
      return Response.json(
        { error: "Search query is required", results: [], page: 1, total_pages: 0, total_results: 0 },
        { status: 400 }
      );
    }

    let result;
    if (type === "tv") {
      result = await searchTV(query.trim(), page);
    } else if (type === "multi") {
      result = await searchMulti(query.trim(), page);
    } else {
      result = await searchMovies(query.trim(), page);
    }

    return Response.json({
      results: result.results,
      query,
      page: result.page,
      total_pages: result.total_pages,
      total_results: result.total_results,
    });
  } catch (error) {
    console.error("Error searching:", error);

    if (error.message.includes("TMDB_API_KEY is not configured")) {
      return Response.json(
        { error: "TMDB API key is not configured", results: [], page: 1, total_pages: 0, total_results: 0 },
        { status: 500 }
      );
    }

    return Response.json(
      { error: "Failed to search", results: [], page: 1, total_pages: 0, total_results: 0 },
      { status: 500 }
    );
  }
}
