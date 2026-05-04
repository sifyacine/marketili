// frontend/src/pages/dashboard/ClientDashboard.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout   from "../../components/layout/DashboardLayout";
import CreatePostModal   from "../../components/posts/CreatePostModal";
import PostsDataGrid     from "../../components/posts/PostsDataGrid";
import OffresRecues      from "../../components/pitches/OffresRecues";
import { useMyPosts }    from "../../hooks/usePosts";
import useAuth           from "../../hooks/useAuth";
import "../../styles/Dashboard.css";

const ClientDashboard = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postCreated,     setPostCreated]     = useState(0);

  const NAV = [
    { label: "Vue d'ensemble",    icon: "🏠", path: "/dashboard/client"                },
    { label: "Mes posts",         icon: "📋", path: "/dashboard/client/posts"          },
    { label: "Offres reçues",     icon: "💡", path: "/dashboard/client/pitches"        },
    { label: "Projets",           icon: "🚀", path: "/dashboard/client/projects"       },
    { label: "Mes collaborations",icon: "🤝", path: "/dashboard/client/collaborations" },
  ];

  return (
    <>
      <DashboardLayout role="client" user={user} navItems={NAV} topbarTitle="Tableau de bord">
        <Routes>
          <Route index element={
            <ClientOverview user={user} onCreatePost={() => setShowCreateModal(true)} postCreated={postCreated} />
          } />
          <Route path="posts" element={
            <ClientPosts user={user} onCreatePost={() => setShowCreateModal(true)} refetchKey={postCreated} />
          } />
          <Route path="pitches"        element={<OffresRecues         user={user} />} />
          <Route path="projects"       element={<ClientProjects        user={user} />} />
          <Route path="collaborations" element={<ClientCollaborations  user={user} />} />
          <Route path="*"              element={<Navigate to="/dashboard/client" replace />} />
        </Routes>
      </DashboardLayout>

      <AnimatePresence>
        {showCreateModal && (
          <CreatePostModal
            clientId={user._id}
            onClose={() => setShowCreateModal(false)}
            onCreated={() => { setShowCreateModal(false); setPostCreated(n => n + 1); }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const ClientOverview = ({ user, onCreatePost }) => {
  const { posts, loading } = useMyPosts(user._id);

  const stats = {
    total:        posts.length,
    open:         posts.filter(p => ["open","reactivated"].includes(p.status)).length,
    inProgress:   posts.filter(p => p.status === "in_progress").length,
    totalPitches: posts.reduce((sum, p) => sum + (p.pitchCount || 0), 0),
  };

  const recent = [...posts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div>
      <div className="stats-row">
        <StatCard icon="📋" label="Total posts"   value={stats.total}        sub="publiés"       color="#c0152a" />
        <StatCard icon="🟢" label="Actifs"        value={stats.open}         sub="en attente"    color="#10b981" />
        <StatCard icon="⚡" label="En cours"      value={stats.inProgress}   sub="collaboration" color="#f59e0b" />
        <StatCard icon="💡" label="Offres reçues" value={stats.totalPitches} sub="au total"      color="#6366f1" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <div className="section-head" style={{ marginBottom: 0 }}>
              <div>
                <div className="section-head-title">Posts récents</div>
                <div className="section-head-sub">Vos 5 derniers posts publiés</div>
              </div>
            </div>
          </div>
          <div className="card-body" style={{ padding: "12px 0 0" }}>
            {loading ? (
              <div className="spinner-wrap"><div className="spinner" /></div>
            ) : recent.length === 0 ? (
              <div className="empty-state" style={{ padding: "32px 24px" }}>
                <div className="empty-state-icon">📭</div>
                <div className="empty-state-title">Aucun post publié</div>
                <div className="empty-state-desc">Créez votre premier post pour recevoir des offres.</div>
                <button className="empty-state-btn" onClick={onCreatePost}>+ Créer un post</button>
              </div>
            ) : (
              recent.map((p, i) => <PostRow key={p._id} post={p} index={i} />)
            )}
          </div>
        </div>

        <div className="card" style={{ display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center", padding:32 }}>
          <div style={{ fontSize:"2.5rem", marginBottom:14 }}>🚀</div>
          <div style={{ fontWeight:700, color:"#1a0a0a", marginBottom:8 }}>Nouveau post</div>
          <div style={{ fontSize:"0.82rem", color:"#9a6060", lineHeight:1.5, marginBottom:20 }}>
            Publiez un brief et recevez des offres de nos prestataires.
          </div>
          <button className="section-cta-btn" onClick={onCreatePost} style={{ width:"100%", justifyContent:"center" }}>
            + Créer un post
          </button>
        </div>
      </div>
    </div>
  );
};

const ClientPosts = ({ user, onCreatePost, refetchKey }) => {
  const { posts, loading, refetch } = useMyPosts(user._id);
  useEffect(() => { refetch(); }, [refetchKey]);

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Mes posts</h2>
          <p>Gérez vos briefs publiés</p>
        </div>
        <button className="section-cta-btn" onClick={onCreatePost}>+ Nouveau post</button>
      </div>
      <PostsDataGrid
        posts={posts} loading={loading} onRefetch={refetch}
        clientId={user._id} showActions={true}
        onRowClick={(post) => alert(`Post: ${post.title}`)}
      />
    </div>
  );
};

const ClientProjects = () => (
  <div>
    <div className="section-header">
      <div className="section-header-left"><h2>Mes projets</h2><p>Projets actifs avec vos prestataires</p></div>
    </div>
    <PlaceholderSection icon="🚀" title="Projets — Phase 4"
      desc="Quand vous acceptez une offre, un projet est créé automatiquement." />
  </div>
);

const ClientCollaborations = () => (
  <div>
    <div className="section-header">
      <div className="section-header-left"><h2>Mes collaborations</h2><p>Prestataires avec qui vous avez déjà travaillé</p></div>
    </div>
    <PlaceholderSection icon="🤝" title="Mes collaborations — Phase 4"
      desc="Les prestataires avec qui vous avez finalisé un projet apparaîtront ici." />
  </div>
);

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

const PostRow = ({ post, index }) => {
  const STATUS = {
    open:        { label: "Ouvert",   class: "open"        },
    in_progress: { label: "En cours", class: "in_progress" },
    closed:      { label: "Fermé",    class: "closed"      },
    reactivated: { label: "Réactivé", class: "reactivated" },
  };
  const daysLeft = Math.ceil((new Date(post.deadline) - new Date()) / 86400000);
  return (
    <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
      transition={{ delay: index * 0.05 }}
      style={{ display:"flex", alignItems:"center", gap:14, padding:"11px 22px",
        borderBottom:"1px solid #faeaea", cursor:"pointer" }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:600, fontSize:"0.87rem", color:"#1a0a0a",
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {post.title}
        </div>
        <div style={{ fontSize:"0.73rem", color:"#9a6060", marginTop:2 }}>
          {post.pitchCount || 0} offre{(post.pitchCount||0) !== 1 ? "s" : ""} · {daysLeft > 0 ? `${daysLeft}j restants` : "Échéance dépassée"}
        </div>
      </div>
      <span className={`status-badge ${STATUS[post.status]?.class || post.status}`}>
        {STATUS[post.status]?.label || post.status}
      </span>
    </motion.div>
  );
};

const PlaceholderSection = ({ icon, title, desc }) => (
  <div className="card">
    <div className="empty-state" style={{ padding:"64px 24px" }}>
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-title">{title}</div>
      <div className="empty-state-desc">{desc}</div>
    </div>
  </div>
);

export default ClientDashboard;