// frontend/src/pages/BillingPage.js
//
// Subscription & billing screen. Shows the user's current status (active /
// expired), their per-role monthly plan, and a "subscribe" button that opens a
// Chargily Pay V2 checkout. On return from the hosted payment page
// (?payment=success) it verifies the checkout and reflects the new active period.

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import subscriptionService from "../services/subscriptionService";

const ACCENT = "#c0152a";

const fmtDZD = (n) => `${Number(n || 0).toLocaleString("fr-DZ")} DZD`;
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const STATUS_META = {
  active:   { label: "Actif",            color: "#15803d", bg: "#f0fdf4" },
  expired:  { label: "Abonnement requis", color: "#b45309", bg: "#fffbeb" },
  past_due: { label: "Impayé",           color: "#b91c1c", bg: "#fef2f2" },
  canceled: { label: "Annulé",           color: "#b45309", bg: "#fffbeb" },
};

const BillingPage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [sub, setSub] = useState(null);
  const [billed, setBilled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [notice, setNotice] = useState(null); // { tone, text }

  const load = useCallback(() => {
    setLoading(true);
    return subscriptionService
      .getMine()
      .then((res) => {
        setBilled(res.billed);
        setSub(res.subscription);
        return res;
      })
      .catch(() => setNotice({ tone: "danger", text: "Impossible de charger votre abonnement." }))
      .finally(() => setLoading(false));
  }, []);

  // Handle return from the Chargily hosted checkout.
  useEffect(() => {
    const payment = params.get("payment");
    if (payment === "success") {
      setLoading(true);
      subscriptionService
        .verify()
        .then((res) => {
          setBilled(res.billed ?? true);
          setSub(res.subscription);
          const ok = res.subscription?.status === "active";
          setNotice(
            ok
              ? { tone: "success", text: "Paiement confirmé — votre abonnement est actif. Merci !" }
              : { tone: "warn", text: "Paiement reçu. Activation en cours, actualisez dans un instant." }
          );
        })
        .catch(() => setNotice({ tone: "warn", text: "Paiement en cours de vérification…" }))
        .finally(() => {
          setLoading(false);
          params.delete("payment");
          setParams(params, { replace: true });
        });
    } else if (payment === "failed") {
      setNotice({ tone: "danger", text: "Le paiement a échoué ou a été annulé. Réessayez." });
      params.delete("payment");
      setParams(params, { replace: true });
      load();
    } else {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubscribe = () => {
    setProcessing(true);
    setNotice(null);
    subscriptionService
      .createCheckout("month")
      .then((res) => {
        if (res.checkout_url) {
          window.location.href = res.checkout_url; // off to Chargily
        } else {
          setNotice({ tone: "danger", text: "Réponse de paiement invalide." });
          setProcessing(false);
        }
      })
      .catch((err) => {
        const code = err.response?.data?.code;
        setNotice({
          tone: "danger",
          text:
            code === "CHARGILY_NOT_CONFIGURED"
              ? "Le paiement n'est pas encore configuré côté serveur (clé Chargily manquante)."
              : err.response?.data?.message || "Impossible de démarrer le paiement.",
        });
        setProcessing(false);
      });
  };

  const handleCancel = () => {
    if (!window.confirm("Annuler le renouvellement ? Vous gardez l'accès jusqu'à la fin de la période.")) return;
    subscriptionService
      .cancel()
      .then((res) => {
        setSub(res.subscription);
        setNotice({ tone: "warn", text: "Renouvellement annulé. Accès maintenu jusqu'à la fin de la période." });
      })
      .catch(() => setNotice({ tone: "danger", text: "Annulation impossible." }));
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Shell onBack={() => navigate(-1)}>
        <div style={{ textAlign: "center", padding: "60px 0", color: "#9a6060" }}>
          <div style={{
            width: 36, height: 36, margin: "0 auto 14px",
            border: "3px solid #fae0e0", borderTopColor: ACCENT,
            borderRadius: "50%", animation: "spin 0.7s linear infinite",
          }} />
          Chargement…
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </Shell>
    );
  }

  if (!billed || sub?.status === "exempt") {
    return (
      <Shell onBack={() => navigate(-1)}>
        {notice && <Notice {...notice} />}
        <div className="card" style={cardStyle}>
          <h3 style={{ margin: "0 0 6px", color: "#1a0a0a" }}>Aucun abonnement requis</h3>
          <p style={{ color: "#6b7280", fontSize: "0.88rem", margin: 0 }}>
            Votre compte est rattaché à une organisation ou dispose d'un accès complet.
            Aucune action de facturation n'est nécessaire.
          </p>
        </div>
      </Shell>
    );
  }

  const plan = sub?.plan;
  const meta = STATUS_META[sub?.status] || STATUS_META.expired;
  const price = plan?.monthly;
  const isActive = sub?.status === "active";
  const ctaLabel = isActive ? "Prolonger l'abonnement" : "S'abonner";

  return (
    <Shell onBack={() => navigate(-1)}>
      {notice && <Notice {...notice} />}

      {/* Current status */}
      <div className="card" style={{ ...cardStyle, borderLeft: `4px solid ${meta.color}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9a6060", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Statut actuel
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
              <span style={{ padding: "3px 12px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700, color: meta.color, background: meta.bg }}>
                {meta.label}
              </span>
              {isActive && (
                <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                  {sub.cancelAtPeriodEnd ? "Se termine le " : "Renouvellement le "}{fmtDate(sub.currentPeriodEnd)}
                </span>
              )}
            </div>
          </div>
          {isActive && !sub.cancelAtPeriodEnd && (
            <button onClick={handleCancel} style={ghostBtn}>Annuler le renouvellement</button>
          )}
        </div>
      </div>

      {/* Plan + checkout */}
      {plan && (
        <div className="card" style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <h3 style={{ margin: "0 0 4px", color: "#1a0a0a", fontSize: "1.1rem" }}>
                Plan {plan.name}
              </h3>
              <p style={{ margin: 0, color: "#6b7280", fontSize: "0.86rem", lineHeight: 1.5 }}>{plan.tagline}</p>
            </div>
          </div>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "18px 0" }}>
            <span style={{ fontSize: "2rem", fontWeight: 800, color: "#1a0a0a" }}>{fmtDZD(price)}</span>
            <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>/ mois</span>
          </div>

          {/* Features */}
          {plan.features?.length > 0 && (
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "grid", gap: 8 }}>
              {plan.features.map((f, i) => (
                <li key={i} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: "0.86rem", color: "#374151" }}>
                  <span style={{ color: "#15803d", fontWeight: 800 }}>✓</span> {f}
                </li>
              ))}
            </ul>
          )}

          <button onClick={handleSubscribe} disabled={processing}
            style={{
              width: "100%", padding: "13px", borderRadius: 10, border: "none",
              background: ACCENT, color: "#fff", fontSize: "0.95rem", fontWeight: 700,
              cursor: processing ? "wait" : "pointer", fontFamily: "inherit",
              opacity: processing ? 0.7 : 1,
            }}>
            {processing ? "Redirection vers le paiement…" : `${ctaLabel} — ${fmtDZD(price)}`}
          </button>

          <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.74rem", marginTop: 10 }}>
            Paiement sécurisé via Chargily Pay (CIB / Edahabia).
          </p>
        </div>
      )}
    </Shell>
  );
};

// ── Layout + small UI bits ─────────────────────────────────────────────────────
const cardStyle = {
  background: "#fff", border: "1px solid #f0e0e0", borderRadius: 14,
  padding: "20px 22px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};
const ghostBtn = {
  padding: "8px 14px", borderRadius: 8, border: "1.5px solid #e5e7eb",
  background: "none", color: "#6b7280", fontWeight: 600, fontSize: "0.8rem",
  cursor: "pointer", fontFamily: "inherit",
};

const Shell = ({ children, onBack }) => (
  <div style={{ minHeight: "100vh", background: "#fff7f7", padding: "28px 16px" }}>
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={ghostBtn}>← Retour</button>
        <h1 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "#1a0a0a" }}>Abonnement</h1>
      </div>
      {children}
    </div>
  </div>
);

const NOTICE_TONES = {
  success: { bg: "#f0fdf4", border: "#bbf7d0", color: "#166534" },
  warn:    { bg: "#fffbeb", border: "#fde68a", color: "#92400e" },
  danger:  { bg: "#fef2f2", border: "#fecaca", color: "#b91c1c" },
};
const Notice = ({ tone, text }) => {
  const t = NOTICE_TONES[tone] || NOTICE_TONES.warn;
  return (
    <div style={{
      padding: "12px 16px", borderRadius: 10, marginBottom: 16,
      background: t.bg, border: `1px solid ${t.border}`, color: t.color,
      fontSize: "0.85rem", fontWeight: 600,
    }}>
      {text}
    </div>
  );
};

export default BillingPage;
