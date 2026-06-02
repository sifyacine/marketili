// frontend/src/components/collaborations/CollaborationRequestModal.jsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import collaborationRequestService from "../../services/collaborationRequestService";
import useAuth from "../../hooks/useAuth";

const ROLES = [
  { v: "designer",          l: "Designer" },
  { v: "smm",               l: "SMM" },
  { v: "community_manager", l: "Community Manager" },
  { v: "editor",            l: "Éditeur" },
  { v: "filmmaker",         l: "Filmeur / Vidéaste" },
  { v: "photographer",      l: "Photographe" },
  { v: "strategist",        l: "Stratège" },
  { v: "autre",             l: "Autre" },
];

const CollaborationRequestModal = ({ target, onClose, onSuccess }) => {
  const { user } = useAuth();

  const [proposedRole, setProposedRole] = useState("");
  const [message,      setMessage]      = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [sent,         setSent]         = useState(false);

  if (!target) return null;

  const targetName = target.agencyName || target.teamName ||
    (target.firstName ? `${target.firstName} ${target.lastName}` : target.name || "—");
  const targetType = target._role === "agency" ? "Agency"
    : target._role === "team" ? "Team"
    : "Client";

  const fromName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user?.email || "Freelancer";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await collaborationRequestService.sendRequest({
        fromType: "Freelancer",
        fromId: user._id,
        fromName,
        toType: targetType,
        toId: target._id,
        toName: targetName,
        message: message.trim() || undefined,
        proposedRole: proposedRole || undefined,
      });
      setSent(true);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 1200,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        style={{
          background: "#fff", borderRadius: 16,
          width: "100%", maxWidth: 500,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}>
        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f0dede",
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1a0a0a" }}>
              Proposer une collaboration
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "#9a6060" }}>
              À : <strong>{targetName}</strong>
            </p>
          </div>
          <button onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer",
              fontSize: "1.2rem", color: "#9a6060", lineHeight: 1, padding: 4 }}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px" }}>
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="sent"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>✓</div>
                <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 6 }}>
                  Demande envoyée !
                </div>
                <p style={{ fontSize: "0.82rem", color: "#9a6060", lineHeight: 1.5 }}>
                  {targetName} recevra une notification et pourra accepter ou refuser votre demande.
                </p>
                <button className="section-cta-btn" onClick={onClose}
                  style={{ marginTop: 18, width: "100%", justifyContent: "center" }}>
                  Fermer
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit}>
                {/* Role */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600,
                    color: "#9a6060", marginBottom: 6, textTransform: "uppercase",
                    letterSpacing: "0.04em" }}>
                    Rôle proposé
                  </label>
                  <select
                    value={proposedRole}
                    onChange={e => setProposedRole(e.target.value)}
                    className="dash-form-input"
                    style={{ width: "100%" }}>
                    <option value="">— Sélectionner un rôle (optionnel) —</option>
                    {ROLES.map(r => (
                      <option key={r.v} value={r.v}>{r.l}</option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600,
                    color: "#9a6060", marginBottom: 6, textTransform: "uppercase",
                    letterSpacing: "0.04em" }}>
                    Message de présentation
                  </label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Présentez-vous, expliquez votre motivation..."
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8,
                      border: "1.5px solid #f0dede", fontSize: "0.85rem",
                      fontFamily: "inherit", resize: "vertical", boxSizing: "border-box",
                      lineHeight: 1.5 }}
                  />
                </div>

                {error && (
                  <div style={{ color: "#b91c1c", fontSize: "0.82rem", marginBottom: 12,
                    padding: "8px 12px", background: "#fef2f2", borderRadius: 7 }}>
                    {error}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  <button type="submit" disabled={loading} className="section-cta-btn"
                    style={{ flex: 1, justifyContent: "center" }}>
                    {loading ? "Envoi..." : "Envoyer la demande"}
                  </button>
                  <button type="button" onClick={onClose}
                    style={{ padding: "9px 18px", borderRadius: 8,
                      border: "1.5px solid #f0dede", background: "none",
                      color: "#9a6060", fontWeight: 600, fontSize: "0.85rem",
                      cursor: "pointer", fontFamily: "inherit" }}>
                    Annuler
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CollaborationRequestModal;
