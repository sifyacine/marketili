// src/pages/dashboard/agency/shared.jsx
// Shared components used across all agency views
import React from "react";
import { motion } from "framer-motion";

export const StatCard = ({ icon, label, value, sub, color }) => (
  <motion.div className="stat-card" style={{ "--stat-color": color }}
    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
    <div className="stat-card-header">
      <span className="stat-card-label">{label}</span>
      <div className="stat-card-icon">{icon}</div>
    </div>
    <div className="stat-card-value">{value ?? "—"}</div>
    <div className="stat-card-sub">{sub}</div>
  </motion.div>
);

export const PriorityBadge = ({ priority }) => {
  const MAP = {
    low:    { label: "Bas",    color: "#10b981", bg: "#d1fae5" },
    medium: { label: "Moyen", color: "#f59e0b", bg: "#fef3c7" },
    high:   { label: "Haut",  color: "#f97316", bg: "#ffedd5" },
    urgent: { label: "Urgent",color: "#ef4444", bg: "#fee2e2" },
  };
  const s = MAP[priority] || MAP.medium;
  return (
    <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: "0.7rem",
      fontWeight: 700, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
};

export const ProgressBar = ({ value = 0 }) => (
  <div style={{ background: "#f0dede", borderRadius: 99, height: 6, overflow: "hidden" }}>
    <div style={{ width: `${value}%`, height: "100%", background: "#c0152a",
      borderRadius: 99, transition: "width 0.4s" }} />
  </div>
);

export const PostCard = ({ post, index, actionLabel, onAction, actionColor }) => {
  const daysLeft = Math.ceil((new Date(post.deadline) - new Date()) / 86400000);
  const urgent   = daysLeft <= 7;
  return (
    <motion.div className="card" initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: 10 }}>
          <span className="status-badge open">Ouvert</span>
          <span style={{ fontSize: "0.73rem",
            color: urgent ? "#ef4444" : "#9a6060", fontWeight: urgent ? 700 : 400 }}>
            {daysLeft > 0 ? `${daysLeft}j restants` : "Délai dépassé"}
          </span>
        </div>
        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a0a0a", marginBottom: 6 }}>
          {post.title}
        </div>
        <div style={{ fontSize: "0.8rem", color: "#7a4a4a", lineHeight: 1.5, marginBottom: 12,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {post.description}
        </div>
        {post.categories?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
            {post.categories.slice(0, 3).map(c => (
              <span key={c} style={{ padding: "2px 9px", borderRadius: 20, fontSize: "0.7rem",
                fontWeight: 600, background: "#fff0f0", color: "#c0152a" }}>{c}</span>
            ))}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center",
          justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #faeaea" }}>
          <div style={{ fontSize: "0.75rem", color: "#9a6060" }}>
            {post.budget?.min || post.budget?.max
              ? `${post.budget.min?.toLocaleString() || "?"} – ${post.budget.max?.toLocaleString() || "?"} DZD`
              : "Budget non défini"}
          </div>
          <button className="section-cta-btn"
            style={{ padding: "7px 16px", fontSize: "0.78rem",
              ...(actionColor && { background: actionColor }) }}
            onClick={onAction}>
            {actionLabel}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const TaskRow = ({ task }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14,
    padding: "12px 22px", borderBottom: "1px solid #faeaea" }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: 600, fontSize: "0.87rem", color: "#1a0a0a",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {task.title}
      </div>
      <div style={{ fontSize: "0.73rem", color: "#9a6060", marginTop: 2 }}>
        {task.projectTitle}
        {task.dueDate && ` · ${new Date(task.dueDate).toLocaleDateString("fr-DZ")}`}
      </div>
    </div>
    <PriorityBadge priority={task.priority} />
  </div>
);
