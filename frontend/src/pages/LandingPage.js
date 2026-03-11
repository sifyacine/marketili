import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../styles/landing.css";

const ROLES = [
  {
    id: "agency",
    icon: "🏢",
    name: "Agency",
    desc: "Pitch your team's expertise to premium brand clients.",
  },
  {
    id: "team",
    icon: "👥",
    name: "Team",
    desc: "Collaborate on projects and grow your portfolio together.",
  },
  {
    id: "freelancer",
    icon: "⚡",
    name: "Freelancer / Influencer",
    desc: "Offer your unique skills and creative reach to brands.",
  },
  {
    id: "client",
    icon: "🎯",
    name: "Client",
    desc: "Post your needs and receive competitive strategic pitches.",
  },
];

const STEPS = [
  {
    step: "Step 01",
    icon: "📋",
    title: "Post a Need",
    desc: "Clients describe their campaign goals, budget, and timeline in minutes.",
  },
  {
    step: "Step 02",
    icon: "💡",
    title: "Receive Pitches",
    desc: "Vetted agencies and teams submit tailored strategy proposals.",
  },
  {
    step: "Step 03",
    icon: "🤝",
    title: "Choose & Launch",
    desc: "Pick the best partner and kick off your collaboration instantly.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.4, 0, 0.2, 1] },
  }),
};

const LandingPage = () => {
  const navigate = useNavigate();

  const handleRoleClick = (role) => navigate(`/signup?role=${role}`);
  const scrollToRoles = () => {
    document.getElementById("roles-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* NAV */}
      <nav className="landing-nav">
        <div className="nav-logo">Marketi<span>LI</span></div>
        <div className="nav-actions">
          <button className="nav-link-btn" onClick={scrollToRoles}>How it works</button>
          <button className="nav-cta-btn" onClick={scrollToRoles}>Get Started →</button>
        </div>
      </nav>

      <div className="scroll-container">
        {/* ── HERO ── */}
        <section className="full-section hero-section">
          <div className="hero-bg-blob" />
          <div className="hero-content">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
              <span className="hero-badge">
                <span className="hero-badge-dot" />
                Now live — join 2,400+ marketers
              </span>
            </motion.div>

            <motion.h1
              className="hero-title"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              Smarter Connections for{" "}
              <span className="hero-title-accent">Brands & Experts</span>
            </motion.h1>

            <motion.p
              className="hero-subtitle"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              Clients publish their needs. Agencies, teams, and freelancers compete with
              strategic pitches. The best collaboration wins — every time.
            </motion.p>

            <motion.div
              className="hero-actions"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
            >
              <button className="btn-primary" onClick={scrollToRoles}>
                Choose Your Role →
              </button>
              <button className="btn-secondary" onClick={() => document.getElementById("how-section")?.scrollIntoView({ behavior: "smooth" })}>
                See How It Works
              </button>
            </motion.div>

            <motion.div
              className="hero-social-proof"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={4}
            >
              <div className="social-proof-avatars">
                {["JS", "MR", "AK", "LP"].map((initials) => (
                  <div className="avatar-placeholder" key={initials}>{initials}</div>
                ))}
              </div>
              <p className="social-proof-text">
                <strong>2,400+</strong> professionals already on the platform
              </p>
            </motion.div>
          </div>

          <div className="scroll-indicator">
            <div className="scroll-mouse" />
            <span>Scroll</span>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-section" className="full-section how-section">
          <div style={{ width: "100%", maxWidth: 900, padding: "0 24px" }}>
            <motion.div
              className="section-header"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <span className="section-label">How It Works</span>
              <h2 className="section-title">Three steps to your next win</h2>
              <p className="section-subtitle">
                Built for speed and quality — from brief to launch in record time.
              </p>
            </motion.div>

            <div className="steps-grid">
              {STEPS.map((s, i) => (
                <motion.div
                  className="step-card"
                  key={s.step}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                >
                  <p className="step-number">{s.step}</p>
                  <div className="step-icon">{s.icon}</div>
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-desc">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ROLE SELECTION ── */}
        <section id="roles-section" className="full-section role-section">
          <div style={{ width: "100%", maxWidth: 760, padding: "0 24px" }}>
            <motion.div
              className="section-header"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <span className="section-label">Get Started</span>
              <h2 className="section-title">Choose your role</h2>
              <p className="section-subtitle">
                Select how you'll use  and we'll tailor the experience for you.
              </p>
            </motion.div>

            <div className="roles-grid">
              {ROLES.map((r, i) => (
                <motion.div
                  className="role-card"
                  key={r.id}
                  onClick={() => handleRoleClick(r.id)}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="role-card-icon">{r.icon}</span>
                  <span className="role-card-name">{r.name}</span>
                  <span className="role-card-desc">{r.desc}</span>
                  <span className="role-card-arrow">Get started →</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="full-section cta-section">
          <div className="cta-bg" />
          <motion.div
            className="cta-content"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="cta-title">
              The future of marketing<br />collaboration is here.
            </h2>
            <p className="cta-subtitle">
              Join thousands of brands and experts already building better campaigns together.
            </p>
            <button className="btn-cta-white" onClick={scrollToRoles}>
              Start for Free — it's quick →
            </button>
            <p className="cta-note">No credit card required · Setup in 2 minutes</p>
          </motion.div>
        </section>
      </div>
    </>
  );
};

export default LandingPage;
