// frontend/src/pages/dashboard/ClientDashboard.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout   from "../../components/layout/DashboardLayout";
import CreatePostModal   from "../../components/posts/CreatePostModal";
import PostsDataGrid     from "../../components/posts/PostsDataGrid";
import OffresRecues      from "../../components/pitches/OffresRecues";
import ClientBrowse      from "./ClientBrowse";
import { useMyPosts }    from "../../hooks/usePosts";
import useAuth           from "../../hooks/useAuth";
import projectService    from "../../services/projectService";
import contractService   from "../../services/contractService";
import "../../styles/Dashboard.css";

const ClientDashboard = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postCreated,     setPostCreated]     = useState(0);

  const NAV = [
    { label: "Vue d'ensemble",    icon: "🏠", path: "/dashboard/client"           },
    { label: "Mes posts",         icon: "📋", path: "/dashboard/client/posts"     },
    { label: "Explorer",          icon: "🔍", path: "/dashboard/client/browse"    },
    { label: "Offres reçues",     icon: "💡", path: "/dashboard/client/pitches"   },
    { label: "Projets",           icon: "🚀", path: "/dashboard/client/projects"  },
    { label: "Contrats",          icon: "📄", path: "/dashboard/client/contracts" },
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
          <Route path="browse"    element={<ClientBrowse />} />
          <Route path="pitches"   element={<OffresRecues      user={user} />} />
          <Route path="projects"  element={<ClientProjects    user={user} />} />
          <Route path="contracts" element={<ClientContracts   user={user} />} />
          <Route path="*"         element={<Navigate to="/dashboard/client" replace />} />
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

// ══════════════════════════════════════════════════════════════════════════════
// CLIENT OVERVIEW
// ══════════════════════════════════════════════════════════════════════════════
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

// ══════════════════════════════════════════════════════════════════════════════
// CLIENT POSTS
// ══════════════════════════════════════════════════════════════════════════════
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

// ══════════════════════════════════════════════════════════════════════════════
// CLIENT PROJECTS — REAL IMPLEMENTATION
// ══════════════════════════════════════════════════════════════════════════════
const STATUS_COLOR = {
  pending:   "#f59e0b",
  active:    "#7c3aed",
  in_review: "#0891b2",
  completed: "#10b981",
  cancelled: "#6b7280",
};
const STATUS_LABEL = {
  pending:   "En attente",
  active:    "Actif",
  in_review: "En révision",
  completed: "Terminé",
  cancelled: "Annulé",
};

const ClientProjects = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    projectService.getClientProjects(user._id)
      .then(d => setProjects(d.projects || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user._id]);

  const filtered = filter === "all"
    ? projects
    : projects.filter(p => p.projectStatus === filter);

  const STATUS_OPTS = [
    { value: "all",       label: "Tous"        },
    { value: "active",    label: "Actifs"      },
    { value: "in_review", label: "En révision" },
    { value: "completed", label: "Terminés"    },
    { value: "cancelled", label: "Annulés"     },
  ];

  // Helper: get provider display name from project
  const providerName = (p) => {
    if (p.providerAgency)     return p.providerAgency.agencyName;
    if (p.providerTeam)       return p.providerTeam.teamName;
    if (p.providerFreelancer) return `${p.providerFreelancer.firstName} ${p.providerFreelancer.lastName}`;
    return "Prestataire";
  };

  if (selected) {
    return (
      <ClientProjectDetail
        project={selected}
        onBack={() => setSelected(null)}
        onRefresh={() =>
          projectService.getProject(selected._id)
            .then(d => setSelected(d.project))
            .catch(() => {})
        }
      />
    );
  }

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Mes projets</h2>
          <p>{filtered.length} projet{filtered.length !== 1 ? "s" : ""} avec vos prestataires</p>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="filters-bar" style={{ marginBottom: 18 }}>
        {STATUS_OPTS.map(o => (
          <button key={o.value}
            className={`filter-btn${filter === o.value ? " active" : ""}`}
            onClick={() => setFilter(o.value)}>
            {o.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "64px 24px" }}>
            <div className="empty-state-icon">🚀</div>
            <div className="empty-state-title">Aucun projet</div>
            <div className="empty-state-desc">
              Acceptez une offre pour démarrer un projet avec un prestataire.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px,1fr))", gap: 16 }}>
          {filtered.map((p, i) => (
            <motion.div key={p._id} className="card"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{ cursor: "pointer" }}
              onClick={() => setSelected(p)}>
              <div style={{ padding: "20px 22px" }}>
                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem",
                    color: "#1a0a0a", flex: 1 }}>
                    {p.title}
                  </div>
                  <span style={{
                    padding: "3px 10px", borderRadius: 20, fontSize: "0.7rem",
                    fontWeight: 700, marginLeft: 8, whiteSpace: "nowrap",
                    background: (STATUS_COLOR[p.projectStatus] || "#6b7280") + "22",
                    color: STATUS_COLOR[p.projectStatus] || "#6b7280",
                  }}>
                    {STATUS_LABEL[p.projectStatus] || p.projectStatus}
                  </span>
                </div>

                {/* Provider */}
                <div style={{ fontSize: "0.78rem", color: "#9a6060", marginBottom: 12 }}>
                  Prestataire : <span style={{ color: "#4a2a2a", fontWeight: 600 }}>
                    {providerName(p)}
                  </span>
                </div>

                {/* Progress */}
                <div style={{ background: "#f0dede", borderRadius: 99,
                  height: 6, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ width: `${p.progress || 0}%`, height: "100%",
                    background: "#c0152a", borderRadius: 99, transition: "width 0.4s" }} />
                </div>

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "space-between",
                  fontSize: "0.72rem", color: "#9a6060" }}>
                  <span>{p.progress || 0}% · {p.tasks?.length || 0} tâche{p.tasks?.length !== 1 ? "s" : ""}</span>
                  <span>Échéance : {p.deadline
                    ? new Date(p.deadline).toLocaleDateString("fr-DZ") : "—"}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Client project detail — read-only view ────────────────────────────────────
const ClientProjectDetail = ({ project: initial, onBack, onRefresh }) => {
  const [project, setProject] = useState(initial);

  useEffect(() => { onRefresh && onRefresh(); }, []);

  const TASK_STATUS = {
    todo:        { label: "À faire",     color: "#6b7280" },
    in_progress: { label: "En cours",    color: "#f59e0b" },
    in_review:   { label: "En révision", color: "#0891b2" },
    done:        { label: "Terminé",     color: "#10b981" },
  };

  const PRIORITY_COLOR = {
    low: "#10b981", medium: "#f59e0b", high: "#f97316", urgent: "#ef4444",
  };

  return (
    <div>
      {/* Back button */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack}
          style={{ background: "none", border: "1.5px solid #f0dede", borderRadius: 8,
            padding: "6px 14px", cursor: "pointer", fontSize: "0.82rem",
            color: "#9a6060", fontFamily: "inherit", fontWeight: 600 }}>
          ← Retour
        </button>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a0a0a" }}>
            {project.title}
          </h2>
          <p style={{ fontSize: "0.78rem", color: "#9a6060", marginTop: 1 }}>
            <span style={{
              padding: "2px 9px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700,
              background: (STATUS_COLOR[project.projectStatus] || "#6b7280") + "22",
              color: STATUS_COLOR[project.projectStatus] || "#6b7280",
            }}>
              {STATUS_LABEL[project.projectStatus]}
            </span>
          </p>
        </div>
      </div>

      {/* Progress card */}
      <div className="card" style={{ padding: "20px 22px", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#9a6060",
          textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
          Avancement
        </div>
        <div style={{ background: "#f0dede", borderRadius: 99,
          height: 8, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ width: `${project.progress || 0}%`, height: "100%",
            background: "#c0152a", borderRadius: 99, transition: "width 0.4s" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between",
          fontSize: "0.78rem", color: "#9a6060" }}>
          <span>{project.progress || 0}% complété</span>
          <span>Échéance : {project.deadline
            ? new Date(project.deadline).toLocaleDateString("fr-DZ") : "—"}</span>
        </div>

        {/* Financial summary */}
        {project.agreedPrice?.amount && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #faeaea",
            display: "flex", justifyContent: "space-between",
            fontSize: "0.82rem", color: "#4a2a2a" }}>
            <span>Montant convenu</span>
            <span style={{ fontWeight: 700, color: "#c0152a" }}>
              {project.agreedPrice.amount.toLocaleString()} {project.agreedPrice.currency || "DZD"}
            </span>
          </div>
        )}
      </div>

      {/* Tasks — read-only for client */}
      <div className="card">
        <div style={{ padding: "16px 22px", borderBottom: "1px solid #faeaea" }}>
          <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1a0a0a" }}>
            Tâches ({project.tasks?.length || 0})
          </div>
          <div style={{ fontSize: "0.78rem", color: "#9a6060", marginTop: 2 }}>
            Suivi de l'avancement du prestataire
          </div>
        </div>

        {!project.tasks?.length ? (
          <div className="empty-state" style={{ padding: "32px 24px" }}>
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-title">Aucune tâche définie</div>
          </div>
        ) : project.tasks.map((task, i) => (
          <div key={task._id || i}
            style={{ display: "flex", alignItems: "center", gap: 12,
              padding: "12px 22px",
              borderBottom: i < project.tasks.length - 1 ? "1px solid #faeaea" : "none" }}>
            {/* Status dot */}
            <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
              background: TASK_STATUS[task.status]?.color || "#6b7280" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: "0.87rem", color: "#1a0a0a" }}>
                {task.title}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 600,
                  color: TASK_STATUS[task.status]?.color || "#6b7280" }}>
                  {TASK_STATUS[task.status]?.label || task.status}
                </span>
                {task.priority && (
                  <span style={{ fontSize: "0.72rem",
                    color: PRIORITY_COLOR[task.priority] || "#9a6060" }}>
                    ● {task.priority}
                  </span>
                )}
                {task.dueDate && (
                  <span style={{ fontSize: "0.72rem", color: "#9a6060" }}>
                    {new Date(task.dueDate).toLocaleDateString("fr-DZ")}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// CLIENT CONTRACTS
// ══════════════════════════════════════════════════════════════════════════════
const CONTRACT_STATUS_META = {
  draft:        { label: "Brouillon",         color: "#6b7280", bg: "#f9fafb" },
  sent:         { label: "Envoyé",            color: "#f59e0b", bg: "#fffbeb" },
  acknowledged: { label: "Reçu confirmé",     color: "#0891b2", bg: "#f0f9ff" },
  signed:       { label: "Finalisé",          color: "#10b981", bg: "#f0fdf4" },
  resiliation:  { label: "Résilié",           color: "#ef4444", bg: "#fef2f2" },
};

const ClientContracts = ({ user }) => {
  const [contracts, setContracts] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("all");
  const [selected,  setSelected]  = useState(null);

  useEffect(() => {
    contractService.getAll(user._id, "Client")
      .then(d => setContracts(d.contracts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user._id]);

  const filtered = filter === "all"
    ? contracts
    : contracts.filter(c => c.status === filter);

  const STATUS_OPTS = [
    { value: "all",          label: "Tous"           },
    { value: "sent",         label: "À confirmer"    },
    { value: "acknowledged", label: "Reçu confirmé"  },
    { value: "signed",       label: "Finalisés"      },
    { value: "resiliation",  label: "Résiliés"       },
  ];

  if (selected) {
    return (
      <ClientContractDetail
        contract={selected}
        user={user}
        onBack={() => setSelected(null)}
        onRefresh={() =>
          contractService.getById(selected._id)
            .then(d => setSelected(d.contract))
            .catch(() => {})
        }
      />
    );
  }

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Contrats</h2>
          <p>{filtered.length} contrat{filtered.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="filters-bar" style={{ marginBottom: 18 }}>
        {STATUS_OPTS.map(o => (
          <button key={o.value}
            className={`filter-btn${filter === o.value ? " active" : ""}`}
            onClick={() => setFilter(o.value)}>
            {o.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "64px 24px" }}>
            <div className="empty-state-icon">📄</div>
            <div className="empty-state-title">Aucun contrat</div>
            <div className="empty-state-desc">
              Les contrats apparaissent ici après qu'une agence initie le processus.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((c, i) => {
            const meta = CONTRACT_STATUS_META[c.status] || CONTRACT_STATUS_META.draft;
            return (
              <motion.div key={c._id} className="card"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{ padding: "18px 22px", cursor: "pointer" }}
                onClick={() => setSelected(c)}>
                <div style={{ display: "flex", alignItems: "center",
                  justifyContent: "space-between", gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem",
                      color: "#1a0a0a", marginBottom: 4 }}>
                      {c.title || c.project?.title || "Contrat"}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#9a6060" }}>
                      {c.partyAName} · {new Date(c.createdAt).toLocaleDateString("fr-DZ")}
                    </div>
                  </div>
                  <span style={{ padding: "4px 12px", borderRadius: 20,
                    fontSize: "0.74rem", fontWeight: 700,
                    color: meta.color, background: meta.bg, whiteSpace: "nowrap" }}>
                    {meta.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Client contract detail — can upload receipt ───────────────────────────────
const ClientContractDetail = ({ contract: initial, user, onBack, onRefresh }) => {
  const [contract,    setContract]    = useState(initial);
  const [uploading,   setUploading]   = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [msg,         setMsg]         = useState("");
  const [error,       setError]       = useState("");

  const meta = CONTRACT_STATUS_META[contract.status] || CONTRACT_STATUS_META.draft;

  const handleReceiptUpload = async () => {
    if (!receiptFile) return setError("Sélectionnez un fichier");
    setUploading(true);
    setError("");
    try {
      // Upload file first through the existing upload endpoint
      const form = new FormData();
      form.append("file", receiptFile);
      const uploadRes = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/upload`,
        { method: "POST", body: form, credentials: "include" }
      );
      const uploadData = await uploadRes.json();
      const fileId  = uploadData.fileId  || uploadData.id || "";
      const fileUrl = uploadData.url     || `/api/upload/${fileId}`;

      // Then attach to contract
      const updated = await contractService.uploadReceipt(contract._id, {
        uploadedBy: user._id,
        filename:   receiptFile.name,
        url:        fileUrl,
        fileId,
      });
      setContract(updated.contract);
      setMsg("Reçu envoyé — le prestataire va vous envoyer le bon de commande.");
      setReceiptFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {/* Back */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack}
          style={{ background: "none", border: "1.5px solid #f0dede", borderRadius: 8,
            padding: "6px 14px", cursor: "pointer", fontSize: "0.82rem",
            color: "#9a6060", fontFamily: "inherit", fontWeight: 600 }}>
          ← Retour
        </button>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a0a0a" }}>
            {contract.title || "Contrat"}
          </h2>
          <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: "0.72rem",
            fontWeight: 700, color: meta.color, background: meta.bg }}>
            {meta.label}
          </span>
        </div>
      </div>

      {/* Contract details */}
      <div className="card" style={{ padding: "20px 22px", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#9a6060",
          textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
          Détails du contrat
        </div>
        <div style={{ display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 12 }}>
          {[
            { label: "Prestataire",  value: contract.partyAName },
            { label: "Type",         value: contract.contractType?.replace("_", " ") },
            { label: "Objet",        value: contract.objet },
            { label: "Prestations",  value: contract.prestations },
            { label: "Livrables",    value: contract.livrables },
            { label: "Montant",      value: contract.financialTerms?.amount
              ? `${contract.financialTerms.amount.toLocaleString()} ${contract.financialTerms.currency || "DZD"}`
              : null },
            { label: "Paiement",     value: contract.financialTerms?.paymentSchedule },
            { label: "Début",        value: contract.duration?.startDate
              ? new Date(contract.duration.startDate).toLocaleDateString("fr-DZ") : null },
            { label: "Fin",          value: contract.duration?.endDate
              ? new Date(contract.duration.endDate).toLocaleDateString("fr-DZ") : null },
          ].filter(i => i.value).map(({ label, value }) => (
            <div key={label} style={{ background: "#fdf8f8", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#9a6060",
                textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: "0.82rem", color: "#1a0a0a", lineHeight: 1.4 }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contract PDF link */}
      {contract.contractPdf?.url && (
        <div className="card" style={{ padding: "16px 22px", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#9a6060",
            textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
            Contrat PDF
          </div>
          <a href={contract.contractPdf.url} target="_blank" rel="noreferrer"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", borderRadius: 8, border: "1px solid #f0dede",
              background: "#fff", color: "#1a0a0a", textDecoration: "none" }}>
            <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>
              {contract.contractPdf.filename || "Contrat.pdf"}
            </span>
            <span style={{ fontSize: "0.75rem", color: "#9a6060" }}>Télécharger</span>
          </a>
        </div>
      )}

      {/* Bon de commande link */}
      {contract.bonDeCommande?.url && (
        <div className="card" style={{ padding: "16px 22px", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#9a6060",
            textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
            Bon de commande
          </div>
          <a href={contract.bonDeCommande.url} target="_blank" rel="noreferrer"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", borderRadius: 8, border: "1px solid #f0dede",
              background: "#fff", color: "#1a0a0a", textDecoration: "none" }}>
            <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>
              {contract.bonDeCommande.filename || "Bon de commande"}
            </span>
            <span style={{ fontSize: "0.75rem", color: "#9a6060" }}>Télécharger</span>
          </a>
        </div>
      )}

      {/* Receipt upload — only shown when contract is "sent" */}
      {contract.status === "sent" && (
        <div className="card" style={{ padding: "20px 22px", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#c0152a",
            textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            Action requise — Envoyez votre reçu
          </div>
          <p style={{ fontSize: "0.83rem", color: "#4a2a2a", lineHeight: 1.6, marginBottom: 14 }}>
            Le prestataire vous a envoyé ce contrat. Veuillez uploader votre reçu de paiement
            pour confirmer et recevoir le bon de commande.
          </p>
          <input type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={e => setReceiptFile(e.target.files?.[0] || null)}
            style={{ marginBottom: 10, fontSize: "0.83rem" }} />
          {receiptFile && (
            <div style={{ fontSize: "0.78rem", color: "#9a6060", marginBottom: 10 }}>
              Fichier : {receiptFile.name}
            </div>
          )}
          {error && (
            <div style={{ color: "#b91c1c", fontSize: "0.82rem", marginBottom: 10 }}>
              {error}
            </div>
          )}
          {msg && (
            <div style={{ color: "#166534", fontSize: "0.82rem",
              background: "#f0fdf4", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
              {msg}
            </div>
          )}
          <button onClick={handleReceiptUpload} disabled={uploading || !receiptFile}
            className="section-cta-btn"
            style={{ opacity: !receiptFile ? 0.5 : 1 }}>
            {uploading ? "Envoi..." : "Envoyer le reçu"}
          </button>
        </div>
      )}

      {/* Status: acknowledged — waiting for BDC */}
      {contract.status === "acknowledged" && (
        <div style={{ padding: "14px 18px", borderRadius: 10,
          background: "#f0f9ff", border: "1px solid #bae6fd",
          color: "#0369a1", fontSize: "0.85rem", fontWeight: 600 }}>
          Reçu confirmé — En attente du bon de commande du prestataire.
        </div>
      )}

      {/* Status: signed */}
      {contract.status === "signed" && (
        <div style={{ padding: "14px 18px", borderRadius: 10,
          background: "#f0fdf4", border: "1px solid #bbf7d0",
          color: "#166534", fontSize: "0.85rem", fontWeight: 600 }}>
          Contrat finalisé — Collaboration officiellement engagée.
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════
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
  const dlDays  = Math.ceil((new Date(post.deadline) - new Date()) / 86400000);
  const dlColor = post.deadline
    ? dlDays > 14 ? "#22c55e" : dlDays >= 7 ? "#f59e0b" : dlDays >= 3 ? "#f97316" : "#ef4444"
    : "#9e9e9e";
  return (
    <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
      transition={{ delay: index * 0.05 }}
      style={{ display:"flex", alignItems:"center", gap:14, padding:"11px 22px",
        borderBottom:"1px solid #faeaea", cursor:"pointer",
        borderLeft: `3px solid ${dlColor}` }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:600, fontSize:"0.87rem", color:"#1a0a0a",
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {post.title}
        </div>
        <div style={{ fontSize:"0.73rem", color:"#9a6060", marginTop:2 }}>
          {post.pitchCount || 0} offre{(post.pitchCount||0) !== 1 ? "s" : ""}
          {" · "}
          <span style={{ color: dlColor, fontWeight: 600 }}>
            {dlDays > 0 ? `${dlDays}j restants` : "Échéance dépassée"}
          </span>
        </div>
      </div>
      <span className={`status-badge ${STATUS[post.status]?.class || post.status}`}>
        {STATUS[post.status]?.label || post.status}
      </span>
    </motion.div>
  );
};

export default ClientDashboard;