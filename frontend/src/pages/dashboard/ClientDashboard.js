import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/layout/DashboardLayout";
import CreatePostModal from "../../components/posts/CreatePostModal";
import PostsDataGrid   from "../../components/posts/PostsDataGrid";
import { useMyPosts }  from "../../hooks/usePosts";
import postService     from "../../services/postService";
import "../../styles/Dashboard.css";

// ── Temporary user — Phase 7 replaces with useAuth() ──
const TEMP_USER = {
  _id:         "507f1f77bcf86cd799439011",
  accountType: "company",
  companyName: "Demo Client",
  role:        "client",
};

// ══════════════════════════════════════════════════════════
// CLIENT DASHBOARD WRAPPER
// Handles routing between sections via sidebar nav
// ══════════════════════════════════════════════════════════
const ClientDashboard = () => {
  const navigate  = useNavigate();
  const user      = TEMP_USER;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postCreated,     setPostCreated]     = useState(0); // bump to trigger refetch

  const NAV = [
    { label: "Vue d'ensemble",    icon: "🏠", path: "/dashboard/client"               },
    { label: "Mes besoins",       icon: "📋", path: "/dashboard/client/posts"          },
    { label: "Offres reçues",     icon: "💡", path: "/dashboard/client/pitches"        },
    { label: "Projets",           icon: "🚀", path: "/dashboard/client/projects"       },
    { label: "Parcourir",         icon: "🔍", path: "/dashboard/client/browse"         },
    { label: "Prestataires",      icon: "👥", path: "/dashboard/client/providers"      },
  ];

  return (
    <>
      <DashboardLayout
        role="client"
        user={user}
        navItems={NAV}
        topbarTitle="Tableau de bord client"
        topbarAction={{ label: "Nouveau besoin", onClick: () => setShowCreateModal(true) }}
      >
        <Routes>
          <Route index element={<ClientOverview user={user} onCreatePost={() => setShowCreateModal(true)} postCreated={postCreated} />} />
          <Route path="posts"    element={<ClientPosts    user={user} onCreatePost={() => setShowCreateModal(true)} refetchKey={postCreated} />} />
          <Route path="pitches"  element={<ClientPitches  user={user} />} />
          <Route path="projects" element={<ClientProjects user={user} />} />
          <Route path="browse"   element={<BrowsePosts />} />
          <Route path="providers" element={<BrowseProviders />} />
          <Route path="*"        element={<Navigate to="/dashboard/client" replace />} />
        </Routes>
      </DashboardLayout>

      {/* Create post modal — accessible from anywhere in the dashboard */}
      <AnimatePresence>
        {showCreateModal && (
          <CreatePostModal
            clientId={user._id}
            onClose={() => setShowCreateModal(false)}
            onCreated={(post) => {
              setShowCreateModal(false);
              setPostCreated(n => n + 1); // triggers refetch in child components
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// ══════════════════════════════════════════════════════════
// SECTION: OVERVIEW
// ══════════════════════════════════════════════════════════
const ClientOverview = ({ user, onCreatePost, postCreated }) => {
  const { posts, loading } = useMyPosts(user._id);

  const stats = {
    total:       posts.length,
    open:        posts.filter(p => ["open","reactivated"].includes(p.status)).length,
    inProgress:  posts.filter(p => p.status === "in_progress").length,
    totalPitches: posts.reduce((sum, p) => sum + (p.pitchCount || 0), 0),
  };

  const recent = [...posts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div>
      {/* Stats */}
      <div className="stats-row">
        <StatCard icon="📋" label="Total besoins"   value={stats.total}       sub="publiés"         color="#c0152a" />
        <StatCard icon="🟢" label="Actifs"          value={stats.open}        sub="en attente"      color="#10b981" />
        <StatCard icon="⚡" label="En cours"        value={stats.inProgress}  sub="collaboration"   color="#f59e0b" />
        <StatCard icon="💡" label="Offres reçues"   value={stats.totalPitches} sub="au total"        color="#6366f1" />
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <div className="section-head" style={{ marginBottom: 0 }}>
              <div>
                <div className="section-head-title">Besoins récents</div>
                <div className="section-head-sub">Vos 5 derniers besoins publiés</div>
              </div>
            </div>
          </div>
          <div className="card-body" style={{ padding: "12px 0 0" }}>
            {loading ? (
              <div className="spinner-wrap"><div className="spinner" /></div>
            ) : recent.length === 0 ? (
              <div className="empty-state" style={{ padding: "32px 24px" }}>
                <div className="empty-state-icon">📭</div>
                <div className="empty-state-title">Aucun besoin publié</div>
                <div className="empty-state-desc">Créez votre premier besoin pour recevoir des offres.</div>
                <button className="empty-state-btn" onClick={onCreatePost}>
                  + Créer un besoin
                </button>
              </div>
            ) : (
              recent.map((p, i) => <PostRow key={p._id} post={p} index={i} />)
            )}
          </div>
        </div>

        {/* Quick create card */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>🚀</div>
          <div style={{ fontWeight: 700, color: "#1a0a0a", marginBottom: 8 }}>Nouveau besoin</div>
          <div style={{ fontSize: "0.82rem", color: "#9a6060", lineHeight: 1.5, marginBottom: 20 }}>
            Publiez un brief et recevez des offres stratégiques de nos prestataires.
          </div>
          <button className="dash-topbar-cta" onClick={onCreatePost} style={{ width: "100%", justifyContent: "center" }}>
            + Créer un besoin
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// SECTION: MY POSTS
// ══════════════════════════════════════════════════════════
const ClientPosts = ({ user, onCreatePost, refetchKey }) => {
  const { posts, loading, refetch } = useMyPosts(user._id);

  // Re-fetch when a new post is created
  useEffect(() => { refetch(); }, [refetchKey]);

  return (
    <div>
      <div className="section-head" style={{ marginBottom: 20 }}>
        <div>
          <div className="section-head-title" style={{ fontSize: "1.1rem" }}>Mes besoins</div>
          <div className="section-head-sub">Gérez vos briefs publiés</div>
        </div>
        <button className="dash-topbar-cta" onClick={onCreatePost}>
          + Nouveau besoin
        </button>
      </div>

      <PostsDataGrid
        posts={posts}
        loading={loading}
        onRefetch={refetch}
        clientId={user._id}
        showActions={true}
        onRowClick={(post) => alert(`Détail du post: ${post.title}\n(Vue détaillée — Phase 3)`)}
      />
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// SECTION: PITCHES (placeholder for Phase 3)
// ══════════════════════════════════════════════════════════
const ClientPitches = ({ user }) => (
  <div>
    <div className="section-head" style={{ marginBottom: 20 }}>
      <div>
        <div className="section-head-title" style={{ fontSize: "1.1rem" }}>Offres reçues</div>
        <div className="section-head-sub">Comparez les propositions par besoin</div>
      </div>
    </div>
    <PlaceholderSection
      icon="💡"
      title="Offres reçues — Phase 3"
      desc="Dès que des agences, équipes ou freelancers répondent à vos besoins, leurs offres apparaîtront ici avec comparaison côte à côte."
    />
  </div>
);

// ══════════════════════════════════════════════════════════
// SECTION: PROJECTS (placeholder for Phase 4)
// ══════════════════════════════════════════════════════════
const ClientProjects = ({ user }) => (
  <div>
    <div className="section-head" style={{ marginBottom: 20 }}>
      <div>
        <div className="section-head-title" style={{ fontSize: "1.1rem" }}>Mes projets</div>
        <div className="section-head-sub">Projets actifs avec vos prestataires</div>
      </div>
    </div>
    <PlaceholderSection
      icon="🚀"
      title="Projets — Phase 4"
      desc="Quand vous acceptez une offre, un projet est créé automatiquement. Suivez l'avancement, les livrables et la communication ici."
    />
  </div>
);

// ══════════════════════════════════════════════════════════
// SECTION: BROWSE POSTS (placeholder — same component for all roles)
// ══════════════════════════════════════════════════════════
const BrowsePosts = () => (
  <div>
    <div className="section-head" style={{ marginBottom: 20 }}>
      <div>
        <div className="section-head-title" style={{ fontSize: "1.1rem" }}>Parcourir les besoins</div>
        <div className="section-head-sub">Tous les besoins ouverts sur la plateforme</div>
      </div>
    </div>
    <PlaceholderSection
      icon="🔍"
      title="Parcourir — Phase 3"
      desc="Tous les besoins ouverts avec filtres par région, catégorie, date et budget. Envoyez directement un post à un prestataire."
    />
  </div>
);

// ══════════════════════════════════════════════════════════
// SECTION: BROWSE PROVIDERS
// ══════════════════════════════════════════════════════════
const BrowseProviders = () => (
  <div>
    <div className="section-head" style={{ marginBottom: 20 }}>
      <div>
        <div className="section-head-title" style={{ fontSize: "1.1rem" }}>Prestataires</div>
        <div className="section-head-sub">Agences, équipes et freelancers disponibles</div>
      </div>
    </div>
    <PlaceholderSection
      icon="👥"
      title="Prestataires — Phase 3"
      desc="Profils complets avec portfolios, spécialités et évaluations. Envoyez votre brief directement à un prestataire ciblé."
    />
  </div>
);

// ══════════════════════════════════════════════════════════
// REUSABLE SMALL COMPONENTS
// ══════════════════════════════════════════════════════════
const StatCard = ({ icon, label, value, sub, color }) => (
  <motion.div
    className="stat-card"
    style={{ "--stat-color": color }}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
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
    open: { label: "Ouvert", class: "open" },
    in_progress: { label: "En cours", class: "in_progress" },
    closed: { label: "Fermé", class: "closed" },
    reactivated: { label: "Réactivé", class: "reactivated" },
  };
  const daysLeft = Math.ceil((new Date(post.deadline) - new Date()) / 86400000);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "11px 22px", borderBottom: "1px solid #faeaea",
        cursor: "pointer", transition: "background 0.15s",
      }}
      onHoverStart={e => {}}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: "0.87rem", color: "#1a0a0a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {post.title}
        </div>
        <div style={{ fontSize: "0.73rem", color: "#9a6060", marginTop: 2 }}>
          {post.pitchCount || 0} offre{(post.pitchCount || 0) !== 1 ? "s" : ""} · Échéance dans {daysLeft > 0 ? `${daysLeft}j` : "dépassée"}
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
    <div className="empty-state" style={{ padding: "64px 24px" }}>
      <div className="empty-state-icon">{icon}</div>
      <div className="empty-state-title">{title}</div>
      <div className="empty-state-desc">{desc}</div>
    </div>
  </div>
);

export default ClientDashboard;