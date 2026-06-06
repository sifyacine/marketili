
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PriorityBadge } from "./shared";
import projectService from "../../../services/projectService";
import { getDeadlineColor } from "../../../utils/deadlineColor";
import { IconCheckSquare, IconBriefcase } from "../../../components/ui/Icons";
import useAuth from "../../../hooks/useAuth";

const TASK_STATUS_OPTS = [
  { value: "todo",        label: "À faire"     },
  { value: "in_progress", label: "En cours"    },
  { value: "in_review",   label: "En révision" },
  { value: "done",        label: "Terminé"     },
];


const sortByDue = (tasks) =>
  [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

const WorkerTasks = ({ user }) => {
  const { user: authUser } = useAuth();
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  const load = useCallback(() => {
    projectService.getMemberTasks(user._id)
      .then(d => setTasks(d.tasks || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user._id]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (task, status) => {
    try {
      await projectService.updateTask(task.projectId, task._id, { status });
      load();
    } catch {}
  };

  
  const grouped = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = q
      ? tasks.filter(t =>
          t.title.toLowerCase().includes(q) ||
          t.projectTitle?.toLowerCase().includes(q)
        )
      : tasks;
    const map = {};
    filtered.forEach(t => {
      const pid = t.projectId;
      if (!map[pid]) map[pid] = { title: t.projectTitle, tasks: [] };
      map[pid].tasks.push(t);
    });
    return Object.values(map).map(g => ({ ...g, tasks: sortByDue(g.tasks) }));
  }, [tasks, search]);

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Mes tâches</h2>
          <p>{tasks.length} tâche{tasks.length !== 1 ? "s" : ""} assignée{tasks.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: 16 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          color: "var(--d-muted)", pointerEvents: "none", fontSize: "0.8rem" }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher une tâche..."
          className="dash-form-input" style={{ paddingLeft: 36 }} />
      </div>

      {loading ? <div className="spinner-wrap"><div className="spinner" /></div>
      : grouped.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "64px 24px" }}>
            <div className="empty-state-icon"><IconCheckSquare size={20} /></div>
            <div className="empty-state-title">
              {search ? "Aucune tâche correspondante" : "Aucune tâche assignée"}
            </div>
          </div>
        </div>
      ) : grouped.map((group, gi) => (
        <div key={gi} style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8,
            fontWeight: 700, fontSize: "0.82rem", color: "var(--d-muted)",
            letterSpacing: "0.04em", textTransform: "uppercase",
            marginBottom: 10, paddingLeft: 4 }}>
            <IconBriefcase size={13} />
            {group.title}
          </div>
          <div className="card">
            {group.tasks.map((task, i) => (
              <TaskRow
                key={task._id || i}
                task={task}
                isLast={i === group.tasks.length - 1}
                onStatusChange={handleStatusChange}
                authUser={authUser}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};


const TaskRow = ({ task, isLast, onStatusChange, authUser }) => {
  const [open,        setOpen]        = useState(false);
  const [comments,    setComments]    = useState(task.comments || []);
  const [commentText, setCommentText] = useState("");
  const [sending,     setSending]     = useState(false);

  const dlColor = task.dueDate ? getDeadlineColor(task.dueDate) : "#9e9e9e";

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSending(true);
    try {
      const d = await projectService.addTaskComment(task.projectId, task._id, {
        authorId:   authUser._id,
        authorName: `${authUser.firstName} ${authUser.lastName}`,
        authorRole: authUser.jobTitle || authUser.role,
        text:       commentText.trim(),
      });
      setComments(d.task?.comments || [...comments, {
        authorName: `${authUser.firstName} ${authUser.lastName}`,
        authorRole: authUser.jobTitle,
        text:       commentText.trim(),
        createdAt:  new Date().toISOString(),
      }]);
      setCommentText("");
    } catch {}
    finally { setSending(false); }
  };

  return (
    <div style={{ borderBottom: isLast ? "none" : "1px solid var(--d-border-soft)" }}>
      {}
      <div style={{ display: "flex", alignItems: "center", gap: 12,
        padding: "13px 22px", borderLeft: `3px solid ${dlColor}` }}>
        {}
        <div style={{ width: 8, height: 8, borderRadius: "50%",
          background: dlColor, flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: "0.87rem",
            color: "var(--d-ink)", marginBottom: 4 }}>
            {task.title}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <PriorityBadge priority={task.priority} />
            {task.dueDate && (
              <span style={{ fontSize: "0.72rem", color: dlColor, fontWeight: 600 }}>
                {new Date(task.dueDate).toLocaleDateString("fr-DZ")}
              </span>
            )}
            {comments.length > 0 && (
              <span style={{ fontSize: "0.7rem", color: "var(--d-muted)" }}>
                {comments.length} commentaire{comments.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <select value={task.status}
            onChange={e => onStatusChange(task, e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 8,
              border: "1.5px solid var(--d-border-soft)", fontSize: "0.78rem",
              background: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
            {TASK_STATUS_OPTS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button onClick={() => setOpen(v => !v)}
            style={{ fontSize: "0.72rem", color: "var(--d-muted)", background: "none",
              border: "1px solid var(--d-border-soft)", borderRadius: 6,
              padding: "5px 10px", cursor: "pointer", fontFamily: "inherit" }}>
            {open ? "Masquer" : "Commentaires"}
          </button>
        </div>
      </div>

      {}
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
                  <div style={{ width: 28, height: 28, borderRadius: "50%",
                    background: "#c0152a", color: "#fff", fontSize: "0.62rem",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, flexShrink: 0 }}>
                    {c.authorName?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "baseline",
                      flexWrap: "wrap", marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.78rem",
                        color: "var(--d-ink)" }}>
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
                    <div style={{ fontSize: "0.82rem", color: "var(--d-ink)",
                      lineHeight: 1.5 }}>
                      {c.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleComment} style={{ display: "flex", gap: 8 }}>
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Ajouter un commentaire..."
              style={{ flex: 1, padding: "8px 12px", borderRadius: 8,
                border: "1.5px solid var(--d-border-soft)", fontSize: "0.82rem",
                fontFamily: "inherit", background: "#fff", color: "var(--d-ink)" }}
            />
            <button type="submit" className="section-cta-btn"
              style={{ padding: "8px 16px", fontSize: "0.82rem" }}
              disabled={sending || !commentText.trim()}>
              {sending ? "..." : "Envoyer"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default WorkerTasks;
