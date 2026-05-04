import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import authService from "../../services/authService";
import "../../styles/auth.css";

const ROLES = [
  { id: "client",     icon: "🎯", labelFR: "Client",                   descFR: "Je cherche des prestataires marketing", subOptions: true },
  { id: "agency",     icon: "🏢", labelFR: "Agence",                   descFR: "Je dirige une agence marketing"          },
  { id: "team",       icon: "👥", labelFR: "Équipe",                   descFR: "Notre équipe collabore sur des projets"  },
  { id: "freelancer", icon: "⚡️", labelFR: "Freelancer / Influenceur", descFR: "Je propose mes compétences créatives"    },
];

const FIELDS = {
  client_person: [
    { name: "firstName", label: "Prénom",    type: "text", required: true  },
    { name: "lastName",  label: "Nom",       type: "text", required: true  },
    { name: "phone",     label: "Téléphone", type: "tel",  required: false },
  ],
  client_company: [
    { name: "companyName", label: "Nom de l'entreprise", type: "text", required: true  },
    { name: "industry",    label: "Secteur d'activité",  type: "text", required: false },
    { name: "phone",       label: "Téléphone",           type: "tel",  required: false },
  ],
  agency: [
    { name: "agencyName",        label: "Nom de l'agence",        type: "text", required: true  },
    { name: "directorFirstName", label: "Prénom du directeur",    type: "text", required: true  },
    { name: "directorLastName",  label: "Nom du directeur",       type: "text", required: true  },
    { name: "phone",             label: "Téléphone",              type: "tel",  required: false },
    { name: "businessNumber",    label: "N° registre commercial", type: "text", required: false },
  ],
  team: [
    { name: "teamName",      label: "Nom de l'équipe",       type: "text", required: true  },
    { name: "leadFirstName", label: "Prénom du responsable", type: "text", required: true  },
    { name: "leadLastName",  label: "Nom du responsable",    type: "text", required: true  },
    { name: "phone",         label: "Téléphone",             type: "tel",  required: false },
  ],
  freelancer: [
    { name: "firstName", label: "Prénom",                             type: "text", required: true  },
    { name: "lastName",  label: "Nom",                                type: "text", required: true  },
    { name: "phone",     label: "Téléphone",                          type: "tel",  required: false },
    { name: "skills",    label: "Compétences (séparées par virgule)", type: "text", required: false },
  ],
};

const slide = {
  hidden:  { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit:    { opacity: 0, x: -30, transition: { duration: 0.2 } },
};

const Register = () => {
  const navigate      = useNavigate();
  const { login }     = useAuth();
  const [searchParams] = useSearchParams();

  // ✅ FIX: pre-select role from ?role= query param (set by landing page)
  const preselectedRole = searchParams.get("role");
  const validRole = ROLES.find(r => r.id === preselectedRole);

  const [step,        setStep]        = useState(validRole ? (validRole.subOptions ? 2 : 3) : 1);
  const [role,        setRole]        = useState(validRole ? validRole.id : null);
  const [accountType, setAccountType] = useState(null);
  const [formData,    setFormData]    = useState({ email: "", password: "", confirmPassword: "" });
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);

  const fieldKey = role === "client" ? `client_${accountType}` : role;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword)
      return setError("Les mots de passe ne correspondent pas");
    if (formData.password.length < 8)
      return setError("Minimum 8 caractères");

    const payload = { ...formData };
    delete payload.confirmPassword;

    if (role === "client") payload.accountType = accountType;

    if (payload.skills && typeof payload.skills === "string") {
      payload.skills = payload.skills.split(",").map((s) => s.trim()).filter(Boolean);
    }

    setLoading(true);
    try {
      const data = await authService.register(role, payload);
      // ✅ token is in the httpOnly cookie — just hydrate state
      login(data.user, role);
      navigate(`/dashboard/${role}`);
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-bg" />
        <div className="auth-left-content">
          <Link to="/" className="auth-logo">Market<span>ili</span></Link>
          <h2 className="auth-left-title">La plateforme qui connecte les marques aux experts marketing.</h2>
          <p className="auth-left-desc">Rejoignez plus de 2 400 professionnels sur Marketili.</p>
        </div>
        <div className="auth-left-steps">
          {[
            { n: "01", t: "Créez votre compte"          },
            { n: "02", t: "Explorez les opportunités"   },
            { n: "03", t: "Lancez vos collaborations"   },
          ].map((s) => (
            <div className="auth-step" key={s.n}>
              <div className="auth-step-num">{s.n}</div>
              <div className="auth-step-text">{s.t}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-progress">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`auth-progress-dot ${step >= s ? "active" : ""}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Pick role (only shown if no ?role= param) ── */}
            {step === 1 && (
              <motion.div key="s1" variants={slide} initial="hidden" animate="visible" exit="exit">
                <div className="auth-form-header">
                  <h1 className="auth-form-title">Créer un compte</h1>
                  <p className="auth-form-sub">Quel est votre rôle sur la plateforme ?</p>
                </div>
                <div className="role-select-grid">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      className="role-select-card"
                      type="button"
                      onClick={() => {
                        setRole(r.id);
                        r.subOptions ? setStep(2) : setStep(3);
                      }}
                    >
                      <span className="role-select-icon">{r.icon}</span>
                      <span className="role-select-name">{r.labelFR}</span>
                      <span className="role-select-desc">{r.descFR}</span>
                    </button>
                  ))}
                </div>
                <p className="auth-footer-text">Déjà un compte ? <Link to="/login">Se connecter</Link></p>
              </motion.div>
            )}

            {/* ── STEP 2: Account type (client only) ── */}
            {step === 2 && (
              <motion.div key="s2" variants={slide} initial="hidden" animate="visible" exit="exit">
                <button className="auth-back-btn" type="button" onClick={() => setStep(1)}>← Retour</button>
                <div className="auth-form-header">
                  <h1 className="auth-form-title">Type de compte</h1>
                  <p className="auth-form-sub">Personne physique ou entreprise ?</p>
                </div>
                <div className="account-type-grid">
                  {[
                    { id: "person",  icon: "👤", name: "Personne",   desc: "Compte personnel"     },
                    { id: "company", icon: "🏭", name: "Entreprise", desc: "Compte professionnel" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      className="account-type-card"
                      type="button"
                      onClick={() => { setAccountType(t.id); setStep(3); }}
                    >
                      <span className="account-type-icon">{t.icon}</span>
                      <span className="account-type-name">{t.name}</span>
                      <span className="account-type-desc">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Fill in details ── */}
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
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                  {(FIELDS[fieldKey] || []).map((f) => (
                    <div className="form-group" key={f.name}>
                      <label className="form-label">{f.label}</label>
                      <input
                        className="form-input"
                        type={f.type}
                        name={f.name}
                        required={f.required}
                        value={formData[f.name] || ""}
                        onChange={handleChange}
                      />
                    </div>
                  ))}

                  <div className="form-divider"><span>Accès au compte</span></div>

                  <div className="form-group">
                    <label className="form-label">Adresse email</label>
                    <input
                      className="form-input"
                      type="email"
                      name="email"
                      required
                      placeholder="vous@exemple.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Mot de passe</label>
                      <input
                        className="form-input"
                        type="password"
                        name="password"
                        required
                        placeholder="Min. 8 caractères"
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirmer</label>
                      <input
                        className="form-input"
                        type="password"
                        name="confirmPassword"
                        required
                        placeholder="Répétez"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {error && <div className="form-error">{error}</div>}

                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? "Création..." : "Créer mon compte →"}
                  </button>
                </form>
                <p className="auth-footer-text">Déjà un compte ? <Link to="/login">Se connecter</Link></p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Register;
