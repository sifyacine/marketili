// frontend/src/pages/dashboard/agency/DirectorProjects.jsx
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressBar, PriorityBadge } from "./shared";
import projectService from "../../../services/projectService";
import contractService from "../../../services/contractService";
import { getDeadlineColor, getDeadlineLabel } from "../../../utils/deadlineColor";
import { IconCheckSquare, IconZap, IconUsers, IconSend } from "../../../components/ui/Icons";
import ChatWindow from "../../../components/chat/ChatWindow";
import ProjectHistory from "../../../components/projects/ProjectHistory";

const STATUS_COLOR = {
  pending: "#f59e0b", active: "#7c3aed",
  in_review: "#0891b2", completed: "#10b981", cancelled: "#6b7280",
};
const STATUS_LABEL = {
  pending: "En attente", active: "Actif",
  in_review: "En révision", completed: "Terminé", cancelled: "Annulé",
};

const CONTRACT_STATUS_META = {
  draft:        { label: "Brouillon",     color: "#6b7280" },
  sent:         { label: "Envoyé",        color: "#f59e0b" },
  acknowledged: { label: "Reçu confirmé", color: "#0891b2" },
  signed:       { label: "Finalisé",      color: "#10b981" },
  resiliation:  { label: "Résilié",       color: "#ef4444" },
};

const ProjectCard = ({ project: p, index, onClick }) => {
  const clientName = p.client
    ? (p.client.accountType === "company"
        ? p.client.companyName
        : `${p.client.firstName} ${p.client.lastName}`)
    : "Client inconnu";

  const isDone   = ["completed", "cancelled"].includes(p.projectStatus);
  const dlColor  = isDone ? "#9e9e9e" : getDeadlineColor(p.deadline);
  const dlLabel  = isDone ? null      : getDeadlineLabel(p.deadline);

  return (
    <motion.div className="card" initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      style={{ cursor: "pointer", borderLeft: `3px solid ${dlColor}`,
        opacity: isDone ? 0.62 : 1, position: "relative", overflow: "hidden" }}
      onClick={onClick}>
      {isDone && (
        <div style={{ position: "absolute", top: 10, right: -22, transform: "rotate(25deg)",
          background: p.projectStatus === "completed" ? "#10b981" : "#6b7280",
          color: "#fff", fontSize: "0.52rem", fontWeight: 800, letterSpacing: "0.07em",
          padding: "2px 30px", zIndex: 2, userSelect: "none" }}>
          {p.projectStatus === "completed" ? "TERMINÉ" : "ANNULÉ"}
        </div>
      )}
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
          <span>
            {p.progress || 0}% · {p.tasks?.length || 0} tâche{p.tasks?.length !== 1 ? "s" : ""}
            {p.deliverableCount > 0 && (
              <span style={{ marginLeft: 6, color: "#0891b2", fontWeight: 700 }}>
                · {p.deliverableCount} livrable{p.deliverableCount !== 1 ? "s" : ""}
              </span>
            )}
          </span>
          {dlLabel && (
            <span style={{ color: dlColor, fontWeight: 600 }}>{dlLabel}</span>
          )}
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

// ── Director task row: urgency color + reassign + comment thread ──────────────
const DirectorTaskRow = ({ task, projectId, isLast, members, agencyUser, onStatusChange, onReassign }) => {
  const [showReassign, setShowReassign] = useState(false);
  const [reassignId,   setReassignId]   = useState(task.assignedTo?.[0]?.memberId || "");
  const [open,         setOpen]         = useState(false);
  const [comments,     setComments]     = useState(task.comments || []);
  const [commentText,  setCommentText]  = useState("");
  const [sending,      setSending]      = useState(false);

  const dlColor = task.dueDate ? getDeadlineColor(task.dueDate) : "#9e9e9e";

  const handleReassign = async () => {
    await onReassign(task._id, reassignId);
    setShowReassign(false);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSending(true);
    try {
      const d = await projectService.addTaskComment(projectId, task._id, {
        authorId:   agencyUser._id,
        authorName: agencyUser.firstName
          ? `${agencyUser.firstName} ${agencyUser.lastName}`
          : agencyUser.agencyName || "Directeur",
        authorRole: agencyUser.jobTitle || "director",
        text:       commentText.trim(),
      });
      setComments(d.task?.comments || [...comments, {
        authorName: agencyUser.firstName
          ? `${agencyUser.firstName} ${agencyUser.lastName}`
          : agencyUser.agencyName,
        authorRole: agencyUser.jobTitle || "director",
        text:       commentText.trim(),
        createdAt:  new Date().toISOString(),
      }]);
      setCommentText("");
    } catch {}
    finally { setSending(false); }
  };

  return (
    <div style={{ borderBottom: isLast ? "none" : "1px solid var(--d-border-soft)" }}>
      {/* Main row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12,
        padding: "12px 22px", borderLeft: `3px solid ${dlColor}` }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%",
          background: dlColor, flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: "0.87rem", color: "var(--d-ink)" }}>
            {task.title}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap",
            alignItems: "center" }}>
            <PriorityBadge priority={task.priority} />
            {task.dueDate && (
              <span style={{ fontSize: "0.72rem", color: dlColor, fontWeight: 600 }}>
                {new Date(task.dueDate).toLocaleDateString("fr-DZ")}
              </span>
            )}
            {task.assignedTo?.[0]?.memberName && (
              <span style={{ fontSize: "0.72rem", color: "var(--d-muted)" }}>
                {task.assignedTo[0].memberName}
              </span>
            )}
            {task.previousAssignees?.length > 0 && (
              <span style={{ fontSize: "0.66rem", color: "#9a6060", fontStyle: "italic" }}>
                Précédemment : {task.previousAssignees.map(p => p.memberName).join(", ")}
              </span>
            )}
            {comments.length > 0 && (
              <span style={{ fontSize: "0.68rem", color: "var(--d-muted)" }}>
                {comments.length} commentaire{comments.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          <select value={task.status}
            onChange={e => onStatusChange(task._id, e.target.value)}
            style={{ padding: "5px 10px", borderRadius: 8, border: "1.5px solid var(--d-border-soft)",
              fontSize: "0.78rem", color: TASK_STATUS[task.status]?.color || "#6b7280",
              background: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
            {Object.entries(TASK_STATUS).map(([v, s]) => (
              <option key={v} value={v}>{s.label}</option>
            ))}
          </select>
          <button onClick={() => setShowReassign(v => !v)}
            style={{ fontSize: "0.72rem", color: "var(--d-muted)", background: "none",
              border: "1px solid var(--d-border-soft)", borderRadius: 6,
              padding: "5px 9px", cursor: "pointer", fontFamily: "inherit",
              whiteSpace: "nowrap" }}>
            Réassigner
          </button>
          <button onClick={() => setOpen(v => !v)}
            style={{ fontSize: "0.72rem", color: "var(--d-muted)", background: "none",
              border: "1px solid var(--d-border-soft)", borderRadius: 6,
              padding: "5px 9px", cursor: "pointer", fontFamily: "inherit" }}>
            {open ? "−" : "+"}
          </button>
        </div>
      </div>

      {/* Reassign inline row */}
      {showReassign && (
        <div style={{ display: "flex", gap: 8, padding: "8px 22px 10px",
          background: "var(--d-surface-alt)", borderTop: "1px solid var(--d-border-soft)",
          alignItems: "center" }}>
          <select value={reassignId}
            onChange={e => setReassignId(e.target.value)}
            style={{ flex: 1, padding: "6px 10px", borderRadius: 8,
              border: "1.5px solid var(--d-border-soft)", fontSize: "0.82rem",
              fontFamily: "inherit", background: "#fff" }}>
            <option value="">Non assigné</option>
            {members.map(m => (
              <option key={m._id} value={m._id}>
                {m.firstName} {m.lastName} — {m.jobTitle}
              </option>
            ))}
          </select>
          <button onClick={handleReassign} className="section-cta-btn"
            style={{ padding: "7px 14px", fontSize: "0.8rem" }}>
            Confirmer
          </button>
          <button onClick={() => setShowReassign(false)}
            style={{ fontSize: "0.8rem", color: "var(--d-muted)", background: "none",
              border: "1px solid var(--d-border-soft)", borderRadius: 6,
              padding: "7px 12px", cursor: "pointer", fontFamily: "inherit" }}>
            Annuler
          </button>
        </div>
      )}

      {/* Comment thread */}
      {open && (
        <div style={{ padding: "12px 22px 16px", background: "var(--d-surface-alt)",
          borderTop: "1px solid var(--d-border-soft)" }}>
          {comments.length === 0 ? (
            <div style={{ fontSize: "0.78rem", color: "var(--d-muted)", marginBottom: 10 }}>
              Aucun commentaire.
            </div>
          ) : (
            <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {comments.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 10 }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%",
                    background: "#c0152a", color: "#fff", fontSize: "0.6rem",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, flexShrink: 0 }}>
                    {c.authorName?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "baseline",
                      flexWrap: "wrap", marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.78rem", color: "var(--d-ink)" }}>
                        {c.authorName}
                      </span>
                      {c.authorRole && (
                        <span style={{ fontSize: "0.68rem", color: "var(--d-muted)" }}>
                          {c.authorRole}
                        </span>
                      )}
                      {c.createdAt && (
                        <span style={{ fontSize: "0.68rem", color: "var(--d-muted)" }}>
                          {new Date(c.createdAt).toLocaleDateString("fr-DZ")}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--d-ink)", lineHeight: 1.5 }}>
                      {c.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleComment} style={{ display: "flex", gap: 8 }}>
            <input value={commentText} onChange={e => setCommentText(e.target.value)}
              placeholder="Ajouter un commentaire..."
              style={{ flex: 1, padding: "8px 12px", borderRadius: 8,
                border: "1.5px solid var(--d-border-soft)", fontSize: "0.82rem",
                fontFamily: "inherit", background: "#fff", color: "var(--d-ink)" }} />
            <button type="submit" className="section-cta-btn"
              style={{ padding: "8px 14px", fontSize: "0.82rem" }}
              disabled={sending || !commentText.trim()}>
              {sending ? "..." : "Envoyer"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const ProjectDetail = ({ project: initial, agencyId, agencyUser }) => {
  const [activeTab,      setActiveTab]       = useState("detail");
  const [project,        setProject]        = useState(initial);
  const [members,        setMembers]        = useState([]);
  const [showAddTask,    setShowAddTask]     = useState(false);
  const [showAssign,     setShowAssign]      = useState(false);
  const [showDeliverable,setShowDeliverable] = useState(false);
  const [showDeadline,   setShowDeadline]    = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "", description: "", priority: "medium", dueDate: "", assignedTo: "",
  });
  const [assignForm,     setAssignForm]     = useState({ memberId: "", role: "" });
  const [delivForm,      setDelivForm]      = useState({ fileUrl: "", fileName: "", description: "" });
  const [newDeadline,    setNewDeadline]    = useState("");
  const [saving,         setSaving]         = useState(false);
  const [notes,          setNotes]          = useState(initial.notes || []);
  const [noteText,       setNoteText]       = useState("");
  const [noteLoading,    setNoteLoading]    = useState(false);
  const [noteError,      setNoteError]      = useState("");

  // ── Contract state ──
  const [showContractModal, setShowContractModal] = useState(false);
  const [contract,          setContract]          = useState(null);
  const [contractLoading,   setContractLoading]   = useState(true);

  useEffect(() => {
    projectService.getAgencyMembers(agencyId)
      .then(d => setMembers(d.members || []))
      .catch(() => {});
    projectService.getProject(project._id)
      .then(d => setProject(d.project))
      .catch(() => {});
  }, [agencyId, project._id]);

  useEffect(() => {
    contractService.getByProject(project._id)
      .then(d => setContract(d.contract))
      .catch(() => {})
      .finally(() => setContractLoading(false));
  }, [project._id]);

  const refresh = () =>
    projectService.getProject(project._id).then(d => setProject(d.project)).catch(() => {});

  const submitNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNoteLoading(true); setNoteError("");
    try {
      const data = await projectService.addNote(project._id, { text: noteText.trim() });
      setNotes(data.notes || []);
      setNoteText("");
    } catch (err) {
      setNoteError(err.response?.data?.message || "Erreur lors de l'envoi");
    } finally { setNoteLoading(false); }
  };

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

  const handleTaskStatusChange = async (taskId, status) => {
    try {
      const d = await projectService.updateTask(project._id, taskId, { status });
      setProject(d.project);
    } catch {}
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const d = await projectService.updateProject(project._id, {
        projectStatus: newStatus,
        requesterId: agencyUser._id,
      });
      setProject(d.project);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  const handleDeadlineExtend = async (e) => {
    e.preventDefault();
    if (!newDeadline) return;
    setSaving(true);
    try {
      const d = await projectService.updateProject(project._id, {
        deadline: newDeadline,
        requesterId: agencyUser._id,
      });
      setProject(d.project);
      setShowDeadline(false);
      setNewDeadline("");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally { setSaving(false); }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignForm.memberId) return;
    setSaving(true);
    try {
      const found = members.find(m => m._id === assignForm.memberId);
      const d = await projectService.assignMember(project._id, {
        memberType: "AgencyMember",
        memberId:   assignForm.memberId,
        memberName: found ? `${found.firstName} ${found.lastName}` : "",
        role:       assignForm.role,
      });
      setProject(d.project);
      setShowAssign(false);
      setAssignForm({ memberId: "", role: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally { setSaving(false); }
  };

  const handleDeliverable = async (e) => {
    e.preventDefault();
    if (!delivForm.fileUrl || !delivForm.fileName) return;
    setSaving(true);
    try {
      const d = await projectService.addDeliverable(project._id, {
        ...delivForm,
        submittedBy: agencyUser._id,
      });
      setProject(d.project);
      setShowDeliverable(false);
      setDelivForm({ fileUrl: "", fileName: "", description: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally { setSaving(false); }
  };

  const dlColor = getDeadlineColor(project.deadline);
  const dlLabel = getDeadlineLabel(project.deadline);

  const PROJECT_STATUS_FLOW = [
    { v: "pending",   l: "En attente" },
    { v: "active",    l: "Actif"      },
    { v: "in_review", l: "En révision"},
    { v: "completed", l: "Terminé"    },
    { v: "cancelled", l: "Annulé"     },
  ];

  return (
    <div>
      {/* ── Tab bar ── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
        {[
          { id: "detail",     label: "Détail du projet" },
          { id: "historique", label: "Historique" },
          { id: "notes",      label: `Notes${notes.length ? ` (${notes.length})` : ""}` },
          { id: "messagerie", label: "Messagerie" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 20px", borderRadius: 8, fontFamily: "inherit",
              fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
              border: activeTab === tab.id
                ? "2px solid #c0152a"
                : "1.5px solid var(--d-border-soft)",
              background: activeTab === tab.id ? "#c0152a" : "transparent",
              color: activeTab === tab.id ? "#fff" : "var(--d-muted)",
              transition: "all 0.15s",
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "messagerie" && (
        <ChatWindow projectId={project._id} />
      )}

      {activeTab === "historique" && (
        <ProjectHistory projectId={project._id} />
      )}

      {activeTab === "notes" && (
        <div>
          <div className="card" style={{ padding: "20px 22px", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--d-muted)",
              textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
              Laisser une note
            </div>
            <form onSubmit={submitNote}>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Note sur ce projet (feedback client, remarque, suivi)..."
                rows={4}
                style={{ width: "100%", borderRadius: 9, border: "1.5px solid var(--d-border-soft)",
                  padding: "10px 14px", fontSize: "0.85rem", fontFamily: "inherit",
                  resize: "vertical", boxSizing: "border-box", outline: "none",
                  transition: "border-color 0.15s" }}
                onFocus={e => e.target.style.borderColor = "#c0152a"}
                onBlur={e => e.target.style.borderColor = "var(--d-border-soft)"}
              />
              {noteError && (
                <div style={{ color: "#c0152a", fontSize: "0.78rem", marginTop: 6 }}>{noteError}</div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                <button type="submit" disabled={noteLoading || !noteText.trim()}
                  style={{ padding: "9px 22px", borderRadius: 9, border: "none",
                    background: noteText.trim() ? "#c0152a" : "var(--d-border-soft)",
                    color: noteText.trim() ? "#fff" : "var(--d-muted)",
                    fontWeight: 700, fontSize: "0.85rem",
                    cursor: noteText.trim() ? "pointer" : "not-allowed",
                    fontFamily: "inherit", transition: "all 0.15s" }}>
                  {noteLoading ? "Envoi…" : "Envoyer la note"}
                </button>
              </div>
            </form>
          </div>
          {notes.length === 0 ? (
            <div className="card">
              <div className="empty-state" style={{ padding: "40px 24px" }}>
                <div className="empty-state-title">Aucune note pour l'instant</div>
                <div className="empty-state-desc">Ajoutez des notes de suivi sur ce projet.</div>
              </div>
            </div>
          ) : (
            <div className="card">
              {[...notes].reverse().map((n, i) => (
                <div key={n._id || i} style={{ padding: "14px 22px",
                  borderBottom: i < notes.length - 1 ? "1px solid var(--d-border-soft)" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--d-ink)" }}>
                      {n.authorName}
                      <span style={{ fontWeight: 400, color: "var(--d-muted)", marginLeft: 6,
                        fontSize: "0.72rem" }}>{n.authorRole}</span>
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "var(--d-muted)", whiteSpace: "nowrap" }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleDateString("fr-DZ") : ""}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--d-ink)", lineHeight: 1.5 }}>
                    {n.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Detail tab ── */}
      {activeTab === "detail" && <>

      {/* ── Header: title + status + deadline ── */}
      <div className="card" style={{ marginBottom: 16, padding: "20px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--d-ink)",
              letterSpacing: "-0.02em", marginBottom: 6 }}>
              {project.title}
            </div>
            <ProgressBar value={project.progress || 0} />
            <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap",
              fontSize: "0.74rem", color: "var(--d-muted)" }}>
              <span>{project.progress || 0}% complété</span>
              {project.deadline && (
                <span style={{ color: dlColor, fontWeight: 600 }}>
                  {new Date(project.deadline).toLocaleDateString("fr-DZ")} — {dlLabel}
                </span>
              )}
            </div>
          </div>

          {/* Status selector */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <select
              value={project.projectStatus}
              onChange={e => handleStatusUpdate(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid var(--d-border-soft)",
                fontSize: "0.8rem", fontWeight: 700,
                color: STATUS_COLOR[project.projectStatus],
                background: STATUS_COLOR[project.projectStatus] + "18",
                cursor: "pointer", fontFamily: "inherit" }}>
              {PROJECT_STATUS_FLOW.map(s => (
                <option key={s.v} value={s.v}>{s.l}</option>
              ))}
            </select>
            <button
              onClick={() => setShowDeadline(v => !v)}
              style={{ fontSize: "0.75rem", color: "var(--d-muted)", background: "none",
                border: "1px solid var(--d-border-soft)", borderRadius: 6,
                padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}>
              Prolonger le délai
            </button>
          </div>
        </div>

        {showDeadline && (
          <form onSubmit={handleDeadlineExtend}
            style={{ display: "flex", gap: 10, marginTop: 14, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label className="dash-form-label">Nouvelle date limite</label>
              <input className="dash-form-input" type="date"
                value={newDeadline} onChange={e => setNewDeadline(e.target.value)}
                min={new Date().toISOString().split("T")[0]} required />
            </div>
            <button type="submit" className="section-cta-btn"
              style={{ padding: "9px 16px", fontSize: "0.82rem" }} disabled={saving}>
              Enregistrer
            </button>
            <button type="button" onClick={() => setShowDeadline(false)}
              style={{ padding: "9px 14px", border: "1.5px solid var(--d-border-soft)",
                borderRadius: 8, background: "none", cursor: "pointer",
                fontSize: "0.82rem", color: "var(--d-muted)", fontFamily: "inherit" }}>
              Annuler
            </button>
          </form>
        )}
      </div>

      {/* ── Assigned members + assign form ── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <div>
              <div className="section-head-title">
                Équipe ({project.assignedMembers?.length || 0})
              </div>
            </div>
            <button className="section-head-action"
              onClick={() => setShowAssign(v => !v)}>
              + Assigner un membre
            </button>
          </div>
        </div>

        {showAssign && (
          <form onSubmit={handleAssign}
            style={{ padding: "14px 22px", borderBottom: "1px solid var(--d-border-soft)",
              background: "var(--d-surface-alt)" }}>
            <div className="dash-form-row">
              <div className="dash-form-group">
                <label className="dash-form-label">Membre</label>
                <select className="dash-form-select" value={assignForm.memberId} required
                  onChange={e => setAssignForm(p => ({ ...p, memberId: e.target.value }))}>
                  <option value="">Sélectionner...</option>
                  {members.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.firstName} {m.lastName} — {m.jobTitle}
                    </option>
                  ))}
                </select>
              </div>
              <div className="dash-form-group">
                <label className="dash-form-label">Rôle sur ce projet</label>
                <input className="dash-form-input" placeholder="Ex: Stratégiste, Designer..."
                  value={assignForm.role}
                  onChange={e => setAssignForm(p => ({ ...p, role: e.target.value }))} />
              </div>
              <button type="submit" className="section-cta-btn"
                style={{ alignSelf: "flex-end", padding: "9px 18px" }} disabled={saving}>
                Assigner
              </button>
            </div>
          </form>
        )}

        <div className="card-body" style={{ padding: "12px 22px" }}>
          {!project.assignedMembers?.length ? (
            <div style={{ fontSize: "0.82rem", color: "var(--d-muted)" }}>
              Aucun membre assigné à ce projet.
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {project.assignedMembers.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 12px", background: "var(--d-surface)",
                  border: "1px solid var(--d-border-soft)",
                  borderRadius: 20, fontSize: "0.78rem", color: "var(--d-ink)" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%",
                    background: "#c0152a", color: "#fff", fontSize: "0.6rem",
                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                    {m.memberName?.[0]?.toUpperCase()}
                  </div>
                  <span>{m.memberName}</span>
                  {m.role && <span style={{ color: "var(--d-muted)", fontSize: "0.7rem" }}>· {m.role}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Contract status card ── */}
      <div className="card" style={{ marginBottom: 16, padding: "16px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--d-ink)" }}>Contrat</div>
            <div style={{ fontSize: "0.75rem", color: "var(--d-muted)", marginTop: 2 }}>
              {contractLoading ? "Chargement..."
                : contract
                  ? `${CONTRACT_STATUS_META[contract.status]?.label || contract.status} · ${new Date(contract.createdAt).toLocaleDateString("fr-DZ")}`
                  : "Aucun contrat créé"}
            </div>
          </div>
          {!contractLoading && !contract && (
            <button className="section-cta-btn"
              style={{ padding: "7px 16px", fontSize: "0.8rem" }}
              onClick={() => setShowContractModal(true)}>
              + Créer un contrat
            </button>
          )}
          {contract && (
            <span style={{
              padding: "4px 12px", borderRadius: 20, fontSize: "0.74rem", fontWeight: 700,
              color: CONTRACT_STATUS_META[contract.status]?.color || "#6b7280",
              background: (CONTRACT_STATUS_META[contract.status]?.color || "#6b7280") + "22",
            }}>
              {CONTRACT_STATUS_META[contract.status]?.label}
            </span>
          )}
        </div>
      </div>

      {/* ── Deliverables ── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <div>
              <div className="section-head-title">
                Livrables ({project.deliverables?.length || 0})
              </div>
            </div>
            <button className="section-head-action"
              onClick={() => setShowDeliverable(v => !v)}>
              + Soumettre un livrable
            </button>
          </div>
        </div>

        {showDeliverable && (
          <form onSubmit={handleDeliverable}
            style={{ padding: "14px 22px", borderBottom: "1px solid var(--d-border-soft)",
              background: "var(--d-surface-alt)" }}>
            <div className="dash-form-row">
              <div className="dash-form-group">
                <label className="dash-form-label">URL du fichier *</label>
                <input className="dash-form-input" placeholder="https://..." required
                  value={delivForm.fileUrl}
                  onChange={e => setDelivForm(p => ({ ...p, fileUrl: e.target.value }))} />
              </div>
              <div className="dash-form-group">
                <label className="dash-form-label">Nom du fichier *</label>
                <input className="dash-form-input" placeholder="rapport-final.pdf" required
                  value={delivForm.fileName}
                  onChange={e => setDelivForm(p => ({ ...p, fileName: e.target.value }))} />
              </div>
            </div>
            <div className="dash-form-group">
              <label className="dash-form-label">Description</label>
              <input className="dash-form-input" placeholder="Note sur ce livrable..."
                value={delivForm.description}
                onChange={e => setDelivForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className="dash-form-submit" style={{ flex: 1 }} disabled={saving}>
                {saving ? "Envoi..." : "Soumettre"}
              </button>
              <button type="button" onClick={() => setShowDeliverable(false)}
                style={{ padding: "10px 18px", border: "1.5px solid var(--d-border-soft)",
                  borderRadius: 9, background: "transparent", cursor: "pointer",
                  fontSize: "0.85rem", color: "var(--d-muted)", fontFamily: "inherit" }}>
                Annuler
              </button>
            </div>
          </form>
        )}

        <div className="card-body" style={{ padding: "8px 0 0" }}>
          {!project.deliverables?.length ? (
            <div style={{ padding: "20px 22px", fontSize: "0.82rem", color: "var(--d-muted)" }}>
              Aucun livrable soumis.
            </div>
          ) : project.deliverables.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12,
              padding: "11px 22px", borderBottom: "1px solid var(--d-border-soft)" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <a href={d.fileUrl} target="_blank" rel="noreferrer"
                  style={{ fontWeight: 600, fontSize: "0.85rem", color: "#c0152a",
                    textDecoration: "none" }}>
                  {d.fileName}
                </a>
                {d.description && (
                  <div style={{ fontSize: "0.73rem", color: "var(--d-muted)", marginTop: 2 }}>
                    {d.description}
                  </div>
                )}
              </div>
              <span style={{ fontSize: "0.7rem", color: "var(--d-muted)", whiteSpace: "nowrap" }}>
                {d.submittedAt ? new Date(d.submittedAt).toLocaleDateString("fr-DZ") : ""}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tasks card ── */}
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
          <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--d-border-soft)", background: "var(--d-surface-alt)" }}>
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
                  style={{ padding: "10px 18px", border: "1.5px solid var(--d-border-soft)",
                    borderRadius: 9, background: "transparent", cursor: "pointer",
                    fontSize: "0.85rem", color: "var(--d-muted)", fontFamily: "inherit" }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="card-body" style={{ padding: "8px 0 0" }}>
          {!project.tasks?.length ? (
            <div className="empty-state" style={{ padding: "32px 24px" }}>
              <div className="empty-state-icon"><IconCheckSquare size={20} /></div>
              <div className="empty-state-title">Aucune tâche pour l'instant</div>
            </div>
          ) : [...project.tasks]
              .sort((a, b) => {
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
              })
              .map((task, i, arr) => (
                <DirectorTaskRow
                  key={task._id}
                  task={task}
                  projectId={project._id}
                  isLast={i === arr.length - 1}
                  members={members}
                  agencyUser={agencyUser}
                  onStatusChange={(taskId, status) => handleTaskStatusChange(taskId, status)}
                  onReassign={async (taskId, memberId) => {
                    const found = members.find(m => m._id === memberId);
                    const assignedTo = memberId
                      ? [{ memberType: "AgencyMember", memberId,
                           memberName: found ? `${found.firstName} ${found.lastName}` : "" }]
                      : [];
                    try {
                      const d = await projectService.updateTask(project._id, taskId, { assignedTo });
                      setProject(d.project);
                    } catch {}
                  }}
                />
              ))
          }
        </div>
      </div>

      {/* ── Contract modal ── */}
      <AnimatePresence>
        {showContractModal && (
          <ContractModal
            project={project}
            user={agencyUser}
            onClose={() => setShowContractModal(false)}
            onCreated={() => {
              setShowContractModal(false);
              contractService.getByProject(project._id)
                .then(d => setContract(d.contract))
                .catch(() => {});
            }}
          />
        )}
      </AnimatePresence>

      </> /* end detail tab */}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// CONTRACT MODAL — CREATE CONTRACT FORM
// ══════════════════════════════════════════════════════════════════════════════
const ContractModal = ({ project, user, onClose, onCreated }) => {
  const [form, setForm] = useState({
    contractType:    "service_agreement",
    title:           `Contrat — ${project.title}`,
    objet:           "",
    prestations:     "",
    livrables:       "",
    amount:          project.agreedPrice?.amount || "",
    currency:        project.agreedPrice?.currency || "DZD",
    paymentSchedule: "",
    paymentMethod:   "virement",
    startDate:       "",
    endDate:         "",
    confidentialityClause: true,
    exclusivityClause:     false,
    resiliationTerms:      "",
    additionalClauses:     "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.objet.trim()) return setError("L'objet du contrat est requis");
    setSaving(true);
    setError("");
    try {
      const clientName = project.client
        ? (project.client.accountType === "company"
            ? project.client.companyName
            : `${project.client.firstName} ${project.client.lastName}`)
        : "Client";

      await contractService.create({
        projectId:  project._id,
        pitchId:    project.pitch,
        contractType: form.contractType,
        // Party A = agency (provider)
        partyAType: "Agency",
        partyAId:   project.providerAgency || user._id,
        partyAName: user.agencyName || "Agence",
        // Party B = client
        partyBType: "Client",
        partyBId:   project.client?._id || project.client,
        partyBName: clientName,
        title:       form.title,
        objet:       form.objet,
        prestations: form.prestations,
        livrables:   form.livrables,
        financialTerms: {
          amount:          Number(form.amount) || undefined,
          currency:        form.currency,
          paymentMethod:   form.paymentMethod,
          paymentSchedule: form.paymentSchedule,
        },
        duration: {
          startDate: form.startDate || undefined,
          endDate:   form.endDate   || undefined,
        },
        confidentialityClause: form.confidentialityClause,
        exclusivityClause:     form.exclusivityClause,
        resiliationTerms:      form.resiliationTerms,
        additionalClauses:     form.additionalClauses,
        initiatedBy:           user._id,
        initiatedByRole:       "agency",
      });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  const set = (field) => (e) =>
    setForm(prev => ({ ...prev, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="modal-box"
        style={{ maxWidth: 640, maxHeight: "90vh", overflowY: "auto" }}
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.25 }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Créer un contrat</h2>
            <p style={{ fontSize: "0.78rem", color: "#9a6060", marginTop: 2 }}>{project.title}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="dash-form">

            {/* Contract type */}
            <div className="dash-form-group">
              <label className="dash-form-label">Type de contrat</label>
              <select className="dash-form-select" value={form.contractType} onChange={set("contractType")}>
                <option value="service_agreement">Convention de prestation</option>
                <option value="collaboration">Convention de collaboration</option>
                <option value="cdd">CDD</option>
                <option value="cdi">CDI</option>
                <option value="project">Projet ponctuel</option>
              </select>
            </div>

            <div className="dash-form-group">
              <label className="dash-form-label">Titre du contrat</label>
              <input className="dash-form-input" value={form.title} onChange={set("title")} />
            </div>

            {/* ARTICLE 01 */}
            <div className="dash-form-group">
              <label className="dash-form-label">Art. 01 — Objet du contrat *</label>
              <textarea className="dash-form-textarea" rows={3}
                placeholder="Objet principal de la prestation..."
                value={form.objet} onChange={set("objet")} />
            </div>

            {/* ARTICLE 02 */}
            <div className="dash-form-group">
              <label className="dash-form-label">Art. 02 — Nature des prestations</label>
              <textarea className="dash-form-textarea" rows={3}
                placeholder="Détail des services fournis..."
                value={form.prestations} onChange={set("prestations")} />
            </div>

            {/* ARTICLE 03 */}
            <div className="dash-form-group">
              <label className="dash-form-label">Art. 03 — Périmètre & livrables</label>
              <textarea className="dash-form-textarea" rows={3}
                placeholder="Livrables attendus, périmètre du projet..."
                value={form.livrables} onChange={set("livrables")} />
            </div>

            {/* ARTICLE 05 — Financial */}
            <div className="dash-form-row">
              <div className="dash-form-group">
                <label className="dash-form-label">Art. 05 — Montant</label>
                <input className="dash-form-input" type="number" min={0}
                  value={form.amount} onChange={set("amount")} />
              </div>
              <div className="dash-form-group">
                <label className="dash-form-label">Devise</label>
                <select className="dash-form-select" value={form.currency} onChange={set("currency")}>
                  <option value="DZD">DZD</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="dash-form-group">
                <label className="dash-form-label">Mode de paiement</label>
                <select className="dash-form-select" value={form.paymentMethod} onChange={set("paymentMethod")}>
                  <option value="virement">Virement</option>
                  <option value="chèque">Chèque</option>
                  <option value="espèces">Espèces</option>
                </select>
              </div>
            </div>

            <div className="dash-form-group">
              <label className="dash-form-label">Échéancier de paiement</label>
              <input className="dash-form-input"
                placeholder="Ex: 50% à la signature, 50% à la livraison"
                value={form.paymentSchedule} onChange={set("paymentSchedule")} />
            </div>

            {/* ARTICLE 08 — Duration */}
            <div className="dash-form-row">
              <div className="dash-form-group">
                <label className="dash-form-label">Art. 08 — Date de début</label>
                <input className="dash-form-input" type="date"
                  value={form.startDate} onChange={set("startDate")} />
              </div>
              <div className="dash-form-group">
                <label className="dash-form-label">Date de fin</label>
                <input className="dash-form-input" type="date"
                  value={form.endDate} onChange={set("endDate")} />
              </div>
            </div>

            {/* Clauses */}
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8,
                fontSize: "0.85rem", color: "#4a2a2a", cursor: "pointer" }}>
                <input type="checkbox" checked={form.confidentialityClause}
                  onChange={set("confidentialityClause")} />
                Art. 09 — Clause de confidentialité
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8,
                fontSize: "0.85rem", color: "#4a2a2a", cursor: "pointer" }}>
                <input type="checkbox" checked={form.exclusivityClause}
                  onChange={set("exclusivityClause")} />
                Art. 10 — Clause d'exclusivité
              </label>
            </div>

            {/* ARTICLE 14 */}
            <div className="dash-form-group">
              <label className="dash-form-label">Art. 14 — Conditions de résiliation</label>
              <textarea className="dash-form-textarea" rows={2}
                placeholder="Modalités de résiliation anticipée..."
                value={form.resiliationTerms} onChange={set("resiliationTerms")} />
            </div>

            <div className="dash-form-group">
              <label className="dash-form-label">Clauses additionnelles</label>
              <textarea className="dash-form-textarea" rows={2}
                placeholder="Autres dispositions..."
                value={form.additionalClauses} onChange={set("additionalClauses")} />
            </div>

            {error && <div className="dash-form-error">{error}</div>}

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className="dash-form-submit" style={{ flex: 2 }} disabled={saving}>
                {saving ? "Création..." : "Créer le contrat"}
              </button>
              <button type="button" onClick={onClose}
                style={{ flex: 1, padding: 12, border: "1.5px solid #f0dede",
                  borderRadius: 9, background: "white", color: "#9a6060",
                  fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const DirectorProjects = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    projectService.getAgencyProjects(user._id)
      .then(d => setProjects(d.projects || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user._id]);

  const filtered = useMemo(() => {
    let base = filter === "all" ? projects : projects.filter(p => p.projectStatus === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter(p =>
        (p.title || "").toLowerCase().includes(q) ||
        (p.client?.firstName || "").toLowerCase().includes(q) ||
        (p.client?.lastName  || "").toLowerCase().includes(q) ||
        (p.client?.companyName || "").toLowerCase().includes(q)
      );
    }
    return [...base].sort((a, b) => {
      const aDone = ["completed", "cancelled"].includes(a.projectStatus);
      const bDone = ["completed", "cancelled"].includes(b.projectStatus);
      if (aDone !== bDone) return aDone ? 1 : -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  }, [projects, filter, search]);

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
          <div style={{ marginBottom: 16 }}>
            <input className="dash-form-input"
              placeholder="Rechercher par titre ou client..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: 360 }} />
          </div>
          {loading ? <div className="spinner-wrap"><div className="spinner" /></div>
          : filtered.length === 0 ? (
            <div className="card">
              <div className="empty-state" style={{ padding: "64px 24px" }}>
                <div className="empty-state-icon"><IconZap size={20} /></div>
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
        <ProjectDetail project={selected} agencyId={user._id} agencyUser={user} />
      )}
    </div>
  );
};

export default DirectorProjects;