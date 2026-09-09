"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider";
import { getLumaSiteRating, upsertLumaSiteRating, getLumaSiteRatingSummary } from "@/lib/supabase";
import AuthModal from "@/app/components/AuthModal";
import styles from "./rate-luma.module.css";

const CATEGORIES = [
  { key: "overall", label: "Overall" },
  { key: "ui_design", label: "UI / Design" },
  { key: "streaming_experience", label: "Streaming Experience" },
  { key: "video_player", label: "Video Player" },
  { key: "navigation", label: "Navigation" },
  { key: "recommendations", label: "Recommendations" },
];

const RATING_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

export default function RateLumaPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("signin");
  const [ratings, setRatings] = useState({});
  const [review, setReview] = useState("");
  const [summary, setSummary] = useState(null);
  const [existing, setExisting] = useState(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Allow viewing but not submitting
    }
  }, [loading, isAuthenticated]);

  useEffect(() => {
    const load = async () => {
      const sum = await getLumaSiteRatingSummary();
      if (sum) setSummary(sum);
      if (user) {
        const existingRating = await getLumaSiteRating(user.id);
        if (existingRating) {
          setExisting(existingRating);
          const initial = {};
          CATEGORIES.forEach((cat) => {
            if (existingRating[cat.key] != null) initial[cat.key] = existingRating[cat.key];
          });
          setRatings(initial);
          setReview(existingRating.review || "");
        }
      }
    };
    load();
  }, [user]);

  const setCategoryRating = (key, value) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setAuthModalTab("signin");
      setShowAuthModal(true);
      return;
    }
    setError("");
    setSuccess(false);
    setSaving(true);

    const payload = { ...ratings, review };
    const { error: err } = await upsertLumaSiteRating(user.id, payload);
    setSaving(false);

    if (err) {
      setError(err);
    } else {
      setSuccess(true);
      const sum = await getLumaSiteRatingSummary();
      if (sum) setSummary(sum);
      const updated = await getLumaSiteRating(user.id);
      if (updated) setExisting(updated);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  const overallValue = ratings.overall;
  const avgCategory = CATEGORIES.filter((c) => c.key !== "overall").reduce((sum, cat) => sum + (ratings[cat.key] || 0), 0) / (CATEGORIES.length - 1);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Rate LUMA</h1>
          <p className={styles.subtitle}>Help us improve your experience</p>
        </div>

        {success && (
          <div className={styles.successBanner} role="status">
            Thanks for your feedback!
          </div>
        )}

        {error && (
          <div className={styles.errorBanner} role="alert">{error}</div>
        )}

        {summary && (
          <div className={styles.summaryCard}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>{summary.average_overall ? Number(summary.average_overall).toFixed(1) : "—"}</span>
              <span className={styles.summaryLabel}>Overall</span>
            </div>
            <div className={styles.summaryDivider} />
            <div className={styles.summaryItem}>
              <span className={styles.summaryValue}>{summary.total_ratings || 0}</span>
              <span className={styles.summaryLabel}>Ratings</span>
            </div>
          </div>
        )}

        <div className={styles.sections}>
          {CATEGORIES.map((cat) => (
            <div key={cat.key} className={styles.categoryCard}>
              <div className={styles.categoryHeader}>
                <h3 className={styles.categoryTitle}>{cat.label}</h3>
                {ratings[cat.key] != null && (
                  <span className={styles.categoryValue}>{ratings[cat.key]}/5</span>
                )}
              </div>
              <div className={styles.categoryScale}>
                {RATING_OPTIONS.map((r) => (
                  <button
                    key={r}
                    className={`${styles.ratingOption} ${ratings[cat.key] === r ? styles.ratingOptionActive : ""}`}
                    onClick={() => setCategoryRating(cat.key, r)}
                    aria-label={`${cat.label}: ${r} out of 5`}
                    aria-pressed={ratings[cat.key] === r}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.reviewSection}>
          <label className={styles.reviewLabel} htmlFor="review">Optional review or feedback</label>
          <textarea
            id="review"
            className={styles.reviewInput}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Tell us what you think…"
            rows={3}
          />
        </div>

        <div className={styles.footer}>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={saving || !overallValue}
          >
            {saving ? "Saving…" : existing ? "Update rating" : "Submit rating"}
          </button>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          initialTab={authModalTab}
        />
      )}
    </div>
  );
}
