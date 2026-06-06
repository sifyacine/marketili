
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StatCard, TaskRow } from "./shared";
import projectService from "../../../services/projectService";
import { IconClipboard, IconCheckSquare, IconCalendar, IconArrowUp } from "../../../components/ui/Icons";

const WorkerOverview = ({ user }) => {
  const navigate = useNavigate();
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectService.getMemberTasks(user._id)
      .then(d => setTasks(d.tasks || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user._id]);

  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

  const done     = tasks.filter(t => t.status === "done").length;
  const dueToday = tasks.filter(t => t.dueDate
    && new Date(t.dueDate) >= today && new Date(t.dueDate) < tomorrow).length;
  const overdue  = tasks.filter(t => t.dueDate
    && new Date(t.dueDate) < today && t.status !== "done").length;

  return (
    <div>
      <div className="stats-row">
        <StatCard icon={<IconClipboard   size={16} />} label="Tâches assignées"      value={tasks.length} sub="au total"    color="#7c3aed" onClick={() => navigate("/dashboard/agency/tasks")} />
        <StatCard icon={<IconCheckSquare size={16} />} label="Terminées"             value={done}         sub="complétées"  color="#10b981" onClick={() => navigate("/dashboard/agency/tasks")} />
        <StatCard icon={<IconCalendar    size={16} />} label="Échéance aujourd'hui" value={dueToday}     sub="à livrer"    color="#f59e0b" onClick={() => navigate("/dashboard/agency/tasks")} />
        <StatCard icon={<IconArrowUp     size={16} />} label="En retard"            value={overdue}      sub="dépassées"   color="#ef4444" onClick={() => navigate("/dashboard/agency/tasks")} />
      </div>
      <div className="card" style={{ cursor: "pointer" }} onClick={() => navigate("/dashboard/agency/tasks")}>
        <div className="card-header">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <div>
              <div className="section-head-title">Tâches récentes</div>
              <div className="section-head-sub">Vos 5 prochaines tâches</div>
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--d-muted)" }}>Voir tout</span>
          </div>
        </div>
        <div className="card-body" style={{ padding: "12px 0 0" }}>
          {loading ? <div className="spinner-wrap"><div className="spinner" /></div>
          : tasks.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 24px" }}>
              <div className="empty-state-icon"><IconCheckSquare size={20} /></div>
              <div className="empty-state-title">Aucune tâche assignée</div>
            </div>
          ) : tasks.slice(0, 5).map((t, i) => <TaskRow key={t._id || i} task={t} />)}
        </div>
      </div>
    </div>
  );
};

export default WorkerOverview;