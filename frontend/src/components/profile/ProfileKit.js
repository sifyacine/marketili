import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import profileService from "../../services/profileService";
import uploadService  from "../../services/uploadService";
import {
  IconX, IconPlus, IconMapPin, IconCalendar, IconFileText,
  IconMail, IconPhone, IconGlobe, IconCamera, IconLink,
  IconCheck, IconAward,
} from "../ui/Icons";

// ── Formatters ────────────────────────────────────────────────────────────────
export const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "long", year: "numeric" }) : "—";

export const relTime = (d) => {
  const diff  = Date.now() - new Date(d).getTime();
  const hours = Math.floor(diff / 3600000);
  const mins  = Math.floor(diff / 60000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60) return `il y a ${mins}min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days  <  7) return `il y a ${days}j`;
  return fmt(d);
};

// ── AvatarCircle ──────────────────────────────────────────────────────────────
export const AvatarCircle = ({ src, name, size = 88, accentColor = "#c0152a" }) => {
  const initials = (name || "?").split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
  const ring = {
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    border: "2.5px solid #fff",
    boxShadow: "0 0 0 1.5px var(--d-border), 0 3px 12px rgba(0,0,0,0.10)",
  };
  if (src) return (
    <div style={{ ...ring, overflow: "hidden" }}>
      <img src={uploadService.resolveUrl(src)} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
  return (
    <div style={{ ...ring, background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.32, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
      {initials}
    </div>
  );
};

// ── AvatarEditButton ──────────────────────────────────────────────────────────
export const AvatarEditBtn = ({ onClick, loading, accentColor }) => (
  <button type="button" onClick={onClick} disabled={loading}
    style={{
      position: "absolute", bottom: 1, right: 1, width: 28, height: 28,
      borderRadius: "50%", background: accentColor, border: "2.5px solid #fff",
      cursor: loading ? "default" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
      transition: "transform 0.15s",
    }}
    onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "scale(1.1)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
    {loading
      ? <div style={{ width: 10, height: 10, border: "1.5px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.65s linear infinite" }} />
      : <IconCamera size={12} />}
  </button>
);

// ── InfoGrid ──────────────────────────────────────────────────────────────────
// items: [{ icon, label, value }]
// Renders a 2-column grid separated by 1px gaps (the "gap" is the background color showing through)
export const InfoGrid = ({ items }) => {
  const cells = [...items];
  if (cells.length % 2 !== 0) cells.push({ icon: null, label: "", value: "" });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "var(--d-border-soft)", borderRadius: 8, overflow: "hidden" }}>
      {cells.map(({ icon, label, value }, i) => (
        <div key={i} style={{ background: "#fff", padding: "13px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
          {icon && (
            <div style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 7,
              background: "var(--d-bg)", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--d-muted)", marginTop: 1 }}>
              {icon}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.64rem", fontWeight: 700, color: "var(--d-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>
              {label}
            </div>
            <div style={{ fontSize: "0.83rem", color: value ? "var(--d-ink)" : "var(--d-muted)",
              fontWeight: value ? 500 : 400, wordBreak: "break-word", lineHeight: 1.35 }}>
              {value || (label ? "—" : "")}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── StatBar ───────────────────────────────────────────────────────────────────
// stats: [{ value, label, color }]
export const StatBar = ({ stats, isActive, isVerified }) => (
  <div style={{ display: "flex", alignItems: "stretch", borderTop: "1px solid var(--d-border-soft)" }}>
    {stats.map(({ value, label, color }, i) => (
      <React.Fragment key={i}>
        {i > 0 && <div style={{ width: 1, background: "var(--d-border-soft)", flexShrink: 0 }} />}
        <div style={{ flex: 1, padding: "12px 16px", textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color, letterSpacing: "-0.04em", lineHeight: 1 }}>
            {typeof value === "number" ? value.toLocaleString("fr") : (value ?? 0)}
          </div>
          <div style={{ fontSize: "0.66rem", color: "var(--d-muted)", fontWeight: 500, marginTop: 3 }}>{label}</div>
        </div>
      </React.Fragment>
    ))}
    <div style={{ width: 1, background: "var(--d-border-soft)", flexShrink: 0 }} />
    <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
        background: isActive !== false ? "#10b981" : "#9ca3af" }} />
      <span style={{ fontSize: "0.73rem", color: "var(--d-muted)", fontWeight: 500, whiteSpace: "nowrap" }}>
        {isActive !== false ? "Actif" : "Inactif"}
        {isVerified && (
          <span style={{ color: "#0891b2", marginLeft: 4 }}>
            · <IconCheck size={9} style={{ verticalAlign: "middle", strokeWidth: 2.5 }} /> Vérifié
          </span>
        )}
      </span>
    </div>
  </div>
);

// ── TagList ───────────────────────────────────────────────────────────────────
export const TagList = ({ tags = [], color = "var(--d-ink-soft)", bg = "var(--d-bg)" }) =>
  tags.length === 0 ? null : (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
      {tags.map((t, i) => (
        <span key={i} style={{ padding: "3px 9px", borderRadius: 20, fontSize: "0.72rem",
          fontWeight: 600, background: bg, color, border: "1px solid var(--d-border-soft)" }}>
          {t}
        </span>
      ))}
    </div>
  );

// ── TagInput ──────────────────────────────────────────────────────────────────
export const TagInput = ({ value = [], onChange, placeholder = "Ajouter...", accentColor = "var(--d-accent)" }) => {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setInput("");
  };
  return (
    <div>
      {value.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {value.map((t, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 3,
              padding: "4px 6px 4px 10px", borderRadius: 20, fontSize: "0.74rem", fontWeight: 600,
              background: "var(--d-bg)", color: "var(--d-ink-soft)", border: "1px solid var(--d-border)" }}>
              {t}
              <button type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                style={{ background: "none", border: "none", cursor: "pointer",
                  color: "var(--d-muted)", padding: "2px", lineHeight: 0, display: "flex", borderRadius: 4 }}
                onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--d-muted)"}>
                <IconX size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <input className="dash-form-input" style={{ flex: 1 }} value={input} placeholder={placeholder}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <button type="button" onClick={add}
          style={{ padding: "0 14px", borderRadius: 8, border: "1.5px solid var(--d-border)",
            background: "var(--d-bg)", color: "var(--d-ink-soft)", fontFamily: "inherit",
            fontWeight: 600, cursor: "pointer", fontSize: "0.82rem",
            display: "flex", alignItems: "center", gap: 5 }}>
          <IconPlus size={13} /> Ajouter
        </button>
      </div>
    </div>
  );
};

// ── SocialLinks ───────────────────────────────────────────────────────────────
export const SocialLinks = ({ links = {} }) => {
  const entries = Object.entries(links).filter(([, v]) => v);
  if (!entries.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {entries.map(([platform, url]) => (
        <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 7, fontSize: "0.72rem", fontWeight: 600,
            background: "var(--d-bg)", color: "var(--d-ink-soft)", textDecoration: "none",
            border: "1px solid var(--d-border)", textTransform: "capitalize",
            transition: "border-color 0.15s, color 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--d-accent)"; e.currentTarget.style.color = "var(--d-accent)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--d-border)"; e.currentTarget.style.color = "var(--d-ink-soft)"; }}>
          <IconLink size={11} />
          {platform}
        </a>
      ))}
    </div>
  );
};

// ── Banners ───────────────────────────────────────────────────────────────────
export const ErrorBanner = ({ message }) =>
  message ? (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 14,
        background: "#fff0f0", border: "1px solid #fca5a5", color: "#991b1b", fontSize: "0.82rem", fontWeight: 500 }}>
      {message}
    </motion.div>
  ) : null;

export const SuccessBanner = ({ show }) =>
  show ? (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 14,
        background: "#f0fdf4", border: "1px solid #6ee7b7", color: "#065f46",
        fontSize: "0.82rem", fontWeight: 500, display: "flex", alignItems: "center", gap: 7 }}>
      <IconCheck size={14} /> Profil mis à jour avec succès.
    </motion.div>
  ) : null;

// ── EditActions ───────────────────────────────────────────────────────────────
export const EditActions = ({ editing, saving, onEdit, onSave, onCancel, accentColor }) => (
  <AnimatePresence mode="wait">
    {editing ? (
      <motion.div key="edit-btns"
        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
        style={{ display: "flex", gap: 8 }}>
        <button onClick={onCancel} disabled={saving}
          style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid var(--d-border)",
            background: "transparent", color: "var(--d-muted)", fontFamily: "inherit",
            fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>
          Annuler
        </button>
        <button onClick={onSave} disabled={saving}
          style={{ display: "inline-flex", alignItems: "center", gap: 6,
            padding: "7px 18px", borderRadius: 8, border: "none",
            background: accentColor, color: "#fff", fontFamily: "inherit",
            fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Sauvegarde..." : <><IconCheck size={13} /> Enregistrer</>}
        </button>
      </motion.div>
    ) : (
      <motion.button key="view-btn"
        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
        onClick={onEdit}
        style={{ display: "inline-flex", alignItems: "center", gap: 7,
          padding: "7px 15px", borderRadius: 8, border: "1px solid var(--d-border)",
          background: "transparent", color: "var(--d-muted)", fontFamily: "inherit",
          fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
        </svg>
        Modifier
      </motion.button>
    )}
  </AnimatePresence>
);

// ── PostFeed ──────────────────────────────────────────────────────────────────
const POST_TYPE_META = {
  update:       { label: "Mise à jour",  color: "#0891b2" },
  achievement:  { label: "Réalisation",  color: "#059669" },
  campaign:     { label: "Campagne",     color: "#7c3aed" },
  announcement: { label: "Annonce",      color: "#d97706" },
};

export const PostFeed = ({ role, userId, accentColor = "var(--d-accent)" }) => {
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
    try {
      await profileService.createPost({ content, postType });
      setContent(""); setShowForm(false); load();
    } catch {}
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
            <div className="section-head-sub">Réalisations, campagnes et annonces</div>
          </div>
          <button onClick={() => setShowForm(o => !o)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 14px", borderRadius: 8,
              border: `1.5px solid ${showForm ? "var(--d-border)" : accentColor}`,
              background: showForm ? "var(--d-bg)" : "transparent",
              color: showForm ? "var(--d-muted)" : accentColor,
              fontFamily: "inherit", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
            {showForm ? <><IconX size={12} /> Annuler</> : <><IconPlus size={12} /> Publier</>}
          </button>
        </div>
      </div>

      <div className="card-body">
        <AnimatePresence>
          {showForm && (
            <motion.form onSubmit={handlePost}
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 18 }}>
              <div style={{ padding: 16, borderRadius: 10, border: "1px solid var(--d-border)", background: "var(--d-bg)" }}>
                <select value={postType} onChange={e => setPostType(e.target.value)}
                  className="dash-form-select" style={{ marginBottom: 10, width: "auto" }}>
                  {Object.entries(POST_TYPE_META).map(([v, m]) => (
                    <option key={v} value={v}>{m.label}</option>
                  ))}
                </select>
                <textarea value={content} onChange={e => setContent(e.target.value)}
                  placeholder="Partagez une réalisation..." rows={3} required
                  className="dash-form-input"
                  style={{ resize: "vertical", display: "block", width: "100%", marginBottom: 10 }} />
                <button type="submit" disabled={posting || !content.trim()}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "8px 18px", borderRadius: 8, border: "none",
                    background: accentColor, color: "#fff", fontFamily: "inherit",
                    fontSize: "0.83rem", fontWeight: 600, cursor: "pointer",
                    opacity: posting || !content.trim() ? 0.6 : 1 }}>
                  {posting ? "Publication..." : "Publier"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
            <div className="spinner" />
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state" style={{ padding: "32px 0" }}>
            <div className="empty-state-icon"><IconFileText size={20} /></div>
            <div className="empty-state-title">Aucune publication</div>
            <div className="empty-state-sub">Partagez votre première réalisation.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: "0.67rem", fontWeight: 700, color: meta.color,
                        padding: "2px 8px", borderRadius: 10, background: meta.color + "15",
                        letterSpacing: "0.01em" }}>
                        {meta.label}
                      </span>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--d-muted)" }}>{relTime(p.createdAt)}</span>
                        <button onClick={() => handleDelete(p._id)}
                          style={{ background: "none", border: "none", cursor: "pointer",
                            color: "var(--d-muted)", padding: "3px", lineHeight: 0, display: "flex", borderRadius: 5 }}
                          onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                          onMouseLeave={e => e.currentTarget.style.color = "var(--d-muted)"}>
                          <IconX size={14} />
                        </button>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.87rem", lineHeight: 1.65,
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
