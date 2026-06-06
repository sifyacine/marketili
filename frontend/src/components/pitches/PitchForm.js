

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import pitchService from "../../services/pitchService";
import "../../styles/PitchForm.css";

const PitchForm = ({ post, senderType, onSubmit, onClose, loading }) => {
  const { user, role } = useAuth();

  const normType = (senderType || role || "").toLowerCase();
  const finalSenderType = normType.includes("agency") ? "Agency"
    : normType.includes("team") ? "Team"
    : "Freelancer";

  const isAgency = finalSenderType === "Agency";
  const totalSteps = isAgency ? 5 : 2;

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("DZD");
  const [duration, setDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState("weeks");
  const [file, setFile] = useState(null);

  const [strategyOverview, setStrategyOverview] = useState("");
  const [creativeIdea, setCreativeIdea] = useState("");
  const [objectives, setObjectives] = useState("");
  const [measurableGoals, setMeasurableGoals] = useState("");
  const [techniques, setTechniques] = useState("");
  const [contentPillars, setContentPillars] = useState("");
  const [publicationCalendar, setPublicationCalendar] = useState("");
  const [postingFrequency, setPostingFrequency] = useState("");
  const [feedOrganization, setFeedOrganization] = useState("");
  const [competitiveAnalysis, setCompetitiveAnalysis] = useState("");
  const [colorPalette,        setColorPalette]        = useState("");
  const [positioningStrategy, setPositioningStrategy] = useState("");
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
    if (step === 1 && !isAgency && !description.trim()) {
      return setError("La description est requise");
    }
    if (step === 1 && isAgency && !strategyOverview.trim()) {
      return setError("L'aperçu stratégique est requis");
    }
    if (step === 4 && isAgency) {
      const min = ageMin !== "" ? Number(ageMin) : null;
      const max = ageMax !== "" ? Number(ageMax) : null;
      if (min !== null && (min < 13 || min > 100))
        return setError("L'âge minimum doit être entre 13 et 100");
      if (max !== null && (max < 13 || max > 100))
        return setError("L'âge maximum doit être entre 13 et 100");
      if (min !== null && max !== null && min > max)
        return setError("L'âge minimum ne peut pas dépasser l'âge maximum");
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setError("");
    if (!price) return setError("Le prix proposé est requis");
    if (!user?._id) return setError("Utilisateur non connecté");

    try {
      setSubmitting(true);

      let uploadedFile = null;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        
        const uploadRes = await fetch(
          `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/upload`,
          { method: "POST", body: formData, credentials: "include" }
        );
        
        if (!uploadRes.ok) throw new Error("Upload du fichier échoué");
        
        const uploadData = await uploadRes.json();
        uploadedFile = {
          fileId:   uploadData.fileId || uploadData.id,
          filename: uploadData.filename || file.name,
          mimeType: uploadData.mimeType || file.type || "",
          url:      uploadData.url,
        };
      }

      const pitchData = {
        postId: post?._id,
        senderId: user._id,
        senderType: finalSenderType,
        pitchType: finalSenderType === "Agency" ? "agency_to_client"
          : finalSenderType === "Team" ? "team_to_client"
          : "freelancer_to_client",
        internalStatus: "draft",
        description,
        proposedPrice: { amount: Number(price), currency },
        timeline: duration ? { duration: Number(duration), unit: durationUnit } : undefined,
        ...(uploadedFile && { attachments: [uploadedFile] }),
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
          contentPillars: contentPillars.split(",").map(s => s.trim()).filter(Boolean),
          publicationCalendar,
          postingFrequency,
          feedOrganization,
        };
        pitchData.analysis = {
          competitiveAnalysis,
          colorPalette: colorPalette.split(",").map(s => s.trim()).filter(Boolean),
          positioningStrategy,
        };
        pitchData.targetAudience = {
          ageMin: ageMin ? Number(ageMin) : undefined,
          ageMax: ageMax ? Number(ageMax) : undefined,
          gender,
          niche: niche.split(",").map(s => s.trim()).filter(Boolean),
          locations: locations.split(",").map(s => s.trim()).filter(Boolean),
        };
      }

      if (typeof onSubmit === "function") {
        await onSubmit(pitchData);
      } else {
        await pitchService.send(pitchData);
      }
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose?.()}>
      <motion.div className="pitch-form-modal modal-box"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.25 }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Soumettre une offre</h2>
            <p className="pitch-form-post-title">{post?.title}</p>
          </div>
          <div className="pitch-form-header-right">
            <div className="pitch-form-progress">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className={`pitch-form-progress-bar ${
                  step > i + 1 ? "completed" : step === i + 1 ? "active" : "inactive"
                }`} />
              ))}
            </div>
            <button type="button" className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="pitch-form-step-label">
          Étape {step} — {STEP_LABELS[step - 1]}
        </div>

        <div className="modal-body">
          <AnimatePresence mode="wait">
            {!isAgency && step === 1 && (
              <motion.div key="s1" {...slideAnim} className="dash-form">
                <div className="dash-form-group">
                  <label className="dash-form-label">Présentez votre offre *</label>
                  <textarea className="dash-form-textarea pitch-form-textarea-lg"
                    placeholder="Décrivez votre approche, vos compétences..."
                    value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                {error && <div className="dash-form-error">{error}</div>}
                <button type="button" className="dash-form-submit" onClick={handleNext}>
                  Suivant
                </button>
              </motion.div>
            )}

            {isAgency && step === 1 && (
              <motion.div key="a1" {...slideAnim} className="dash-form">
                <div className="dash-form-group">
                  <label className="dash-form-label">Aperçu stratégique *</label>
                  <textarea className="dash-form-textarea pitch-form-textarea-md"
                    placeholder="Vision globale de votre stratégie..."
                    value={strategyOverview} onChange={e => setStrategyOverview(e.target.value)} />
                </div>
                <div className="dash-form-group">
                  <label className="dash-form-label">Idée créative</label>
                  <textarea className="dash-form-textarea pitch-form-textarea-sm"
                    placeholder="Concept créatif central..."
                    value={creativeIdea} onChange={e => setCreativeIdea(e.target.value)} />
                </div>
                <div className="dash-form-row">
                  <div className="dash-form-group">
                    <label className="dash-form-label">Objectifs</label>
                    <input className="dash-form-input" placeholder="Image, visibilité..."
                      value={objectives} onChange={e => setObjectives(e.target.value)} />
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-form-label">Buts mesurables</label>
                    <input className="dash-form-input" placeholder="KPIs, metrics..."
                      value={measurableGoals} onChange={e => setMeasurableGoals(e.target.value)} />
                  </div>
                </div>
                <div className="dash-form-group">
                  <label className="dash-form-label">Techniques & Tactiques</label>
                  <input className="dash-form-input" placeholder="SEO, Paid ads..."
                    value={techniques} onChange={e => setTechniques(e.target.value)} />
                </div>
                {error && <div className="dash-form-error">{error}</div>}
                <button type="button" className="dash-form-submit" onClick={handleNext}>
                  Suivant
                </button>
              </motion.div>
            )}

            {isAgency && step === 2 && (
              <motion.div key="a2" {...slideAnim} className="dash-form">
                <div className="dash-form-group">
                  <label className="dash-form-label">Piliers de contenu (séparés par virgule)</label>
                  <input className="dash-form-input" placeholder="Éducation, Inspiration..."
                    value={contentPillars} onChange={e => setContentPillars(e.target.value)} />
                </div>
                <div className="dash-form-row">
                  <div className="dash-form-group">
                    <label className="dash-form-label">Fréquence de posting</label>
                    <input className="dash-form-input" placeholder="Ex: 3 posts/semaine"
                      value={postingFrequency} onChange={e => setPostingFrequency(e.target.value)} />
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-form-label">Calendrier de publication</label>
                    <input className="dash-form-input" placeholder="Ex: Lun, Mer, Ven"
                      value={publicationCalendar} onChange={e => setPublicationCalendar(e.target.value)} />
                  </div>
                </div>
                <div className="dash-form-group">
                  <label className="dash-form-label">Organisation du feed</label>
                  <textarea className="dash-form-textarea pitch-form-textarea-md"
                    placeholder="Comment organiser le feed visuellement..."
                    value={feedOrganization} onChange={e => setFeedOrganization(e.target.value)} />
                </div>
                {error && <div className="dash-form-error">{error}</div>}
                <div className="pitch-form-nav-buttons">
                  <button type="button" className="pitch-form-back-btn" onClick={() => setStep(1)}>
                    Retour
                  </button>
                  <button type="button" className="pitch-form-next-btn" onClick={handleNext}>
                    Suivant
                  </button>
                </div>
              </motion.div>
            )}

            {isAgency && step === 3 && (
              <motion.div key="a3" {...slideAnim} className="dash-form">
                <div className="dash-form-group">
                  <label className="dash-form-label">Analyse concurrentielle</label>
                  <textarea className="dash-form-textarea pitch-form-textarea-xl"
                    placeholder="Analyse de la concurrence..."
                    value={competitiveAnalysis} onChange={e => setCompetitiveAnalysis(e.target.value)} />
                </div>
                <div className="dash-form-group">
                  <label className="dash-form-label">Palette de couleurs (séparées par virgule)</label>
                  <input className="dash-form-input" placeholder="#FF5733, #C70039..."
                    value={colorPalette} onChange={e => setColorPalette(e.target.value)} />
                </div>
                <div className="dash-form-group">
                  <label className="dash-form-label">Stratégie de positionnement</label>
                  <textarea className="dash-form-textarea pitch-form-textarea-xl"
                    placeholder="Comment positionner la marque..."
                    value={positioningStrategy} onChange={e => setPositioningStrategy(e.target.value)} />
                </div>
                {error && <div className="dash-form-error">{error}</div>}
                <div className="pitch-form-nav-buttons">
                  <button type="button" className="pitch-form-back-btn" onClick={() => setStep(2)}>
                    Retour
                  </button>
                  <button type="button" className="pitch-form-next-btn" onClick={handleNext}>
                    Suivant
                  </button>
                </div>
              </motion.div>
            )}

            {isAgency && step === 4 && (
              <motion.div key="a4" {...slideAnim} className="dash-form">
                <div className="dash-form-row">
                  <div className="dash-form-group">
                    <label className="dash-form-label">Âge min</label>
                    <input className="dash-form-input" type="number" placeholder="18"
                      value={ageMin} onChange={e => setAgeMin(e.target.value)} min={13} max={100} />
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-form-label">Âge max</label>
                    <input className="dash-form-input" type="number" placeholder="35"
                      value={ageMax} onChange={e => setAgeMax(e.target.value)} min={13} max={100} />
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-form-label">Genre</label>
                    <select className="dash-form-select" value={gender} onChange={e => setGender(e.target.value)}>
                      <option value="all">Tous</option>
                      <option value="male">Hommes</option>
                      <option value="female">Femmes</option>
                    </select>
                  </div>
                </div>
                <div className="dash-form-group">
                  <label className="dash-form-label">Niche / Centres d'intérêt (séparés par virgule)</label>
                  <input className="dash-form-input" placeholder="Mode, Tech, Sport..."
                    value={niche} onChange={e => setNiche(e.target.value)} />
                </div>
                <div className="dash-form-group">
                  <label className="dash-form-label">Localisations ciblées (séparés par virgule)</label>
                  <input className="dash-form-input" placeholder="Alger, Oran, Constantine..."
                    value={locations} onChange={e => setLocations(e.target.value)} />
                </div>
                {error && <div className="dash-form-error">{error}</div>}
                <div className="pitch-form-nav-buttons">
                  <button type="button" className="pitch-form-back-btn" onClick={() => setStep(3)}>
                    Retour
                  </button>
                  <button type="button" className="pitch-form-next-btn" onClick={handleNext}>
                    Suivant
                  </button>
                </div>
              </motion.div>
            )}

            {step === totalSteps && (
              <motion.div key="final" {...slideAnim} className="dash-form">
                {isAgency && (
                  <div className="dash-form-group">
                    <label className="dash-form-label">Message d'accompagnement (optionnel)</label>
                    <textarea className="dash-form-textarea pitch-form-textarea-md"
                      placeholder="Message d'accompagnement pour le client..."
                      value={description} onChange={e => setDescription(e.target.value)} />
                  </div>
                )}
                <div className="dash-form-row">
                  <div className="dash-form-group">
                    <label className="dash-form-label">Prix proposé *</label>
                    <input className="dash-form-input" type="number" placeholder="Ex: 150000"
                      value={price} onChange={e => setPrice(e.target.value)} min={0} />
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-form-label">Devise</label>
                    <select className="dash-form-select" value={currency} onChange={e => setCurrency(e.target.value)}>
                      <option value="DZD">DZD</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
                <div className="dash-form-row">
                  <div className="dash-form-group">
                    <label className="dash-form-label">Durée estimée</label>
                    <input className="dash-form-input" type="number" placeholder="Ex: 4"
                      value={duration} onChange={e => setDuration(e.target.value)} min={1} />
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-form-label">Unité</label>
                    <select className="dash-form-select" value={durationUnit} onChange={e => setDurationUnit(e.target.value)}>
                      <option value="days">Jours</option>
                      <option value="weeks">Semaines</option>
                      <option value="months">Mois</option>
                    </select>
                  </div>
                </div>
                <div className="dash-form-group">
                  <label className="dash-form-label">Fichier joint (optionnel)</label>
                  <input className="dash-form-input" type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.mp4,.webm,.mov"
                    onChange={e => setFile(e.target.files?.[0] || null)} />
                  {file && <div className="pitch-form-file-name">Fichier : {file.name}</div>}
                </div>
                {error && <div className="dash-form-error">{error}</div>}
                <div className="pitch-form-nav-buttons">
                  {totalSteps > 1 && (
                    <button type="button" className="pitch-form-back-btn" onClick={() => setStep(s => s - 1)}>
                      Retour
                    </button>
                  )}
                  <button type="button" className="pitch-form-submit-btn" disabled={isBusy} onClick={handleSubmit}>
                    {isBusy ? "Envoi en cours..." : "Envoyer l'offre"}
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

export default PitchForm;