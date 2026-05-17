// frontend/src/pages/dashboard/agency/DirectorContracts.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import contractService from "../../../services/contractService";
import { IconFileText, IconCheckSquare } from "../../../components/ui/Icons";
import ContratProformaForm from "../../../components/contracts/ContratProformaForm";

// ── Status system ─────────────────────────────────────────────────────────────
const STATUS_META = {
  draft:        { label: "Brouillon",     color: "#6b7280", bg: "#f9fafb" },
  sent:         { label: "Envoyé",        color: "#f59e0b", bg: "#fffbeb" },
  acknowledged: { label: "Reçu confirmé", color: "#0891b2", bg: "#f0f9ff" },
  signed:       { label: "Finalisé",      color: "#10b981", bg: "#f0fdf4" },
  resiliation:  { label: "Résilié",       color: "#ef4444", bg: "#fef2f2" },
};

const STEPS = [
  { key: "draft",        label: "Brouillon"      },
  { key: "sent",         label: "Envoyé"         },
  { key: "acknowledged", label: "Reçu confirmé"  },
  { key: "signed",       label: "Finalisé"       },
];

const STATUS_OPTS = [
  { value: "all",          label: "Tous"           },
  { value: "draft",        label: "Brouillon"      },
  { value: "sent",         label: "Envoyé"         },
  { value: "acknowledged", label: "Reçu confirmé"  },
  { value: "signed",       label: "Finalisé"       },
  { value: "resiliation",  label: "Résilié"        },
];

const CONTRACT_TYPE_LABEL = {
  service_agreement: "Convention de prestation",
  collaboration:     "Convention de collaboration",
  cdd:               "CDD",
  cdi:               "CDI",
  project:           "Projet ponctuel",
};

// ── Status stepper ────────────────────────────────────────────────────────────
const ContractStatusStepper = ({ status }) => {
  const isResiliation = status === "resiliation";
  const currentIdx = isResiliation ? -1 : STEPS.findIndex(s => s.key === status);

  if (isResiliation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "center", gap: 10,
          padding: "10px 18px", borderRadius: 10,
          background: "#fef2f2", border: "1px solid #fecaca" }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%",
          background: "#ef4444", flexShrink: 0 }} />
        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#dc2626" }}>
          Contrat résilié
        </span>
      </motion.div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 0, padding: "4px 0" }}>
      {STEPS.map((step, i) => {
        const done   = i < currentIdx;
        const active = i === currentIdx;
        const dotColor = done ? "#10b981" : active ? "#c0152a" : "#d1d5db";
        const textColor = done ? "#10b981" : active ? "#c0152a" : "#9ca3af";
        const lineColor = done ? "#10b981" : "#e5e7eb";

        return (
          <React.Fragment key={step.key}>
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%",
                border: `2.5px solid ${dotColor}`,
                background: (done || active) ? dotColor : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.3s" }}>
                {done && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {active && (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
                )}
              </div>
              <span style={{ fontSize: "0.65rem", fontWeight: active ? 700 : 500,
                color: textColor, whiteSpace: "nowrap", letterSpacing: "0.01em" }}>
                {step.label}
              </span>
            </motion.div>

            {i < STEPS.length - 1 && (
              <motion.div
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: done ? 1 : 0.3 }}
                transition={{ delay: i * 0.08 + 0.04, duration: 0.4 }}
                style={{ flex: 1, height: 2.5, background: lineColor,
                  marginTop: 10, minWidth: 20, borderRadius: 2 }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Director contracts page ───────────────────────────────────────────────────
const DirectorContracts = ({ user }) => {
  const [contracts, setContracts] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("all");
  const [fromDate,  setFromDate]  = useState("");
  const [toDate,    setToDate]    = useState("");
  const [selected,  setSelected]  = useState(null);

  const load = (params = {}) => {
    setLoading(true);
    contractService.getAll(user._id, "Agency", {
      status: filter !== "all" ? filter : undefined,
      fromDate: fromDate || undefined,
      toDate:   toDate   || undefined,
      ...params,
    })
      .then(d => setContracts(d.contracts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user._id, filter]);

  const handleFilterApply = () => load();

  const refresh = () =>
    contractService.getAll(user._id, "Agency")
      .then(d => setContracts(d.contracts || []))
      .catch(() => {});

  if (selected) {
    return (
      <ContractDetail
        contract={selected}
        user={user}
        onBack={() => { setSelected(null); refresh(); }}
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

      {/* Status filter tabs */}
      <div className="filters-bar" style={{ marginBottom: 14 }}>
        {STATUS_OPTS.map(o => (
          <button key={o.value}
            className={`filter-btn${filter === o.value ? " active" : ""}`}
            onClick={() => setFilter(o.value)}>
            {o.label}
          </button>
        ))}
      </div>

      {/* Date range filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap",
        alignItems: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: "0.72rem", fontWeight: 600,
            color: "var(--d-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Du
          </label>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
            className="dash-form-input" style={{ width: 160, padding: "7px 12px" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: "0.72rem", fontWeight: 600,
            color: "var(--d-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Au
          </label>
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
            className="dash-form-input" style={{ width: 160, padding: "7px 12px" }} />
        </div>
        <button onClick={handleFilterApply} className="section-cta-btn"
          style={{ padding: "8px 18px", fontSize: "0.82rem" }}>
          Filtrer
        </button>
        {(fromDate || toDate) && (
          <button onClick={() => { setFromDate(""); setToDate(""); load({ fromDate: undefined, toDate: undefined }); }}
            style={{ fontSize: "0.8rem", color: "var(--d-muted)", background: "none",
              border: "1px solid var(--d-border-soft)", borderRadius: 8,
              padding: "8px 14px", cursor: "pointer", fontFamily: "inherit" }}>
            Effacer dates
          </button>
        )}
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : contracts.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "64px 24px" }}>
            <div className="empty-state-icon"><IconFileText size={20} /></div>
            <div className="empty-state-title">Aucun contrat</div>
            <div className="empty-state-desc">
              Créez un contrat depuis la vue détail d'un projet.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <AnimatePresence>
            {contracts.map((c, i) => {
              const meta = STATUS_META[c.status] || STATUS_META.draft;
              return (
                <motion.div key={c._id} className="card"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} transition={{ delay: i * 0.03 }}
                  style={{ cursor: "pointer",
                    borderLeft: `4px solid ${meta.color}`,
                    opacity: c.status === "resiliation" ? 0.7 : 1 }}
                  onClick={() => setSelected(c)}>
                  <div style={{ padding: "18px 22px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between",
                      alignItems: "flex-start", gap: 16 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem",
                          color: "var(--d-ink)", marginBottom: 5 }}>
                          {c.title || c.project?.title || "Contrat"}
                        </div>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap",
                          fontSize: "0.78rem", color: "var(--d-muted)" }}>
                          <span>Client : {c.partyBName}</span>
                          <span>{CONTRACT_TYPE_LABEL[c.contractType] || c.contractType}</span>
                          <span>{new Date(c.createdAt).toLocaleDateString("fr-DZ")}</span>
                          {c.financialTerms?.amount && (
                            <span style={{ fontWeight: 600, color: "var(--d-ink)" }}>
                              {c.financialTerms.amount.toLocaleString()} {c.financialTerms.currency || "DZD"}
                            </span>
                          )}
                        </div>
                      </div>
                      <span style={{ padding: "4px 12px", borderRadius: 20,
                        fontSize: "0.74rem", fontWeight: 700,
                        color: meta.color, background: meta.bg, whiteSpace: "nowrap",
                        flexShrink: 0 }}>
                        {meta.label}
                      </span>
                    </div>

                    {/* Mini stepper preview */}
                    {c.status !== "resiliation" && (
                      <div style={{ marginTop: 12, paddingTop: 10,
                        borderTop: "1px solid var(--d-border-soft)" }}>
                        <ContractStatusStepper status={c.status} />
                      </div>
                    )}
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

// ── Contract detail — director can manage workflow ────────────────────────────
const ContractDetail = ({ contract: initial, user, onBack, onRefresh }) => {
  const [contract,        setContract]        = useState(initial);
  const [saving,          setSaving]          = useState(false);
  const [msg,             setMsg]             = useState("");
  const [error,           setError]           = useState("");
  const [showResiliate,   setShowResiliate]   = useState(false);
  const [resilReason,     setResilReason]     = useState("");
  const [bdcForm,         setBdcForm]         = useState({ url: "", filename: "" });
  const [showBdc,         setShowBdc]         = useState(false);
  const [showProformaForm, setShowProformaForm] = useState(false);

  const meta = STATUS_META[contract.status] || STATUS_META.draft;

  const refresh = async () => {
    try {
      const d = await contractService.getById(contract._id);
      setContract(d.contract);
    } catch {}
  };

  const handleSend = async () => {
    setSaving(true); setError(""); setMsg("");
    try {
      const d = await contractService.send(contract._id, user._id);
      setContract(d.contract);
      setMsg("Contrat envoyé au client.");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur");
    } finally { setSaving(false); }
  };

  const handleBdc = async (e) => {
    e.preventDefault();
    if (!bdcForm.url) return;
    setSaving(true); setError(""); setMsg("");
    try {
      const d = await contractService.sendBDC(contract._id, {
        sentBy:   user._id,
        url:      bdcForm.url,
        filename: bdcForm.filename || "bon-de-commande.pdf",
        fileId:   "",
      });
      setContract(d.contract);
      setMsg("Bon de commande envoyé — contrat finalisé.");
      setShowBdc(false);
      setBdcForm({ url: "", filename: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Erreur");
    } finally { setSaving(false); }
  };

  const handleResiliate = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const d = await contractService.resiliate(contract._id, user._id, resilReason);
      setContract(d.contract);
      setShowResiliate(false);
      setResilReason("");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur");
    } finally { setSaving(false); }
  };

  const DetailField = ({ label, value }) => {
    if (!value) return null;
    return (
      <div style={{ background: "var(--d-surface-alt)", borderRadius: 8, padding: "10px 14px" }}>
        <div style={{ fontSize: "0.66rem", fontWeight: 700, color: "var(--d-muted)",
          textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>
          {label}
        </div>
        <div style={{ fontSize: "0.83rem", color: "var(--d-ink)", lineHeight: 1.5 }}>{value}</div>
      </div>
    );
  };

  const DocLink = ({ label, filename, url }) => {
    if (!url) return null;
    return (
      <a href={url} target="_blank" rel="noreferrer"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "10px 14px", borderRadius: 8, border: "1px solid var(--d-border-soft)",
          background: "#fff", textDecoration: "none", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--d-muted)",
            textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>
            {label}
          </div>
          <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--d-ink)" }}>
            {filename || url}
          </div>
        </div>
        <span style={{ fontSize: "0.75rem", color: "#c0152a", fontWeight: 600,
          whiteSpace: "nowrap" }}>
          Télécharger ↗
        </span>
      </a>
    );
  };

  // Show proforma form in place of detail view
  if (showProformaForm) {
    return (
      <ContratProformaForm
        contract={contract}
        onSuccess={(updatedContract) => {
          setContract(updatedContract);
          setShowProformaForm(false);
          setMsg("Contrat PDF généré et envoyé au client via la messagerie.");
        }}
        onCancel={() => setShowProformaForm(false)}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}>
      {/* Back + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <button onClick={onBack}
          style={{ background: "none", border: "1.5px solid var(--d-border-soft)",
            borderRadius: 8, padding: "6px 14px", cursor: "pointer",
            fontSize: "0.82rem", color: "var(--d-muted)", fontFamily: "inherit", fontWeight: 600 }}>
          ← Retour
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--d-ink)",
            marginBottom: 3 }}>
            {contract.title || "Contrat"}
          </h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: "0.72rem",
              fontWeight: 700, color: meta.color, background: meta.bg }}>
              {meta.label}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--d-muted)" }}>
              {CONTRACT_TYPE_LABEL[contract.contractType] || contract.contractType}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--d-muted)" }}>
              {new Date(contract.createdAt).toLocaleDateString("fr-DZ")}
            </span>
          </div>
        </div>
      </div>

      {/* Status stepper */}
      <div className="card" style={{ padding: "18px 24px", marginBottom: 16 }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--d-muted)",
          textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
          Progression du contrat
        </div>
        <ContractStatusStepper status={contract.status} />
      </div>

      {/* Feedback messages */}
      <AnimatePresence>
        {msg && (
          <motion.div key="msg" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ padding: "12px 16px", borderRadius: 10, background: "#f0fdf4",
              border: "1px solid #bbf7d0", color: "#166534", fontSize: "0.83rem",
              fontWeight: 600, marginBottom: 14 }}>
            {msg}
          </motion.div>
        )}
        {error && (
          <motion.div key="err" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ padding: "12px 16px", borderRadius: 10, background: "#fef2f2",
              border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.83rem",
              fontWeight: 600, marginBottom: 14 }}>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workflow action card */}
      <WorkflowCard
        contract={contract}
        user={user}
        saving={saving}
        showBdc={showBdc}
        setShowBdc={setShowBdc}
        bdcForm={bdcForm}
        setBdcForm={setBdcForm}
        onSend={handleSend}
        onBdc={handleBdc}
        onOpenProforma={() => setShowProformaForm(true)}
      />

      {/* Parties */}
      <div className="card" style={{ padding: "18px 22px", marginBottom: 16 }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--d-muted)",
          textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
          Parties contractantes
        </div>
        <div style={{ display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 10 }}>
          <DetailField label="Prestataire (Partie A)" value={contract.partyAName} />
          <DetailField label="Client (Partie B)"      value={contract.partyBName} />
        </div>
      </div>

      {/* Contract content */}
      <div className="card" style={{ padding: "18px 22px", marginBottom: 16 }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--d-muted)",
          textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
          Contenu du contrat
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <DetailField label="Art. 01 — Objet"           value={contract.objet} />
          <DetailField label="Art. 02 — Prestations"     value={contract.prestations} />
          <DetailField label="Art. 03 — Livrables"       value={contract.livrables} />
          <DetailField label="Clauses additionnelles"     value={contract.additionalClauses} />
          <DetailField label="Conditions de résiliation"  value={contract.resiliationTerms} />
        </div>

        {(contract.confidentialityClause || contract.exclusivityClause) && (
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            {contract.confidentialityClause && (
              <span style={{ display: "flex", alignItems: "center", gap: 5,
                padding: "4px 10px", borderRadius: 20, fontSize: "0.72rem",
                fontWeight: 600, background: "#f0fdf4", color: "#166534" }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="#166534" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Confidentialité
              </span>
            )}
            {contract.exclusivityClause && (
              <span style={{ display: "flex", alignItems: "center", gap: 5,
                padding: "4px 10px", borderRadius: 20, fontSize: "0.72rem",
                fontWeight: 600, background: "#fffbeb", color: "#92400e" }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="#92400e" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Exclusivité
              </span>
            )}
          </div>
        )}
      </div>

      {/* Financial terms */}
      {contract.financialTerms?.amount && (
        <div className="card" style={{ padding: "18px 22px", marginBottom: 16 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--d-muted)",
            textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
            Art. 05 — Dispositions financières
          </div>
          <div style={{ display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 10 }}>
            <div style={{ background: "var(--d-surface-alt)", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: "0.66rem", fontWeight: 700, color: "var(--d-muted)",
                textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                Montant
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#c0152a" }}>
                {contract.financialTerms.amount.toLocaleString()}
                <span style={{ fontSize: "0.75rem", fontWeight: 600, marginLeft: 4,
                  color: "var(--d-muted)" }}>
                  {contract.financialTerms.currency || "DZD"}
                </span>
              </div>
            </div>
            <DetailField label="Mode de paiement"   value={contract.financialTerms.paymentMethod} />
            <DetailField label="Échéancier"          value={contract.financialTerms.paymentSchedule} />
          </div>
        </div>
      )}

      {/* Duration */}
      {(contract.duration?.startDate || contract.duration?.endDate) && (
        <div className="card" style={{ padding: "18px 22px", marginBottom: 16 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--d-muted)",
            textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
            Art. 08 — Durée
          </div>
          <div style={{ display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 10 }}>
            <DetailField label="Date de début" value={contract.duration?.startDate
              ? new Date(contract.duration.startDate).toLocaleDateString("fr-DZ") : null} />
            <DetailField label="Date de fin"   value={contract.duration?.endDate
              ? new Date(contract.duration.endDate).toLocaleDateString("fr-DZ") : null} />
          </div>
        </div>
      )}

      {/* Documents */}
      {(contract.contractPdf?.url || contract.receipt?.url || contract.bonDeCommande?.url) && (
        <div className="card" style={{ padding: "18px 22px", marginBottom: 16 }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--d-muted)",
            textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
            Documents
          </div>
          <DocLink label="Contrat PDF"       filename={contract.contractPdf?.filename}  url={contract.contractPdf?.url} />
          <DocLink label="Reçu client"       filename={contract.receipt?.filename}       url={contract.receipt?.url} />
          <DocLink label="Bon de commande"   filename={contract.bonDeCommande?.filename} url={contract.bonDeCommande?.url} />
        </div>
      )}

      {/* Resiliation zone */}
      {!["resiliation", "signed"].includes(contract.status) && (
        <div className="card" style={{ padding: "18px 22px", marginBottom: 16,
          borderTop: "3px solid #fecaca" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#dc2626",
            textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
            Zone de résiliation
          </div>
          <AnimatePresence mode="wait">
            {!showResiliate ? (
              <motion.div key="btn"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p style={{ fontSize: "0.82rem", color: "var(--d-muted)", marginBottom: 12,
                  lineHeight: 1.5 }}>
                  En cas de litige ou d'accord entre les parties, vous pouvez résilier ce contrat.
                  Cette action est irréversible.
                </p>
                <button onClick={() => setShowResiliate(true)}
                  style={{ padding: "9px 18px", borderRadius: 8, border: "1.5px solid #fecaca",
                    background: "#fef2f2", color: "#dc2626", fontWeight: 700,
                    fontSize: "0.83rem", cursor: "pointer", fontFamily: "inherit" }}>
                  Demander la résiliation
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleResiliate}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600,
                    color: "var(--d-muted)", display: "block", marginBottom: 6 }}>
                    Motif de résiliation
                  </label>
                  <textarea value={resilReason} onChange={e => setResilReason(e.target.value)}
                    className="dash-form-textarea" rows={3}
                    placeholder="Expliquez le motif de résiliation..." />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="submit" disabled={saving}
                    style={{ padding: "9px 18px", borderRadius: 8,
                      border: "none", background: "#dc2626", color: "#fff",
                      fontWeight: 700, fontSize: "0.83rem", cursor: "pointer",
                      fontFamily: "inherit" }}>
                    {saving ? "..." : "Confirmer la résiliation"}
                  </button>
                  <button type="button" onClick={() => setShowResiliate(false)}
                    style={{ padding: "9px 14px", borderRadius: 8,
                      border: "1.5px solid var(--d-border-soft)", background: "none",
                      color: "var(--d-muted)", fontWeight: 600, fontSize: "0.83rem",
                      cursor: "pointer", fontFamily: "inherit" }}>
                    Annuler
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

// ── Workflow action card — changes per status ─────────────────────────────────
const WorkflowCard = ({
  contract, user, saving, showBdc, setShowBdc,
  bdcForm, setBdcForm, onSend, onBdc, onOpenProforma,
}) => {
  if (contract.status === "draft") {
    return (
      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ padding: "18px 22px", marginBottom: 16,
          borderLeft: "4px solid #f59e0b", background: "#fffbeb" }}>
        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#92400e",
          marginBottom: 6 }}>
          Prochaine action — Générer le Contrat Proforma
        </div>
        <p style={{ fontSize: "0.82rem", color: "#78350f", lineHeight: 1.6, marginBottom: 14 }}>
          Remplissez le formulaire Contrat Proforma pour générer un PDF officiel et l'envoyer
          automatiquement au client via la messagerie du projet.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={onOpenProforma} disabled={saving} className="section-cta-btn">
            Remplir le Contrat Proforma
          </button>
          <button onClick={onSend} disabled={saving}
            style={{ padding: "9px 16px", borderRadius: 8,
              border: "1.5px solid #d97706", background: "none",
              color: "#d97706", fontWeight: 600, fontSize: "0.83rem",
              cursor: "pointer", fontFamily: "inherit" }}>
            {saving ? "Envoi..." : "Envoyer sans PDF"}
          </button>
        </div>
      </motion.div>
    );
  }

  if (contract.status === "sent") {
    return (
      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ padding: "18px 22px", marginBottom: 16,
          borderLeft: "4px solid #0891b2", background: "#f0f9ff" }}>
        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0369a1",
          marginBottom: 6 }}>
          En attente du reçu client
        </div>
        <p style={{ fontSize: "0.82rem", color: "#0c4a6e", lineHeight: 1.6 }}>
          Le contrat a été envoyé. En attente que le client uploade son reçu de paiement.
        </p>
      </motion.div>
    );
  }

  if (contract.status === "acknowledged") {
    return (
      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ padding: "18px 22px", marginBottom: 16,
          borderLeft: "4px solid #c0152a" }}>
        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--d-ink)",
          marginBottom: 6 }}>
          Prochaine action — Envoyer le bon de commande
        </div>
        <p style={{ fontSize: "0.82rem", color: "var(--d-muted)", lineHeight: 1.6,
          marginBottom: 14 }}>
          Le client a envoyé son reçu. Envoyez le bon de commande pour finaliser le contrat.
        </p>
        {!showBdc ? (
          <button onClick={() => setShowBdc(true)} className="section-cta-btn">
            Envoyer le bon de commande
          </button>
        ) : (
          <form onSubmit={onBdc}>
            <div className="dash-form-row" style={{ marginBottom: 10 }}>
              <div className="dash-form-group">
                <label className="dash-form-label">URL du bon de commande *</label>
                <input className="dash-form-input" placeholder="https://..." required
                  value={bdcForm.url}
                  onChange={e => setBdcForm(p => ({ ...p, url: e.target.value }))} />
              </div>
              <div className="dash-form-group">
                <label className="dash-form-label">Nom du fichier</label>
                <input className="dash-form-input" placeholder="bon-de-commande.pdf"
                  value={bdcForm.filename}
                  onChange={e => setBdcForm(p => ({ ...p, filename: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className="section-cta-btn"
                style={{ flex: 1 }} disabled={saving}>
                {saving ? "Envoi..." : "Confirmer"}
              </button>
              <button type="button" onClick={() => setShowBdc(false)}
                style={{ padding: "9px 14px", border: "1.5px solid var(--d-border-soft)",
                  borderRadius: 8, background: "none", cursor: "pointer",
                  fontSize: "0.82rem", color: "var(--d-muted)", fontFamily: "inherit" }}>
                Annuler
              </button>
            </div>
          </form>
        )}
      </motion.div>
    );
  }

  if (contract.status === "signed") {
    return (
      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ padding: "18px 22px", marginBottom: 16,
          borderLeft: "4px solid #10b981", background: "#f0fdf4" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%",
            background: "#10b981", display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0 }}>
            <IconCheckSquare size={16} style={{ color: "#fff" }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#166534" }}>
              Contrat finalisé
            </div>
            <div style={{ fontSize: "0.78rem", color: "#15803d" }}>
              La collaboration est officiellement engagée.
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (contract.status === "resiliation") {
    return (
      <motion.div className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ padding: "18px 22px", marginBottom: 16,
          borderLeft: "4px solid #ef4444", background: "#fef2f2" }}>
        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#dc2626", marginBottom: 4 }}>
          Contrat résilié
        </div>
        <div style={{ fontSize: "0.82rem", color: "#7f1d1d", lineHeight: 1.5 }}>
          {contract.notes || "Aucun motif enregistré."}
        </div>
      </motion.div>
    );
  }

  return null;
};

export default DirectorContracts;
