// Shared components used across all agency views
import React from "react";
import { motion } from "framer-motion";
import { getDeadlineColor, getDeadlineLabel } from "../../../utils/deadlineColor";

const COLLAB_FR = {
  service:     "Service",
  partnership: "Partenariat",
  sponsorship: "Sponsoring",
  exposure:    "Exposition",
};

export const StatCard = ({ icon, label, value, sub, color, onClick }) => (
  <motion.div className="stat-card" style={{ "--stat-color": color, cursor: onClick ? "pointer" : "default" }}
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}
    whileHover={onClick ? { y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" } : {}}
    onClick={onClick}>
    <div className="stat-card-header">
      <span className="stat-card-label">{label}</span>
      <div className="stat-card-icon" style={{ color }}>
        {icon}
      </div>
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
    <span style={{
      padding: "2px 9px", borderRadius: 20, fontSize: "0.68rem",
      fontWeight: 700, background: s.bg, color: s.color, display: "inline-block",
    }}>{s.label}</span>
  );
};

export const ProgressBar = ({ value = 0 }) => (
  <div style={{ background: "#f0dede", borderRadius: 99, height: 5, overflow: "hidden" }}>
    <div style={{ width: `${value}%`, height: "100%", background: "#c0152a",
      borderRadius: 99, transition: "width 0.4s" }} />
  </div>
);

export const PostCard = ({ post, index, actionLabel, onAction, actionColor, actionDisabled }) => {
  const dlColor = getDeadlineColor(post.deadline);
  const dlLabel = getDeadlineLabel(post.deadline);

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{ borderLeft: `3px solid ${dlColor}`, position: "relative" }}
    >
      <div style={{ padding: "16px 18px" }}>

        {/* Header row: status + deadline */}
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 10 }}>
          <span className="status-badge open">Ouvert</span>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: dlColor }}>
            {dlLabel}
          </span>
        </div>

        {/* Title */}
        <div style={{
          fontWeight: 700, fontSize: "0.92rem", color: "var(--d-ink)",
          marginBottom: 5, lineHeight: 1.35,
        }}>
          {post.title}
        </div>

        {/* Description excerpt */}
        <div style={{
          fontSize: "0.78rem", color: "var(--d-ink-muted)", lineHeight: 1.55,
          marginBottom: 12, overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {post.description}
        </div>

        {post.objectives && (
          <div style={{ fontSize: "0.73rem", color: "#7c3aed", lineHeight: 1.5,
            marginBottom: 10, padding: "6px 10px", borderRadius: 6,
            background: "#f3f0ff", fontStyle: "italic" }}>
            Objectifs : {post.objectives}
          </div>
        )}

        {/* Tags row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
          {post.marketingType && (
            <span style={{
              padding: "2px 8px", borderRadius: 20, fontSize: "0.67rem",
              fontWeight: 600, background: "#f3f4f6", color: "#374151",
            }}>{post.marketingType}</span>
          )}
          {post.collaborationType && (
            <span style={{
              padding: "2px 8px", borderRadius: 20, fontSize: "0.67rem",
              fontWeight: 600, background: "#ede9fe", color: "#5b21b6",
            }}>{COLLAB_FR[post.collaborationType] || post.collaborationType}</span>
          )}
          {(post.categories || []).slice(0, 2).map(c => (
            <span key={c} style={{
              padding: "2px 8px", borderRadius: 20, fontSize: "0.67rem",
              fontWeight: 600, background: "#fff0f0", color: "#c0152a",
            }}>{c}</span>
          ))}
        </div>

        {/* Footer: budget + location + action */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 12, borderTop: "1px solid var(--d-border-soft)",
          gap: 10,
        }}>
          <div style={{ fontSize: "0.74rem", color: "var(--d-muted)", minWidth: 0 }}>
            {post.compensationType === "benefits"
              ? "Avantages uniquement"
              : post.budget?.min || post.budget?.max
                ? `${(post.budget.min || 0).toLocaleString()}–${(post.budget.max || 0).toLocaleString()} DZD`
                : post.location?.region || "Budget ouvert"
            }
          </div>
          <button
            className="section-cta-btn"
            style={{
              padding: "6px 14px", fontSize: "0.77rem", flexShrink: 0,
              ...(actionColor && { background: actionColor }),
              ...(actionDisabled && { opacity: 0.65, cursor: "default" }),
            }}
            onClick={onAction}
            disabled={actionDisabled}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const TaskRow = ({ task }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 14,
    padding: "11px 20px", borderBottom: "1px solid var(--d-border-soft)",
  }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--d-ink)",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {task.title}
      </div>
      <div style={{ fontSize: "0.72rem", color: "var(--d-muted)", marginTop: 2 }}>
        {task.projectTitle}
        {task.dueDate && ` · ${new Date(task.dueDate).toLocaleDateString("fr-DZ")}`}
      </div>
    </div>
    <PriorityBadge priority={task.priority} />
  </div>
);
