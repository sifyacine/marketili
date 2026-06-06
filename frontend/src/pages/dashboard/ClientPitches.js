import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePitchesForClient } from "../../hooks/usePitches";
import pitchService from "../../services/pitchService";
import uploadService from "../../services/uploadService";
import { IconInbox, IconSearch } from "../../components/ui/Icons";


const PitchDetailModal = ({ pitch, onClose }) => {
  if (!pitch) return null;
  const s = pitch.strategy || {};
  const c = pitch.content   || {};
  const a = pitch.analysis  || {};
  const t = pitch.targetAudience || {};

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 800, fontSize: "0.78rem", letterSpacing: "0.07em",
        textTransform: "uppercase", color: "#c0152a", marginBottom: 8 }}>
        {title}
      </div>
      {children}
    </div>
  );
  const Row = ({ label, value }) => value ? (
    <div style={{ marginBottom: 6 }}>
      <span style={{ fontSize: "0.72rem", color: "#888", fontWeight: 600 }}>{label} : </span>
      <span style={{ fontSize: "0.82rem", color: "#333" }}>{value}</span>
    </div>
  ) : null;
  const Tags = ({ label, values }) => values?.length ? (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: "0.72rem", color: "#888", fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {values.map((v, i) => (
          <span key={i} style={{ padding: "2px 10px", borderRadius: 20, fontSize: "0.7rem",
            fontWeight: 600, background: "#f3f0ff", color: "#7c3aed" }}>
            {v}
          </span>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "28px 28px 24px",
        width: "100%", maxWidth: 600, maxHeight: "85vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>Détail de l'offre</div>
            <div style={{ fontSize: "0.78rem", color: "#888", marginTop: 2 }}>
              {pitch.post?.title || "Post supprimé"}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer",
            fontSize: "1.1rem", color: "#999", padding: "2px 6px" }}>✕</button>
        </div>

        {(s.strategyOverview || s.creativeIdea || s.objectives) && (
          <Section title="Stratégie">
            <Row label="Aperçu" value={s.strategyOverview} />
            <Row label="Idée créative" value={s.creativeIdea} />
            <Row label="Objectifs" value={s.objectives} />
            <Row label="Buts mesurables" value={s.measurableGoals} />
            <Row label="Techniques" value={s.techniques} />
          </Section>
        )}

        {(c.contentPillars?.length || c.postingFrequency || c.publicationCalendar) && (
          <Section title="Contenu">
            <Tags label="Piliers de contenu" values={c.contentPillars} />
            <Row label="Fréquence de posting" value={c.postingFrequency} />
            <Row label="Calendrier" value={c.publicationCalendar} />
            <Row label="Organisation du feed" value={c.feedOrganization} />
          </Section>
        )}

        {(a.competitiveAnalysis || a.colorPalette?.length || a.positioningStrategy) && (
          <Section title="Analyse">
            <Row label="Analyse concurrentielle" value={a.competitiveAnalysis} />
            <Tags label="Palette de couleurs" values={a.colorPalette} />
            <Row label="Positionnement" value={a.positioningStrategy} />
          </Section>
        )}

        {(t.ageMin || t.ageMax || t.gender || t.niche?.length || t.locations?.length) && (
          <Section title="Audience cible">
            {(t.ageMin || t.ageMax) && (
              <Row label="Âge" value={[t.ageMin, t.ageMax].filter(Boolean).join(" – ")} />
            )}
            <Row label="Genre" value={t.gender} />
            <Tags label="Niches" values={t.niche} />
            <Tags label="Localisations" values={t.locations} />
          </Section>
        )}

        {pitch.description && (
          <Section title="Description">
            <p style={{ fontSize: "0.85rem", color: "#444", lineHeight: 1.6, margin: 0 }}>
              {pitch.description}
            </p>
          </Section>
        )}

        <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
          {pitch.proposedPrice?.amount && (
            <div style={{ padding: "10px 16px", borderRadius: 10, background: "#f8f8f8",
              border: "1px solid #eee", textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#c0152a" }}>
                {pitch.proposedPrice.amount.toLocaleString()} {pitch.proposedPrice.currency || "DZD"}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#888" }}>Prix proposé</div>
            </div>
          )}
          {pitch.timeline?.duration && (
            <div style={{ padding: "10px 16px", borderRadius: 10, background: "#f8f8f8",
              border: "1px solid #eee", textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>
                {pitch.timeline.duration} {pitch.timeline.unit === "days" ? "j" : pitch.timeline.unit === "weeks" ? "sem" : "mois"}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#888" }}>Durée</div>
            </div>
          )}
        </div>

        {pitch.attachments?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 700, fontSize: "0.78rem", color: "#c0152a",
              textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
              Fichiers joints
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {pitch.attachments.map((att, i) => {
                const src = uploadService.resolveUrl(att.url);
                const isImg = att.mimeType?.startsWith("image/") ||
                  /\.(jpe?g|png|gif|webp|svg)$/i.test(att.filename || "");
                return isImg ? (
                  <a key={i} href={src} target="_blank" rel="noreferrer">
                    <img src={src} alt={att.filename}
                      onError={e => { e.target.style.display = "none"; }}
                      style={{ width: 100, height: 75, objectFit: "cover",
                        borderRadius: 6, border: "1px solid #eee", display: "block" }} />
                  </a>
                ) : (
                  <a key={i} href={src} target="_blank" rel="noreferrer" download
                    style={{ display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "6px 12px", borderRadius: 8, border: "1px solid #eee",
                      background: "#f8f8f8", fontSize: "0.78rem", color: "#444",
                      textDecoration: "none" }}>
                    📎 {att.filename || "Fichier"}
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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


const AcceptModal = ({ pitch, onConfirm, onClose }) => {
  const [withContract, setWithContract] = useState(false);
  if (!pitch) return null;

  const providerName =
    pitch.senderAgency?.agencyName ||
    pitch.senderTeam?.teamName ||
    [pitch.senderFreelancer?.firstName, pitch.senderFreelancer?.lastName].filter(Boolean).join(" ") ||
    "le prestataire";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      zIndex: 9500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "28px 28px 24px",
        width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
        <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#1a0a0a", marginBottom: 6 }}>
          Accepter cette offre ?
        </div>
        <div style={{ fontSize: "0.82rem", color: "#9a6060", marginBottom: 20, lineHeight: 1.5 }}>
          Vous allez accepter l'offre de <strong>{providerName}</strong>. Les autres offres en attente seront automatiquement rejetées.
        </div>

        {}
        <div style={{ background: "#f9f9f9", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1a0a0a", marginBottom: 12,
            textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Mode de démarrage
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
              <input type="radio" name="contractMode" checked={!withContract}
                onChange={() => setWithContract(false)}
                style={{ marginTop: 2, accentColor: "#c0152a" }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1a0a0a" }}>
                  Démarrer directement
                </div>
                <div style={{ fontSize: "0.75rem", color: "#9a6060", lineHeight: 1.4 }}>
                  Le projet est créé immédiatement, sans contrat formel.
                </div>
              </div>
            </label>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
              <input type="radio" name="contractMode" checked={withContract}
                onChange={() => setWithContract(true)}
                style={{ marginTop: 2, accentColor: "#c0152a" }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1a0a0a" }}>
                  Avec contrat
                </div>
                <div style={{ fontSize: "0.75rem", color: "#9a6060", lineHeight: 1.4 }}>
                  Le prestataire remplira un contrat proforma → PDF → vous envoyez un reçu → projet démarré.
                </div>
              </div>
            </label>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose}
            style={{ padding: "9px 20px", borderRadius: 8, border: "1.5px solid #f0dede",
              background: "none", cursor: "pointer", fontSize: "0.85rem",
              color: "#9a6060", fontFamily: "inherit", fontWeight: 600 }}>
            Annuler
          </button>
          <button onClick={() => onConfirm(withContract)}
            style={{ padding: "9px 22px", borderRadius: 8, border: "none",
              background: "#c0152a", color: "#fff", cursor: "pointer",
              fontSize: "0.85rem", fontFamily: "inherit", fontWeight: 700 }}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

const ClientPitches = ({ user }) => {
  const { pitches, loading, refetch } = usePitchesForClient(user?._id);
  const [statusF,       setStatusF]       = useState("all");
  const [search,        setSearch]        = useState("");
  const [actionLoad,    setActionLoad]    = useState(null);
  const [successMsg,    setSuccessMsg]    = useState("");
  const [selectedPitch, setSelectedPitch] = useState(null);
  const [acceptTarget,  setAcceptTarget]  = useState(null);

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

  const handleAccept = (pitch) => setAcceptTarget(pitch);

  const handleAcceptConfirm = async (withContract) => {
    const pitch = acceptTarget;
    setAcceptTarget(null);
    setActionLoad(pitch._id);
    try {
      await pitchService.accept(pitch._id, user._id, withContract);
      setSuccessMsg(withContract
        ? "Offre acceptée — le prestataire doit remplir le contrat pour démarrer le projet."
        : "Offre acceptée — le projet a été créé.");
      refetch();
      setTimeout(() => setSuccessMsg(""), 6000);
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

      {}
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

      {}
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

      {selectedPitch && (
        <PitchDetailModal pitch={selectedPitch} onClose={() => setSelectedPitch(null)} />
      )}

      {}
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
                      <td data-label="Prestataire">
                        <div className="td-title">{senderName}</div>
                        <div className="td-sub">{senderTypeLabel}</div>
                      </td>
                      <td data-label="Post">
                        <div style={{
                          fontWeight: 600, fontSize: "0.82rem", color: "var(--d-ink)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          maxWidth: 180,
                        }}>
                          {pitch.post?.title || "Post supprimé"}
                        </div>
                      </td>
                      <td data-label="Prix proposé">
                        {pitch.proposedPrice?.amount
                          ? `${pitch.proposedPrice.amount.toLocaleString()} ${pitch.proposedPrice.currency || "DZD"}`
                          : <span className="td-muted">—</span>}
                      </td>
                      <td data-label="Durée" className="td-muted">
                        {pitch.timeline?.duration
                          ? `${pitch.timeline.duration} ${pitch.timeline.unit === "days" ? "j" : pitch.timeline.unit === "weeks" ? "sem" : "mois"}`
                          : "—"}
                      </td>
                      <td data-label="Statut">
                        <span style={{
                          padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem",
                          fontWeight: 700, background: meta.bg, color: meta.color,
                        }}>
                          {meta.label}
                        </span>
                      </td>
                      <td data-label="Reçue le" className="td-muted">{fmt(pitch.createdAt)}</td>
                      <td data-label="" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedPitch(pitch)}
                          style={{ padding: "3px 9px", borderRadius: 6, border: "1px solid #ddd",
                            background: "none", cursor: "pointer", fontSize: "0.7rem",
                            color: "#555", fontFamily: "inherit", marginBottom: 6, display: "block" }}>
                          Voir détail
                        </button>
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

      <AcceptModal
        pitch={acceptTarget}
        onConfirm={handleAcceptConfirm}
        onClose={() => setAcceptTarget(null)}
      />
    </div>
  );
};

export default ClientPitches;
