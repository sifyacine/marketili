import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import agencyMemberService from "../../services/agencyMemberService";
import "../../styles/auth.css";

const ChangePasswordPage = () => {
  const navigate       = useNavigate();
  const { user, login } = useAuth();

  const [form,    setForm]    = useState({ password: "", confirm: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm)
      return setError("Les mots de passe ne correspondent pas");
    if (form.password.length < 8)
      return setError("Minimum 8 caractères");

    setLoading(true);
    try {
      const data = await agencyMemberService.changePassword(form.password);
      // Update auth state — mustChangePassword is now false
      login(data.user, "agency_member");
      navigate("/dashboard/agency", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : "Nouveau membre";

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-bg" />
        <div className="auth-left-content">
          <div className="auth-logo">Market<span>ili</span></div>
          <h2 className="auth-left-title">Bienvenue dans l'équipe.</h2>
          <p className="auth-left-desc">
            Votre directeur a créé votre compte. Choisissez un mot de passe
            personnel pour sécuriser votre accès.
          </p>
        </div>
        <div className="auth-left-steps">
          {[
            { n: "01", t: "Connectez-vous avec le mot de passe temporaire" },
            { n: "02", t: "Choisissez votre nouveau mot de passe"          },
            { n: "03", t: "Accédez à votre espace de travail"              },
          ].map(s => (
            <div className="auth-step" key={s.n}>
              <div className="auth-step-num">{s.n}</div>
              <div className="auth-step-text">{s.t}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}>

            <div className="auth-form-header">
              <h1 className="auth-form-title">Choisir un mot de passe</h1>
              <p className="auth-form-sub">
                Bonjour <strong>{displayName}</strong> — cette étape est obligatoire
                avant d'accéder à votre tableau de bord.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Nouveau mot de passe</label>
                <input
                  className="form-input"
                  type="password"
                  name="password"
                  required
                  autoFocus
                  placeholder="Min. 8 caractères"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirmer le mot de passe</label>
                <input
                  className="form-input"
                  type="password"
                  name="confirm"
                  required
                  placeholder="Répétez votre mot de passe"
                  value={form.confirm}
                  onChange={handleChange}
                />
              </div>

              {error && <div className="form-error">{error}</div>}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}>
                {loading ? "Enregistrement..." : "Confirmer et accéder →"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;