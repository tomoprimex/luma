"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { logOut } from "@/lib/supabase";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { label: "Home",      href: "/",               icon: HomeIcon },
  { label: "Movies",    href: "/browse/popular",  icon: FilmIcon },
  { label: "Trending",  href: "/browse/trending", icon: TrendingIcon },
  { label: "Top Rated", href: "/browse/top-rated", icon: StarNavIcon },
  { label: "Watchlist", href: "/watchlist",       icon: BookmarkIcon },
  { label: "Recently Viewed", href: "/recently-viewed", icon: ClockIcon },
];

const GENRES = [
  { id: 28,  name: "Action" },
  { id: 12,  name: "Adventure" },
  { id: 16,  name: "Animation" },
  { id: 35,  name: "Comedy" },
  { id: 80,  name: "Crime" },
  { id: 18,  name: "Drama" },
  { id: 27,  name: "Horror" },
  { id: 878, name: "Sci-Fi" },
  { id: 53,  name: "Thriller" },
  { id: 99,  name: "Documentary" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAuthenticated } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close drawer/dropdown on route change
  useEffect(() => {
    setDrawerOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const handleSignOut = async () => {
    setProfileOpen(false);
    await logOut();
    router.push("/");
  };

  const displayName =
    profile?.display_name ||
    profile?.username ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Account";

  const avatarInitial = (displayName || "U").charAt(0).toUpperCase();
  const avatarUrl = profile?.avatar_url || null;

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
            className={`${styles.genreItem} ${
              pathname === `/browse/genre/${g.id}` ? styles.genreItemActive : ""
            }`}
          >
            {g.name}
          </Link>
        ))}
      </nav>

      {/* Auth section */}
      <div className={styles.authSection}>
        {isAuthenticated ? (
          <div className={styles.userSection} ref={profileRef}>
            <button
              className={styles.userBtn}
              onClick={() => setProfileOpen((o) => !o)}
              aria-expanded={profileOpen}
              aria-label="Account menu"
            >
              <div className={styles.avatar}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className={styles.avatarImg} />
                ) : (
                  <span className={styles.avatarInitial}>{avatarInitial}</span>
                )}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{displayName}</span>
                <span className={styles.userEmail}>{user?.email}</span>
              </div>
              <ChevronIcon open={profileOpen} />
            </button>

            {profileOpen && (
              <div className={styles.profileDropdown}>
                <Link href="/profile" className={styles.dropdownItem} onClick={() => setProfileOpen(false)}>
                  <UserIcon /> Profile
                </Link>
                <Link href="/settings" className={styles.dropdownItem} onClick={() => setProfileOpen(false)}>
                  <SettingsIcon /> Settings
                </Link>
                <div className={styles.dropdownDivider} />
                <button className={styles.dropdownItem} onClick={handleSignOut}>
                  <SignOutIcon /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/signin"
            className={`${styles.signInBtn} ${pathname === "/signin" ? styles.signInBtnActive : ""}`}
          >
            <UserIcon />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className={styles.sidebar} aria-label="Site navigation" suppressHydrationWarning>
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
            suppressHydrationWarning
          />
          <aside className={styles.drawer} aria-label="Mobile navigation" suppressHydrationWarning>
            <button
              className={styles.drawerClose}
              onClick={() => setDrawerOpen(false)}
              aria-label="Close navigation"
              suppressHydrationWarning
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

// ─── Icons ───────────────────────────────────────────────────────────────────

function HomeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function FilmIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>;
}
function TrendingIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
}
function StarNavIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
function BookmarkIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
}
function ClockIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function MenuIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
}
function CloseIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function UserIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function SettingsIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
function SignOutIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
}
function ChevronIcon({ open }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" suppressHydrationWarning>
      <polyline points={open ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
    </svg>
  );
}