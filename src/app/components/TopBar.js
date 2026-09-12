"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { logOut } from "@/lib/supabase";
import SearchResults from "./SearchResults";
import styles from "./TopBar.module.css";

const PATH_TITLE_MAP = {
  "/": "Discover",
  "/browse/popular": "Movies",
  "/browse/trending": "Trending",
  "/browse/top-rated": "Top Rated",
  "/watchlist": "Watchlist",
  "/recently-viewed": "Recently Viewed",
  "/profile": "Profile",
  "/settings": "Settings",
  "/signin": "Sign In",
  "/forgot-password": "Forgot Password",
  "/reset-password": "Reset Password",
  "/rate-luma": "Rate LUMA",
};

const HIDDEN_ROUTES = new Set([
  "/signin",
  "/forgot-password",
  "/reset-password",
  "/profile",
  "/settings",
  "/rate-luma",
]);

function getTitle(pathname) {
  if (pathname.startsWith("/movie/")) return "Movies";
  if (pathname.startsWith("/browse/genre/")) return "Genre";
  return PATH_TITLE_MAP[pathname] || "LUMA";
}

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAuthenticated } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const wrapRef = useRef(null);
  const accountRef = useRef(null);

  const submit = useCallback(() => {
    const q = inputValue.trim();
    if (q) {
      setSubmittedQuery(q);
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  }, [inputValue, router]);

  const clear = useCallback(() => {
    setInputValue("");
    setSubmittedQuery("");
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); submit(); }
    if (e.key === "Escape") { clear(); setAccountOpen(false); }
  };

  const showDropdown = submittedQuery.trim().length > 0 && !pathname.startsWith("/search");

  useEffect(() => {
    function handleClickOutside(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setAccountOpen(false);
  }, [pathname]);

  const displayName =
    profile?.display_name ||
    profile?.username ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Account";

  const avatarInitial = (displayName || "U").charAt(0).toUpperCase();
  const avatarUrl = profile?.avatar_url || null;

  const handleSignOut = async () => {
    setAccountOpen(false);
    await logOut();
  };

  if (HIDDEN_ROUTES.has(pathname)) return null;

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <h1 className={styles.pageTitle}>{getTitle(pathname)}</h1>
      </div>

      <div className={styles.searchArea} ref={wrapRef}>
        <div className={`${styles.searchBar} ${showDropdown ? styles.searchBarActive : ""}`}>
          <SearchIcon />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search movies & TV…"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (!e.target.value.trim()) setSubmittedQuery("");
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            aria-label="Search movies and TV shows"
          />
          {inputValue && (
            <button className={styles.clearBtn} onClick={clear} aria-label="Clear search">
              <ClearIcon />
            </button>
          )}
        </div>

        {showDropdown && (
          <SearchResults query={submittedQuery} onClose={clear} />
        )}
      </div>

      <div className={styles.right}>
        {isAuthenticated ? (
          <div className={styles.accountSection} ref={accountRef}>
            <button
              className={styles.accountBtn}
              onClick={() => setAccountOpen((o) => !o)}
              aria-expanded={accountOpen}
              aria-label="Account menu"
            >
              <div className={styles.accountAvatar}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className={styles.accountAvatarImg} />
                ) : (
                  <span className={styles.accountAvatarInitial}>{avatarInitial}</span>
                )}
              </div>
              <span className={styles.accountName}>{displayName}</span>
              <ChevronIcon open={accountOpen} />
            </button>

            {accountOpen && (
              <div className={styles.accountDropdown}>
                <Link href="/profile" className={styles.accountDropdownItem} onClick={() => setAccountOpen(false)}>
                  <UserIcon /> Profile
                </Link>
                <Link href="/settings" className={styles.accountDropdownItem} onClick={() => setAccountOpen(false)}>
                  <SettingsIcon /> Settings
                </Link>
                <div className={styles.accountDropdownDivider} />
                <button className={styles.accountDropdownItem} onClick={handleSignOut}>
                  <SignOutIcon /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/signin" className={styles.signInBtn}>
            <UserIcon />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" suppressHydrationWarning>
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" suppressHydrationWarning>
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" suppressHydrationWarning>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" suppressHydrationWarning>
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 .6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0 1.51 1z"/>
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" suppressHydrationWarning>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" suppressHydrationWarning>
      <polyline points={open ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
    </svg>
  );
}
