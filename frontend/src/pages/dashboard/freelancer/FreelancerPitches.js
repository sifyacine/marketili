import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import freelancerService from "../../../services/freelancerService";
import pitchService from "../../../services/pitchService";
import uploadService from "../../../services/uploadService";
import { getSocket } from "../../../services/socketService";
import { IconSend } from "../../../components/ui/Icons";

const STATUS_META = {
  pending:   { label: "En attente", color: "#f59e0b", bg: "#fffbeb" },
  accepted:  { label: "Acceptée",   color: "#10b981", bg: "#f0fdf4" },
  rejected:  { label: "Rejetée",    color: "#ef4444", bg: "#fef2f2" },
  withdrawn: { label: "Retirée",    color: "#6b7280", bg: "#f9fafb" },
};

const CONTRACT_TYPE_LABEL = { cdd: "CDD", cdi: "CDI" };

const FILTER_TABS = [
  { v: "all",         l: "Toutes"        },
  { v: "pending",     l: "En attente"    },
  { v: "accepted",    l: "Acceptées"     },
  { v: "rejected",    l: "Rejetées"      },
  { v: "withdrawn",   l: "Retirées"      },
  { v: "conventions", l: "Conventions"   },
];

const fmt = (d) => d
  ? new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" })
  : "—";

// ── Convention card ────────────────────────────────────────────
const ConventionCard = ({ p, index }) => {
  const [expanded, setExpanded] = useState(false);
  const meta      = STATUS_META[p.status] || STATUS_META.pending;
  const agencyName = p.senderAgency?.agencyName || "Agence inconnue";

  return (
    <motion.div
      key={p._id}
      className="card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{ padding: "18px 22px", borderLeft: "3px solid #7c3aed" }}>

      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: "0.65rem",
              fontWeight: 700, background: "#7c3aed18", color: "#7c3aed" }}>
              Convention
            </span>
            {p.contractType && (
              <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: "0.65rem",
                fontWeight: 700, background: "#0891b218", color: "#0891b2" }}>
                {CONTRACT_TYPE_LABEL[p.contractType] || p.contractType}
              </span>
            )}
          </div>
          <div style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: 4 }}>
            Convention de collaboration — {agencyName}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--d-muted)", marginBottom: 6 }}>
            Reçue le {fmt(p.createdAt)}
          </div>
          {p.description && (
            <div style={{ fontSize: "0.78rem", color: "#555", lineHeight: 1.55,
              display: "-webkit-box", WebkitLineClamp: expanded ? "none" : 2,
              WebkitBoxOrient: "vertical", overflow: expanded ? "visible" : "hidden" }}>
              {p.description}
            </div>
          )}
          {p.workRequirements && expanded && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#555",
                marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Conditions de travail
              </div>
              <div style={{ fontSize: "0.78rem", color: "#555", lineHeight: 1.55 }}>
                {p.workRequirements}
              </div>
            </div>
          )}
          {p.attachments?.length > 0 && expanded && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#555",
                marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Pièces jointes
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {p.attachments.map((att, i) => (
                  <a key={i} href={uploadService.resolveUrl(att.url)}
                    target="_blank" rel="noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 8,
                      padding: "7px 11px", borderRadius: 8, background: "#f5f5f5",
                      border: "1px solid #eee", color: "#333",
                      textDecoration: "none", fontSize: "0.8rem", fontWeight: 500 }}>
                    📎 {att.filename || `Fichier ${i + 1}`}
                  </a>
                ))}
              </div>
            </div>
          )}
          {(p.description || p.workRequirements || p.attachments?.length > 0) && (
            <button onClick={() => setExpanded(e => !e)}
              style={{ marginTop: 8, background: "none", border: "none", cursor: "pointer",
                fontSize: "0.72rem", color: "#7c3aed", fontWeight: 600,
                fontFamily: "inherit", padding: 0 }}>
              {expanded ? "Réduire ▲" : "Voir détails ▼"}
            </button>
          )}
        </div>

        <span style={{ padding: "3px 11px", borderRadius: 20, fontSize: "0.7rem",
          fontWeight: 700, background: meta.bg, color: meta.color,
          whiteSpace: "nowrap", flexShrink: 0 }}>
          {meta.label}
        </span>
      </div>
    </motion.div>
  );
};

// ── Pitch card ─────────────────────────────────────────────────
const PitchCard = ({ p, index, onWithdraw, withdrawing }) => {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[p.status] || STATUS_META.pending;

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
          {p.post?.budget && (
            <div style={{ fontSize: "0.75rem", color: "var(--d-muted)", marginBottom: 6 }}>
              Budget client : {p.post.budget.toLocaleString("fr-DZ")} DZD
            </div>
          )}
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
          {p.description && (
            <div style={{ fontSize: "0.78rem", color: "#555", marginTop: 8,
              lineHeight: 1.55, display: "-webkit-box",
              WebkitLineClamp: expanded ? "none" : 2,
              WebkitBoxOrient: "vertical", overflow: expanded ? "visible" : "hidden" }}>
              {p.description}
            </div>
          )}
          {p.attachments?.length > 0 && expanded && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#555",
                marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Pièces jointes
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {p.attachments.map((att, i) => (
                  <a key={i} href={uploadService.resolveUrl(att.url)}
                    target="_blank" rel="noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 8,
                      padding: "7px 11px", borderRadius: 8, background: "#f5f5f5",
                      border: "1px solid #eee", color: "#333",
                      textDecoration: "none", fontSize: "0.8rem", fontWeight: 500 }}>
                    📎 {att.filename || `Fichier ${i + 1}`}
                  </a>
                ))}
              </div>
            </div>
          )}
          {(p.description || p.attachments?.length > 0) && (
            <button onClick={() => setExpanded(e => !e)}
              style={{ marginTop: 6, background: "none", border: "none", cursor: "pointer",
                fontSize: "0.72rem", color: "#7c3aed", fontWeight: 600,
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

// ═════════════════════════════════════════════════════════════
// ROOT
// ═════════════════════════════════════════════════════════════
const FreelancerPitches = ({ user }) => {
  const [pitches,     setPitches]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState("all");
  const [page,        setPage]        = useState(1);
  const [total,       setTotal]       = useState(0);
  const [pages,       setPages]       = useState(1);
  const [withdrawing, setWithdrawing] = useState(null);

  const load = useCallback(() => {
    if (!user?._id) return;
    setLoading(true);
    const params = { page, limit: 12 };
    if (filter !== "all" && filter !== "conventions") params.status = filter;
    freelancerService.getPitches(user._id, params)
      .then(d => {
        setPitches(d.pitches || []);
        setTotal(d.total || 0);
        setPages(d.pages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?._id, filter, page]);

  useEffect(() => { load(); }, [load]);

  // Real-time: refetch when pitch status changes or a pitch notification arrives
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

  const handleWithdraw = async (pitch) => {
    if (!window.confirm("Retirer cette offre ?")) return;
    setWithdrawing(pitch._id);
    try {
      await pitchService.withdraw(pitch._id, user._id, "Freelancer");
      setPitches(prev => prev.map(p =>
        p._id === pitch._id ? { ...p, status: "withdrawn" } : p
      ));
    } catch {}
    setWithdrawing(null);
  };

  const handleFilterChange = (v) => {
    setFilter(v);
    setPage(1);
  };

  const displayed = filter === "conventions"
    ? pitches.filter(p => p.pitchType === "agency_to_freelancer")
    : pitches;

  const sentCount = pitches.filter(p => p.pitchType !== "agency_to_freelancer").length;
  const convCount = pitches.filter(p => p.pitchType === "agency_to_freelancer").length;

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Mes offres & conventions</h2>
          <p style={{ color: "var(--d-muted)" }}>
            {sentCount} offre{sentCount !== 1 ? "s" : ""} envoyée{sentCount !== 1 ? "s" : ""}
            {convCount > 0 && ` · ${convCount} convention${convCount !== 1 ? "s" : ""} reçue${convCount !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab.v}
            onClick={() => handleFilterChange(tab.v)}
            style={{
              padding: "6px 16px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600,
              cursor: "pointer", border: "none",
              background: filter === tab.v ? "#7c3aed" : "#f3f4f6",
              color: filter === tab.v ? "#fff" : "#555",
              transition: "background 0.15s, color 0.15s",
            }}>
            {tab.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : displayed.length === 0 ? (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ color: "#ccc", marginBottom: 12 }}><IconSend size={24} /></div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            {filter === "conventions" ? "Aucune convention" : "Aucune offre"}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--d-muted)" }}>
            {filter === "conventions"
              ? "Aucune convention de collaboration reçue"
              : filter !== "all"
              ? "Aucune offre dans ce statut"
              : "Explorez les posts et envoyez votre première offre"}
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={filter + page}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {displayed.map((p, i) =>
                p.pitchType === "agency_to_freelancer"
                  ? <ConventionCard key={p._id} p={p} index={i} />
                  : <PitchCard key={p._id} p={p} index={i}
                      onWithdraw={handleWithdraw} withdrawing={withdrawing} />
              )}
            </div>

            {pages > 1 && filter !== "conventions" && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ padding: "6px 14px", borderRadius: 8, fontSize: "0.78rem",
                    border: "1px solid #ddd", background: "none", cursor: "pointer",
                    opacity: page === 1 ? 0.4 : 1 }}>
                  Précédent
                </button>
                <span style={{ padding: "6px 14px", fontSize: "0.78rem", color: "var(--d-muted)" }}>
                  {page} / {pages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pages, p + 1))}
                  disabled={page === pages}
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

export default FreelancerPitches;
