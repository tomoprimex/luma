"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  supabase,
  onAuthChange,
  getProfile,
  getUserSettings,
  ensureProfile,
  ensureUserSettings,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getFavorites,
  addFavorite,
  removeFavorite,
  addRecentlyViewed,
  getRecentlyViewed,
} from "@/lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async (supabaseUser) => {
    if (!supabaseUser) {
      setProfile(null);
      setSettings(null);
      setWatchlist([]);
      setFavorites([]);
      setRecentlyViewed([]);
      return;
    }

    // Load all user data in parallel with a small retry for profile/settings
    // because the database trigger may need a moment after signup.
    const loadWithRetry = async (fn, retries = 2, delay = 400) => {
      for (let i = 0; i <= retries; i++) {
        const result = await fn();
        if (result) return result;
        if (i < retries) await new Promise((r) => setTimeout(r, delay));
      }
      return null;
    };

    const [profileData, settingsData, watchlistData, favoritesData, recentData] =
      await Promise.all([
        loadWithRetry(() => getProfile(supabaseUser.id)),
        loadWithRetry(() => getUserSettings(supabaseUser.id)),
        getWatchlist(supabaseUser.id),
        getFavorites(supabaseUser.id),
        getRecentlyViewed(supabaseUser.id),
      ]);

    setProfile(profileData);
    setSettings(settingsData);
    setWatchlist(watchlistData);
    setFavorites(favoritesData);
    setRecentlyViewed(recentData);
  }, []);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      loadUserData(s?.user ?? null).finally(() => setLoading(false));
    });

    // Listen for auth state changes
    const { data: { subscription } } = onAuthChange(async (authUser, authSession) => {
      setUser(authUser);
      setSession(authSession);
      await loadUserData(authUser);
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, [loadUserData]);

  // Watchlist helpers
  const addMovieToWatchlist = useCallback(async (movie) => {
    if (!user) return { error: "Sign in to add to your watchlist." };
    const result = await addToWatchlist(user.id, movie);
    if (!result.error) {
      setWatchlist((prev) => [
        { ...movie, tmdb_id: movie.id || movie.tmdb_id, addedAt: new Date().toISOString() },
        ...prev,
      ]);
    }
    return result;
  }, [user]);

  const removeMovieFromWatchlist = useCallback(async (tmdbId) => {
    if (!user) return { error: "Not authenticated." };
    const result = await removeFromWatchlist(user.id, tmdbId);
    if (!result.error) {
      setWatchlist((prev) => prev.filter((m) => (m.tmdb_id || m.id) !== tmdbId));
    }
    return result;
  }, [user]);

  const isInWatchlistLocal = useCallback((tmdbId) => {
    return watchlist.some((m) => (m.tmdb_id || m.id) === tmdbId);
  }, [watchlist]);

  // Favorites helpers
  const addMovieToFavorites = useCallback(async (tmdbId, mediaType = "movie") => {
    if (!user) return { error: "Sign in to add favorites." };
    const result = await addFavorite(user.id, tmdbId, mediaType);
    if (!result.error) {
      setFavorites((prev) => [
        { user_id: user.id, tmdb_id: tmdbId, media_type: mediaType, created_at: new Date().toISOString() },
        ...prev,
      ]);
    }
    return result;
  }, [user]);

  const removeMovieFromFavorites = useCallback(async (tmdbId, mediaType = "movie") => {
    if (!user) return { error: "Not authenticated." };
    const result = await removeFavorite(user.id, tmdbId, mediaType);
    if (!result.error) {
      setFavorites((prev) => prev.filter((f) => !(f.tmdb_id === tmdbId && f.media_type === mediaType)));
    }
    return result;
  }, [user]);

  const isFavoriteLocal = useCallback((tmdbId, mediaType = "movie") => {
    return favorites.some((f) => f.tmdb_id === tmdbId && f.media_type === mediaType);
  }, [favorites]);

  // Recently viewed
  const recordRecentlyViewed = useCallback(async (item) => {
    if (!user) return;
    await addRecentlyViewed(user.id, item);
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((r) => !(r.tmdb_id === item.tmdb_id && r.media_type === (item.media_type || "movie")));
      return [{ ...item, viewed_at: new Date().toISOString() }, ...filtered].slice(0, 20);
    });
  }, [user]);

  const value = {
    // Auth state
    user,
    session,
    profile,
    settings,
    loading,
    isAuthenticated: !!user,

    // Watchlist
    watchlist,
    addToWatchlist: addMovieToWatchlist,
    removeFromWatchlist: removeMovieFromWatchlist,
    isInWatchlist: isInWatchlistLocal,

    // Favorites
    favorites,
    addToFavorites: addMovieToFavorites,
    removeFromFavorites: removeMovieFromFavorites,
    isFavorite: isFavoriteLocal,

    // Recently viewed
    recentlyViewed,
    recordRecentlyViewed,

    // Allow components to refresh profile/settings after updates
    refreshProfile: () => user && getProfile(user.id).then(setProfile),
    refreshSettings: () => user && getUserSettings(user.id).then(setSettings),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}