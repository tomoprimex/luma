"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SearchResults from "./SearchResults";
import styles from "./Navbar.module.css";

const navLinks = [
  { label: "Discover", href: "#" },
  { label: "Trending", href: "#trending" },
  { label: "Top Rated", href: "#top-rated" },
  { label: "Genres", href: "#" },
];

export default function Navbar() {
  const [scrolled, setScrolled]       = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [inputValue, setInputValue]   = useState("");  // live typing value
  const [submittedQuery, setSubmittedQuery] = useState(""); // triggers fetch
  const searchWrapRef = useRef(null);

  /* ── Scroll effect ──────────────────────────────────────── */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Close menu on resize ───────────────────────────────── */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ── Close dropdown when clicking outside ───────────────── */
  useEffect(() => {
    const handleClick = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSubmittedQuery("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ── Submit search ──────────────────────────────────────── */
  const submitSearch = useCallback(() => {
    const q = inputValue.trim();
    if (q) setSubmittedQuery(q);
  }, [inputValue]);

  /* ── Close search completely ────────────────────────────── */
  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setInputValue("");
    setSubmittedQuery("");
  }, []);

  /* ── Key handler for input ──────────────────────────────── */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitSearch();
    }
    if (e.key === "Escape") {
      closeSearch();
    }
  };

  const showDropdown = searchOpen && submittedQuery.trim().length > 0;

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`} role="banner">
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <a href="/" className={styles.logo} aria-label="LUMA home">
          <span className={styles.logoMark}>L</span>
          <span className={styles.logoText}>UMA</span>
        </a>

        {/* Desktop nav links */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className={styles.navLink}>
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right actions */}
        <div className={styles.actions}>
          {/* Search */}
          <div
            ref={searchWrapRef}
            className={`${styles.searchWrapper} ${searchOpen ? styles.searchActive : ""}`}
            style={{ position: "relative" }}
          >
            {searchOpen && (
              <input
                className={styles.searchInput}
                type="search"
                placeholder="Search movies…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                aria-label="Search movies"
                aria-expanded={showDropdown}
                aria-haspopup="listbox"
                autoComplete="off"
              />
            )}
            <button
              className={styles.iconBtn}
              onClick={() => {
                if (searchOpen && inputValue.trim()) {
                  // Second click on icon while typing = submit
                  submitSearch();
                } else if (searchOpen) {
                  closeSearch();
                } else {
                  setSearchOpen(true);
                  setInputValue("");
                  setSubmittedQuery("");
                }
              }}
              aria-label={searchOpen ? "Submit search" : "Open search"}
            >
              {searchOpen ? <SearchIcon /> : <SearchIcon />}
            </button>

            {/* Results dropdown */}
            {showDropdown && (
              <SearchResults
                query={submittedQuery}
                onClose={closeSearch}
              />
            )}
          </div>

          {/* Sign in */}
          <button className={styles.signInBtn}>Sign In</button>

          {/* Mobile hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ""}`} />
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ""}`} />
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen3 : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <nav className={styles.mobileMenu} aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <button className={`${styles.signInBtn} ${styles.mobileSignIn}`}>Sign In</button>
        </nav>
      )}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
