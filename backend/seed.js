/**
 * seed.js — Full demo data seed for Marketili
 *
 * Creates demo accounts for every role with pre-filled profiles, active
 * subscriptions, sample posts, pitches, a project with tasks, and a
 * collaboration request so every page of the app can be tested immediately.
 *
 * ACCOUNTS CREATED
 * ─────────────────────────────────────────────────────────────
 * Role             Email                           Password
 * ─────────────────────────────────────────────────────────────
 * agency           agency@gmail.com                AAAAAAAA
 * agency_member    director.agency@gmail.com       DDDDDDDD
 * agency_member    strategist.agency@gmail.com     SSSSSSSS
 * team             team@gmail.com                  TTTTTTTT
 * team_member      member.team@gmail.com           MMMMMMMM
 * freelancer       freelancer@gmail.com            FFFFFFFF
 * client           client@gmail.com                CCCCCCCC
 * ─────────────────────────────────────────────────────────────
 *
 * Run: cd backend && node seed.js
 * Requires: MONGO_URI in backend/.env
 */

const mongoose = require("mongoose");
require("dotenv").config();

const Agency              = require("./models/Agency");
const AgencyMember        = require("./models/AgencyMember");
const Team                = require("./models/Team");
const TeamMember          = require("./models/TeamMember");
const Freelancer          = require("./models/Freelancer");
const Client              = require("./models/Client");
const Subscription        = require("./models/Subscription");
const Post                = require("./models/Post");
const Pitch               = require("./models/Pitch");
const Project             = require("./models/Project");
const CollaborationRequest = require("./models/CollaborationRequest");

// ── Helpers ────────────────────────────────────────────────────────────────

/** Future date offset from today */
const future = (days) => new Date(Date.now() + days * 86400000);
/** Past date offset from today */
const past   = (days) => new Date(Date.now() - days * 86400000);

/** Create a subscription with "active" status for any billed role */
async function ensureSubscription(userId, userModel, role, email) {
  const existing = await Subscription.findOne({ user: userId, role });
  if (existing) return existing;

  const amounts = { client: 5000, agency: 40000, team: 20000, freelancer: 20000 };
  const now = new Date();

  return Subscription.create({
    user: userId,
    userModel,
    role,
    email,
    planCode: role,
    interval: "month",
    status: "active",
    currentPeriodStart: now,
    currentPeriodEnd: future(30),
    amount: amounts[role],
    currency: "dzd",
    history: [
      {
        at: now,
        event: "paid",
        interval: "month",
        amount: amounts[role],
        periodEnd: future(30),
        note: "Seeded via seed.js",
      },
    ],
  });
}

// ── Main seed function ─────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // ─── 1. AGENCY ────────────────────────────────────────────────────────────
  let agency = await Agency.findOne({ email: "agency@gmail.com" });
  if (!agency) {
    agency = await Agency.create({
      agencyName:        "Vision Digital Agency",
      directorFirstName: "Karim",
      directorLastName:  "Benmoussa",
      businessNumber:    "RC2024-12345",
      address: { street: "12 Rue Didouche Mourad", region: "Alger" },
      email:   "agency@gmail.com",
      phone:   "0551234567",
      website: "https://visiondigital.dz",
      password: "AAAAAAAA",
      bio: "Agence digitale spécialisée en marketing 360°, social media et production créative. Fondée en 2018 à Alger.",
      specialties: ["Social Media", "360 Marketing", "Brand Strategy", "Production Vidéo"],
      portfolioItems: [
        {
          title:       "Campagne Ramadan – MobilisA",
          description: "Campagne multi-canal Ramadan avec 2M+ d'impressions",
          link:        "https://visiondigital.dz/portfolio/mobilisa",
        },
        {
          title:       "Rebranding – TexDZ",
          description: "Refonte complète identité visuelle et charte graphique",
          link:        "https://visiondigital.dz/portfolio/texdz",
        },
      ],
      isVerified: true,
    });
    console.log("✅ Agency created:", agency.email);
  } else {
    console.log("⏭  Agency already exists:", agency.email);
  }

  await ensureSubscription(agency._id, "Agency", "agency", agency.email);
  console.log("✅ Agency subscription active");

  // ─── 2. AGENCY MEMBERS ────────────────────────────────────────────────────
  let director = await AgencyMember.findOne({ email: "director.agency@gmail.com" });
  if (!director) {
    director = await AgencyMember.create({
      agency:    agency._id,
      firstName: "Nadia",
      lastName:  "Cherif",
      email:     "director.agency@gmail.com",
      phone:     "0661234568",
      password:  "DDDDDDDD",
      jobTitle:  "marketing_director",
      skills:    ["Stratégie Marketing", "Gestion de Projet", "Brand Management"],
      bio:       "Directrice marketing avec 10 ans d'expérience en Algérie et à l'international.",
      accountStatus: "active",
      mustChangePassword: false,
    });
    console.log("✅ Agency member (director) created:", director.email);
  } else {
    console.log("⏭  Agency member (director) already exists:", director.email);
  }

  let strategist = await AgencyMember.findOne({ email: "strategist.agency@gmail.com" });
  if (!strategist) {
    strategist = await AgencyMember.create({
      agency:    agency._id,
      firstName: "Amine",
      lastName:  "Djouadi",
      email:     "strategist.agency@gmail.com",
      phone:     "0771234569",
      password:  "SSSSSSSS",
      jobTitle:  "strategist",
      skills:    ["Stratégie Digitale", "Analyse Concurrentielle", "Copywriting"],
      bio:       "Stratège digital passionné par les contenus à forte valeur ajoutée.",
      accountStatus: "active",
      mustChangePassword: false,
    });
    console.log("✅ Agency member (strategist) created:", strategist.email);
  } else {
    console.log("⏭  Agency member (strategist) already exists:", strategist.email);
  }

  // Push members onto agency if not already there
  const agencyMemberIds = [director._id, strategist._id];
  for (const memberId of agencyMemberIds) {
    if (!agency.members.some((m) => m.toString() === memberId.toString())) {
      agency.members.push(memberId);
    }
  }
  await agency.save();

  // ─── 3. TEAM ──────────────────────────────────────────────────────────────
  let team = await Team.findOne({ email: "team@gmail.com" });
  if (!team) {
    team = await Team.create({
      teamName:      "Creative Spark Team",
      leadFirstName: "Rania",
      leadLastName:  "Boukhalfa",
      address:       { region: "Oran" },
      email:    "team@gmail.com",
      phone:    "0551112233",
      website:  "https://creativespark.dz",
      password: "TTTTTTTT",
      bio: "Équipe créative spécialisée en design graphique, gestion de réseaux sociaux et production de contenu.",
      specialties: ["Design Graphique", "Social Media Management", "Motion Design"],
      portfolioItems: [
        {
          title:       "Pack Réseaux Sociaux – AlgeToura",
          description: "Création de 60 visuels pour une campagne tourisme",
          link:        "https://creativespark.dz/portfolio/algetoura",
        },
      ],
      isVerified: true,
    });
    console.log("✅ Team created:", team.email);
  } else {
    console.log("⏭  Team already exists:", team.email);
  }

  await ensureSubscription(team._id, "Team", "team", team.email);
  console.log("✅ Team subscription active");

  // ─── 4. TEAM MEMBER ───────────────────────────────────────────────────────
  let teamMember = await TeamMember.findOne({ email: "member.team@gmail.com" });
  if (!teamMember) {
    teamMember = await TeamMember.create({
      team:      team._id,
      firstName: "Sofiane",
      lastName:  "Mammeri",
      email:     "member.team@gmail.com",
      phone:     "0661112244",
      password:  "MMMMMMMM",
      jobTitle:  "Graphic Designer",
      skills:    ["Adobe Illustrator", "Photoshop", "Figma", "Canva Pro"],
      bio:       "Designer créatif avec 5 ans d'expérience en identité visuelle et contenu digital.",
      isActive:  true,
      mustChangePassword: false,
    });
    console.log("✅ Team member created:", teamMember.email);
  } else {
    console.log("⏭  Team member already exists:", teamMember.email);
  }

  if (!team.members.some((m) => m.toString() === teamMember._id.toString())) {
    team.members.push(teamMember._id);
    await team.save();
  }

  // ─── 5. FREELANCER ────────────────────────────────────────────────────────
  let freelancer = await Freelancer.findOne({ email: "freelancer@gmail.com" });
  if (!freelancer) {
    freelancer = await Freelancer.create({
      firstName: "Amira",
      lastName:  "Benali",
      email:     "freelancer@gmail.com",
      phone:     "0771122334",
      password:  "FFFFFFFF",
      bio: "Freelancer spécialisée en Social Media Management et Content Creation. 4 ans d'expérience avec des marques algériennes.",
      location: { region: "Constantine" },
      carteAutoEntrepreneur: "AE-2023-0054789",
      skills:     ["Social Media", "Copywriting", "Video Editing", "Photographie", "Canva"],
      categories: ["Social Media", "Content Creation", "Photography"],
      socialLinks: {
        instagram: "https://instagram.com/amira.benali.dz",
        linkedin:  "https://linkedin.com/in/amira-benali",
        tiktok:    "https://tiktok.com/@amirabenali_dz",
      },
      portfolioItems: [
        {
          title:       "Gestion Instagram – Café Azur",
          description: "6 mois de gestion complète: +15k abonnés, taux d'engagement 8.5%",
          link:        "https://instagram.com/cafe.azur.dz",
        },
        {
          title:       "Campagne UGC – SportDZ",
          description: "Production de 20 vidéos UGC pour la rentrée sportive",
          link:        "https://instagram.com/sportdz_officiel",
        },
      ],
      isVerified: true,
    });
    console.log("✅ Freelancer created:", freelancer.email);
  } else {
    console.log("⏭  Freelancer already exists:", freelancer.email);
  }

  await ensureSubscription(freelancer._id, "Freelancer", "freelancer", freelancer.email);
  console.log("✅ Freelancer subscription active");

  // ─── 6. CLIENT ────────────────────────────────────────────────────────────
  let client = await Client.findOne({ email: "client@gmail.com" });
  if (!client) {
    client = await Client.create({
      accountType:  "company",
      companyName:  "Djazair Foods SARL",
      companySize:  "51-200",
      industry:     "Agroalimentaire",
      fieldOfWork:  "Production et distribution de produits alimentaires locaux",
      email:        "client@gmail.com",
      phone:        "0551987654",
      password:     "CCCCCCCC",
      bio:          "Entreprise algérienne fondée en 2010, spécialisée dans les produits agroalimentaires traditionnels. Présente dans 12 wilayas.",
      location:     { region: "Alger" },
      achievements: [
        "Prix meilleur produit local - SIAL Alger 2022",
        "Certification ISO 22000 - 2021",
        "Distribution dans 500+ points de vente nationaux",
      ],
      isVerified: true,
    });
    console.log("✅ Client created:", client.email);
  } else {
    console.log("⏭  Client already exists:", client.email);
  }

  await ensureSubscription(client._id, "Client", "client", client.email);
  console.log("✅ Client subscription active");

  // ─── 7. POSTS ─────────────────────────────────────────────────────────────
  let post1 = await Post.findOne({ title: "Campagne Ramadan 2025 – Social Media & Influence" });
  if (!post1) {
    post1 = await Post.create({
      client:            client._id,
      title:             "Campagne Ramadan 2025 – Social Media & Influence",
      description:       "Nous recherchons une agence ou une équipe créative pour concevoir et exécuter notre campagne Ramadan 2025. L'objectif est d'augmenter notre notoriété sur les réseaux sociaux et de stimuler les ventes de notre gamme « Djazair Heritage » pendant le mois sacré.\n\nLa campagne doit refléter les valeurs familiales et la tradition algérienne tout en s'adressant à un public digitalement actif (18-45 ans).",
      objectives:        "Augmenter l'engagement Instagram/Facebook de 40% | Atteindre 500K impressions sur TikTok | Générer 20% de hausse des ventes en ligne pendant Ramadan",
      budget:            { min: 150000, max: 300000, currency: "DZD" },
      deadline:          future(45),
      requiredSkills:    ["Social Media Management", "Copywriting", "Video Production", "Influencer Marketing"],
      marketingType:     "360 Marketing",
      collaborationType: "service",
      compensationType:  "monetary",
      targetProviders:   ["agency", "team"],
      visibility:        "public",
      location:          { city: "Alger", region: "Alger", country: "Algérie" },
      categories:        ["Social Media", "Influence", "Ramadan"],
      status:            "in_progress",
    });
    console.log("✅ Post 1 created:", post1.title);
  } else {
    console.log("⏭  Post 1 already exists");
  }

  let post2 = await Post.findOne({ title: "Identité Visuelle & Branding – Nouvelle Gamme Biologique" });
  if (!post2) {
    post2 = await Post.create({
      client:            client._id,
      title:             "Identité Visuelle & Branding – Nouvelle Gamme Biologique",
      description:       "Djazair Foods lance une nouvelle gamme de produits biologiques certifiés et cherche un prestataire créatif pour développer l'identité visuelle complète. Le travail inclut la création du logo, la charte graphique, le packaging, et les templates réseaux sociaux.\n\nNous voulons un positionnement premium, moderne et ancré dans l'authenticité algérienne.",
      objectives:        "Livrer charte graphique complète | Packagings pour 5 références | Kit réseaux sociaux (12 templates)",
      budget:            { min: 80000, max: 150000, currency: "DZD" },
      deadline:          future(30),
      requiredSkills:    ["Design Graphique", "Branding", "Packaging", "Illustration"],
      marketingType:     "Brand Marketing",
      collaborationType: "service",
      compensationType:  "monetary",
      targetProviders:   ["all"],
      visibility:        "public",
      location:          { city: "Alger", region: "Alger", country: "Algérie" },
      categories:        ["Design", "Branding", "Packaging"],
      status:            "open",
    });
    console.log("✅ Post 2 created:", post2.title);
  } else {
    console.log("⏭  Post 2 already exists");
  }

  // Update client's createdPosts
  client.createdPosts = [];
  if (post1) client.createdPosts.push(post1._id);
  if (post2) client.createdPosts.push(post2._id);
  await client.save();

  // ─── 8. PITCHES ───────────────────────────────────────────────────────────

  // Pitch A: Agency → Client (on Post 1) — ACCEPTED
  let pitchAgency = await Pitch.findOne({ post: post1._id, senderAgency: agency._id });
  if (!pitchAgency) {
    const startDate = future(7);
    const endDate   = future(52);
    pitchAgency = await Pitch.create({
      pitchType:    "agency_to_client",
      post:         post1._id,
      client:       client._id,
      senderAgency: agency._id,
      senderType:   "agency",
      strategy: {
        strategyOverview:  "Stratégie multi-canal centrée sur l'émotion Ramadan: storytelling familial, contenus UGC et partenariats micro-influenceurs algériens authentiques.",
        creativeIdea:      "Série de mini-documentaires « Les Saveurs de Nos Mères » mettant en scène de vraies familles algériennes autour des produits Djazair Foods.",
        objectives:        "Augmenter l'engagement de 40%, atteindre 500K impressions TikTok, +20% ventes en ligne.",
        measurableGoals:   "KPIs hebdomadaires: reach, engagement rate, CTR, conversions site web.",
        techniques:        "UGC, Influencer seeding, Stories Ads ciblées, Reels quotidiens, Live Ramadan.",
      },
      content: {
        contentPillars:      ["Tradition & Famille", "Authenticité Algérienne", "Produit Premium", "Partage & Générosité"],
        publicationCalendar: "3 posts/jour pendant 30 jours: 1 Reels, 1 Stories, 1 post statique",
        postingFrequency:    "21 publications par semaine (3/jour)",
        feedOrganization:    "Feed organisé en triptyques alternant couleurs chaleureuses (rouge, or, vert) pour l'esthétique Ramadan.",
      },
      analysis: {
        competitiveAnalysis: "Analyse de 5 marques concurrentes (Ramy, Cevital, Ifri, Soummam, Bimo). Vision se distingue par l'authenticité vs l'aspect commercial.",
        colorPalette:        ["#8B1A1A", "#D4AF37", "#2C5F2E", "#FFF8DC"],
        positioningStrategy: "Positionnement émotionnel: 'Le goût de chez nous, le soin de toujours'.",
      },
      targetAudience: {
        ageMin:    22,
        ageMax:    45,
        gender:    "all",
        niche:     ["Famille", "Cuisine Algérienne", "Lifestyle", "Mode de vie sain"],
        locations: ["Alger", "Oran", "Constantine", "Annaba", "Blida"],
      },
      description:       "Vision Digital Agency vous propose une campagne Ramadan 360° alliant authenticité algérienne et performance digitale. Notre équipe de 12 experts prend en charge l'ensemble de la production et la diffusion.",
      workRequirements:  "Accès aux locaux pour tournage (2 jours), validation des contenus sous 24h, brief détaillé produits.",
      proposedPrice:     { amount: 245000, currency: "DZD" },
      timeline:          { duration: 45, unit: "days", startDate, endDate },
      contractType:      "cdd",
      status:            "accepted",
      respondedAt:       past(2),
      isReadByRecipient: true,
    });
    console.log("✅ Pitch (agency, accepted) created");
  } else {
    console.log("⏭  Pitch (agency) already exists");
  }

  // Pitch B: Team → Client (on Post 1) — PENDING
  let pitchTeam = await Pitch.findOne({ post: post1._id, senderTeam: team._id });
  if (!pitchTeam) {
    const startDate = future(10);
    const endDate   = future(55);
    pitchTeam = await Pitch.create({
      pitchType:  "team_to_client",
      post:       post1._id,
      client:     client._id,
      senderTeam: team._id,
      senderType: "team",
      strategy: {
        strategyOverview: "Approche visuelle forte basée sur la typographie arabe moderne et la photographie culinaire professionnelle.",
        creativeIdea:     "Série « Iftar Stories » – courtes vidéos verticales (30 sec) mettant en scène la préparation du repas de l'Iftar.",
        objectives:       "Créer un univers visuel distinctif et mémorable pour la gamme Djazair Heritage.",
        measurableGoals:  "100K vues TikTok semaine 1, 5% taux d'engagement moyen.",
        techniques:       "Motion Design, Stop Motion, User Generated Content, Stories interactives.",
      },
      content: {
        contentPillars:   ["Design Premium", "Authenticité", "Famille"],
        postingFrequency: "2 posts/jour pendant 30 jours",
      },
      targetAudience: {
        ageMin:    18,
        ageMax:    40,
        gender:    "all",
        niche:     ["Design Lovers", "Food Content", "Famille Algérienne"],
        locations: ["Alger", "Oran", "Constantine"],
      },
      description:      "Creative Spark Team propose une campagne axée sur le design premium et la production visuelle haute qualité. Notre spécialité: le motion design et la photographie culinaire.",
      workRequirements: "Brief produit détaillé, accès aux produits physiques pour shooting, retours clients sous 48h.",
      proposedPrice:    { amount: 180000, currency: "DZD" },
      timeline:         { duration: 45, unit: "days", startDate, endDate },
      contractType:     "cdd",
      status:           "pending",
      isReadByRecipient: false,
    });
    console.log("✅ Pitch (team, pending) created");
  } else {
    console.log("⏭  Pitch (team) already exists");
  }

  // Pitch C: Freelancer → Client (on Post 2) — PENDING
  let pitchFreelancer = await Pitch.findOne({ post: post2._id, senderFreelancer: freelancer._id });
  if (!pitchFreelancer) {
    const startDate = future(5);
    const endDate   = future(35);
    pitchFreelancer = await Pitch.create({
      pitchType:        "freelancer_to_client",
      post:             post2._id,
      client:           client._id,
      senderFreelancer: freelancer._id,
      senderType:       "freelancer",
      strategy: {
        strategyOverview: "Identité visuelle bio inspirée des motifs berbères modernisés, palette naturelle et typographie élégante.",
        creativeIdea:     "Concept « Racines & Modernité » – fusion du patrimoine algérien et du design packaging contemporain.",
        objectives:       "Créer une identité premium qui se démarque en rayon et sur le digital.",
        measurableGoals:  "Livraison complète en 3 semaines, 3 révisions incluses.",
        techniques:       "Illustration vectorielle, typographie sur-mesure, moodboard validé avant exécution.",
      },
      targetAudience: {
        ageMin:    25,
        ageMax:    45,
        gender:    "all",
        niche:     ["Consommateurs bio", "Lifestyle premium", "Cuisine saine"],
        locations: ["Alger", "Oran"],
      },
      description:      "Freelancer spécialisée en branding et design packaging avec 4 ans d'expérience. Portfolio disponible sur demande. Travail en totale autonomie avec points de validation réguliers.",
      workRequirements: "Brief complet avec valeurs marque, cibles et concurrents. Accès aux fichiers vectoriels existants si disponibles.",
      proposedPrice:    { amount: 95000, currency: "DZD" },
      timeline:         { duration: 21, unit: "days", startDate, endDate },
      contractType:     "cdd",
      status:           "pending",
      isReadByRecipient: false,
    });
    console.log("✅ Pitch (freelancer, pending) created");
  } else {
    console.log("⏭  Pitch (freelancer) already exists");
  }

  // Update post1 pitches array
  post1.pitches        = [pitchAgency._id, pitchTeam._id];
  post1.acceptedPitches = [pitchAgency._id];
  await post1.save();

  post2.pitches = [pitchFreelancer._id];
  await post2.save();

  // Update agency/team pitchesSent
  if (!agency.pitchesSent.some((p) => p.toString() === pitchAgency._id.toString())) {
    agency.pitchesSent.push(pitchAgency._id);
    await agency.save();
  }
  if (!team.pitchesSent.some((p) => p.toString() === pitchTeam._id.toString())) {
    team.pitchesSent.push(pitchTeam._id);
    await team.save();
  }
  if (!freelancer.pitchesSent.some((p) => p.toString() === pitchFreelancer._id.toString())) {
    freelancer.pitchesSent.push(pitchFreelancer._id);
    await freelancer.save();
  }

  // ─── 9. PROJECT ───────────────────────────────────────────────────────────
  let project = await Project.findOne({ pitch: pitchAgency._id });
  if (!project) {
    project = await Project.create({
      post:          post1._id,
      pitch:         pitchAgency._id,
      client:        client._id,
      providerAgency: agency._id,
      providerType:  "Agency",
      title:         "Campagne Ramadan 2025 – Vision Digital Agency",
      description:   "Exécution de la campagne social media Ramadan pour Djazair Foods: production de contenus, gestion des réseaux sociaux et reporting hebdomadaire.",
      startDate:     future(7),
      deadline:      future(52),
      projectStatus: "active",
      progress:      15,
      agreedPrice:   { amount: 245000, currency: "DZD" },
      contractType:  "cdd",
      assignedMembers: [
        {
          memberType:  "AgencyMember",
          memberId:    director._id,
          memberName:  `${director.firstName} ${director.lastName}`,
          role:        "Chef de Projet",
          assignedAt:  new Date(),
        },
        {
          memberType:  "AgencyMember",
          memberId:    strategist._id,
          memberName:  `${strategist.firstName} ${strategist.lastName}`,
          role:        "Stratège",
          assignedAt:  new Date(),
        },
      ],
      tasks: [
        {
          title:       "Brief créatif & Moodboard",
          description: "Préparer le brief créatif complet et soumettre 3 propositions de moodboard au client pour validation.",
          assignedTo: [
            {
              memberType: "AgencyMember",
              memberId:   strategist._id,
              memberName: `${strategist.firstName} ${strategist.lastName}`,
            },
          ],
          status:   "done",
          priority: "high",
          dueDate:  future(3),
          comments: [
            {
              authorId:   director._id,
              authorName: `${director.firstName} ${director.lastName}`,
              authorRole: "agency_member",
              text:       "Moodboard validé par le client le 05/06. On passe à la production.",
              createdAt:  past(1),
            },
          ],
        },
        {
          title:       "Production Reels – Semaine 1",
          description: "Tourner et monter les 7 Reels de la première semaine: 2 recettes Iftar, 2 unboxing produits, 3 ambiances Ramadan.",
          assignedTo: [
            {
              memberType: "AgencyMember",
              memberId:   director._id,
              memberName: `${director.firstName} ${director.lastName}`,
            },
          ],
          status:   "in_progress",
          priority: "urgent",
          dueDate:  future(10),
        },
        {
          title:       "Mise en place planning éditorial",
          description: "Créer et partager le calendrier éditorial Ramadan complet (30 jours) avec le client sur un fichier partagé.",
          assignedTo: [
            {
              memberType: "AgencyMember",
              memberId:   strategist._id,
              memberName: `${strategist.firstName} ${strategist.lastName}`,
            },
          ],
          status:   "todo",
          priority: "medium",
          dueDate:  future(5),
        },
        {
          title:       "Rapport de performance – Semaine 1",
          description: "Compiler les métriques Instagram, Facebook et TikTok de la semaine 1 et présenter au client.",
          assignedTo: [
            {
              memberType: "AgencyMember",
              memberId:   director._id,
              memberName: `${director.firstName} ${director.lastName}`,
            },
          ],
          status:   "todo",
          priority: "medium",
          dueDate:  future(14),
        },
      ],
      statusHistory: [
        { status: "pending",         changedAt: past(3), note: "Pitch accepté par le client." },
        { status: "pending_contract", changedAt: past(2), note: "En attente du contrat." },
        { status: "active",          changedAt: past(1), note: "Contrat signé, projet lancé." },
      ],
    });
    console.log("✅ Project created:", project.title);
  } else {
    console.log("⏭  Project already exists");
  }

  // Update post1 projects array
  if (!post1.projects.some((p) => p.toString() === project._id.toString())) {
    post1.projects.push(project._id);
    await post1.save();
  }

  // Update freelancer clientProjects
  if (!freelancer.clientProjects.some((p) => p.toString() === project._id.toString())) {
    freelancer.clientProjects.push(project._id);
    await freelancer.save();
  }

  // ─── 10. COLLABORATION REQUEST ────────────────────────────────────────────
  let collabReq = await CollaborationRequest.findOne({
    fromId: agency._id,
    toId:   freelancer._id,
  });
  if (!collabReq) {
    collabReq = await CollaborationRequest.create({
      fromType: "Agency",
      fromId:   agency._id,
      fromName: agency.agencyName,
      toType:   "Freelancer",
      toId:     freelancer._id,
      toName:   `${freelancer.firstName} ${freelancer.lastName}`,
      message:  "Bonjour Amira, nous avons suivi votre travail sur Instagram et nous sommes très impressionnés par la qualité de vos contenus. Vision Digital Agency cherche actuellement une créatrice de contenu freelance pour renforcer notre équipe sur plusieurs projets en cours. Seriez-vous intéressée par une collaboration régulière à hauteur de 2-3 projets/mois?",
      proposedRole: "Créatrice de Contenu & Social Media Manager",
      status: "pending",
    });
    console.log("✅ Collaboration request created (agency → freelancer)");
  } else {
    console.log("⏭  Collaboration request already exists");
  }

  // ─── SUMMARY ──────────────────────────────────────────────────────────────
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║              SEED COMPLETE — DEMO CREDENTIALS                    ║
╠══════════════════════════════════════════════════════════════════╣
║  Role              Email                         Password        ║
║  ──────────────────────────────────────────────────────────────  ║
║  agency            agency@gmail.com              AAAAAAAA        ║
║  agency_member     director.agency@gmail.com     DDDDDDDD        ║
║  agency_member     strategist.agency@gmail.com   SSSSSSSS        ║
║  team              team@gmail.com                TTTTTTTT        ║
║  team_member       member.team@gmail.com         MMMMMMMM        ║
║  freelancer        freelancer@gmail.com          FFFFFFFF        ║
║  client            client@gmail.com              CCCCCCCC        ║
║  admin             admin@marketili.com           admiiin123      ║
╚══════════════════════════════════════════════════════════════════╝
  `);

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
