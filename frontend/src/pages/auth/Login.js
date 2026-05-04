import React, { useState } from "react";
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
  const from = location.state?.from?.pathname;

  const [form,    setForm]    = useState({ email: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.login(form.email, form.password);
      const resolvedRole = data.user?.role || "client";

      // ✅ token is in the httpOnly cookie — just hydrate state
      login(data.user, resolvedRole);

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
      <div className="auth-left">
        <div className="auth-left-bg" />
        <div className="auth-left-content">
          <Link to="/" className="auth-logo">Market<span>ili</span></Link>
          <h2 className="auth-left-title">Bienvenue sur Marketili.</h2>
          <p className="auth-left-desc">Connectez-vous pour accéder à votre espace de travail.</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
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
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mot de passe</label>
                <input
                  className="form-input"
                  type="password"
                  name="password"
                  required
                  placeholder="Votre mot de passe"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              {error && <div className="form-error">{error}</div>}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter →"}
              </button>
            </form>

            <p className="auth-footer-text">
              Pas encore de compte ? <Link to="/register">Créer un compte</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
