// frontend/src/pages/auth/VerifyEmailPage.js
//
// Landing page for the verification link emailed at signup. Reads ?token=,
// confirms it with the backend, and shows a branded success / error state.

import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import authService from "../../services/authService";
import useAuth from "../../hooks/useAuth";

const ACCENT = "#c0152a";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isAuthenticated, user, role, updateUser } = useAuth();

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");
  const [code, setCode] = useState(null);
  const [resending, setResending] = useState(false);
  const [resendNote, setResendNote] = useState("");
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return; // guard against double-run in StrictMode
    ranRef.current = true;

    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Lien de vérification manquant ou incomplet.");
      return;
    }

    authService
      .verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message || "Votre adresse email a été vérifiée.");
        if (isAuthenticated) updateUser({ isVerified: true });
      })
      .catch((err) => {
        setStatus("error");
        setCode(err.response?.data?.code || null);
        setMessage(err.response?.data?.message || "La vérification a échoué. Réessayez.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResend = () => {
    setResending(true);
    setResendNote("");
    authService
      .resendVerification()
      .then((res) => setResendNote(res.message || "Email renvoyé."))
      .catch((err) =>
        setResendNote(err.response?.data?.message || "Impossible de renvoyer l'email pour le moment.")
      )
      .finally(() => setResending(false));
  };

  const goDashboard = () => {
    if (isAuthenticated && role) navigate(`/dashboard/${role}`);
    else navigate("/login");
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0d0b14", color: "#fff",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", marginBottom: 28 }}>
        <span style={{ fontWeight: 900, fontSize: "1.4rem", color: "#fff", letterSpacing: "-0.03em" }}>
          Market<span style={{ color: ACCENT }}>ili</span>
        </span>
      </Link>

      <div style={{
        width: "100%", maxWidth: 440, background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.09)", borderRadius: 18,
        padding: "38px 32px", textAlign: "center",
      }}>
        {status === "loading" && (
          <>
            <div style={{
              width: 44, height: 44, margin: "0 auto 20px",
              border: "3px solid rgba(255,255,255,0.15)", borderTopColor: ACCENT,
              borderRadius: "50%", animation: "spin 0.7s linear infinite",
            }} />
            <h1 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 8px" }}>Vérification en cours…</h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.9rem", margin: 0 }}>
              Un instant pendant que nous confirmons votre adresse email.
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {status === "success" && (
          <>
            <div style={badge("#10b981")}>✓</div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 10px" }}>Adresse vérifiée !</h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.92rem", lineHeight: 1.6, margin: "0 0 24px" }}>
              {message}
            </p>
            <button onClick={goDashboard} style={primaryBtn}>
              {isAuthenticated ? "Aller au tableau de bord" : "Se connecter"}
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div style={badge(ACCENT)}>!</div>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "0 0 10px" }}>Vérification impossible</h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.92rem", lineHeight: 1.6, margin: "0 0 22px" }}>
              {message}
            </p>

            {/* Expired / invalid → let a logged-in user request a fresh link */}
            {isAuthenticated && !user?.isVerified && (
              <>
                <button onClick={handleResend} disabled={resending} style={{ ...primaryBtn, opacity: resending ? 0.7 : 1 }}>
                  {resending ? "Envoi…" : "Renvoyer l'email de vérification"}
                </button>
                {resendNote && (
                  <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem", marginTop: 12 }}>{resendNote}</p>
                )}
              </>
            )}

            <div style={{ marginTop: 18 }}>
              <button onClick={goDashboard} style={ghostBtn}>
                {isAuthenticated ? "Retour au tableau de bord" : "Se connecter"}
              </button>
            </div>
            {code === "TOKEN_EXPIRED" && !isAuthenticated && (
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.8rem", marginTop: 16 }}>
                Connectez-vous, puis utilisez le bouton « Renvoyer » de la bannière pour recevoir un nouveau lien.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const badge = (color) => ({
  width: 64, height: 64, borderRadius: "50%", margin: "0 auto 20px",
  background: `${color}22`, color, border: `2px solid ${color}`,
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: "1.8rem", fontWeight: 900,
});

const primaryBtn = {
  width: "100%", padding: "13px", borderRadius: 10, border: "none",
  background: ACCENT, color: "#fff", fontWeight: 700, fontSize: "0.92rem",
  cursor: "pointer", fontFamily: "inherit",
};

const ghostBtn = {
  background: "none", border: "none", color: "rgba(255,255,255,0.6)",
  fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
  textDecoration: "underline",
};

export default VerifyEmailPage;
