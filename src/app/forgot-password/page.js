"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPasswordForEmail } from "@/lib/supabase";
import styles from "./forgot-password.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await resetPasswordForEmail(email);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setSent(true);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo} aria-label="Back to LUMA">
          <span className={styles.logoMark}>L</span>
          <span className={styles.logoText}>UMA</span>
        </Link>

        <h1 className={styles.heading}>Reset your password</h1>

        {sent ? (
          <div className={styles.successMsg} role="status">
            <span className={styles.successIcon}>✓</span>
            <div>
              <strong>Check your email</strong>
              <p>
                We sent a password reset link to <strong>{email}</strong>. Click the link in
                that email to set a new password.
              </p>
            </div>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <p className={styles.subtitle}>
              Enter the email address associated with your account and we'll send a reset link.
            </p>

            {error && (
              <div className={styles.errorMsg} role="alert">{error}</div>
            )}

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                className={styles.input}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              className={styles.submitBtn}
              type="submit"
              disabled={loading || !email}
            >
              {loading && <span className={styles.spinner} aria-hidden="true" />}
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className={styles.backLink}>
          <Link href="/signin" className={styles.link}>
            ← Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}