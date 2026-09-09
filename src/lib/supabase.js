// LUMA — Supabase client + all data access functions
// Client-side only — uses anon key with Row Level Security
// Never import SUPABASE_SERVICE_ROLE_KEY here

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── Auth ───────────────────────────────────────────────────────────────────

/** Returns the currently authenticated user (verified server-side) */
export async function getAuthUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/** Subscribe to auth state changes. Returns the Supabase subscription object. */
export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session ? session.user : null, session);
  });
}

export async function signUpWithEmail(email, password, displayName) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const err = new Error("Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    logAuthError("signup config", err);
    return { user: null, error: "Authentication is not configured. Please contact support." };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: displayName || "" },
    },
  });
  if (error) {
    logAuthError("signup failed", error);
    return { user: null, error: friendlyAuthError(error) };
  }
  return { user: data.user, error: null };
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    logAuthError("signin failed", error);
    return { user: null, error: friendlyAuthError(error) };
  }
  return { user: data.user, error: null };
}

export async function signInWithGoogle() {
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : `${process.env.NEXT_PUBLIC_SITE_URL || ""}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) {
    logAuthError("google signin failed", error);
    return { error: friendlyAuthError(error) };
  }
  return { url: data?.url, error: null };
}

export async function logOut() {
  const { error } = await supabase.auth.signOut();
  return { error: error ? error.message : null };
}

export async function resetPasswordForEmail(email) {
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/reset-password`
      : `${process.env.NEXT_PUBLIC_SITE_URL || ""}/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) {
    logAuthError("reset password failed", error);
    return { error: friendlyAuthError(error) };
  }
  return { error: null };
}

export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    logAuthError("update password failed", error);
    return { error: friendlyAuthError(error) };
  }
  return { error: null };
}

function friendlyAuthError(error) {
  const msg = error?.message || "";
  if (msg.includes("Invalid login credentials")) return "Invalid email or password.";
  if (msg.includes("User already registered") || msg.includes("already been registered")) return "An account with this email already exists.";
  if (msg.includes("Password should be at least 6")) return "Password must be at least 6 characters.";
  if (msg.includes("Unable to validate email")) return "Please enter a valid email address.";
  if (msg.includes("Email not confirmed")) return "Please confirm your email before signing in.";
  if (msg.includes("For security purposes") || msg.includes("rate limit")) return "Too many attempts. Please wait a moment and try again.";
  if (msg.includes("Network") || msg.includes("fetch failed")) return "Network error. Please check your connection.";
  if (msg.includes("500") || msg.includes("Internal Server Error")) return "We couldn't create your account. Please try again in a moment.";
  if (msg.includes("Database error")) return "We couldn't create your account. Please try again.";
  return msg || "An unexpected error occurred. Please try again.";
}

// Log raw auth errors in development for debugging
export function logAuthError(context, error) {
  if (process.env.NODE_ENV !== "production") {
    console.error(`[LUMA Auth] ${context}:`, error);
  }
}

// ─── Profile ────────────────────────────────────────────────────────────────

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function updateProfile(userId, updates) {
  const { error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId);
  return { error: error ? error.message : null };
}

// ─── User Settings ──────────────────────────────────────────────────────────

export async function getUserSettings(userId) {
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function ensureProfile(userId, displayName) {
  const existing = await getProfile(userId);
  if (existing) return existing;
  const { error } = await supabase.from("profiles").insert([{
    id: userId,
    display_name: displayName || null,
    username: null,
    avatar_url: null,
    bio: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }]);
  if (error) { console.error("ensureProfile:", error); return null; }
  return getProfile(userId);
}

export async function ensureUserSettings(userId) {
  const existing = await getUserSettings(userId);
  if (existing) return existing;
  const { error } = await supabase.from("user_settings").insert([{
    user_id: userId,
    theme: "dark",
    autoplay: true,
    autoplay_next: true,
    video_quality: "auto",
    data_saver: false,
    subtitles_enabled: true,
    subtitle_language: "en",
    audio_language: "en",
    notifications_enabled: true,
    email_notifications: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }]);
  if (error) { console.error("ensureUserSettings:", error); return null; }
  return getUserSettings(userId);
}

export async function updateUserSettings(userId, updates) {
  const { error } = await supabase
    .from("user_settings")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  return { error: error ? error.message : null };
}

// ─── Watchlist ───────────────────────────────────────────────────────────────
// Uses existing "watchlists" table — DO NOT rename or drop this table

export async function getWatchlist(userId) {
  const { data, error } = await supabase
    .from("watchlists")
    .select("*")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });
  if (error) { console.error("getWatchlist:", error); return []; }
  return data.map((item) => ({
    id: item.tmdb_id ?? item.movie_id,
    tmdb_id: item.tmdb_id ?? item.movie_id,
    title: item.title,
    year: item.year,
    rating: item.rating,
    posterUrl: item.poster_url,
    media_type: item.media_type || "movie",
    addedAt: item.added_at,
  }));
}

export async function addToWatchlist(userId, movie) {
  const { error } = await supabase.from("watchlists").insert([{
    user_id: userId,
    tmdb_id: movie.id || movie.tmdb_id,
    title: movie.title,
    year: movie.year,
    rating: movie.rating,
    poster_url: movie.posterUrl,
    media_type: movie.media_type || "movie",
    added_at: new Date().toISOString(),
  }]);
  if (error) { console.error("addToWatchlist:", error); return { error: error.message }; }
  return { error: null };
}

export async function removeFromWatchlist(userId, tmdbId) {
  const { error } = await supabase
    .from("watchlists")
    .delete()
    .eq("user_id", userId)
    .eq("tmdb_id", tmdbId);
  if (error) { console.error("removeFromWatchlist:", error); return { error: error.message }; }
  return { error: null };
}

export async function isInWatchlist(userId, tmdbId) {
  const { data, error } = await supabase
    .from("watchlists")
    .select("tmdb_id")
    .eq("user_id", userId)
    .eq("tmdb_id", tmdbId)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

// ─── Favorites ───────────────────────────────────────────────────────────────

export async function getFavorites(userId) {
  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) { console.error("getFavorites:", error); return []; }
  return data;
}

export async function addFavorite(userId, tmdbId, mediaType = "movie") {
  const { error } = await supabase.from("favorites").insert([{
    user_id: userId,
    tmdb_id: tmdbId,
    media_type: mediaType,
  }]);
  if (error) { console.error("addFavorite:", error); return { error: error.message }; }
  return { error: null };
}

export async function removeFavorite(userId, tmdbId, mediaType = "movie") {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType);
  if (error) { console.error("removeFavorite:", error); return { error: error.message }; }
  return { error: null };
}

export async function isFavorite(userId, tmdbId, mediaType = "movie") {
  const { data, error } = await supabase
    .from("favorites")
    .select("tmdb_id")
    .eq("user_id", userId)
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

// ─── Recently Viewed ────────────────────────────────────────────────────────

export async function addRecentlyViewed(userId, item) {
  // Upsert on (user_id, tmdb_id, media_type) to avoid duplicates
  const { error } = await supabase.from("recently_viewed").upsert([{
    user_id: userId,
    tmdb_id: item.tmdb_id,
    media_type: item.media_type || "movie",
    movie_title: item.movie_title || item.title,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    viewed_at: new Date().toISOString(),
  }], { onConflict: "user_id,tmdb_id,media_type" });
  if (error) console.error("addRecentlyViewed:", error);
}

export async function getRecentlyViewed(userId, limit = 20) {
  const { data, error } = await supabase
    .from("recently_viewed")
    .select("*")
    .eq("user_id", userId)
    .order("viewed_at", { ascending: false })
    .limit(limit);
  if (error) { console.error("getRecentlyViewed:", error); return []; }
  return data;
}

// ─── Movie Ratings ──────────────────────────────────────────────────────────

export async function getMovieRating(userId, tmdbId, mediaType = "movie") {
  const { data, error } = await supabase
    .from("movie_ratings")
    .select("*")
    .eq("user_id", userId)
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function upsertMovieRating(userId, tmdbId, mediaType, rating, review = "") {
  const { error } = await supabase.from("movie_ratings").upsert([{
    user_id: userId,
    tmdb_id: tmdbId,
    media_type: mediaType,
    rating,
    review,
    updated_at: new Date().toISOString(),
  }], { onConflict: "user_id,tmdb_id,media_type" });
  if (error) { console.error("upsertMovieRating:", error); return { error: error.message }; }
  return { error: null };
}

export async function deleteMovieRating(userId, tmdbId, mediaType = "movie") {
  const { error } = await supabase
    .from("movie_ratings")
    .delete()
    .eq("user_id", userId)
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType);
  if (error) { console.error("deleteMovieRating:", error); return { error: error.message }; }
  return { error: null };
}

export async function getMovieRatingSummary(tmdbId, mediaType = "movie") {
  const { data, error } = await supabase
    .from("movie_rating_summary")
    .select("*")
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType)
    .maybeSingle();
  if (error) return null;
  return data;
}

// ─── LUMA Site Ratings ───────────────────────────────────────────────────────

export async function getLumaSiteRating(userId) {
  const { data, error } = await supabase
    .from("luma_site_ratings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function upsertLumaSiteRating(userId, ratings) {
  const { error } = await supabase.from("luma_site_ratings").upsert([{
    user_id: userId,
    ...ratings,
    updated_at: new Date().toISOString(),
  }], { onConflict: "user_id" });
  if (error) { console.error("upsertLumaSiteRating:", error); return { error: error.message }; }
  return { error: null };
}

export async function getLumaSiteRatingSummary() {
  const { data, error } = await supabase
    .from("luma_site_rating_summary")
    .select("*")
    .maybeSingle();
  if (error) return null;
  return data;
}