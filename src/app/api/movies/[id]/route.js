import { getMovieDetails } from "@/lib/tmdb";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const movieId = parseInt(id);

    if (!movieId || isNaN(movieId)) {
      return Response.json(
        { error: "Invalid movie ID" },
        { status: 400 }
      );
    }

    const movie = await getMovieDetails(movieId);

    return Response.json({ movie });
  } catch (error) {
    console.error("Error fetching movie details:", error);

    if (error.message.includes("TMDB_API_KEY is not configured")) {
      return Response.json(
        { error: "TMDB API key is not configured" },
        { status: 500 }
      );
    }

    if (error.message.includes("404")) {
      return Response.json(
        { error: "Movie not found" },
        { status: 404 }
      );
    }

    return Response.json(
      { error: "Failed to fetch movie details" },
      { status: 500 }
    );
  }
}
