// src/pages/dashboard/agency/WorkerTasks.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PriorityBadge } from "./shared";
import projectService from "../../../services/projectService";

const WorkerTasks = ({ user }) => {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

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
    const map = {};
    tasks.forEach(t => {
      const pid = t.projectId;
      if (!map[pid]) map[pid] = { title: t.projectTitle, tasks: [] };
      map[pid].tasks.push(t);
    });
    return Object.values(map);
  }, [tasks]);

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Mes tâches</h2>
          <p>{tasks.length} tâche{tasks.length !== 1 ? "s" : ""} assignée{tasks.length !== 1 ? "s" : ""}</p>
        </div>
      </div>
      {loading ? <div className="spinner-wrap"><div className="spinner" /></div>
      : grouped.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "64px 24px" }}>
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-title">Aucune tâche assignée</div>
          </div>
        </div>
      ) : grouped.map((group, gi) => (
        <div key={gi} style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#9a6060",
            letterSpacing: "0.04em", textTransform: "uppercase",
            marginBottom: 10, paddingLeft: 4 }}>
            📁 {group.title}
          </div>
          <div className="card">
            {group.tasks.map((task, i) => (
              <div key={task._id || i} style={{ display: "flex", alignItems: "center",
                gap: 12, padding: "14px 22px",
                borderBottom: i < group.tasks.length - 1 ? "1px solid #faeaea" : "none" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.87rem",
                    color: "#1a0a0a", marginBottom: 4 }}>{task.title}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <PriorityBadge priority={task.priority} />
                    {task.dueDate && (
                      <span style={{ fontSize: "0.72rem", color: "#9a6060" }}>
                        📅 {new Date(task.dueDate).toLocaleDateString("fr-DZ")}
                      </span>
                    )}
                  </div>
                </div>
                <select value={task.status}
                  onChange={e => handleStatusChange(task, e.target.value)}
                  style={{ padding: "6px 10px", borderRadius: 8,
                    border: "1.5px solid #f0dede", fontSize: "0.78rem",
                    background: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
                  <option value="todo">À faire</option>
                  <option value="in_progress">En cours</option>
                  <option value="in_review">En révision</option>
                  <option value="done">Terminé</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkerTasks;