import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import authService from "../../services/authService";
import "../../styles/auth.css";

const ROLE_PATHS = {
  client:        "/dashboard/client",
  agency:        "/dashboard/agency",
  agency_member: "/dashboard/agency",
  team:          "/dashboard/team",
  team_member:   "/dashboard/team",
  freelancer:    "/dashboard/freelancer",
  admin:         "/admin",
};

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();
  const from      = location.state?.from?.pathname;

  useEffect(() => { document.title = "Connexion — Marketili"; }, []);

  const [form,        setForm]        = useState({ email: "", password: "" });
  const [showPw,      setShowPw]      = useState(false);
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [forgotOpen,  setForgotOpen]  = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotState, setForgotState] = useState("idle"); // idle | loading | done | error
  const [forgotMsg,   setForgotMsg]   = useState("");

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotState("loading");
    try {
      await authService.forgotPassword(forgotEmail);
      setForgotState("done");
      setForgotMsg("Si cet email est associé à un compte, un lien de réinitialisation vous a été envoyé. Vérifiez votre boîte de réception.");
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.data?.code === "MAIL_NOT_CONFIGURED") {
        setForgotState("error");
        setForgotMsg(msg || "L'envoi d'emails n'est pas configuré sur ce serveur.");
      } else {
        setForgotState("done");
        setForgotMsg("Si cet email est associé à un compte, un lien de réinitialisation vous a été envoyé.");
      }
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data        = await authService.login(form.email, form.password);
      const resolvedRole = data.user?.role || "client";

      login(data.user, resolvedRole);

      if (["agency_member", "team_member"].includes(resolvedRole) && data.user?.mustChangePassword) {
        navigate("/change-password", { replace: true });
        return;
      }

      const destination =
        resolvedRole === "admin"
          ? "/admin"
          : from || ROLE_PATHS[resolvedRole] || "/dashboard/client";

      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {}
      <div className="auth-left">
        <div className="auth-left-bg" />
        <div className="auth-left-decor">M</div>

        <div className="auth-left-content">
          <Link to="/" className="auth-logo" style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <img src="/marketili_logo.svg" alt="Marketili"
              style={{ height: 38, objectFit: "contain", display: "block", flexShrink: 0 }} />
            <span style={{ fontWeight: 900, fontSize: "1.3rem", color: "#fff", letterSpacing: "-0.03em" }}>
              Market<span style={{ color: "#c0152a" }}>ili</span>
            </span>
          </Link>
          <h2 className="auth-left-title">
            Bienvenue sur<br /><em>Marketili.</em>
          </h2>
          <p className="auth-left-desc">
            Connectez-vous pour accéder à votre espace de travail.
          </p>
        </div>

      </div>

      {}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, ease: "easeOut" }}
          >
            <div className="auth-form-header">
              <h1 className="auth-form-title">Se connecter</h1>
              <p className="auth-form-sub">Accédez à votre tableau de bord</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Adresse email</label>
                <input
                  className="form-input"
                  type="email"
                  name="email"
                  required
                  placeholder="vous@exemple.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mot de passe</label>
                <div className="pw-input-wrap">
                  <input
                    className="form-input"
                    type={showPw ? "text" : "password"}
                    name="password"
                    required
                    placeholder="Votre mot de passe"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(p => !p)}>
                    {showPw ? "Masquer" : "Afficher"}
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="auth-forgot"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
                onClick={() => { setForgotOpen(true); setForgotEmail(form.email); setForgotState("idle"); setForgotMsg(""); }}>
                Mot de passe oublié ?
              </button>

              {error && (
                <div className="form-error">
                  <span className="form-error-icon">!</span>
                  {error}
                </div>
              )}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading
                  ? <><span className="btn-spinner" /> Connexion...</>
                  : "Se connecter"
                }
              </button>
            </form>

            <p className="auth-footer-text">
              Pas encore de compte ? <Link to="/register">Créer un compte</Link>
            </p>
            <p className="auth-footer-text" style={{ fontSize: "0.76rem", opacity: 0.7, marginTop: 6 }}>
              En continuant, vous acceptez notre{" "}
              <Link to="/privacy">Politique de confidentialité</Link>.
            </p>
          </motion.div>
        </div>
      </div>
      {forgotOpen && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}
          onClick={e => { if (e.target === e.currentTarget) setForgotOpen(false); }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              background: "#fff", borderRadius: 16, padding: "32px 28px",
              width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontWeight: 800, fontSize: "1.15rem", color: "#111" }}>
                Mot de passe oublié
              </h2>
              <button onClick={() => setForgotOpen(false)} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "1rem", color: "#999", padding: "2px 6px",
              }}>✕</button>
            </div>

            {forgotState === "done" || forgotState === "error" ? (
              <div>
                <div style={{
                  padding: "14px 16px", borderRadius: 10,
                  background: forgotState === "error" ? "#fef2f2" : "#f0fdf4",
                  border: forgotState === "error" ? "1px solid #fecaca" : "1px solid #bbf7d0",
                  color: forgotState === "error" ? "#dc2626" : "#166534",
                  fontSize: "0.88rem", lineHeight: 1.6, marginBottom: 20,
                }}>
                  {forgotMsg}
                </div>
                <button onClick={() => setForgotOpen(false)} style={{
                  width: "100%", padding: "12px", borderRadius: 9, border: "none",
                  background: "#c0152a", color: "#fff", fontWeight: 700,
                  fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit",
                }}>
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                <p style={{ margin: "0 0 18px", fontSize: "0.86rem", color: "#555", lineHeight: 1.6 }}>
                  Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Adresse email</label>
                  <input
                    className="form-input"
                    type="email"
                    required
                    placeholder="vous@exemple.com"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    autoFocus
                  />
                </div>
                <button type="submit" disabled={forgotState === "loading"} style={{
                  width: "100%", padding: "12px", borderRadius: 9, border: "none",
                  background: forgotState === "loading" ? "#e5e7eb" : "#c0152a",
                  color: forgotState === "loading" ? "#9ca3af" : "#fff",
                  fontWeight: 700, fontSize: "0.9rem",
                  cursor: forgotState === "loading" ? "default" : "pointer",
                  fontFamily: "inherit",
                }}>
                  {forgotState === "loading" ? "Envoi en cours…" : "Envoyer le lien"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Login;
