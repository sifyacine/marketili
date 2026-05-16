import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePitchesForClient } from "../../hooks/usePitches";
import pitchService from "../../services/pitchService";
import { IconInbox, IconSearch } from "../../components/ui/Icons";

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

const fmt = (d) =>
  new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" });

const ClientPitches = ({ user }) => {
  const { pitches, loading, refetch } = usePitchesForClient(user?._id);
  const [statusF,    setStatusF]    = useState("all");
  const [search,     setSearch]     = useState("");
  const [actionLoad, setActionLoad] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const filtered = useMemo(() => {
    let data = [...pitches];
    if (statusF !== "all") data = data.filter(p => p.status === statusF);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(p =>
        p.post?.title?.toLowerCase().includes(q) ||
        p.senderAgency?.agencyName?.toLowerCase().includes(q) ||
        p.senderTeam?.teamName?.toLowerCase().includes(q) ||
        p.senderFreelancer?.firstName?.toLowerCase().includes(q)
      );
    }
    return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [pitches, statusF, search]);

  const handleAccept = async (pitch) => {
    if (!window.confirm("Accepter cette offre ? Les autres offres en attente seront automatiquement rejetées.")) return;
    setActionLoad(pitch._id);
    try {
      await pitchService.accept(pitch._id, user._id);
      setSuccessMsg("Offre acceptée — le projet a été créé.");
      refetch();
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally {
      setActionLoad(null);
    }
  };

  const handleReject = async (pitch) => {
    const reason = window.prompt("Raison du rejet (optionnel) :");
    if (reason === null) return;
    setActionLoad(pitch._id);
    try {
      await pitchService.reject(pitch._id, user._id, reason);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally {
      setActionLoad(null);
    }
  };

  const counts = useMemo(() => {
    const c = { pending: 0, accepted: 0, rejected: 0, withdrawn: 0 };
    pitches.forEach(p => { if (c[p.status] !== undefined) c[p.status]++; });
    return c;
  }, [pitches]);

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Offres reçues</h2>
          <p>{pitches.length} offre{pitches.length !== 1 ? "s" : ""} au total</p>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "En attente", count: counts.pending,   color: "#f59e0b" },
          { label: "Acceptées",  count: counts.accepted,  color: "#10b981" },
          { label: "Rejetées",   count: counts.rejected,  color: "#ef4444" },
          { label: "Retirées",   count: counts.withdrawn, color: "#6b7280" },
        ].map(s => (
          <div key={s.label} style={{
            padding: "10px 16px", borderRadius: 10, background: "var(--d-surface)",
            border: "1px solid var(--d-border-soft)", minWidth: 100, flex: 1,
          }}>
            <div style={{ fontWeight: 700, fontSize: "1.25rem", color: s.color }}>{s.count}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--d-muted)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {successMsg && (
        <div style={{
          background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8,
          padding: "12px 16px", marginBottom: 16, color: "#065f46", fontSize: "0.85rem",
        }}>
          {successMsg}
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <span style={{
            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
            color: "var(--d-muted)", pointerEvents: "none", display: "flex",
          }}>
            <IconSearch size={14} />
          </span>
          <input
            className="filter-input"
            style={{ paddingLeft: 32 }}
            placeholder="Rechercher par post ou prestataire..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {FILTER_TABS.map(t => (
            <button key={t.v}
              className={`filter-btn${statusF === t.v ? " active" : ""}`}
              onClick={() => setStatusF(t.v)}
              style={{ padding: "7px 12px", fontSize: "0.78rem" }}>
              {t.l}
            </button>
          ))}
        </div>
        <span style={{ fontSize: "0.73rem", color: "var(--d-muted)", whiteSpace: "nowrap" }}>
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><IconInbox size={20} /></div>
            <div className="empty-state-title">Aucune offre trouvée</div>
            <div className="empty-state-desc">
              {search || statusF !== "all"
                ? "Essayez d'autres filtres."
                : "Vous n'avez pas encore reçu d'offres."}
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ overflow: "auto" }}>
          <table className="data-grid">
            <thead>
              <tr>
                <th>Prestataire</th>
                <th>Post</th>
                <th>Prix proposé</th>
                <th>Durée</th>
                <th>Statut</th>
                <th>Reçue le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((pitch, i) => {
                  const meta = STATUS_META[pitch.status] || STATUS_META.pending;
                  const senderName = pitch.senderAgency?.agencyName
                    || pitch.senderTeam?.teamName
                    || (pitch.senderFreelancer
                      ? `${pitch.senderFreelancer.firstName} ${pitch.senderFreelancer.lastName || ""}`.trim()
                      : "—");
                  const senderTypeLabel = pitch.senderAgency ? "Agence"
                    : pitch.senderTeam ? "Équipe" : "Freelancer";

                  return (
                    <motion.tr
                      key={pitch._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.025 }}
                      style={{ borderLeft: `3px solid ${meta.color}` }}
                    >
                      <td>
                        <div className="td-title">{senderName}</div>
                        <div className="td-sub">{senderTypeLabel}</div>
                      </td>
                      <td>
                        <div style={{
                          fontWeight: 600, fontSize: "0.82rem", color: "var(--d-ink)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          maxWidth: 180,
                        }}>
                          {pitch.post?.title || "Post supprimé"}
                        </div>
                      </td>
                      <td>
                        {pitch.proposedPrice?.amount
                          ? `${pitch.proposedPrice.amount.toLocaleString()} ${pitch.proposedPrice.currency || "DZD"}`
                          : <span className="td-muted">—</span>}
                      </td>
                      <td className="td-muted">
                        {pitch.timeline?.duration
                          ? `${pitch.timeline.duration} ${pitch.timeline.unit === "days" ? "j" : pitch.timeline.unit === "weeks" ? "sem" : "mois"}`
                          : "—"}
                      </td>
                      <td>
                        <span style={{
                          padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem",
                          fontWeight: 700, background: meta.bg, color: meta.color,
                        }}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="td-muted">{fmt(pitch.createdAt)}</td>
                      <td onClick={e => e.stopPropagation()}>
                        {pitch.status === "pending" && (
                          <div style={{ display: "flex", gap: 4 }}>
                            <button
                              style={{
                                padding: "4px 10px", borderRadius: 6, border: "none",
                                background: "#d1fae5", color: "#065f46",
                                cursor: actionLoad === pitch._id ? "not-allowed" : "pointer",
                                fontSize: "0.72rem", fontWeight: 600,
                                opacity: actionLoad === pitch._id ? 0.5 : 1,
                                fontFamily: "inherit",
                              }}
                              disabled={!!actionLoad}
                              onClick={() => handleAccept(pitch)}
                            >
                              Accepter
                            </button>
                            <button
                              style={{
                                padding: "4px 10px", borderRadius: 6, border: "none",
                                background: "#fee2e2", color: "#991b1b",
                                cursor: actionLoad === pitch._id ? "not-allowed" : "pointer",
                                fontSize: "0.72rem", fontWeight: 600,
                                opacity: actionLoad === pitch._id ? 0.5 : 1,
                                fontFamily: "inherit",
                              }}
                              disabled={!!actionLoad}
                              onClick={() => handleReject(pitch)}
                            >
                              Rejeter
                            </button>
                          </div>
                        )}
                        {pitch.status === "accepted" && (
                          <span style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 600 }}>
                            Projet créé
                          </span>
                        )}
                        {pitch.rejectionReason && (
                          <div style={{ fontSize: "0.7rem", color: "var(--d-muted)", marginTop: 2 }}>
                            {pitch.rejectionReason}
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClientPitches;
