import styles from "./WatchProviders.module.css";

/**
 * WatchProviders — server component.
 * Receives pre-fetched provider data from the detail page.
 *
 * Props:
 *   providers  {object|null}  Result of getMovieWatchProviders()
 *   movieTitle {string}
 */
export default function WatchProviders({ providers, movieTitle }) {
  // No provider data at all
  if (!providers) {
    return (
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Watch Online</p>
        <p className={styles.empty}>No streaming options available for this title.</p>
      </div>
    );
  }

  const { streaming = [], rent = [], buy = [], link } = providers;
  const hasAny = streaming.length > 0 || rent.length > 0 || buy.length > 0;

  if (!hasAny) {
    return (
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Watch Online</p>
        <p className={styles.empty}>No streaming options available for this title.</p>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <p className={styles.sectionLabel}>Watch Online</p>

      <div className={styles.groups}>
        {streaming.length > 0 && (
          <ProviderGroup label="Streaming" providers={streaming} link={link} />
        )}
        {rent.length > 0 && (
          <ProviderGroup label="Rent" providers={rent} link={link} />
        )}
        {buy.length > 0 && (
          <ProviderGroup label="Buy" providers={buy} link={link} />
        )}
      </div>

      {/* TMDB/JustWatch attribution — required by TMDB terms */}
      <p className={styles.attribution}>
        Streaming data provided by{" "}
        <a
          href="https://www.themoviedb.org"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.attributionLink}
        >
          TMDB
        </a>{" "}
        via{" "}
        <a
          href="https://www.justwatch.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.attributionLink}
        >
          JustWatch
        </a>
        . Links open the provider&apos;s official website.
      </p>
    </div>
  );
}

/* ── Provider group ─────────────────────────────────────────── */
function ProviderGroup({ label, providers, link }) {
  return (
    <div className={styles.group}>
      <span className={styles.groupLabel}>{label}</span>
      <div className={styles.providerList}>
        {providers.map((p) => (
          <ProviderChip key={p.id} provider={p} link={link} />
        ))}
      </div>
    </div>
  );
}

/* ── Provider chip ──────────────────────────────────────────── */
function ProviderChip({ provider, link }) {
  // Use the official TMDB/JustWatch deep link when available
  const href = link || `https://www.justwatch.com`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.provider}
      aria-label={`Watch on ${provider.name} (opens in new tab)`}
      title={provider.name}
    >
      {provider.logoUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={provider.logoUrl}
          alt={`${provider.name} logo`}
          className={styles.providerLogo}
          loading="lazy"
        />
      ) : (
        <div className={styles.providerLogoFallback} aria-hidden="true">
          {provider.name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <span className={styles.providerName}>{provider.name}</span>
    </a>
  );
}
