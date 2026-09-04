import styles from "./movie.module.css";

export default function MovieLoading() {
  return (
    <div className={styles.page}>
      <div className={`${styles.skeletonBlock} ${styles.skeletonBackdrop}`} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.layout}>
          <aside className={styles.posterCol}>
            <div className={`${styles.skeletonBlock} ${styles.skeletonPoster}`} />
          </aside>
          <div className={styles.infoCol}>
            <div className={styles.skeletonMeta}>
              {[80, 70, 90].map((w, i) => (
                <div key={i} className={`${styles.skeletonBlock} ${styles.skeletonMetaItem}`} style={{ width: w }} />
              ))}
            </div>
            <div className={`${styles.skeletonBlock} ${styles.skeletonTitle}`} />
            <div className={`${styles.skeletonBlock} ${styles.skeletonLine}`} style={{ width: "45%", marginBottom: 24 }} />
            <div className={styles.skeletonMeta}>
              {[100, 60, 80].map((w, i) => (
                <div key={i} className={`${styles.skeletonBlock} ${styles.skeletonMetaItem}`} style={{ width: w }} />
              ))}
            </div>
            {[100, 95, 88, 72].map((w, i) => (
              <div key={i} className={`${styles.skeletonBlock} ${styles.skeletonText}`} style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
