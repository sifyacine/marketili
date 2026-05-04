import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import pitchService from "../../services/pitchService";

/**
 * PitchForm — 4-step structured pitch modal for agencies.
 * Also works for teams/freelancers (shows simplified form).
 *
 * Props:
 *   post       — the post being pitched on
 *   senderType — "Agency" | "Team" | "Freelancer" | optional lower-case variants
 *   onSubmit   — optional async fn(pitchData)
 *   onClose    — close the modal
 *   loading    — bool, disables submit while API call in flight
 */
const PitchForm = ({ post, senderType, onSubmit, onClose, loading }) => {
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  const currentRole = localStorage.getItem("role") || "";

  const normalizedSenderType = useMemo(() => {
    const raw = String(senderType || currentRole || "").toLowerCase();
    if (raw.includes("agency")) return "Agency";
    if (raw.includes("team")) return "Team";
    if (raw.includes("freelancer")) return "Freelancer";
    return "Freelancer";
  }, [senderType, currentRole]);

  const inferredPitchType = useMemo(() => {
    if (normalizedSenderType === "Agency") return "agency_to_client";
    if (normalizedSenderType === "Team") return "team_to_client";
    return "freelancer_to_client";
  }, [normalizedSenderType]);

  const isAgency = normalizedSenderType === "Agency";
  const totalSteps = isAgency ? 5 : 2;

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Shared fields ──
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("DZD");
  const [duration, setDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState("weeks");
  const [file, setFile] = useState(null);

  // ── Agency Block 1: Strategy ──
  const [strategyOverview, setStrategyOverview] = useState("");
  const [creativeIdea, setCreativeIdea] = useState("");
  const [objectives, setObjectives] = useState("");
  const [measurableGoals, setMeasurableGoals] = useState("");
  const [techniques, setTechniques] = useState("");

  // ── Agency Block 2: Content ──
  const [contentPillars, setContentPillars] = useState("");
  const [publicationCalendar, setPublicationCalendar] = useState("");
  const [postingFrequency, setPostingFrequency] = useState("");
  const [feedOrganization, setFeedOrganization] = useState("");

  // ── Agency Block 3: Analysis ──
  const [competitiveAnalysis, setCompetitiveAnalysis] = useState("");
  const [positioningStrategy, setPositioningStrategy] = useState("");

  // ── Agency Block 4: Target Audience ──
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [gender, setGender] = useState("all");
  const [niche, setNiche] = useState("");
  const [locations, setLocations] = useState("");

  const isBusy = loading || submitting;

  const STEP_LABELS = isAgency
    ? ["Stratégie", "Contenu", "Analyse", "Audience", "Prix & Délai"]
    : ["Description", "Prix & Délai"];

  const handleNext = () => {
    setError("");

    if (step === 1 && !description.trim() && !isAgency) {
      return setError("La description est requise");
    }

    if (step === 1 && isAgency && !strategyOverview.trim()) {
      return setError("L'aperçu stratégique est requis");
    }

    setStep((s) => s + 1);
  };

  const submitPitch = async () => {
    if (!currentUser?._id) {
      throw new Error("Utilisateur non connecté");
    }

    const pitchData = {
      postId: post?._id,
      senderId: currentUser._id,
      senderType: normalizedSenderType,
      pitchType: inferredPitchType,
      description,
      proposedPrice: { amount: Number(price), currency },
      timeline: duration ? { duration: Number(duration), unit: durationUnit } : undefined,
      file,
    };

    if (isAgency) {
      pitchData.strategy = {
        strategyOverview,
        creativeIdea,
        objectives,
        measurableGoals,
        techniques,
      };

      pitchData.content = {
        contentPillars: contentPillars.split(",").map((s) => s.trim()).filter(Boolean),
        publicationCalendar,
        postingFrequency,
        feedOrganization,
      };

      pitchData.analysis = {
        competitiveAnalysis,
        positioningStrategy,
      };

      pitchData.targetAudience = {
        ageMin: ageMin ? Number(ageMin) : undefined,
        ageMax: ageMax ? Number(ageMax) : undefined,
        gender,
        niche: niche.split(",").map((s) => s.trim()).filter(Boolean),
        locations: locations.split(",").map((s) => s.trim()).filter(Boolean),
      };
    }

    if (typeof onSubmit === "function") {
      return onSubmit(pitchData);
    }

    return pitchService.send(pitchData);
  };

  const handleSubmit = async () => {
    setError("");

    if (!price) return setError("Le prix proposé est requis");

    try {
      setSubmitting(true);
      await submitPitch();

      if (typeof onClose === "function") {
        onClose();
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <motion.div
        className="modal-box"
        style={{ maxWidth: 680 }}
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.25 }}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">💡 Soumettre une offre</h2>
            <p style={{ fontSize: "0.78rem", color: "#9a6060", marginTop: 2 }}>
              {post?.title}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", gap: 5 }}>
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: step > i + 1 ? 18 : 22,
                    height: 5,
                    borderRadius: 3,
                    background: step > i ? "#c0152a" : step === i + 1 ? "#e0253f" : "#f0dede",
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </div>
            <button type="button" className="modal-close" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div
          style={{
            padding: "4px 24px 0",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#c0152a",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Étape {step} — {STEP_LABELS[step - 1]}
        </div>

        <div className="modal-body">
          <AnimatePresence mode="wait">
            {!isAgency && step === 1 && (
              <motion.div key="s1" {...slideAnim} className="dash-form">
                <div className="dash-form-group">
                  <label className="dash-form-label">Présentez votre offre *</label>
                  <textarea
                    className="dash-form-textarea"
                    placeholder="Décrivez votre approche, vos compétences et pourquoi vous êtes le bon choix pour ce post..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ minHeight: 160 }}
                  />
                </div>

                {error && <div className="dash-form-error">{error}</div>}

                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" className="dash-form-submit" onClick={handleNext}>
                    Suivant →
                  </button>
                </div>
              </motion.div>
            )}

            {isAgency && step === 1 && (
              <motion.div key="a1" {...slideAnim} className="dash-form">
                <FieldGroup label="Aperçu stratégique *" required>
                  <textarea
                    className="dash-form-textarea"
                    placeholder="Vision globale de votre stratégie pour ce client..."
                    value={strategyOverview}
                    onChange={(e) => setStrategyOverview(e.target.value)}
                    style={{ minHeight: 80 }}
                  />
                </FieldGroup>

                <FieldGroup label="Idée créative">
                  <textarea
                    className="dash-form-textarea"
                    placeholder="Concept créatif central de la campagne..."
                    value={creativeIdea}
                    onChange={(e) => setCreativeIdea(e.target.value)}
                    style={{ minHeight: 70 }}
                  />
                </FieldGroup>

                <div className="dash-form-row">
                  <FieldGroup label="Objectifs">
                    <input
                      className="dash-form-input"
                      placeholder="Image, visibilité, présence..."
                      value={objectives}
                      onChange={(e) => setObjectives(e.target.value)}
                    />
                  </FieldGroup>

                  <FieldGroup label="Buts mesurables">
                    <input
                      className="dash-form-input"
                      placeholder="KPIs, metrics cibles..."
                      value={measurableGoals}
                      onChange={(e) => setMeasurableGoals(e.target.value)}
                    />
                  </FieldGroup>
                </div>

                <FieldGroup label="Techniques & Tactiques">
                  <input
                    className="dash-form-input"
                    placeholder="SEO, Paid ads, Influence, Community management..."
                    value={techniques}
                    onChange={(e) => setTechniques(e.target.value)}
                  />
                </FieldGroup>

                {error && <div className="dash-form-error">{error}</div>}
                <NavButtons onBack={null} onNext={handleNext} />
              </motion.div>
            )}

            {isAgency && step === 2 && (
              <motion.div key="a2" {...slideAnim} className="dash-form">
                <FieldGroup label="Piliers de contenu" hint="Séparés par virgule">
                  <input
                    className="dash-form-input"
                    placeholder="Éducation, Inspiration, Promotion, Divertissement..."
                    value={contentPillars}
                    onChange={(e) => setContentPillars(e.target.value)}
                  />
                </FieldGroup>

                <div className="dash-form-row">
                  <FieldGroup label="Fréquence de posting">
                    <input
                      className="dash-form-input"
                      placeholder="Ex: 3 posts/semaine"
                      value={postingFrequency}
                      onChange={(e) => setPostingFrequency(e.target.value)}
                    />
                  </FieldGroup>

                  <FieldGroup label="Calendrier de publication">
                    <input
                      className="dash-form-input"
                      placeholder="Ex: Lun, Mer, Ven à 18h"
                      value={publicationCalendar}
                      onChange={(e) => setPublicationCalendar(e.target.value)}
                    />
                  </FieldGroup>
                </div>

                <FieldGroup label="Organisation du feed">
                  <textarea
                    className="dash-form-textarea"
                    placeholder="Comment organiser et harmoniser le feed visuellement..."
                    value={feedOrganization}
                    onChange={(e) => setFeedOrganization(e.target.value)}
                    style={{ minHeight: 80 }}
                  />
                </FieldGroup>

                {error && <div className="dash-form-error">{error}</div>}
                <NavButtons onBack={() => setStep(1)} onNext={handleNext} />
              </motion.div>
            )}

            {isAgency && step === 3 && (
              <motion.div key="a3" {...slideAnim} className="dash-form">
                <FieldGroup label="Analyse concurrentielle">
                  <textarea
                    className="dash-form-textarea"
                    placeholder="Analyse de la concurrence dans le secteur du client..."
                    value={competitiveAnalysis}
                    onChange={(e) => setCompetitiveAnalysis(e.target.value)}
                    style={{ minHeight: 110 }}
                  />
                </FieldGroup>

                <FieldGroup label="Stratégie de positionnement">
                  <textarea
                    className="dash-form-textarea"
                    placeholder="Comment positionner la marque pour se démarquer..."
                    value={positioningStrategy}
                    onChange={(e) => setPositioningStrategy(e.target.value)}
                    style={{ minHeight: 110 }}
                  />
                </FieldGroup>

                {error && <div className="dash-form-error">{error}</div>}
                <NavButtons onBack={() => setStep(2)} onNext={handleNext} />
              </motion.div>
            )}

            {isAgency && step === 4 && (
              <motion.div key="a4" {...slideAnim} className="dash-form">
                <div className="dash-form-row">
                  <FieldGroup label="Âge min">
                    <input
                      className="dash-form-input"
                      type="number"
                      placeholder="18"
                      value={ageMin}
                      onChange={(e) => setAgeMin(e.target.value)}
                      min={13}
                      max={100}
                    />
                  </FieldGroup>

                  <FieldGroup label="Âge max">
                    <input
                      className="dash-form-input"
                      type="number"
                      placeholder="35"
                      value={ageMax}
                      onChange={(e) => setAgeMax(e.target.value)}
                      min={13}
                      max={100}
                    />
                  </FieldGroup>

                  <FieldGroup label="Genre">
                    <select
                      className="dash-form-select"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="all">Tous</option>
                      <option value="male">Hommes</option>
                      <option value="female">Femmes</option>
                    </select>
                  </FieldGroup>
                </div>

                <FieldGroup label="Niche / Centres d'intérêt" hint="Séparés par virgule">
                  <input
                    className="dash-form-input"
                    placeholder="Mode, Tech, Sport, Gaming..."
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                  />
                </FieldGroup>

                <FieldGroup label="Localisations ciblées" hint="Séparés par virgule">
                  <input
                    className="dash-form-input"
                    placeholder="Alger, Oran, Constantine..."
                    value={locations}
                    onChange={(e) => setLocations(e.target.value)}
                  />
                </FieldGroup>

                {error && <div className="dash-form-error">{error}</div>}
                <NavButtons onBack={() => setStep(3)} onNext={handleNext} />
              </motion.div>
            )}

            {step === totalSteps && (
              <motion.div key="final" {...slideAnim} className="dash-form">
                <FieldGroup label="Description générale" hint="Optionnel pour les agences">
                  <textarea
                    className="dash-form-textarea"
                    placeholder="Message d'accompagnement pour le client..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ minHeight: 80 }}
                  />
                </FieldGroup>

                <div className="dash-form-row">
                  <FieldGroup label="Prix proposé *">
                    <input
                      className="dash-form-input"
                      type="number"
                      placeholder="Ex: 150000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min={0}
                    />
                  </FieldGroup>

                  <FieldGroup label="Devise">
                    <select
                      className="dash-form-select"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="DZD">DZD</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </FieldGroup>
                </div>

                <div className="dash-form-row">
                  <FieldGroup label="Durée estimée">
                    <input
                      className="dash-form-input"
                      type="number"
                      placeholder="Ex: 4"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      min={1}
                    />
                  </FieldGroup>

                  <FieldGroup label="Unité">
                    <select
                      className="dash-form-select"
                      value={durationUnit}
                      onChange={(e) => setDurationUnit(e.target.value)}
                    >
                      <option value="days">Jours</option>
                      <option value="weeks">Semaines</option>
                      <option value="months">Mois</option>
                    </select>
                  </FieldGroup>
                </div>

                <FieldGroup label="Fichier joint" hint="PDF, image, vidéo, etc.">
                  <input
                    className="dash-form-input"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.mp4,.webm,.mov"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  {file && (
                    <div style={{ marginTop: 8, fontSize: "0.8rem", color: "#9a6060" }}>
                      Fichier sélectionné : {file.name}
                    </div>
                  )}
                </FieldGroup>

                {error && <div className="dash-form-error">{error}</div>}

                <div style={{ display: "flex", gap: 10 }}>
                  {totalSteps > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep((s) => s - 1)}
                      style={{
                        flex: 1,
                        padding: 12,
                        border: "1.5px solid #f0dede",
                        borderRadius: 9,
                        background: "white",
                        color: "#9a6060",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      ← Retour
                    </button>
                  )}

                  <button
                    type="button"
                    className="dash-form-submit"
                    disabled={isBusy}
                    onClick={handleSubmit}
                    style={{ flex: 2 }}
                  >
                    {isBusy ? "Envoi en cours..." : "Envoyer l'offre 🚀"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

const slideAnim = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.22 },
};

const FieldGroup = ({ label, hint, children }) => (
  <div className="dash-form-group">
    <label className="dash-form-label">
      {label}
      {hint && <span style={{ fontWeight: 400, color: "#9a6060", marginLeft: 6 }}>({hint})</span>}
    </label>
    {children}
  </div>
);

const NavButtons = ({ onBack, onNext }) => (
  <div style={{ display: "flex", gap: 10 }}>
    {onBack && (
      <button
        type="button"
        onClick={onBack}
        style={{
          flex: 1,
          padding: 12,
          border: "1.5px solid #f0dede",
          borderRadius: 9,
          background: "white",
          color: "#9a6060",
          fontSize: "0.9rem",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        ← Retour
      </button>
    )}
    <button
      type="button"
      className="dash-form-submit"
      onClick={onNext}
      style={{ flex: onBack ? 2 : 1 }}
    >
      Suivant →
    </button>
  </div>
);

export default PitchForm;