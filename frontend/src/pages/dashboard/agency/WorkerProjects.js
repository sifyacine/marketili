
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ProgressBar } from "./shared";
import projectService from "../../../services/projectService";
import { getDeadlineColor, getDeadlineLabel } from "../../../utils/deadlineColor";
import { IconBriefcase } from "../../../components/ui/Icons";

const STATUS_LABEL = {
  pending:   "En attente",
  active:    "Actif",
  in_review: "En révision",
  completed: "Terminé",
  cancelled: "Annulé",
};
const STATUS_COLOR = {
  pending:   "#f59e0b",
  active:    "#7c3aed",
  in_review: "#0891b2",
  completed: "#10b981",
  cancelled: "#6b7280",
};

const WorkerProjects = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    projectService.getMemberProjects(user._id)
      .then(d => setProjects(d.projects || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user._id]);

  
  const sorted = [...projects].sort((a, b) => {
    const aDone = ["completed", "cancelled"].includes(a.projectStatus);
    const bDone = ["completed", "cancelled"].includes(b.projectStatus);
    if (aDone !== bDone) return aDone ? 1 : -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  if (selected) {
    return <WorkerProjectDetail project={selected} user={user} onBack={() => setSelected(null)} />;
  }

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Mes projets</h2>
          <p>{sorted.length} projet{sorted.length !== 1 ? "s" : ""} assigné{sorted.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : sorted.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "64px 24px" }}>
            <div className="empty-state-icon"><IconBriefcase size={20} /></div>
            <div className="empty-state-title">Aucun projet assigné</div>
            <div className="empty-state-desc">
              Vous apparaîtrez ici dès qu'un directeur vous assigne à un projet.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 16 }}>
          {sorted.map((p, i) => {
            const isDone  = ["completed", "cancelled"].includes(p.projectStatus);
            const dlColor = isDone ? "#9e9e9e" : getDeadlineColor(p.deadline);
            const dlLabel = isDone ? null       : getDeadlineLabel(p.deadline);

            
            const myTasks = (p.tasks || []).filter(t =>
              t.assignedTo?.some(a => a.memberId?.toString() === user._id?.toString())
            );
            const doneTasks = myTasks.filter(t => t.status === "done").length;

            return (
              <motion.div key={p._id} className="card"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{ cursor: "pointer", borderLeft: `3px solid ${dlColor}`,
                  opacity: isDone ? 0.62 : 1 }}
                onClick={() => setSelected(p)}>
                <div style={{ padding: "20px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem",
                      color: "var(--d-ink)", flex: 1 }}>
                      {p.title}
                    </div>
                    <span style={{ padding: "3px 10px", borderRadius: 20,
                      fontSize: "0.7rem", fontWeight: 700, marginLeft: 8, whiteSpace: "nowrap",
                      background: (STATUS_COLOR[p.projectStatus] || "#6b7280") + "22",
                      color: STATUS_COLOR[p.projectStatus] || "#6b7280" }}>
                      {STATUS_LABEL[p.projectStatus] || p.projectStatus}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.78rem", color: "var(--d-muted)", marginBottom: 12 }}>
                    {myTasks.length} tâche{myTasks.length !== 1 ? "s" : ""} assignée{myTasks.length !== 1 ? "s" : ""}
                    {myTasks.length > 0 && ` · ${doneTasks} terminée${doneTasks !== 1 ? "s" : ""}`}
                  </div>

                  <ProgressBar value={p.progress || 0} />

                  <div style={{ display: "flex", justifyContent: "space-between",
                    fontSize: "0.72rem", color: "var(--d-muted)", marginTop: 6 }}>
                    <span>{p.progress || 0}% global</span>
                    {dlLabel
                      ? <span style={{ color: dlColor, fontWeight: 600 }}>{dlLabel}</span>
                      : <span>Échéance : {p.deadline
                          ? new Date(p.deadline).toLocaleDateString("fr-DZ") : "—"}</span>
                    }
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};




const TASK_STATUS = {
  todo:        { label: "À faire",     color: "#6b7280" },
  in_progress: { label: "En cours",    color: "#f59e0b" },
  in_review:   { label: "En révision", color: "#0891b2" },
  done:        { label: "Terminé",     color: "#10b981" },
};
const PRIORITY_COLOR = {
  low: "#10b981", medium: "#f59e0b", high: "#f97316", urgent: "#ef4444",
};

const WorkerProjectDetail = ({ project: initial, user, onBack }) => {
  const [project, setProject] = useState(initial);

  useEffect(() => {
    projectService.getProject(initial._id)
      .then(d => setProject(d.project))
      .catch(() => {});
  }, [initial._id]);

  const myTasks = (project.tasks || []).filter(t =>
    t.assignedTo?.some(a => a.memberId?.toString() === user._id?.toString())
  );

  const dlColor = getDeadlineColor(project.deadline);
  const dlLabel = getDeadlineLabel(project.deadline);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack}
          style={{ background: "none", border: "1.5px solid var(--d-border-soft)",
            borderRadius: 8, padding: "6px 14px", cursor: "pointer",
            fontSize: "0.82rem", color: "var(--d-muted)", fontFamily: "inherit", fontWeight: 600 }}>
          Retour
        </button>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--d-ink)" }}>
            {project.title}
          </h2>
          <p style={{ fontSize: "0.78rem", color: "var(--d-muted)", marginTop: 1 }}>
            <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700,
              background: (STATUS_COLOR[project.projectStatus] || "#6b7280") + "22",
              color: STATUS_COLOR[project.projectStatus] || "#6b7280" }}>
              {STATUS_LABEL[project.projectStatus]}
            </span>
          </p>
        </div>
      </div>

      {}
      <div className="card" style={{ padding: "20px 22px", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--d-muted)",
          textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
          Avancement global
        </div>
        <ProgressBar value={project.progress || 0} />
        <div style={{ display: "flex", justifyContent: "space-between",
          fontSize: "0.78rem", color: "var(--d-muted)", marginTop: 6 }}>
          <span>{project.progress || 0}% complété</span>
          {project.deadline && (
            <span style={{ color: dlColor, fontWeight: 600 }}>
              {new Date(project.deadline).toLocaleDateString("fr-DZ")} — {dlLabel}
            </span>
          )}
        </div>
      </div>

      {}
      <div className="card">
        <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--d-border-soft)" }}>
          <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--d-ink)" }}>
            Mes tâches ({myTasks.length})
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--d-muted)", marginTop: 2 }}>
            Tâches qui vous sont assignées sur ce projet
          </div>
        </div>

        {myTasks.length === 0 ? (
          <div className="empty-state" style={{ padding: "32px 24px" }}>
            <div className="empty-state-icon"><IconBriefcase size={20} /></div>
            <div className="empty-state-title">Aucune tâche assignée</div>
          </div>
        ) : myTasks.map((task, i) => (
          <div key={task._id || i}
            style={{ display: "flex", alignItems: "center", gap: 12,
              padding: "12px 22px",
              borderBottom: i < myTasks.length - 1 ? "1px solid var(--d-border-soft)" : "none" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
              background: TASK_STATUS[task.status]?.color || "#6b7280" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: "0.87rem", color: "var(--d-ink)" }}>
                {task.title}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 600,
                  color: TASK_STATUS[task.status]?.color || "#6b7280" }}>
                  {TASK_STATUS[task.status]?.label || task.status}
                </span>
                {task.priority && (
                  <span style={{ fontSize: "0.72rem",
                    color: PRIORITY_COLOR[task.priority] || "var(--d-muted)" }}>
                    ● {task.priority}
                  </span>
                )}
                {task.dueDate && (
                  <span style={{ fontSize: "0.72rem", color: "var(--d-muted)" }}>
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

export default WorkerProjects;
