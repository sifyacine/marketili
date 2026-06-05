// frontend/src/components/projects/ProjectHistory.js
//
// Unified, per-project timeline — shows everything that happened on a
// project (status changes, deliverables, decisions, team changes, and
// contract milestones) in one chronological view, accessible to both
// the client and the provider. Backed by GET /api/projects/:id/history.

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import projectService from "../../services/projectService";

// Resolve a stored file url. Contract/upload urls are stored as "/api/..."
// (relative to the API origin), deliverable urls may already be absolute.
const API_ORIGIN = (process.env.REACT_APP_API_URL || "http://localhost:5000/api")
  .replace(/\/api\/?$/, "");
const resolveUrl = (u) =>
  !u ? null : (/^https?:\/\//.test(u) ? u : API_ORIGIN + (u.startsWith("/") ? u : `/${u}`));

const CAT_META = {
  status:      { label: "Statut",   color: "#0891b2", bg: "#f0f9ff", icon: "📁" },
  deliverable: { label: "Livrable", color: "#059669", bg: "#ecfdf5", icon: "📦" },
  task:        { label: "Tâche",    color: "#7c3aed", bg: "#f3f0ff", icon: "✓" },
  decision:    { label: "Décision", color: "#d97706", bg: "#fffbeb", icon: "💬" },
  contract:    { label: "Contrat",  color: "#c0152a", bg: "#fff5f5", icon: "📝" },
  note:        { label: "Note",     color: "#2563eb", bg: "#eff6ff", icon: "🗒️" },
  member:      { label: "Équipe",   color: "#0d9488", bg: "#f0fdfa", icon: "👥" },
};

const FILTER_OPTS = [
  { value: "all",         label: "Tout" },
  { value: "status",      label: "Statut" },
  { value: "deliverable", label: "Livrables" },
  { value: "task",        label: "Tâches" },
  { value: "decision",    label: "Décisions" },
  { value: "contract",    label: "Contrat" },
  { value: "note",        label: "Notes" },
  { value: "member",      label: "Équipe" },
];

const fmt = (d) =>
  new Date(d).toLocaleDateString("fr-DZ", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const ProjectHistory = ({ projectId }) => {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [filter,  setFilter]  = useState("all");

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    setLoading(true);
    setError(false);
    projectService.getHistory(projectId)
      .then(d => { if (active) setEvents(d.events || []); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [projectId]);

  const shown = useMemo(
    () => (filter === "all" ? events : events.filter(e => e.category === filter)),
    [events, filter]
  );

  // Only show filter chips for categories that actually have events
  const availableFilters = useMemo(() => {
    const present = new Set(events.map(e => e.category));
    return FILTER_OPTS.filter(o => o.value === "all" || present.has(o.value));
  }, [events]);

  if (loading) {
    return (
      <div className="spinner-wrap" style={{ padding: 60 }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="empty-state" style={{ padding: "48px 24px" }}>
          <div className="empty-state-title">Historique indisponible</div>
          <div className="empty-state-desc">Impossible de charger l'historique du projet.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="filters-bar" style={{ marginBottom: 18, flexWrap: "wrap" }}>
        {availableFilters.map(o => (
          <button key={o.value}
            className={`filter-btn${filter === o.value ? " active" : ""}`}
            onClick={() => setFilter(o.value)}>
            {o.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "56px 24px" }}>
            <div className="empty-state-title">Aucun événement</div>
            <div className="empty-state-desc">
              L'historique du projet apparaîtra ici au fur et à mesure.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          {/* Vertical timeline line */}
          <div style={{
            position: "absolute", left: 19, top: 0, bottom: 0,
            width: 2, background: "#f0eded", zIndex: 0,
          }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <AnimatePresence>
              {shown.map((ev, i) => {
                const meta = CAT_META[ev.category] || {
                  label: ev.category, color: "#6b7280", bg: "#f9fafb", icon: "•",
                };
                const fileUrl = resolveUrl(ev.meta?.fileUrl);
                return (
                  <motion.div key={ev.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    style={{ display: "flex", gap: 16, paddingBottom: 18, position: "relative" }}>
                    {/* Dot */}
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: meta.bg, border: `2px solid ${meta.color}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, zIndex: 1, fontSize: "1rem",
                    }}>
                      {meta.icon}
                    </div>

                    {/* Content card */}
                    <div className="card" style={{
                      flex: 1, padding: "12px 16px",
                      borderLeft: `3px solid ${meta.color}`, marginBottom: 0,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between",
                        alignItems: "flex-start", gap: 12, marginBottom: 4 }}>
                        <span style={{
                          padding: "2px 10px", borderRadius: 20, fontSize: "0.7rem",
                          fontWeight: 700, color: meta.color, background: meta.bg,
                        }}>
                          {meta.label}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: "var(--d-muted)",
                          whiteSpace: "nowrap", flexShrink: 0 }}>
                          {fmt(ev.at)}
                        </span>
                      </div>

                      <div style={{ fontSize: "0.85rem", fontWeight: 700,
                        color: "var(--d-ink)", marginBottom: ev.description ? 2 : 0 }}>
                        {ev.title}
                      </div>

                      {ev.description && (
                        <div style={{ fontSize: "0.8rem", color: "var(--d-muted)",
                          lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                          {ev.description}
                        </div>
                      )}

                      {(ev.actorName || fileUrl) && (
                        <div style={{ display: "flex", gap: 12, marginTop: 6,
                          alignItems: "center", flexWrap: "wrap" }}>
                          {ev.actorName && (
                            <span style={{ fontSize: "0.72rem", color: "var(--d-muted)" }}>
                              par {ev.actorName}
                            </span>
                          )}
                          {fileUrl && (
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: "0.72rem", fontWeight: 700,
                                color: meta.color, textDecoration: "none" }}>
                              📎 Ouvrir le document
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectHistory;
