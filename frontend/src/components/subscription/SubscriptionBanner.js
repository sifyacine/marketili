// frontend/src/components/subscription/SubscriptionBanner.js
//
// Thin status bar shown at the top of dashboards: trial countdown, an expiry
// warning, or a hard "subscribe now" prompt. Hidden for exempt accounts
// (members / admin) and for healthy active subscriptions.

import React from "react";
import { useNavigate } from "react-router-dom";
import useSubscription from "../../hooks/useSubscription";

const TONES = {
  info:   { bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af", btn: "#1d4ed8" },
  warn:   { bg: "#fffbeb", border: "#fde68a", color: "#92400e", btn: "#b45309" },
  danger: { bg: "#fef2f2", border: "#fecaca", color: "#b91c1c", btn: "#c0152a" },
};

const SubscriptionBanner = () => {
  const navigate = useNavigate();
  const { loading, billed, status, daysLeft, allowed, subscription } = useSubscription();

  if (loading || !billed || !status || status === "exempt") return null;

  let show = false;
  let tone = "info";
  let text = "";
  let cta = "Voir les abonnements";

  const plural = daysLeft > 1 ? "s" : "";

  if (status === "trialing") {
    show = true;
    if (daysLeft <= 3) {
      tone = "warn";
      text = `Votre essai gratuit se termine dans ${daysLeft} jour${plural}.`;
      cta = "S'abonner";
    } else {
      tone = "info";
      text = `🎁 Essai gratuit en cours — ${daysLeft} jour${plural} restant${plural}.`;
    }
  } else if (!allowed) {
    show = true;
    tone = "danger";
    text = "Votre accès est limité : votre essai ou abonnement a expiré.";
    cta = "S'abonner maintenant";
  } else if (status === "active" && subscription?.cancelAtPeriodEnd) {
    show = true;
    tone = "warn";
    text = "Abonnement annulé — actif jusqu'à la fin de la période en cours.";
    cta = "Gérer l'abonnement";
  }

  if (!show) return null;
  const t = TONES[tone];

  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, flexWrap: "wrap",
        padding: "10px 16px", marginBottom: 14, borderRadius: 10,
        background: t.bg, border: `1px solid ${t.border}`, color: t.color,
        fontSize: "0.83rem", fontWeight: 600,
      }}
    >
      <span>{text}</span>
      <button
        onClick={() => navigate("/billing")}
        style={{
          flexShrink: 0, padding: "6px 14px", borderRadius: 7,
          background: t.btn, color: "#fff", border: "none",
          fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        }}
      >
        {cta} →
      </button>
    </div>
  );
};

export default SubscriptionBanner;
