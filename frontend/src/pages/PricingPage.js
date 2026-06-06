
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import subscriptionService from "../services/subscriptionService";
import useAuth from "../hooks/useAuth";

const ACCENT = "#c0152a";
const ORDER  = ["client", "freelancer", "team", "agency"];

const fmtDZD = (n) => `${Number(n || 0).toLocaleString("fr-DZ")} DZD`;

const ROLE_LABEL = {
  client: "Client", freelancer: "Freelancer", team: "Équipe", agency: "Agence",
};

const PricingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [plans,   setPlans]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    subscriptionService
      .getPlans()
      .then((res) => setPlans(res.plans || {}))
      .catch(() => setPlans({}))
      .finally(() => setLoading(false));
  }, []);

  const ordered = plans ? ORDER.filter((r) => plans[r]).map((r) => plans[r]) : [];

  const myPlan = isAuthenticated && user?.role && plans
    ? plans[user.role] || null
    : null;

  const displayedPlans = myPlan ? [myPlan] : ordered;

  return (
    <div style={{ minHeight: "100vh", background: "#0d0b14", color: "#fff", paddingBottom: 60 }}>
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 24px", maxWidth: 1140, margin: "0 auto",
      }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <img src="/marketili_logo.svg" alt="Marketili" style={{ height: 30 }} />
          <span style={{ fontWeight: 900, fontSize: "1.08rem", color: "#fff", letterSpacing: "-0.03em" }}>
            Market<span style={{ color: ACCENT }}>ili</span>
          </span>
        </Link>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link to="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
            Accueil
          </Link>
          {isAuthenticated ? (
            <button onClick={() => navigate("/billing")} style={ctaBtn}>Mon abonnement</button>
          ) : (
            <>
              <Link to="/login" style={{ color: "#fff", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600, padding: "8px 14px" }}>
                Se connecter
              </Link>
              <Link to="/register" style={{ ...ctaBtn, textDecoration: "none" }}>Commencer</Link>
            </>
          )}
        </div>
      </header>

      <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto", padding: "40px 24px 20px" }}>
        {myPlan ? (
          <>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 20, marginBottom: 16,
              background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)",
              fontSize: "0.82rem", fontWeight: 700, color: "#34d399",
            }}>
              Compte {ROLE_LABEL[user.role] || user.role} créé avec succès
            </div>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: "0 0 12px", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
              Une dernière étape
            </h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.98rem", lineHeight: 1.6, margin: 0 }}>
              Activez votre abonnement pour accéder à toutes les fonctionnalités de votre espace.
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: "2.4rem", fontWeight: 900, margin: "0 0 12px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Tarification simple<br />et transparente
            </h1>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "1rem", lineHeight: 1.6, margin: 0 }}>
              Choisissez la formule adaptée à votre profil. Abonnement mensuel,
              sans engagement — annulable à tout moment.
            </p>
          </>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.5)" }}>
          <div style={{
            width: 36, height: 36, margin: "0 auto 14px",
            border: "3px solid rgba(255,255,255,0.15)", borderTopColor: ACCENT,
            borderRadius: "50%", animation: "spin 0.7s linear infinite",
          }} />
          Chargement des tarifs…
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : displayedPlans.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.5)" }}>
          Tarifs indisponibles pour le moment.
        </div>
      ) : (
        <div style={{
          display: "grid", gap: 18,
          maxWidth: myPlan ? 480 : 1140,
          margin: "30px auto 0", padding: "0 24px",
          gridTemplateColumns: myPlan ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))",
        }}>
          {displayedPlans.map((plan) => {
            const price    = plan.monthly;
            const featured = myPlan ? true : plan.code === "agency";
            return (
              <div key={plan.code}
                style={{
                  background: featured
                    ? "linear-gradient(180deg, rgba(192,21,42,0.16), rgba(255,255,255,0.03))"
                    : "rgba(255,255,255,0.03)",
                  border: `1px solid ${featured ? "rgba(192,21,42,0.5)" : "rgba(255,255,255,0.09)"}`,
                  borderRadius: 18, padding: "28px 26px", position: "relative",
                  display: "flex", flexDirection: "column",
                }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#ff8095",
                  textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {plan.name}
                </div>
                <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", margin: "8px 0 18px",
                  lineHeight: 1.55, minHeight: 44 }}>
                  {plan.tagline}
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 18 }}>
                  <span style={{ fontSize: "2rem", fontWeight: 900 }}>{fmtDZD(price)}</span>
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.82rem" }}>/ mois</span>
                </div>

                <button
                  onClick={() => isAuthenticated ? navigate("/billing") : navigate(`/register?role=${plan.role}`)}
                  style={{
                    width: "100%", padding: "13px", borderRadius: 10, border: "none",
                    background: ACCENT, color: "#fff", fontWeight: 700, fontSize: "0.9rem",
                    cursor: "pointer", fontFamily: "inherit", margin: "14px 0 20px",
                    boxShadow: "0 8px 24px rgba(192,21,42,0.35)",
                  }}>
                  {isAuthenticated ? "Activer mon abonnement" : "S'abonner"}
                </button>

                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
                  {(plan.features || []).map((f, j) => (
                    <li key={j} style={{ display: "flex", gap: 9, alignItems: "flex-start",
                      fontSize: "0.83rem", color: "rgba(255,255,255,0.82)" }}>
                      <span style={{ color: "#10b981", fontWeight: 800, flexShrink: 0 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {myPlan && !loading && (
        <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>
          <button onClick={() => navigate(-1)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)",
              cursor: "pointer", fontSize: "0.8rem", fontFamily: "inherit" }}>
            Passer pour l'instant
          </button>
        </p>
      )}

      <p style={{ textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: "0.78rem", marginTop: 32 }}>
        Paiement sécurisé via Chargily Pay (CIB / Edahabia). Annulable à tout moment.
      </p>
    </div>
  );
};

const ctaBtn = {
  padding: "9px 18px", borderRadius: 9, border: "none",
  background: ACCENT, color: "#fff", fontWeight: 700, cursor: "pointer",
  fontFamily: "inherit", fontSize: "0.84rem",
};

export default PricingPage;
