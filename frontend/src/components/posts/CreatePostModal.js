import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import postService from "../../services/postService";
import uploadService from "../../services/uploadService";
import { getDeadlineColor, getDeadlineLabel } from "../../utils/deadlineColor";

const CATEGORIES = [
  "Social Media", "SEO / SEM", "Création de contenu", "Publicité payante",
  "Email marketing", "Branding", "Photographie", "Vidéo", "Influence",
  "Community management", "Stratégie digitale", "Design graphique",
];

const MARKETING_TYPES = [
  "Events", "360 Marketing", "ATL", "BTL", "Production", "Brand Marketing",
];

const MARKETING_TYPE_FR = {
  "Events":         "Événementiel",
  "360 Marketing":  "Marketing 360°",
  "ATL":            "ATL (Above The Line)",
  "BTL":            "BTL (Below The Line)",
  "Production":     "Production",
  "Brand Marketing":"Brand Marketing",
};

const COLLAB_TYPES = [
  { value: "service",      label: "Service" },
  { value: "partnership",  label: "Partenariat" },
  { value: "sponsorship",  label: "Sponsoring" },
  { value: "exposure",     label: "Exposition" },
];

const COMP_TYPES = [
  { value: "monetary", label: "Monétaire" },
  { value: "benefits", label: "Avantages" },
  { value: "mixed",    label: "Mixte" },
];

const WILAYAT = [
  "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra",
  "Béchar","Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret",
  "Tizi Ouzou","Alger","Djelfa","Jijel","Sétif","Saïda","Skikda",
  "Sidi Bel Abbès","Annaba","Guelma","Constantine","Médéa","Mostaganem",
  "M'Sila","Mascara","Ouargla","Oran","El Bayadh","Illizi","Bordj Bou Arréridj",
  "Boumerdès","El Tarf","Tindouf","Tissemsilt","El Oued","Khenchela",
  "Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma","Aïn Témouchent",
  "Ghardaïa","Relizane",
];

const INITIAL = {
  title: "", description: "", deadline: "",
  budget: { min: "", max: "", currency: "DZD" },
  location: { city: "", region: "", country: "Algérie" },
  categories: [],
  targetProviders: ["all"],
  marketingType: "",
  collaborationType: "service",
  compensationType: "monetary",
  benefits: "",
  requiredSkills: [],
};

const STEPS = [
  { num: 1, label: "Brief" },
  { num: 2, label: "Médias" },
  { num: 3, label: "Termes" },
];

const CreatePostModal = ({ clientId, onClose, onCreated }) => {
  const [form,       setForm]       = useState(INITIAL);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [step,       setStep]       = useState(1);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [dragOver,   setDragOver]   = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const fileInputRef = useRef();

  const set       = (f, v)    => setForm(p => ({ ...p, [f]: v }));
  const setNested = (p, f, v) => setForm(prev => ({ ...prev, [p]: { ...prev[p], [f]: v } }));

  const toggleCategory = (cat) => setForm(p => ({
    ...p,
    categories: p.categories.includes(cat)
      ? p.categories.filter(c => c !== cat)
      : [...p.categories, cat],
  }));

  const toggleProvider = (p) => setForm(prev => {
    if (p === "all") return { ...prev, targetProviders: ["all"] };
    let next = prev.targetProviders.filter(x => x !== "all");
    next = next.includes(p) ? next.filter(x => x !== p) : [...next, p];
    return { ...prev, targetProviders: next.length ? next : ["all"] };
  });

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed || form.requiredSkills.includes(trimmed)) { setSkillInput(""); return; }
    set("requiredSkills", [...form.requiredSkills, trimmed]);
    setSkillInput("");
  };

  const removeSkill = (skill) =>
    set("requiredSkills", form.requiredSkills.filter(s => s !== skill));

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(); }
  };

  const addFiles = (files) => {
    const newItems = Array.from(files).map(file => ({
      id: Math.random().toString(36).slice(2),
      file,
      preview: URL.createObjectURL(file),
      mimeType: file.type,
      progress: 0,
      uploaded: null,
    }));
    setMediaFiles(p => [...p, ...newItems]);
  };

  const removeMedia = (id) => setMediaFiles(p => p.filter(m => m.id !== id));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const uploadAllMedia = async () => {
    const results = [];
    for (let i = 0; i < mediaFiles.length; i++) {
      const item = mediaFiles[i];
      if (item.uploaded) { results.push(item.uploaded); continue; }
      try {
        const res = await uploadService.upload(item.file, (pct) => {
          setMediaFiles(prev => prev.map(m =>
            m.id === item.id ? { ...m, progress: pct } : m
          ));
        });
        setMediaFiles(prev => prev.map(m =>
          m.id === item.id ? { ...m, uploaded: res, progress: 100 } : m
        ));
        results.push(res);
      } catch (err) {
        console.error("Upload failed for", item.file.name, err);
      }
    }
    return results;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const uploadedMedia = await uploadAllMedia();
      const budgetData = (form.compensationType === "benefits")
        ? { currency: form.budget.currency }
        : {
            min:      form.budget.min ? Number(form.budget.min) : undefined,
            max:      form.budget.max ? Number(form.budget.max) : undefined,
            currency: form.budget.currency,
          };

      const data = await postService.create({
        ...form,
        clientId,
        media: uploadedMedia,
        budget: budgetData,
      });
      onCreated(data.post);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const showBudget   = form.compensationType === "monetary" || form.compensationType === "mixed";
  const showBenefits = form.compensationType === "benefits" || form.compensationType === "mixed";

  const deadlineColor = form.deadline ? getDeadlineColor(form.deadline) : null;
  const deadlineLabel = form.deadline ? getDeadlineLabel(form.deadline) : null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        className="modal-box"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{    opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.25 }}
      >
        {/* ── Header ── */}
        <div className="modal-header">
          <h2 className="modal-title">
            {step === 1 ? "Nouveau post" : step === 2 ? "Médias" : "Termes & Ciblage"}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Step bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {STEPS.map((s, i) => (
                <React.Fragment key={s.num}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: "0.7rem", fontWeight: 700,
                      background: step > s.num ? "#c0152a" : step === s.num ? "#c0152a" : "#f0dede",
                      color:      step >= s.num ? "#fff" : "#9a6060",
                      transition: "all 0.2s",
                    }}>{step > s.num ? "✓" : s.num}</div>
                    <span style={{ fontSize: "0.6rem", color: step >= s.num ? "#c0152a" : "#9a6060",
                      fontWeight: 600, whiteSpace: "nowrap" }}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{
                      width: 28, height: 2, background: step > s.num ? "#c0152a" : "#f0dede",
                      marginBottom: 14, transition: "background 0.2s",
                    }} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <AnimatePresence mode="wait">

              {/* ── STEP 1: Brief ── */}
              {step === 1 && (
                <motion.div key="s1" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="dash-form">

                  <div className="dash-form-group">
                    <label className="dash-form-label">Titre du post *</label>
                    <input className="dash-form-input"
                      placeholder="Ex : Gestion réseaux sociaux pour lancement produit"
                      value={form.title} onChange={e => set("title", e.target.value)} maxLength={200} />
                    <span className="dash-form-hint">{form.title.length}/200</span>
                  </div>

                  <div className="dash-form-group">
                    <label className="dash-form-label">Description *</label>
                    <textarea className="dash-form-textarea"
                      placeholder="Décrivez votre besoin : objectifs, contexte, attentes..."
                      value={form.description} onChange={e => set("description", e.target.value)}
                      style={{ minHeight: 90 }} />
                  </div>

                  <div className="dash-form-row">
                    <div className="dash-form-group">
                      <label className="dash-form-label">Type de marketing</label>
                      <select className="dash-form-select" value={form.marketingType}
                        onChange={e => set("marketingType", e.target.value)}>
                        <option value="">Sélectionner...</option>
                        {MARKETING_TYPES.map(t => (
                          <option key={t} value={t}>{MARKETING_TYPE_FR[t]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="dash-form-group">
                      <label className="dash-form-label">Région</label>
                      <select className="dash-form-select" value={form.location.region}
                        onChange={e => setNested("location", "region", e.target.value)}>
                        <option value="">Toute l'Algérie</option>
                        {WILAYAT.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Date limite with urgency color */}
                  <div className="dash-form-group">
                    <label className="dash-form-label">Date limite *</label>
                    <div style={{ position: "relative" }}>
                      <input
                        className="dash-form-input"
                        type="date"
                        value={form.deadline}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={e => set("deadline", e.target.value)}
                        style={deadlineColor ? {
                          borderColor: deadlineColor,
                          boxShadow: `0 0 0 2px ${deadlineColor}22`,
                        } : {}}
                      />
                      {deadlineLabel && (
                        <span style={{
                          position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                          fontSize: "0.72rem", fontWeight: 700, color: deadlineColor, pointerEvents: "none",
                        }}>
                          {deadlineLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Type de collaboration — radio cards */}
                  <div className="dash-form-group">
                    <label className="dash-form-label">Type de collaboration</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                      {COLLAB_TYPES.map(c => (
                        <button key={c.value} type="button"
                          onClick={() => set("collaborationType", c.value)}
                          style={{
                            padding: "7px 16px", borderRadius: 9, fontSize: "0.8rem",
                            fontWeight: 600, border: "1.5px solid", cursor: "pointer",
                            fontFamily: "inherit", transition: "all 0.15s",
                            borderColor: form.collaborationType === c.value ? "#c0152a" : "#f0dede",
                            background:  form.collaborationType === c.value ? "#fff0f0" : "white",
                            color:       form.collaborationType === c.value ? "#c0152a" : "#9a6060",
                          }}>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Catégories */}
                  <div className="dash-form-group">
                    <label className="dash-form-label">Catégories</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                      {CATEGORIES.map(cat => (
                        <button key={cat} type="button" onClick={() => toggleCategory(cat)} style={{
                          padding: "4px 12px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600,
                          border: "1.5px solid", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                          borderColor: form.categories.includes(cat) ? "#c0152a" : "#f0dede",
                          background:  form.categories.includes(cat) ? "#fff0f0" : "white",
                          color:       form.categories.includes(cat) ? "#c0152a" : "#9a6060",
                        }}>{cat}</button>
                      ))}
                    </div>
                  </div>

                  {/* Compétences requises — tag input */}
                  <div className="dash-form-group">
                    <label className="dash-form-label">Compétences requises</label>
                    {form.requiredSkills.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                        {form.requiredSkills.map(skill => (
                          <span key={skill} style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            padding: "3px 10px 3px 12px", borderRadius: 20, fontSize: "0.75rem",
                            fontWeight: 600, background: "#fff0f0", color: "#c0152a",
                            border: "1px solid #f0dede",
                          }}>
                            {skill}
                            <button type="button" onClick={() => removeSkill(skill)} style={{
                              background: "none", border: "none", cursor: "pointer",
                              color: "#c0152a", fontSize: "0.72rem", padding: "0 0 0 2px",
                              lineHeight: 1, fontFamily: "inherit",
                            }}>✕</button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      <input className="dash-form-input" style={{ flex: 1 }}
                        placeholder="Ex : Photoshop, Motion design... (Entrée pour ajouter)"
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillKeyDown} />
                      <button type="button" onClick={addSkill} style={{
                        padding: "0 14px", borderRadius: 9, border: "1.5px solid #c0152a",
                        background: "#fff0f0", color: "#c0152a", fontWeight: 700,
                        fontSize: "0.82rem", cursor: "pointer", fontFamily: "inherit",
                        flexShrink: 0,
                      }}>+ Ajouter</button>
                    </div>
                    <span className="dash-form-hint">Tapez une compétence et appuyez sur Entrée ou ","</span>
                  </div>

                  {error && <div className="dash-form-error">{error}</div>}

                  <button type="button" className="dash-form-submit" onClick={() => {
                    if (!form.title.trim() || !form.description.trim() || !form.deadline)
                      return setError("Titre, description et date limite requis");
                    setError(""); setStep(2);
                  }}>Suivant →</button>
                </motion.div>
              )}

              {/* ── STEP 2: Media Upload ── */}
              {step === 2 && (
                <motion.div key="s2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="dash-form">
                  <div className="dash-form-group">
                    <label className="dash-form-label">Photos & Vidéos <span style={{ fontWeight:400, color:"#9a6060" }}>(optionnel)</span></label>
                    <div
                      className={`media-upload-zone ${dragOver ? "drag-over" : ""}`}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="media-upload-icon">+</div>
                      <div className="media-upload-label">Glissez vos fichiers ici ou cliquez pour parcourir</div>
                      <div className="media-upload-hint">Images (JPG, PNG, WEBP) ou vidéos (MP4, MOV) · Max 50MB</div>
                      <input ref={fileInputRef} type="file" multiple accept="image/*,video/*"
                        style={{ display: "none" }} onChange={e => addFiles(e.target.files)} />
                    </div>

                    {mediaFiles.length > 0 && (
                      <div className="media-preview-grid">
                        {mediaFiles.map(m => (
                          <div key={m.id} className="media-preview-item">
                            {m.mimeType.startsWith("video/")
                              ? <video src={m.preview} muted />
                              : <img src={m.preview} alt="" />
                            }
                            <button type="button" className="media-preview-remove"
                              onClick={() => removeMedia(m.id)}>✕</button>
                            {m.progress > 0 && m.progress < 100 && (
                              <div className="media-upload-progress">
                                <div className="media-upload-progress-bar" style={{ width: `${m.progress}%` }} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <button type="button" onClick={() => setStep(1)} style={{
                      flex: 1, padding: 12, border: "1.5px solid #f0dede", borderRadius: 9,
                      background: "white", color: "#9a6060", fontSize: "0.9rem", fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit",
                    }}>← Retour</button>
                    <button type="button" className="dash-form-submit" style={{ flex: 2 }}
                      onClick={() => setStep(3)}>
                      Suivant →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Termes & Ciblage ── */}
              {step === 3 && (
                <motion.div key="s3" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="dash-form">

                  {/* Type de compensation */}
                  <div className="dash-form-group">
                    <label className="dash-form-label">Type de compensation</label>
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      {COMP_TYPES.map(c => (
                        <button key={c.value} type="button"
                          onClick={() => set("compensationType", c.value)}
                          style={{
                            flex: 1, padding: "10px 8px", borderRadius: 9, fontSize: "0.82rem",
                            fontWeight: 700, border: "1.5px solid", cursor: "pointer",
                            fontFamily: "inherit", transition: "all 0.15s", textAlign: "center",
                            borderColor: form.compensationType === c.value ? "#c0152a" : "#f0dede",
                            background:  form.compensationType === c.value ? "#fff0f0" : "white",
                            color:       form.compensationType === c.value ? "#c0152a" : "#9a6060",
                          }}>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget — only when monetary or mixed */}
                  {showBudget && (
                    <div className="dash-form-group">
                      <label className="dash-form-label">Budget estimé (DZD)</label>
                      <div className="dash-form-row">
                        <input className="dash-form-input" type="number" placeholder="Minimum"
                          value={form.budget.min} onChange={e => setNested("budget","min",e.target.value)} min={0} />
                        <input className="dash-form-input" type="number" placeholder="Maximum"
                          value={form.budget.max} onChange={e => setNested("budget","max",e.target.value)} min={0} />
                      </div>
                      <span className="dash-form-hint">Laissez vide si non défini</span>
                    </div>
                  )}

                  {/* Avantages proposés — only when benefits or mixed */}
                  {showBenefits && (
                    <div className="dash-form-group">
                      <label className="dash-form-label">
                        Avantages proposés
                        {form.compensationType === "mixed" && (
                          <span style={{ fontWeight: 400, color: "#9a6060", marginLeft: 6 }}>
                            (en plus du budget)
                          </span>
                        )}
                      </label>
                      <textarea className="dash-form-textarea"
                        placeholder="Ex : Visibilité sur nos réseaux, invitation événements, produits offerts..."
                        value={form.benefits}
                        onChange={e => set("benefits", e.target.value)}
                        style={{ minHeight: 80 }} />
                    </div>
                  )}

                  {/* Cibler des prestataires */}
                  <div className="dash-form-group">
                    <label className="dash-form-label">Cibler des prestataires</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                      {[
                        { id: "all",        label: "Tous" },
                        { id: "agency",     label: "Agences" },
                        { id: "team",       label: "Équipes" },
                        { id: "freelancer", label: "Freelancers" },
                      ].map(p => (
                        <button key={p.id} type="button" onClick={() => toggleProvider(p.id)} style={{
                          display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                          borderRadius: 9, fontSize: "0.82rem", fontWeight: 600, border: "1.5px solid",
                          cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                          borderColor: form.targetProviders.includes(p.id) ? "#c0152a" : "#f0dede",
                          background:  form.targetProviders.includes(p.id) ? "#fff0f0" : "white",
                          color:       form.targetProviders.includes(p.id) ? "#c0152a" : "#9a6060",
                        }}>{p.label}</button>
                      ))}
                    </div>
                    <span className="dash-form-hint">Laissez "Tous" pour une visibilité maximale</span>
                  </div>

                  {error && <div className="dash-form-error">{error}</div>}

                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <button type="button" onClick={() => setStep(2)} style={{
                      flex: 1, padding: 12, border: "1.5px solid #f0dede", borderRadius: 9,
                      background: "white", color: "#9a6060", fontSize: "0.9rem", fontWeight: 600,
                      cursor: "pointer", fontFamily: "inherit",
                    }}>← Retour</button>
                    <button type="submit" className="dash-form-submit" disabled={loading} style={{ flex: 2 }}>
                      {loading
                        ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                            <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)",
                              borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite",
                              display: "inline-block" }} />
                            Publication...
                          </span>
                        : "Publier le post"
                      }
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreatePostModal;
