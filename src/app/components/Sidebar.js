"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { label: "Home",      href: "/",          icon: HomeIcon },
  { label: "Movies",    href: "/browse/popular", icon: FilmIcon },
  { label: "Trending",  href: "/browse/trending", icon: TrendingIcon },
  { label: "Top Rated", href: "/browse/top-rated", icon: StarNavIcon },
  { label: "Watchlist", href: "/watchlist",  icon: BookmarkIcon },
];

const GENRES = [
  { id: 28,    name: "Action" },
  { id: 12,    name: "Adventure" },
  { id: 16,    name: "Animation" },
  { id: 35,    name: "Comedy" },
  { id: 80,    name: "Crime" },
  { id: 18,    name: "Drama" },
  { id: 27,    name: "Horror" },
  { id: 878,   name: "Sci-Fi" },
  { id: 53,    name: "Thriller" },
  { id: 99,    name: "Documentary" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const sidebarContent = (
    <div className={styles.inner}>
      {/* Logo */}
      <Link href="/" className={styles.logo} aria-label="LUMA home">
        <span className={styles.logoMark}>L</span>
        <span className={styles.logoText}>UMA</span>
      </Link>

      {/* Main nav */}
      <nav className={styles.nav} aria-label="Main navigation">
        <span className={styles.navLabel}>Menu</span>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className={styles.navIcon}><Icon /></span>
              <span className={styles.navItemLabel}>{label}</span>
              {active && <span className={styles.activeBar} aria-hidden="true" />}
            </Link>
          );
        })}
      </nav>

      <div className={styles.divider} aria-hidden="true" />

      {/* Genres */}
      <nav className={styles.genres} aria-label="Browse by genre">
        <span className={styles.navLabel}>Genres</span>
        {GENRES.map((g) => (
          <Link
            key={g.id}
            href={`/browse/genre/${g.id}`}
            className={`${styles.genreItem} ${pathname === `/browse/genre/${g.id}` ? styles.genreItemActive : ""}`}
          >
            {g.name}
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className={styles.sidebar} aria-label="Site navigation">
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className={styles.mobileBar}>
        <button
          className={styles.hamburger}
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation"
          aria-expanded={drawerOpen}
        >
          <MenuIcon />
        </button>
        <Link href="/" className={styles.mobileLogo}>
          <span className={styles.logoMark}>L</span>
          <span className={styles.logoText}>UMA</span>
        </Link>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div
            className={styles.backdrop}
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className={styles.drawer} aria-label="Mobile navigation">
            <button
              className={styles.drawerClose}
              onClick={() => setDrawerOpen(false)}
              aria-label="Close navigation"
            >
              <CloseIcon />
            </button>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}

/* ── Icons ──────────────────────────────────────────────────── */
function HomeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function FilmIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>;
}
function TrendingIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
}
function StarNavIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
function BookmarkIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
}
function MenuIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
}
function CloseIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
