import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import profileService from "../../../services/profileService";
import useAuth        from "../../../hooks/useAuth";

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const relTime = (d) => {
  const diff  = Date.now() - new Date(d).getTime();
  const hours = Math.floor(diff / 3600000);
  const mins  = Math.floor(diff / 60000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60) return `il y a ${mins}min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days  <  7) return `il y a ${days}j`;
  return fmt(d);
};

const POST_TYPE_META = {
  update:       { label: "Mise à jour",  color: "#0891b2" },
  achievement:  { label: "Réalisation",  color: "#059669" },
  campaign:     { label: "Campagne",     color: "#7c3aed" },
  announcement: { label: "Annonce",      color: "#d97706" },
};

const SOCIAL_PLATFORMS = ["instagram", "tiktok", "youtube", "linkedin", "twitter"];

const AvatarCircle = ({ src, name, size = 72 }) => {
  const initials = (name || "?").split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
  if (src) return (
    <img src={src} alt={name}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover",
        flexShrink: 0, border: "3px solid var(--d-border-soft)" }} />
  );
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "linear-gradient(135deg,#d97706,#b45309)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.34, fontWeight: 800, color: "#fff",
      border: "3px solid var(--d-border-soft)", letterSpacing: "-0.02em" }}>
      {initials}
    </div>
  );
};

const InfoRow = ({ label, value, icon }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0",
    borderBottom: "1px solid var(--d-border-soft)" }}>
    {icon && <span style={{ fontSize: "0.9rem", color: "var(--d-muted)", width: 18,
      textAlign: "center", flexShrink: 0, marginTop: 1 }}>{icon}</span>}
    <div style={{ minWidth: 110, flexShrink: 0 }}>
      <span style={{ fontSize: "0.72rem", color: "var(--d-muted)", fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
    </div>
    <div style={{ flex: 1, fontSize: "0.875rem", color: value ? "var(--d-ink)" : "var(--d-muted)",
      fontWeight: value ? 500 : 400, wordBreak: "break-word" }}>
      {value || "—"}
    </div>
  </div>
);

const StatMini = ({ label, value, color = "#d97706" }) => (
  <div style={{ textAlign: "center", padding: "14px 10px", flex: 1 }}>
    <div style={{ fontSize: "1.6rem", fontWeight: 800, color, lineHeight: 1 }}>{value ?? "—"}</div>
    <div style={{ fontSize: "0.7rem", color: "var(--d-muted)", marginTop: 4, fontWeight: 500 }}>{label}</div>
  </div>
);

const TagInput = ({ value = [], onChange, placeholder = "Ajouter...", color = "#d97706" }) => {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setInput("");
  };
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: value.length ? 10 : 0 }}>
        {value.map((t, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600,
            background: "#fffbeb", color, border: "1px solid #fde68a" }}>
            {t}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}
              style={{ background: "none", border: "none", cursor: "pointer",
                color, padding: 0, lineHeight: 1, fontSize: "0.7rem" }}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input className="dash-form-input" style={{ flex: 1 }} value={input} placeholder={placeholder}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <button type="button" onClick={add}
          style={{ padding: "0 14px", borderRadius: 8, border: `1.5px solid ${color}`,
            background: "transparent", color, fontFamily: "inherit",
            fontWeight: 700, cursor: "pointer", fontSize: "0.82rem" }}>
          + Ajouter
        </button>
      </div>
    </div>
  );
};

// ── Post feed ─────────────────────────────────────────────────────────────────
const PostFeed = ({ userId }) => {
  const [posts,    setPosts]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [content,  setContent]  = useState("");
  const [postType, setPostType] = useState("update");
  const [posting,  setPosting]  = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    profileService.getPosts("freelancer", userId)
      .then(d => setPosts(d.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try { await profileService.createPost({ content, postType }); setContent(""); setShowForm(false); load(); }
    catch {}
    finally { setPosting(false); }
  };

  const handleDelete = async (id) => {
    try { await profileService.deletePost(id); setPosts(p => p.filter(x => x._id !== id)); }
    catch {}
  };

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="card-header">
        <div className="section-head">
          <div>
            <div className="section-head-title">Publications</div>
            <div className="section-head-sub">Réalisations, mises à jour, annonces</div>
          </div>
          <button onClick={() => setShowForm(o => !o)}
            style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid #d97706",
              background: showForm ? "#d97706" : "transparent",
              color: showForm ? "#fff" : "#d97706",
              fontFamily: "inherit", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
            {showForm ? "Annuler" : "+ Publier"}
          </button>
        </div>
      </div>
      <div className="card-body">
        <AnimatePresence>
          {showForm && (
            <motion.form onSubmit={handlePost}
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 18 }}>
              <div style={{ padding: 16, borderRadius: 10,
                border: "1px solid var(--d-border)", background: "var(--d-bg)" }}>
                <select value={postType} onChange={e => setPostType(e.target.value)}
                  className="dash-form-input" style={{ marginBottom: 10, width: "auto" }}>
                  {Object.entries(POST_TYPE_META).map(([v, m]) => (
                    <option key={v} value={v}>{m.label}</option>
                  ))}
                </select>
                <textarea value={content} onChange={e => setContent(e.target.value)}
                  placeholder="Partagez une réalisation..." rows={3} required
                  className="dash-form-input"
                  style={{ resize: "vertical", display: "block", width: "100%", marginBottom: 10 }} />
                <button type="submit" disabled={posting || !content.trim()} className="section-cta-btn"
                  style={{ opacity: posting || !content.trim() ? 0.6 : 1, background: "#d97706",
                    borderColor: "#d97706" }}>
                  {posting ? "Publication..." : "Publier"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
        {loading ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div className="spinner" style={{ margin: "0 auto" }} />
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state" style={{ padding: "32px 0" }}>
            <div className="empty-state-icon" style={{ fontSize: "1.5rem" }}>◈</div>
            <div className="empty-state-title">Aucune publication</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <AnimatePresence>
              {posts.map((p, i) => {
                const meta = POST_TYPE_META[p.postType] || POST_TYPE_META.update;
                return (
                  <motion.div key={p._id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }} transition={{ delay: i * 0.04 }}
                    style={{ padding: "14px 16px", borderRadius: 10,
                      border: "1px solid var(--d-border-soft)",
                      borderLeft: `3px solid ${meta.color}`, background: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "flex-start", marginBottom: 8 }}>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: meta.color,
                        padding: "2px 8px", borderRadius: 10, background: meta.color + "18" }}>
                        {meta.label}
                      </span>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--d-muted)" }}>{relTime(p.createdAt)}</span>
                        <button onClick={() => handleDelete(p._id)}
                          style={{ background: "none", border: "none", cursor: "pointer",
                            color: "var(--d-muted)", fontSize: "0.8rem", padding: "2px 4px",
                            fontFamily: "inherit" }}>×</button>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.87rem", lineHeight: 1.6,
                      color: "var(--d-ink-soft)", whiteSpace: "pre-wrap" }}>
                      {p.content}
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ROOT
// ═════════════════════════════════════════════════════════════════════════════
const FreelancerProfile = () => {
  const { user } = useAuth();

  const [profile, setProfile]  = useState(null);
  const [loading, setLoading]  = useState(true);
  const [editing, setEditing]  = useState(false);
  const [saving,  setSaving]   = useState(false);
  const [error,   setError]    = useState("");
  const [saved,   setSaved]    = useState(false);

  const [form, setForm] = useState({
    bio: "", phone: "", skills: [], categories: [],
    followersCount: "", socialLinks: {},
    location: { city: "", region: "", country: "" },
  });

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    profileService.getProfile("freelancer", user._id)
      .then(d => {
        const p = d.profile;
        setProfile(p);
        setForm({
          bio:            p.bio            || "",
          phone:          p.phone          || "",
          skills:         p.skills         || [],
          categories:     p.categories     || [],
          followersCount: p.followersCount || "",
          socialLinks:    p.socialLinks    || {},
          location: {
            city:    p.location?.city    || "",
            region:  p.location?.region  || "",
            country: p.location?.country || "",
          },
        });
      })
      .catch(() => setError("Impossible de charger le profil"))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const set    = (field, val) => setForm(prev => ({ ...prev, [field]: val }));
  const setLoc = (field, val) =>
    setForm(prev => ({ ...prev, location: { ...prev.location, [field]: val } }));

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const result = await profileService.updateProfile(form);
      setProfile(result.profile);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally { setSaving(false); }
  };

  const handleCancel = () => {
    const p = profile;
    setForm({
      bio: p.bio || "", phone: p.phone || "",
      skills: p.skills || [], categories: p.categories || [],
      followersCount: p.followersCount || "",
      socialLinks: p.socialLinks || {},
      location: { city: p.location?.city || "", region: p.location?.region || "", country: p.location?.country || "" },
    });
    setEditing(false); setError("");
  };

  if (!user) return null;
  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
      <div className="spinner" />
    </div>
  );
  if (!profile) return (
    <div className="empty-state" style={{ padding: "60px 0" }}>
      <div className="empty-state-title">Profil introuvable</div>
    </div>
  );

  const displayName  = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  const locationStr  = [profile.location?.city, profile.location?.region, profile.location?.country].filter(Boolean).join(", ");
  const hasSocials   = profile.socialLinks && Object.values(profile.socialLinks).some(Boolean);
  const accentColor  = "#d97706";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

      {/* Header */}
      <div className="section-head" style={{ marginBottom: 20 }}>
        <div>
          <div className="section-head-title">Mon profil</div>
          <div className="section-head-sub">Votre profil public visible par les agences et clients</div>
        </div>
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div key="edit-btns" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }} style={{ display: "flex", gap: 8 }}>
              <button onClick={handleCancel} disabled={saving}
                style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid var(--d-border)",
                  background: "transparent", color: "var(--d-muted)",
                  fontFamily: "inherit", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving}
                className="section-cta-btn" style={{ opacity: saving ? 0.7 : 1 }}>
                {saving ? "Sauvegarde..." : "Enregistrer"}
              </button>
            </motion.div>
          ) : (
            <motion.button key="view-btn" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={() => setEditing(true)}
              style={{ padding: "8px 20px", borderRadius: 8, border: `1.5px solid ${accentColor}`,
                background: "transparent", color: accentColor, fontFamily: "inherit",
                fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>
              Modifier le profil
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {error && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 14,
            background: "#fff0f0", border: "1px solid #fca5a5", color: "#991b1b", fontSize: "0.82rem" }}>
          {error}
        </motion.div>}
        {saved && <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 14,
            background: "#f0fdf4", border: "1px solid #6ee7b7", color: "#065f46", fontSize: "0.82rem" }}>
          Profil mis à jour avec succès.
        </motion.div>}
      </AnimatePresence>

      {/* Hero card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
            <AvatarCircle src={profile.avatar} name={displayName} size={80} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "var(--d-ink)" }}>
                  {displayName || "—"}
                </h2>
                <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.7rem",
                  fontWeight: 700, background: "#fffbeb", color: accentColor }}>
                  Freelancer
                </span>
              </div>
              {!editing && profile.bio && (
                <p style={{ margin: "8px 0 0", fontSize: "0.875rem", color: "#555",
                  lineHeight: 1.65, maxWidth: 560 }}>{profile.bio}</p>
              )}
              {!editing && locationStr && (
                <div style={{ fontSize: "0.78rem", color: "var(--d-muted)", marginTop: 8 }}>
                  📍 {locationStr}
                </div>
              )}
              {!editing && hasSocials && (
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {Object.entries(profile.socialLinks).filter(([, v]) => v).map(([p, url]) => (
                    <a key={p} href={url} target="_blank" rel="noopener noreferrer"
                      style={{ padding: "4px 12px", borderRadius: 8, fontSize: "0.72rem",
                        fontWeight: 700, background: "#f3f4f6", color: "#555",
                        textDecoration: "none", border: "1px solid #e5e5e5",
                        textTransform: "capitalize" }}>
                      {p}
                    </a>
                  ))}
                </div>
              )}
              {!editing && (profile.skills?.length > 0 || profile.categories?.length > 0) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  {[...(profile.skills || []), ...(profile.categories || [])].slice(0, 10).map((s, i) => (
                    <span key={i} style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem",
                      fontWeight: 600, background: "#fffbeb", color: accentColor }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {editing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="dash-form-group">
                <label className="dash-form-label">Bio</label>
                <textarea className="dash-form-input" rows={3} value={form.bio}
                  onChange={e => set("bio", e.target.value)}
                  placeholder="Décrivez votre expertise..." style={{ resize: "vertical" }} />
              </div>
              <div className="dash-form-row">
                <div className="dash-form-group">
                  <label className="dash-form-label">Téléphone</label>
                  <input className="dash-form-input" value={form.phone}
                    onChange={e => set("phone", e.target.value)} placeholder="+213..." />
                </div>
                <div className="dash-form-group">
                  <label className="dash-form-label">Abonnés (réseaux)</label>
                  <input className="dash-form-input" type="number" value={form.followersCount}
                    onChange={e => set("followersCount", e.target.value)} placeholder="0" />
                </div>
              </div>
              <div className="dash-form-row">
                <div className="dash-form-group">
                  <label className="dash-form-label">Compétences</label>
                  <TagInput value={form.skills} onChange={v => set("skills", v)} color={accentColor} />
                </div>
                <div className="dash-form-group">
                  <label className="dash-form-label">Catégories</label>
                  <TagInput value={form.categories} onChange={v => set("categories", v)} color={accentColor} />
                </div>
              </div>
              <div className="dash-form-group">
                <label className="dash-form-label">Localisation</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[{ f: "city", p: "Ville" }, { f: "region", p: "Wilaya" }, { f: "country", p: "Pays" }].map(({ f, p }) => (
                    <input key={f} className="dash-form-input" style={{ flex: 1, minWidth: 100 }}
                      value={form.location[f]} placeholder={p}
                      onChange={e => setLoc(f, e.target.value)} />
                  ))}
                </div>
              </div>
              <div className="dash-form-group">
                <label className="dash-form-label">Liens sociaux</label>
                {SOCIAL_PLATFORMS.map(platform => (
                  <div key={platform} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ width: 90, fontSize: "0.78rem", color: "var(--d-muted)",
                      textTransform: "capitalize", flexShrink: 0 }}>{platform}</span>
                    <input className="dash-form-input" value={form.socialLinks?.[platform] || ""}
                      placeholder={`URL ${platform}`}
                      onChange={e => set("socialLinks", { ...form.socialLinks, [platform]: e.target.value })} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <div className="section-head-title" style={{ fontSize: "0.9rem" }}>Informations de contact</div>
            </div>
            <div className="card-body" style={{ paddingTop: 10 }}>
              <InfoRow label="Email"       value={profile.email}  icon="✉" />
              <InfoRow label="Téléphone"   value={profile.phone}  icon="☎" />
              <InfoRow label="Ville"       value={profile.location?.city} icon="📍" />
              <InfoRow label="Membre depuis" value={fmt(profile.createdAt)} icon="📅" />
            </div>
          </div>

          {/* Collaborations */}
          {profile.agencyCollaborations?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="section-head-title" style={{ fontSize: "0.9rem" }}>Collaborations agences</div>
              </div>
              <div className="card-body" style={{ padding: "0" }}>
                {[...profile.agencyCollaborations]
                  .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
                  .map((c, i) => {
                    const isActive = c.status === "active";
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12,
                        padding: "12px 18px",
                        borderBottom: "1px solid var(--d-border-soft)",
                        borderLeft: `3px solid ${isActive ? "#10b981" : "#9ca3af"}`,
                        opacity: isActive ? 1 : 0.65 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--d-ink)" }}>
                            {c.agencyName || "Agence"}
                          </div>
                          <div style={{ fontSize: "0.73rem", color: "var(--d-muted)", marginTop: 2 }}>
                            {c.role || "Collaborateur"} · {c.startDate
                              ? new Date(c.startDate).toLocaleDateString("fr-DZ", { month: "long", year: "numeric" })
                              : "—"}
                          </div>
                        </div>
                        <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: "0.69rem",
                          fontWeight: 700,
                          background: isActive ? "#d1fae5" : "#f3f4f6",
                          color: isActive ? "#065f46" : "#6b7280" }}>
                          {isActive ? "Active" : "Terminée"}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <div className="section-head-title" style={{ fontSize: "0.9rem" }}>Statistiques</div>
            </div>
            <div className="card-body" style={{ padding: "0 0 4px" }}>
              <div style={{ display: "flex", borderBottom: "1px solid var(--d-border-soft)" }}>
                <StatMini label="Abonnés" value={profile.followersCount?.toLocaleString() || 0}
                  color={accentColor} />
                <div style={{ width: 1, background: "var(--d-border-soft)", alignSelf: "stretch", margin: "10px 0" }} />
                <StatMini label="Offres envoyées" value={profile.pitchesSent?.length ?? 0} color="#7c3aed" />
              </div>
              <div style={{ padding: "10px 22px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%",
                  background: profile.isActive !== false ? "#10b981" : "#9ca3af" }} />
                <span style={{ fontSize: "0.78rem", color: "var(--d-muted)" }}>
                  Compte {profile.isActive !== false ? "actif" : "inactif"}
                  {profile.isVerified && " · Vérifié ✓"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PostFeed userId={user._id} />
    </motion.div>
  );
};

export default FreelancerProfile;
