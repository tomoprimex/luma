import styles from "./page.module.css";

/**
 * loading.js — shown by Next.js while the async homepage is fetching data.
 * Mirrors the real page structure so the layout doesn't jump on load.
 */
export default function HomeLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true">
          <div className={styles.heroBgGrad} />
          <div className={styles.heroBgNoise} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <div className={`${styles.skeletonBlock} ${styles.skeletonBadge}`} />
          <div className={styles.skeletonTitleGroup}>
            <div className={`${styles.skeletonBlock} ${styles.skeletonLine} ${styles.skeletonLg}`} />
            <div className={`${styles.skeletonBlock} ${styles.skeletonLine} ${styles.skeletonMd}`} />
          </div>
          <div className={`${styles.skeletonBlock} ${styles.skeletonDesc}`} />
          <div className={`${styles.skeletonBlock} ${styles.skeletonDesc} ${styles.skeletonDescShort}`} />
          <div className={styles.skeletonCtas}>
            <div className={`${styles.skeletonBlock} ${styles.skeletonBtn}`} />
            <div className={`${styles.skeletonBlock} ${styles.skeletonBtnSecondary}`} />
          </div>
        </div>
      </section>

      {/* Rows skeleton */}
      <div className={styles.sections}>
        {[1, 2, 3].map((i) => (
          <section key={i} className={styles.rowSkeleton}>
            <div className="container">
              <div className={`${styles.skeletonBlock} ${styles.skeletonSectionTitle}`} />
            </div>
            <div className="container">
              <div className={styles.skeletonTrack}>
                {Array.from({ length: 8 }).map((_, j) => (
                  <div key={j} className={styles.skeletonCard}>
                    <div className={`${styles.skeletonBlock} ${styles.skeletonPoster}`} />
                    <div className={`${styles.skeletonBlock} ${styles.skeletonCardLine}`} style={{ width: "70%" }} />
                    <div className={`${styles.skeletonBlock} ${styles.skeletonCardLine}`} style={{ width: "40%" }} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
