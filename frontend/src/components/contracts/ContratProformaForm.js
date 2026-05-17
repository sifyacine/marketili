// frontend/src/components/contracts/ContratProformaForm.js
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import contractService from "../../services/contractService";

// ── Default boilerplate for each section ─────────────────────
const DEFAULTS = {
  preambule: "Entre les soussignés, il a été convenu ce qui suit concernant la prestation de services de marketing et communication.",
  article1:  "Le présent contrat a pour objet de définir les conditions dans lesquelles l'agence fournira ses services marketing au client, tels que décrits dans l'offre acceptée.",
  article2:  "L'agence s'engage à fournir les prestations de marketing suivantes : gestion des réseaux sociaux, création de contenu, campagnes publicitaires, et tout autre service convenu entre les parties.",
  article3:  "Les livrables attendus comprennent : rapports mensuels de performance, contenus créatifs, analyses de marché, et tous documents spécifiés dans l'offre de service.",
  article4:  "L'agence s'engage à fournir les services avec professionnalisme dans les délais convenus. Le client s'engage à fournir toutes les informations et ressources nécessaires à la bonne exécution des services.",
  article5:  "En contrepartie des services fournis, le client versera à l'agence la somme convenue selon les modalités définies à l'Article 6. Tout avenant financier fera l'objet d'un accord écrit.",
  article6:  "Le paiement sera effectué par virement bancaire dans un délai de 30 jours à compter de la réception de la facture. Un acompte de 30% est dû à la signature du présent contrat.",
  article7:  "Les prix convenus sont fermes et non révisables pendant la durée du contrat, sauf accord écrit des deux parties signé en tant qu'avenant.",
  article8:  "Le présent contrat prend effet à compter de sa signature pour une durée déterminée convenue entre les parties, renouvelable par accord mutuel écrit.",
  article9:  "Les parties s'engagent à garder confidentielles toutes les informations échangées dans le cadre du présent contrat, y compris les données commerciales, stratégiques et financières.",
  article10: "Aucune exclusivité n'est prévue par le présent contrat sauf mention contraire expressément convenue par avenant écrit.",
  article11: "Aucune des parties ne sera tenue responsable d'un manquement à ses obligations dû à un cas de force majeure tel que défini par la loi algérienne en vigueur.",
  article12: "Le présent contrat est régi par le droit algérien. Toute disposition non expressément prévue sera résolue par application des règles générales du droit des obligations.",
  article13: "Tout litige relatif à l'interprétation ou à l'exécution du présent contrat sera soumis, à défaut d'accord amiable, aux tribunaux compétents de la wilaya où le prestataire est établi.",
  article14: "Chaque partie peut résilier le présent contrat avec un préavis de 30 jours par lettre recommandée avec accusé de réception, sans préjudice des obligations déjà engagées.",
  article15: "Lu et approuvé par les deux parties. Le présent contrat constitue l'intégralité de l'accord et annule tout accord antérieur relatif au même objet.",
};

const CONTRACT_TYPE_LABEL = {
  service_agreement: "Convention de prestation",
  collaboration:     "Convention de collaboration",
  cdd:               "CDD",
  cdi:               "CDI",
  project:           "Projet ponctuel",
};

// ── Step definitions ──────────────────────────────────────────
const STEPS = [
  { id: 1, title: "Parties & type",        short: "Parties"     },
  { id: 2, title: "Préambule & Art. 1–2",  short: "Préambule"   },
  { id: 3, title: "Articles 3–4",          short: "Obligations" },
  { id: 4, title: "Articles 5–7",          short: "Financier"   },
  { id: 5, title: "Articles 8–12",         short: "Clauses"     },
  { id: 6, title: "Articles 13–15 & Aperçu", short: "Aperçu"   },
];

// ── Sub-components ────────────────────────────────────────────
const ArticleField = ({ num, title, value, onChange }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700,
      color: "#c0152a", textTransform: "uppercase", letterSpacing: "0.06em",
      marginBottom: 6 }}>
      Article {num} — {title}
    </label>
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={4}
      className="dash-form-textarea"
      style={{ fontSize: "0.82rem", lineHeight: 1.6 }}
    />
  </div>
);

const PreviewSection = ({ num, title, content }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#1a1a1a",
      textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
      {num === "PRÉAMBULE" ? num : `ARTICLE ${num} — ${title}`}
    </div>
    <div style={{ fontSize: "0.82rem", color: "#333", lineHeight: 1.65,
      background: "#f9fafb", borderRadius: 6, padding: "10px 14px",
      border: "1px solid #e5e7eb" }}>
      {content || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Non défini</span>}
    </div>
  </div>
);

// ── Stepper ───────────────────────────────────────────────────
const Stepper = ({ current }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 0,
    overflowX: "auto", paddingBottom: 4, marginBottom: 28 }}>
    {STEPS.map((step, i) => {
      const done   = current > step.id;
      const active = current === step.id;
      const color  = done ? "#10b981" : active ? "#c0152a" : "#d1d5db";
      return (
        <React.Fragment key={step.id}>
          <div style={{ display: "flex", flexDirection: "column",
            alignItems: "center", gap: 5, flexShrink: 0 }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%",
              border: `2.5px solid ${color}`,
              background: (done || active) ? color : "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.7rem", fontWeight: 700, color: (done || active) ? "#fff" : "#9ca3af",
              transition: "all 0.2s" }}>
              {done ? "✓" : step.id}
            </div>
            <span style={{ fontSize: "0.62rem", fontWeight: active ? 700 : 500,
              color: done ? "#10b981" : active ? "#c0152a" : "#9ca3af",
              whiteSpace: "nowrap" }}>
              {step.short}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 2, minWidth: 12,
              background: done ? "#10b981" : "#e5e7eb",
              marginBottom: 20, transition: "background 0.2s" }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ═════════════════════════════════════════════════════════════
// ROOT
// ═════════════════════════════════════════════════════════════
const ContratProformaForm = ({ contract, onSuccess, onCancel }) => {
  const [step,    setStep]    = useState(1);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [sections, setSections] = useState({
    ...DEFAULTS,
    ...(contract.sections || {}),
  });

  const set = (key) => (val) =>
    setSections(prev => ({ ...prev, [key]: val }));

  const saveSections = async () => {
    await contractService.update(contract._id, { sections });
  };

  const handleNext = async () => {
    if (step === 1) { setStep(2); return; }
    setSaving(true);
    setError("");
    try {
      await saveSections();
      setStep(s => s + 1);
    } catch {
      setError("Erreur lors de la sauvegarde. Réessayez.");
    } finally { setSaving(false); }
  };

  const handleGenerate = async () => {
    setSaving(true);
    setError("");
    try {
      await saveSections();
      const result = await contractService.generatePdf(contract._id, { sections });
      onSuccess(result.contract);
    } catch (err) {
      setError(err?.response?.data?.message || "Erreur lors de la génération du PDF.");
    } finally { setSaving(false); }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <button onClick={onCancel}
          style={{ background: "none", border: "1.5px solid var(--d-border-soft)",
            borderRadius: 8, padding: "6px 14px", cursor: "pointer",
            fontSize: "0.82rem", color: "var(--d-muted)", fontFamily: "inherit",
            fontWeight: 600, flexShrink: 0 }}>
          ← Retour
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800 }}>
            Contrat Proforma
          </h2>
          <div style={{ fontSize: "0.76rem", color: "var(--d-muted)", marginTop: 2 }}>
            {contract.title || "Sans titre"} — {CONTRACT_TYPE_LABEL[contract.contractType] || contract.contractType}
          </div>
        </div>
      </div>

      {/* Stepper */}
      <Stepper current={step} />

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div key="err"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ padding: "10px 14px", borderRadius: 8, background: "#fef2f2",
              border: "1px solid #fecaca", color: "#dc2626", fontSize: "0.82rem",
              fontWeight: 600, marginBottom: 16 }}>
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step content */}
      <div className="card" style={{ padding: "24px 26px" }}>
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }}>

            {/* ── Step 1: Parties (read-only) ── */}
            {step === 1 && (
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: 16,
                  color: "var(--d-ink)" }}>
                  Récapitulatif des parties contractantes
                </div>
                <div style={{ display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12,
                  marginBottom: 20 }}>
                  {[
                    { l: "Partie A — Prestataire", v: contract.partyAName },
                    { l: "Partie B — Client",      v: contract.partyBName },
                    { l: "Type de contrat",        v: CONTRACT_TYPE_LABEL[contract.contractType] || contract.contractType },
                    { l: "Projet",                 v: contract.project?.title || contract.title || "—" },
                  ].map(({ l, v }) => (
                    <div key={l} style={{ background: "var(--d-surface-alt)", borderRadius: 8,
                      padding: "10px 14px" }}>
                      <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--d-muted)",
                        textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                        {l}
                      </div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--d-ink)" }}>
                        {v || "—"}
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--d-muted)", lineHeight: 1.6,
                  background: "#fffbeb", border: "1px solid #fde68a",
                  borderRadius: 8, padding: "10px 14px" }}>
                  Les informations ci-dessus sont pré-remplies depuis le contrat. Cliquez sur
                  <strong> Suivant</strong> pour commencer à rédiger les articles.
                </p>
              </div>
            )}

            {/* ── Step 2: Préambule + Art 1–2 ── */}
            {step === 2 && (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700,
                    color: "#c0152a", textTransform: "uppercase", letterSpacing: "0.06em",
                    marginBottom: 6 }}>
                    Préambule
                  </label>
                  <textarea value={sections.preambule}
                    onChange={e => set("preambule")(e.target.value)}
                    rows={4} className="dash-form-textarea"
                    style={{ fontSize: "0.82rem", lineHeight: 1.6 }} />
                </div>
                <ArticleField num="01" title="Objet du contrat"
                  value={sections.article1} onChange={set("article1")} />
                <ArticleField num="02" title="Nature des prestations"
                  value={sections.article2} onChange={set("article2")} />
              </div>
            )}

            {/* ── Step 3: Art 3–4 ── */}
            {step === 3 && (
              <div>
                <ArticleField num="03" title="Périmètre & livrables"
                  value={sections.article3} onChange={set("article3")} />
                <ArticleField num="04" title="Obligations des parties"
                  value={sections.article4} onChange={set("article4")} />
              </div>
            )}

            {/* ── Step 4: Art 5–7 ── */}
            {step === 4 && (
              <div>
                <ArticleField num="05" title="Dispositions financières"
                  value={sections.article5} onChange={set("article5")} />
                <ArticleField num="06" title="Conditions de paiement"
                  value={sections.article6} onChange={set("article6")} />
                <ArticleField num="07" title="Révision des prix"
                  value={sections.article7} onChange={set("article7")} />
              </div>
            )}

            {/* ── Step 5: Art 8–12 ── */}
            {step === 5 && (
              <div>
                <ArticleField num="08" title="Durée du contrat"
                  value={sections.article8} onChange={set("article8")} />
                <ArticleField num="09" title="Confidentialité"
                  value={sections.article9} onChange={set("article9")} />
                <ArticleField num="10" title="Exclusivité"
                  value={sections.article10} onChange={set("article10")} />
                <ArticleField num="11" title="Force majeure"
                  value={sections.article11} onChange={set("article11")} />
                <ArticleField num="12" title="Droit applicable"
                  value={sections.article12} onChange={set("article12")} />
              </div>
            )}

            {/* ── Step 6: Art 13–15 + Preview ── */}
            {step === 6 && (
              <div>
                <ArticleField num="13" title="Règlement des litiges"
                  value={sections.article13} onChange={set("article13")} />
                <ArticleField num="14" title="Résiliation"
                  value={sections.article14} onChange={set("article14")} />
                <ArticleField num="15" title="Signatures & clôture"
                  value={sections.article15} onChange={set("article15")} />

                {/* Preview */}
                <div style={{ marginTop: 28, borderTop: "2px solid var(--d-border-soft)",
                  paddingTop: 22 }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--d-muted)",
                    textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
                    Aperçu du contrat
                  </div>

                  {/* Parties header */}
                  <div style={{ textAlign: "center", marginBottom: 20,
                    padding: "16px", background: "#f9fafb", borderRadius: 8,
                    border: "1px solid #e5e7eb" }}>
                    <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#c0152a",
                      letterSpacing: "0.05em", marginBottom: 4 }}>
                      CONTRAT PROFORMA
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#1a1a1a" }}>
                      {contract.title || "Convention de prestation de services"}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--d-muted)", marginTop: 4 }}>
                      {contract.partyAName} ↔ {contract.partyBName}
                    </div>
                  </div>

                  <PreviewSection num="PRÉAMBULE" content={sections.preambule} />
                  <PreviewSection num="01" title="Objet du contrat"       content={sections.article1} />
                  <PreviewSection num="02" title="Nature des prestations" content={sections.article2} />
                  <PreviewSection num="03" title="Périmètre & livrables"  content={sections.article3} />
                  <PreviewSection num="04" title="Obligations des parties" content={sections.article4} />
                  <PreviewSection num="05" title="Dispositions financières" content={sections.article5} />
                  <PreviewSection num="06" title="Conditions de paiement" content={sections.article6} />
                  <PreviewSection num="07" title="Révision des prix"      content={sections.article7} />
                  <PreviewSection num="08" title="Durée du contrat"       content={sections.article8} />
                  <PreviewSection num="09" title="Confidentialité"        content={sections.article9} />
                  <PreviewSection num="10" title="Exclusivité"            content={sections.article10} />
                  <PreviewSection num="11" title="Force majeure"          content={sections.article11} />
                  <PreviewSection num="12" title="Droit applicable"       content={sections.article12} />
                  <PreviewSection num="13" title="Règlement des litiges"  content={sections.article13} />
                  <PreviewSection num="14" title="Résiliation"            content={sections.article14} />
                  <PreviewSection num="15" title="Signatures & clôture"   content={sections.article15} />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "center", marginTop: 18 }}>
        <button
          onClick={step === 1 ? onCancel : () => setStep(s => s - 1)}
          disabled={saving}
          style={{ padding: "10px 20px", borderRadius: 8,
            border: "1.5px solid var(--d-border-soft)", background: "none",
            color: "var(--d-muted)", fontWeight: 600, fontSize: "0.83rem",
            cursor: "pointer", fontFamily: "inherit" }}>
          {step === 1 ? "Annuler" : "← Précédent"}
        </button>

        <div style={{ fontSize: "0.72rem", color: "var(--d-muted)", fontWeight: 600 }}>
          Étape {step} / {STEPS.length}
        </div>

        {step < 6 ? (
          <button onClick={handleNext} disabled={saving} className="section-cta-btn">
            {saving ? "Sauvegarde..." : "Suivant →"}
          </button>
        ) : (
          <button onClick={handleGenerate} disabled={saving}
            className="section-cta-btn"
            style={{ background: "#c0152a", minWidth: 160 }}>
            {saving ? "Génération..." : "Générer le PDF & Envoyer"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ContratProformaForm;
