














const TRIAL_DAYS = 0;
const CURRENCY = "dzd";


const BILLED_ROLES = ["client", "agency", "team", "freelancer"];


const EXEMPT_ROLES = ["admin", "agency_member", "team_member"];


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



function getPlanAmount(role ) {
  const plan = PLANS[role];
  if (!plan) return null;
  return plan.monthly;
}


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
