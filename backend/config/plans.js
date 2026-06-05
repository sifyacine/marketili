// backend/config/plans.js
//
// ── Subscription plan catalog (single source of truth) ───────────────────────
// Marketili has NO free tier and NO free trial: every billed account must hold
// an active paid subscription to use value actions (post a need, send a pitch…).
// Plans are per-role and billed monthly only.
//
// EDIT PRICES HERE. Amounts are in whole DZD (Chargily uses the main currency
// unit, not centimes). Chargily's test-mode minimum is 75 DZD.
//
// Roles that pay: client, agency, team, freelancer (the registerable roles).
// Members (agency_member, team_member) are covered by their parent org and are
// NOT billed separately. Admin is always exempt.

// No free trial. Keep this at 0 — set a positive number only to reintroduce one.
const TRIAL_DAYS = 0;
const CURRENCY = "dzd";

// Roles that require their own subscription / are subject to the paywall.
const BILLED_ROLES = ["client", "agency", "team", "freelancer"];

// Roles that are never gated (staff of a paying org, or platform staff).
const EXEMPT_ROLES = ["admin", "agency_member", "team_member"];

// Per-role plan definitions. `monthly` is the charged amount (DZD / month).
const PLANS = {
  client: {
    code: "client",
    role: "client",
    name: "Client",
    tagline: "Publiez vos besoins et collaborez avec les meilleurs prestataires.",
    monthly: 5000,
    features: [
      "Publication de besoins illimitée",
      "Réception et comparaison des pitchs",
      "Gestion de projets et contrats",
      "Messagerie et suivi en temps réel",
    ],
  },
  freelancer: {
    code: "freelancer",
    role: "freelancer",
    name: "Freelancer",
    tagline: "Trouvez des missions et développez votre activité.",
    monthly: 20000,
    features: [
      "Accès à tous les besoins publiés",
      "Envoi de pitchs illimité",
      "Profil professionnel mis en avant",
      "Gestion de projets et contrats",
    ],
  },
  team: {
    code: "team",
    role: "team",
    name: "Team",
    tagline: "Coordonnez votre équipe et gérez vos collaborations.",
    monthly: 20000,
    features: [
      "Tout le plan Freelancer",
      "Gestion des membres d'équipe",
      "Tableau de bord collaboratif",
      "Répartition des tâches",
    ],
  },
  agency: {
    code: "agency",
    role: "agency",
    name: "Agency",
    tagline: "Pilotez votre agence : commerciaux, stratèges et projets.",
    monthly: 40000,
    features: [
      "Tout le plan Team",
      "Membres et filiales illimités",
      "Workflow commercial → stratégie",
      "Contrats et bons de commande",
    ],
  },
};

// Convenience: monthly amount for a given role. `interval` is accepted for
// backward compatibility but billing is monthly only.
function getPlanAmount(role /*, interval */) {
  const plan = PLANS[role];
  if (!plan) return null;
  return plan.monthly;
}

// Model name (for refPath) for a billed role.
const ROLE_TO_MODEL = {
  client: "Client",
  agency: "Agency",
  team: "Team",
  freelancer: "Freelancer",
};

module.exports = {
  TRIAL_DAYS,
  CURRENCY,
  BILLED_ROLES,
  EXEMPT_ROLES,
  PLANS,
  ROLE_TO_MODEL,
  getPlanAmount,
};
