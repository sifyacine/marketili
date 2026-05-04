// frontend/src/pages/dashboard/AgencyDashboard.jsx

import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout  from "../../components/layout/DashboardLayout";
import useAuth          from "../../hooks/useAuth";
import { usePosts }     from "../../hooks/usePosts";
import { useMyPitches } from "../../hooks/usePitches";
import pitchService     from "../../services/pitchService";
import PitchForm        from "../../components/pitches/PitchForm";
import "../../styles/Dashboard.css";

const AgencyDashboard = () => {
  const { user } = useAuth();
  const [pitchTarget, setPitchTarget] = useState(null);

  const NAV = [
    { label: "Vue d'ensemble", icon: "🏠", path: "/dashboard/agency"         },
    { label: "Parcourir posts", icon: "🔍", path: "/dashboard/agency/browse"  },
    { label: "Mes offres",      icon: "💼", path: "/dashboard/agency/pitches" },
    { label: "Projets",         icon: "🚀", path: "/dashboard/agency/projects"},
  ];

  return (
    <>
      <DashboardLayout role="agency" user={user} navItems={NAV} topbarTitle="Espace Agence">
        <Routes>
          <Route index         element={<AgencyOverview  user={user} onPitch={setPitchTarget} />} />
          <Route path="browse"  element={<BrowsePosts    user={user} onPitch={setPitchTarget} />} />
          <Route path="pitches" element={<AgencyPitches  user={user} />} />
          <Route path="projects" element={<AgencyProjects user={user} />} />
          <Route path="*"       element={<Navigate to="/dashboard/agency" replace />} />
        </Routes>
      </DashboardLayout>

      <AnimatePresence>
        {pitchTarget && (
          <PitchForm
            post={pitchTarget.post}
            senderType="Agency"
            onClose={() => setPitchTarget(null)}
            onSubmit={async (pitchData) => {
              await pitchService.send({
                ...pitchData,
                postId:     pitchTarget.post._id,
                senderType: "Agency",
                senderId:   user._id,
              });
              setPitchTarget(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const AgencyOverview = ({ user, onPitch }) => {
  const { pitches, loading: pLoading } = useMyPitches(user?._id, "Agency");
  const stats = {
    sent:     pitches.length,
    pending:  pitches.filter(p => p.status === "pending").length,
    accepted: pitches.filter(p => p.status === "accepted").length,
    rejected: pitches.filter(p => p.status === "rejected").length,
  };

  return (
    <div>
      <div className="stats-row">
        <StatCard icon="💼" label="Offres envoyées" value={stats.sent}     sub="au total"      color="#7c3aed" />
        <StatCard icon="⏳" label="En attente"       value={stats.pending}  sub="sans réponse"  color="#f59e0b" />
        <StatCard icon="✅" label="Acceptées"        value={stats.accepted} sub="succès"        color="#10b981" />
        <StatCard icon="❌" label="Refusées"         value={stats.rejected} sub="rejets"        color="#ef4444" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:20 }}>
        <div className="card">
          <div className="card-header">
            <div className="section-head" style={{ marginBottom:0 }}>
              <div>
                <div className="section-head-title">Mes offres récentes</div>
                <div className="section-head-sub">Vos 5 dernières offres envoyées</div>
              </div>
            </div>
          </div>
          <div className="card-body" style={{ padding:"12px 0 0" }}>
            {pLoading ? <div className="spinner-wrap"><div className="spinner"/></div>
            : pitches.length === 0 ? (
              <div className="empty-state" style={{ padding:"32px 24px" }}>
                <div className="empty-state-icon">💼</div>
                <div className="empty-state-title">Aucune offre envoyée</div>
                <div className="empty-state-desc">Parcourez les posts clients et envoyez votre première offre.</div>
              </div>
            ) : pitches.slice(0,5).map((p,i) => <PitchRow key={p._id} pitch={p} index={i} />)}
          </div>
        </div>

        <div className="card" style={{ display:"flex", flexDirection:"column", justifyContent:"center",
          alignItems:"center", textAlign:"center", padding:32 }}>
          <div style={{ fontSize:"2.5rem", marginBottom:14 }}>🔍</div>
          <div style={{ fontWeight:700, color:"#1a0a0a", marginBottom:8 }}>Trouver des clients</div>
          <div style={{ fontSize:"0.82rem", color:"#9a6060", lineHeight:1.5, marginBottom:20 }}>
            Parcourez les posts ouverts et envoyez des offres stratégiques.
          </div>
          <a href="/dashboard/agency/browse" className="section-cta-btn"
            style={{ textDecoration:"none", width:"100%", justifyContent:"center" }}>
            Parcourir les posts →
          </a>
        </div>
      </div>
    </div>
  );
};

const BrowsePosts = ({ user, onPitch }) => {
  const { posts, loading, applyFilters } = usePosts({ status:"open", limit:12 });
  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Posts clients ouverts</h2>
          <p>Trouvez des opportunités et envoyez vos offres</p>
        </div>
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:20 }}>
        <input className="dash-form-input" placeholder="Rechercher par titre, catégorie..."
          value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && applyFilters({ search })}
          style={{ flex:1 }} />
        <button className="section-cta-btn" onClick={() => applyFilters({ search })}>Rechercher</button>
      </div>
      {loading ? (
        <div className="spinner-wrap" style={{ padding:60 }}><div className="spinner"/></div>
      ) : posts.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding:"64px 24px" }}>
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">Aucun post trouvé</div>
          </div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(340px,1fr))", gap:16 }}>
          {posts.map((post, i) => (
            <PostCard key={post._id} post={post} index={i} onPitch={() => onPitch({ post })} />
          ))}
        </div>
      )}
    </div>
  );
};

const AgencyPitches = ({ user }) => {
  const { pitches, loading } = useMyPitches(user?._id, "Agency");
  return (
    <div>
      <div className="section-header">
        <div className="section-header-left"><h2>Mes offres</h2><p>Toutes vos offres envoyées aux clients</p></div>
      </div>
      {loading ? <div className="spinner-wrap"><div className="spinner"/></div>
      : pitches.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding:"64px 24px" }}>
            <div className="empty-state-icon">💼</div>
            <div className="empty-state-title">Aucune offre envoyée</div>
          </div>
        </div>
      ) : (
        <div className="card">
          {pitches.map((p, i) => <PitchRow key={p._id} pitch={p} index={i} detailed />)}
        </div>
      )}
    </div>
  );
};

const AgencyProjects = () => (
  <div>
    <div className="section-header">
      <div className="section-header-left"><h2>Mes projets</h2><p>Projets en cours avec vos clients</p></div>
    </div>
    <div className="card">
      <div className="empty-state" style={{ padding:"64px 24px" }}>
        <div className="empty-state-icon">🚀</div>
        <div className="empty-state-title">Projets — Phase 4</div>
        <div className="empty-state-desc">Quand un client accepte votre offre, le projet apparaît ici.</div>
      </div>
    </div>
  </div>
);

const PostCard = ({ post, index, onPitch }) => {
  const daysLeft = Math.ceil((new Date(post.deadline) - new Date()) / 86400000);
  const urgent   = daysLeft <= 7;
  return (
    <motion.div className="card" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      transition={{ delay: index * 0.04 }}>
      <div style={{ padding:"18px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
          <span className="status-badge open">Ouvert</span>
          <span style={{ fontSize:"0.73rem", color: urgent ? "#ef4444" : "#9a6060", fontWeight: urgent ? 700 : 400 }}>
            {daysLeft > 0 ? `${daysLeft}j restants` : "Délai dépassé"}
          </span>
        </div>
        <div style={{ fontWeight:700, fontSize:"0.95rem", color:"#1a0a0a", marginBottom:6 }}>{post.title}</div>
        <div style={{ fontSize:"0.8rem", color:"#7a4a4a", lineHeight:1.5, marginBottom:12,
          overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
          {post.description}
        </div>
        {post.categories?.length > 0 && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:12 }}>
            {post.categories.slice(0,3).map(c => (
              <span key={c} style={{ padding:"2px 9px", borderRadius:20, fontSize:"0.7rem",
                fontWeight:600, background:"#fff0f0", color:"#c0152a" }}>{c}</span>
            ))}
          </div>
        )}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          paddingTop:12, borderTop:"1px solid #faeaea" }}>
          <div style={{ fontSize:"0.75rem", color:"#9a6060" }}>
            {post.budget?.min || post.budget?.max
              ? `${post.budget.min?.toLocaleString() || "?"} – ${post.budget.max?.toLocaleString() || "?"} DZD`
              : "Budget non défini"}
          </div>
          <button className="section-cta-btn" style={{ padding:"7px 16px", fontSize:"0.78rem" }}
            onClick={onPitch}>Envoyer une offre</button>
        </div>
      </div>
    </motion.div>
  );
};

// ✅ FIXED: removed stray <CreateMemberForm> line that was causing crash
const PitchRow = ({ pitch, index, detailed }) => {
  const STATUS = {
    pending:   { label:"En attente", color:"#f59e0b", bg:"#fffbeb" },
    accepted:  { label:"Acceptée",   color:"#10b981", bg:"#f0fdf4" },
    rejected:  { label:"Rejetée",    color:"#ef4444", bg:"#fef2f2" },
    withdrawn: { label:"Retirée",    color:"#6b7280", bg:"#f9fafb" },
  };
  const s = STATUS[pitch.status] || STATUS.pending;
  return (
    <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
      transition={{ delay: index * 0.04 }}
      style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 22px", borderBottom:"1px solid #faeaea" }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:600, fontSize:"0.87rem", color:"#1a0a0a",
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {pitch.post?.title || "Post supprimé"}
        </div>
        {detailed && (
          <div style={{ fontSize:"0.73rem", color:"#9a6060", marginTop:2 }}>
            {pitch.proposedPrice?.amount ? `${pitch.proposedPrice.amount.toLocaleString()} DZD` : "Prix non défini"}
            {" · "}{new Date(pitch.createdAt).toLocaleDateString("fr-DZ")}
          </div>
        )}
      </div>
      <span style={{ padding:"3px 10px", borderRadius:20, fontSize:"0.72rem", fontWeight:700,
        color: s.color, background: s.bg, whiteSpace:"nowrap" }}>
        {s.label}
      </span>
    </motion.div>
  );
};

const StatCard = ({ icon, label, value, sub, color }) => (
  <motion.div className="stat-card" style={{ "--stat-color": color }}
    initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}>
    <div className="stat-card-header">
      <span className="stat-card-label">{label}</span>
      <div className="stat-card-icon">{icon}</div>
    </div>
    <div className="stat-card-value">{value}</div>
    <div className="stat-card-sub">{sub}</div>
  </motion.div>
);

export default AgencyDashboard;