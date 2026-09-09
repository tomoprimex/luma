"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInWithEmail, signUpWithEmail } from "@/lib/supabase";
import { useAuth } from "@/app/components/AuthProvider";
import styles from "./signin.module.css";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading } = useAuth();

  const defaultTab = searchParams.get("tab") === "signup" ? "signup" : "signin";
  const [tab, setTab] = useState(defaultTab);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const redirect = searchParams.get("redirect") || "/";
      router.replace(redirect);
    }
  }, [loading, isAuthenticated, router, searchParams]);

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInShowPassword, setSignInShowPassword] = useState(false);
  const [signInError, setSignInError] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);

  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirm, setSignUpConfirm] = useState("");
  const [signUpShowPassword, setSignUpShowPassword] = useState(false);
  const [signUpShowConfirm, setSignUpShowConfirm] = useState(false);
  const [signUpError, setSignUpError] = useState("");
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const passwordStrength = getPasswordStrength(signUpPassword);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setSignInError("");
    setSignInLoading(true);
    const { error } = await signInWithEmail(signInEmail, signInPassword);
    setSignInLoading(false);
    if (error) {
      setSignInError(error);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setSignUpError("");

    if (!signUpName.trim()) {
      setSignUpError("Please enter your display name.");
      return;
    }
    if (signUpPassword.length < 6) {
      setSignUpError("Password must be at least 6 characters.");
      return;
    }
    if (signUpPassword !== signUpConfirm) {
      setSignUpError("Passwords do not match.");
      return;
    }

    setSignUpLoading(true);
    const { user, error } = await signUpWithEmail(signUpEmail, signUpPassword, signUpName.trim());
    setSignUpLoading(false);

    if (error) {
      setSignUpError(error);
    } else if (user) {
      try {
        await Promise.all([
          import("@/lib/supabase").then(m => m.ensureProfile(user.id, signUpName.trim())),
          import("@/lib/supabase").then(m => m.ensureUserSettings(user.id)),
        ]);
      } catch (e) {
        console.error("Fallback profile/settings creation failed:", e);
      }
      setSignUpSuccess(true);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingSpinner} aria-label="Loading…" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.logo} aria-label="Back to LUMA">
          <span className={styles.logoMark}>L</span>
          <span className={styles.logoText}>UMA</span>
        </Link>

        <div className={styles.tabs} role="tablist">
          <button
            role="tab"
            aria-selected={tab === "signin"}
            className={`${styles.tab} ${tab === "signin" ? styles.tabActive : ""}`}
            onClick={() => { setTab("signin"); setSignInError(""); }}
          >
            Sign In
          </button>
          <button
            role="tab"
            aria-selected={tab === "signup"}
            className={`${styles.tab} ${tab === "signup" ? styles.tabActive : ""}`}
            onClick={() => { setTab("signup"); setSignUpError(""); setSignUpSuccess(false); }}
          >
            Create Account
          </button>
        </div>

        {tab === "signin" && (
          <form className={styles.form} onSubmit={handleSignIn} noValidate>
            <p className={styles.subtitle}>Welcome back to LUMA</p>

            {signInError && (
              <div className={styles.errorMsg} role="alert">{signInError}</div>
            )}

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="signin-email">Email</label>
              <input
                id="signin-email"
                className={styles.input}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                required
                disabled={signInLoading}
              />
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label} htmlFor="signin-password">Password</label>
                <Link href="/forgot-password" className={styles.forgotLink}>
                  Forgot password?
                </Link>
              </div>
              <div className={styles.inputWrap}>
                <input
                  id="signin-password"
                  className={styles.input}
                  type={signInShowPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                  disabled={signInLoading}
                />
                <button
                  type="button"
                  className={styles.visibilityToggle}
                  onClick={() => setSignInShowPassword((v) => !v)}
                  aria-label={signInShowPassword ? "Hide password" : "Show password"}
                >
                  {signInShowPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button
              className={styles.submitBtn}
              type="submit"
              disabled={signInLoading || !signInEmail || !signInPassword}
            >
              {signInLoading && <span className={styles.spinner} aria-hidden="true" />}
              {signInLoading ? "Signing in…" : "Sign In"}
            </button>

            <p className={styles.switchText}>
              Don&apos;t have an account?{" "}
              <button type="button" className={styles.switchLink} onClick={() => setTab("signup")}>
                Create one
              </button>
            </p>
          </form>
        )}

        {tab === "signup" && (
          <form className={styles.form} onSubmit={handleSignUp} noValidate>
            <p className={styles.subtitle}>Join LUMA — it&apos;s free</p>

            {signUpSuccess ? (
              <div className={styles.successMsg} role="status">
                <span className={styles.successIcon}>✓</span>
                <div>
                  <strong>Account created!</strong>
                  <p>Check your email to confirm your account, then sign in.</p>
                </div>
              </div>
            ) : (
              <>
                {signUpError && (
                  <div className={styles.errorMsg} role="alert">{signUpError}</div>
                )}

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="signup-name">Display Name</label>
                  <input
                    id="signup-name"
                    className={styles.input}
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    required
                    disabled={signUpLoading}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="signup-email">Email</label>
                  <input
                    id="signup-email"
                    className={styles.input}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                    disabled={signUpLoading}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="signup-password">Password</label>
                  <div className={styles.inputWrap}>
                    <input
                      id="signup-password"
                      className={styles.input}
                      type={signUpShowPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required
                      disabled={signUpLoading}
                    />
                    <button
                      type="button"
                      className={styles.visibilityToggle}
                      onClick={() => setSignUpShowPassword((v) => !v)}
                      aria-label={signUpShowPassword ? "Hide password" : "Show password"}
                    >
                      {signUpShowPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {signUpPassword.length > 0 && (
                    <div className={styles.strengthBar} aria-label={`Password strength: ${passwordStrength.label}`}>
                      <div className={styles.strengthTrack}>
                        <div
                          className={`${styles.strengthFill} ${styles[`strength${passwordStrength.level}`]}`}
                          style={{ width: `${(passwordStrength.level / 4) * 100}%` }}
                        />
                      </div>
                      <span className={styles.strengthLabel}>{passwordStrength.label}</span>
                    </div>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="signup-confirm">Confirm Password</label>
                  <div className={styles.inputWrap}>
                    <input
                      id="signup-confirm"
                      className={styles.input}
                      type={signUpShowConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      value={signUpConfirm}
                      onChange={(e) => setSignUpConfirm(e.target.value)}
                      required
                      disabled={signUpLoading}
                    />
                    <button
                      type="button"
                      className={styles.visibilityToggle}
                      onClick={() => setSignUpShowConfirm((v) => !v)}
                      aria-label={signUpShowConfirm ? "Hide password" : "Show password"}
                    >
                      {signUpShowConfirm ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <button
                  className={styles.submitBtn}
                  type="submit"
                  disabled={signUpLoading || !signUpEmail || !signUpPassword || !signUpName}
                >
                  {signUpLoading && <span className={styles.spinner} aria-hidden="true" />}
                  {signUpLoading ? "Creating account…" : "Create Account"}
                </button>

                <p className={styles.switchText}>
                  Already have an account?{" "}
                  <button type="button" className={styles.switchLink} onClick={() => setTab("signin")}>
                    Sign in
                  </button>
                </p>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.88 9.88 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function getPasswordStrength(password) {
  if (!password) return { level: 0, label: "" };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const level = Math.min(4, score);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  return { level, label: labels[level] };
}
