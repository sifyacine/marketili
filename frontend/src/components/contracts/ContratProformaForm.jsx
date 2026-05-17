// frontend/src/components/contracts/ContratProformaForm.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import contractService from "../../services/contractService";

const PAYMENT_METHODS = [
  { value: "virement",   label: "Virement bancaire" },
  { value: "cheque",     label: "Chèque" },
  { value: "especes",    label: "Espèces" },
  { value: "autre",      label: "Autre" },
];

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{
      fontSize: "0.72rem", fontWeight: 700, color: "#c0152a",
      textTransform: "uppercase", letterSpacing: "0.08em",
      borderBottom: "2px solid #c0152a", paddingBottom: 6, marginBottom: 14,
    }}>
      {title}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {children}
    </div>
  </div>
);

const Field = ({ label, required, children }) => (
  <div>
    <label style={{
      display: "block", fontSize: "0.78rem", fontWeight: 600,
      color: "#4a2a2a", marginBottom: 5,
    }}>
      {label}{required && <span style={{ color: "#c0152a" }}> *</span>}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1.5px solid #f0dede", fontSize: "0.85rem",
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  background: "#fff", color: "#1a0a0a",
};
const textareaStyle = {
  ...inputStyle, resize: "vertical", lineHeight: 1.6,
};
const toggleStyle = (on) => ({
  display: "inline-flex", alignItems: "center", gap: 8,
  padding: "7px 14px", borderRadius: 20, border: "1.5px solid",
  cursor: "pointer", fontSize: "0.8rem", fontWeight: 600,
  fontFamily: "inherit",
  borderColor: on ? "#10b981" : "#d1d5db",
  background:  on ? "#f0fdf4" : "#f9fafb",
  color:       on ? "#166534" : "#6b7280",
});

const ContratProformaForm = ({ contract: initial, onSuccess, onCancel }) => {
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  // Pre-populate form from existing contract
  const [form, setForm] = useState({
    title:                initial.title || "",
    objet:                initial.objet || "",
    prestations:          initial.prestations || "",
    livrables:            initial.livrables || "",
    amount:               initial.financialTerms?.amount || "",
    currency:             initial.financialTerms?.currency || "DZD",
    paymentMethod:        initial.financialTerms?.paymentMethod || "",
    paymentSchedule:      initial.financialTerms?.paymentSchedule || "",
    startDate:            initial.duration?.startDate
      ? new Date(initial.duration.startDate).toISOString().split("T")[0] : "",
    endDate:              initial.duration?.endDate
      ? new Date(initial.duration.endDate).toISOString().split("T")[0] : "",
    durationNotes:        initial.duration?.notes || "",
    confidentialityClause: initial.confidentialityClause ?? true,
    exclusivityClause:    initial.exclusivityClause ?? false,
    resiliationTerms:     initial.resiliationTerms || "",
    additionalClauses:    initial.additionalClauses || "",
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      const payload = {
        title:      form.title,
        objet:      form.objet,
        prestations: form.prestations,
        livrables:  form.livrables,
        financialTerms: {
          amount:          form.amount ? parseFloat(form.amount) : undefined,
          currency:        form.currency,
          paymentMethod:   form.paymentMethod,
          paymentSchedule: form.paymentSchedule,
        },
        duration: {
          startDate:  form.startDate || undefined,
          endDate:    form.endDate   || undefined,
          notes:      form.durationNotes,
        },
        confidentialityClause: form.confidentialityClause,
        exclusivityClause:     form.exclusivityClause,
        resiliationTerms:      form.resiliationTerms,
        additionalClauses:     form.additionalClauses,
      };
      const d = await contractService.generatePdf(initial._id, payload);
      onSuccess(d.contract);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la génération du PDF");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}>

      {/* Back */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <button type="button" onClick={onCancel}
          style={{ background: "none", border: "1.5px solid #f0dede", borderRadius: 8,
            padding: "6px 14px", cursor: "pointer", fontSize: "0.82rem",
            color: "#9a6060", fontFamily: "inherit", fontWeight: 600 }}>
          ← Retour
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#1a0a0a" }}>
            Contrat Proforma
          </h2>
          <div style={{ fontSize: "0.78rem", color: "#9a6060", marginTop: 2 }}>
            {initial.partyAName} → {initial.partyBName}
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fef2f2",
          border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.83rem",
          fontWeight: 600, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* ── Parties (read-only) ── */}
        <Section title="Parties contractantes">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "#faeaea",
              fontSize: "0.83rem" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#9a6060",
                textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>
                Partie A — Prestataire
              </div>
              <div style={{ fontWeight: 600 }}>{initial.partyAName}</div>
            </div>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "#f0f9ff",
              fontSize: "0.83rem" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#0369a1",
                textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>
                Partie B — Client
              </div>
              <div style={{ fontWeight: 600 }}>{initial.partyBName}</div>
            </div>
          </div>
          <Field label="Intitulé du contrat" required>
            <input style={inputStyle} value={form.title} required
              onChange={e => set("title", e.target.value)}
              placeholder="Ex : Convention de prestation marketing digital" />
          </Field>
        </Section>

        {/* ── Objet & Prestations ── */}
        <Section title="Art. 01–03 — Objet, Prestations & Livrables">
          <Field label="Art. 01 — Objet du contrat" required>
            <textarea style={textareaStyle} rows={3} required
              value={form.objet} onChange={e => set("objet", e.target.value)}
              placeholder="Décrivez l'objet global du contrat..." />
          </Field>
          <Field label="Art. 02 — Nature des prestations" required>
            <textarea style={textareaStyle} rows={4} required
              value={form.prestations} onChange={e => set("prestations", e.target.value)}
              placeholder="Décrivez en détail les prestations à réaliser..." />
          </Field>
          <Field label="Art. 03 — Périmètre et livrables">
            <textarea style={textareaStyle} rows={4}
              value={form.livrables} onChange={e => set("livrables", e.target.value)}
              placeholder="Définissez le périmètre du projet et les livrables attendus..." />
          </Field>
        </Section>

        {/* ── Financial ── */}
        <Section title="Art. 05 & 07 — Dispositions financières">
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
            <Field label="Montant">
              <input style={inputStyle} type="number" min="0" step="0.01"
                value={form.amount} onChange={e => set("amount", e.target.value)}
                placeholder="0" />
            </Field>
            <Field label="Devise">
              <select style={inputStyle} value={form.currency}
                onChange={e => set("currency", e.target.value)}>
                <option value="DZD">DZD</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </Field>
          </div>
          <Field label="Mode de paiement">
            <select style={inputStyle} value={form.paymentMethod}
              onChange={e => set("paymentMethod", e.target.value)}>
              <option value="">— Sélectionner —</option>
              {PAYMENT_METHODS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Art. 07 — Calendrier de paiement">
            <textarea style={textareaStyle} rows={2}
              value={form.paymentSchedule} onChange={e => set("paymentSchedule", e.target.value)}
              placeholder="Ex : 50% à la commande, 50% à la livraison" />
          </Field>
        </Section>

        {/* ── Duration ── */}
        <Section title="Art. 08 — Durée du contrat">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Date de début">
              <input style={inputStyle} type="date"
                value={form.startDate} onChange={e => set("startDate", e.target.value)} />
            </Field>
            <Field label="Date de fin">
              <input style={inputStyle} type="date"
                value={form.endDate} onChange={e => set("endDate", e.target.value)} />
            </Field>
          </div>
          <Field label="Notes sur la durée">
            <textarea style={textareaStyle} rows={2}
              value={form.durationNotes} onChange={e => set("durationNotes", e.target.value)}
              placeholder="Précisions sur la durée ou les renouvellements..." />
          </Field>
        </Section>

        {/* ── Clauses ── */}
        <Section title="Art. 09–14 — Clauses">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={() => set("confidentialityClause", !form.confidentialityClause)}
              style={toggleStyle(form.confidentialityClause)}>
              {form.confidentialityClause ? "✓" : "○"} Art. 09 — Confidentialité
            </button>
            <button type="button" onClick={() => set("exclusivityClause", !form.exclusivityClause)}
              style={toggleStyle(form.exclusivityClause)}>
              {form.exclusivityClause ? "✓" : "○"} Art. 10 — Exclusivité
            </button>
          </div>
          <Field label="Art. 14 — Conditions de résiliation">
            <textarea style={textareaStyle} rows={3}
              value={form.resiliationTerms} onChange={e => set("resiliationTerms", e.target.value)}
              placeholder="Conditions et modalités de résiliation anticipée..." />
          </Field>
          <Field label="Art. 12 — Clauses additionnelles">
            <textarea style={textareaStyle} rows={3}
              value={form.additionalClauses} onChange={e => set("additionalClauses", e.target.value)}
              placeholder="Toute clause supplémentaire convenue entre les parties..." />
          </Field>
        </Section>

        {/* ── Actions ── */}
        <div className="card" style={{ padding: "18px 22px", background: "#fffbeb",
          borderLeft: "4px solid #f59e0b", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#92400e", marginBottom: 6 }}>
            Générer le contrat PDF
          </div>
          <p style={{ fontSize: "0.82rem", color: "#78350f", lineHeight: 1.6, marginBottom: 14 }}>
            Cliquez sur "Générer et envoyer" pour créer le PDF et l'envoyer automatiquement
            au client via la messagerie du projet. Le statut passera à <strong>Envoyé</strong>.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={saving}
              style={{ padding: "10px 22px", borderRadius: 8, border: "none",
                background: saving ? "#d1d5db" : "#c0152a", color: "#fff",
                fontWeight: 700, fontSize: "0.85rem", cursor: saving ? "default" : "pointer",
                fontFamily: "inherit", transition: "background 0.15s" }}>
              {saving ? "Génération en cours..." : "Générer et envoyer"}
            </button>
            <button type="button" onClick={onCancel} disabled={saving}
              style={{ padding: "10px 18px", borderRadius: 8,
                border: "1.5px solid #f0dede", background: "none",
                color: "#9a6060", fontWeight: 600, fontSize: "0.85rem",
                cursor: "pointer", fontFamily: "inherit" }}>
              Annuler
            </button>
          </div>
        </div>

      </form>
    </motion.div>
  );
};

export default ContratProformaForm;
