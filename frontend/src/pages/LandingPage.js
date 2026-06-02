import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import "../styles/landing.css";

const FADE_UP = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.4, 0, 0.2, 1] },
  }),
};

const WA_NUMBER = "213676774374";
const WA_HREF   = `https://wa.me/${WA_NUMBER}`;
const EMAIL     = "contact@marketili.dz";

// ── Navbar ────────────────────────────────────────────────────────────────────
const Navbar = ({ benefitsRef, howRef, rolesRef, contactRef }) => {
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (ref) => { ref?.current?.scrollIntoView({ behavior: "smooth" }); setOpen(false); };

  const NAV_LINKS = [
    { label: "Plateforme",      ref: benefitsRef },
    { label: "Comment ça marche", ref: howRef    },
    { label: "Pour qui",        ref: rolesRef    },
    { label: "Contact",         ref: contactRef  },
  ];

  return (
    <nav className={`lp-nav${scrolled ? " lp-nav-scrolled" : ""}`}>
      {/* Logo */}
      <div className="lp-nav-logo" style={{ gap: 9 }}>
        <img src="/marketili_logo.svg" alt="Marketili"
          style={{ height: 30, objectFit: "contain", display: "block", flexShrink: 0 }} />
        <span style={{ fontWeight: 900, fontSize: "1.08rem", color: "#fff", letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>
          Market<span style={{ color: "#c0152a" }}>ili</span>
        </span>
      </div>

      {/* Center pill nav */}
      <div className="lp-nav-pill">
        {NAV_LINKS.map(l => (
          <button key={l.label} className="lp-nav-link" onClick={() => scrollTo(l.ref)}>
            {l.label}
          </button>
        ))}
      </div>

      {/* Right actions */}
      <div className="lp-nav-actions">
        <Link to="/login"    className="lp-nav-ghost">Se connecter</Link>
        <Link to="/register" className="lp-nav-cta">Commencer</Link>
      </div>

      {/* Hamburger */}
      <button className="lp-hamburger" onClick={() => setOpen(o => !o)} aria-label="menu" aria-expanded={open}>
        <span /><span /><span />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className="lp-mobile-menu"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {NAV_LINKS.map(l => (
              <button key={l.label} onClick={() => scrollTo(l.ref)}>{l.label}</button>
            ))}
            <Link to="/login"    onClick={() => setOpen(false)}>Se connecter</Link>
            <Link to="/register" onClick={() => setOpen(false)} className="lp-mobile-cta">Commencer</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// ── Contact form ──────────────────────────────────────────────────────────────
const QUESTION_TYPES = [
  { v: "",                  l: "Choisir un sujet..."     },
  { v: "inscription",       l: "Inscription / Compte"    },
  { v: "partenariat",       l: "Partenariat"             },
  { v: "question_generale", l: "Question générale"       },
  { v: "signalement",       l: "Signalement / Problème"  },
  { v: "autre",             l: "Autre"                   },
];

const ContactForm = () => {
  const [form,    setForm]    = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent,    setSent]    = useState(false);
  const [sending, setSending] = useState(false);
  const [err,     setErr]     = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim() || !form.subject) {
      setErr("Merci de remplir tous les champs obligatoires.");
      return;
    }
    setErr(""); setSending(true);
    const subjectLine = `[Marketili] ${QUESTION_TYPES.find(q => q.v === form.subject)?.l || form.subject} — ${form.name}`;
    const body = [`Nom : ${form.name}`, `Email : ${form.email}`,
      form.phone ? `Téléphone : ${form.phone}` : "", `Sujet : ${subjectLine}`, "", form.message]
      .filter(Boolean).join("\n");
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;
    setTimeout(() => { setSent(true); setSending(false); }, 600);
  };

  const handleReset = () => { setForm({ name: "", email: "", phone: "", subject: "", message: "" }); setSent(false); setErr(""); };

  if (sent) return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: "center", padding: "48px 24px",
        background: "rgba(255,255,255,0.04)", borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.09)" }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%",
        background: "rgba(16,185,129,0.12)", border: "1.5px solid rgba(16,185,129,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 18px" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>Message envoyé</h3>
      <p style={{ margin: "0 0 24px", fontSize: "0.875rem", color: "rgba(244,244,246,0.45)", lineHeight: 1.65 }}>
        Votre client mail s'est ouvert avec le message pré-rempli.<br />
        Nous vous répondrons dans les meilleurs délais.
      </p>
      <button onClick={handleReset} className="lp-btn-outline" style={{ fontSize: "0.82rem", padding: "8px 20px" }}>
        Envoyer un autre message
      </button>
    </motion.div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="lp-contact-field">
          <label className="lp-contact-label-field">Nom complet *</label>
          <input className="lp-contact-input" required value={form.name}
            onChange={e => set("name", e.target.value)} placeholder="Votre nom" />
        </div>
        <div className="lp-contact-field">
          <label className="lp-contact-label-field">Email *</label>
          <input className="lp-contact-input" type="email" required value={form.email}
            onChange={e => set("email", e.target.value)} placeholder="vous@exemple.com" />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="lp-contact-field">
          <label className="lp-contact-label-field">Téléphone <span style={{ opacity: 0.5 }}>(optionnel)</span></label>
          <input className="lp-contact-input" value={form.phone}
            onChange={e => set("phone", e.target.value)} placeholder="+213 5xx xxx xxx" />
        </div>
        <div className="lp-contact-field">
          <label className="lp-contact-label-field">Sujet *</label>
          <select className="lp-contact-input" required value={form.subject}
            onChange={e => set("subject", e.target.value)}>
            {QUESTION_TYPES.map(q => (
              <option key={q.v} value={q.v} disabled={q.v === ""}>{q.l}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="lp-contact-field">
        <label className="lp-contact-label-field">Message *</label>
        <textarea className="lp-contact-input" required rows={5} value={form.message}
          onChange={e => set("message", e.target.value)}
          placeholder="Décrivez votre question ou demande..." style={{ resize: "vertical" }} />
      </div>
      {err && (
        <div style={{ padding: "10px 14px", borderRadius: 9,
          background: "rgba(192,21,42,0.12)", border: "1px solid rgba(192,21,42,0.3)",
          color: "#fca5a5", fontSize: "0.82rem" }}>{err}</div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
        <button type="submit" className="lp-btn-primary" disabled={sending}
          style={{ opacity: sending ? 0.7 : 1 }}>
          {sending ? "Envoi..." : "Envoyer le message"}
        </button>
        <a href={WA_HREF} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: "0.8rem", color: "#25d366", textDecoration: "none",
            display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
          <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor">
            <path d="M16 0C7.164 0 0 7.163 0 16c0 2.824.738 5.476 2.027 7.785L0 32l8.418-2.002A15.93 15.93 0 0 0 16 32c8.836 0 16-7.163 16-16S24.836 0 16 0zm8.27 22.516c-.343.965-2 1.84-2.742 1.957-.7.112-1.582.16-2.555-.16-.588-.188-1.344-.44-2.313-.862-4.063-1.75-6.72-5.836-6.922-6.105-.199-.27-1.625-2.164-1.625-4.129s1.028-2.93 1.395-3.328c.367-.398.8-.496 1.066-.496.266 0 .531.003.762.015.244.012.572-.093.895.684.34.8 1.156 2.766 1.258 2.965.102.2.168.434.035.7-.133.265-.2.43-.398.664-.2.234-.42.523-.601.703-.2.2-.407.414-.175.813.234.398 1.04 1.718 2.23 2.781 1.531 1.363 2.82 1.785 3.22 1.984.397.2.628.168.862-.102.234-.27 1.003-1.168 1.27-1.566.265-.398.53-.332.895-.2.367.133 2.329 1.098 2.727 1.297.398.2.664.3.762.465.1.164.1.965-.243 1.93z"/>
          </svg>
          WhatsApp
        </a>
      </div>
    </form>
  );
};

// ── Benefits data ─────────────────────────────────────────────────────────────
const BENEFITS = [
  {
    num: "01", color: "#c0152a",
    title: "Briefs structurés",
    desc: "Publiez vos besoins marketing avec un formulaire guidé. Les prestataires comprennent exactement ce que vous cherchez.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    num: "02", color: "#0891b2",
    title: "Pitches compétitifs",
    desc: "Recevez des propositions détaillées de plusieurs agences et freelancers, comparez et choisissez en toute clarté.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
      </svg>
    ),
  },
  {
    num: "03", color: "#f97316",
    title: "Projets suivis",
    desc: "Dès qu'un pitch est accepté, un projet structuré est créé avec des tâches, des délais et un suivi d'avancement.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    num: "04", color: "#10b981",
    title: "Contrats formalisés",
    desc: "Chaque collaboration débute avec un contrat clair — objectifs, budget, livrables — pour une relation de confiance.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <path d="M9 9h6M9 12h6M9 15h4"/>
      </svg>
    ),
  },
  {
    num: "05", color: "#e11d48",
    title: "Multi-prestataires",
    desc: "Agences, équipes créatives, freelancers — accédez au vivier de talents marketing algérien en un seul endroit.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    num: "06", color: "#f59e0b",
    title: "Tableaux de bord",
    desc: "Chaque rôle dispose de son interface dédiée : vue d'ensemble des projets, notifications, historique et profil public.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
];

// ── Logo strip data ───────────────────────────────────────────────────────────
const LOGOS = [
  { name: "Agences 360°", icon: "◈" },
  { name: "Freelancers", icon: "◎" },
  { name: "Startups", icon: "◇" },
  { name: "PME", icon: "◆" },
  { name: "Créateurs", icon: "○" },
];

// ═════════════════════════════════════════════════════════════════════════════
// ROOT
// ═════════════════════════════════════════════════════════════════════════════
const LandingPage = () => {
  const navigate     = useNavigate();
  const benefitsRef  = useRef(null);
  const howRef       = useRef(null);
  const rolesRef     = useRef(null);
  const contactRef   = useRef(null);

  useEffect(() => { document.title = "Marketili — Plateforme Marketing"; }, []);

  return (
    <div className="lp-root">
      <Navbar benefitsRef={benefitsRef} howRef={howRef} rolesRef={rolesRef} contactRef={contactRef} />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="lp-hero">
        {/* Blob decorations */}
        <div className="lp-hero-blob lp-hero-blob-1" />
        <div className="lp-hero-blob lp-hero-blob-2" />
        <div className="lp-hero-blob lp-hero-blob-3" />

        <div className="lp-container lp-hero-inner">
          <div className="lp-hero-text">
            <motion.div variants={FADE_UP} initial="hidden" animate="visible" custom={0}>
              <span className="lp-eyebrow">
                <span className="lp-eyebrow-dot" />
                Plateforme marketing algérienne
              </span>
            </motion.div>

            <motion.h1 className="lp-hero-h1" variants={FADE_UP} initial="hidden" animate="visible" custom={1}>
              Le marketing<br />
              <span className="lp-hero-h1-accent">professionnel,</span><br />
              enfin structuré.
            </motion.h1>

            <motion.p className="lp-hero-sub" variants={FADE_UP} initial="hidden" animate="visible" custom={2}>
              Gérez tous vos besoins marketing en un seul endroit.
            </motion.p>

            <motion.div className="lp-hero-btns" variants={FADE_UP} initial="hidden" animate="visible" custom={3}>
              <button className="lp-btn-primary" onClick={() => navigate("/register?role=client")}>
                Publier un projet
              </button>
              <button className="lp-btn-outline" onClick={() => navigate("/register")}>
                Proposer mes services
              </button>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Logo strip ─────────────────────────────────────────────────── */}
      <div className="lp-logos">
        <div className="lp-container">
          <div className="lp-logos-label">La plateforme pour tous les acteurs du marketing</div>
          <div className="lp-logos-row">
            {LOGOS.map(l => (
              <span key={l.name} className="lp-logo-item">
                <span style={{ fontSize: "1rem" }}>{l.icon}</span>
                {l.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Benefits ──────────────────────────────────────────────────── */}
      <section ref={benefitsRef} className="lp-section lp-benefits">
        <div className="lp-container">
          <motion.div className="lp-section-head"
            variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="lp-label">Fonctionnalités</span>
            <h2 className="lp-h2">Tout ce qu'il faut pour<br />collaborer efficacement</h2>
            <p className="lp-body-text">
              Un espace de travail complet du brief initial à la livraison finale.
            </p>
          </motion.div>

          <div className="lp-benefits-grid">
            {BENEFITS.map((b, i) => (
              <motion.div key={b.num} className="lp-benefit-card"
                variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.5}>
                <div className="lp-benefit-icon"
                  style={{ background: `${b.color}18`, color: b.color, border: `1px solid ${b.color}28` }}>
                  {b.icon}
                </div>
                <div>
                  <div className="lp-benefit-num">{b.num}</div>
                  <div className="lp-benefit-title">{b.title}</div>
                </div>
                <div className="lp-benefit-desc">{b.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section ref={howRef} className="lp-section lp-how">
        <div className="lp-container">
          <motion.div className="lp-section-head"
            variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="lp-label">Processus</span>
            <h2 className="lp-h2">Comment ça fonctionne</h2>
            <p className="lp-body-text">Quatre étapes simples pour passer du besoin à la livraison.</p>
          </motion.div>

          <div className="lp-steps">
            {[
              { n: "01", t: "Publiez votre besoin",       d: "Décrivez votre projet marketing, votre budget et vos délais via un formulaire guidé." },
              { n: "02", t: "Recevez des pitches",        d: "Les agences et freelancers de la plateforme vous soumettent leurs propositions détaillées." },
              { n: "03", t: "Acceptez et contractualisez", d: "Choisissez le meilleur pitch. Un projet et un contrat sont créés automatiquement." },
              { n: "04", t: "Suivez et livrez",           d: "Gérez les tâches, les jalons et la communication dans un espace de travail partagé." },
            ].map((s, i) => (
              <motion.div key={s.n} className="lp-step"
                variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.5}>
                <span className="lp-step-num">{s.n}</span>
                <div className="lp-step-body">
                  <div className="lp-step-title">{s.t}</div>
                  <div className="lp-step-desc">{s.d}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For whom ──────────────────────────────────────────────────── */}
      <section ref={rolesRef} className="lp-section lp-roles">
        <div className="lp-container">
          <motion.div className="lp-section-head"
            variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="lp-label">Pour qui</span>
            <h2 className="lp-h2">Fait pour chaque rôle</h2>
            <p className="lp-body-text">Que vous soyez donneur d'ordre ou prestataire, Marketili s'adapte à votre façon de travailler.</p>
          </motion.div>

          <div className="lp-role-grid">
            {[
              {
                rc: "#c0152a", label: "Entreprises & Clients",
                sub: "Donneurs d'ordre", nav: "/register?role=client",
                desc: "Publiez vos besoins marketing et accédez aux meilleurs talents locaux.",
                benefits: ["Formulaire de brief guidé", "Comparaison des pitches reçus", "Suivi de projet en temps réel", "Historique de toutes vos collaborations"],
              },
              {
                rc: "#c0152a", label: "Agences & Équipes",
                sub: "Prestataires collectifs", nav: "/register?role=agency",
                desc: "Démarquez-vous sur des appels d'offres qualifiés et gérez vos équipes.",
                benefits: ["Accès aux briefs publiés", "Outil de pitch intégré", "Gestion de l'équipe et des membres", "Profil public et portfolio"],
              },
              {
                rc: "#f97316", label: "Freelancers",
                sub: "Prestataires indépendants", nav: "/register?role=freelancer",
                desc: "Trouvez des missions marketing correspondant à vos compétences.",
                benefits: ["Missions ciblées selon vos skills", "Visibilité sur votre profil", "Contrat et suivi de mission", "Prise en charge du paiement"],
              },
              {
                rc: "#0891b2", label: "Équipes Créatives",
                sub: "Collectifs & Équipes projet", nav: "/register?role=team",
                desc: "Collaborez en équipe sur des projets marketing avec une structure claire.",
                benefits: ["Tableau de bord équipe", "Assignation de tâches", "Suivi collectif d'avancement", "Communication centralisée"],
              },
            ].map((r, i) => (
              <motion.div key={r.label} className="lp-role-card"
                style={{ "--rc": r.rc }}
                variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.5}>
                <div className="lp-role-top">
                  <div className="lp-role-label">{r.label}</div>
                  <div className="lp-role-sub">{r.sub}</div>
                </div>
                <div className="lp-role-desc">{r.desc}</div>
                <ul className="lp-role-benefits">
                  {r.benefits.map(b => <li key={b}>{b}</li>)}
                </ul>
                <button className="lp-role-cta" onClick={() => navigate(r.nav)}>
                  Rejoindre →
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="lp-section lp-cta">
        <div className="lp-cta-glow" />
        <motion.div className="lp-container lp-cta-inner"
          variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <span className="lp-label">Rejoignez Marketili</span>
          <h2 className="lp-h2 lp-text-center">
            Prêt à structurer<br />vos collaborations ?
          </h2>
          <p className="lp-cta-sub">
            Inscription gratuite. Publiez votre premier brief ou créez votre profil prestataire en moins de 5 minutes.
          </p>
          <div className="lp-cta-btns">
            <button className="lp-btn-primary lp-btn-lg" onClick={() => navigate("/register")}>
              Créer mon compte
            </button>
            <Link to="/login" className="lp-btn-outline lp-btn-lg">
              Se connecter
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Contact ───────────────────────────────────────────────────── */}
      <section ref={contactRef} className="lp-section lp-contact">
        <div className="lp-container">
          <motion.div className="lp-section-head"
            variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <span className="lp-label">Contact</span>
            <h2 className="lp-h2">Une question ?<br />Écrivez-nous.</h2>
            <p className="lp-body-text">
              Remplissez le formulaire ou contactez-nous directement sur WhatsApp.
            </p>
          </motion.div>

          <motion.div className="lp-contact-form-wrap"
            variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
            <ContactForm />
          </motion.div>

          <motion.div className="lp-contact-quick"
            variants={FADE_UP} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}>
            <a href={`mailto:${EMAIL}`} className="lp-contact-quick-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              {EMAIL}
            </a>
            <a href={WA_HREF} target="_blank" rel="noopener noreferrer" className="lp-contact-quick-item lp-contact-quick-wa">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 0C7.164 0 0 7.163 0 16c0 2.824.738 5.476 2.027 7.785L0 32l8.418-2.002A15.93 15.93 0 0 0 16 32c8.836 0 16-7.163 16-16S24.836 0 16 0zm8.27 22.516c-.343.965-2 1.84-2.742 1.957-.7.112-1.582.16-2.555-.16-.588-.188-1.344-.44-2.313-.862-4.063-1.75-6.72-5.836-6.922-6.105-.199-.27-1.625-2.164-1.625-4.129s1.028-2.93 1.395-3.328c.367-.398.8-.496 1.066-.496.266 0 .531.003.762.015.244.012.572-.093.895.684.34.8 1.156 2.766 1.258 2.965.102.2.168.434.035.7-.133.265-.2.43-.398.664-.2.234-.42.523-.601.703-.2.2-.407.414-.175.813.234.398 1.04 1.718 2.23 2.781 1.531 1.363 2.82 1.785 3.22 1.984.397.2.628.168.862-.102.234-.27 1.003-1.168 1.27-1.566.265-.398.53-.332.895-.2.367.133 2.329 1.098 2.727 1.297.398.2.664.3.762.465.1.164.1.965-.243 1.93z"/>
              </svg>
              +213 676 774 374
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Floating WhatsApp ─────────────────────────────────────────── */}
      <a href={WA_HREF} target="_blank" rel="noopener noreferrer"
        className="lp-wa-float" aria-label="Contactez-nous sur WhatsApp">
        <svg width="24" height="24" viewBox="0 0 32 32" fill="currentColor">
          <path d="M16 0C7.164 0 0 7.163 0 16c0 2.824.738 5.476 2.027 7.785L0 32l8.418-2.002A15.93 15.93 0 0 0 16 32c8.836 0 16-7.163 16-16S24.836 0 16 0zm8.27 22.516c-.343.965-2 1.84-2.742 1.957-.7.112-1.582.16-2.555-.16-.588-.188-1.344-.44-2.313-.862-4.063-1.75-6.72-5.836-6.922-6.105-.199-.27-1.625-2.164-1.625-4.129s1.028-2.93 1.395-3.328c.367-.398.8-.496 1.066-.496.266 0 .531.003.762.015.244.012.572-.093.895.684.34.8 1.156 2.766 1.258 2.965.102.2.168.434.035.7-.133.265-.2.43-.398.664-.2.234-.42.523-.601.703-.2.2-.407.414-.175.813.234.398 1.04 1.718 2.23 2.781 1.531 1.363 2.82 1.785 3.22 1.984.397.2.628.168.862-.102.234-.27 1.003-1.168 1.27-1.566.265-.398.53-.332.895-.2.367.133 2.329 1.098 2.727 1.297.398.2.664.3.762.465.1.164.1.965-.243 1.93z"/>
        </svg>
        <span className="lp-wa-float-label">WhatsApp</span>
      </a>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer-grid">
          <div className="lp-footer-brand">
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
              <img src="/marketili_logo.svg" alt="Marketili"
                style={{ height: 30, objectFit: "contain", display: "block", flexShrink: 0 }} />
              <span style={{ fontWeight: 900, fontSize: "1.08rem", color: "#fff", letterSpacing: "-0.03em" }}>
                Market<span style={{ color: "#c0152a" }}>ili</span>
              </span>
            </div>
            <p className="lp-footer-tagline">La collaboration marketing professionnelle en Algérie.</p>
            <div className="lp-footer-socials">
              <a href="#" className="lp-social-link" aria-label="LinkedIn">in</a>
              <a href="#" className="lp-social-link" aria-label="Instagram">ig</a>
            </div>
          </div>
          <div className="lp-footer-col">
            <h4 className="lp-footer-col-title">Compte</h4>
            <Link to="/login"                    className="lp-footer-link">Se connecter</Link>
            <Link to="/register?role=client"     className="lp-footer-link">Compte client</Link>
            <Link to="/register?role=agency"     className="lp-footer-link">Inscrire mon agence</Link>
            <Link to="/register?role=freelancer" className="lp-footer-link">Profil freelancer</Link>
          </div>
          <div className="lp-footer-col">
            <h4 className="lp-footer-col-title">Contact</h4>
            <a href={`mailto:${EMAIL}`} className="lp-footer-link">{EMAIL}</a>
            <a href={WA_HREF} target="_blank" rel="noopener noreferrer" className="lp-footer-link">
              WhatsApp
            </a>
            <span className="lp-footer-link lp-footer-muted">Conditions d'utilisation</span>
            <span className="lp-footer-link lp-footer-muted">Politique de confidentialité</span>
          </div>
        </div>
        <div className="lp-footer-bar">
          © 2025 Marketili — Fait en Algérie
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
