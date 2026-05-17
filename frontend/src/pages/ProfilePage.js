// frontend/src/pages/ProfilePage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import profileService from "../services/profileService";
import postService    from "../services/postService";
import useAuth from "../hooks/useAuth";

// ── Helpers ───────────────────────────────────────────────────────────────────
const POST_TYPE_META = {
  update:       { label: "Mise à jour",   color: "#0891b2" },
  achievement:  { label: "Réalisation",   color: "#059669" },
  campaign:     { label: "Campagne",      color: "#7c3aed" },
  announcement: { label: "Annonce",       color: "#d97706" },
};

const fmt = (d) =>
  new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "long", year: "numeric" });

const relTime = (d) => {
  const diff  = Date.now() - new Date(d).getTime();
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const mins  = Math.floor(diff / 60000);
  if (mins < 60)  return `il y a ${mins} min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days < 7)   return `il y a ${days}j`;
  return fmt(d);
};

// ── Avatar placeholder ────────────────────────────────────────────────────────
const AvatarCircle = ({ src, name, size = 80, color = "#7c3aed" }) => {
  const initials = (name || "?").split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
  return src ? (
    <img src={src} alt={name}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg, ${color}, ${color}aa)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 800, color: "#fff" }}>
      {initials}
    </div>
  );
};

// ── Stat chip ─────────────────────────────────────────────────────────────────
const StatChip = ({ label, value, color = "var(--d-ink)" }) => (
  <div style={{ padding: "10px 18px", borderRadius: 12, background: "#f8f8f8",
    border: "1px solid #eee", textAlign: "center", minWidth: 90 }}>
    <div style={{ fontWeight: 800, fontSize: "1.4rem", color }}>{value ?? "—"}</div>
    <div style={{ fontSize: "0.72rem", color: "#888", marginTop: 2 }}>{label}</div>
  </div>
);

// ── Portfolio grid ────────────────────────────────────────────────────────────
const PortfolioGrid = ({ items }) => {
  if (!items?.length) return null;
  return (
    <div style={{ marginTop: 28 }}>
      <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 14 }}>Portfolio</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
        {items.map((item, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #eee",
              background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.title}
                style={{ width: "100%", height: 140, objectFit: "cover" }} />
            )}
            {!item.imageUrl && (
              <div style={{ height: 100, background: "linear-gradient(135deg,#f3f0ff,#e0e7ff)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2rem", color: "#7c3aed" }}>◈</div>
            )}
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{item.title}</div>
              {item.description && (
                <div style={{ fontSize: "0.75rem", color: "#888", marginTop: 3, lineHeight: 1.4 }}>
                  {item.description}
                </div>
              )}
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "0.7rem", color: "#7c3aed", marginTop: 5, display: "inline-block" }}>
                  Voir →
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ── Collaboration history (freelancer only) ───────────────────────────────────
const COLLAB_STATUS_META = {
  active: { label: "Active",   color: "#065f46", bg: "#d1fae5" },
  ended:  { label: "Terminée", color: "#6b7280", bg: "#f3f4f6" },
};

const CollaborationHistory = ({ collaborations }) => {
  if (!collaborations?.length) return null;
  const sorted = [...collaborations].sort(
    (a, b) => new Date(b.startDate) - new Date(a.startDate)
  );
  return (
    <div style={{ marginTop: 28 }}>
      <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 14 }}>
        Historique des collaborations
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map((c, i) => {
          const meta = COLLAB_STATUS_META[c.status] || COLLAB_STATUS_META.ended;
          return (
            <motion.div key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ display: "flex", alignItems: "center", gap: 14,
                padding: "12px 16px", borderRadius: 12,
                border: "1px solid #eee", background: "#fff",
                borderLeft: `3px solid ${meta.color}`,
                opacity: c.status === "ended" ? 0.72 : 1 }}>
              {/* Timeline dot */}
              <div style={{ width: 10, height: 10, borderRadius: "50%",
                background: meta.color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1a1a1a" }}>
                  {c.agencyName || "Agence"}
                </div>
                <div style={{ fontSize: "0.73rem", color: "#888", marginTop: 2 }}>
                  {c.role || "Collaborateur"} · Depuis {c.startDate
                    ? new Date(c.startDate).toLocaleDateString("fr-DZ", { month: "long", year: "numeric" })
                    : "—"}
                  {c.endDate && (
                    <> · Fin {new Date(c.endDate).toLocaleDateString("fr-DZ", { month: "long", year: "numeric" })}</>
                  )}
                </div>
                {c.endReason && (
                  <div style={{ fontSize: "0.7rem", color: "#aaa", marginTop: 3,
                    fontStyle: "italic" }}>
                    Motif : {c.endReason}
                  </div>
                )}
              </div>
              <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.7rem",
                fontWeight: 700, background: meta.bg, color: meta.color, whiteSpace: "nowrap" }}>
                {meta.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ── Post feed ─────────────────────────────────────────────────────────────────
const PostFeed = ({ role, id, isOwner }) => {
  const [posts,    setPosts]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [content,  setContent]  = useState("");
  const [postType, setPostType] = useState("update");
  const [posting,  setPosting]  = useState(false);

  const load = () => {
    setLoading(true);
    profileService.getPosts(role, id)
      .then(d => setPosts(d.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [role, id]); // eslint-disable-line

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      await profileService.createPost({ content, postType });
      setContent(""); setShowForm(false);
      load();
    } catch {}
    finally { setPosting(false); }
  };

  const handleDelete = async (postId) => {
    try {
      await profileService.deletePost(postId);
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch {}
  };

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: 0 }}>Publications</h3>
        {isOwner && (
          <button onClick={() => setShowForm(o => !o)}
            style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid #7c3aed",
              background: showForm ? "#7c3aed" : "transparent", color: showForm ? "#fff" : "#7c3aed",
              fontFamily: "inherit", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
            {showForm ? "Annuler" : "+ Publier"}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form onSubmit={handlePost}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 16 }}>
            <div style={{ padding: 16, borderRadius: 12, border: "1px solid #eee", background: "#fafafa" }}>
              <select value={postType} onChange={e => setPostType(e.target.value)}
                style={{ fontFamily: "inherit", fontSize: "0.78rem", padding: "5px 10px",
                  borderRadius: 7, border: "1px solid #ddd", marginBottom: 10,
                  background: "#fff", color: "#333" }}>
                {Object.entries(POST_TYPE_META).map(([v, m]) => (
                  <option key={v} value={v}>{m.label}</option>
                ))}
              </select>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="Partagez une réalisation, une mise à jour..."
                rows={3} required
                style={{ width: "100%", fontFamily: "inherit", fontSize: "0.85rem",
                  borderRadius: 8, border: "1px solid #ddd", padding: "8px 12px",
                  resize: "vertical", boxSizing: "border-box", background: "#fff" }} />
              <button type="submit" disabled={posting || !content.trim()}
                style={{ marginTop: 8, padding: "7px 16px", borderRadius: 8, border: "none",
                  background: "#7c3aed", color: "#fff", fontFamily: "inherit", fontSize: "0.8rem",
                  fontWeight: 700, cursor: posting ? "not-allowed" : "pointer",
                  opacity: posting || !content.trim() ? 0.6 : 1 }}>
                {posting ? "Publication..." : "Publier"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <div style={{ textAlign: "center", padding: 32, color: "#aaa" }}>Chargement...</div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 16px", color: "#aaa", fontSize: "0.85rem" }}>
          Aucune publication pour le moment.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <AnimatePresence>
            {posts.map((p, i) => {
              const meta = POST_TYPE_META[p.postType] || POST_TYPE_META.update;
              return (
                <motion.div key={p._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid #eee",
                    background: "#fff", borderLeft: `3px solid ${meta.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: 700,
                      color: meta.color, padding: "2px 8px", borderRadius: 10,
                      background: meta.color + "18" }}>
                      {meta.label}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: "0.7rem", color: "#aaa" }}>{relTime(p.createdAt)}</span>
                      {isOwner && (
                        <button onClick={() => handleDelete(p._id)}
                          style={{ background: "none", border: "none", cursor: "pointer",
                            color: "#aaa", fontSize: "0.75rem", padding: "2px 4px", fontFamily: "inherit" }}>
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <p style={{ margin: "10px 0 0", fontSize: "0.88rem", lineHeight: 1.6, color: "#333",
                    whiteSpace: "pre-wrap" }}>
                    {p.content}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ROOT — ProfilePage
// ═════════════════════════════════════════════════════════════════════════════
const ProfilePage = () => {
  const { role, id } = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    profileService.getProfile(role, id)
      .then(d => setProfile(d.profile))
      .catch(err => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [role, id]);

  const isOwner       = user && user._id === id && user.role === role;
  const isProvider    = ["agency", "team", "freelancer"].includes(user?.role);
  const isClientProfil = role === "client";
  const [showProposal, setShowProposal] = useState(false);
  const [propForm,     setPropForm]     = useState({ title: "", description: "", deadline: "" });
  const [propSaving,   setPropSaving]   = useState(false);
  const [propDone,     setPropDone]     = useState(false);

  const handleSendProposal = async (e) => {
    e.preventDefault();
    if (!propForm.title.trim()) return;
    setPropSaving(true);
    try {
      const senderTypeMap = { agency: "Agency", team: "Team", freelancer: "Freelancer" };
      await postService.create({
        clientId:     id,
        title:        propForm.title,
        description:  propForm.description,
        deadline:     propForm.deadline || undefined,
        initiatorType: senderTypeMap[user.role],
        initiatorId:   user._id,
        initiatorName: user.agencyName || user.teamName || `${user.firstName} ${user.lastName}`,
      });
      setPropDone(true);
    } catch {}
    setPropSaving(false);
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center",
      minHeight: "60vh" }}>
      <div className="spinner" />
    </div>
  );

  if (notFound || !profile) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center",
      minHeight: "60vh", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: "2rem", color: "#ccc" }}>◎</div>
      <h2 style={{ color: "#333", fontWeight: 700 }}>Profil introuvable</h2>
      <button onClick={() => navigate(-1)}
        style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #ddd",
          background: "#fff", fontFamily: "inherit", cursor: "pointer", fontSize: "0.85rem" }}>
        Retour
      </button>
    </div>
  );

  // Derive display fields from role
  const name = profile.agencyName || profile.teamName ||
    (profile.firstName ? `${profile.firstName} ${profile.lastName}` : null) ||
    profile.companyName || "Profil";
  const avatarSrc  = profile.logo || profile.avatar || null;
  const bio        = profile.bio || "";
  const specialties = profile.specialties || profile.skills || profile.categories || [];
  const location   = profile.address?.city || profile.location?.city || null;
  const region     = profile.address?.region || profile.location?.region || null;
  const locationStr = [location, region].filter(Boolean).join(", ");

  const roleColor = {
    agency:     "#7c3aed",
    team:       "#0891b2",
    freelancer: "#d97706",
    client:     "#c0152a",
  }[role] || "#6b7280";

  const roleLabel = {
    agency:     "Agence",
    team:       "Équipe",
    freelancer: "Freelancer",
    client:     "Client",
  }[role] || role;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 780, margin: "0 auto", padding: "24px 16px" }}>

      {/* Back button */}
      <button onClick={() => navigate(-1)}
        style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
          fontSize: "0.8rem", color: "#888", marginBottom: 20, padding: 0, display: "flex",
          alignItems: "center", gap: 4 }}>
        ← Retour
      </button>

      {/* Header card */}
      <div style={{ borderRadius: 16, border: "1px solid #eee", background: "#fff",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)", padding: "28px 28px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <AvatarCircle src={avatarSrc} name={name} size={80} color={roleColor} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "#1a1a1a" }}>
                {name}
              </h1>
              <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: "0.72rem",
                fontWeight: 700, background: roleColor + "15", color: roleColor }}>
                {roleLabel}
              </span>
            </div>
            {locationStr && (
              <div style={{ fontSize: "0.8rem", color: "#888", marginTop: 4 }}>
                {locationStr}
              </div>
            )}
            {bio && (
              <p style={{ fontSize: "0.88rem", color: "#555", marginTop: 10, lineHeight: 1.6,
                maxWidth: 520 }}>
                {bio}
              </p>
            )}
            {/* Specialty tags */}
            {specialties.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                {specialties.slice(0, 8).map((s, i) => (
                  <span key={i} style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.7rem",
                    fontWeight: 600, background: "#f3f0ff", color: "#7c3aed", border: "1px solid #e9e4ff" }}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Send proposal — provider viewing client profile */}
          {!isOwner && isProvider && isClientProfil && (
            <button onClick={() => setShowProposal(true)}
              style={{ padding: "8px 16px", borderRadius: 9, border: "1.5px solid #c0152a",
                background: "#c0152a", color: "#fff", fontFamily: "inherit", fontSize: "0.8rem",
                fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
              Envoyer une proposition
            </button>
          )}

          {/* Edit button for owner */}
          {isOwner && (
            <button onClick={() => navigate(`/profile/${role}/${id}/edit`)}
              style={{ padding: "8px 16px", borderRadius: 9, border: "1.5px solid #7c3aed",
                background: "#fff", color: "#7c3aed", fontFamily: "inherit", fontSize: "0.8rem",
                fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
              Modifier le profil
            </button>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
          {profile.completedProjects !== undefined && (
            <StatChip label="Projets terminés" value={profile.completedProjects} color="#059669" />
          )}
          {profile.membersCount !== undefined && (
            <StatChip label="Membres" value={profile.membersCount} color={roleColor} />
          )}
          {profile.followersCount !== undefined && (
            <StatChip label="Abonnés" value={profile.followersCount?.toLocaleString()} color="#d97706" />
          )}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer"
              style={{ alignSelf: "center", fontSize: "0.78rem", color: "#7c3aed",
                textDecoration: "none", fontWeight: 600 }}>
              {profile.website}
            </a>
          )}
        </div>

        {/* Social links (freelancer) */}
        {profile.socialLinks && Object.values(profile.socialLinks).some(Boolean) && (
          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            {Object.entries(profile.socialLinks)
              .filter(([, v]) => v)
              .map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                  style={{ padding: "4px 12px", borderRadius: 20, fontSize: "0.72rem",
                    fontWeight: 600, background: "#f3f4f6", color: "#555",
                    textDecoration: "none", textTransform: "capitalize" }}>
                  {platform}
                </a>
              ))}
          </div>
        )}
      </div>

      {/* Portfolio */}
      {(profile.portfolioItems?.length > 0) && (
        <div style={{ borderRadius: 16, border: "1px solid #eee", background: "#fff",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)", padding: "24px 28px", marginBottom: 20 }}>
          <PortfolioGrid items={profile.portfolioItems} />
        </div>
      )}

      {/* Collaboration history — freelancer only */}
      {role === "freelancer" && profile.agencyCollaborations?.length > 0 && (
        <div style={{ borderRadius: 16, border: "1px solid #eee", background: "#fff",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)", padding: "24px 28px", marginBottom: 20 }}>
          <CollaborationHistory collaborations={profile.agencyCollaborations} />
        </div>
      )}

      {/* Proposal modal */}
      {showProposal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center",
          padding: 16 }} onClick={() => setShowProposal(false)}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "28px 28px 24px",
            width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}
            onClick={e => e.stopPropagation()}>
            {propDone ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>✅</div>
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>Proposition envoyée !</div>
                <div style={{ fontSize: "0.82rem", color: "#888", marginTop: 6 }}>
                  Le client a été notifié et verra votre proposition dans son tableau de bord.
                </div>
                <button onClick={() => { setShowProposal(false); setPropDone(false); setPropForm({ title: "", description: "", deadline: "" }); }}
                  className="section-cta-btn" style={{ marginTop: 18 }}>
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <div style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: 16 }}>
                  Envoyer une proposition à {profile.firstName || profile.companyName}
                </div>
                <form onSubmit={handleSendProposal}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: 4 }}>
                      Titre *
                    </label>
                    <input className="dash-form-input" required
                      value={propForm.title}
                      onChange={e => setPropForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="Ex: Stratégie de contenu Instagram" />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: 4 }}>
                      Description
                    </label>
                    <textarea className="dash-form-input"
                      rows={3}
                      value={propForm.description}
                      onChange={e => setPropForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="Décrivez votre offre et ce que vous proposez..."
                      style={{ resize: "vertical", fontFamily: "inherit" }} />
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", marginBottom: 4 }}>
                      Date limite (optionnel)
                    </label>
                    <input type="date" className="dash-form-input"
                      value={propForm.deadline}
                      onChange={e => setPropForm(p => ({ ...p, deadline: e.target.value }))} />
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button type="button" onClick={() => setShowProposal(false)}
                      style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #ddd",
                        background: "transparent", cursor: "pointer", fontFamily: "inherit",
                        fontSize: "0.82rem", fontWeight: 600 }}>
                      Annuler
                    </button>
                    <button type="submit" disabled={propSaving || !propForm.title.trim()}
                      className="section-cta-btn">
                      {propSaving ? "Envoi..." : "Envoyer la proposition"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Achievements — client only */}
      {role === "client" && profile.achievements?.length > 0 && (
        <div style={{ borderRadius: 16, border: "1px solid #eee", background: "#fff",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)", padding: "24px 28px", marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 14, color: "#1a1a1a" }}>
            Réalisations
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {profile.achievements.map((a, i) => (
              <span key={i} style={{ padding: "5px 14px", borderRadius: 20, fontSize: "0.78rem",
                fontWeight: 600, background: "#fff5f5", color: "#c0152a",
                border: "1px solid #fca5a5" }}>
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Social posts */}
      <div style={{ borderRadius: 16, border: "1px solid #eee", background: "#fff",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)", padding: "24px 28px" }}>
        <PostFeed role={role} id={id} isOwner={isOwner} />
      </div>
    </motion.div>
  );
};

export default ProfilePage;
