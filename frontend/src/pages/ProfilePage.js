// frontend/src/pages/ProfilePage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import profileService from "../services/profileService";
import postService    from "../services/postService";
import useAuth from "../hooks/useAuth";

// ── Constants ─────────────────────────────────────────────────────────────────
const ROLE_META = {
  agency:       { label: "Agence",      color: "#7c3aed", bg: "#f3f0ff", gradient: "135deg, #7c3aed 0%, #5b21b6 100%" },
  team:         { label: "Équipe",      color: "#0891b2", bg: "#f0f9ff", gradient: "135deg, #0891b2 0%, #0369a1 100%" },
  freelancer:   { label: "Freelancer",  color: "#d97706", bg: "#fffbeb", gradient: "135deg, #d97706 0%, #b45309 100%" },
  client:       { label: "Client",      color: "#c0152a", bg: "#fff0f0", gradient: "135deg, #c0152a 0%, #9a0f21 100%" },
  agency_member:{ label: "Membre",      color: "#7c3aed", bg: "#f3f0ff", gradient: "135deg, #7c3aed 0%, #5b21b6 100%" },
};

const SOCIAL_ICONS = {
  instagram: "IG",
  tiktok:    "TK",
  youtube:   "YT",
  linkedin:  "LI",
  twitter:   "TW",
};

const POST_TYPE_META = {
  update:       { label: "Mise à jour",   color: "#0891b2", bg: "#f0f9ff" },
  achievement:  { label: "Réalisation",   color: "#059669", bg: "#f0fdf4" },
  campaign:     { label: "Campagne",      color: "#7c3aed", bg: "#f3f0ff" },
  announcement: { label: "Annonce",       color: "#d97706", bg: "#fffbeb" },
};

const COLLAB_STATUS_META = {
  active: { label: "Active",   color: "#065f46", bg: "#d1fae5" },
  ended:  { label: "Terminée", color: "#6b7280", bg: "#f3f4f6" },
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

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ src, name, size = 96, color = "#7c3aed" }) => {
  const initials = (name || "?").split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
  const style = {
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    border: "4px solid #fff",
    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
  };
  return src ? (
    <img src={src} alt={name} style={{ ...style, objectFit: "cover" }} />
  ) : (
    <div style={{ ...style, background: `linear-gradient(${color}, ${color}cc)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.34, fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>
      {initials}
    </div>
  );
};

// ── Stat ──────────────────────────────────────────────────────────────────────
const Stat = ({ label, value, color }) => (
  <div style={{ textAlign: "center", padding: "0 20px" }}>
    <div style={{ fontSize: "1.6rem", fontWeight: 800, color: color || "#1a1a1a", lineHeight: 1 }}>
      {value ?? "—"}
    </div>
    <div style={{ fontSize: "0.72rem", color: "#888", marginTop: 4, fontWeight: 500 }}>{label}</div>
  </div>
);

// ── Section card ──────────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{
    background: "#fff", borderRadius: 16,
    border: "1px solid #ebebeb",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    padding: "24px 28px",
    marginBottom: 16,
    ...style,
  }}>
    {children}
  </div>
);

const SectionTitle = ({ children }) => (
  <div style={{ fontWeight: 700, fontSize: "0.78rem", color: "#888",
    letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
    {children}
  </div>
);

// ── Portfolio grid ────────────────────────────────────────────────────────────
const PortfolioGrid = ({ items }) => {
  if (!items?.length) return null;
  return (
    <Card>
      <SectionTitle>Portfolio</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 14 }}>
        {items.map((item, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #f0f0f0",
              background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title}
                style={{ width: "100%", height: 130, objectFit: "cover" }} />
            ) : (
              <div style={{ height: 100, background: "linear-gradient(135deg,#f3f0ff,#e0e7ff)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.6rem", color: "#7c3aed" }}>◈</div>
            )}
            <div style={{ padding: "10px 12px 12px" }}>
              <div style={{ fontWeight: 700, fontSize: "0.84rem", color: "#1a1a1a" }}>{item.title}</div>
              {item.description && (
                <div style={{ fontSize: "0.74rem", color: "#888", marginTop: 3, lineHeight: 1.45 }}>
                  {item.description}
                </div>
              )}
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "0.7rem", color: "#7c3aed", marginTop: 6,
                    display: "inline-block", fontWeight: 600 }}>
                  Voir →
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

// ── Collaboration history (freelancer) ─────────────────────────────────────────
const CollaborationHistory = ({ collaborations }) => {
  if (!collaborations?.length) return null;
  const sorted = [...collaborations].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  return (
    <Card>
      <SectionTitle>Historique des collaborations</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map((c, i) => {
          const meta = COLLAB_STATUS_META[c.status] || COLLAB_STATUS_META.ended;
          return (
            <motion.div key={i}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px",
                borderRadius: 10, border: "1px solid #f0f0f0",
                borderLeft: `3px solid ${meta.color}`,
                opacity: c.status === "ended" ? 0.75 : 1 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1a1a1a" }}>
                  {c.agencyName || "Agence"}
                </div>
                <div style={{ fontSize: "0.73rem", color: "#888", marginTop: 2 }}>
                  {c.role || "Collaborateur"} · {c.startDate
                    ? new Date(c.startDate).toLocaleDateString("fr-DZ", { month: "long", year: "numeric" })
                    : "—"}
                  {c.endDate && <> → {new Date(c.endDate).toLocaleDateString("fr-DZ", { month: "long", year: "numeric" })}</>}
                </div>
              </div>
              <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.69rem",
                fontWeight: 700, background: meta.bg, color: meta.color, whiteSpace: "nowrap" }}>
                {meta.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};

// ── Post feed ─────────────────────────────────────────────────────────────────
const PostFeed = ({ role, id, isOwner, accentColor }) => {
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
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <SectionTitle>Publications</SectionTitle>
        {isOwner && (
          <button onClick={() => setShowForm(o => !o)}
            style={{ padding: "6px 14px", borderRadius: 8,
              border: `1.5px solid ${accentColor}`,
              background: showForm ? accentColor : "transparent",
              color: showForm ? "#fff" : accentColor,
              fontFamily: "inherit", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
              transition: "all 0.15s" }}>
            {showForm ? "Annuler" : "+ Publier"}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form onSubmit={handlePost}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 18 }}>
            <div style={{ padding: 16, borderRadius: 12, border: "1px solid #eee", background: "#fafafa" }}>
              <select value={postType} onChange={e => setPostType(e.target.value)}
                style={{ fontFamily: "inherit", fontSize: "0.78rem", padding: "6px 10px",
                  borderRadius: 7, border: "1px solid #ddd", marginBottom: 10,
                  background: "#fff", color: "#333", fontWeight: 600 }}>
                {Object.entries(POST_TYPE_META).map(([v, m]) => (
                  <option key={v} value={v}>{m.label}</option>
                ))}
              </select>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="Partagez une réalisation, une mise à jour..."
                rows={3} required
                style={{ width: "100%", fontFamily: "inherit", fontSize: "0.85rem",
                  borderRadius: 8, border: "1px solid #ddd", padding: "10px 12px",
                  resize: "vertical", boxSizing: "border-box", background: "#fff", lineHeight: 1.5 }} />
              <button type="submit" disabled={posting || !content.trim()}
                style={{ marginTop: 10, padding: "8px 18px", borderRadius: 8, border: "none",
                  background: accentColor, color: "#fff", fontFamily: "inherit", fontSize: "0.8rem",
                  fontWeight: 700, cursor: posting ? "not-allowed" : "pointer",
                  opacity: posting || !content.trim() ? 0.6 : 1 }}>
                {posting ? "Publication..." : "Publier →"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <div style={{ textAlign: "center", padding: "28px 0" }}>
          <div className="spinner" style={{ margin: "0 auto" }} />
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "28px 16px", color: "#bbb", fontSize: "0.85rem" }}>
          Aucune publication pour le moment.
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
                  style={{ padding: "14px 16px", borderRadius: 12,
                    border: "1px solid #f0f0f0", background: "#fafafa",
                    borderLeft: `3px solid ${meta.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: 700, color: meta.color,
                      padding: "2px 9px", borderRadius: 10, background: meta.bg }}>
                      {meta.label}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "0.7rem", color: "#bbb" }}>{relTime(p.createdAt)}</span>
                      {isOwner && (
                        <button onClick={() => handleDelete(p._id)}
                          style={{ background: "none", border: "none", cursor: "pointer",
                            color: "#ccc", fontSize: "0.8rem", padding: "2px 4px",
                            fontFamily: "inherit", lineHeight: 1 }}>
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.65, color: "#333",
                    whiteSpace: "pre-wrap" }}>
                    {p.content}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ROOT — ProfilePage
// ═════════════════════════════════════════════════════════════════════════════
const ProfilePage = () => {
  const { role, id } = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();

  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [showProposal, setShowProposal] = useState(false);
  const [propForm,     setPropForm]     = useState({ title: "", description: "", deadline: "" });
  const [propSaving,   setPropSaving]   = useState(false);
  const [propDone,     setPropDone]     = useState(false);

  useEffect(() => {
    setLoading(true);
    profileService.getProfile(role, id)
      .then(d => setProfile(d.profile))
      .catch(err => { if (err.response?.status === 404) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [role, id]);

  const handleSendProposal = async (e) => {
    e.preventDefault();
    if (!propForm.title.trim()) return;
    setPropSaving(true);
    try {
      const senderTypeMap = { agency: "Agency", team: "Team", freelancer: "Freelancer" };
      await postService.create({
        clientId:      id,
        title:         propForm.title,
        description:   propForm.description,
        deadline:      propForm.deadline || undefined,
        initiatorType: senderTypeMap[user.role],
        initiatorId:   user._id,
        initiatorName: user.agencyName || user.teamName || `${user.firstName} ${user.lastName}`,
      });
      setPropDone(true);
    } catch {}
    setPropSaving(false);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f5f4f2",
      display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div className="spinner" />
    </div>
  );

  if (notFound || !profile) return (
    <div style={{ minHeight: "100vh", background: "#f5f4f2",
      display: "flex", justifyContent: "center", alignItems: "center",
      flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: "2.5rem", color: "#ccc" }}>◎</div>
      <h2 style={{ color: "#333", fontWeight: 700, margin: 0 }}>Profil introuvable</h2>
      <button onClick={() => navigate(-1)}
        style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #ddd",
          background: "#fff", fontFamily: "inherit", cursor: "pointer", fontSize: "0.85rem" }}>
        ← Retour
      </button>
    </div>
  );

  // ── Derive display values ────────────────────────────────────────────────
  const meta        = ROLE_META[role] || ROLE_META.agency;
  const name        = profile.agencyName || profile.teamName
    || (profile.firstName ? `${profile.firstName} ${profile.lastName}` : null)
    || profile.companyName || "Profil";
  const avatarSrc   = profile.logo || profile.avatar || null;
  const bio         = profile.bio || "";
  const specialties = profile.specialties || profile.skills || profile.categories || [];
  const locationStr = profile.address?.region || profile.location?.region || "";
  const isOwner       = user && user._id === id && user.role === role;
  const isProvider    = ["agency", "team", "freelancer"].includes(user?.role);
  const isClientRole  = role === "client";
  const jobTitle      = role === "agency_member" && profile.jobTitle
    ? JOB_LABEL[profile.jobTitle] || profile.jobTitle
    : null;

  const hasSocialLinks = profile.socialLinks && Object.values(profile.socialLinks).some(Boolean);
  const hasStats = profile.completedProjects !== undefined
    || profile.membersCount !== undefined
    || profile.followersCount !== undefined;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f4f2" }}>
      {/* ── Cover banner ──────────────────────────────────────────────────── */}
      <div style={{ height: 180, background: `linear-gradient(${meta.gradient})`, position: "relative" }}>
        {/* Subtle pattern overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }} />
        {/* Back button */}
        <button onClick={() => navigate(-1)}
          style={{ position: "absolute", top: 20, left: 20,
            background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 8, padding: "6px 14px", color: "#fff", fontFamily: "inherit",
            fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", backdropFilter: "blur(4px)" }}>
          ← Retour
        </button>
        {/* Edit / actions — top-right on cover */}
        <div style={{ position: "absolute", top: 20, right: 20, display: "flex", gap: 8 }}>
          {isOwner && (
            <button onClick={() => navigate(`/profile/${role}/${id}/edit`)}
              style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 8, padding: "7px 16px", color: "#fff", fontFamily: "inherit",
                fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", backdropFilter: "blur(4px)" }}>
              Modifier le profil
            </button>
          )}
          {!isOwner && isProvider && isClientRole && (
            <button onClick={() => setShowProposal(true)}
              style={{ background: "#fff", border: "none", borderRadius: 8,
                padding: "7px 16px", color: meta.color, fontFamily: "inherit",
                fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              Envoyer une proposition
            </button>
          )}
        </div>
      </div>

      {/* ── Page content ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 16px 40px" }}>

        {/* ── Header card ─────────────────────────────────────────────────── */}
        <Card style={{ marginTop: -52, paddingTop: 16 }}>
          {/* Avatar row */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18, marginBottom: 14,
            flexWrap: "wrap" }}>
            <Avatar src={avatarSrc} name={name} size={88} color={meta.color} />
            <div style={{ flex: 1, minWidth: 180, paddingBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 800, color: "#111",
                  lineHeight: 1.2 }}>
                  {name}
                </h1>
                <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.7rem",
                  fontWeight: 700, background: meta.bg, color: meta.color, whiteSpace: "nowrap" }}>
                  {meta.label}
                </span>
              </div>
              {/* Sub-label: jobTitle for member, industry for client */}
              {jobTitle && (
                <div style={{ fontSize: "0.83rem", color: "#777", marginTop: 4, fontWeight: 500 }}>
                  {jobTitle}
                </div>
              )}
              {isClientRole && profile.industry && (
                <div style={{ fontSize: "0.83rem", color: meta.color, marginTop: 4, fontWeight: 600 }}>
                  {profile.industry}
                  {profile.fieldOfWork && <span style={{ color: "#888", fontWeight: 400 }}> · {profile.fieldOfWork}</span>}
                </div>
              )}
              {/* Location + website inline */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
                {locationStr && (
                  <span style={{ fontSize: "0.78rem", color: "#888" }}>📍 {locationStr}</span>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "0.78rem", color: meta.color, fontWeight: 600,
                      textDecoration: "none" }}>
                    🔗 {profile.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {bio && (
            <p style={{ margin: "0 0 16px", fontSize: "0.9rem", color: "#444", lineHeight: 1.7,
              paddingTop: 12, borderTop: "1px solid #f0f0f0" }}>
              {bio}
            </p>
          )}

          {/* Stats row */}
          {hasStats && (
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap",
              paddingTop: 16, borderTop: "1px solid #f0f0f0", gap: 0 }}>
              {profile.completedProjects !== undefined && (
                <>
                  <Stat label="Projets terminés" value={profile.completedProjects} color="#059669" />
                  <div style={{ width: 1, height: 36, background: "#eee" }} />
                </>
              )}
              {profile.membersCount !== undefined && (
                <>
                  <Stat label="Membres" value={profile.membersCount} color={meta.color} />
                  <div style={{ width: 1, height: 36, background: "#eee" }} />
                </>
              )}
              {profile.followersCount !== undefined && (
                <Stat label="Abonnés" value={profile.followersCount?.toLocaleString()} color="#d97706" />
              )}
            </div>
          )}

          {/* Specialty / skill tags */}
          {specialties.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6,
              marginTop: 14, paddingTop: 14, borderTop: "1px solid #f0f0f0" }}>
              {specialties.slice(0, 10).map((s, i) => (
                <span key={i} style={{ padding: "4px 12px", borderRadius: 20, fontSize: "0.72rem",
                  fontWeight: 600, background: meta.bg, color: meta.color,
                  border: `1px solid ${meta.color}22` }}>
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Social links */}
          {hasSocialLinks && (
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap",
              paddingTop: 14, borderTop: "1px solid #f0f0f0" }}>
              {Object.entries(profile.socialLinks)
                .filter(([, v]) => v)
                .map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 6,
                      padding: "5px 12px", borderRadius: 8, fontSize: "0.73rem",
                      fontWeight: 700, background: "#f3f4f6", color: "#555",
                      textDecoration: "none", border: "1px solid #e5e5e5",
                      transition: "all 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = meta.bg}
                    onMouseLeave={e => e.currentTarget.style.background = "#f3f4f6"}>
                    <span style={{ fontSize: "0.65rem", fontWeight: 800, color: meta.color }}>
                      {SOCIAL_ICONS[platform] || platform.slice(0, 2).toUpperCase()}
                    </span>
                    <span style={{ textTransform: "capitalize" }}>{platform}</span>
                  </a>
                ))}
            </div>
          )}
        </Card>

        {/* ── Client achievements ────────────────────────────────────────── */}
        {isClientRole && profile.achievements?.length > 0 && (
          <Card>
            <SectionTitle>Réalisations</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {profile.achievements.map((a, i) => (
                <span key={i} style={{ padding: "5px 14px", borderRadius: 20, fontSize: "0.78rem",
                  fontWeight: 600, background: "#fff0f0", color: "#c0152a",
                  border: "1px solid #fca5a580" }}>
                  {a}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* ── Portfolio ──────────────────────────────────────────────────── */}
        <PortfolioGrid items={profile.portfolioItems} />

        {/* ── Collab history (freelancer) ─────────────────────────────── */}
        {role === "freelancer" && profile.agencyCollaborations?.length > 0 && (
          <CollaborationHistory collaborations={profile.agencyCollaborations} />
        )}

        {/* ── Posts ─────────────────────────────────────────────────────── */}
        <PostFeed role={role} id={id} isOwner={isOwner} accentColor={meta.color} />
      </div>

      {/* ── Send proposal modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showProposal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
              zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={() => setShowProposal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: "#fff", borderRadius: 16, padding: "32px",
                width: "100%", maxWidth: 480, boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}
              onClick={e => e.stopPropagation()}>
              {propDone ? (
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f0fdf4",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 14px", fontSize: "1.4rem" }}>✓</div>
                  <div style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: 6 }}>
                    Proposition envoyée !
                  </div>
                  <div style={{ fontSize: "0.83rem", color: "#888", lineHeight: 1.5 }}>
                    Le client verra votre proposition dans son tableau de bord.
                  </div>
                  <button onClick={() => { setShowProposal(false); setPropDone(false);
                    setPropForm({ title: "", description: "", deadline: "" }); }}
                    style={{ marginTop: 20, padding: "9px 22px", borderRadius: 8, border: "none",
                      background: meta.color, color: "#fff", fontFamily: "inherit",
                      fontSize: "0.84rem", fontWeight: 700, cursor: "pointer" }}>
                    Fermer
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: 20,
                    color: "#111" }}>
                    Envoyer une proposition à {profile.firstName || profile.companyName}
                  </div>
                  <form onSubmit={handleSendProposal}>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: "0.76rem", fontWeight: 700, display: "block",
                        marginBottom: 5, color: "#555", textTransform: "uppercase",
                        letterSpacing: "0.04em" }}>Titre *</label>
                      <input className="dash-form-input" required value={propForm.title}
                        onChange={e => setPropForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="Ex: Stratégie de contenu Instagram" />
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: "0.76rem", fontWeight: 700, display: "block",
                        marginBottom: 5, color: "#555", textTransform: "uppercase",
                        letterSpacing: "0.04em" }}>Description</label>
                      <textarea className="dash-form-input" rows={3} value={propForm.description}
                        onChange={e => setPropForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="Décrivez votre offre..."
                        style={{ resize: "vertical", fontFamily: "inherit" }} />
                    </div>
                    <div style={{ marginBottom: 22 }}>
                      <label style={{ fontSize: "0.76rem", fontWeight: 700, display: "block",
                        marginBottom: 5, color: "#555", textTransform: "uppercase",
                        letterSpacing: "0.04em" }}>Date limite (optionnel)</label>
                      <input type="date" className="dash-form-input" value={propForm.deadline}
                        onChange={e => setPropForm(p => ({ ...p, deadline: e.target.value }))} />
                    </div>
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                      <button type="button" onClick={() => setShowProposal(false)}
                        style={{ padding: "9px 18px", borderRadius: 8,
                          border: "1.5px solid #e5e5e5", background: "transparent",
                          cursor: "pointer", fontFamily: "inherit",
                          fontSize: "0.83rem", fontWeight: 600, color: "#555" }}>
                        Annuler
                      </button>
                      <button type="submit" disabled={propSaving || !propForm.title.trim()}
                        style={{ padding: "9px 20px", borderRadius: 8, border: "none",
                          background: meta.color, color: "#fff", fontFamily: "inherit",
                          fontSize: "0.83rem", fontWeight: 700, cursor: "pointer",
                          opacity: propSaving || !propForm.title.trim() ? 0.6 : 1 }}>
                        {propSaving ? "Envoi..." : "Envoyer →"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
