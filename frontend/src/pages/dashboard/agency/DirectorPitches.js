import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMyPitches } from "../../../hooks/usePitches";
import pitchService from "../../../services/pitchService";
import useAuth from "../../../hooks/useAuth";
import { IconSend, IconSearch } from "../../../components/ui/Icons";

const STATUS_META = {
  pending:   { label: "En attente", color: "#f59e0b", bg: "#fffbeb" },
  accepted:  { label: "Acceptée",   color: "#10b981", bg: "#f0fdf4" },
  rejected:  { label: "Rejetée",    color: "#ef4444", bg: "#fef2f2" },
  withdrawn: { label: "Retirée",    color: "#6b7280", bg: "#f9fafb" },
};

const INTERNAL_META = {
  draft:               { label: "Brouillon",            color: "#6b7280", bg: "#f9fafb" },
  with_chef_de_projet: { label: "Chez le chef projet",  color: "#f59e0b", bg: "#fffbeb" },
  approved:            { label: "Approuvée",             color: "#10b981", bg: "#f0fdf4" },
  sent:                { label: "Envoyée au client",     color: "#7c3aed", bg: "#f3f0ff" },
};

const FILTER_TABS = [
  { v: "all",       l: "Toutes"      },
  { v: "pending",   l: "En attente"  },
  { v: "accepted",  l: "Acceptées"   },
  { v: "rejected",  l: "Rejetées"    },
  { v: "withdrawn", l: "Retirées"    },
];

const INTERNAL_TABS = [
  { v: "all",               l: "Toutes"           },
  { v: "draft",             l: "Brouillons"       },
  { v: "with_chef_de_projet", l: "En validation"  },
  { v: "approved",          l: "Approuvées"       },
  { v: "sent",              l: "Envoyées"         },
];

const fmt = (d) =>
  new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" });

// ── InternalWorkflowPanel ─────────────────────────────────────────────────────
const InternalWorkflowPanel = ({ pitch, jobTitle, onUpdated }) => {
  const [busy,  setBusy]  = useState(false);
  const [notes, setNotes] = useState(pitch.internalNotes || "");
  const [open,  setOpen]  = useState(false);

  const canAct = {
    strategist:     pitch.internalStatus === "draft",
    chef_de_projet: pitch.internalStatus === "with_chef_de_projet",
    director:       pitch.internalStatus === "approved",
  }[jobTitle];

  const actions = {
    strategist:    [{ label: "Soumettre au chef de projet", newStatus: "with_chef_de_projet", color: "#f59e0b" }],
    chef_de_projet:[
      { label: "Valider", newStatus: "approved", color: "#10b981" },
      { label: "Retourner au stratège", newStatus: "draft", color: "#6b7280" },
    ],
    director:      [{ label: "Envoyer au client", newStatus: "sent", color: "#7c3aed" }],
  }[jobTitle] || [];

  const handle = async (newStatus) => {
    setBusy(true);
    try {
      await pitchService.setInternalStatus(pitch._id, newStatus, jobTitle, notes);
      onUpdated();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally {
      setBusy(false);
    }
  };

  if (!canAct) return null;

  return (
    <div style={{ marginTop: 6 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: "none", border: "none", cursor: "pointer",
          fontFamily: "inherit", fontSize: "0.72rem", color: "var(--d-muted)",
          fontWeight: 600, padding: 0 }}>
        {open ? "Masquer les actions" : "Voir les actions internes"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ paddingTop: 8 }}>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Notes internes (optionnel)"
                rows={2}
                style={{ width: "100%", fontFamily: "inherit", fontSize: "0.78rem",
                  borderRadius: 6, border: "1px solid var(--d-border-soft)",
                  padding: "6px 10px", resize: "vertical", boxSizing: "border-box",
                  background: "var(--d-surface)", color: "var(--d-ink)" }}
              />
              <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                {actions.map(a => (
                  <button key={a.newStatus} onClick={() => handle(a.newStatus)} disabled={busy}
                    style={{ padding: "5px 12px", borderRadius: 7, border: "none",
                      background: a.color + "22", color: a.color,
                      fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 700,
                      cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.5 : 1 }}>
                    {busy ? "..." : a.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ROOT
// ═════════════════════════════════════════════════════════════════════════════
const DirectorPitches = ({ user }) => {
  const { user: authUser } = useAuth();
  const jobTitle = authUser?.jobTitle || (authUser?.role === "agency" ? "director" : "");
  const isDirector = jobTitle === "director" || authUser?.role === "agency";

  const { pitches, loading, refetch } = useMyPitches(user?._id, "Agency");
  const [statusF,      setStatusF]      = useState("all");
  const [internalF,    setInternalF]    = useState("all");
  const [search,       setSearch]       = useState("");
  const [actionLoad,   setActionLoad]   = useState(null);
  const [showInternal, setShowInternal] = useState(false);

  const filtered = useMemo(() => {
    let data = [...pitches];
    if (showInternal) {
      if (internalF !== "all") data = data.filter(p => p.internalStatus === internalF);
    } else {
      if (statusF !== "all") data = data.filter(p => p.status === statusF);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(p =>
        p.post?.title?.toLowerCase().includes(q) ||
        p.client?.firstName?.toLowerCase().includes(q) ||
        p.client?.companyName?.toLowerCase().includes(q)
      );
    }
    return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [pitches, statusF, internalF, search, showInternal]);

  const handleWithdraw = async (pitch) => {
    if (!window.confirm("Retirer cette offre ?")) return;
    setActionLoad(pitch._id);
    try {
      await pitchService.withdraw(pitch._id, user._id, "Agency");
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

  const internalCounts = useMemo(() => {
    const c = { draft: 0, with_chef_de_projet: 0, approved: 0, sent: 0 };
    pitches.forEach(p => { if (c[p.internalStatus] !== undefined) c[p.internalStatus]++; });
    return c;
  }, [pitches]);

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Mes offres envoyées</h2>
          <p>{pitches.length} offre{pitches.length !== 1 ? "s" : ""} au total</p>
        </div>
        {/* Toggle internal workflow view */}
        <button
          onClick={() => setShowInternal(o => !o)}
          style={{ padding: "7px 14px", borderRadius: 8, fontFamily: "inherit",
            fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
            border: "1.5px solid var(--d-border-soft)",
            background: showInternal ? "var(--d-ink)" : "var(--d-surface)",
            color: showInternal ? "var(--d-surface)" : "var(--d-ink)" }}>
          {showInternal ? "Vue client" : "Workflow interne"}
        </button>
      </div>

      {/* Stats row */}
      {!showInternal ? (
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "En attente",  count: counts.pending,   color: "#f59e0b" },
            { label: "Acceptées",   count: counts.accepted,  color: "#10b981" },
            { label: "Rejetées",    count: counts.rejected,  color: "#ef4444" },
            { label: "Retirées",    count: counts.withdrawn, color: "#6b7280" },
          ].map(s => (
            <div key={s.label} style={{ padding: "10px 16px", borderRadius: 10,
              background: "var(--d-surface)", border: "1px solid var(--d-border-soft)",
              minWidth: 100, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "1.25rem", color: s.color }}>{s.count}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--d-muted)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "Brouillons",       count: internalCounts.draft,               color: "#6b7280" },
            { label: "En validation",    count: internalCounts.with_chef_de_projet,  color: "#f59e0b" },
            { label: "Approuvées",       count: internalCounts.approved,             color: "#10b981" },
            { label: "Envoyées client",  count: internalCounts.sent,                color: "#7c3aed" },
          ].map(s => (
            <div key={s.label} style={{ padding: "10px 16px", borderRadius: 10,
              background: "var(--d-surface)", border: "1px solid var(--d-border-soft)",
              minWidth: 100, flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "1.25rem", color: s.color }}>{s.count}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--d-muted)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
            color: "var(--d-muted)", pointerEvents: "none", display: "flex" }}>
            <IconSearch size={14} />
          </span>
          <input className="filter-input" style={{ paddingLeft: 32 }}
            placeholder="Rechercher par post ou client..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {(!showInternal ? FILTER_TABS : INTERNAL_TABS).map(t => (
            <button key={t.v}
              className={`filter-btn${(!showInternal ? statusF : internalF) === t.v ? " active" : ""}`}
              onClick={() => showInternal ? setInternalF(t.v) : setStatusF(t.v)}
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
            <div className="empty-state-icon"><IconSend size={20} /></div>
            <div className="empty-state-title">Aucune offre trouvée</div>
            <div className="empty-state-desc">
              {search || statusF !== "all" || internalF !== "all"
                ? "Essayez d'autres filtres."
                : "Vous n'avez pas encore envoyé d'offres."}
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ overflow: "auto" }}>
          <table className="data-grid">
            <thead>
              <tr>
                <th>Post</th>
                <th>Client</th>
                <th>Prix proposé</th>
                {showInternal
                  ? <th>Statut interne</th>
                  : <th>Statut</th>}
                <th>Date d'envoi</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((pitch, i) => {
                  const meta = STATUS_META[pitch.status] || STATUS_META.pending;
                  const imeta = INTERNAL_META[pitch.internalStatus] || INTERNAL_META.draft;
                  const clientName = pitch.client?.accountType === "company"
                    ? pitch.client.companyName
                    : pitch.client?.firstName
                      ? `${pitch.client.firstName} ${pitch.client.lastName || ""}`.trim()
                      : "—";

                  return (
                    <motion.tr key={pitch._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.025 }}
                      style={{ borderLeft: `3px solid ${showInternal ? imeta.color : meta.color}` }}>
                      <td>
                        <div className="td-title">{pitch.post?.title || "Post supprimé"}</div>
                        {pitch.post?.deadline && (
                          <div className="td-sub">Échéance : {fmt(pitch.post.deadline)}</div>
                        )}
                        {showInternal && pitch.internalNotes && (
                          <div className="td-sub" style={{ fontStyle: "italic", marginTop: 2 }}>
                            {pitch.internalNotes}
                          </div>
                        )}
                        {showInternal && (
                          <InternalWorkflowPanel
                            pitch={pitch}
                            jobTitle={jobTitle}
                            onUpdated={refetch}
                          />
                        )}
                      </td>
                      <td className="td-muted">{clientName}</td>
                      <td>
                        {pitch.proposedPrice?.amount
                          ? `${pitch.proposedPrice.amount.toLocaleString()} ${pitch.proposedPrice.currency || "DZD"}`
                          : <span className="td-muted">—</span>}
                      </td>
                      <td>
                        {showInternal ? (
                          <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem",
                            fontWeight: 700, background: imeta.bg, color: imeta.color }}>
                            {imeta.label}
                          </span>
                        ) : (
                          <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem",
                            fontWeight: 700, background: meta.bg, color: meta.color }}>
                            {meta.label}
                          </span>
                        )}
                      </td>
                      <td className="td-muted">{fmt(pitch.createdAt)}</td>
                      <td>
                        {pitch.status === "pending" && !showInternal && (
                          <button
                            style={{ padding: "4px 10px", borderRadius: 6, border: "none",
                              background: "#fee2e2", color: "#991b1b",
                              cursor: actionLoad === pitch._id ? "not-allowed" : "pointer",
                              fontSize: "0.72rem", fontWeight: 600,
                              opacity: actionLoad === pitch._id ? 0.5 : 1, fontFamily: "inherit" }}
                            disabled={actionLoad === pitch._id}
                            onClick={() => handleWithdraw(pitch)}>
                            Retirer
                          </button>
                        )}
                        {pitch.status === "accepted" && !showInternal && (
                          <span style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 600 }}>
                            Projet créé
                          </span>
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

export default DirectorPitches;
