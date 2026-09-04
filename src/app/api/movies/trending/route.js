import { getTrendingMovies } from "@/lib/tmdb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeWindow = searchParams.get("timeWindow") || "day";
    
    const movies = await getTrendingMovies(timeWindow);
    
    return Response.json({ movies });
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    
    if (error.message.includes("TMDB_API_KEY is not configured")) {
      return Response.json(
        { error: "TMDB API key is not configured", movies: [] },
        { status: 500 }
      );
    }
    
    return Response.json(
      { error: "Failed to fetch trending movies", movies: [] },
      { status: 500 }
    );
  }
}
