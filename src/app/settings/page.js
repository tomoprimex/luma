"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider";
import { updateUserSettings } from "@/lib/supabase";
import styles from "./settings.module.css";

const DEFAULT_SETTINGS = {
  theme: "dark",
  autoplay: true,
  autoplay_next: true,
  video_quality: "auto",
  data_saver: false,
  subtitles_enabled: true,
  subtitle_language: "en",
  audio_language: "en",
  notifications: true,
  email_notifications: true,
};

export default function SettingsPage() {
  const router = useRouter();
  const { user, settings, loading, refreshSettings, isAuthenticated } = useAuth();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ ...DEFAULT_SETTINGS });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (settings) {
      setForm({
        theme: settings.theme || "dark",
        autoplay: settings.autoplay ?? true,
        autoplay_next: settings.autoplay_next ?? true,
        video_quality: settings.video_quality || "auto",
        data_saver: settings.data_saver ?? false,
        subtitles_enabled: settings.subtitles_enabled ?? true,
        subtitle_language: settings.subtitle_language || "en",
        audio_language: settings.audio_language || "en",
        notifications: settings.notifications ?? true,
        email_notifications: settings.email_notifications ?? true,
      });
    }
  }, [settings]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setError("");
    setSuccess(false);
    setSaving(true);

    const { error: err } = await updateUserSettings(user.id, form);
    setSaving(false);

    if (err) {
      setError(err);
    } else {
      setSuccess(true);
      refreshSettings();
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} aria-label="Loading settings" />
          <p className={styles.loadingText}>Loading settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>Manage your LUMA experience</p>
        </div>

        {success && (
          <div className={styles.successBanner} role="status">
            Settings saved successfully.
          </div>
        )}

        {error && (
          <div className={styles.errorBanner} role="alert">{error}</div>
        )}

        <div className={styles.sections}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Appearance</h3>
            <div className={styles.sectionBody}>
              <ToggleRow
                label="Dark theme"
                description="Use dark colors across the interface"
                checked={form.theme === "dark"}
                onChange={(v) => update("theme", v ? "dark" : "light")}
              />
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Playback</h3>
            <div className={styles.sectionBody}>
              <ToggleRow
                label="Autoplay"
                description="Automatically play content when focused"
                checked={form.autoplay}
                onChange={(v) => update("autoplay", v)}
              />
              <ToggleRow
                label="Autoplay next episode"
                description="Play the next episode automatically"
                checked={form.autoplay_next}
                onChange={(v) => update("autoplay_next", v)}
              />
              <SelectRow
                label="Video quality"
                description="Preferred streaming quality"
                value={form.video_quality}
                onChange={(v) => update("video_quality", v)}
                options={[
                  { value: "auto", label: "Auto" },
                  { value: "1080p", label: "1080p" },
                  { value: "720p", label: "720p" },
                  { value: "480p", label: "480p" },
                ]}
              />
              <ToggleRow
                label="Data saver"
                description="Reduce data usage on mobile networks"
                checked={form.data_saver}
                onChange={(v) => update("data_saver", v)}
              />
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Subtitles & Audio</h3>
            <div className={styles.sectionBody}>
              <ToggleRow
                label="Subtitles enabled"
                description="Show subtitles by default"
                checked={form.subtitles_enabled}
                onChange={(v) => update("subtitles_enabled", v)}
              />
              <SelectRow
                label="Subtitle language"
                description="Preferred subtitle language"
                value={form.subtitle_language}
                onChange={(v) => update("subtitle_language", v)}
                options={[
                  { value: "en", label: "English" },
                  { value: "es", label: "Spanish" },
                  { value: "fr", label: "French" },
                  { value: "de", label: "German" },
                  { value: "pt", label: "Portuguese" },
                  { value: "ja", label: "Japanese" },
                  { value: "ko", label: "Korean" },
                  { value: "zh", label: "Chinese" },
                ]}
              />
              <SelectRow
                label="Audio language"
                description="Preferred audio language"
                value={form.audio_language}
                onChange={(v) => update("audio_language", v)}
                options={[
                  { value: "en", label: "English" },
                  { value: "es", label: "Spanish" },
                  { value: "fr", label: "French" },
                  { value: "de", label: "German" },
                  { value: "ja", label: "Japanese" },
                ]}
              />
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Notifications</h3>
            <div className={styles.sectionBody}>
              <ToggleRow
                label="Notifications"
                description="Receive in-app notifications"
                checked={form.notifications}
                onChange={(v) => update("notifications", v)}
              />
              <ToggleRow
                label="Email notifications"
                description="Receive updates via email"
                checked={form.email_notifications}
                onChange={(v) => update("email_notifications", v)}
              />
            </div>
          </section>

          <div className={styles.footer}>
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <span className={styles.spinner} aria-hidden="true" /> : null}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowText}>
        <span className={styles.rowLabel}>{label}</span>
        <span className={styles.rowDesc}>{description}</span>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        className={`${styles.toggle} ${checked ? styles.toggleOn : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.toggleThumb} />
      </button>
    </div>
  );
}

function SelectRow({ label, description, value, onChange, options }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowText}>
        <span className={styles.rowLabel}>{label}</span>
        <span className={styles.rowDesc}>{description}</span>
      </div>
      <div className={styles.selectWrap}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.select}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
