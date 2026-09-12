import styles from "./movie.module.css";

export default function MovieNotFound() {
  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "24px",
        padding: "var(--space-6)",
        background: "var(--bg-base)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "4rem",
          lineHeight: 1,
          opacity: 0.3,
        }}
        aria-hidden="true"
      >
        🎬
      </div>
      <h1
        style={{
          fontSize: "clamp(1.5rem, 3vw, 2rem)",
          fontWeight: 800,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
          margin: 0,
        }}
      >
        Movie not found
      </h1>
      <p
        style={{
          color: "var(--text-secondary)",
          maxWidth: 400,
          lineHeight: 1.7,
          fontSize: "0.95rem",
          margin: 0,
        }}
      >
        This movie doesn&apos;t exist in our database, or the ID is invalid.
      </p>
      <a
        href="/"
        style={{
          marginTop: "8px",
          padding: "12px 28px",
          background: "var(--gold)",
          color: "#000",
          fontWeight: 700,
          fontSize: "0.9rem",
          borderRadius: "var(--radius-md)",
          textDecoration: "none",
          transition: "background 150ms ease",
        }}
      >
        Back to LUMA
      </a>
    </div>
  );
}
