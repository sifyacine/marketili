import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import authService from "../../services/authService";
import "../../styles/auth.css";

/* ── Reference data ─────────────────────────────────────────────── */

const WILAYAS = [
  "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra","Béchar",
  "Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret","Tizi Ouzou","Alger",
  "Djelfa","Jijel","Sétif","Saïda","Skikda","Sidi Bel Abbès","Annaba","Guelma",
  "Constantine","Médéa","Mostaganem","M'Sila","Mascara","Ouargla","Oran","El Bayadh",
  "Illizi","Bordj Bou Arréridj","Boumerdès","El Tarf","Tindouf","Tissemsilt",
  "El Oued","Khenchela","Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma",
  "Aïn Témouchent","Ghardaïa","Relizane","El M'Ghair","El Meniaa",
  "Ouled Djellal","Bordj Badji Mokhtar","Béni Abbès","Timimoun","Touggourt",
  "Djanet","In Salah","In Guezzam",
];

const INDUSTRIES = [
  "Agroalimentaire","Agriculture","BTP & Immobilier","Commerce & Distribution",
  "Communication & Marketing","Culture & Divertissement","Éducation & Formation",
  "Énergie & Environnement","Finance & Assurance","Hôtellerie & Tourisme",
  "Industrie & Manufacture","Informatique & Technologie","Médias & Presse",
  "Pharmaceutique & Santé","Services aux entreprises","Télécom",
  "Transport & Logistique","Autre",
];

const COMPANY_SIZES = [
  { value: "1-10",    label: "TPE — 1 à 10 employés"       },
  { value: "11-50",   label: "PME — 11 à 50 employés"      },
  { value: "51-200",  label: "ETI — 51 à 200 employés"     },
  { value: "201-500", label: "Grande — 201 à 500 employés" },
  { value: "500+",    label: "Très grande — 500+ employés" },
];

const AGENCY_SPECIALTIES = [
  "Events","360 Marketing","ATL","BTL","Production","Brand Marketing",
  "Digital","Influence & Réseaux sociaux","Relations presse","Brand Strategy",
];

const ROLES = [
  { id: "client",     labelFR: "Client",                   descFR: "Je cherche des prestataires marketing", subOptions: true },
  { id: "agency",     labelFR: "Agence",                   descFR: "Je dirige une agence marketing"         },
  { id: "team",       labelFR: "Équipe créative",           descFR: "Notre équipe collabore sur des projets" },
  { id: "freelancer", labelFR: "Freelancer / Influenceur", descFR: "Je propose mes compétences créatives"   },
];

/* ── Password strength ─────────────────────────────────────────── */
const pwStrength = (pw) => {
  if (!pw || pw.length < 8) return 0;
  let s = 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  return s;
};
const PW_LABELS = ["", "Faible", "Moyen", "Fort", "Très fort"];
const PW_COLORS = ["", "#e0253f", "#f59e0b", "#3b82f6", "#22c55e"];

/* ── Animation ─────────────────────────────────────────────────── */
const slide = {
  hidden:  { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0,   transition: { duration: 0.28, ease: "easeOut" } },
  exit:    { opacity: 0, x: -22, transition: { duration: 0.2  } },
};

/* ── Small helpers ─────────────────────────────────────────────── */
const Field = ({ label, optional, children }) => (
  <div className="form-group">
    <label className="form-label">
      {label}
      {optional && <span className="form-optional">(optionnel)</span>}
    </label>
    {children}
  </div>
);

const Input = ({ name, value, onChange, placeholder, type = "text", required }) => (
  <input
    className="form-input"
    type={type}
    name={name}
    required={required}
    placeholder={placeholder}
    value={value || ""}
    onChange={onChange}
    autoComplete="off"
  />
);

const Select = ({ name, value, onChange, options, placeholder }) => (
  <select className="form-input form-select" name={name} value={value || ""} onChange={onChange}>
    <option value="">{placeholder || "Sélectionner..."}</option>
    {options.map(opt =>
      typeof opt === "string"
        ? <option key={opt} value={opt}>{opt}</option>
        : <option key={opt.value} value={opt.value}>{opt.label}</option>
    )}
  </select>
);

/* ── Step indicator ────────────────────────────────────────────── */
const STEPS_META = [
  { n: 1, label: "Rôle"   },
  { n: 2, label: "Type"   },
  { n: 3, label: "Profil" },
];

const StepBar = ({ step, role }) => {
  const getState = (n) => {
    if (n === 2 && role && role !== "client") return step >= 3 ? "done" : "done";
    if (step > n) return "done";
    if (step === n) return "active";
    return "inactive";
  };
  return (
    <div className="reg-steps">
      {STEPS_META.map((s, i) => (
        <React.Fragment key={s.n}>
          <div className={`reg-step ${getState(s.n)}`}>
            <div className="reg-step-circle">
              {getState(s.n) === "done" ? "✓" : s.n}
            </div>
            <div className="reg-step-label">{s.label}</div>
          </div>
          {i < STEPS_META.length - 1 && (
            <div className={`reg-step-connector ${getState(s.n) === "done" ? "done" : ""}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════ */
const Register = () => {
  const navigate       = useNavigate();
  const { login }      = useAuth();
  const [searchParams] = useSearchParams();

  const preselectedRole = searchParams.get("role");
  const validRole       = ROLES.find(r => r.id === preselectedRole);

  const [step,        setStep]        = useState(validRole ? (validRole.subOptions ? 2 : 3) : 1);
  const [role,        setRole]        = useState(validRole ? validRole.id : null);
  const [accountType, setAccountType] = useState(null);
  const [formData,    setFormData]    = useState({ email: "", password: "", confirmPassword: "", agencyType: "main" });
  const [specialties, setSpecialties] = useState([]);
  const [showPw,      setShowPw]      = useState(false);
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);

  const pwScore = pwStrength(formData.password);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const toggleSpecialty = (s) => {
    setSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword)
      return setError("Les mots de passe ne correspondent pas");
    if (formData.password.length < 8)
      return setError("Le mot de passe doit contenir au moins 8 caractères");
    if (pwScore < 2)
      return setError("Mot de passe trop faible — ajoutez des chiffres ou des majuscules");

    const payload = { ...formData };
    delete payload.confirmPassword;

    if (payload.region) {
      payload.location = { region: payload.region, country: "Algérie" };
      delete payload.region;
    }

    if (role === "client") payload.accountType = accountType;

    if (role === "agency") {
      payload.specialties = specialties;
      if (payload.agencyType !== "filiale") delete payload.parentAgencyName;
      delete payload.parentAgency;
    }

    if (payload.skills && typeof payload.skills === "string") {
      payload.skills = payload.skills.split(",").map(s => s.trim()).filter(Boolean);
    }

    setLoading(true);
    try {
      const data = await authService.register(role, payload);
      login(data.user, role);
      navigate(`/dashboard/${role}`);
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  /* ── Step subtitle ── */
  const stepSubtitle = () => {
    if (!role) return null;
    const labels = {
      client_person:  "Compte personne physique",
      client_company: "Compte entreprise",
      agency:         "Compte agence",
      team:           "Compte équipe créative",
      freelancer:     "Compte freelancer / influenceur",
    };
    const key = role === "client" ? `client_${accountType}` : role;
    return labels[key];
  };

  return (
    <div className="auth-page">

      {/* ── Left panel ─────────────────────────────────────────────── */}
      <div className="auth-left">
        <div className="auth-left-bg" />
        <div className="auth-left-decor">M</div>

        <div className="auth-left-content">
          <Link to="/" className="auth-logo">Market<span>ili</span></Link>
          <h2 className="auth-left-title">
            La plateforme qui connecte les marques aux <em>experts marketing.</em>
          </h2>
          <p className="auth-left-desc">
            Rejoignez plus de 2 400 professionnels et développez vos collaborations en Algérie.
          </p>
        </div>

        <div className="auth-left-stats">
          <div className="auth-stat">
            <div className="auth-stat-num">2 400+</div>
            <div className="auth-stat-label">Experts<br />inscrits</div>
          </div>
          <div className="auth-stat">
            <div className="auth-stat-num">850+</div>
            <div className="auth-stat-label">Projets<br />réalisés</div>
          </div>
          <div className="auth-stat">
            <div className="auth-stat-num">4</div>
            <div className="auth-stat-label">Types de<br />prestataires</div>
          </div>
        </div>

        <div className="auth-left-steps">
          {[
            { n: "01", t: "Créez votre compte gratuitement"       },
            { n: "02", t: "Explorez les opportunités et postulez"  },
            { n: "03", t: "Lancez vos collaborations"              },
          ].map(s => (
            <div className="auth-step" key={s.n}>
              <div className="auth-step-num">{s.n}</div>
              <div className="auth-step-text">{s.t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────────── */}
      <div className="auth-right">
        <div className="auth-form-wrap">

          <StepBar step={step} role={role} />

          <AnimatePresence mode="wait">

            {/* ── STEP 1 : Role ──────────────────────────────────── */}
            {step === 1 && (
              <motion.div key="s1" variants={slide} initial="hidden" animate="visible" exit="exit">
                <div className="auth-form-header">
                  <h1 className="auth-form-title">Créer un compte</h1>
                  <p className="auth-form-sub">Quel est votre rôle sur la plateforme ?</p>
                </div>
                <div className="role-select-grid">
                  {ROLES.map(r => (
                    <button
                      key={r.id}
                      className="role-select-card"
                      type="button"
                      onClick={() => { setRole(r.id); r.subOptions ? setStep(2) : setStep(3); }}
                    >
                      <span className="role-select-name">{r.labelFR}</span>
                      <span className="role-select-desc">{r.descFR}</span>
                    </button>
                  ))}
                </div>
                <p className="auth-footer-text">
                  Déjà un compte ? <Link to="/login">Se connecter</Link>
                </p>
              </motion.div>
            )}

            {/* ── STEP 2 : Account type (client only) ────────────── */}
            {step === 2 && (
              <motion.div key="s2" variants={slide} initial="hidden" animate="visible" exit="exit">
                <button className="auth-back-btn" type="button" onClick={() => setStep(1)}>
                  ← Retour
                </button>
                <div className="auth-form-header">
                  <h1 className="auth-form-title">Type de compte</h1>
                  <p className="auth-form-sub">Vous inscrivez-vous en tant que personne ou entreprise ?</p>
                </div>
                <div className="account-type-grid">
                  {[
                    { id: "person",  name: "Personne physique", desc: "Compte personnel",     icon: "P" },
                    { id: "company", name: "Entreprise",         desc: "Compte professionnel", icon: "E" },
                  ].map(t => (
                    <button
                      key={t.id}
                      className="account-type-card"
                      type="button"
                      onClick={() => { setAccountType(t.id); setStep(3); }}
                    >
                      <div className="account-type-icon-wrap">
                        <span style={{ fontSize: "1.5rem", fontWeight: 900, color: "#c0152a" }}>{t.icon}</span>
                      </div>
                      <span className="account-type-name">{t.name}</span>
                      <span className="account-type-desc">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── STEP 3 : Profile form ──────────────────────────── */}
            {step === 3 && (
              <motion.div key="s3" variants={slide} initial="hidden" animate="visible" exit="exit">
                <button
                  className="auth-back-btn"
                  type="button"
                  onClick={() => setStep(role === "client" ? 2 : 1)}
                >
                  ← Retour
                </button>
                <div className="auth-form-header">
                  <h1 className="auth-form-title">Vos informations</h1>
                  {stepSubtitle() && <p className="auth-form-sub">{stepSubtitle()}</p>}
                </div>

                <form onSubmit={handleSubmit} className="auth-form">

                  {/* ── Client / Personne ── */}
                  {role === "client" && accountType === "person" && (<>
                    <div className="form-row-2">
                      <Field label="Prénom">
                        <Input name="firstName" value={formData.firstName} onChange={handleChange} required />
                      </Field>
                      <Field label="Nom">
                        <Input name="lastName" value={formData.lastName} onChange={handleChange} required />
                      </Field>
                    </div>
                    <div className="form-row-2">
                      <Field label="Téléphone" optional>
                        <Input name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                      </Field>
                      <Field label="Wilaya" optional>
                        <Select name="region" value={formData.region} onChange={handleChange} options={WILAYAS} />
                      </Field>
                    </div>
                  </>)}

                  {/* ── Client / Entreprise ── */}
                  {role === "client" && accountType === "company" && (<>
                    <Field label="Nom de l'entreprise">
                      <Input name="companyName" value={formData.companyName} onChange={handleChange} required />
                    </Field>
                    <div className="form-row-2">
                      <Field label="Secteur d'activité" optional>
                        <Select name="industry" value={formData.industry} onChange={handleChange} options={INDUSTRIES} />
                      </Field>
                      <Field label="Taille" optional>
                        <Select name="companySize" value={formData.companySize} onChange={handleChange} options={COMPANY_SIZES} />
                      </Field>
                    </div>
                    <div className="form-row-2">
                      <Field label="Téléphone" optional>
                        <Input name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                      </Field>
                      <Field label="Wilaya" optional>
                        <Select name="region" value={formData.region} onChange={handleChange} options={WILAYAS} />
                      </Field>
                    </div>
                  </>)}

                  {/* ── Agence ── */}
                  {role === "agency" && (<>
                    <Field label="Nom de l'agence">
                      <Input name="agencyName" value={formData.agencyName} onChange={handleChange} required />
                    </Field>
                    <div className="form-row-2">
                      <Field label="Prénom du directeur">
                        <Input name="directorFirstName" value={formData.directorFirstName} onChange={handleChange} required />
                      </Field>
                      <Field label="Nom du directeur">
                        <Input name="directorLastName" value={formData.directorLastName} onChange={handleChange} required />
                      </Field>
                    </div>
                    <div className="form-row-2">
                      <Field label="Téléphone" optional>
                        <Input name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                      </Field>
                      <Field label="N° Registre commercial" optional>
                        <Input name="businessNumber" value={formData.businessNumber} onChange={handleChange} />
                      </Field>
                    </div>

                    <Field label="Type d'agence">
                      <div className="radio-group">
                        {[
                          { value: "main",    label: "Agence principale" },
                          { value: "filiale", label: "Filiale"           },
                        ].map(opt => (
                          <label key={opt.value} className={`radio-card ${formData.agencyType === opt.value ? "selected" : ""}`}>
                            <input type="radio" name="agencyType" value={opt.value}
                              checked={formData.agencyType === opt.value} onChange={handleChange} />
                            <span className="radio-indicator" />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </Field>

                    {formData.agencyType === "filiale" && (
                      <Field label="Agence mère" optional>
                        <Input name="parentAgencyName" value={formData.parentAgencyName}
                          onChange={handleChange} placeholder="Nom de l'agence mère" />
                      </Field>
                    )}

                    <Field label="Spécialités" optional>
                      <div className="specialty-chips">
                        {AGENCY_SPECIALTIES.map(s => (
                          <button key={s} type="button"
                            className={`specialty-chip ${specialties.includes(s) ? "selected" : ""}`}
                            onClick={() => toggleSpecialty(s)}>
                            {specialties.includes(s) && <span className="chip-check">✓</span>}
                            {s}
                          </button>
                        ))}
                      </div>
                      {specialties.length > 0 && (
                        <p className="specialty-count">
                          {specialties.length} sélectionnée{specialties.length > 1 ? "s" : ""}
                        </p>
                      )}
                    </Field>
                  </>)}

                  {/* ── Équipe ── */}
                  {role === "team" && (<>
                    <Field label="Nom de l'équipe">
                      <Input name="teamName" value={formData.teamName} onChange={handleChange} required />
                    </Field>
                    <div className="form-row-2">
                      <Field label="Prénom du responsable">
                        <Input name="leadFirstName" value={formData.leadFirstName} onChange={handleChange} required />
                      </Field>
                      <Field label="Nom du responsable">
                        <Input name="leadLastName" value={formData.leadLastName} onChange={handleChange} required />
                      </Field>
                    </div>
                    <Field label="Téléphone" optional>
                      <Input name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                    </Field>
                  </>)}

                  {/* ── Freelancer ── */}
                  {role === "freelancer" && (<>
                    <div className="form-row-2">
                      <Field label="Prénom">
                        <Input name="firstName" value={formData.firstName} onChange={handleChange} required />
                      </Field>
                      <Field label="Nom">
                        <Input name="lastName" value={formData.lastName} onChange={handleChange} required />
                      </Field>
                    </div>
                    <div className="form-row-2">
                      <Field label="Téléphone" optional>
                        <Input name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                      </Field>
                      <Field label="Wilaya" optional>
                        <Select name="region" value={formData.region} onChange={handleChange} options={WILAYAS} />
                      </Field>
                    </div>
                    <Field label="Compétences" optional>
                      <Input name="skills" value={formData.skills} onChange={handleChange}
                        placeholder="Ex : Photographie, Montage, Community management..." />
                    </Field>
                    <Field label="N° Carte auto-entrepreneur" optional>
                      <Input name="carteAutoEntrepreneur" value={formData.carteAutoEntrepreneur}
                        onChange={handleChange} placeholder="Numéro de votre carte" />
                    </Field>
                  </>)}

                  {/* ── Credentials ── */}
                  <div className="form-divider"><span>Accès au compte</span></div>

                  <Field label="Adresse email">
                    <input className="form-input" type="email" name="email" required
                      placeholder="vous@exemple.com" value={formData.email}
                      onChange={handleChange} autoComplete="email" />
                  </Field>

                  <Field label="Mot de passe">
                    <div className="pw-input-wrap">
                      <input className="form-input" type={showPw ? "text" : "password"}
                        name="password" required placeholder="Min. 8 caractères"
                        value={formData.password} onChange={handleChange} autoComplete="new-password" />
                      <button type="button" className="pw-toggle" onClick={() => setShowPw(p => !p)}>
                        {showPw ? "Masquer" : "Afficher"}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="pw-strength">
                        <div className="pw-strength-bar">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="pw-strength-seg"
                              style={{ background: i <= pwScore ? PW_COLORS[pwScore] : "#f0d8d8" }} />
                          ))}
                        </div>
                        <span className="pw-strength-label" style={{ color: PW_COLORS[pwScore] }}>
                          {PW_LABELS[pwScore]}
                        </span>
                      </div>
                    )}
                  </Field>

                  <Field label="Confirmer le mot de passe">
                    <input className="form-input" type={showPw ? "text" : "password"}
                      name="confirmPassword" required placeholder="Répétez votre mot de passe"
                      value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password" />
                  </Field>

                  {error && (
                    <div className="form-error">
                      <span className="form-error-icon">!</span>
                      {error}
                    </div>
                  )}

                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading
                      ? <><span className="btn-spinner" /> Création en cours...</>
                      : "Créer mon compte →"
                    }
                  </button>
                </form>

                <p className="auth-footer-text">
                  Déjà un compte ? <Link to="/login">Se connecter</Link>
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Register;
