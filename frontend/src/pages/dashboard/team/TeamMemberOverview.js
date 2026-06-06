import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import projectService from "../../../services/projectService";
import { getDeadlineColor, getDeadlineLabel } from "../../../utils/deadlineColor";
import { IconCheckSquare, IconCalendar } from "../../../components/ui/Icons";
import { PriorityBadge } from "../agency/shared";

const sortByDue = (tasks) =>
  [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

const TASK_STATUS = {
  todo:        { label: "À faire",    color: "#6b7280" },
  in_progress: { label: "En cours",  color: "#f59e0b" },
  in_review:   { label: "Révision",  color: "#0891b2" },
  done:        { label: "Terminé",   color: "#10b981" },
};

const StatCard = ({ icon, label, value, color, onClick }) => (
  <motion.div
    whileHover={onClick ? { y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" } : {}}
    onClick={onClick}
    style={{ padding: "18px 20px", borderRadius: 14, background: "#fff",
      border: "1px solid #eee", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      flex: 1, minWidth: 120, cursor: onClick ? "pointer" : "default" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: color + "15",
        color, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
    </div>
    <div style={{ fontWeight: 800, fontSize: "1.75rem", color, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: "0.75rem", color: "#888", marginTop: 4 }}>{label}</div>
  </motion.div>
);

const TeamMemberOverview = ({ user }) => {
  const navigate = useNavigate();
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    projectService.getMemberTasks(user._id)
      .then(d => setTasks(d.tasks || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?._id]);

  const sorted  = sortByDue(tasks);
  const todo    = tasks.filter(t => t.status === "todo").length;
  const inProg  = tasks.filter(t => t.status === "in_progress").length;
  const done    = tasks.filter(t => t.status === "done").length;
  const urgent  = sorted.slice(0, 5);

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Mon espace</h2>
          <p style={{ color: "var(--d-muted)" }}>
            Bonjour {user?.firstName} — voici vos tâches prioritaires
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard icon={<IconCheckSquare size={16} />} label="À faire"
          value={todo} color="#6b7280"
          onClick={() => navigate("/dashboard/team/tasks")} />
        <StatCard icon={<IconCheckSquare size={16} />} label="En cours"
          value={inProg} color="#f59e0b"
          onClick={() => navigate("/dashboard/team/tasks")} />
        <StatCard icon={<IconCheckSquare size={16} />} label="Terminées"
          value={done} color="#10b981" />
        <StatCard icon={<IconCalendar size={16} />} label="Total"
          value={tasks.length} color="#0891b2"
          onClick={() => navigate("/dashboard/team/calendar")} />
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Upcoming tasks */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--d-border-soft)",
              display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Tâches prioritaires</span>
              <button onClick={() => navigate("/dashboard/team/tasks")}
                style={{ background: "none", border: "none", cursor: "pointer",
                  fontSize: "0.75rem", color: "var(--d-muted)", fontFamily: "inherit" }}>
                Voir tout →
              </button>
            </div>
            {urgent.length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center",
                color: "var(--d-muted)", fontSize: "0.82rem" }}>
                <IconCheckSquare size={18} style={{ display: "block", margin: "0 auto 8px" }} />
                Aucune tâche assignée
              </div>
            ) : urgent.map((t, i) => {
              const dlColor = t.dueDate ? getDeadlineColor(t.dueDate) : "#9e9e9e";
              const tMeta   = TASK_STATUS[t.status] || TASK_STATUS.todo;
              return (
                <motion.div key={t._id || i}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ padding: "12px 20px", borderBottom: "1px solid var(--d-border-soft)",
                    borderLeft: `3px solid ${dlColor}`,
                    display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.84rem",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.title}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                      <PriorityBadge priority={t.priority} />
                      {t.dueDate && (
                        <span style={{ fontSize: "0.7rem", color: dlColor, fontWeight: 600 }}>
                          {getDeadlineLabel(t.dueDate)}
                        </span>
                      )}
                      <span style={{ fontSize: "0.7rem", color: "var(--d-muted)" }}>
                        {t.projectTitle}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700,
                    color: tMeta.color, whiteSpace: "nowrap" }}>
                    {tMeta.label}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Calendar hint */}
          <motion.div
            className="card"
            whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
            onClick={() => navigate("/dashboard/team/calendar")}
            style={{ padding: "28px 24px", cursor: "pointer",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", textAlign: "center",
              background: "linear-gradient(135deg,#f0fdf4,#dcfce7)" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "#059669",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 14 }}>
              <IconCalendar size={22} style={{ color: "#fff" }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 6, color: "#14532d" }}>
              Calendrier des tâches
            </div>
            <div style={{ fontSize: "0.8rem", color: "#166534" }}>
              Visualisez vos échéances sur le calendrier mensuel
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TeamMemberOverview;
