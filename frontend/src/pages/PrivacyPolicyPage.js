




import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const ACCENT = "#c0152a";

const Section = ({ title, children }) => (
  <section style={{ marginBottom: 26 }}>
    <h2 style={{ fontSize: "1.05rem", fontWeight: 800, margin: "0 0 8px", color: "#fff" }}>{title}</h2>
    <div style={{ fontSize: "0.92rem", lineHeight: 1.7, color: "rgba(255,255,255,0.62)" }}>{children}</div>
  </section>
);

const PrivacyPolicyPage = () => {
  useEffect(() => { document.title = "Politique de confidentialité — Marketili"; }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0d0b14", color: "#fff", paddingBottom: 60 }}>
      {}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 24px", maxWidth: 820, margin: "0 auto",
      }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <img src="/marketili_logo.svg" alt="Marketili" style={{ height: 30 }} />
          <span style={{ fontWeight: 900, fontSize: "1.08rem", color: "#fff", letterSpacing: "-0.03em" }}>
            Market<span style={{ color: ACCENT }}>ili</span>
          </span>
        </Link>
        <Link to="/login" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
          Se connecter
        </Link>
      </header>

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "20px 24px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.03em" }}>
          Politique de confidentialité
        </h1>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", margin: "0 0 32px" }}>
          Dernière mise à jour : juin 2026
        </p>

        <Section title="1. Introduction">
          Marketili (« nous ») exploite une plateforme de mise en relation entre clients et
          prestataires marketing (agences, équipes, freelancers). Cette politique explique quelles
          données nous collectons, pourquoi, et quels sont vos droits.
        </Section>

        <Section title="2. Données que nous collectons">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Données de compte : nom, email, téléphone, rôle, et informations de profil que vous fournissez.</li>
            <li>Contenu : posts, pitchs, projets, contrats, messages et fichiers que vous publiez.</li>
            <li>Données techniques : journaux de connexion et cookies d'authentification.</li>
            <li>Données de paiement : traitées par notre prestataire Chargily Pay — nous ne stockons pas vos données bancaires.</li>
          </ul>
        </Section>

        <Section title="3. Utilisation des données">
          Nous utilisons vos données pour : fournir et sécuriser le service, gérer votre compte et
          votre abonnement, mettre en relation clients et prestataires, vous envoyer des notifications
          et des emails (dont la vérification d'adresse), et améliorer la plateforme.
        </Section>

        <Section title="4. Cookies et authentification">
          Nous utilisons un cookie d'authentification (JWT, HTTP-only) strictement nécessaire pour vous
          garder connecté. Aucun cookie publicitaire tiers n'est utilisé.
        </Section>

        <Section title="5. Paiements">
          Les paiements d'abonnement sont traités de façon sécurisée par Chargily Pay (CIB / Edahabia).
          Vos informations de carte ne transitent jamais par nos serveurs et ne sont pas stockées par Marketili.
        </Section>

        <Section title="6. Partage des données">
          Vos informations de profil public sont visibles par les autres utilisateurs dans le cadre de
          la mise en relation. Nous ne vendons pas vos données. Nous ne les partageons qu'avec les
          prestataires techniques nécessaires (hébergement, email, paiement) ou si la loi l'exige.
        </Section>

        <Section title="7. Conservation">
          Nous conservons vos données tant que votre compte est actif, puis pour la durée nécessaire au
          respect de nos obligations légales. Vous pouvez demander la suppression de votre compte.
        </Section>

        <Section title="8. Vos droits">
          Vous pouvez accéder à vos données, les corriger, ou demander leur suppression en nous
          contactant. Vous pouvez aussi vous opposer à certains traitements.
        </Section>

        <Section title="9. Contact">
          Pour toute question relative à cette politique ou à vos données, écrivez-nous à{" "}
          <a href="mailto:contact@marketili.dz" style={{ color: "#ff8095" }}>contact@marketili.dz</a>.
        </Section>

        <div style={{ marginTop: 36, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.09)" }}>
          <Link to="/login" style={{
            display: "inline-block", padding: "11px 22px", borderRadius: 10,
            background: ACCENT, color: "#fff", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none",
          }}>
            Retour à la connexion
          </Link>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
