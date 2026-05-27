// frontend/src/components/contracts/ProviderContracts.js
// Shared contracts page for Freelancer and Team dashboards

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import contractService from "../../services/contractService";
import uploadService  from "../../services/uploadService";
import ContratProformaForm from "./ContratProformaForm";
import FileViewerModal from "../ui/FileViewerModal";

const STATUS_META = {
  draft:        { label: "À remplir",    color: "#f59e0b", bg: "#fffbeb" },
  sent:         { label: "Envoyé",       color: "#0891b2", bg: "#f0f9ff" },
  acknowledged: { label: "Reçu client", color: "#c0152a", bg: "#fff5f5" },
  signed:       { label: "Finalisé",    color: "#10b981", bg: "#f0fdf4" },
  resiliation:  { label: "Résilié",     color: "#ef4444", bg: "#fef2f2" },
};

const STEPS = [
  { key: "draft",        label: "Brouillon"    },
  { key: "sent",         label: "Envoyé"       },
  { key: "acknowledged", label: "Reçu client"  },
  { key: "signed",       label: "Finalisé"     },
];

const Stepper = ({ status }) => {
  const currentIdx = STEPS.findIndex(s => s.key === status);
  if (status === "resiliation") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8,
        padding: "8px 12px", borderRadius: 8, background: "#fef2f2" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#dc2626" }}>Résilié</span>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
      {STEPS.map((step, i) => {
        const done   = i < currentIdx;
        const active = i === currentIdx;
        const dotColor  = done ? "#10b981" : active ? "#c0152a" : "#d1d5db";
        const textColor = done ? "#10b981" : active ? "#c0152a" : "#9ca3af";
        return (
          <React.Fragment key={step.key}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%",
                border: `2px solid ${dotColor}`,
                background: (done || active) ? dotColor : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                {done && (
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span style={{ fontSize: "0.6rem", fontWeight: active ? 700 : 500,
                color: textColor, whiteSpace: "nowrap" }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? "#10b981" : "#e5e7eb",
                marginTop: 8, minWidth: 16, borderRadius: 2 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const ProviderContracts = ({ user, partyType }) => {
  const [contracts, setContracts] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [filter,    setFilter]    = useState("all");

  const load = () => {
    setLoading(true);
    contractService.getAll(user._id, partyType)
      .then(d => setContracts(d.contracts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user._id, partyType]);

  const filtered = filter === "all"
    ? contracts
    : contracts.filter(c => c.status === filter);

  if (selected) {
    return (
      <ProviderContractDetail
        contract={selected}
        user={user}
        onBack={() => { setSelected(null); load(); }}
        onRefresh={() =>
          contractService.getById(selected._id)
            .then(d => setSelected(d.contract))
            .catch(() => {})
        }
      />
    );
  }

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Contrats</h2>
          <p>{contracts.length} contrat{contracts.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="filters-bar" style={{ marginBottom: 16 }}>
        {[
          { value: "all",          label: "Tous"         },
          { value: "draft",        label: "À remplir"    },
          { value: "sent",         label: "Envoyés"      },
          { value: "acknowledged", label: "Reçu client"  },
          { value: "signed",       label: "Finalisés"    },
          { value: "resiliation",  label: "Résiliés"     },
        ].map(o => (
          <button key={o.value}
            className={`filter-btn${filter === o.value ? " active" : ""}`}
            onClick={() => setFilter(o.value)}>
            {o.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "64px 24px" }}>
            <div className="empty-state-title">Aucun contrat</div>
            <div className="empty-state-desc">
              {filter === "draft"
                ? "Aucun contrat en attente de votre part."
                : "Les contrats liés à vos projets apparaissent ici."}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <AnimatePresence>
            {filtered.map((c, i) => {
              const meta = STATUS_META[c.status] || STATUS_META.draft;
              return (
                <motion.div key={c._id} className="card"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ delay: i * 0.04 }}
                  style={{ cursor: "pointer", borderLeft: `4px solid ${meta.color}` }}
                  onClick={() => setSelected(c)}>
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.92rem",
                          color: "var(--d-ink)", marginBottom: 3 }}>
                          {c.title || c.project?.title || "Contrat"}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--d-muted)" }}>
                          {c.partyBName} · {new Date(c.createdAt).toLocaleDateString("fr-DZ")}
                        </div>
                      </div>
                      <span style={{ padding: "3px 10px", borderRadius: 20,
                        fontSize: "0.72rem", fontWeight: 700,
                        color: meta.color, background: meta.bg, whiteSpace: "nowrap" }}>
                        {meta.label}
                      </span>
                    </div>
                    {c.status !== "resiliation" && <Stepper status={c.status} />}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

// ── Detail view ───────────────────────────────────────────────────────────────
const ProviderContractDetail = ({ contract: initial, user, onBack }) => {
  const [contract,         setContract]         = useState(initial);
  const [saving,           setSaving]           = useState(false);
  const [msg,              setMsg]              = useState("");
  const [error,            setError]            = useState("");
  const [showProformaForm, setShowProformaForm] = useState(false);
  const [viewer,           setViewer]           = useState(null);

  const meta = STATUS_META[contract.status] || STATUS_META.draft;

  const handleGeneratePdf = () => setShowProformaForm(true);

  const handleConfirmStart = async () => {
    setSaving(true); setError(""); setMsg("");
    try {
      const d = await contractService.confirmAndStart(contract._id, user._id);
      setContract(d.contract);
      setMsg("Projet démarré — contrat finalisé.");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur");
    } finally { setSaving(false); }
  };

  const handleSkip = async () => {
    if (!window.confirm("Ignorer le contrat et démarrer le projet directement ?")) return;
    setSaving(true); setError(""); setMsg("");
    try {
      const d = await contractService.skipContract(contract._id, user._id);
      setContract(d.contract);
      setMsg("Contrat ignoré — projet démarré.");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur");
    } finally { setSaving(false); }
  };

  if (showProformaForm) {
    return (
      <ContratProformaForm
        contract={contract}
        onSuccess={(updated) => {
          setContract(updated);
          setShowProformaForm(false);
          setMsg("Contrat PDF généré et envoyé au client via la messagerie.");
        }}
        onCancel={() => setShowProformaForm(false)}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {viewer && (
        <FileViewerModal url={viewer.url} filename={viewer.filename} onClose={() => setViewer(null)} />
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack}
          style={{ background: "none", border: "1.5px solid var(--d-border-soft)",
            borderRadius: 8, padding: "6px 14px", cursor: "pointer",
            fontSize: "0.82rem", color: "var(--d-muted)", fontFamily: "inherit", fontWeight: 600 }}>
          ← Retour
        </button>
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--d-ink)", marginBottom: 3 }}>
            {contract.title || "Contrat"}
          </h2>
          <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: "0.72rem",
            fontWeight: 700, color: meta.color, background: meta.bg }}>
            {meta.label}
          </span>
        </div>
      </div>

      {/* Progression */}
      <div className="card" style={{ padding: "16px 20px", marginBottom: 14 }}>
        <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--d-muted)",
          textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
          Progression
        </div>
        <Stepper status={contract.status} />
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {msg && (
          <motion.div key="msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ padding: "10px 14px", borderRadius: 8, background: "#f0fdf4",
              border: "1px solid #bbf7d0", color: "#166534", fontSize: "0.82rem",
              fontWeight: 600, marginBottom: 14 }}>
            {msg}
          </motion.div>
        )}
        {error && (
          <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ padding: "10px 14px", borderRadius: 8, background: "#fef2f2",
              border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.82rem",
              fontWeight: 600, marginBottom: 14 }}>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action card */}
      {contract.status === "draft" && (
        <div className="card" style={{ padding: "16px 20px", marginBottom: 14,
          borderLeft: "4px solid #f59e0b", background: "#fffbeb" }}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#92400e", marginBottom: 6 }}>
            Action requise — Remplir le contrat
          </div>
          <p style={{ fontSize: "0.82rem", color: "#78350f", lineHeight: 1.5, marginBottom: 14 }}>
            Veuillez remplir le formulaire contrat proforma. Un PDF sera généré et envoyé au client.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={handleGeneratePdf} disabled={saving} className="section-cta-btn">
              Remplir le Contrat Proforma
            </button>
            <button onClick={handleSkip} disabled={saving}
              style={{ padding: "9px 16px", borderRadius: 8, border: "1.5px solid #9ca3af",
                background: "none", color: "#6b7280", fontWeight: 600, fontSize: "0.82rem",
                cursor: "pointer", fontFamily: "inherit" }}>
              Ignorer — démarrer le projet
            </button>
          </div>
        </div>
      )}

      {contract.status === "sent" && (
        <div className="card" style={{ padding: "16px 20px", marginBottom: 14,
          borderLeft: "4px solid #0891b2", background: "#f0f9ff" }}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0369a1", marginBottom: 6 }}>
            En attente du reçu client
          </div>
          <p style={{ fontSize: "0.82rem", color: "#0c4a6e", lineHeight: 1.5, marginBottom: 14 }}>
            Le contrat a été envoyé au client. En attente de son reçu de paiement.
          </p>
          <button onClick={handleSkip} disabled={saving}
            style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid #9ca3af",
              background: "none", color: "#6b7280", fontWeight: 600, fontSize: "0.8rem",
              cursor: "pointer", fontFamily: "inherit" }}>
            Ignorer — démarrer sans reçu
          </button>
        </div>
      )}

      {contract.status === "acknowledged" && (
        <div className="card" style={{ padding: "16px 20px", marginBottom: 14,
          borderLeft: "4px solid #c0152a" }}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--d-ink)", marginBottom: 6 }}>
            Reçu client reçu — confirmer pour démarrer
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--d-muted)", lineHeight: 1.5, marginBottom: 14 }}>
            Le client a uploadé son reçu. Confirmez pour activer le projet.
          </p>
          <button onClick={handleConfirmStart} disabled={saving} className="section-cta-btn">
            {saving ? "..." : "Confirmer et démarrer le projet"}
          </button>
        </div>
      )}

      {contract.status === "signed" && (
        <div className="card" style={{ padding: "16px 20px", marginBottom: 14,
          borderLeft: "4px solid #10b981", background: "#f0fdf4" }}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#166534" }}>
            Contrat finalisé — projet actif
          </div>
        </div>
      )}

      {/* Contract info */}
      {(contract.partyBName || contract.objet) && (
        <div className="card" style={{ padding: "16px 20px", marginBottom: 14 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--d-muted)",
            textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
            Détails
          </div>
          {contract.partyBName && (
            <div style={{ fontSize: "0.83rem", color: "var(--d-muted)", marginBottom: 6 }}>
              <strong>Client :</strong> {contract.partyBName}
            </div>
          )}
          {contract.objet && (
            <div style={{ fontSize: "0.83rem", color: "var(--d-muted)", marginBottom: 6 }}>
              <strong>Objet :</strong> {contract.objet}
            </div>
          )}
          {contract.financialTerms?.amount && (
            <div style={{ fontSize: "0.83rem", fontWeight: 700, color: "#c0152a" }}>
              {contract.financialTerms.amount.toLocaleString()} {contract.financialTerms.currency || "DZD"}
            </div>
          )}
        </div>
      )}

      {/* Document links */}
      {contract.contractPdf?.url && (
        <div className="card" style={{ padding: "14px 20px", marginBottom: 14 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--d-muted)",
            textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            Documents
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "8px 12px", borderRadius: 8, border: "1px solid var(--d-border-soft)", gap: 12 }}>
            <span style={{ fontSize: "0.83rem", fontWeight: 600, color: "var(--d-ink)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
              {contract.contractPdf.filename || "Contrat PDF"}
            </span>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={() => setViewer({ url: contract.contractPdf.url, filename: contract.contractPdf.filename || "Contrat.pdf" })}
                style={{ padding: "5px 12px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 600,
                  border: "1.5px solid #c0152a", background: "#fff5f5", color: "#c0152a",
                  cursor: "pointer", fontFamily: "inherit" }}>
                Visualiser
              </button>
              <a href={`${uploadService.resolveUrl(contract.contractPdf.url)}?download=1`}
                style={{ padding: "5px 10px", borderRadius: 6, fontSize: "0.78rem", fontWeight: 600,
                  border: "1.5px solid var(--d-border-soft)", background: "none", color: "var(--d-muted)",
                  textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                ↓
              </a>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProviderContracts;
