import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import profileService from "../../../services/profileService";
import useAuth        from "../../../hooks/useAuth";

// ── Helpers ───────────────────────────────────────────────────────────────────
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

const JOB_LABEL = {
  creative_director:    "Directeur Créatif",
  art_director:         "Directeur Artistique",
  marketing_director:   "Directeur Marketing",
  strategist:           "Stratégiste",
  digital_manager:      "Digital Manager",
  project_manager:      "Chef de Projet",
  social_media_manager: "Social Media Manager",
  production_director:  "Directeur de Production",
  senior:               "Senior",
  junior:               "Junior",
  director:             "Directeur",
  commercial:           "Commercial",
};

// ── Sub-components ────────────────────────────────────────────────────────────
const AvatarCircle = ({ src, name, size = 72, color = "#7c3aed" }) => {
  const initials = (name || "?").split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
  if (src) return (
    <img src={src} alt={name}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover",
        flexShrink: 0, border: "3px solid var(--d-border-soft)" }} />
  );
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg, ${color}, ${color}bb)`,
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
    <div style={{ minWidth: 120, flexShrink: 0 }}>
      <span style={{ fontSize: "0.72rem", color: "var(--d-muted)", fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
    </div>
    <div style={{ flex: 1, fontSize: "0.875rem", color: value ? "var(--d-ink)" : "var(--d-muted)",
      fontWeight: value ? 500 : 400, wordBreak: "break-word" }}>
      {value || "—"}
    </div>
  </div>
);

const StatMini = ({ label, value, color = "var(--d-accent)" }) => (
  <div style={{ textAlign: "center", padding: "14px 10px", flex: 1 }}>
    <div style={{ fontSize: "1.6rem", fontWeight: 800, color, lineHeight: 1 }}>{value ?? "—"}</div>
    <div style={{ fontSize: "0.7rem", color: "var(--d-muted)", marginTop: 4, fontWeight: 500 }}>{label}</div>
  </div>
);

const TagInput = ({ value = [], onChange, placeholder = "Ajouter..." }) => {
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
            background: "#f3f0ff", color: "#7c3aed", border: "1px solid #ddd6fe" }}>
            {t}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}
              style={{ background: "none", border: "none", cursor: "pointer",
                color: "#7c3aed", padding: 0, lineHeight: 1, fontSize: "0.7rem" }}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input className="dash-form-input" style={{ flex: 1 }} value={input} placeholder={placeholder}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <button type="button" onClick={add}
          style={{ padding: "0 14px", borderRadius: 8, border: "1.5px solid #7c3aed",
            background: "transparent", color: "#7c3aed", fontFamily: "inherit",
            fontWeight: 700, cursor: "pointer", fontSize: "0.82rem" }}>
          + Ajouter
        </button>
      </div>
    </div>
  );
};

// ── Post feed ─────────────────────────────────────────────────────────────────
const PostFeed = ({ role, userId }) => {
  const [posts,    setPosts]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [content,  setContent]  = useState("");
  const [postType, setPostType] = useState("update");
  const [posting,  setPosting]  = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    profileService.getPosts(role, userId)
      .then(d => setPosts(d.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [role, userId]);

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
            <div className="section-head-sub">Mises à jour, réalisations et annonces</div>
          </div>
          <button onClick={() => setShowForm(o => !o)}
            style={{ padding: "7px 16px", borderRadius: 8,
              border: "1.5px solid #7c3aed",
              background: showForm ? "#7c3aed" : "transparent",
              color: showForm ? "#fff" : "#7c3aed",
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
                  placeholder="Partagez une réalisation, une campagne..."
                  rows={3} required className="dash-form-input"
                  style={{ resize: "vertical", display: "block", width: "100%", marginBottom: 10 }} />
                <button type="submit" disabled={posting || !content.trim()} className="section-cta-btn"
                  style={{ opacity: posting || !content.trim() ? 0.6 : 1 }}>
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
                            fontFamily: "inherit", lineHeight: 1 }}>×</button>
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
const AgencyProfile = () => {
  const { user } = useAuth();

  const [profile, setProfile]  = useState(null);
  const [loading, setLoading]  = useState(true);
  const [editing, setEditing]  = useState(false);
  const [saving,  setSaving]   = useState(false);
  const [error,   setError]    = useState("");
  const [saved,   setSaved]    = useState(false);

  const isDirector = user?.role === "agency";

  const [form, setForm] = useState({
    bio: "", phone: "", website: "", specialties: [], skills: [],
    address: { street: "", city: "", region: "", country: "", postalCode: "" },
  });

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    profileService.getProfile(user.role, user._id)
      .then(d => {
        const p = d.profile;
        setProfile(p);
        setForm({
          bio:        p.bio        || "",
          phone:      p.phone      || "",
          website:    p.website    || "",
          specialties: p.specialties || [],
          skills:     p.skills    || [],
          address: {
            street:     p.address?.street     || "",
            city:       p.address?.city       || "",
            region:     p.address?.region     || "",
            country:    p.address?.country    || "",
            postalCode: p.address?.postalCode || "",
          },
        });
      })
      .catch(() => setError("Impossible de charger le profil"))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const set    = (field, val) => setForm(prev => ({ ...prev, [field]: val }));
  const setAddr = (field, val) =>
    setForm(prev => ({ ...prev, address: { ...prev.address, [field]: val } }));

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
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const p = profile;
    setForm({
      bio: p.bio || "", phone: p.phone || "", website: p.website || "",
      specialties: p.specialties || [], skills: p.skills || [],
      address: {
        street: p.address?.street || "", city: p.address?.city || "",
        region: p.address?.region || "", country: p.address?.country || "",
        postalCode: p.address?.postalCode || "",
      },
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
      <div className="empty-state-icon">◎</div>
      <div className="empty-state-title">Profil introuvable</div>
    </div>
  );

  const displayName = isDirector
    ? (profile.agencyName || "Mon agence")
    : `${profile.firstName || ""} ${profile.lastName || ""}`.trim();

  const directorName = isDirector
    ? `${profile.directorFirstName || ""} ${profile.directorLastName || ""}`.trim()
    : null;

  const locationStr = [
    profile.address?.city, profile.address?.region, profile.address?.country,
  ].filter(Boolean).join(", ");

  const accentColor = "#7c3aed";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="section-head" style={{ marginBottom: 20 }}>
        <div>
          <div className="section-head-title">Mon profil</div>
          <div className="section-head-sub">
            {isDirector ? "Profil public de votre agence" : "Vos informations de membre"}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div key="edit-btns"
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              style={{ display: "flex", gap: 8 }}>
              <button onClick={handleCancel} disabled={saving}
                style={{ padding: "8px 18px", borderRadius: 8,
                  border: "1px solid var(--d-border)", background: "transparent",
                  color: "var(--d-muted)", fontFamily: "inherit",
                  fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving}
                className="section-cta-btn" style={{ opacity: saving ? 0.7 : 1 }}>
                {saving ? "Sauvegarde..." : "Enregistrer"}
              </button>
            </motion.div>
          ) : (
            <motion.button key="view-btn"
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              onClick={() => setEditing(true)}
              style={{ padding: "8px 20px", borderRadius: 8,
                border: `1.5px solid ${accentColor}`, background: "transparent",
                color: accentColor, fontFamily: "inherit",
                fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>
              Modifier le profil
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Banners */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 14,
              background: "#fff0f0", border: "1px solid #fca5a5", color: "#991b1b", fontSize: "0.82rem" }}>
            {error}
          </motion.div>
        )}
        {saved && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 14,
              background: "#f0fdf4", border: "1px solid #6ee7b7", color: "#065f46", fontSize: "0.82rem" }}>
            Profil mis à jour avec succès.
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero card ─────────────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
            <AvatarCircle
              src={profile.logo || profile.avatar}
              name={displayName}
              size={80}
              color={accentColor}
            />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "var(--d-ink)" }}>
                  {displayName || "—"}
                </h2>
                <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.7rem",
                  fontWeight: 700, background: "#f3f0ff", color: accentColor }}>
                  {isDirector ? "Agence" : (JOB_LABEL[profile.jobTitle] || "Membre")}
                </span>
              </div>

              {isDirector && directorName && !editing && (
                <div style={{ fontSize: "0.83rem", color: "var(--d-muted)", marginBottom: 6 }}>
                  Directeur : {directorName}
                </div>
              )}

              {!editing && profile.bio && (
                <p style={{ margin: "8px 0 0", fontSize: "0.875rem", color: "#555",
                  lineHeight: 1.65, maxWidth: 560 }}>
                  {profile.bio}
                </p>
              )}

              {!editing && locationStr && (
                <div style={{ fontSize: "0.78rem", color: "var(--d-muted)", marginTop: 8 }}>
                  📍 {locationStr}
                </div>
              )}

              {!editing && (profile.specialties?.length > 0 || profile.skills?.length > 0) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  {(profile.specialties || profile.skills || []).slice(0, 8).map((s, i) => (
                    <span key={i} style={{ padding: "3px 10px", borderRadius: 20,
                      fontSize: "0.72rem", fontWeight: 600,
                      background: "#f3f0ff", color: accentColor }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Edit mode */}
          {editing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="dash-form-group">
                <label className="dash-form-label">Bio</label>
                <textarea className="dash-form-input" rows={3} value={form.bio}
                  onChange={e => set("bio", e.target.value)}
                  placeholder={isDirector ? "Décrivez votre agence..." : "Décrivez votre rôle..."}
                  style={{ resize: "vertical" }} />
              </div>
              <div className="dash-form-row">
                <div className="dash-form-group">
                  <label className="dash-form-label">Téléphone</label>
                  <input className="dash-form-input" value={form.phone}
                    onChange={e => set("phone", e.target.value)} placeholder="+213..." />
                </div>
                {isDirector && (
                  <div className="dash-form-group">
                    <label className="dash-form-label">Site web</label>
                    <input className="dash-form-input" value={form.website}
                      onChange={e => set("website", e.target.value)} placeholder="https://..." />
                  </div>
                )}
              </div>
              <div className="dash-form-group">
                <label className="dash-form-label">
                  {isDirector ? "Spécialités" : "Compétences"}
                </label>
                <TagInput
                  value={isDirector ? form.specialties : form.skills}
                  onChange={v => set(isDirector ? "specialties" : "skills", v)}
                  placeholder="Ajouter..."
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Two-column ────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Contact */}
          <div className="card">
            <div className="card-header">
              <div className="section-head-title" style={{ fontSize: "0.9rem" }}>Informations de contact</div>
            </div>
            <div className="card-body" style={{ paddingTop: 10 }}>
              {editing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="dash-form-group" style={{ margin: 0 }}>
                    <label className="dash-form-label">Email <span style={{ fontWeight: 400, fontStyle: "italic", color: "var(--d-muted)" }}>(non modifiable)</span></label>
                    <input className="dash-form-input" value={profile.email} disabled
                      style={{ background: "var(--d-bg)", color: "var(--d-muted)", cursor: "not-allowed" }} />
                  </div>
                </div>
              ) : (
                <>
                  <InfoRow label="Email"        value={profile.email}   icon="✉" />
                  <InfoRow label="Téléphone"    value={profile.phone}   icon="☎" />
                  {isDirector && <InfoRow label="Site web" value={profile.website} icon="🔗" />}
                  {isDirector && <InfoRow label="N° entreprise" value={profile.businessNumber} icon="🏢" />}
                  <InfoRow label="Membre depuis" value={fmt(profile.createdAt)} icon="📅" />
                </>
              )}
            </div>
          </div>

          {/* Address (director only) */}
          {isDirector && (
            <div className="card">
              <div className="card-header">
                <div className="section-head-title" style={{ fontSize: "0.9rem" }}>Adresse</div>
              </div>
              <div className="card-body" style={{ paddingTop: 10 }}>
                {editing ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { field: "street", label: "Rue" },
                      { field: "city", label: "Ville" },
                      { field: "region", label: "Wilaya / Région" },
                      { field: "country", label: "Pays" },
                      { field: "postalCode", label: "Code postal" },
                    ].map(({ field, label }) => (
                      <div key={field} className="dash-form-group" style={{ margin: 0 }}>
                        <label className="dash-form-label">{label}</label>
                        <input className="dash-form-input" value={form.address[field]}
                          onChange={e => setAddr(field, e.target.value)} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <InfoRow label="Rue"       value={profile.address?.street}     icon="🏠" />
                    <InfoRow label="Ville"     value={profile.address?.city}       icon="🏙" />
                    <InfoRow label="Wilaya"    value={profile.address?.region}     icon="📌" />
                    <InfoRow label="Pays"      value={profile.address?.country}    icon="🌍" />
                    <InfoRow label="Code postal" value={profile.address?.postalCode} icon="📮" />
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column: stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <div className="section-head-title" style={{ fontSize: "0.9rem" }}>Statistiques</div>
            </div>
            <div className="card-body" style={{ padding: "0 0 4px" }}>
              <div style={{ display: "flex", borderBottom: "1px solid var(--d-border-soft)" }}>
                {isDirector ? (
                  <>
                    <StatMini label="Projets terminés" value={profile.completedProjects ?? 0}
                      color={accentColor} />
                    <div style={{ width: 1, background: "var(--d-border-soft)", alignSelf: "stretch", margin: "10px 0" }} />
                    <StatMini label="Membres" value={profile.membersCount ?? 0}
                      color="#0891b2" />
                  </>
                ) : (
                  <StatMini label="Projets assignés" value={profile.assignedProjects?.length ?? 0}
                    color={accentColor} />
                )}
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

          {/* Agency type (director) */}
          {isDirector && (
            <div className="card">
              <div className="card-header">
                <div className="section-head-title" style={{ fontSize: "0.9rem" }}>Informations agence</div>
              </div>
              <div className="card-body" style={{ paddingTop: 10 }}>
                <InfoRow label="Type"
                  value={profile.agencyType === "filiale" ? "Filiale" : "Agence principale"} icon="🏛" />
                {profile.parentAgencyName && (
                  <InfoRow label="Agence mère" value={profile.parentAgencyName} icon="🔗" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Publications ──────────────────────────────────────────────────── */}
      <PostFeed role={user.role} userId={user._id} />

    </motion.div>
  );
};

export default AgencyProfile;
