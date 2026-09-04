"use client";

import { useState, useRef, useCallback } from "react";
import SearchResults from "./SearchResults";
import styles from "../page.module.css";

/**
 * HomeSearchBar — the large search bar on the homepage.
 * Wired to /api/movies/search; shows inline dropdown results.
 */
export default function HomeSearchBar() {
  const [inputValue, setInputValue]         = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const wrapRef = useRef(null);

  const submit = useCallback(() => {
    const q = inputValue.trim();
    if (q) setSubmittedQuery(q);
  }, [inputValue]);

  const clear = useCallback(() => {
    setInputValue("");
    setSubmittedQuery("");
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); submit(); }
    if (e.key === "Escape") clear();
  };

  const showDropdown = submittedQuery.trim().length > 0;

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%", maxWidth: 640 }}>
      <div
        className={styles.searchBar}
        role="search"
        style={showDropdown ? { borderColor: "var(--border-active)" } : undefined}
      >
        <SearchIcon />
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search for a movie, director, or genre…"
          aria-label="Search movies"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            // Clear old results when user clears input
            if (!e.target.value.trim()) setSubmittedQuery("");
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
        />
        <button
          className={styles.searchBtn}
          aria-label="Submit search"
          onClick={submit}
        >
          Search
        </button>
      </div>

      {showDropdown && (
        <SearchResults
          query={submittedQuery}
          onClose={clear}
        />
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0, color: "var(--text-muted)" }}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
