import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import authService from "../../services/authService";

const ACCENT = "#c0152a";
const DARK   = "#0d0b14";

const ResetPasswordPage = () => {
  const navigate    = useNavigate();
  const [params]    = useSearchParams();
  const token       = params.get("token");

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [status,    setStatus]    = useState("idle"); // idle | loading | success | error
  const [message,   setMessage]   = useState("");
  const [code,      setCode]      = useState(null);

  useEffect(() => { document.title = "Réinitialisation — Marketili"; }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setStatus("error");
      setMessage("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      setStatus("error");
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }
    setStatus("loading");
    try {
      const res = await authService.resetPassword(token, password);
      setStatus("success");
      setMessage(res.message || "Mot de passe réinitialisé avec succès.");
    } catch (err) {
      setStatus("error");
      setCode(err.response?.data?.code || null);
      setMessage(err.response?.data?.message || "La réinitialisation a échoué. Réessayez.");
    }
  };

  if (!token) {
    return (
      <PageShell>
        <Badge color={ACCENT}>!</Badge>
        <h1 style={h1Style}>Lien invalide</h1>
        <p style={subStyle}>Ce lien de réinitialisation est incomplet ou invalide.</p>
        <Link to="/login" style={{ ...primaryBtn, display: "inline-block" }}>Retour à la connexion</Link>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {status === "success" ? (
        <>
          <Badge color="#10b981">✓</Badge>
          <h1 style={h1Style}>Mot de passe réinitialisé !</h1>
          <p style={subStyle}>{message}</p>
          <button onClick={() => navigate("/login", { replace: true })} style={primaryBtn}>
            Se connecter
          </button>
        </>
      ) : (
        <>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h1 style={{ ...h1Style, marginBottom: 6 }}>Nouveau mot de passe</h1>
            <p style={{ ...subStyle, margin: 0 }}>
              Choisissez un nouveau mot de passe sécurisé pour votre compte.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nouveau mot de passe</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Au moins 6 caractères"
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (status === "error") setStatus("idle"); }}
                  style={inputStyle}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", fontFamily: "inherit",
                  }}>
                  {showPw ? "Masquer" : "Afficher"}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Confirmer le mot de passe</label>
              <input
                type={showPw ? "text" : "password"}
                required
                placeholder="Répétez le mot de passe"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); if (status === "error") setStatus("idle"); }}
                style={inputStyle}
              />
            </div>

            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: "11px 14px", borderRadius: 9, marginBottom: 16,
                  background: "rgba(192,21,42,0.12)", border: "1px solid rgba(192,21,42,0.35)",
                  color: "#fca5a5", fontSize: "0.84rem", lineHeight: 1.5,
                }}>
                {message}
                {code === "TOKEN_EXPIRED" && (
                  <div style={{ marginTop: 8 }}>
                    <Link to="/login" style={{ color: "#fca5a5", fontWeight: 600 }}>
                      Retour à la connexion pour demander un nouveau lien →
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                ...primaryBtn,
                opacity: status === "loading" ? 0.7 : 1,
                cursor: status === "loading" ? "default" : "pointer",
              }}>
              {status === "loading" ? "Réinitialisation…" : "Réinitialiser le mot de passe"}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: "center" }}>
            <Link to="/login" style={{
              color: "rgba(255,255,255,0.5)", fontSize: "0.82rem",
              textDecoration: "none", fontWeight: 500,
            }}>
              ← Retour à la connexion
            </Link>
          </div>
        </>
      )}
    </PageShell>
  );
};

const PageShell = ({ children }) => (
  <div style={{
    minHeight: "100vh", background: DARK, color: "#fff",
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", padding: 24,
  }}>
    <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", marginBottom: 32 }}>
      <span style={{ fontWeight: 900, fontSize: "1.4rem", color: "#fff", letterSpacing: "-0.03em" }}>
        Market<span style={{ color: ACCENT }}>ili</span>
      </span>
    </Link>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        width: "100%", maxWidth: 420,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 18, padding: "38px 32px",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
      {children}
    </motion.div>
  </div>
);

const Badge = ({ color, children }) => (
  <div style={{
    width: 64, height: 64, borderRadius: "50%", margin: "0 auto 20px",
    background: `${color}22`, color, border: `2px solid ${color}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.8rem", fontWeight: 900,
  }}>{children}</div>
);

const h1Style = { fontSize: "1.4rem", fontWeight: 800, margin: "0 0 10px", textAlign: "center" };
const subStyle = { color: "rgba(255,255,255,0.6)", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: 24, textAlign: "center" };
const labelStyle = { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 6 };
const inputStyle = {
  width: "100%", padding: "11px 14px", borderRadius: 9, boxSizing: "border-box",
  border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)",
  color: "#fff", fontSize: "0.9rem", fontFamily: "inherit", outline: "none",
};
const primaryBtn = {
  width: "100%", padding: "13px", borderRadius: 10, border: "none",
  background: ACCENT, color: "#fff", fontWeight: 700, fontSize: "0.92rem",
  cursor: "pointer", fontFamily: "inherit", display: "block", textDecoration: "none",
  textAlign: "center",
};

export default ResetPasswordPage;
