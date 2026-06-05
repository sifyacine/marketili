// src/pages/dashboard/agency/DirectorMembers.jsx
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import agencyMemberService from "../../../services/agencyMemberService";
import collaborationRequestService from "../../../services/collaborationRequestService";
import { IconUsers } from "../../../components/ui/Icons";
import ConventionCollaborationForm from "../../../components/pitches/ConventionCollaborationForm";

// ── Constants ──────────────────────────────────────────────────────────────────
// Grouped by tier so the director understands the hierarchy when creating members
const JOB_OPTIONS = [
  // Sub-directors
  { value: "creative_director",    label: "Directeur Créatif"       },
  { value: "marketing_director",   label: "Directeur Marketing"     },
  { value: "production_director",  label: "Directeur de Production" },
  // Managers
  { value: "art_director",         label: "Directeur Artistique"    },
  { value: "strategist",           label: "Stratégiste"             },
  { value: "digital_manager",      label: "Digital Manager"         },
  { value: "project_manager",      label: "Chef de Projet"          },
  { value: "social_media_manager", label: "Social Media Manager"    },
  // Commercial
  { value: "commercial",           label: "Commercial"              },
  // Workers
  { value: "senior",               label: "Senior"                  },
  { value: "junior",               label: "Junior"                  },
];

const JOB_LABEL = {
  // New titles
  creative_director:    "Directeur Créatif",
  marketing_director:   "Directeur Marketing",
  production_director:  "Directeur de Production",
  art_director:         "Directeur Artistique",
  strategist:           "Stratégiste",
  digital_manager:      "Digital Manager",
  project_manager:      "Chef de Projet",
  social_media_manager: "Social Media Manager",
  senior:               "Senior",
  junior:               "Junior",
  // Legacy labels kept for existing data
  director:             "Directeur",
  commercial:           "Commercial",
  chef_de_projet:       "Chef de projet",
  designer:             "Designer",
  editor:               "Monteur",
  smm:                  "SMM",
  community_manager:    "Community Manager",
};

const STATUS_META = {
  active:    { label: "Actif",    color: "#065f46", bg: "#d1fae5", border: "#6ee7b7" },
  inactive:  { label: "Inactif",  color: "#374151", bg: "#f3f4f6", border: "#d1d5db" },
  suspended: { label: "Suspendu", color: "#92400e", bg: "#fef3c7", border: "#fde68a" },
  archived:  { label: "Archivé",  color: "#991b1b", bg: "#fee2e2", border: "#fca5a5" },
};

const STATUS_OPTIONS = [
  { value: "active",    label: "Actif"    },
  { value: "inactive",  label: "Inactif"  },
  { value: "suspended", label: "Suspendu" },
  { value: "archived",  label: "Archivé"  },
];

const initials = (m) =>
  `${m.firstName?.[0] || ""}${m.lastName?.[0] || ""}`.toUpperCase();

const Avatar = ({ member }) => (
  <div style={{
    width: 32, height: 32, borderRadius: "50%",
    background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.72rem", fontWeight: 700, color: "#fff", flexShrink: 0,
  }}>
    {initials(member)}
  </div>
);

// ── StatusBadge ───────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.inactive;
  return (
    <span style={{
      padding: "2px 9px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600,
      background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`,
    }}>
      {meta.label}
    </span>
  );
};

// ── StatusSelect ──────────────────────────────────────────────────────────────
const StatusSelect = ({ member, onSet, busy }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={busy}
        style={{
          padding: "4px 10px", borderRadius: 7, fontSize: "0.75rem",
          fontWeight: 600, cursor: busy ? "not-allowed" : "pointer",
          fontFamily: "inherit", border: "1.5px solid var(--d-border-soft)",
          background: "var(--d-surface)", color: "var(--d-ink)",
          opacity: busy ? 0.5 : 1,
        }}>
        {busy ? "..." : "Changer"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            style={{
              position: "absolute", right: 0, top: "calc(100% + 4px)",
              background: "#fff", border: "1px solid var(--d-border-soft)",
              borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              zIndex: 100, minWidth: 140, overflow: "hidden",
            }}>
            {STATUS_OPTIONS.filter(o => o.value !== member.accountStatus).map(o => {
              const meta = STATUS_META[o.value];
              return (
                <button key={o.value}
                  onClick={() => { onSet(member._id, o.value); setOpen(false); }}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "9px 14px", background: "transparent",
                    border: "none", cursor: "pointer", fontFamily: "inherit",
                    fontSize: "0.78rem", fontWeight: 600,
                    color: meta.color,
                  }}>
                  {o.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── IncomingRequests ──────────────────────────────────────────────────────────
const REQ_STATUS_META = {
  pending:   { label: "En attente", color: "#f59e0b" },
  accepted:  { label: "Acceptée",   color: "#10b981" },
  declined:  { label: "Refusée",    color: "#ef4444" },
  withdrawn: { label: "Retirée",    color: "#6b7280" },
};

const IncomingRequests = ({ onAccepted }) => {
  const [requests,    setRequests]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState("pending");
  const [responding,  setResponding]  = useState(null);
  const [declineForm, setDeclineForm] = useState(null);
  const [declineText, setDeclineText] = useState("");
  const [msg,         setMsg]         = useState("");

  const load = () => {
    setLoading(true);
    collaborationRequestService.getIncoming({ limit: 50 })
      .then(d => setRequests(d.requests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRespond = async (id, action) => {
    setResponding(id);
    try {
      await collaborationRequestService.respond(id, action, action === "decline" ? declineText : "");
      setMsg(action === "accept" ? "Demande acceptée — collaboration créée" : "Demande refusée");
      setDeclineForm(null);
      setDeclineText("");
      load();
      if (action === "accept") onAccepted?.();
      setTimeout(() => setMsg(""), 3500);
    } catch (err) {
      setMsg(err.response?.data?.message || "Erreur");
    } finally {
      setResponding(null);
    }
  };

  const displayed = filter === "all" ? requests : requests.filter(r => r.status === filter);

  return (
    <div>
      {msg && (
        <div style={{ padding: "10px 14px", borderRadius: 8,
          background: msg.includes("acceptée") ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${msg.includes("acceptée") ? "#6ee7b7" : "#fecaca"}`,
          color: msg.includes("acceptée") ? "#065f46" : "#b91c1c",
          fontSize: "0.82rem", marginBottom: 14 }}>
          {msg}
        </div>
      )}

      <div className="filters-bar" style={{ marginBottom: 16 }}>
        {[
          { v: "pending",  l: "En attente" },
          { v: "accepted", l: "Acceptées"  },
          { v: "declined", l: "Refusées"   },
          { v: "all",      l: "Toutes"     },
        ].map(o => (
          <button key={o.v}
            className={`filter-btn${filter === o.v ? " active" : ""}`}
            onClick={() => setFilter(o.v)}>
            {o.l}
          </button>
        ))}
      </div>
Mot
      {loading ? (
        <div className="spinner-wrap" style={{ padding: 32 }}><div className="spinner" /></div>
      ) : displayed.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "40px 24px" }}>
            <div className="empty-state-title">Aucune demande de collaboration</div>
            <div className="empty-state-desc">
              Les freelancers intéressés peuvent vous envoyer des demandes depuis la page Explorer.
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <AnimatePresence>
            {displayed.map((r, i) => {
              const meta = REQ_STATUS_META[r.status] || REQ_STATUS_META.pending;
              return (
                <motion.div key={r._id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ padding: "16px 18px",
                    borderBottom: i < displayed.length - 1 ? "1px solid var(--d-border-soft)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--d-ink)" }}>
                          {r.fromName}
                        </span>
                        <span style={{ padding: "1px 8px", borderRadius: 10, fontSize: "0.68rem",
                          fontWeight: 700, background: meta.color + "18", color: meta.color }}>
                          {meta.label}
                        </span>
                      </div>
                      {r.proposedRole && (
                        <div style={{ fontSize: "0.75rem", color: "var(--d-muted)" }}>
                          Rôle proposé : <strong>{r.proposedRole}</strong>
                        </div>
                      )}
                      {r.message && (
                        <div style={{ fontSize: "0.78rem", color: "var(--d-muted)",
                          marginTop: 4, lineHeight: 1.5,
                          display: "-webkit-box", WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {r.message}
                        </div>
                      )}
                      {r.declineReason && (
                        <div style={{ fontSize: "0.72rem", color: "#ef4444", marginTop: 4 }}>
                          Motif de refus : {r.declineReason}
                        </div>
                      )}
                      <div style={{ fontSize: "0.68rem", color: "#bbb", marginTop: 6 }}>
                        {new Date(r.createdAt).toLocaleDateString("fr-DZ",
                          { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </div>

                    {r.status === "pending" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={() => handleRespond(r._id, "accept")}
                          disabled={responding === r._id}
                          style={{ padding: "6px 14px", borderRadius: 7, fontSize: "0.75rem",
                            fontWeight: 700, border: "none", background: "#10b981",
                            color: "#fff", cursor: "pointer", fontFamily: "inherit",
                            opacity: responding === r._id ? 0.5 : 1 }}>
                          {responding === r._id ? "..." : "Accepter"}
                        </button>
                        {declineForm !== r._id ? (
                          <button
                            onClick={() => { setDeclineForm(r._id); setDeclineText(""); }}
                            style={{ padding: "6px 14px", borderRadius: 7, fontSize: "0.75rem",
                              fontWeight: 700, border: "1.5px solid #fecaca", background: "#fef2f2",
                              color: "#dc2626", cursor: "pointer", fontFamily: "inherit" }}>
                            Refuser
                          </button>
                        ) : (
                          <div style={{ minWidth: 200 }}>
                            <input value={declineText} onChange={e => setDeclineText(e.target.value)}
                              placeholder="Motif (optionnel)"
                              style={{ width: "100%", padding: "6px 10px", borderRadius: 6,
                                border: "1.5px solid #f0dede", fontSize: "0.75rem",
                                fontFamily: "inherit", marginBottom: 6, boxSizing: "border-box" }} />
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => handleRespond(r._id, "decline")}
                                disabled={responding === r._id}
                                style={{ flex: 1, padding: "5px 0", borderRadius: 6, border: "none",
                                  background: "#dc2626", color: "#fff", fontSize: "0.72rem",
                                  fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                                Confirmer
                              </button>
                              <button onClick={() => setDeclineForm(null)}
                                style={{ padding: "5px 8px", borderRadius: 6,
                                  border: "1.5px solid #f0dede", background: "none",
                                  fontSize: "0.72rem", color: "#9a6060",
                                  cursor: "pointer", fontFamily: "inherit" }}>
                                ✕
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

// ── FreelancerSection ─────────────────────────────────────────────────────────
const FreelancerSection = ({ user }) => {
  const [tab,            setTab]            = useState("freelancers");
  const [freelancers,    setFreelancers]    = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [showAttach,     setShowAttach]     = useState(false);
  const [nameSearch,     setNameSearch]     = useState("");
  const [searchResults,  setSearchResults]  = useState([]);
  const [role,           setRole]           = useState("collaborateur");
  const [searching,      setSearching]      = useState(false);
  const [found,          setFound]          = useState(null);
  const [attaching,      setAttaching]      = useState(false);
  const [detaching,      setDetaching]      = useState(null);
  const [confirmDetach,  setConfirmDetach]  = useState(null);
  const [msg,            setMsg]            = useState("");
  const [conventionFor,  setConventionFor]  = useState(null);

  const loadFreelancers = () => {
    setLoading(true);
    agencyMemberService.getFreelancers()
      .then(d => setFreelancers(d.freelancers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadFreelancers(); }, []);

  // Debounced name search
  useEffect(() => {
    const q = nameSearch.trim();
    if (!q) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const d = await agencyMemberService.searchFreelancers(q);
        setSearchResults(d.freelancers || []);
      } catch {}
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [nameSearch]);

  const selectFreelancer = (f) => {
    setFound(f);
    setNameSearch(`${f.firstName} ${f.lastName}`);
    setSearchResults([]);
  };

  const handleAttach = async () => {
    if (!found) return;
    setAttaching(true);
    try {
      await agencyMemberService.attachFreelancer({
        agencyId: user._id, freelancerId: found._id, role,
      });
      setMsg("Freelancer attaché");
      setShowAttach(false);
      setNameSearch(""); setFound(null); setSearchResults([]);
      loadFreelancers();
    } catch (err) {
      setMsg(err.response?.data?.message || "Erreur");
    } finally {
      setAttaching(false);
    }
  };

  const handleDetach = async (freelancerId) => {
    setDetaching(freelancerId);
    setConfirmDetach(null);
    try {
      await agencyMemberService.detachFreelancer(user._id, freelancerId);
      setMsg("Collaboration terminée");
      loadFreelancers();
    } catch (err) {
      setMsg(err.response?.data?.message || "Erreur");
    } finally {
      setDetaching(null);
    }
  };

  const active = freelancers.filter(f => f.collaboration?.status === "active");
  const ended  = freelancers.filter(f => f.collaboration?.status === "ended");

  return (
    <div style={{ marginTop: 32 }}>
      <div className="section-header" style={{ marginBottom: 12 }}>
        <div className="section-header-left">
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
            Freelancers collaborateurs
          </h3>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--d-muted)" }}>
            {active.length} collaboration{active.length !== 1 ? "s" : ""} active{active.length !== 1 ? "s" : ""}
          </p>
        </div>
        {tab === "freelancers" && (
          <button className="section-cta-btn" style={{ fontSize: "0.8rem", padding: "7px 14px" }}
            onClick={() => setShowAttach(o => !o)}>
            + Attacher un freelancer
          </button>
        )}
      </div>

      {/* Sub-tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
        {[
          { id: "freelancers", label: "Actifs & historique" },
          { id: "requests",    label: "Demandes reçues"     },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: "7px 16px", borderRadius: 8, fontFamily: "inherit",
              fontWeight: 700, fontSize: "0.78rem", cursor: "pointer",
              border: tab === t.id ? "2px solid #c0152a" : "1.5px solid var(--d-border-soft)",
              background: tab === t.id ? "#c0152a" : "transparent",
              color: tab === t.id ? "#fff" : "var(--d-muted)",
              transition: "all 0.15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "requests" && <IncomingRequests onAccepted={loadFreelancers} />}

      {tab === "freelancers" && <>
      <AnimatePresence>
        {msg && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ padding: "10px 14px", borderRadius: 8, background: "#f0fdf4",
              border: "1px solid #6ee7b7", color: "#065f46",
              fontSize: "0.82rem", marginBottom: 12 }}
            onAnimationComplete={() => setTimeout(() => setMsg(""), 2500)}>
            {msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attach form */}
      <AnimatePresence>
        {showAttach && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div className="card" style={{ padding: 16, marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
                  <label className="dash-form-label">Nom du freelancer</label>
                  <input className="dash-form-input" value={nameSearch}
                    placeholder="Rechercher par nom..."
                    onChange={e => { setNameSearch(e.target.value); setFound(null); }} />
                  {searching && (
                    <span style={{ position: "absolute", right: 10, top: "60%",
                      fontSize: "0.72rem", color: "var(--d-muted)" }}>...</span>
                  )}
                  {searchResults.length > 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0,
                      zIndex: 200, background: "#fff", border: "1px solid #f0dede",
                      borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                      overflow: "hidden", marginTop: 2 }}>
                      {searchResults.map(f => (
                        <button key={f._id} onClick={() => selectFreelancer(f)}
                          style={{ display: "block", width: "100%", textAlign: "left",
                            padding: "9px 14px", background: "none", border: "none",
                            borderBottom: "1px solid #fdf0f0", cursor: "pointer",
                            fontFamily: "inherit", fontSize: "0.82rem",
                            fontWeight: 600, color: "var(--d-ink)" }}>
                          {f.firstName} {f.lastName}
                          {f.skills?.length > 0 && (
                            <span style={{ fontSize: "0.7rem", color: "var(--d-muted)",
                              fontWeight: 400, marginLeft: 8 }}>
                              {f.skills.slice(0, 2).join(", ")}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ minWidth: 150 }}>
                  <label className="dash-form-label">Rôle</label>
                  <input className="dash-form-input" value={role}
                    onChange={e => setRole(e.target.value)} placeholder="collaborateur" />
                </div>
              </div>
              {found && (
                <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8,
                  background: "#fff8f8", border: "1px solid #f0dede",
                  display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--d-ink)", fontWeight: 600 }}>
                    {found.firstName} {found.lastName}
                    {found.skills?.length > 0 && (
                      <span style={{ fontWeight: 400, color: "var(--d-muted)", marginLeft: 8 }}>
                        {found.skills.slice(0, 3).join(", ")}
                      </span>
                    )}
                  </span>
                  <button className="section-cta-btn" style={{ fontSize: "0.78rem", padding: "6px 12px" }}
                    onClick={handleAttach} disabled={attaching}>
                    {attaching ? "..." : "Confirmer"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="spinner-wrap" style={{ padding: 32 }}><div className="spinner" /></div>
      ) : active.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "32px 24px" }}>
            <div className="empty-state-title" style={{ fontSize: "0.9rem" }}>
              Aucune collaboration active
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ overflow: "auto" }}>
          <table className="data-grid">
            <thead>
              <tr>
                <th>Freelancer</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Depuis</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {active.map(f => (
                <tr key={f._id}>
                  <td data-label="Freelancer">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%",
                        background: "linear-gradient(135deg,#c0152a,#7c1020)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.7rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                        {f.firstName?.[0]}{f.lastName?.[0]}
                      </div>
                      <span className="td-title">{f.firstName} {f.lastName}</span>
                    </div>
                  </td>
                  <td data-label="Email" className="td-muted">{f.email}</td>
                  <td data-label="Rôle">
                    <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: "0.72rem",
                      fontWeight: 600, background: "#fff0f0", color: "#c0152a" }}>
                      {f.collaboration?.role || "—"}
                    </span>
                  </td>
                  <td data-label="Depuis" className="td-muted">
                    {f.collaboration?.startDate
                      ? new Date(f.collaboration.startDate).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" })
                      : "—"}
                  </td>
                  <td data-label="">
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        onClick={() => setConventionFor(f)}
                        style={{ padding: "4px 10px", borderRadius: 6,
                          border: "1.5px solid #c0152a", background: "#fef2f2",
                          color: "#c0152a", fontSize: "0.72rem",
                          fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                        Convention
                      </button>
                      {confirmDetach === f._id ? (
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          <span style={{ fontSize: "0.72rem", color: "#991b1b", fontWeight: 600 }}>
                            Confirmer ?
                          </span>
                          <button onClick={() => handleDetach(f._id)}
                            disabled={detaching === f._id}
                            style={{ padding: "3px 9px", borderRadius: 6, border: "none",
                              background: "#dc2626", color: "#fff", fontSize: "0.68rem",
                              fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                              opacity: detaching === f._id ? 0.5 : 1 }}>
                            {detaching === f._id ? "..." : "Oui"}
                          </button>
                          <button onClick={() => setConfirmDetach(null)}
                            style={{ padding: "3px 8px", borderRadius: 6,
                              border: "1.5px solid #f0dede", background: "none",
                              fontSize: "0.68rem", color: "#9a6060",
                              cursor: "pointer", fontFamily: "inherit" }}>
                            Non
                          </button>
                        </div>
                      ) : (
                        <button
                          disabled={detaching === f._id}
                          onClick={() => setConfirmDetach(f._id)}
                          style={{ padding: "4px 10px", borderRadius: 6, border: "none",
                            background: "#fee2e2", color: "#991b1b", fontSize: "0.72rem",
                            fontWeight: 600, cursor: detaching === f._id ? "not-allowed" : "pointer",
                            fontFamily: "inherit", opacity: detaching === f._id ? 0.5 : 1 }}>
                          Terminer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ended.length > 0 && (
        <details style={{ marginTop: 10 }}>
          <summary style={{ fontSize: "0.78rem", color: "var(--d-muted)", cursor: "pointer", padding: "4px 0" }}>
            {ended.length} collaboration{ended.length !== 1 ? "s" : ""} terminée{ended.length !== 1 ? "s" : ""}
          </summary>
          <div style={{ marginTop: 8, opacity: 0.65 }}>
            {ended.map(f => (
              <div key={f._id} style={{ padding: "6px 10px", fontSize: "0.78rem",
                color: "var(--d-muted)", borderLeft: "3px solid var(--d-border-soft)", marginBottom: 4 }}>
                {f.firstName} {f.lastName} — {f.email} — {f.collaboration?.role}
              </div>
            ))}
          </div>
        </details>
      )}

      </> /* end tab === "freelancers" */}

      {/* Convention de collaboration form modal */}
      <AnimatePresence>
        {conventionFor && (
          <ConventionCollaborationForm
            freelancer={conventionFor}
            agencyUser={user}
            onClose={() => setConventionFor(null)}
            onSuccess={() => {
              setConventionFor(null);
              setMsg("Convention envoyée avec succès au freelancer.");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ROOT
// ═════════════════════════════════════════════════════════════════════════════
// ── MemberHistory modal ───────────────────────────────────────────────────────
const TASK_STATUS_LABEL = {
  todo:        "À faire",
  in_progress: "En cours",
  in_review:   "En révision",
  done:        "Terminé",
};
const TASK_STATUS_COLOR = {
  todo:        "#6b7280",
  in_progress: "#f59e0b",
  in_review:   "#0891b2",
  done:        "#10b981",
};
const PROJECT_STATUS_LABEL = {
  pending:   "En attente",
  active:    "Actif",
  in_review: "En révision",
  completed: "Terminé",
  cancelled: "Annulé",
};

const MemberHistoryModal = ({ member, onClose }) => {
  const [history,  setHistory]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    agencyMemberService.getMemberHistory(member._id)
      .then(d => setHistory(d.history || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [member._id]);

  const totalTasks     = history.reduce((s, p) => s + p.tasks.length, 0);
  const completedTasks = history.reduce((s, p) => s + p.tasks.filter(t => t.status === "done").length, 0);

  return (
    <motion.div className="modal-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="modal-box" style={{ maxWidth: 620, maxHeight: "80vh", overflowY: "auto" }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">
              Historique — {member.firstName} {member.lastName}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--d-muted)", marginTop: 2 }}>
              {JOB_LABEL[member.jobTitle] || member.jobTitle}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--d-muted)",
              fontSize: "0.85rem" }}>
              Aucune participation à des projets pour ce membre.
            </div>
          ) : (
            <>
              {/* Summary chips */}
              <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                <div style={{ padding: "8px 14px", borderRadius: 8, background: "#f3f4f6",
                  fontSize: "0.78rem", fontWeight: 600, color: "var(--d-ink)" }}>
                  {history.length} projet{history.length !== 1 ? "s" : ""}
                </div>
                <div style={{ padding: "8px 14px", borderRadius: 8, background: "#f3f4f6",
                  fontSize: "0.78rem", fontWeight: 600, color: "var(--d-ink)" }}>
                  {totalTasks} tâche{totalTasks !== 1 ? "s" : ""}
                </div>
                <div style={{ padding: "8px 14px", borderRadius: 8, background: "#d1fae5",
                  fontSize: "0.78rem", fontWeight: 600, color: "#065f46" }}>
                  {completedTasks} terminée{completedTasks !== 1 ? "s" : ""}
                </div>
              </div>

              {history.map((proj, pi) => (
                <div key={proj._id} style={{ marginBottom: 16, borderRadius: 10,
                  border: "1px solid var(--d-border-soft)", overflow: "hidden" }}>
                  {/* Project header */}
                  <div style={{ padding: "12px 16px", background: "var(--d-surface)",
                    borderBottom: proj.tasks.length ? "1px solid var(--d-border-soft)" : "none",
                    display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--d-ink)" }}>
                        {proj.title}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--d-muted)", marginTop: 2 }}>
                        {proj.tasks.length} tâche{proj.tasks.length !== 1 ? "s" : ""} · {proj.progress || 0}%
                      </div>
                    </div>
                    <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: "0.7rem",
                      fontWeight: 700, background: "#f3f4f6", color: "var(--d-muted)" }}>
                      {PROJECT_STATUS_LABEL[proj.status] || proj.status}
                    </span>
                  </div>

                  {/* Tasks */}
                  {proj.tasks.map((t, ti) => (
                    <div key={t._id} style={{ display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 16px",
                      borderBottom: ti < proj.tasks.length - 1 ? "1px solid var(--d-border-soft)" : "none",
                      background: "#fff" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                        background: TASK_STATUS_COLOR[t.status] || "#6b7280" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.82rem", fontWeight: 600,
                          color: "var(--d-ink)", lineHeight: 1.3 }}>
                          {t.title}
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 2, flexWrap: "wrap",
                          alignItems: "center" }}>
                          <span style={{ fontSize: "0.68rem", fontWeight: 600,
                            color: TASK_STATUS_COLOR[t.status] || "#6b7280" }}>
                            {TASK_STATUS_LABEL[t.status] || t.status}
                          </span>
                          {t.isPreviousAssignee && (
                            <span style={{ fontSize: "0.65rem", color: "#9a6060",
                              fontStyle: "italic" }}>
                              (ex-responsable)
                            </span>
                          )}
                          {t.removedAt && (
                            <span style={{ fontSize: "0.65rem", color: "var(--d-muted)" }}>
                              retiré le {new Date(t.removedAt).toLocaleDateString("fr-DZ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ROOT
// ═════════════════════════════════════════════════════════════════════════════
const DirectorMembers = ({ user }) => {
  const [members,      setMembers]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [historyMember, setHistoryMember] = useState(null);
  const [form,         setForm]         = useState({
    firstName: "", lastName: "", email: "",
    password: "", jobTitle: "junior", phone: "",
  });
  const [formError, setFormError] = useState("");
  const [saving,    setSaving]    = useState(false);
  const [statusBusy, setStatusBusy] = useState(null);

  const load = () => {
    setLoading(true);
    agencyMemberService.getMembers()
      .then(d => setMembers(d.members || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (form.password.length < 8)
      return setFormError("Le mot de passe temporaire doit contenir au moins 8 caractères");
    setSaving(true);
    try {
      await agencyMemberService.createMember(form);
      setShowModal(false);
      setForm({ firstName: "", lastName: "", email: "", password: "", jobTitle: "junior", phone: "" });
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const handleSetStatus = async (id, status) => {
    setStatusBusy(id);
    try {
      const d = await agencyMemberService.setMemberStatus(id, status);
      setMembers(prev => prev.map(m =>
        m._id === id ? { ...m, accountStatus: d.accountStatus } : m
      ));
    } catch {}
    finally { setStatusBusy(null); }
  };

  const handleRestore = async (id) => {
    setStatusBusy(id);
    try {
      await agencyMemberService.restoreMember(id);
      setMembers(prev => prev.map(m =>
        m._id === id ? { ...m, accountStatus: "active" } : m
      ));
    } catch {}
    finally { setStatusBusy(null); }
  };

  const activeMembers   = useMemo(() => members.filter(m => (m.accountStatus || "active") === "active"), [members]);
  const inactiveMembers = useMemo(() => members.filter(m => (m.accountStatus || "active") !== "active"), [members]);

  const MemberRow = ({ m, showRestore }) => (
    <motion.tr
      key={m._id}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: showRestore ? 0.75 : 1, y: 0 }}
      style={{ borderLeft: `3px solid ${STATUS_META[m.accountStatus || "active"]?.border || "#d1d5db"}` }}>
      <td data-label="Membre">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar member={m} />
          <div className="td-title">{m.firstName} {m.lastName}</div>
        </div>
      </td>
      <td data-label="Rôle">
        <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: "0.72rem",
          fontWeight: 600, background: "#f3f0ff", color: "#7c3aed" }}>
          {JOB_LABEL[m.jobTitle] || m.jobTitle}
        </span>
      </td>
      <td data-label="Email" className="td-muted">{m.email}</td>
      <td data-label="Mot de passe">
        <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: "0.72rem",
          fontWeight: 600,
          background: m.mustChangePassword ? "#fef3c7" : "#f3f4f6",
          color:      m.mustChangePassword ? "#92400e" : "#6b7280" }}>
          {m.mustChangePassword ? "Temporaire" : "Changé"}
        </span>
      </td>
      <td data-label="Statut">
        <StatusBadge status={m.accountStatus || "active"} />
      </td>
      <td data-label="">
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            onClick={() => setHistoryMember(m)}
            style={{ padding: "4px 10px", borderRadius: 7, fontSize: "0.73rem",
              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              border: "1.5px solid var(--d-border-soft)", background: "var(--d-surface)",
              color: "var(--d-muted)" }}>
            Historique
          </button>
          {showRestore ? (
            <button
              disabled={statusBusy === m._id}
              onClick={() => handleRestore(m._id)}
              style={{ padding: "4px 12px", borderRadius: 7, fontSize: "0.75rem",
                fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                border: "1.5px solid #6ee7b7", background: "#d1fae5",
                color: "#065f46", opacity: statusBusy === m._id ? 0.5 : 1 }}>
              {statusBusy === m._id ? "..." : "Restaurer"}
            </button>
          ) : (
            <StatusSelect member={m} onSet={handleSetStatus} busy={statusBusy === m._id} />
          )}
        </div>
      </td>
    </motion.tr>
  );

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Membres</h2>
          <p>{activeMembers.length} membre{activeMembers.length !== 1 ? "s" : ""} actif{activeMembers.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="section-cta-btn" onClick={() => setShowModal(true)}>
          + Créer un membre
        </button>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : members.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "64px 24px" }}>
            <div className="empty-state-icon"><IconUsers size={20} /></div>
            <div className="empty-state-title">Aucun membre</div>
            <div className="empty-state-desc">Créez des comptes pour votre équipe.</div>
            <button className="empty-state-btn" onClick={() => setShowModal(true)}>
              + Créer le premier membre
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Active members */}
          <div className="card" style={{ overflow: "auto" }}>
            <table className="data-grid">
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Rôle</th>
                  <th>Email</th>
                  <th>Mot de passe</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                     <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div className="modal-box"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}>
              <div className="modal-header">
                <div className="modal-title">Créer un membre</div>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <div className="modal-body">
                <p style={{ fontSize: "0.82rem", color: "#9a6060", marginBottom: 20,
                  lineHeight: 1.5, padding: "10px 14px", background: "#fffbfb",
                  border: "1px solid #faeaea", borderRadius: 8 }}>
                  Le membre devra changer son mot de passe lors de sa première connexion.
                </p>
                <form onSubmit={handleCreate} className="dash-form">
                  <div className="dash-form-row">
                    <div className="dash-form-group">
                      <label className="dash-form-label">Prénom *</label>
                      <input className="dash-form-input" name="firstName" required
                        value={form.firstName} onChange={handleChange} />
                    </div>
                    <div className="dash-form-group">
                      <label className="dash-form-label">Nom *</label>
                      <input className="dash-form-input" name="lastName" required
                        value={form.lastName} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-form-label">Adresse email *</label>
                    <input className="dash-form-input" name="email" type="email" required
                      value={form.email} onChange={handleChange} />
                  </div>
                  <div className="dash-form-row">
                    <div className="dash-form-group">
                      <label className="dash-form-label">Rôle *</label>
                      <select className="dash-form-select" name="jobTitle"
                        value={form.jobTitle} onChange={handleChange}>
                        {JOB_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="dash-form-group">
                      <label className="dash-form-label">Téléphone</label>
                      <input className="dash-form-input" name="phone" type="tel"
                        value={form.phone} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-form-label">Mot de passe temporaire *</label>
                    <input className="dash-form-input" name="password" type="text" required
                      placeholder="Min. 8 caractères — à communiquer au membre"
                      value={form.password} onChange={handleChange} />
                    <span className="dash-form-hint">
                      Le membre sera forcé de le changer à la première connexion.
                    </span>
                  </div>
                  {formError && <div className="dash-form-error">{formError}</div>}
                  <button type="submit" className="dash-form-submit" disabled={saving}>
                    {saving ? "Création..." : "Créer le compte →"}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
                <AnimatePresence>
                  {activeMembers.map(m => <MemberRow key={m._id} m={m} showRestore={false} />)}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Inactive / suspended / archived section */}
          {inactiveMembers.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <button
                onClick={() => setShowInactive(o => !o)}
                style={{ background: "none", border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: "0.82rem", color: "var(--d-muted)",
                  fontWeight: 600, padding: "4px 0", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ transform: showInactive ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s", display: "inline-block" }}>▶</span>
                {showInactive ? "Masquer" : "Afficher"} les membres inactifs ({inactiveMembers.length})
              </button>

              <AnimatePresence>
                {showInactive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: "hidden", marginTop: 8 }}>
                    <div className="card" style={{ overflow: "auto" }}>
                      <table className="data-grid">
                        <thead>
                          <tr>
                            <th>Membre</th>
                            <th>Rôle</th>
                            <th>Email</th>
                            <th>Mot de passe</th>
                            <th>Statut</th>
                            <th>Restaurer</th>
                          </tr>
                        </thead>
                        <tbody>
                          <AnimatePresence>
                            {inactiveMembers.map(m => <MemberRow key={m._id} m={m} showRestore={true} />)}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      <FreelancerSection user={user} />

      {/* Member history modal */}
      <AnimatePresence>
        {historyMember && (
          <MemberHistoryModal
            member={historyMember}
            onClose={() => setHistoryMember(null)}
          />
        )}
      </AnimatePresence>

      {/* Create member modal */}
 
    </div>
  );
};

export default DirectorMembers;
