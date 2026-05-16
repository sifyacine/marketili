import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import freelancerService from "../../../services/freelancerService";
import { getDeadlineColor, getDeadlineLabel } from "../../../utils/deadlineColor";
import { ProgressBar } from "../agency/shared";
import { IconBriefcase, IconCheckSquare } from "../../../components/ui/Icons";

const STATUS_META = {
  pending:    { label: "En attente",  color: "#f59e0b", bg: "#fffbeb" },
  active:     { label: "Actif",       color: "#7c3aed", bg: "#f3f0ff" },
  in_review:  { label: "En révision", color: "#0891b2", bg: "#e0f2fe" },
  completed:  { label: "Terminé",     color: "#10b981", bg: "#f0fdf4" },
  cancelled:  { label: "Annulé",      color: "#6b7280", bg: "#f9fafb" },
};

const TASK_STATUS_META = {
  todo:        { label: "À faire",    color: "#6b7280" },
  in_progress: { label: "En cours",  color: "#f59e0b" },
  in_review:   { label: "Révision",  color: "#0891b2" },
  done:        { label: "Terminé",   color: "#10b981" },
};

const fmt = (d) => d
  ? new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" })
  : "—";

const ProjectDetail = ({ project: p, userId, onBack }) => {
  const myTasks = (p.tasks || []).filter(t =>
    t.assignedTo?.some(a => a.memberId?.toString() === userId?.toString())
  );
  const allTasks = p.tasks || [];

  return (
    <div>
      <button
        onClick={onBack}
        style={{ background: "none", border: "none", cursor: "pointer",
          fontSize: "0.82rem", color: "var(--d-muted)", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
        ← Retour aux projets
      </button>

      <div className="card" style={{ padding: "24px 26px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: 16, gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>{p.title}</h2>
            {p.client && (
              <div style={{ fontSize: "0.78rem", color: "var(--d-muted)", marginTop: 4 }}>
                Client : {p.client.accountType === "company"
                  ? p.client.companyName
                  : `${p.client.firstName} ${p.client.lastName}`}
              </div>
            )}
          </div>
          {STATUS_META[p.projectStatus] && (
            <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: "0.72rem",
              fontWeight: 700, whiteSpace: "nowrap",
              background: STATUS_META[p.projectStatus].bg,
              color: STATUS_META[p.projectStatus].color }}>
              {STATUS_META[p.projectStatus].label}
            </span>
          )}
        </div>

        <div style={{ marginBottom: 14 }}>
          <ProgressBar value={p.progress || 0} />
          <div style={{ fontSize: "0.72rem", color: "var(--d-muted)", marginTop: 4 }}>
            Progression : {p.progress || 0}%
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: "0.78rem", color: "#555" }}>
          {p.deadline && (
            <div>Échéance : <strong style={{ color: getDeadlineColor(p.deadline) }}>
              {fmt(p.deadline)}
            </strong></div>
          )}
          <div>Tâches : <strong>{allTasks.length}</strong></div>
          <div>Mes tâches : <strong>{myTasks.length}</strong></div>
        </div>
      </div>

      {/* My tasks */}
      {myTasks.length > 0 && (
        <div className="card" style={{ padding: 0, marginBottom: 20 }}>
          <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid var(--d-border-soft)",
            fontWeight: 700, fontSize: "0.9rem" }}>
            Mes tâches assignées
          </div>
          {myTasks.map((t, i) => {
            const tMeta = TASK_STATUS_META[t.status] || TASK_STATUS_META.todo;
            const dlColor = getDeadlineColor(t.dueDate);
            return (
              <motion.div
                key={t._id || i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{ padding: "14px 20px", borderBottom: "1px solid var(--d-border-soft)",
                  borderLeft: `3px solid ${tMeta.color}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{t.title}</div>
                  {t.dueDate && (
                    <div style={{ fontSize: "0.72rem", color: dlColor, marginTop: 2 }}>
                      {getDeadlineLabel(t.dueDate)}
                    </div>
                  )}
                  {t.description && (
                    <div style={{ fontSize: "0.72rem", color: "var(--d-muted)", marginTop: 4,
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {t.description}
                    </div>
                  )}
                </div>
                <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.68rem",
                  fontWeight: 700, color: tMeta.color, background: tMeta.color + "18",
                  whiteSpace: "nowrap", marginLeft: 12 }}>
                  {tMeta.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* All tasks */}
      {allTasks.length > myTasks.length && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid var(--d-border-soft)",
            fontWeight: 700, fontSize: "0.9rem" }}>
            Toutes les tâches du projet
          </div>
          {allTasks.map((t, i) => {
            const tMeta = TASK_STATUS_META[t.status] || TASK_STATUS_META.todo;
            const isMe = t.assignedTo?.some(a => a.memberId?.toString() === userId?.toString());
            return (
              <div key={t._id || i}
                style={{ padding: "12px 20px", borderBottom: "1px solid var(--d-border-soft)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  opacity: isMe ? 1 : 0.55 }}>
                <div>
                  <div style={{ fontWeight: isMe ? 600 : 400, fontSize: "0.82rem" }}>
                    {t.title}
                    {isMe && <span style={{ marginLeft: 6, fontSize: "0.66rem", color: "#7c3aed",
                      fontWeight: 700 }}>Ma tâche</span>}
                  </div>
                </div>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: tMeta.color,
                  whiteSpace: "nowrap" }}>
                  {tMeta.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {allTasks.length === 0 && (
        <div className="card" style={{ padding: "32px 20px", textAlign: "center",
          color: "var(--d-muted)", fontSize: "0.82rem" }}>
          <IconCheckSquare size={20} style={{ marginBottom: 8, display: "block", margin: "0 auto 8px" }} />
          Aucune tâche dans ce projet
        </div>
      )}
    </div>
  );
};

const ProjectCard = ({ project: p, index, onClick }) => {
  const isDone   = ["completed", "cancelled"].includes(p.projectStatus);
  const dlColor  = isDone ? "#9e9e9e" : getDeadlineColor(p.deadline);
  const st       = STATUS_META[p.projectStatus] || STATUS_META.active;

  const clientName = p.client
    ? (p.client.accountType === "company"
        ? p.client.companyName
        : `${p.client.firstName} ${p.client.lastName}`)
    : "Client inconnu";

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
      onClick={onClick}
      style={{ padding: "20px 22px", borderLeft: `3px solid ${dlColor}`,
        opacity: isDone ? 0.65 : 1, cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ fontWeight: 700, fontSize: "0.92rem", flex: 1, paddingRight: 8 }}>
          {p.title}
        </div>
        <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.68rem",
          fontWeight: 700, background: st.bg, color: st.color, whiteSpace: "nowrap" }}>
          {st.label}
        </span>
      </div>

      <div style={{ fontSize: "0.75rem", color: "var(--d-muted)", marginBottom: 12 }}>
        Client : {clientName}
      </div>

      <ProgressBar value={p.progress || 0} />

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10,
        fontSize: "0.72rem", color: "var(--d-muted)" }}>
        <span style={{ color: dlColor, fontWeight: 600 }}>
          {isDone ? fmt(p.deadline) : getDeadlineLabel(p.deadline)}
        </span>
        <span>{(p.tasks || []).length} tâche{(p.tasks || []).length !== 1 ? "s" : ""}</span>
      </div>
    </motion.div>
  );
};

const STATUS_TABS = [
  { v: "all",       l: "Tous"        },
  { v: "active",    l: "Actifs"      },
  { v: "pending",   l: "En attente"  },
  { v: "completed", l: "Terminés"    },
];

const FreelancerProjects = ({ user, activeContext }) => {
  const [projects,  setProjects]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("all");
  const [selected,  setSelected]  = useState(null);

  const load = useCallback(() => {
    if (!user?._id) return;
    setLoading(true);
    const params = activeContext ? { agencyId: activeContext } : {};
    if (filter !== "all") params.status = filter;
    freelancerService.getProjects(user._id, params)
      .then(d => setProjects(d.projects || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?._id, activeContext, filter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setSelected(null); }, [activeContext]);

  if (selected) {
    return <ProjectDetail project={selected} userId={user?._id} onBack={() => setSelected(null)} />;
  }

  const active  = projects.filter(p => p.projectStatus === "active").length;
  const done    = projects.filter(p => p.projectStatus === "completed").length;

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Mes projets</h2>
          <p style={{ color: "var(--d-muted)" }}>
            {active} actif{active !== 1 ? "s" : ""} · {done} terminé{done !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {STATUS_TABS.map(tab => (
          <button
            key={tab.v}
            onClick={() => setFilter(tab.v)}
            style={{
              padding: "6px 16px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600,
              cursor: "pointer", border: "none",
              background: filter === tab.v ? "#0891b2" : "#f3f4f6",
              color: filter === tab.v ? "#fff" : "#555",
              transition: "background 0.15s, color 0.15s",
            }}>
            {tab.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : projects.length === 0 ? (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ color: "#ccc", marginBottom: 12 }}><IconBriefcase size={24} /></div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Aucun projet</div>
          <div style={{ fontSize: "0.8rem", color: "var(--d-muted)" }}>
            {filter !== "all"
              ? "Aucun projet dans ce statut"
              : "Vos projets apparaîtront ici lorsque des offres seront acceptées"}
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px,1fr))", gap: 16 }}>
              {projects.map((p, i) => (
                <ProjectCard key={p._id} project={p} index={i} onClick={() => setSelected(p)} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default FreelancerProjects;
