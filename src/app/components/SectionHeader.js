import Link from "next/link";
import styles from "./SectionHeader.module.css";

export default function SectionHeader({ title, subtitle, href }) {
  return (
    <div className={styles.header}>
      <div className={styles.text}>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className={styles.more}>
          More
          <ChevronIcon />
        </Link>
      )}
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" suppressHydrationWarning>
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}
