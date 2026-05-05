// src/pages/dashboard/agency/DirectorProjects.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ProgressBar, PriorityBadge } from "./shared";
import projectService from "../../../services/projectService";

const STATUS_COLOR = {
  pending: "#f59e0b", active: "#7c3aed",
  in_review: "#0891b2", completed: "#10b981", cancelled: "#6b7280",
};
const STATUS_LABEL = {
  pending: "En attente", active: "Actif",
  in_review: "En révision", completed: "Terminé", cancelled: "Annulé",
};

const ProjectCard = ({ project: p, index, onClick }) => {
  const clientName = p.client
    ? (p.client.accountType === "company"
        ? p.client.companyName
        : `${p.client.firstName} ${p.client.lastName}`)
    : "Client inconnu";

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      style={{ cursor: "pointer" }} onClick={onClick}>
      <div style={{ padding: "20px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a0a0a", flex: 1 }}>
            {p.title}
          </div>
          <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.7rem",
            fontWeight: 700, background: STATUS_COLOR[p.projectStatus] + "22",
            color: STATUS_COLOR[p.projectStatus], marginLeft: 8, whiteSpace: "nowrap" }}>
            {STATUS_LABEL[p.projectStatus]}
          </span>
        </div>
        <div style={{ fontSize: "0.78rem", color: "#9a6060", marginBottom: 12 }}>
          Client : {clientName}
        </div>
        <ProgressBar value={p.progress || 0} />
        <div style={{ display: "flex", justifyContent: "space-between",
          fontSize: "0.72rem", color: "#9a6060", marginTop: 6 }}>
          <span>{p.progress || 0}% complété</span>
          <span>{p.tasks?.length || 0} tâche{p.tasks?.length !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </motion.div>
  );
};

const TASK_STATUS = {
  todo:        { label: "À faire",     color: "#6b7280" },
  in_progress: { label: "En cours",    color: "#f59e0b" },
  in_review:   { label: "En révision", color: "#0891b2" },
  done:        { label: "Terminé",     color: "#10b981" },
};

const ProjectDetail = ({ project: initial, agencyId }) => {
  const [project,     setProject]     = useState(initial);
  const [members,     setMembers]     = useState([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskForm,    setTaskForm]    = useState({
    title: "", description: "", priority: "medium", dueDate: "", assignedTo: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    projectService.getAgencyMembers(agencyId)
      .then(d => setMembers(d.members || []))
      .catch(() => {});
    projectService.getProject(project._id)
      .then(d => setProject(d.project))
      .catch(() => {});
  }, [agencyId, project._id]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const found = members.find(m => m._id === taskForm.assignedTo);
      const assignedTo = taskForm.assignedTo
        ? [{ memberType: "AgencyMember", memberId: taskForm.assignedTo,
             memberName: found ? `${found.firstName} ${found.lastName}` : "" }]
        : [];
      const d = await projectService.createTask(project._id, { ...taskForm, assignedTo });
      setProject(d.project);
      setShowAddTask(false);
      setTaskForm({ title: "", description: "", priority: "medium", dueDate: "", assignedTo: "" });
    } catch {}
    finally { setSaving(false); }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      const d = await projectService.updateTask(project._id, taskId, { status });
      setProject(d.project);
    } catch {}
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: "1.15rem", color: "#1a0a0a",
          letterSpacing: "-0.025em", marginBottom: 4 }}>{project.title}</div>
        <ProgressBar value={project.progress || 0} />
        <div style={{ fontSize: "0.75rem", color: "#9a6060", marginTop: 4 }}>
          {project.progress || 0}% · Échéance :{" "}
          {project.deadline ? new Date(project.deadline).toLocaleDateString("fr-DZ") : "—"}
        </div>
      </div>

      {project.assignedMembers?.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {project.assignedMembers.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6,
              padding: "5px 12px", background: "#fff", border: "1px solid #f0dede",
              borderRadius: 20, fontSize: "0.78rem", color: "#4a2a2a" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%",
                background: "#c0152a", color: "#fff", fontSize: "0.6rem",
                display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                {m.memberName?.[0]?.toUpperCase()}
              </div>
              {m.memberName}
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <div>
              <div className="section-head-title">Tâches ({project.tasks?.length || 0})</div>
            </div>
            <button className="section-head-action" onClick={() => setShowAddTask(v => !v)}>
              + Ajouter une tâche
            </button>
          </div>
        </div>

        {showAddTask && (
          <div style={{ padding: "16px 22px", borderBottom: "1px solid #faeaea", background: "#fffbfb" }}>
            <form onSubmit={handleAddTask} className="dash-form">
              <div className="dash-form-row">
                <div className="dash-form-group">
                  <label className="dash-form-label">Titre *</label>
                  <input className="dash-form-input" required value={taskForm.title}
                    onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="dash-form-group">
                  <label className="dash-form-label">Priorité</label>
                  <select className="dash-form-select" value={taskForm.priority}
                    onChange={e => setTaskForm(p => ({ ...p, priority: e.target.value }))}>
                    <option value="low">Bas</option>
                    <option value="medium">Moyen</option>
                    <option value="high">Haut</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="dash-form-row">
                <div className="dash-form-group">
                  <label className="dash-form-label">Assigner à</label>
                  <select className="dash-form-select" value={taskForm.assignedTo}
                    onChange={e => setTaskForm(p => ({ ...p, assignedTo: e.target.value }))}>
                    <option value="">Moi-même (directeur)</option>
                    {members.map(m => (
                      <option key={m._id} value={m._id}>
                        {m.firstName} {m.lastName} ({m.jobTitle})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="dash-form-group">
                  <label className="dash-form-label">Date d'échéance</label>
                  <input className="dash-form-input" type="date" value={taskForm.dueDate}
                    onChange={e => setTaskForm(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
              </div>
              <div className="dash-form-group">
                <label className="dash-form-label">Description</label>
                <textarea className="dash-form-textarea" rows={2} value={taskForm.description}
                  onChange={e => setTaskForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="dash-form-submit" style={{ flex: 1 }} disabled={saving}>
                  {saving ? "Ajout..." : "Ajouter la tâche"}
                </button>
                <button type="button" onClick={() => setShowAddTask(false)}
                  style={{ padding: "10px 18px", border: "1.5px solid #f0dede",
                    borderRadius: 9, background: "transparent", cursor: "pointer",
                    fontSize: "0.85rem", color: "#9a6060" }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card-body" style={{ padding: "8px 0 0" }}>
          {!project.tasks?.length ? (
            <div className="empty-state" style={{ padding: "32px 24px" }}>
              <div className="empty-state-icon">✅</div>
              <div className="empty-state-title">Aucune tâche pour l'instant</div>
            </div>
          ) : project.tasks.map((task) => (
            <div key={task._id} style={{ display: "flex", alignItems: "center",
              gap: 12, padding: "12px 22px", borderBottom: "1px solid #faeaea" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "0.87rem", color: "#1a0a0a" }}>
                  {task.title}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                  <PriorityBadge priority={task.priority} />
                  {task.dueDate && (
                    <span style={{ fontSize: "0.72rem", color: "#9a6060" }}>
                      📅 {new Date(task.dueDate).toLocaleDateString("fr-DZ")}
                    </span>
                  )}
                  {task.assignedTo?.[0]?.memberName && (
                    <span style={{ fontSize: "0.72rem", color: "#9a6060" }}>
                      👤 {task.assignedTo[0].memberName}
                    </span>
                  )}
                </div>
              </div>
              <select value={task.status}
                onChange={e => handleStatusChange(task._id, e.target.value)}
                style={{ padding: "5px 10px", borderRadius: 8, border: "1.5px solid #f0dede",
                  fontSize: "0.78rem", color: TASK_STATUS[task.status]?.color || "#6b7280",
                  background: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
                {Object.entries(TASK_STATUS).map(([v, s]) => (
                  <option key={v} value={v}>{s.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DirectorProjects = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    projectService.getAgencyProjects(user._id)
      .then(d => setProjects(d.projects || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user._id]);

  const filtered = filter === "all" ? projects
    : projects.filter(p => p.projectStatus === filter);

  const STATUS_OPTS = [
    { value: "all",       label: "Tous"        },
    { value: "active",    label: "Actifs"      },
    { value: "in_review", label: "En révision" },
    { value: "completed", label: "Terminés"    },
    { value: "cancelled", label: "Annulés"     },
  ];

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Projets</h2>
          <p>{filtered.length} projet{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        {selected && (
          <button className="section-cta-btn"
            style={{ background: "transparent", color: "#9a6060",
              border: "1.5px solid #f0dede", boxShadow: "none" }}
            onClick={() => setSelected(null)}>
            ← Retour
          </button>
        )}
      </div>

      {!selected ? (
        <>
          <div className="filters-bar" style={{ marginBottom: 18 }}>
            {STATUS_OPTS.map(o => (
              <button key={o.value}
                className={`filter-btn${filter === o.value ? " active" : ""}`}
                onClick={() => setFilter(o.value)}>
                {o.label}
              </button>
            ))}
          </div>
          {loading ? <div className="spinner-wrap"><div className="spinner" /></div>
          : filtered.length === 0 ? (
            <div className="card">
              <div className="empty-state" style={{ padding: "64px 24px" }}>
                <div className="empty-state-icon">🚀</div>
                <div className="empty-state-title">Aucun projet</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
              {filtered.map((p, i) => (
                <ProjectCard key={p._id} project={p} index={i}
                  onClick={() => setSelected(p)} />
              ))}
            </div>
          )}
        </>
      ) : (
        <ProjectDetail project={selected} agencyId={user._id} />
      )}
    </div>
  );
};

export default DirectorProjects;