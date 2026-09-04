import { getPopularMovies } from "@/lib/tmdb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    
    const movies = await getPopularMovies(page);
    
    return Response.json({ movies });
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    
    if (error.message.includes("TMDB_API_KEY is not configured")) {
      return Response.json(
        { error: "TMDB API key is not configured", movies: [] },
        { status: 500 }
      );
    }
    
    return Response.json(
      { error: "Failed to fetch popular movies", movies: [] },
      { status: 500 }
    );
  }
}
