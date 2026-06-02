import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import agencyMemberService from "../../services/agencyMemberService";
import teamMemberService   from "../../services/teamMemberService";
import "../../styles/auth.css";

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

const ChangePasswordPage = () => {
  const navigate        = useNavigate();
  const { user, login } = useAuth();

  const [form,    setForm]    = useState({ password: "", confirm: "" });
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const pwScore = pwStrength(form.password);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm)
      return setError("Les mots de passe ne correspondent pas");
    if (form.password.length < 8)
      return setError("Minimum 8 caractères requis");
    if (pwScore < 2)
      return setError("Mot de passe trop faible — ajoutez des chiffres ou majuscules");

    setLoading(true);
    try {
      let data;
      if (user?.role === "team_member") {
        data = await teamMemberService.changePassword(form.password);
        login(data.user, "team_member");
        navigate("/dashboard/team", { replace: true });
      } else {
        data = await agencyMemberService.changePassword(form.password);
        login(data.user, "agency_member");
        navigate("/dashboard/agency", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const displayName = user ? `${user.firstName} ${user.lastName}` : "Nouveau membre";

  return (
    <div className="auth-page">

      {/* ── Left panel ── */}
      <div className="auth-left">
        <div className="auth-left-bg" />
        <div className="auth-left-decor">M</div>

        <div className="auth-left-content">
          <div className="auth-logo" style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <img src="/marketili_logo.svg" alt="Marketili"
              style={{ height: 38, objectFit: "contain", display: "block", flexShrink: 0 }} />
            <span style={{ fontWeight: 900, fontSize: "1.3rem", color: "#fff", letterSpacing: "-0.03em" }}>
              Market<span style={{ color: "#c0152a" }}>ili</span>
            </span>
          </div>
          <h2 className="auth-left-title">
            Bienvenue dans <em>l'équipe.</em>
          </h2>
          <p className="auth-left-desc">
            Votre directeur a créé votre compte. Choisissez un mot de passe
            personnel pour sécuriser votre accès.
          </p>
        </div>

        <div className="auth-left-stats">
          <div className="auth-stat">
            <div className="auth-stat-num">AES-256</div>
            <div className="auth-stat-label">Chiffrement<br />des données</div>
          </div>
          <div className="auth-stat">
            <div className="auth-stat-num">JWT</div>
            <div className="auth-stat-label">Auth<br />sécurisée</div>
          </div>
          <div className="auth-stat">
            <div className="auth-stat-num">HTTPS</div>
            <div className="auth-stat-label">Connexion<br />protégée</div>
          </div>
        </div>

        <div className="auth-left-steps">
          {[
            { n: "01", t: "Connectez-vous avec le mot de passe temporaire" },
            { n: "02", t: "Choisissez votre nouveau mot de passe sécurisé"  },
            { n: "03", t: "Accédez à votre espace de travail"               },
          ].map(s => (
            <div className="auth-step" key={s.n}>
              <div className="auth-step-num">{s.n}</div>
              <div className="auth-step-text">{s.t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, ease: "easeOut" }}
          >
            <div className="auth-form-header">
              <h1 className="auth-form-title">Choisir un mot de passe</h1>
              <p className="auth-form-sub">
                Bonjour <strong>{displayName}</strong> — cette étape est requise avant d'accéder à votre tableau de bord.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">

              <div className="form-group">
                <label className="form-label">Nouveau mot de passe</label>
                <div className="pw-input-wrap">
                  <input
                    className="form-input"
                    type={showPw ? "text" : "password"}
                    name="password"
                    required
                    autoFocus
                    placeholder="Min. 8 caractères"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(p => !p)}>
                    {showPw ? "Masquer" : "Afficher"}
                  </button>
                </div>
                {form.password && (
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
              </div>

              <div className="form-group">
                <label className="form-label">Confirmer le mot de passe</label>
                <input
                  className="form-input"
                  type={showPw ? "text" : "password"}
                  name="confirm"
                  required
                  placeholder="Répétez votre mot de passe"
                  value={form.confirm}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <div className="form-error">
                  <span className="form-error-icon">!</span>
                  {error}
                </div>
              )}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading
                  ? <><span className="btn-spinner" /> Enregistrement...</>
                  : "Confirmer et accéder →"
                }
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
