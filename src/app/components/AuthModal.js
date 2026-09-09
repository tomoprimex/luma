"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { signInWithEmail, signUpWithEmail } from "@/lib/supabase";
import styles from "./AuthModal.module.css";

export default function AuthModal({ onClose, initialTab = "signin", onAuthSuccess }) {
  const [tab, setTab] = useState(initialTab);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const email = e.target.email.value;
    const password = e.target.password.value;
    const { error: err } = await signInWithEmail(email, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else if (onAuthSuccess) {
      onAuthSuccess();
      onClose();
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    const name = e.target.name.value.trim();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirm = e.target.confirm.value;

    if (!name) {
      setError("Please enter your display name.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const { error: err } = await signUpWithEmail(email, password, name);
    setLoading(false);
    if (err) {
      setError(err);
    } else if (onAuthSuccess) {
      onAuthSuccess();
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true" aria-label="Sign in to LUMA">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        <div className={styles.content}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>L</span>
            <span className={styles.logoText}>UMA</span>
          </div>

          <h2 className={styles.title}>
            {tab === "signin" ? "Welcome back" : "Join LUMA"}
          </h2>
          <p className={styles.subtitle}>
            {tab === "signin" ? "Sign in to access your account" : "Create an account to get started"}
          </p>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === "signin" ? styles.tabActive : ""}`}
              onClick={() => { setTab("signin"); setError(""); }}
            >
              Sign In
            </button>
            <button
              className={`${styles.tab} ${tab === "signup" ? styles.tabActive : ""}`}
              onClick={() => { setTab("signup"); setError(""); }}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className={styles.errorMsg} role="alert">{error}</div>
          )}

          {tab === "signin" ? (
            <form className={styles.form} onSubmit={handleSignIn} noValidate>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="modal-email">Email</label>
                <input id="modal-email" className={styles.input} type="email" required placeholder="you@example.com" />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="modal-password">Password</label>
                <input id="modal-password" className={styles.input} type="password" required placeholder="••••••••" />
              </div>
              <button className={styles.primaryBtn} type="submit" disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </button>
              <p className={styles.switchText}>
                <Link href="/forgot-password" className={styles.link} onClick={onClose}>Forgot password?</Link>
              </p>
            </form>
          ) : (
            <form className={styles.form} onSubmit={handleSignUp} noValidate>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="modal-name">Display Name</label>
                <input id="modal-name" className={styles.input} type="text" required placeholder="Your name" />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="modal-email">Email</label>
                <input id="modal-email" className={styles.input} type="email" required placeholder="you@example.com" />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="modal-password">Password</label>
                <input id="modal-password" className={styles.input} type="password" required placeholder="At least 6 characters" minLength={6} />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="modal-confirm">Confirm Password</label>
                <input id="modal-confirm" className={styles.input} type="password" required placeholder="Repeat your password" />
              </div>
              <button className={styles.primaryBtn} type="submit" disabled={loading}>
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
