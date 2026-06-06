
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import pitchService from "../../services/pitchService";

const NETWORKS = [
  "Instagram", "TikTok", "YouTube", "LinkedIn",
  "Twitter", "Facebook", "Snapchat", "Autre",
];

const PAYMENT_METHODS = [
  { value: "virement", label: "Virement bancaire" },
  { value: "cheque",   label: "Chèque"            },
  { value: "especes",  label: "Espèces"            },
  { value: "autre",    label: "Autre"              },
];

const TOTAL_STEPS = 3;

const Art = ({ num, title }) => (
  <div style={{
    padding: "8px 0 6px",
    borderBottom: "1.5px solid #f0dede",
    marginBottom: 14,
    display: "flex", alignItems: "baseline", gap: 8,
  }}>
    <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#c0152a",
      textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 }}>
      Art. {num}
    </span>
    <span style={{ fontSize: "0.83rem", fontWeight: 700, color: "#1a0a0a" }}>
      {title}
    </span>
  </div>
);

const ReadOnly = ({ children }) => (
  <div style={{
    padding: "10px 14px", borderRadius: 8, background: "#fafafa",
    border: "1px solid #f0dede", fontSize: "0.79rem", color: "#555",
    lineHeight: 1.65, fontStyle: "italic",
  }}>
    {children}
  </div>
);

const Label = ({ children, required }) => (
  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600,
    color: "#4a2a2a", marginBottom: 5 }}>
    {children}{required && <span style={{ color: "#c0152a" }}> *</span>}
  </label>
);

const inp = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1.5px solid #f0dede", fontSize: "0.85rem",
  fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  background: "#fff", color: "#1a0a0a",
};
const ta = { ...inp, resize: "vertical", lineHeight: 1.6 };

const today = () => new Date().toISOString().split("T")[0];

const STEP_LABELS = ["Objet & Durée", "Rémunération & Réseaux", "Clauses & Envoi"];

const StepBar = ({ step }) => (
  <div style={{ display: "flex", gap: 0, marginBottom: 24 }}>
    {STEP_LABELS.map((label, i) => {
      const n = i + 1;
      const done   = step > n;
      const active = step === n;
      return (
        <div key={n} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
            {i > 0 && (
              <div style={{ flex: 1, height: 2,
                background: done ? "#c0152a" : "#f0dede", transition: "background 0.3s" }} />
            )}
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.75rem", fontWeight: 800, transition: "all 0.3s",
              background: done ? "#c0152a" : active ? "#c0152a" : "#f0dede",
              color: done || active ? "#fff" : "#9a6060",
              border: active ? "2px solid #c0152a" : "2px solid transparent",
            }}>
              {done ? "✓" : n}
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{ flex: 1, height: 2,
                background: done ? "#c0152a" : "#f0dede", transition: "background 0.3s" }} />
            )}
          </div>
          <div style={{ fontSize: "0.65rem", fontWeight: 600, marginTop: 5, textAlign: "center",
            color: active ? "#c0152a" : done ? "#c0152a" : "#9a6060" }}>
            {label}
          </div>
        </div>
      );
    })}
  </div>
);

const ConventionCollaborationForm = ({ freelancer, agencyUser, onClose, onSuccess }) => {
  const [step,   setStep]   = useState(1);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const [form, setForm] = useState({
    description:       "",
    workRequirements:  "",
    artNote03:         "",
    artNote04:         "",
    amount:            "",
    currency:          "DZD",
    paymentMethod:     "",
    paymentSchedule:   "",
    networks:          [],
    startDate:         "",
    endDate:           "",
    contractType:      "cdd",
    confidentiality:   true,
    amendments:        "",
    effectiveDate:     today(),
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleNetwork = (net) =>
    setForm(p => ({
      ...p,
      networks: p.networks.includes(net)
        ? p.networks.filter(n => n !== net)
        : [...p.networks, net],
    }));

  const validateStep = () => {
    if (step === 1) {
      if (!form.description.trim()) return "L'objet de la convention est requis";
      if (!form.startDate) return "Veuillez indiquer une date de début";
      if (form.contractType === "cdd" && !form.endDate) return "Veuillez indiquer une date de fin (CDD)";
      if (form.contractType === "cdd" && form.startDate && form.endDate &&
          new Date(form.startDate) > new Date(form.endDate))
        return "La date de début doit précéder la date de fin";
    }
    if (step === 2) {
      const amountNum = form.amount ? parseFloat(form.amount) : 0;
      if (Number.isNaN(amountNum) || amountNum < 0) return "Le montant doit être un nombre positif";
      if (amountNum > 0 && !form.paymentMethod) return "Veuillez sélectionner un mode de paiement";
      if (form.networks.length === 0) return "Sélectionnez au moins un réseau social concerné";
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep(s => s + 1);
  };

  const back = () => { setError(""); setStep(s => s - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isCdi = form.contractType === "cdi";
    const amountNum = form.amount ? parseFloat(form.amount) : 0;

    setSaving(true); setError("");
    try {
      const payload = {
        senderId:     agencyUser.agency || agencyUser._id,
        senderType:   "Agency",
        pitchType:    "agency_to_freelancer",
        receiverId:   freelancer._id,
        receiverType: "Freelancer",
        internalStatus: "draft",
        contractType:   form.contractType,
        description:    form.description,
        workRequirements: form.workRequirements,
        proposedPrice: {
          amount:        amountNum,
          currency:      form.currency,
          paymentMethod: form.paymentMethod,
          paymentSchedule: form.paymentSchedule,
        },
        timeline: {
          startDate: form.startDate || undefined,
          endDate:   isCdi ? undefined : (form.endDate || undefined),
        },
        analysis: {
          competitiveAnalysis: "",
          socialNetworks: form.networks,
          confidentialityClause: form.confidentiality,
          effectiveDate: form.effectiveDate,
          amendments: form.amendments,
          artNote03: form.artNote03,
          artNote04: form.artNote04,
        },
      };
      await pitchService.send(payload);
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur lors de l'envoi");
    } finally {
      setSaving(false);
    }
  };

  const freelancerName = `${freelancer.firstName || ""} ${freelancer.lastName || ""}`.trim();
  const isCdi = form.contractType === "cdi";

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.22 }}
          style={{
            background: "#fff", borderRadius: 18, width: "100%", maxWidth: 660,
            maxHeight: "92vh", overflowY: "auto",
            boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          }}>

          <div style={{
            position: "sticky", top: 0, zIndex: 10,
            padding: "18px 24px 16px", borderBottom: "1px solid #f0dede",
            background: "#fff", borderRadius: "18px 18px 0 0",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: "1.02rem", fontWeight: 800, color: "#1a0a0a" }}>
                  Convention de Collaboration
                </div>
                <div style={{ fontSize: "0.76rem", color: "#9a6060", marginTop: 2 }}>
                  Destinataire : <strong>{freelancerName}</strong> — {freelancer.email}
                </div>
              </div>
              <button onClick={onClose}
                style={{ background: "none", border: "none", fontSize: "1.1rem",
                  cursor: "pointer", color: "#9a6060", lineHeight: 1, padding: 4 }}>
                ✕
              </button>
            </div>
            <StepBar step={step} />
          </div>

          <div style={{ padding: "22px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "#faeaea", fontSize: "0.82rem",
                border: "1px solid #f5caca" }}>
                <div style={{ fontSize: "0.63rem", fontWeight: 800, color: "#9a6060",
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Agence (Partie A)</div>
                <div style={{ fontWeight: 700 }}>{agencyUser.agencyName || agencyUser.companyName || "—"}</div>
              </div>
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "#f0f7ff", fontSize: "0.82rem",
                border: "1px solid #bfdbfe" }}>
                <div style={{ fontSize: "0.63rem", fontWeight: 800, color: "#0369a1",
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Freelancer (Partie B)</div>
                <div style={{ fontWeight: 700 }}>{freelancerName}</div>
              </div>
            </div>

            <AnimatePresence mode="wait">

              {step === 1 && (
                <motion.div key="s1"
                  initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>

                  <Art num="01" title="OBJET DE LA CONVENTION" />
                  <div style={{ marginBottom: 20 }}>
                    <Label required>Décrivez l'objet de cette collaboration</Label>
                    <textarea style={ta} rows={3} required
                      value={form.description}
                      onChange={e => set("description", e.target.value)}
                      placeholder="Ex : Collaboration pour la création de contenus sur les réseaux sociaux..." />
                  </div>

                  <Art num="02" title="CONDITIONS D'EXPLOITATION" />
                  <div style={{ marginBottom: 20 }}>
                    <Label>Plateformes, livrables et droits d'utilisation</Label>
                    <textarea style={ta} rows={3}
                      value={form.workRequirements}
                      onChange={e => set("workRequirements", e.target.value)}
                      placeholder="Ex : Création de 3 reels/semaine sur Instagram, droits d'utilisation commerciale inclus..." />
                  </div>

                  <Art num="07" title="DURÉE DE LA CONVENTION" />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
                    <div>
                      <Label required>Type de contrat</Label>
                      <div style={{ display: "flex", gap: 6 }}>
                        {["cdd", "cdi"].map(t => (
                          <button key={t} type="button"
                            onClick={() => { set("contractType", t); if (t === "cdi") set("endDate", ""); }}
                            style={{
                              flex: 1, padding: "9px 0", borderRadius: 8, fontSize: "0.82rem",
                              fontWeight: 700, cursor: "pointer", border: "1.5px solid",
                              fontFamily: "inherit", textTransform: "uppercase",
                              borderColor: form.contractType === t ? "#c0152a" : "#f0dede",
                              background:  form.contractType === t ? "#c0152a" : "transparent",
                              color:       form.contractType === t ? "#fff" : "#9a6060",
                            }}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label required>Date de début</Label>
                      <input style={inp} type="date"
                        value={form.startDate} onChange={e => set("startDate", e.target.value)} />
                    </div>
                  </div>
                  {!isCdi && (
                    <div style={{ marginBottom: 20 }}>
                      <Label required>Date de fin</Label>
                      <input style={inp} type="date"
                        value={form.endDate} onChange={e => set("endDate", e.target.value)} />
                    </div>
                  )}
                  {isCdi && (
                    <div style={{ marginBottom: 20, padding: "9px 12px", borderRadius: 8,
                      background: "#fafafa", border: "1.5px solid #f0dede",
                      fontSize: "0.82rem", color: "#9a6060", fontStyle: "italic" }}>
                      Durée indéterminée (CDI)
                    </div>
                  )}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2"
                  initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>

                  <Art num="05" title="RÉTRIBUTION & MODALITÉS DE PAIEMENT" />
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 10 }}>
                    <div>
                      <Label>Montant</Label>
                      <input style={inp} type="number" min="0" step="0.01"
                        value={form.amount} onChange={e => set("amount", e.target.value)}
                        placeholder="Ex : 50 000" />
                    </div>
                    <div>
                      <Label>Devise</Label>
                      <select style={inp} value={form.currency} onChange={e => set("currency", e.target.value)}>
                        <option value="DZD">DZD</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
                    <div>
                      <Label>Mode de paiement</Label>
                      <select style={inp} value={form.paymentMethod} onChange={e => set("paymentMethod", e.target.value)}>
                        <option value="">— Sélectionner —</option>
                        {PAYMENT_METHODS.map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Calendrier de paiement</Label>
                      <input style={inp} value={form.paymentSchedule}
                        onChange={e => set("paymentSchedule", e.target.value)}
                        placeholder="Ex : 50% avance, 50% livraison" />
                    </div>
                  </div>

                  <Art num="06" title="RÉSEAUX SOCIAUX CONCERNÉS" />
                  <div style={{ marginBottom: 8 }}>
                    <Label required>Sélectionnez les plateformes</Label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {NETWORKS.map(net => {
                        const on = form.networks.includes(net);
                        return (
                          <button key={net} type="button" onClick={() => toggleNetwork(net)}
                            style={{
                              padding: "6px 14px", borderRadius: 20, fontSize: "0.78rem",
                              fontWeight: 600, cursor: "pointer", border: "1.5px solid",
                              fontFamily: "inherit", transition: "all 0.12s",
                              borderColor: on ? "#c0152a" : "#f0dede",
                              background:  on ? "#c0152a" : "transparent",
                              color:       on ? "#fff"    : "#9a6060",
                            }}>
                            {net}
                          </button>
                        );
                      })}
                    </div>
                    {form.networks.length > 0 && (
                      <div style={{ fontSize: "0.72rem", color: "#9a6060", marginTop: 6 }}>
                        {form.networks.join(", ")}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3"
                  initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>

                  <Art num="03" title="OBLIGATIONS DE LA PERSONNALITÉ" />
                  <div style={{ marginBottom: 10 }}>
                    <ReadOnly>
                      Le freelancer s'engage à réaliser les prestations convenues avec sérieux et
                      professionnalisme, à respecter les délais fixés, à ne pas sous-traiter sans
                      accord préalable de l'agence, et à maintenir une image cohérente avec les
                      valeurs du client.
                    </ReadOnly>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <Label>Conditions particulières (optionnel)</Label>
                    <textarea style={ta} rows={2}
                      value={form.artNote03}
                      onChange={e => set("artNote03", e.target.value)}
                      placeholder="Précisions supplémentaires..." />
                  </div>

                  <Art num="04" title="OBLIGATIONS DE L'AGENCE" />
                  <div style={{ marginBottom: 10 }}>
                    <ReadOnly>
                      L'agence s'engage à fournir au freelancer tous les éléments nécessaires à la
                      réalisation de sa mission, à le rémunérer dans les délais convenus, et à
                      respecter sa créativité dans le cadre des directives établies.
                    </ReadOnly>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <Label>Engagements spécifiques (optionnel)</Label>
                    <textarea style={ta} rows={2}
                      value={form.artNote04}
                      onChange={e => set("artNote04", e.target.value)}
                      placeholder="Engagements supplémentaires de l'agence..." />
                  </div>

                  <Art num="08" title="CONFIDENTIALITÉ" />
                  <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                    {[true, false].map(val => (
                      <button key={String(val)} type="button"
                        onClick={() => set("confidentiality", val)}
                        style={{
                          flex: 1, padding: "9px 12px", borderRadius: 8, fontSize: "0.82rem",
                          fontWeight: 700, cursor: "pointer", border: "1.5px solid",
                          fontFamily: "inherit",
                          borderColor: form.confidentiality === val ? (val ? "#10b981" : "#ef4444") : "#f0dede",
                          background:  form.confidentiality === val ? (val ? "#f0fdf4" : "#fef2f2") : "transparent",
                          color:       form.confidentiality === val ? (val ? "#166534" : "#dc2626") : "#9a6060",
                        }}>
                        {val ? "Oui — clause incluse" : "Non — sans clause"}
                      </button>
                    ))}
                  </div>

                  <Art num="09" title="LITIGES" />
                  <div style={{ marginBottom: 20 }}>
                    <ReadOnly>
                      Tout litige sera soumis à une tentative de règlement amiable. À défaut,
                      les parties reconnaissent la compétence des tribunaux algériens compétents.
                    </ReadOnly>
                  </div>

                  <Art num="10" title="AVENANTS" />
                  <div style={{ marginBottom: 10 }}>
                    <ReadOnly>
                      Toute modification doit faire l'objet d'un avenant écrit, signé par les deux parties.
                    </ReadOnly>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <Label>Avenants spécifiques (optionnel)</Label>
                    <textarea style={ta} rows={2}
                      value={form.amendments}
                      onChange={e => set("amendments", e.target.value)}
                      placeholder="Précisez toute modification convenue d'avance..." />
                  </div>

                  <Art num="11" title="DATE D'EFFET" />
                  <div style={{ marginBottom: 24 }}>
                    <Label>Date d'entrée en vigueur</Label>
                    <input style={{ ...inp, maxWidth: 200 }} type="date"
                      value={form.effectiveDate}
                      onChange={e => set("effectiveDate", e.target.value)} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fef2f2",
                border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.83rem",
                fontWeight: 600, marginBottom: 14 }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
              <button type="button"
                onClick={step === 1 ? onClose : back}
                disabled={saving}
                style={{ padding: "10px 18px", borderRadius: 8,
                  border: "1.5px solid #f0dede", background: "none",
                  color: "#9a6060", fontWeight: 600, fontSize: "0.85rem",
                  cursor: "pointer", fontFamily: "inherit", minWidth: 110 }}>
                {step === 1 ? "Annuler" : "Précédent"}
              </button>
              {step < TOTAL_STEPS ? (
                <button type="button" onClick={next}
                  style={{ flex: 1, padding: "10px 24px", borderRadius: 8, border: "none",
                    background: "#c0152a", color: "#fff",
                    fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
                    fontFamily: "inherit" }}>
                  Suivant
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={saving}
                  style={{ flex: 1, padding: "10px 24px", borderRadius: 8, border: "none",
                    background: saving ? "#d1d5db" : "#c0152a", color: "#fff",
                    fontWeight: 700, fontSize: "0.85rem",
                    cursor: saving ? "default" : "pointer",
                    fontFamily: "inherit" }}>
                  {saving ? "Envoi en cours..." : "Envoyer la Convention"}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConventionCollaborationForm;
