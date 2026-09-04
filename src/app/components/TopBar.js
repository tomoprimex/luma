"use client";

import { useState, useRef, useCallback } from "react";
import SearchResults from "./SearchResults";
import styles from "./TopBar.module.css";

export default function TopBar({ title }) {
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
    <header className={styles.topbar}>
      {title && <h1 className={styles.pageTitle}>{title}</h1>}

      <div className={styles.searchArea} ref={wrapRef}>
        <div className={`${styles.searchBar} ${showDropdown ? styles.searchBarActive : ""}`}>
          <SearchIcon />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search movies…"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (!e.target.value.trim()) setSubmittedQuery("");
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            aria-label="Search movies"
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
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function ClearIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}
