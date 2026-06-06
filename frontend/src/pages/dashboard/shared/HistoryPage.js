


import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import activityService2 from "../../../services/activityService2";

const ACTION_META = {
  pitch_sent:        { label: "Offre envoyée",       color: "#7c3aed", bg: "#f3f0ff", icon: "📤" },
  pitch_accepted:    { label: "Offre acceptée",      color: "#10b981", bg: "#f0fdf4", icon: "✅" },
  project_created:   { label: "Projet créé",         color: "#0891b2", bg: "#f0f9ff", icon: "📁" },
  project_completed: { label: "Projet terminé",      color: "#059669", bg: "#ecfdf5", icon: "🏁" },
  contract_signed:   { label: "Contrat finalisé",    color: "#c0152a", bg: "#fff5f5", icon: "📝" },
  post_created:      { label: "Post publié",         color: "#d97706", bg: "#fffbeb", icon: "📣" },
  post_closed:       { label: "Post fermé",          color: "#6b7280", bg: "#f9fafb", icon: "🔒" },
  user_registered:   { label: "Inscription",         color: "#7c3aed", bg: "#f3f0ff", icon: "👤" },
  member_created:    { label: "Membre créé",         color: "#0891b2", bg: "#f0f9ff", icon: "👥" },
  ad_created:        { label: "Publicité créée",     color: "#d97706", bg: "#fffbeb", icon: "📢" },
};

const FILTER_OPTS = [
  { value: "all",             label: "Toutes" },
  { value: "pitch_sent",      label: "Offres envoyées" },
  { value: "pitch_accepted",  label: "Offres acceptées" },
  { value: "project_created", label: "Projets" },
  { value: "contract_signed", label: "Contrats" },
  { value: "post_created",    label: "Posts" },
];

const fmt = (d) =>
  new Date(d).toLocaleDateString("fr-DZ", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const HistoryPage = () => {
  const [logs,     setLogs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(1);
  const [total,    setTotal]    = useState(0);

  const load = useCallback((pg = 1, actionType = "all") => {
    setLoading(true);
    activityService2.getMy({
      page: pg,
      limit: 20,
      ...(actionType !== "all" && { actionType }),
    })
      .then(d => {
        setLogs(d.logs || []);
        setTotal(d.total || 0);
        setPages(d.pages || 1);
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(page, filter);
  }, [page, filter, load]);

  const handleFilter = (f) => {
    setFilter(f);
    setPage(1);
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Historique</h2>
          <p>{total} événement{total !== 1 ? "s" : ""} enregistré{total !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="filters-bar" style={{ marginBottom: 20, flexWrap: "wrap" }}>
        {FILTER_OPTS.map(o => (
          <button key={o.value}
            className={`filter-btn${filter === o.value ? " active" : ""}`}
            onClick={() => handleFilter(o.value)}>
            {o.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrap" style={{ padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : logs.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "64px 24px" }}>
            <div className="empty-state-title">Aucun événement</div>
            <div className="empty-state-desc">
              Votre historique d'activité apparaîtra ici au fur et à mesure de vos actions.
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ position: "relative" }}>
            {}
            <div style={{
              position: "absolute", left: 19, top: 0, bottom: 0,
              width: 2, background: "#f0eded", zIndex: 0,
            }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <AnimatePresence>
                {logs.map((log, i) => {
                  const meta = ACTION_META[log.actionType] || {
                    label: log.actionType, color: "#6b7280", bg: "#f9fafb", icon: "•",
                  };
                  return (
                    <motion.div key={log._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      style={{ display: "flex", gap: 16, paddingBottom: 20, position: "relative" }}>
                      {}
                      <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: meta.bg, border: `2px solid ${meta.color}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, zIndex: 1, fontSize: "1rem",
                      }}>
                        {meta.icon}
                      </div>

                      {}
                      <div className="card" style={{
                        flex: 1, padding: "12px 16px",
                        borderLeft: `3px solid ${meta.color}`,
                        marginBottom: 0,
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
                            {fmt(log.createdAt)}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.83rem", color: "var(--d-ink)", lineHeight: 1.5 }}>
                          {log.description}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {}
          {pages > 1 && (
            <div style={{ display: "flex", gap: 8, justifyContent: "center",
              alignItems: "center", marginTop: 8 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{ padding: "7px 14px", borderRadius: 8,
                  border: "1.5px solid var(--d-border-soft)",
                  background: "none", cursor: page <= 1 ? "default" : "pointer",
                  fontSize: "0.82rem", color: page <= 1 ? "#d1d5db" : "var(--d-ink)",
                  fontFamily: "inherit", fontWeight: 600 }}>
                Précédent
              </button>
              <span style={{ fontSize: "0.82rem", color: "var(--d-muted)" }}>
                Page {page} / {pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page >= pages}
                style={{ padding: "7px 14px", borderRadius: 8,
                  border: "1.5px solid var(--d-border-soft)",
                  background: "none", cursor: page >= pages ? "default" : "pointer",
                  fontSize: "0.82rem", color: page >= pages ? "#d1d5db" : "var(--d-ink)",
                  fontFamily: "inherit", fontWeight: 600 }}>
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HistoryPage;
