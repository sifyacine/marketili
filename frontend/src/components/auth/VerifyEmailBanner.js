





import React, { useState } from "react";
import authService from "../../services/authService";
import useAuth from "../../hooks/useAuth";

const VERIFIABLE = ["client", "agency", "team", "freelancer"];

const VerifyEmailBanner = () => {
  const { user, role } = useAuth();
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState(null); 

  
  if (!user || !VERIFIABLE.includes(role) || user.isVerified) return null;

  const handleResend = () => {
    setSending(true);
    setNote(null);
    authService
      .resendVerification()
      .then((res) => setNote({ ok: true, text: res.message || "Email envoyé." }))
      .catch((err) =>
        setNote({ ok: false, text: err.response?.data?.message || "Échec de l'envoi. Réessayez." })
      )
      .finally(() => setSending(false));
  };

  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, flexWrap: "wrap",
        padding: "10px 16px", marginBottom: 14, borderRadius: 10,
        background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e",
        fontSize: "0.83rem", fontWeight: 600,
      }}
    >
      <span>
        ✉️ Vérifiez votre adresse email <strong>{user.email}</strong> pour sécuriser votre compte.
        {note && (
          <span style={{ marginLeft: 8, fontWeight: 700, color: note.ok ? "#15803d" : "#b91c1c" }}>
            {note.text}
          </span>
        )}
      </span>
      <button
        onClick={handleResend}
        disabled={sending}
        style={{
          flexShrink: 0, padding: "6px 14px", borderRadius: 7,
          background: "#b45309", color: "#fff", border: "none",
          fontSize: "0.8rem", fontWeight: 700,
          cursor: sending ? "wait" : "pointer", fontFamily: "inherit",
          opacity: sending ? 0.7 : 1,
        }}
      >
        {sending ? "Envoi…" : "Renvoyer l'email"}
      </button>
    </div>
  );
};

export default VerifyEmailBanner;
