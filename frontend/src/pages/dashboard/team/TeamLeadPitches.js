import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import pitchService from "../../../services/pitchService";
import { getSocket } from "../../../services/socketService";
import { IconSend } from "../../../components/ui/Icons";

const STATUS_META = {
  pending:   { label: "En attente", color: "#f59e0b", bg: "#fffbeb" },
  accepted:  { label: "Acceptée",   color: "#10b981", bg: "#f0fdf4" },
  rejected:  { label: "Rejetée",    color: "#ef4444", bg: "#fef2f2" },
  withdrawn: { label: "Retirée",    color: "#6b7280", bg: "#f9fafb" },
};

const FILTER_TABS = [
  { v: "all",       l: "Toutes"     },
  { v: "pending",   l: "En attente" },
  { v: "accepted",  l: "Acceptées"  },
  { v: "rejected",  l: "Rejetées"   },
  { v: "withdrawn", l: "Retirées"   },
];

const fmt = (d) => d
  ? new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" })
  : "—";

const PAGE_SIZE = 12;


const PitchCard = ({ p, index, onWithdraw, withdrawing }) => {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[p.status] || STATUS_META.pending;
  const s = p.strategy || {};
  const c = p.content  || {};
  const a = p.analysis || {};
  const t = p.targetAudience || {};

  const hasDetails = p.description || s.strategyOverview || c.contentPillars?.length
    || a.competitiveAnalysis || t.ageMin || t.locations?.length;

  return (
    <motion.div
      key={p._id}
      className="card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{ padding: "18px 22px", borderLeft: `3px solid ${meta.color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: 4 }}>
            {p.post?.title || "Post supprimé"}
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {p.proposedPrice?.amount && (
              <div style={{ fontSize: "0.78rem", color: "#555" }}>
                Offre : <strong>{p.proposedPrice.amount.toLocaleString()} {p.proposedPrice.currency || "DZD"}</strong>
              </div>
            )}
            {p.timeline?.duration && (
              <div style={{ fontSize: "0.78rem", color: "#555" }}>
                Durée : <strong>{p.timeline.duration} {p.timeline.unit === "days" ? "j" : p.timeline.unit === "weeks" ? "sem" : "mois"}</strong>
              </div>
            )}
            <div style={{ fontSize: "0.78rem", color: "var(--d-muted)" }}>
              Envoyée le {fmt(p.createdAt)}
            </div>
          </div>

          {expanded && (
            <div style={{ marginTop: 12, borderTop: "1px solid var(--d-border-soft)", paddingTop: 12 }}>
              {p.description && (
                <div style={{ fontSize: "0.82rem", color: "#444", lineHeight: 1.6, marginBottom: 10 }}>
                  {p.description}
                </div>
              )}
              {s.strategyOverview && (
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: "0.72rem", color: "#888", fontWeight: 600 }}>Stratégie : </span>
                  <span style={{ fontSize: "0.82rem", color: "#333" }}>{s.strategyOverview}</span>
                </div>
              )}
              {s.creativeIdea && (
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: "0.72rem", color: "#888", fontWeight: 600 }}>Idée créative : </span>
                  <span style={{ fontSize: "0.82rem", color: "#333" }}>{s.creativeIdea}</span>
                </div>
              )}
              {s.objectives && (
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: "0.72rem", color: "#888", fontWeight: 600 }}>Objectifs : </span>
                  <span style={{ fontSize: "0.82rem", color: "#333" }}>{s.objectives}</span>
                </div>
              )}
              {c.contentPillars?.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: "0.72rem", color: "#888", fontWeight: 600, marginBottom: 4 }}>Piliers de contenu</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {c.contentPillars.map((v, i) => (
                      <span key={i} style={{ padding: "2px 10px", borderRadius: 20, fontSize: "0.7rem",
                        fontWeight: 600, background: "#f3f0ff", color: "#7c3aed" }}>{v}</span>
                    ))}
                  </div>
                </div>
              )}
              {a.competitiveAnalysis && (
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: "0.72rem", color: "#888", fontWeight: 600 }}>Analyse concurrentielle : </span>
                  <span style={{ fontSize: "0.82rem", color: "#333" }}>{a.competitiveAnalysis}</span>
                </div>
              )}
              {(t.ageMin || t.ageMax || t.gender) && (
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: "0.72rem", color: "#888", fontWeight: 600 }}>Audience : </span>
                  <span style={{ fontSize: "0.82rem", color: "#333" }}>
                    {[t.ageMin && t.ageMax ? `${t.ageMin}–${t.ageMax} ans` : null, t.gender].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              {t.locations?.length > 0 && (
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: "0.72rem", color: "#888", fontWeight: 600 }}>Localisations : </span>
                  <span style={{ fontSize: "0.82rem", color: "#333" }}>{t.locations.join(", ")}</span>
                </div>
              )}
            </div>
          )}

          {hasDetails && (
            <button onClick={() => setExpanded(e => !e)}
              style={{ marginTop: 8, background: "none", border: "none", cursor: "pointer",
                fontSize: "0.72rem", color: "#059669", fontWeight: 600,
                fontFamily: "inherit", padding: 0 }}>
              {expanded ? "Réduire ▲" : "Voir détails ▼"}
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <span style={{ padding: "3px 11px", borderRadius: 20, fontSize: "0.7rem",
            fontWeight: 700, background: meta.bg, color: meta.color,
            whiteSpace: "nowrap" }}>
            {meta.label}
          </span>
          {p.status === "pending" && (
            <button
              onClick={() => onWithdraw(p)}
              disabled={withdrawing === p._id}
              style={{ padding: "4px 12px", borderRadius: 8, fontSize: "0.72rem",
                fontWeight: 600, cursor: "pointer",
                border: "1px solid #ef4444", color: "#ef4444",
                background: "none", opacity: withdrawing === p._id ? 0.5 : 1 }}>
              {withdrawing === p._id ? "..." : "Retirer"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const TeamLeadPitches = ({ user }) => {
  const [allPitches,  setAllPitches]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState("all");
  const [page,        setPage]        = useState(1);
  const [withdrawing, setWithdrawing] = useState(null);

  const load = useCallback(() => {
    if (!user?._id) return;
    setLoading(true);
    pitchService.getMy(user._id, "Team")
      .then(d => setAllPitches(d.pitches || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?._id]);

  useEffect(() => { load(); }, [load]);

  
  useEffect(() => {
    const socket = getSocket();
    const onPitchUpdate = () => load();
    const onNotif = ({ notification }) => {
      if (notification?.category === "pitches") load();
    };
    socket.on("pitch_update",     onPitchUpdate);
    socket.on("new_notification", onNotif);
    return () => {
      socket.off("pitch_update",     onPitchUpdate);
      socket.off("new_notification", onNotif);
    };
  }, [load]);

  const filtered = filter === "all"
    ? allPitches
    : allPitches.filter(p => p.status === filter);

  const pages   = Math.ceil(filtered.length / PAGE_SIZE);
  const pitches = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleWithdraw = async (pitch) => {
    if (!window.confirm("Retirer cette offre ?")) return;
    setWithdrawing(pitch._id);
    try {
      await pitchService.withdraw(pitch._id, user._id, "Team");
      setAllPitches(prev => prev.map(p =>
        p._id === pitch._id ? { ...p, status: "withdrawn" } : p
      ));
    } catch {}
    setWithdrawing(null);
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Mes offres</h2>
          <p style={{ color: "var(--d-muted)" }}>
            {filtered.length} offre{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {FILTER_TABS.map(tab => (
          <button key={tab.v}
            onClick={() => { setFilter(tab.v); setPage(1); }}
            style={{ padding: "6px 16px", borderRadius: 20, fontSize: "0.78rem",
              fontWeight: 600, cursor: "pointer", border: "none",
              background: filter === tab.v ? "#059669" : "#f3f4f6",
              color: filter === tab.v ? "#fff" : "#555",
              transition: "background 0.15s, color 0.15s" }}>
            {tab.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : pitches.length === 0 ? (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ color: "#ccc", marginBottom: 12 }}><IconSend size={24} /></div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Aucune offre</div>
          <div style={{ fontSize: "0.8rem", color: "var(--d-muted)" }}>
            {filter !== "all" ? "Aucune offre dans ce statut" : "Parcourez les posts pour envoyer votre première offre"}
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={filter + page}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pitches.map((p, i) => (
                <PitchCard
                  key={p._id}
                  p={p}
                  index={i}
                  onWithdraw={handleWithdraw}
                  withdrawing={withdrawing}
                />
              ))}
            </div>

            {pages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: "6px 14px", borderRadius: 8, fontSize: "0.78rem",
                    border: "1px solid #ddd", background: "none", cursor: "pointer",
                    opacity: page === 1 ? 0.4 : 1 }}>
                  Précédent
                </button>
                <span style={{ padding: "6px 14px", fontSize: "0.78rem", color: "var(--d-muted)" }}>
                  {page} / {pages}
                </span>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                  style={{ padding: "6px 14px", borderRadius: 8, fontSize: "0.78rem",
                    border: "1px solid #ddd", background: "none", cursor: "pointer",
                    opacity: page === pages ? 0.4 : 1 }}>
                  Suivant
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default TeamLeadPitches;
