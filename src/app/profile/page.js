"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider";
import { updateProfile } from "@/lib/supabase";
import AuthModal from "@/app/components/AuthModal";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile, isAuthenticated } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setUsername(profile.username || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setError("");
    setSuccess(false);
    setSaving(true);

    const { error: err } = await updateProfile(user.id, {
      display_name: displayName.trim() || null,
      username: username.trim() || null,
      bio: bio.trim() || null,
    });

    setSaving(false);
    if (err) {
      setError(err);
    } else {
      setSuccess(true);
      setEditing(false);
      refreshProfile();
    }
  };

  const handleCancel = () => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setUsername(profile.username || "");
      setBio(profile.bio || "");
    }
    setEditing(false);
    setError("");
    setSuccess(false);
  };

  if (loading || !isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} aria-label="Loading profile" />
          <p className={styles.loadingText}>Loading your profile…</p>
        </div>
      </div>
    );
  }

  const initial = (displayName || user?.email || "U").charAt(0).toUpperCase();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerBg} aria-hidden="true" />
        <div className={styles.headerContent}>
          <div className={styles.avatarLarge}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className={styles.avatarImg} />
            ) : (
              <span className={styles.avatarInitial}>{initial}</span>
            )}
          </div>
          <h1 className={styles.name}>
            {profile?.display_name || profile?.username || user?.email?.split("@")[0] || "User"}
          </h1>
          <p className={styles.email}>{user?.email}</p>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Profile</h2>
            {!editing && (
              <button className={styles.editBtn} onClick={() => { setEditing(true); setSuccess(false); setError(""); }}>
                Edit
              </button>
            )}
          </div>

          {success && (
            <div className={styles.successBanner} role="status">
              Profile saved successfully.
            </div>
          )}

          {error && (
            <div className={styles.errorBanner} role="alert">{error}</div>
          )}

          {editing ? (
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="display-name">Display Name</label>
                <input
                  id="display-name"
                  className={styles.input}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="username">Username</label>
                <input
                  id="username"
                  className={styles.input}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Unique username"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  className={`${styles.input} ${styles.textarea}`}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us a bit about yourself…"
                  rows={3}
                />
              </div>

              <div className={styles.formActions}>
                <button className={styles.cancelBtn} type="button" onClick={handleCancel} disabled={saving}>
                  Cancel
                </button>
                <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                  {saving ? <span className={styles.spinner} aria-hidden="true" /> : null}
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.readonly}>
              <div className={styles.readonlyRow}>
                <span className={styles.readonlyLabel}>Display Name</span>
                <span className={styles.readonlyValue}>{profile?.display_name || "—"}</span>
              </div>
              <div className={styles.readonlyRow}>
                <span className={styles.readonlyLabel}>Username</span>
                <span className={styles.readonlyValue}>{profile?.username || "—"}</span>
              </div>
              <div className={styles.readonlyRow}>
                <span className={styles.readonlyLabel}>Bio</span>
                <span className={styles.readonlyValue}>{profile?.bio || "—"}</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Account</h2>
          <div className={styles.readonly}>
            <div className={styles.readonlyRow}>
              <span className={styles.readonlyLabel}>Email</span>
              <span className={styles.readonlyValue}>{user?.email}</span>
            </div>
            <div className={styles.readonlyRow}>
              <span className={styles.readonlyLabel}>Member since</span>
              <span className={styles.readonlyValue}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
