"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SearchResults from "./SearchResults";
import { useAuth } from "@/app/components/AuthProvider";
import AuthModal from "./AuthModal";
import styles from "./Navbar.module.css";

const navLinks = [
  { label: "Discover", href: "#" },
  { label: "Trending", href: "#trending" },
  { label: "Top Rated", href: "#top-rated" },
  { label: "Genres", href: "#" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("signin");
  const [accountOpen, setAccountOpen] = useState(false);
  const searchWrapRef = useRef(null);
  const accountRef = useRef(null);

  const { user, profile, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
        setAccountOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSubmittedQuery("");
      }
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const submitSearch = useCallback(() => {
    const q = inputValue.trim();
    if (q) setSubmittedQuery(q);
  }, [inputValue]);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setInputValue("");
    setSubmittedQuery("");
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitSearch();
    }
    if (e.key === "Escape") {
      closeSearch();
      setAccountOpen(false);
    }
  };

  const showDropdown = searchOpen && submittedQuery.trim().length > 0;

  const displayName =
    profile?.display_name ||
    profile?.username ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Account";

  const avatarInitial = (displayName || "U").charAt(0).toUpperCase();

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`} role="banner">
      <div className={`container ${styles.inner}`}>
        <a href="/" className={styles.logo} aria-label="LUMA home">
          <span className={styles.logoMark}>L</span>
          <span className={styles.logoText}>UMA</span>
        </a>

        <nav className={styles.desktopNav} aria-label="Main navigation">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className={styles.navLink}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
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
              <SearchIcon />
            </button>

            {showDropdown && (
              <SearchResults
                query={submittedQuery}
                onClose={closeSearch}
              />
            )}
          </div>

          {isAuthenticated ? (
            <div className={styles.accountWrap} ref={accountRef}>
              <button
                className={styles.accountBtn}
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
                aria-label="Account menu"
              >
                <span className={styles.accountAvatar}>{avatarInitial}</span>
                <span className={styles.accountName}>{displayName}</span>
                <ChevronIcon open={accountOpen} />
              </button>

              {accountOpen && (
                <div className={styles.accountDropdown}>
                  <Link href="/profile" className={styles.accountLink} onClick={() => setAccountOpen(false)}>
                    <UserIcon /> Profile
                  </Link>
                  <Link href="/settings" className={styles.accountLink} onClick={() => setAccountOpen(false)}>
                    <SettingsIcon /> Settings
                  </Link>
                  <div className={styles.accountDivider} />
                  <button
                    className={styles.accountLink}
                    onClick={() => {
                      setAccountOpen(false);
                    }}
                  >
                    <SignOutIcon /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className={styles.signInBtn}
              onClick={() => {
                setAuthModalTab("signin");
                setShowAuthModal(true);
              }}
            >
              Sign In
            </button>
          )}

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

      {menuOpen && (
        <nav className={`${styles.mobileMenu} ${styles.mobileMenuOpen}`} aria-label="Mobile navigation">
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
          {isAuthenticated ? (
            <>
              <Link href="/profile" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Profile</Link>
              <Link href="/settings" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Settings</Link>
              <button className={styles.mobileSignOut} onClick={() => setMenuOpen(false)}>Sign Out</button>
            </>
          ) : (
            <button
              className={styles.mobileSignIn}
              onClick={() => {
                setMenuOpen(false);
                setAuthModalTab("signin");
                setShowAuthModal(true);
              }}
            >
              Sign In
            </button>
          )}
        </nav>
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          initialTab={authModalTab}
        />
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

function ChevronIcon({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={open ? styles.chevronOpen : ""} aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
