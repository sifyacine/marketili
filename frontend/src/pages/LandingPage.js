import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import "../styles/landing.css";

const FADE_UP = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  }),
};

const SectionLabel = ({ children }) => (
  <span className="lp-label">{children}</span>
);

const HeroMock = () => (
  <div className="lp-mock">
    <div className="lp-mock-card">
      <div className="lp-mock-chip lp-chip-blue">Brief</div>
      <div className="lp-mock-title">Campagne réseaux sociaux Q1</div>
      <div className="lp-mock-meta">Budget : 150 000 DA · Délai : 21 jours</div>
      <div className="lp-mock-bar"><div className="lp-mock-bar-fill" style={{ width: "65%" }} /></div>
      <div className="lp-mock-row">
        <span className="lp-mock-badge lp-badge-green">3 offres reçues</span>
        <span className="lp-mock-date">il y a 2 h</span>
      </div>
    </div>
    <div className="lp-mock-card lp-mock-card-sm">
      <div className="lp-mock-chip lp-chip-red">Pitch</div>
      <div className="lp-mock-title">Agence 360° · Stratégie complète</div>
      <div className="lp-mock-meta">Proposé · 180 000 DA</div>
      <div className="lp-mock-row">
        <span className="lp-mock-badge lp-badge-yellow">En attente</span>
      </div>
    </div>
    <div className="lp-mock-card lp-mock-card-sm">
      <div className="lp-mock-chip lp-chip-purple">Projet</div>
      <div className="lp-mock-title">Shooting Produit — Oran</div>
      <div className="lp-mock-bar"><div className="lp-mock-bar-fill" style={{ width: "40%" }} /></div>
      <div className="lp-mock-meta">4 tâches · 2 terminées</div>
    </div>
  </div>
);

const Navbar = ({ refs }) => {
  const [open, setOpen] = useState(false);
  const scrollTo = (ref) => { ref?.current?.scrollIntoView({ behavior: "smooth" }); setOpen(false); };
  return (
    <nav className="lp-nav">
      <div className="lp-nav-logo">Marketi<span>li</span></div>
      <div className="lp-nav-center">
        <button className="lp-nav-link" onClick={() => scrollTo(refs.how)}>Comment ça marche</button>
        <button className="lp-nav-link" onClick={() => scrollTo(refs.forWhom)}>Pour qui</button>
        <button className="lp-nav-link" onClick={() => scrollTo(refs.features)}>Fonctionnalités</button>
        <button className="lp-nav-link" onClick={() => scrollTo(refs.join)}>Rejoindre</button>
        <button className="lp-nav-link" onClick={() => scrollTo(refs.contact)}>Contact</button>
      </div>
      <div className="lp-nav-actions">
        <Link to="/login" className="lp-nav-ghost">Se connecter</Link>
        <Link to="/register" className="lp-nav-cta">Créer un compte</Link>
      </div>
      <button className="lp-hamburger" onClick={() => setOpen(o => !o)} aria-label="menu">
        <span /><span /><span />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="lp-mobile-menu"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <button onClick={() => scrollTo(refs.how)}>Comment ça marche</button>
            <button onClick={() => scrollTo(refs.forWhom)}>Pour qui</button>
            <button onClick={() => scrollTo(refs.features)}>Fonctionnalités</button>
            <button onClick={() => scrollTo(refs.join)}>Rejoindre</button>
            <button onClick={() => scrollTo(refs.contact)}>Contact</button>
            <Link to="/login" onClick={() => setOpen(false)}>Se connecter</Link>
            <Link to="/register" onClick={() => setOpen(false)} className="lp-mobile-cta">Créer un compte</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const PAIN_CARDS = [
  { num: "01", title: "Aucun système de pitch structuré", desc: "Impossible de comparer des propositions professionnellement." },
  { num: "02", title: "Contrats informels ou inexistants", desc: "Les accords verbaux mènent aux litiges et aux impayés." },
  { num: "03", title: "Zéro traçabilité des projets", desc: "Personne ne sait où en est le projet, qui fait quoi, et pour quand." },
  { num: "04", title: "Communication chaotique", desc: "Les informations clés se perdent entre dizaines de conversations." },
];

const PILLARS = [
  { title: "Marketplace structurée", desc: "Les clients publient leurs besoins. Les prestataires proposent. Les meilleures offres remontent naturellement." },
  { title: "Espace de travail collaboratif", desc: "Projets, tâches, membres, délais — tout dans un tableau de bord selon votre rôle." },
  { title: "Paperasse digitale", desc: "Contrats, bons de commande, reçus — générés, envoyés et archivés sur la plateforme." },
];

const HOW_STEPS = [
  { n: "01", title: "Le client publie un brief", desc: "Il décrit son projet marketing : objectifs, budget, délai, région, type de collaboration." },
  { n: "02", title: "Les prestataires proposent", desc: "Agences, équipes et freelancers envoient des offres structurées directement sur la plateforme." },
  { n: "03", title: "Le client choisit", desc: "Il compare les propositions côte à côte et accepte la meilleure. Les autres sont notifiées automatiquement." },
  { n: "04", title: "Le projet démarre", desc: "Un espace de projet est créé automatiquement. Les tâches sont assignées, les délais posés, la progression suivie en temps réel." },
  { n: "05", title: "Les livrables et le contrat", desc: "Les fichiers sont soumis sur la plateforme. Le contrat est généré, signé et archivé — tout au même endroit." },
];

const ROLES = [
  {
    id: "client", color: "#3b82f6", label: "Client", sub: "Entreprise ou Particulier",
    desc: "Vous cherchez une agence, une équipe créative ou un influenceur pour votre prochaine campagne.",
    benefits: ["Publiez votre brief en quelques minutes", "Recevez des offres structurées et comparables", "Suivez l'avancement de votre projet en temps réel", "Gardez tous vos contrats et fichiers au même endroit"],
    cta: "Créer un compte client", path: "/register?role=client",
  },
  {
    id: "agency", color: "#c0152a", label: "Agence", sub: "Agence marketing",
    desc: "Vous gérez des campagnes pour vos clients et une équipe en interne.",
    benefits: ["Identifiez les opportunités et envoyez des pitches professionnels", "Gérez vos membres, leurs rôles et leurs tâches en interne", "Suivez tous vos projets clients depuis un seul tableau de bord", "Formalisez chaque collaboration avec des contrats digitaux"],
    cta: "Inscrire mon agence", path: "/register?role=agency",
  },
  {
    id: "team", color: "#7c3aed", label: "Équipe Créative", sub: "Vidéo, photo, social media, events…",
    desc: "Vous êtes une équipe spécialisée cherchant des clients sérieux.",
    benefits: ["Présentez votre équipe et vos spécialités", "Proposez vos services sur des briefs ciblés", "Gérez vos projets et répartissez les tâches entre membres", "Construisez votre portfolio de références"],
    cta: "Inscrire mon équipe", path: "/register?role=team",
  },
  {
    id: "freelancer", color: "#f59e0b", label: "Freelancer / Créateur", sub: "Influenceur, graphiste, réalisateur, photographe…",
    desc: "Vous travaillez en indépendant et souhaitez accéder à des clients sérieux.",
    benefits: ["Travaillez en indépendant ou collaborez avec plusieurs agences", "Gérez vos différentes collaborations depuis un seul espace", "Soumettez vos livrables et suivez vos paiements", "Construisez votre réputation avec un profil visible"],
    cta: "Créer mon profil", path: "/register?role=freelancer",
  },
];

const FEATURES = [
  { title: "Briefs & Marketplace", desc: "Les clients publient des opportunités détaillées avec budget, délai, région et type de prestation. Les prestataires parcourent et filtrent selon leurs spécialités. Aucun message vocal, aucun DM." },
  { title: "Système d'offres (Pitch)", desc: "Les agences envoient des propositions complètes : stratégie, plan d'action, timeline, tarification. Les clients comparent et choisissent. L'offre acceptée génère automatiquement un projet." },
  { title: "Gestion de projet intégrée", desc: "Chaque collaboration devient un projet avec des tâches assignées, des délais, une progression en temps réel et un historique complet. Le client et le prestataire voient le même projet." },
  { title: "Espace de travail interne", desc: "Les agences gèrent leurs membres en interne. Commerciaux, stratèges, chefs de projet, workers — chaque rôle a son propre espace de travail dédié." },
  { title: "Contrats & Paperasse digitale", desc: "Les contrats sont générés depuis la plateforme, envoyés au client, et les bons de commande archivés. Tout le cycle documentaire — sans sortir de l'application." },
  { title: "Profils & Portfolios", desc: "Chaque acteur construit sa réputation : portfolio de références, collaborations passées, spécialités, statistiques. La plateforme devient votre vitrine professionnelle." },
];

const STATS = [
  { value: "+200", label: "Agences & créateurs inscrits" },
  { value: "+500", label: "Projets publiés" },
  { value: "12",   label: "Wilayas représentées" },
  { value: "98%",  label: "Taux de satisfaction clients" },
];

const QUOTES = [
  { text: "Avant Marketili, on perdait 30% de notre temps à courir après les briefs et les signatures. Maintenant tout est là.", author: "Directeur, Agence 360°, Alger" },
  { text: "J'ai trouvé mon premier client sérieux en 3 jours. Le système de pitch m'a obligé à me professionnaliser.", author: "Freelancer vidéo, Oran" },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const refs = {
    hero:     useRef(null),
    problem:  useRef(null),
    solution: useRef(null),
    how:      useRef(null),
    forWhom:  useRef(null),
    features: useRef(null),
    stats:    useRef(null),
    join:     useRef(null),
    contact:  useRef(null),
  };

  return (
    <div className="lp-root">
      <Navbar refs={refs} />

      {/* Section 2 — Hero */}
      <section ref={refs.hero} className="lp-section lp-hero">
        <div className="lp-hero-glow" />
        <div className="lp-container lp-hero-inner">
          <div className="lp-hero-text">
            <motion.div variants={FADE_UP} initial="hidden" animate="visible" custom={0}>
              <span className="lp-eyebrow">
                <span className="lp-eyebrow-dot" />
                La plateforme marketing algérienne
              </span>
            </motion.div>
            <motion.h1 className="lp-hero-h1" variants={FADE_UP} initial="hidden" animate="visible" custom={1}>
              Le marketing professionnel,<br /><span className="lp-accent">enfin structuré.</span>
            </motion.h1>
            <motion.p className="lp-hero-sub" variants={FADE_UP} initial="hidden" animate="visible" custom={2}>
              Marketili connecte les entreprises avec les agences, équipes et créateurs dans un seul espace de travail structuré — des briefs aux livrables, en passant par les contrats.
            </motion.p>
            <motion.div className="lp-hero-btns" variants={FADE_UP} initial="hidden" animate="visible" custom={3}>
              <button className="lp-btn-primary" onClick={() => navigate("/register?role=client")}>Publier un projet</button>
              <button className="lp-btn-outline" onClick={() => navigate("/register")}>Proposer mes services</button>
            </motion.div>
            <motion.p className="lp-trust" variants={FADE_UP} initial="hidden" animate="visible" custom={4}>
              Gratuit pour commencer. Pas de carte bancaire requise.
            </motion.p>
          </div>
          <motion.div className="lp-hero-mock-wrap" variants={FADE_UP} initial="hidden" animate="visible" custom={2}>
            <HeroMock />
          </motion.div>
        </div>
      </section>

      {/* Section 3 — Problem */}
      <section ref={refs.problem} className="lp-section lp-problem">
        <div className="lp-container">
          <motion.div className="lp-section-head" variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionLabel>Le problème</SectionLabel>
            <h2 className="lp-h2">Le marketing en Algérie est encore géré sur WhatsApp.</h2>
            <p className="lp-body-text">
              Les briefs perdus dans des DMs. Les contrats sur des feuilles volantes. Les fichiers éparpillés entre Google Drive, Telegram et les emails. Les délais manqués sans traçabilité.
              <br /><br />
              Ce n'est pas un manque de talent. C'est un manque d'infrastructure.
            </p>
          </motion.div>
          <div className="lp-pain-grid">
            {PAIN_CARDS.map((c, i) => (
              <motion.div className="lp-pain-card" key={c.num}
                variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                <span className="lp-pain-num">{c.num}</span>
                <h3 className="lp-pain-title">{c.title}</h3>
                <p className="lp-pain-desc">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — Solution */}
      <section ref={refs.solution} className="lp-section lp-solution">
        <div className="lp-container">
          <motion.div className="lp-section-head" variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionLabel>La solution</SectionLabel>
            <h2 className="lp-h2">Un seul espace. Tout le cycle de collaboration.</h2>
            <p className="lp-body-text">
              Marketili centralise tout le processus marketing — de la publication d'un brief à la livraison finale — dans une plateforme professionnelle, traçable et structurée.
            </p>
          </motion.div>
          <div className="lp-pillar-grid">
            {PILLARS.map((p, i) => (
              <motion.div className="lp-pillar-card" key={p.title}
                variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                <div className="lp-pillar-num">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="lp-pillar-title">{p.title}</h3>
                <p className="lp-pillar-desc">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 — How It Works */}
      <section ref={refs.how} className="lp-section lp-how">
        <div className="lp-container">
          <motion.div className="lp-section-head" variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionLabel>Comment ça marche</SectionLabel>
            <h2 className="lp-h2">De l'idée au livrable en 5 étapes.</h2>
          </motion.div>
          <div className="lp-steps">
            {HOW_STEPS.map((s, i) => (
              <motion.div className="lp-step" key={s.n}
                variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                <div className="lp-step-num">{s.n}</div>
                <div className="lp-step-body">
                  <h3 className="lp-step-title">{s.title}</h3>
                  <p className="lp-step-desc">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 — For Whom */}
      <section ref={refs.forWhom} className="lp-section lp-for-whom">
        <div className="lp-container">
          <motion.div className="lp-section-head" variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionLabel>Pour qui</SectionLabel>
            <h2 className="lp-h2">Conçu pour chaque acteur du marketing.</h2>
          </motion.div>
          <div className="lp-role-grid">
            {ROLES.map((r, i) => (
              <motion.div className="lp-role-card" key={r.id} style={{ "--rc": r.color }}
                variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                whileHover={{ y: -4 }}>
                <div className="lp-role-top">
                  <span className="lp-role-label">{r.label}</span>
                  <span className="lp-role-sub">{r.sub}</span>
                </div>
                <p className="lp-role-desc">{r.desc}</p>
                <ul className="lp-role-benefits">
                  {r.benefits.map(b => <li key={b}>{b}</li>)}
                </ul>
                <button className="lp-role-cta" onClick={() => navigate(r.path)}>{r.cta} →</button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7 — Features */}
      <section ref={refs.features} className="lp-section lp-features">
        <div className="lp-container">
          <motion.div className="lp-section-head" variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionLabel>Fonctionnalités</SectionLabel>
            <h2 className="lp-h2">Tout ce dont vous avez besoin. Rien de superflu.</h2>
          </motion.div>
          <div className="lp-feat-grid">
            {FEATURES.map((f, i) => (
              <motion.div className="lp-feat-card" key={f.title}
                variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i % 3}>
                <div className="lp-feat-idx">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="lp-feat-title">{f.title}</h3>
                <p className="lp-feat-desc">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8 — Stats & Social Proof */}
      <section ref={refs.stats} className="lp-section lp-stats">
        <div className="lp-container">
          <motion.h2 className="lp-h2 lp-text-center"
            variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            Le marketing structuré, ça commence ici.
          </motion.h2>
          <div className="lp-stat-grid">
            {STATS.map((s, i) => (
              <motion.div className="lp-stat" key={s.label}
                variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                <span className="lp-stat-value">{s.value}</span>
                <span className="lp-stat-label">{s.label}</span>
              </motion.div>
            ))}
          </div>
          <div className="lp-quotes">
            {QUOTES.map((q, i) => (
              <motion.blockquote className="lp-quote" key={i}
                variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                <p className="lp-quote-text">"{q.text}"</p>
                <cite className="lp-quote-author">— {q.author}</cite>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Section 9 — Final CTA */}
      <section ref={refs.join} className="lp-section lp-cta">
        <div className="lp-cta-glow" />
        <motion.div className="lp-container lp-cta-inner"
          variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <h2 className="lp-h2 lp-text-center">
            Arrêtez de gérer vos projets marketing sur WhatsApp.
          </h2>
          <p className="lp-cta-sub">
            Rejoignez Marketili et donnez à vos collaborations la structure qu'elles méritent.
          </p>
          <div className="lp-cta-btns">
            <button className="lp-btn-primary lp-btn-lg" onClick={() => navigate("/register")}>
              Créer mon compte gratuitement
            </button>
            <button className="lp-btn-outline lp-btn-lg"
              onClick={() => refs.how.current?.scrollIntoView({ behavior: "smooth" })}>
              Voir comment ça marche
            </button>
          </div>
        </motion.div>
      </section>

      {/* Section 10 — Contact */}
      <section ref={refs.contact} className="lp-section lp-contact">
        <div className="lp-container">
          <motion.div className="lp-section-head" variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionLabel>Contact</SectionLabel>
            <h2 className="lp-h2">Une question ? Parlons-en.</h2>
            <p className="lp-body-text">
              Notre équipe est disponible pour répondre à vos questions sur la plateforme, vous aider à démarrer ou simplement discuter de vos besoins.
            </p>
          </motion.div>
          <div className="lp-contact-cards">
            <motion.a
              href="mailto:contact@marketili.dz"
              className="lp-contact-card"
              variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
              <div className="lp-contact-icon lp-contact-icon-email">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <div className="lp-contact-body">
                <span className="lp-contact-label">Email</span>
                <span className="lp-contact-value">contact@marketili.dz</span>
                <span className="lp-contact-hint">Réponse sous 24 h</span>
              </div>
            </motion.a>

            <motion.a
              href="https://wa.me/213676774374"
              target="_blank"
              rel="noopener noreferrer"
              className="lp-contact-card lp-contact-card-wa"
              variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
              <div className="lp-contact-icon lp-contact-icon-wa">
                <svg width="22" height="22" viewBox="0 0 32 32" fill="currentColor">
                  <path d="M16 0C7.164 0 0 7.163 0 16c0 2.824.738 5.476 2.027 7.785L0 32l8.418-2.002A15.93 15.93 0 0 0 16 32c8.836 0 16-7.163 16-16S24.836 0 16 0zm8.27 22.516c-.343.965-2 1.84-2.742 1.957-.7.112-1.582.16-2.555-.16-.588-.188-1.344-.44-2.313-.862-4.063-1.75-6.72-5.836-6.922-6.105-.199-.27-1.625-2.164-1.625-4.129s1.028-2.93 1.395-3.328c.367-.398.8-.496 1.066-.496.266 0 .531.003.762.015.244.012.572-.093.895.684.34.8 1.156 2.766 1.258 2.965.102.2.168.434.035.7-.133.265-.2.43-.398.664-.2.234-.42.523-.601.703-.2.2-.407.414-.175.813.234.398 1.04 1.718 2.23 2.781 1.531 1.363 2.82 1.785 3.22 1.984.397.2.628.168.862-.102.234-.27 1.003-1.168 1.27-1.566.265-.398.53-.332.895-.2.367.133 2.329 1.098 2.727 1.297.398.2.664.3.762.465.1.164.1.965-.243 1.93z"/>
                </svg>
              </div>
              <div className="lp-contact-body">
                <span className="lp-contact-label">WhatsApp</span>
                <span className="lp-contact-value">+213 676 774 374</span>
                <span className="lp-contact-hint">Discussion rapide, réponse immédiate</span>
              </div>
            </motion.a>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp button */}
      <a
        href="https://wa.me/213676774374"
        target="_blank"
        rel="noopener noreferrer"
        className="lp-wa-float"
        aria-label="Contactez-nous sur WhatsApp">
        <svg width="26" height="26" viewBox="0 0 32 32" fill="currentColor">
          <path d="M16 0C7.164 0 0 7.163 0 16c0 2.824.738 5.476 2.027 7.785L0 32l8.418-2.002A15.93 15.93 0 0 0 16 32c8.836 0 16-7.163 16-16S24.836 0 16 0zm8.27 22.516c-.343.965-2 1.84-2.742 1.957-.7.112-1.582.16-2.555-.16-.588-.188-1.344-.44-2.313-.862-4.063-1.75-6.72-5.836-6.922-6.105-.199-.27-1.625-2.164-1.625-4.129s1.028-2.93 1.395-3.328c.367-.398.8-.496 1.066-.496.266 0 .531.003.762.015.244.012.572-.093.895.684.34.8 1.156 2.766 1.258 2.965.102.2.168.434.035.7-.133.265-.2.43-.398.664-.2.234-.42.523-.601.703-.2.2-.407.414-.175.813.234.398 1.04 1.718 2.23 2.781 1.531 1.363 2.82 1.785 3.22 1.984.397.2.628.168.862-.102.234-.27 1.003-1.168 1.27-1.566.265-.398.53-.332.895-.2.367.133 2.329 1.098 2.727 1.297.398.2.664.3.762.465.1.164.1.965-.243 1.93z"/>
        </svg>
        <span className="lp-wa-float-label">WhatsApp</span>
      </a>

      {/* Section 11 — Footer */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer-grid">
          <div className="lp-footer-brand">
            <div className="lp-footer-logo">Marketi<span>li</span></div>
            <p className="lp-footer-tagline">La collaboration marketing professionnelle.</p>
            <div className="lp-footer-socials">
              <a href="#" className="lp-social-link" aria-label="LinkedIn">in</a>
              <a href="#" className="lp-social-link" aria-label="Instagram">ig</a>
            </div>
          </div>
          <div className="lp-footer-col">
            <h4 className="lp-footer-col-title">Plateforme</h4>
            <button className="lp-footer-link" onClick={() => refs.how.current?.scrollIntoView({ behavior: "smooth" })}>Comment ça marche</button>
            <button className="lp-footer-link" onClick={() => refs.forWhom.current?.scrollIntoView({ behavior: "smooth" })}>Pour qui</button>
            <button className="lp-footer-link" onClick={() => refs.features.current?.scrollIntoView({ behavior: "smooth" })}>Fonctionnalités</button>
            <span className="lp-footer-link lp-footer-muted">Tarification (bientôt)</span>
          </div>
          <div className="lp-footer-col">
            <h4 className="lp-footer-col-title">Compte</h4>
            <Link to="/login" className="lp-footer-link">Se connecter</Link>
            <Link to="/register?role=client" className="lp-footer-link">Créer un compte client</Link>
            <Link to="/register?role=agency" className="lp-footer-link">Inscrire mon agence</Link>
            <Link to="/register?role=freelancer" className="lp-footer-link">Créer mon profil freelancer</Link>
          </div>
          <div className="lp-footer-col">
            <h4 className="lp-footer-col-title">Légal & Contact</h4>
            <span className="lp-footer-link lp-footer-muted">Conditions d'utilisation</span>
            <span className="lp-footer-link lp-footer-muted">Politique de confidentialité</span>
            <a href="mailto:contact@marketili.dz" className="lp-footer-link">contact@marketili.dz</a>
            <a href="https://wa.me/213676774374" target="_blank" rel="noopener noreferrer" className="lp-footer-link">WhatsApp : +213 676 774 374</a>
            <span className="lp-footer-link lp-footer-muted">Fait en Algérie 🇩🇿</span>
          </div>
        </div>
        <div className="lp-footer-bar">
          <span>© 2025 Marketili. Tous droits réservés.</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
