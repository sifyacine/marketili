
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import profileService from "../services/profileService";
import postService    from "../services/postService";
import chatService    from "../services/chatService";
import uploadService  from "../services/uploadService";
import useAuth        from "../hooks/useAuth";

const ROLE_META = {
  agency:       { label: "Agence",     color: "#7c3aed", bg: "#f3f0ff", gradient: "135deg, #6d28d9 0%, #4c1d95 100%" },
  team:         { label: "Équipe",     color: "#0891b2", bg: "#f0f9ff", gradient: "135deg, #0891b2 0%, #164e63 100%" },
  freelancer:   { label: "Freelancer", color: "#c0152a", bg: "#fff0f0", gradient: "135deg, #c0152a 0%, #7f1d1d 100%" },
  client:       { label: "Client",     color: "#c0152a", bg: "#fff0f0", gradient: "135deg, #c0152a 0%, #7f1d1d 100%" },
  agency_member:{ label: "Membre",     color: "#7c3aed", bg: "#f3f0ff", gradient: "135deg, #6d28d9 0%, #4c1d95 100%" },
};

const SOCIAL_ICONS = {
  instagram: "📸", tiktok: "🎵", youtube: "▶️",
  linkedin: "💼",  twitter: "🐦", facebook: "📘",
};

const POST_TYPE_META = {
  update:       { label: "Mise à jour", color: "#0891b2", bg: "#f0f9ff" },
  achievement:  { label: "Réalisation", color: "#059669", bg: "#f0fdf4" },
  campaign:     { label: "Campagne",    color: "#7c3aed", bg: "#f3f0ff" },
  announcement: { label: "Annonce",     color: "#d97706", bg: "#fffbeb" },
};

const COLLAB_STATUS_META = {
  active: { label: "Active",   color: "#059669", bg: "#dcfce7" },
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
  senior: "Senior", junior: "Junior",
  director: "Directeur", commercial: "Commercial",
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

const Avatar = ({ src, name, size = 96, color = "#7c3aed" }) => {
  const initials = (name || "?").split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
  const base = {
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
    border: "3px solid rgba(255,255,255,0.9)",
  };
  return src ? (
    <img src={uploadService.resolveUrl(src)} alt={name} style={{ ...base, objectFit: "cover" }} />
  ) : (
    <div style={{ ...base, background: `linear-gradient(135deg, ${color}, ${color}aa)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.33, fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>
      {initials}
    </div>
  );
};

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

  useEffect(() => { load(); }, [role, id]);

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
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #ebebeb",
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)", padding: "22px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontWeight: 700, fontSize: "0.78rem", color: "#888",
          letterSpacing: "0.08em", textTransform: "uppercase" }}>Publications</div>
        {isOwner && (
          <button onClick={() => setShowForm(o => !o)}
            style={{ padding: "6px 14px", borderRadius: 8,
              border: `1.5px solid ${accentColor}`,
              background: showForm ? accentColor : "transparent",
              color: showForm ? "#fff" : accentColor,
              fontFamily: "inherit", fontSize: "0.78rem", fontWeight: 600,
              cursor: "pointer", transition: "all 0.15s" }}>
            {showForm ? "Annuler" : "+ Publier"}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form onSubmit={handlePost}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", marginBottom: 18 }}>
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
                {posting ? "Publication..." : "Publier"}
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
              const m = POST_TYPE_META[p.postType] || POST_TYPE_META.update;
              return (
                <motion.div key={p._id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }} transition={{ delay: i * 0.04 }}
                  style={{ padding: "14px 16px", borderRadius: 12,
                    border: "1px solid #f0f0f0", background: "#fafafa",
                    borderLeft: `3px solid ${m.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: 700, color: m.color,
                      padding: "2px 9px", borderRadius: 10, background: m.bg }}>
                      {m.label}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "0.7rem", color: "#bbb" }}>{relTime(p.createdAt)}</span>
                      {isOwner && (
                        <button onClick={() => handleDelete(p._id)}
                          style={{ background: "none", border: "none", cursor: "pointer",
                            color: "#ccc", fontSize: "0.8rem", padding: "2px 4px",
                            fontFamily: "inherit", lineHeight: 1 }}>✕</button>
                      )}
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.65, color: "#333",
                    whiteSpace: "pre-wrap" }}>{p.content}</p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

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

  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgError,   setMsgError]   = useState("");

  const ROLE_TO_DASHBOARD = {
    client: "/dashboard/client/messages",
    agency: "/dashboard/agency/messages",
    agency_member: "/dashboard/agency/messages",
    team: "/dashboard/team/messages",
    team_member: "/dashboard/team/messages",
    freelancer: "/dashboard/freelancer/messages",
  };

  const handleSendMessage = async () => {
    if (!user || sendingMsg) return;
    setSendingMsg(true); setMsgError("");
    try {
      const data = await chatService.startDirectConversation(id, role);
      const convId = data?.conversation?._id;
      if (!convId) throw new Error("Conversation introuvable");
      const dashPath = ROLE_TO_DASHBOARD[user.role] || "/dashboard/client/messages";
      navigate(dashPath, { state: { openConvId: convId } });
    } catch (err) {
      setMsgError(err.response?.data?.message || "Impossible d'ouvrir la conversation. Réessayez.");
    } finally { setSendingMsg(false); }
  };

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
    <div style={{ minHeight: "100vh", background: "#f4f4f0",
      display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div className="spinner" />
    </div>
  );

  if (notFound || !profile) return (
    <div style={{ minHeight: "100vh", background: "#f4f4f0",
      display: "flex", justifyContent: "center", alignItems: "center",
      flexDirection: "column", gap: 14 }}>
      <div style={{ fontSize: "3rem" }}>◎</div>
      <h2 style={{ color: "#333", fontWeight: 700, margin: 0 }}>Profil introuvable</h2>
      <button onClick={() => navigate(-1)}
        style={{ padding: "8px 20px", borderRadius: 9, border: "1px solid #ddd",
          background: "#fff", fontFamily: "inherit", cursor: "pointer", fontSize: "0.85rem" }}>
        ← Retour
      </button>
    </div>
  );

  const meta        = ROLE_META[role] || ROLE_META.agency;
  const name        = profile.agencyName || profile.teamName
    || (profile.firstName ? `${profile.firstName} ${profile.lastName}` : null)
    || profile.companyName || "Profil";
  const avatarSrc   = profile.logo || profile.avatar || null;
  const bio         = profile.bio || "";
  const specialties = profile.specialties || profile.skills || profile.categories || [];
  const locationStr = profile.address?.region || profile.location?.region || "";
  const isOwner     = user && user._id === id && user.role === role;
  const isProvider  = ["agency", "team", "freelancer"].includes(user?.role);
  const isClientRole = role === "client";
  const jobTitle    = role === "agency_member" && profile.jobTitle
    ? JOB_LABEL[profile.jobTitle] || profile.jobTitle : null;
  const hasSocialLinks = profile.socialLinks && Object.values(profile.socialLinks).some(Boolean);

  const stats = [
    profile.completedProjects !== undefined && { label: "Projets", value: profile.completedProjects, color: "#059669" },
    profile.membersCount      !== undefined && { label: "Membres", value: profile.membersCount,      color: meta.color },
    profile.followersCount    !== undefined && { label: "Abonnés", value: (profile.followersCount || 0).toLocaleString(), color: "#d97706" },
  ].filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f0" }}>

      <div style={{
        height: 220, background: `linear-gradient(${meta.gradient})`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.12,
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />
        <div style={{
          position: "absolute", bottom: -80, right: -60,
          width: 300, height: 300, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
        }} />
        <button onClick={() => navigate(-1)}
          style={{
            position: "absolute", top: 20, left: 20,
            background: "rgba(0,0,0,0.25)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 9, padding: "7px 16px", color: "#fff",
            fontFamily: "inherit", fontSize: "0.79rem", fontWeight: 600, cursor: "pointer",
          }}>
          Retour
        </button>
        {isOwner && (
          <button onClick={() => navigate(`/profile/${role}/${id}/edit`)}
            style={{
              position: "absolute", top: 20, right: 20,
              background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 9, padding: "7px 16px", color: "#fff",
              fontFamily: "inherit", fontSize: "0.79rem", fontWeight: 700, cursor: "pointer",
            }}>
            Modifier le profil
          </button>
        )}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px 60px" }}>

        <div style={{
          background: "#fff", borderRadius: 18,
          border: "1px solid #e8e8e8",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          padding: "0 28px 24px",
          marginTop: -68,
          position: "relative",
        }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20,
            marginTop: 0, paddingTop: 0, flexWrap: "wrap" }}>
            <div style={{ marginTop: -28, flexShrink: 0 }}>
              <Avatar src={avatarSrc} name={name} size={96} color={meta.color} />
            </div>
            <div style={{ flex: 1, minWidth: 200, paddingBottom: 0, paddingTop: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 900,
                  color: "#0f0f0f", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                  {name}
                </h1>
                <span style={{
                  padding: "3px 12px", borderRadius: 20, fontSize: "0.69rem",
                  fontWeight: 800, background: meta.bg, color: meta.color,
                  letterSpacing: "0.04em", textTransform: "uppercase",
                }}>
                  {meta.label}
                </span>
              </div>
              {jobTitle && (
                <div style={{ fontSize: "0.84rem", color: "#777", marginTop: 4, fontWeight: 500 }}>
                  {jobTitle}
                </div>
              )}
              {isClientRole && profile.industry && (
                <div style={{ fontSize: "0.84rem", color: meta.color, marginTop: 4, fontWeight: 600 }}>
                  {profile.industry}
                  {profile.fieldOfWork && <span style={{ color: "#888", fontWeight: 400 }}> · {profile.fieldOfWork}</span>}
                </div>
              )}
              <div style={{ display: "flex", gap: 14, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                {locationStr && (
                  <span style={{ fontSize: "0.78rem", color: "#999", display: "flex", alignItems: "center", gap: 4 }}>
                    📍 {locationStr}
                  </span>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "0.78rem", color: meta.color, fontWeight: 600, textDecoration: "none" }}>
                    🔗 {profile.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, paddingBottom: 4, flexShrink: 0, flexWrap: "wrap" }}>
              {!isOwner && user && (
                <button onClick={handleSendMessage} disabled={sendingMsg}
                  style={{
                    padding: "10px 20px", borderRadius: 10, border: "none",
                    background: sendingMsg ? "#e5e7eb" : meta.color,
                    color: "#fff", fontFamily: "inherit", fontSize: "0.84rem",
                    fontWeight: 700, cursor: sendingMsg ? "default" : "pointer",
                    boxShadow: sendingMsg ? "none" : `0 4px 14px ${meta.color}44`,
                  }}>
                  {sendingMsg ? "Ouverture…" : "Message"}
                </button>
              )}
              {!isOwner && isProvider && isClientRole && (
                <button onClick={() => setShowProposal(true)}
                  style={{
                    padding: "10px 20px", borderRadius: 10,
                    border: `1.5px solid ${meta.color}`, background: meta.bg,
                    color: meta.color, fontFamily: "inherit", fontSize: "0.84rem",
                    fontWeight: 700, cursor: "pointer",
                  }}>
                  + Proposition
                </button>
              )}
            </div>
          </div>

          {msgError && (
            <div style={{ marginTop: 10, fontSize: "0.78rem", color: "#b91c1c",
              padding: "6px 12px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca" }}>
              {msgError}
            </div>
          )}

          {bio && (
            <p style={{
              margin: "18px 0 0", fontSize: "0.9rem", color: "#444", lineHeight: 1.75,
              paddingTop: 18, borderTop: "1px solid #f0f0f0",
            }}>
              {bio}
            </p>
          )}

          {stats.length > 0 && (
            <div style={{
              display: "flex", gap: 0, marginTop: 20,
              paddingTop: 18, borderTop: "1px solid #f0f0f0", flexWrap: "wrap",
            }}>
              {stats.map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div style={{ width: 1, height: 40, background: "#eee", alignSelf: "center" }} />}
                  <div style={{ textAlign: "center", padding: "0 28px" }}>
                    <div style={{ fontSize: "1.6rem", fontWeight: 900, color: s.color, lineHeight: 1 }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#aaa", marginTop: 4, fontWeight: 600,
                      textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {s.label}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}

          {specialties.length > 0 && (
            <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid #f0f0f0",
              display: "flex", flexWrap: "wrap", gap: 7 }}>
              {specialties.slice(0, 12).map((s, i) => (
                <span key={i} style={{
                  padding: "5px 13px", borderRadius: 20, fontSize: "0.73rem", fontWeight: 600,
                  background: meta.bg, color: meta.color, border: `1px solid ${meta.color}22`,
                }}>
                  {s}
                </span>
              ))}
            </div>
          )}

          {hasSocialLinks && (
            <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid #f0f0f0",
              display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.entries(profile.socialLinks)
                .filter(([, v]) => v)
                .map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "6px 14px", borderRadius: 9, fontSize: "0.75rem",
                      fontWeight: 700, background: "#f5f5f5", color: "#444",
                      textDecoration: "none", border: "1px solid #e5e5e5",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = meta.bg; e.currentTarget.style.color = meta.color; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#f5f5f5"; e.currentTarget.style.color = "#444"; }}>
                    <span>{SOCIAL_ICONS[platform] || "🔗"}</span>
                    <span style={{ textTransform: "capitalize" }}>{platform}</span>
                  </a>
                ))}
            </div>
          )}
        </div>

        {isClientRole && profile.achievements?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: "#fff", borderRadius: 16, border: "1px solid #ebebeb",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)", padding: "22px 24px", marginTop: 16 }}>
            <div style={{ fontWeight: 700, fontSize: "0.78rem", color: "#888",
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
              Réalisations
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {profile.achievements.map((a, i) => (
                <span key={i} style={{ padding: "5px 14px", borderRadius: 20, fontSize: "0.78rem",
                  fontWeight: 600, background: meta.bg, color: meta.color,
                  border: `1px solid ${meta.color}33` }}>
                  {a}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {profile.portfolioItems?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: "#fff", borderRadius: 16, border: "1px solid #ebebeb",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)", padding: "22px 24px", marginTop: 16 }}>
            <div style={{ fontWeight: 700, fontSize: "0.78rem", color: "#888",
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
              Portfolio
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
              {profile.portfolioItems.map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #f0f0f0",
                    background: "#fafafa", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  {item.imageUrl ? (
                    <img src={uploadService.resolveUrl(item.imageUrl)} alt={item.title}
                      style={{ width: "100%", height: 130, objectFit: "cover" }} />
                  ) : (
                    <div style={{ height: 100, background: `linear-gradient(${meta.gradient})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.6rem", opacity: 0.7 }}>◈</div>
                  )}
                  <div style={{ padding: "10px 12px 12px" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.84rem", color: "#111" }}>{item.title}</div>
                    {item.description && (
                      <div style={{ fontSize: "0.74rem", color: "#888", marginTop: 3, lineHeight: 1.45 }}>
                        {item.description}
                      </div>
                    )}
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: "0.7rem", color: meta.color, marginTop: 6,
                          display: "inline-block", fontWeight: 600 }}>
                        Voir
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {role === "freelancer" && profile.agencyCollaborations?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: "#fff", borderRadius: 16, border: "1px solid #ebebeb",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)", padding: "22px 24px", marginTop: 16 }}>
            <div style={{ fontWeight: 700, fontSize: "0.78rem", color: "#888",
              letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
              Historique des collaborations
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[...profile.agencyCollaborations]
                .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
                .map((c, i) => {
                  const cm = COLLAB_STATUS_META[c.status] || COLLAB_STATUS_META.ended;
                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px",
                        borderRadius: 10, border: "1px solid #f0f0f0",
                        borderLeft: `3px solid ${cm.color}`,
                        opacity: c.status === "ended" ? 0.75 : 1 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#111" }}>
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
                        fontWeight: 700, background: cm.bg, color: cm.color, whiteSpace: "nowrap" }}>
                        {cm.label}
                      </span>
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>
        )}

        <div style={{ marginTop: 16 }}>
          <PostFeed role={role} id={id} isOwner={isOwner} accentColor={meta.color} />
        </div>
      </div>

      <AnimatePresence>
        {showProposal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
              zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={() => setShowProposal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: "#fff", borderRadius: 18, padding: "32px",
                width: "100%", maxWidth: 480, boxShadow: "0 24px 64px rgba(0,0,0,0.22)" }}
              onClick={e => e.stopPropagation()}>
              {propDone ? (
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0fdf4",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px", fontSize: "1.6rem" }}>✓</div>
                  <div style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: 6 }}>Proposition envoyée !</div>
                  <div style={{ fontSize: "0.83rem", color: "#888", lineHeight: 1.5 }}>
                    Le client verra votre proposition dans son tableau de bord.
                  </div>
                  <button onClick={() => { setShowProposal(false); setPropDone(false);
                    setPropForm({ title: "", description: "", deadline: "" }); }}
                    style={{ marginTop: 20, padding: "9px 22px", borderRadius: 9, border: "none",
                      background: meta.color, color: "#fff", fontFamily: "inherit",
                      fontSize: "0.84rem", fontWeight: 700, cursor: "pointer" }}>
                    Fermer
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: 20, color: "#111" }}>
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
                        style={{ padding: "9px 18px", borderRadius: 9,
                          border: "1.5px solid #e5e5e5", background: "transparent",
                          cursor: "pointer", fontFamily: "inherit",
                          fontSize: "0.83rem", fontWeight: 600, color: "#555" }}>
                        Annuler
                      </button>
                      <button type="submit" disabled={propSaving || !propForm.title.trim()}
                        style={{ padding: "9px 20px", borderRadius: 9, border: "none",
                          background: meta.color, color: "#fff", fontFamily: "inherit",
                          fontSize: "0.83rem", fontWeight: 700, cursor: "pointer",
                          opacity: propSaving || !propForm.title.trim() ? 0.6 : 1 }}>
                        {propSaving ? "Envoi..." : "Envoyer"}
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
